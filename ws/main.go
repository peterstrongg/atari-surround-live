package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
)

var playerA *websocket.Conn
var playerB *websocket.Conn

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
	http.HandleFunc("/ws/play", playGame)
	err := http.ListenAndServe(":8081", nil)
	if err != nil {
		panic(err)
	}
}

func playGame(w http.ResponseWriter, r *http.Request) {
	c, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Print(err)
	}
	if playerA == nil {
		fmt.Println("Player A Connected")
		playerA = c
		return // Only continue if two players are connected
	} else if playerB == nil {
		fmt.Println("Player B Connected")
		playerB = c
	} else {
		return // Return if two players are already connected
	}
	defer playerA.Close()
	defer playerB.Close()

	fmt.Println("Starting Game...")

	var inputA string
	var inputB string

	go getPlayerInput(playerA, &inputA)
	go getPlayerInput(playerB, &inputB)

	var responseA clientMessage
	var responseB clientMessage
	for {
		if inputA != "" && inputB != "" {
			json.Unmarshal([]byte(inputA), &responseA)
			json.Unmarshal([]byte(inputB), &responseB)

			var m serverMessage
			if responseA.UserInput == "REMATCH" {
				m.Type = "GAMEOVER"
			}
			if responseB.UserInput == "REMATCH" {
				m.Type = "GAMEOVER"
			} else {
				m.Type = "GAME"
			}
			m.PlayerAInput = responseA.UserInput
			m.PlayerBInput = responseB.UserInput

			message, _ := json.Marshal(m)

			playerA.WriteMessage(websocket.TextMessage, []byte(string(message)))
			playerB.WriteMessage(websocket.TextMessage, []byte(string(message)))
		}
		time.Sleep(100 * time.Millisecond)
	}
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
