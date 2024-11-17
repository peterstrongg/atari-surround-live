"use client";

import { useEffect, useRef, useState } from "react"

import Image from 'next/image'
import BoardCell from "../../assets/board_cell.png"

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
    const [webSocket, setWebSocket] = useState(null)
    const [userInput, setUserInput] = useState("")
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

    const endGame = () => {
        webSocket.close()
    }

    useEffect(() => {
        const ws = new WebSocket(process.env.WS_SERVER_URL + "/ws/play")
        setWebSocket(ws)
        webSocketRef.current = ws
        ws.onopen = (event) => {
            ws.send(JSON.stringify({
                "connection" : "true"
            }))
        }
        ws.onmessage = (event) => {
            setServerMessage(event.data)
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
           
            {board.map((row, key) => <div key={key} className="flex flex-row">{row}</div>)}
            
            <button onClick={endGame}>End Game</button>
        </div>
    )
}

export default game