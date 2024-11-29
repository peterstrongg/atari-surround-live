const playerASprite = <div key="playerA" className="flex bg-green-500 w-[2rem] h-[2rem]"></div>
const playerBSprite = <div key="playerB" className="flex bg-red-500 w-[2rem] h-[2rem]"></div>
const playerTrailSprite = <div key="trailSprite" className="flex bg-blue-500 w-[2rem] h-[2rem]"></div>

class TrailNode {
    sprite = playerTrailSprite

    constructor(xPos, yPos) {
        this.xPos = xPos
        this.yPos = yPos
        this.lastX = xPos
        this.lastY = yPos
    }

    getXPos() { return this.xPos }
    getYPos() { return this.yPos }
    getLastX() { return this.lastX }
    getLastY() { return this.lastY }

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
    constructor(xPos, yPos, sprite) {
        this.xPos = xPos
        this.yPos = yPos
        this.lastX = xPos
        this.lastY = yPos
        this.sprite = sprite
        this.collided = false
        this.trailLength = 1
        this.trail = this.createTrail()
    }

    movePlayer(direction) {
        if (direction) {
            if (direction === "UP" && this.getYPos() > 0) {
                this.moveUp()
            } else if (direction === "DOWN" && this.getYPos() < process.env.BOARD_HEIGHT - 1) {
                this.moveDown()
            } else if (direction === "LEFT" && this.getXPos() > 0) {
                this.moveLeft()
            } else if (direction === "RIGHT" && this.getXPos() < process.env.BOARD_WIDTH - 1) {
                this.moveRight()
            } else {
                this.setCollided(true)
            }
        }
    }

    createTrail() {
        const t = []
        for(let i = 0; i < this.trailLength; i++) {
            t.push(new TrailNode(this.getXPos(), this.getYPos()))
        }
        return t
    }

    extendTail() {
        this.trail.push(new TrailNode(
            this.trail[this.trail.length - 1].getXPos(), 
            this.trail[this.trail.length - 1].getYPos()
        ))
        this.trailLength++
    }

    updateTrail() {
        for(let i = 0; i < this.trailLength; i++) {
            if(i === 0) {
                this.trail[i].setXPos(this.getLastX())
                this.trail[i].setYPos(this.getLastY())
            } else {
                this.trail[i].setXPos(this.trail[i-1].getLastX())
                this.trail[i].setYPos(this.trail[i-1].getLastY())
            }
        }
    }

    getXPos() { return this.xPos }
    getYPos() { return this.yPos }
    getLastX() { return this.lastX }
    getLastY() { return this.lastY }
    getTrailLength() { return this.trailLength }
    getCollided() { return this.collided }
    
    setCollided(status) {
        this.collided = status
    }
    setPos(x, y) {
        this.xPos = x
        this.yPos = y
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
    for(let i = 0; i < pA.trailLength; i++) {
        board[pA.trail[i].getYPos()][pA.trail[i].getXPos()] = <div key={i} className="flex bg-blue-300 w-[2rem] h-[2rem]"></div>
    }

    pB.updateTrail()
    for(let i = 0; i < pB.trailLength; i++) {
        board[pB.trail[i].getYPos()][pB.trail[i].getXPos()] = <div key={-i-1} className="flex bg-blue-300 w-[2rem] h-[2rem]"></div>
    }

    // Update player locations
    board[pA.getYPos()][pA.getXPos()] = pA.sprite
    board[pB.getYPos()][pB.getXPos()] = pB.sprite

    // Collision Detection
    for(let i = 0; i < pA.trailLength; i++) {
        if(pA.getXPos() === pA.trail[i].getXPos()           // Player A hits themself
            && pA.getYPos() === pA.trail[i].getYPos() 
            && pA.trailLength > 1) {
            pA.setCollided(true)
        } else if(pA.getXPos() === pB.trail[i].getXPos()    // Player A hits Player B's taile
            && pA.getYPos() === pB.trail[i].getYPos() 
            && pA.trailLength > 1) {
            pA.setCollided(true)
        } else if(pB.getXPos() === pB.trail[i].getXPos()    // Player B hits themself
            && pB.getYPos() === pB.trail[i].getYPos() 
            && pB.trailLength > 1) {
            pB.setCollided(true)
        } else if(pB.getXPos() === pA.trail[i].getXPos()    // Player B hits Player A's trail
            && pB.getYPos() === pA.trail[i].getYPos() 
            && pB.trailLength > 1) {
            pB.setCollided(true)
        }
    }

    pA.extendTail() // Commenting out this line changes trail behavior
    pB.extendTail() // Commenting out this line changes trail behavior

    return board
}

const movePlayer = (player, direction) => {
    if (direction) {
        if (direction === "UP" && player.getYPos() > 0) {
            player.moveUp()
        } else if (direction === "DOWN" && player.getYPos() < process.env.BOARD_HEIGHT - 1) {
            player.moveDown()
        } else if (direction === "LEFT" && player.getXPos() > 0) {
            player.moveLeft()
        } else if (direction === "RIGHT" && player.getXPos() < process.env.BOARD_WIDTH - 1) {
            player.moveRight()
        } else {
            player.setCollided(true)
        }
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