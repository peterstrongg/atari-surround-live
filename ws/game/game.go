package game

import (
	"time"
)

type GameState struct {
	PlayerA Player
	PlayerB Player
}

type Player struct {
	XPos  int
	YPos  int
	Input string
}

func (p *Player) SetPlayerInput(input string) {
	p.Input = input
}

func GameLoop() {
	for {
		// fmt.Println("Game Loop")
		time.Sleep(100 * time.Millisecond)
	}
}
