package main

import (
	"fmt"
	"log"
	"net/http"
	"strconv"
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
	http.HandleFunc("/ws/gamestate", sendGameState)
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
		playerA = c
		return // Only continue if two players are connected
	} else {
		playerB = c
	}
	defer playerA.Close()
	defer playerB.Close()

	var inputA string
	var inputB string

	go getPlayerInput(playerA, &inputA)
	go getPlayerInput(playerB, &inputB)

	for {
		playerA.WriteMessage(websocket.TextMessage, []byte(inputA+" "+inputB))
		playerB.WriteMessage(websocket.TextMessage, []byte(inputA+" "+inputB))
		time.Sleep(100 * time.Millisecond)
	}

	//defer c.Close()

	// TODO: Await player A connection
	// playerA := game.Player{
	// 	XPos: 5,
	// 	YPos: 5,
	// }

	// // TODO: Await player B connection
	// playerB := game.Player{
	// 	XPos: 10,
	// 	YPos: 10,
	// }

	// gameState := game.GameState{
	// 	PlayerA: playerA,
	// 	PlayerB: playerB,
	// }

	// fmt.Println(gameState)
	// go game.GameLoop()

	// // Player A
	// for {
	// 	_, message, err := c.ReadMessage()
	// 	if err != nil {
	// 		break
	// 	}

	// 	fmt.Println(string(message))
	// 	gameState.PlayerA.SetPlayerInput(string(message))

	// 	err = c.WriteMessage(websocket.TextMessage, []byte(gameState.PlayerA.Input))
	// 	if err != nil {
	// 		fmt.Println(err)
	// 	}

	// }
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

func sendGameState(w http.ResponseWriter, r *http.Request) {
	c, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Print(err)
	}
	defer c.Close()

	i := 0
	for {
		err = c.WriteMessage(websocket.TextMessage, []byte(strconv.Itoa(i%10)))
		if err != nil {
			fmt.Println(err)
		}
		i++
		time.Sleep(100 * time.Millisecond)
	}
}
