let board
let play = false

function setup() {
    var cnv = createCanvas(windowWidth, windowHeight)
    cnv.style('display', 'cell')
    board = new Board()

    mouseDragged = board.mouseDragged
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight)
}

function draw() {
    clear()
    background('black')
    board.display()
    if (play)
        board.step()
}

function keyPressed(event) {
    if (event.code == "Space") board.step()
    if (event.code == "KeyP") play = !play
}

function mouseMoved(event) {
}

function mouseReleased(event) {
    play = false
    board.mouseReleased(event.clientX, event.clientY)
}

function mousePressed(event) {
    play = false
    board.mousePressed(event.clientX, event.clientY)
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

    mouseReleased(u, v) {
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

    mousePressed(u, v) {
        let y = floor(u/this.cellSize)
        let x = floor(v/this.cellSize)
        if (!(((0 <= x && x < this.width)) &&
            (0 <= y && y < this.height))) return
        if (this.cells[x][y].lock) return

        this.cells[x][y].alive = !this.cells[x][y].alive
        this.cells[x][y].lock = true
    }

    mouseDragged(_) {
        play = false

        let steps = 50
        for (let i=0; i<steps; i++) {
            let lx = Math.floor(lerp(pmouseX, mouseX, i/steps))
            let ly = Math.floor(lerp(pmouseY, mouseY, i/steps))
            board.mousePressed(lx,ly)
        }
    }

    mouseReleased(u, v) {
        for (let i=0; i<this.height; i++) {
            for (let j=0; j<this.width; j++) {
                this.cells[i][j].mouseReleased(u, v)
            }
        }
    }

    step() {
        let oldCells = this.cells
        this.cells = initArray(
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
                let mm = false // never count self
                let mr = r && oldCells[i][j+1].alive

                let bl = b && l && oldCells[i+1][j-1].alive
                let bm = b && oldCells[i+1][j].alive
                let br = b && r && oldCells[i+1][j+1].alive

                let neighborsAlive =
                    tl + tm + tr +
                    ml + mm + mr +
                    bl + bm + br

                let isAlive = oldCells[i][j].alive

                this.cells[i][j].alive =
                    (isAlive && (neighborsAlive == 2 || neighborsAlive == 3)) ||
                    (!isAlive && neighborsAlive == 3)
            }
        }
    }
}


