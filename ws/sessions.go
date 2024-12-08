package main

import (
	"sync"

	"github.com/gorilla/websocket"
)

type gameSession struct {
	SessionId string
	PlayerA   *websocket.Conn
	PlayerB   *websocket.Conn
}

type SessionsContainer struct {
	mu           sync.Mutex
	gameSessions []gameSession
}

var sc SessionsContainer

func (sc *SessionsContainer) findGameSession(id string) *gameSession {
	sc.mu.Lock()
	defer sc.mu.Unlock()

	for i := 0; i < len(sc.gameSessions); i++ {
		if sc.gameSessions[i].SessionId == id {
			return &sc.gameSessions[i]
		}
	}
	var gs gameSession
	gs.SessionId = id
	sc.gameSessions = append(sc.gameSessions, gs)
	return &sc.gameSessions[len(sc.gameSessions)-1]
}

func (sc *SessionsContainer) deleteGameSession(id string) {
	sc.mu.Lock()
	defer sc.mu.Unlock()

	for i := 0; i < len(sc.gameSessions); i++ {
		if sc.gameSessions[i].SessionId == id {
			sc.gameSessions = append(sc.gameSessions[:i], sc.gameSessions[i+1:]...)
			return
		}
	}
}
