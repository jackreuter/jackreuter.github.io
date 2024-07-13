import { PUZZLE } from "./puzzle.js"

const WORDS = PUZZLE['words']
let remainingWords = WORDS
let guesses = []

function initBoard() {
  let board = document.getElementById("game-board")
  let rows = Math.ceil(remainingWords.length / 4)
  let index = 0

  for (let i = 0; i < rows; i++) {
    let row = document.createElement("div")
    row.className = "row"
    row.dataset.i = i

    for (let j = 0; j < 4; j++) {
      if (index >= WORDS.length) break

      let box = document.createElement("div")
      box.className = "box"
      box.dataset.j = j
      box.textContent = WORDS[index]
      box.addEventListener("click", () => handleBoxClick(box))
      row.appendChild(box)
      index++
    }

    board.appendChild(row)
  }
}

function handleBoxClick(box) {
  let word = box.textContent
  if (guesses.includes(word)) {
    box.style.backgroundColor = ""
    guesses = guesses.filter(guess => guess !== word)
  } else {
    if (guesses.length >= 4) return
    box.style.backgroundColor = "aqua"
    guesses.push(word)
  }

  updateSubmitButtonState()
}

function updateSubmitButtonState() {
  let submitButton = document.getElementsByClassName("submit-button")[0]
  submitButton.disabled = guesses.length !== 4
}

initBoard()
