package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type clientMessage struct {
	UserInput string `json:"userInput"`
}

type serverMessage struct {
	Type         string `json:"type"`
	PlayerAInput string `json:"playerAInput"`
	PlayerBInput string `json:"playerBInput"`
}

func main() {
	http.HandleFunc("/ws/play/", playGame)
	err := http.ListenAndServe(":8081", nil)
	if err != nil {
		panic(err)
	}
}

func playGame(w http.ResponseWriter, r *http.Request) {
	c, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		panic(err)
	}

	sessionId := getSessionId(r.URL.Path)
	s := sc.findGameSession(sessionId)
	gameLoop(s, c)
}

func gameLoop(s *gameSession, c *websocket.Conn) {
	if s.PlayerA == nil {
		s.PlayerA = c
		sendPlayerAssignment(c, "PLAYER_A")
		fmt.Println("Player A Connected...")
		return
	} else if s.PlayerB == nil {
		s.PlayerB = c
		sendPlayerAssignment(c, "PLAYER_B")
		fmt.Println("Player B Connected...")
	} else {
		return
	}
	defer s.PlayerA.Close()
	defer s.PlayerB.Close()

	fmt.Println("Game Starting...")

	var inputA string
	var inputB string

	go getPlayerInput(s.PlayerA, &inputA)
	go getPlayerInput(s.PlayerB, &inputB)

	var responseA clientMessage
	var responseB clientMessage
	for {
		if inputA != "" && inputB != "" {
			json.Unmarshal([]byte(inputA), &responseA)
			json.Unmarshal([]byte(inputB), &responseB)

			m := constructServerMessage(responseA.UserInput, responseB.UserInput)
			message, _ := json.Marshal(m)

			s.PlayerA.WriteMessage(websocket.TextMessage, []byte(string(message)))
			s.PlayerB.WriteMessage(websocket.TextMessage, []byte(string(message)))

			if m.Type == "DISCONNECT" {
				s.PlayerA.Close()
				s.PlayerB.Close()
				sc.deleteGameSession(s.SessionId)
				fmt.Println("DISCONNECTED")
				break
			}
		}
		time.Sleep(100 * time.Millisecond)
	}
}

func getSessionId(path string) string {
	return strings.Split(path, "/")[3]
}

func getPlayerInput(c *websocket.Conn, value *string) {
	for {
		_, message, err := c.ReadMessage()
		if err != nil {
			return
		}
		*value = string(message)
	}
}

func constructServerMessage(inputA string, inputB string) serverMessage {
	var m serverMessage
	if inputA == "REMATCH" || inputB == "REMATCH" {
		m.Type = "GAMEOVER"
	} else if inputA == "DISCONNECTED" || inputB == "DISCONNECTED" {
		m.Type = "DISCONNECT"
	} else {
		m.Type = "GAME"
	}
	m.PlayerAInput = inputA
	m.PlayerBInput = inputB

	return m
}

func sendPlayerAssignment(c *websocket.Conn, data string) {
	var sm serverMessage
	sm.Type = "CONNECT"
	sm.PlayerAInput = data
	sm.PlayerBInput = data
	message, _ := json.Marshal(sm)
	c.WriteMessage(websocket.TextMessage, []byte(message))
}
