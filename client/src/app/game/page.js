"use client";

import { useEffect, useRef, useState } from "react"
import { Player, playerASprite, playerBSprite, drawBoard, updateBoard, movePlayer } from "./game.js"
import GameOver from "./components/gameover.js"

const game = () => {
    let pA = new Player(process.env.PA_START_X, process.env.PA_START_Y, playerASprite)
    let pB = new Player(process.env.PB_START_X, process.env.PB_START_Y, playerBSprite)

    const [board, setBoard] = useState([])
    const [gameOver, setGameOver] = useState(false)
    const [playerAScore, setPlayerAScore] = useState(0)
    const [playerBScore, setPlayerBScore] = useState(0)
    const [winner, setWinner] = useState("")
    
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

    const startGame = (event) => {
        if(!pA.getCollided() && !pB.getCollided()) {
            const serverMessage = JSON.parse(event.data)
            pA.movePlayer(serverMessage["playerAInput"])
            pB.movePlayer(serverMessage["playerBInput"])
            setBoard(updateBoard(pA, pB))
        } else {
            setGameOver(true)
            const winner = determineWinner()
            // restartGame()
        }
    }

    const determineWinner = () => {
        if(pA.getCollided() && !pB.getCollided()) {             // Player B Wins
            pB.setWon(true)
            pB.incScore()
            setWinner("Player B")
        } else if(!pA.getCollided() && pB.getCollided()) {      // Player A Wins
            pA.setWon(true)
            pA.incScore()
            setWinner("Player A")
        } else if (pA.getCollided() && pB.getCollided()) {      // Tie
            setWinner("TIE")
        }
    }

    const restartGame = () => {
        // Update scoreboard UI
        setPlayerAScore(playerAScore => playerAScore + 1)
        if(pA.getWon()) {
            setPlayerAScore(playerAScore => playerAScore + 1)
        } else if(pB.getWon()) {
            setPlayerBScore(playerBScore => playerBScore + 1)
        }

        setBoard(drawBoard())
        setGameOver(false)
        pA = new Player(process.env.PA_START_X, process.env.PA_START_Y, playerASprite)
        pB = new Player(process.env.PB_START_X, process.env.PB_START_Y, playerBSprite)
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
            <div className="ml-auto mr-auto">
                <h1>Surround Online</h1>
                <h1>Player A: {playerAScore}</h1>
                <h1>Player B: {playerBScore}</h1>
            </div>
            <div className="ml-auto mr-auto w-min">
                {board.map((d, i) => (
                    <div className="flex" key={i} ref={(ref) => (boardRef.current[i] = ref)}>
                        {d}
                    </div>
                ))}
            </div>
            {gameOver && <GameOver winner={winner} restartGame={restartGame} />}
        </div>
    )
}

export default game