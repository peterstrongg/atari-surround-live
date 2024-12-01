import { useState } from "react"

const GameOver = (props) => {
    const [rematch, setRematch] = useState(false)

    const handleRequestRematch = (event) => {
        setRematch(true)
        props.requestRematch()
    }

    return(
        <div className="bg-sky-700 w-[35rem] h-[15rem] fixed inset-0 z-10 overflow-y-auto ml-auto mr-auto mt-[15rem]">
            <div className="mt-[2rem] text-center">
                <h1>Game Over</h1>
                <h1>{props.winner} won!</h1>
                <div>
                    <button onClick={handleRequestRematch} className="mr-4 ml-4">Rematch</button>
                    <button onClick={props.exit} className="mr-4 ml-4">Exit</button>
                </div>
                {rematch && <h1>Waiting for opponent...</h1>}
            </div>
        </div>
    )
}

export default GameOver