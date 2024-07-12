import { PUZZLE } from "./puzzle.js"

const WORDS = PUZZLE['words']
let remainingWords = WORDS

function initBoard() {
  let board = document.getElementById("game-board")
  let rows = remainingWords / 4
  let index = 0

  for (let i = 0; i < rows; i++) {
    let row = document.createElement("div")
    row.className = "row"
    row.dataset.i = i

    for (let j = 0; j < 4; j++) {
      let box = document.createElement("div")
      box.className = "box"
      box.dataset.j = j
      box.textContent = WORDS[index]
      row.appendChild(box)
      index++
    }

    board.appendChild(row)
  }
}

initBoard()