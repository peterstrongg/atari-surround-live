"use client";

import { useEffect, useRef, useState } from "react"
import { Player, playerASprite, playerBSprite, drawBoard, updateBoard, movePlayer } from "./game.js"

const game = () => {
    let pA = new Player(0, 0, playerASprite)
    let pB = new Player(2, 3, playerBSprite)
    const [serverMessage, setServerMessage] = useState("NO CONNECTION")
    const [userInput, setUserInput] = useState("")
    const [board, setBoard] = useState([])
    
    const webSocketRef = useRef(null)
    const userInputRef = useRef("")
    const boardRef = useRef([])

    const handleKeydown = (event) => {
        if(event.key.toUpperCase() === "W" || event.key === "ArrowUp") {
            webSocketRef.current.send(JSON.stringify({
                "userInput" : "UP"
            }))
            setUserInput("UP")
            userInputRef.current = "UP"
        }
        if(event.key.toUpperCase() === "A" || event.key === "ArrowLeft") {
            webSocketRef.current.send(JSON.stringify({
                "userInput" : "LEFT"
            }))
            setUserInput("LEFT")
            userInputRef.current = "LEFT"
        }
        if(event.key.toUpperCase() === "S" || event.key === "ArrowDown") {
            webSocketRef.current.send(JSON.stringify({
                "userInput" : "DOWN"
            }))
            setUserInput("DOWN")
            userInputRef.current = "DOWN"
        }
        if(event.key.toUpperCase() === "D" || event.key === "ArrowRight") {
            webSocketRef.current.send(JSON.stringify({
                "userInput" : "RIGHT"
            }))
            setUserInput("RIGHT")
            userInputRef.current = "RIGHT"
        }
    }

    const startGame = async (event) => {
        setBoard(updateBoard(pA, pB)) // Spawn Players
        const serverMessage = JSON.parse(event.data)
        pA = movePlayer(pA, serverMessage["playerAInput"])
        pB = movePlayer(pB, serverMessage["playerBInput"])
       
        // NOTE: Uncomment below to test without ws server
        // while(true) {
        //     pA = movePlayer(pA, userInputRef.current)
        //     setBoard(updateBoard(pA, pB))
        //     await new Promise(r => setTimeout(r, 100))
        // }
    }

    const endGame = () => {
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
            setServerMessage(event.data)
            startGame(event)
        }
        ws.onclose = (event) => {
            setServerMessage("NO CONNECTION")
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
            <h1>{serverMessage}</h1>
            <h1>Input: {userInput}</h1>
            <button onClick={startGame}>Start Game</button>
            {board.map((d, i) => (
                <div className="flex" key={i} ref={(ref) => (boardRef.current[i] = ref)}>
                    {d}
                </div>
            ))}
        </div>
    )
}

export default game