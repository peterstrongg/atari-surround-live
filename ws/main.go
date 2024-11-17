package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

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
	defer c.Close()

	for {
		mt, message, err := c.ReadMessage()
		if err != nil {
			break
		}

		fmt.Println(string(message))

		err = c.WriteMessage(mt, message)
		if err != nil {
			fmt.Println(err)
		}
	}
}
