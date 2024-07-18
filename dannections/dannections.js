import { PUZZLE } from "./puzzle.js"
import confetti from 'https://cdn.skypack.dev/canvas-confetti'

const WORDS = PUZZLE['words']
const ANSWERS = PUZZLE['answers']
let remainingWords = WORDS
let guesses = []
let submittedRows = []
let guessesRemaining = 4

let answerColors = ['yellow', 'lightgreen', 'aqua', 'violet']
shuffle(remainingWords)

function initBoard() {
  let board = document.getElementById("game-board")
  board.innerHTML = '' // Clear the existing board

  // Create custom bars for submitted rows
  for (let i = 0; i < submittedRows.length; i++) {
    let row = document.createElement("div")
    row.className = "row"

    let answerBar = document.createElement("div")
    answerBar.className = "answer-bar"

    let answerTitle = document.createElement("div")
    answerTitle.className = "answer-title"

    let answerDescription = document.createElement("div")
    answerDescription.className = "answer-description"

    answerTitle.textContent = ANSWERS[submittedRows[i]]['title']
    answerDescription.textContent = ANSWERS[submittedRows[i]]['description']
    answerBar.style.backgroundColor = answerColors[ANSWERS[submittedRows[i]]['difficulty']]

    answerBar.appendChild(answerTitle)    
    answerBar.appendChild(answerDescription)
    row.appendChild(answerBar)
    board.appendChild(row)
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

  // Create guesses remaining dots
  let guessDots = document.getElementById("guess-dots")
  guessDots.innerHTML = ''
  for (let i = 0; i < guessesRemaining; i++) {
    let dot = document.createElement("div")
    dot.className = "dot"
    guessDots.appendChild(dot)
  }
}

function handleBoxClick(box) {
  let word = box.textContent
  if (guesses.includes(word)) {
    box.style.backgroundColor = ""
    guesses = guesses.filter(guess => guess !== word)
  } else {
    if (guesses.length >= 4) return
    box.style.backgroundColor = "darkgray"
    guesses.push(word)
  }

  updateSubmitButtonState()
}

function updateSubmitButtonState() {
  let submitButton = document.getElementsByClassName("submit-button")[0]
  submitButton.disabled = guesses.length !== 4 || guessesRemaining < 1
}

function handleSubmit() {
  const potentialAnswer = guesses.sort().join(',')
  if (Object.keys(ANSWERS).includes(potentialAnswer)) {
    // Remove guessed words from remainingWords
    remainingWords = remainingWords.filter(word => !guesses.includes(word))

    // Increment submitted rows count
    submittedRows.push(potentialAnswer)
  } else {
    guessesRemaining--

    if (guessesRemaining > 0) { toastr.error('Nope!') }
    else {
      toastr.error('No mistakes left! Game Over.')
    }
  }

  // Re-render the board
  initBoard()

  // Reset guesses
  guesses = []
  updateSubmitButtonState()

  if (remainingWords.length === 0) {
    toastr.success("You win!")
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    })
  }
}

function handleShuffle() {
  handleDeselectAll()
  shuffle(remainingWords)
  initBoard()
}

function handleDeselectAll() {
  guesses = []
  initBoard()
  updateSubmitButtonState()
}

function shuffle(array) {
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initBoard()

  let submitButton = document.getElementsByClassName("submit-button")[0]
  submitButton.addEventListener("click", handleSubmit)

  let shuffleButton = document.getElementsByClassName("shuffle-button")[0]
  shuffleButton.addEventListener("click", handleShuffle)

  let deselectAllButton = document.getElementsByClassName("deselect-all-button")[0]
  deselectAllButton.addEventListener("click", handleDeselectAll)
})
