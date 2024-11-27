"use client";

import { useEffect, useRef, useState } from "react"
import { Player, playerASprite, playerBSprite, drawBoard, updateBoard, movePlayer } from "./game.js"
import GameOver from "./components/gameover.js"

const game = () => {
    let pA = new Player(7, 11, playerASprite)
    let pB = new Player(17, 11, playerBSprite)

    const [board, setBoard] = useState([])
    const [gameOver, setGameOver] = useState(false)
    
    const webSocketRef = useRef(null)
    const userInputRef = useRef("DOWN") // Player moves down by default
    const boardRef = useRef([])

    const handleKeydown = (event) => {
        if(event.key.toUpperCase() === "W" || event.key === "ArrowUp") {
            webSocketRef.current.send(JSON.stringify({
                "userInput" : "UP"
            }))
            userInputRef.current = "UP"
        }
        if(event.key.toUpperCase() === "A" || event.key === "ArrowLeft") {
            webSocketRef.current.send(JSON.stringify({
                "userInput" : "LEFT"
            }))
            userInputRef.current = "LEFT"
        }
        if(event.key.toUpperCase() === "S" || event.key === "ArrowDown") {
            webSocketRef.current.send(JSON.stringify({
                "userInput" : "DOWN"
            }))
            userInputRef.current = "DOWN"
        }
        if(event.key.toUpperCase() === "D" || event.key === "ArrowRight") {
            webSocketRef.current.send(JSON.stringify({
                "userInput" : "RIGHT"
            }))
            userInputRef.current = "RIGHT"
        }
    }

    const startGame = async (event) => {
        if(!pA.getCollided() && !pB.getCollided()) {
            const serverMessage = JSON.parse(event.data)
            
            pA = movePlayer(pA, serverMessage["playerAInput"])
            pB = movePlayer(pB, serverMessage["playerBInput"])
            setBoard(updateBoard(pA, pB))
            
        } else {
            setGameOver(true)
            restartGame()
        }
    }

    const restartGame = async () => {
        await new Promise(r => setTimeout(r, 1000))
        setGameOver(false)
        pA = new Player(7, 11, playerASprite)
        pB = new Player(17, 11, playerBSprite)
        webSocketRef.current.send(JSON.stringify({
            "userInput" : "DOWN"
        }))
        
    }

    useEffect(() => {
        const ws = new WebSocket(process.env.WS_SERVER_URL + "/ws/play")
        webSocketRef.current = ws
        ws.onopen = (event) => {
            ws.send(JSON.stringify({
                "userInput" : userInputRef.current
            }))
        }
        ws.onmessage = (event) => {
            startGame(event)
        }
        ws.onclose = (event) => {
            
        }
        document.addEventListener("keydown", handleKeydown)
        setBoard(drawBoard())
        return (() => {
            removeEventListener("keydown", handleKeydown)
        })
    }, [])

    return (
        <div>
            <h1>Game</h1>
            <button onClick={startGame}>Start Game</button>
            {board.map((d, i) => (
                <div className="flex" key={i} ref={(ref) => (boardRef.current[i] = ref)}>
                    {d}
                </div>
            ))}
            {gameOver && <GameOver />}
        </div>
    )
}

export default game