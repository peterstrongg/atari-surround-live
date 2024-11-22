package main

import (
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
	} else {
		fmt.Println("Player B Connected")
		playerB = c
	}
	defer playerA.Close()
	defer playerB.Close()

	fmt.Println("Starting Game...")

	var inputA string
	var inputB string

	go getPlayerInput(playerA, &inputA)
	go getPlayerInput(playerB, &inputB)

	for {
		playerA.WriteMessage(websocket.TextMessage, []byte(inputA+" "+inputB))
		playerB.WriteMessage(websocket.TextMessage, []byte(inputA+" "+inputB))
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
