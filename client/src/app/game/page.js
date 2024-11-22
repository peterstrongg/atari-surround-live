"use client";

import { useEffect, useRef, useState } from "react"

import Image from 'next/image'
import BoardCell from "../../assets/board_cell.png"
import Player1 from "../../assets/player_1.png"

const player = <Image
    key="player1"
    src={Player1}
    alt="board cell"
    width={15}
/>

const generateBoard = () => {
    let board = []
    let key = 0
    for(let i = 0; i < process.env.BOARD_HEIGHT; i++) {
        let row = []
        for(let j = 0; j < process.env.BOARD_WIDTH; j++) {
            row.push(<Image
                key={key}
                src={BoardCell}
                alt="board cell"
                width={15}
            />)
            key++
        }
        board.push(row)
    }
    return board
}

const game = () => {
    const [board, setBoard] = useState([])
    const [serverMessage, setServerMessage] = useState("NO CONNECTION")
    const [userInput, setUserInput] = useState("")
    const [gameState, setGameState] = useState("")
    const webSocketRef = useRef(null)

    const handleKeydown = (event) => {
        if(event.key.toUpperCase() === "W" || event.key === "ArrowUp") {
            webSocketRef.current.send(JSON.stringify({
                "userInput" : "UP"
            }))
            setUserInput("UP")
        }
        if(event.key.toUpperCase() === "A" || event.key === "ArrowLeft") {
            webSocketRef.current.send(JSON.stringify({
                "userInput" : "LEFT"
            }))
            setUserInput("LEFT")
        }
        if(event.key.toUpperCase() === "S" || event.key === "ArrowDown") {
            webSocketRef.current.send(JSON.stringify({
                "userInput" : "DOWN"
            }))
            setUserInput("DOWN")
        }
        if(event.key.toUpperCase() === "D" || event.key === "ArrowRight") {
            webSocketRef.current.send(JSON.stringify({
                "userInput" : "RIGHT"
            }))
            setUserInput("RIGHT")
        }
    }

    const progressGame = (event) => {
        setServerMessage(event.data)
    }

    const spawnPlayer = (xPos, yPos) => {
        const newBoard = board.map((c, i) => {
            if (i === yPos) {
                c[xPos] = player
                return c
            } else {
                return c
            }
        })
        setBoard(newBoard)
    }

    const startGameHandler = (event) => {
        spawnPlayer(0, 1)
    }

    const endGame = () => {
        webSocket.close()
    }

    useEffect(() => {
        const ws = new WebSocket(process.env.WS_SERVER_URL + "/ws/play")
        webSocketRef.current = ws
        ws.onopen = (event) => {
            ws.send(JSON.stringify({
                "connection" : "true"
            }))
        }
        ws.onmessage = (event) => {
            progressGame(event)
        }
        ws.onclose = (event) => {
            setServerMessage("NO CONNECTION")
        }
        
        document.addEventListener("keydown", handleKeydown)

        setBoard(generateBoard())

        return (() => {
            removeEventListener("keydown", handleKeydown)
        })
    }, [])

    return (
        <div>
            <h1>Game</h1>
            <h1>{serverMessage}</h1>
            <h1>Input: {userInput}</h1>
            <h1>Gamestate: {gameState}</h1>
            <button onClick={startGameHandler}>Spawn Player</button>
           
            {board.map((row, key) => <div key={key} className="flex flex-row">{row}</div>)}
            
            <button onClick={endGame}>End Game</button>
        </div>
    )
}

export default game