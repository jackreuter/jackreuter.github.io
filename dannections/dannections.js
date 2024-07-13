import { PUZZLE } from "./puzzle.js"

const WORDS = PUZZLE['words']
const ANSWERS = PUZZLE['answers']
let remainingWords = WORDS
let guesses = []
let submittedRows = []

let answerColors = ['yellow', 'green', 'blue', 'purple']

function initBoard() {
  let board = document.getElementById("game-board")
  board.innerHTML = '' // Clear the existing board

  // Create custom bars for submitted rows
  for (let i = 0; i < submittedRows.length; i++) {
    let answerBar = document.createElement("div")
    answerBar.className = "custom-bar"
    answerBar.textContent = ANSWERS[submittedRows[i]]['description']
    console.log(submittedRows[i], ANSWERS[submittedRows[i]]['difficulty'])
    answerBar.backgroundColor = answerColors[ANSWERS[submittedRows[i]]['difficulty']]
    board.appendChild(answerBar)
  }

  let index = 0

  // Create rows for remaining words
  for (let i = submittedRows.length; i < submittedRows.length + 4; i++) {
    let row = document.createElement("div")
    row.className = "row"
    row.dataset.i = i

    for (let j = 0; j < 4; j++) {
      if (index >= remainingWords.length) break

      let box = document.createElement("div")
      box.className = "box"
      box.dataset.j = j
      box.textContent = remainingWords[index]
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

function handleSubmit() {
  const potentialAnswer = guesses.sort().join(',')
  if (Object.keys(ANSWERS).includes(potentialAnswer)) {
    // Remove guessed words from remainingWords
    remainingWords = remainingWords.filter(word => !guesses.includes(word))

    // Increment submitted rows count
    submittedRows.push(potentialAnswer)
  }
  // Re-render the board
  initBoard()

  // Reset guesses
  guesses = []
  updateSubmitButtonState()
}

document.addEventListener("DOMContentLoaded", () => {
  initBoard()

  let submitButton = document.getElementsByClassName("submit-button")[0]
  submitButton.addEventListener("click", handleSubmit)
})
