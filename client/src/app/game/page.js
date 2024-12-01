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


    const sendMessage = (message) => {
        webSocketRef.current.send(JSON.stringify({
            "userInput" : message
        }))
        userInputRef.current = message
    }

    const handleKeydown = (event) => {
        if(event.key.toUpperCase() === "W" || event.key === "ArrowUp") {
            sendMessage("UP")
        }
        if(event.key.toUpperCase() === "A" || event.key === "ArrowLeft") {
            sendMessage("LEFT")
        }
        if(event.key.toUpperCase() === "S" || event.key === "ArrowDown") {
            sendMessage("DOWN")
        }
        if(event.key.toUpperCase() === "D" || event.key === "ArrowRight") {
            sendMessage("RIGHT")
        }
    }

    const startGame = (data) => {
        if(!pA.getCollided() && !pB.getCollided()) {
            pA.movePlayer(data["playerAInput"])
            pB.movePlayer(data["playerBInput"])
            setBoard(updateBoard(pA, pB))
        } else {
            setGameOver(true)
            determineWinner()
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

    const requestRematch = () => {
        sendMessage("REMATCH")
    }

    const restartGame = () => {
        if(pA.getWon()) {
            setPlayerAScore(playerAScore => playerAScore + 1)
        } else if(pB.getWon()) {
            setPlayerBScore(playerBScore => playerBScore + 1)
        }
        setBoard(drawBoard())
        setGameOver(false)
        pA = new Player(process.env.PA_START_X, process.env.PA_START_Y, playerASprite)
        pB = new Player(process.env.PB_START_X, process.env.PB_START_Y, playerBSprite)
        sendMessage("DOWN")
    }

    const exit = () => {
        sendMessage("DISCONNECTED")
        webSocketRef.current.close()
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
            const data = JSON.parse(event.data)
            if(data["type"] === "GAME") {
                startGame(data)
            } else if (data["type"] === "GAMEOVER") {
                if (data["playerAInput"] === "REMATCH") {
                    pA.rematch = true
                } 
                if (data["playerBInput"] === "REMATCH") {
                    pB.rematch = true
                }              
            } else if (data["type"] === "DISCONNECT") {
                console.log("Opponent disconnected")
                exit()
            }
            if (pA.rematch && pB.rematch) {
                restartGame()
            } 
        }
        ws.onclose = (event) => {
            console.log("Connection terminated")
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
            {gameOver && <GameOver winner={winner} requestRematch={requestRematch} exit={exit} />}
        </div>
    )
}

export default game