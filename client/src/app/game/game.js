const playerASprite = <div key="playerA" className="flex bg-green-500 w-[2rem] h-[2rem]"></div>
const playerBSprite = <div key="playerB" className="flex bg-red-500 w-[2rem] h-[2rem]"></div>
const playerTrailSprite = <div key="trailSprite" className="flex bg-blue-500 w-[2rem] h-[2rem]"></div>

class TrailNode {
    lastX
    lastY
    sprite = playerTrailSprite

    constructor(prevX, prevY) {
        this.xPos = prevX
        this.yPos = prevY
    }

    getXPos() {
        return this.xPos
    }
    getYPos() {
        return this.yPos
    }

    setXPos(x) {
        this.lastX = this.xPos
        this.xPos = x
    }
    setYPos(y) {
        this.lastY = this.yPos
        this.yPos = y
    }
}

class Player {
    trailLength = 25
    lastX
    lastY

    constructor(xPos, yPos, sprite) {
        this.xPos = xPos
        this.yPos = yPos
        this.lastX = xPos
        this.lastY = yPos

        this.sprite = sprite
        
        this.trail = this.createTrail()
    }

    createTrail() {
        const t = []
        for(let i = 0; i < this.trailLength; i++) {
            t.push(new TrailNode(this.getXPos(), this.getYPos()))
        }
        return t
    }

    updateTrail() {
        for(let i = 0; i < this.trailLength; i++) {
            if(i === 0) {
                this.trail[i].setXPos(this.lastX)
                this.trail[i].setYPos(this.lastY)
            } else {
                this.trail[i].setXPos(this.trail[i-1].lastX)
                this.trail[i].setYPos(this.trail[i-1].lastY)
            }
        }
    }

    getXPos() {
        return this.xPos
    }
    getYPos() {
        return this.yPos
    }
    getTrailLength() {
        return this.trailLength
    }

    moveUp() {
        this.lastX = this.xPos
        this.lastY = this.yPos
        this.yPos = this.yPos - 1
    }
    moveDown() {
        this.lastX = this.xPos
        this.lastY = this.yPos
        this.yPos = this.yPos + 1
    }
    moveLeft() {
        this.lastY = this.yPos
        this.lastX = this.xPos
        this.xPos = this.xPos - 1
    }
    moveRight() {
        this.lastY = this.yPos
        this.lastX = this.xPos
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

    // Draw trails
    pA.updateTrail()
    for(let i = 0; i < pA.trail.length; i++) {
        board[pA.trail[i].getYPos()][pA.trail[i].getXPos()] = <div key={i} className="flex bg-blue-300 w-[2rem] h-[2rem]"></div>
    }

    pB.updateTrail()
    for(let i = 0; i < pB.trail.length; i++) {
        board[pB.trail[i].getYPos()][pB.trail[i].getXPos()] = <div key={-i-1} className="flex bg-blue-300 w-[2rem] h-[2rem]"></div>
    }

    // Update player locations
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