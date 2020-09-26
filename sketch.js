let board
let play = false
let frame = 0

function setup() {
    var cnv = createCanvas(windowWidth, windowHeight);
    cnv.style('display', 'cell');
    board = new Board()
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}


function draw() {
    clear()
    //background('black')
    board.display()
    frame++
    if (frame % 30 && play)
        board.step()
        frame = 0
}

function keyPressed(event) {
    if (event.code == "Space") board.step()
    if (event.code == "KeyP") play = !play
}

function mouseDragged(event) {
    play = false
    board.mousePressed(event)
}

function mouseReleased(event) {
    play = false
    board.mouseReleased(event)
}

function mousePressed(event) {
    play = false
    board.mousePressed(event)
}

// ----------------------------------------------------------------------------
initArrayValueDefault = (i,j) => 0
function initArray(w,h,v=initArrayValueDefault) {
    let arr = []
    for (let i=0; i<h; i++) {
        arr.push([])
        for (let j=0; j<w; j++) {
            arr[i].push(v(j,i))
        }
    }
    return arr
}

// ----------------------------------------------------------------------------
class Cell {
    constructor(pos, size) {
        [this.x, this.y] = pos
        this.size = size
        this.alive = false
        this.lock = false
    }

    display() {
        push()
        fill(this.alive * 255)
        rect(
            this.x * this.size,
            this.y * this.size,
            this.size,
            this.size,
        )
        pop()
    }

    mousePressed(event) {
        if (this.lock) return
        let u = event.clientX
        let v = event.clientY
        let x = floor(u/this.size)
        let y = floor(v/this.size)

        if (this.x == x && this.y == y) {
            this.alive ^= 1
            this.lock = true
        }
    }

    mouseReleased(event) {
        this.lock = false
    }
}

class Board {
    constructor(dim=[100,100], cellSize=15) {
        this.dim = dim
        this.width = this.dim[0]
        this.height = this.dim[1]
        this.cellSize = cellSize
        this.cells = initArray(
            this.width,
            this.height,
            (i,j)=>new Cell([i,j], this.cellSize))
    }

    display() {
        for (let i=0; i<this.height; i++) {
            for (let j=0; j<this.width; j++) {
                this.cells[i][j].display()
            }
        }
    }

    mousePressed(event) {
        for (let i=0; i<this.height; i++) {
            for (let j=0; j<this.width; j++) {
                this.cells[i][j].mousePressed(event)
            }
        }
    }

    mouseReleased(event) {
        for (let i=0; i<this.height; i++) {
            for (let j=0; j<this.width; j++) {
                this.cells[i][j].mouseReleased(event)
            }
        }
    }

    step() {
        let oldCells = this.cells
        let newCells = initArray(
            this.width,
            this.height,
            (i,j)=>new Cell([i,j], this.cellSize))

        for (let i=0; i<this.height; i++) {
            for (let j=0; j<this.width; j++) {
                let t = i > 0
                let l = j > 0
                let b = i < this.height-1
                let r = j < this.width-1

                let tl = t && l && oldCells[i-1][j-1].alive
                let tm = t && oldCells[i-1][j].alive
                let tr = t && r && oldCells[i-1][j+1].alive

                let ml = l && oldCells[i][j-1].alive
                let mm = false
                let mr = r && oldCells[i][j+1].alive

                let bl = b && l && oldCells[i+1][j-1].alive
                let bm = b && oldCells[i+1][j].alive
                let br = b && r && oldCells[i+1][j+1].alive

                let neighborsAlive =
                    tl + tm + tr +
                    ml + mm + mr +
                    bl + bm + br

                // Rule 1
                if (oldCells[i][j].alive) {
                    if (neighborsAlive == 2 || neighborsAlive == 3)
                        newCells[i][j].alive = true
                    else
                        newCells[i][j].alive = false
                } else {
                    if (neighborsAlive == 3)
                        newCells[i][j].alive = true
                    else
                        newCells[i][j].alive = false
                }
            }
        }
        this.cells = newCells.map((arr)=>arr.slice())
    }
}


