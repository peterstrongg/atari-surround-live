const playerASprite = <div key="playerA" className="flex bg-green-500 w-[2rem] h-[2rem]"></div>
const playerBSprite = <div key="playerB" className="flex bg-red-500 w-[2rem] h-[2rem]"></div>

class Player {
    constructor(xPos, yPos, sprite) {
        this.xPos = xPos
        this.yPos = yPos
        this.sprite = sprite
    }

    getXPos() {
        return this.xPos
    }
    getYPos() {
        return this.yPos
    }

    moveUp() {
        this.yPos = this.yPos - 1
    }
    moveDown() {
        this.yPos = this.yPos + 1
    }
    moveLeft() {
        this.xPos = this.xPos - 1
    }
    moveRight() {
        this.xPos = this.xPos + 1
    }
}

const drawBoard = () => {
    const board = []
    for (let row = 0; row < process.env.BOARD_HEIGHT; row++) {
        const r = []
        for (let col = 0; col < process.env.BOARD_WIDTH; col++) {
            r.push(<div key={r} className="flex bg-white w-[2rem] h-[2rem] border"></div>)
        }
        board.push(r)
    }
    return board
}

const updateBoard = (pA, pB) => {
    let board = drawBoard()
    board[pA.getYPos()][pA.getXPos()] = pA.sprite
    board[pB.getYPos()][pB.getXPos()] = pB.sprite
    return board
}

const movePlayer = (player, direction) => {
    if (direction === "UP" && player.getYPos() > 0) {
        player.moveUp()
    } else if (direction === "DOWN" && player.getYPos() < process.env.BOARD_HEIGHT - 1) {
        player.moveDown()
    } else if (direction === "LEFT" && player.getXPos() > 0) {
        player.moveLeft()
    } else if (direction === "RIGHT" && player.getXPos() < process.env.BOARD_WIDTH - 1) {
        player.moveRight()
    }
    return player
}

export { 
    Player,
    playerASprite,
    playerBSprite,
    drawBoard,
    updateBoard,
    movePlayer
}