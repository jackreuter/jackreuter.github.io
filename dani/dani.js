import { PUZZLE } from "./puzzle.js"
import confetti from 'https://cdn.skypack.dev/canvas-confetti'


const GRID = PUZZLE['grid']
const ACROSS_CLUES = PUZZLE['across']
const DOWN_CLUES = PUZZLE['down']
let rowMode = true

function initBoard() {
  let board = document.getElementById("game-board")
  let clueNumber = 1;

  let downNumbersAddedForColumns = []
  for (let i = 0; i < 5; i++) {
    let acrossNumberAdded = false
    let row = document.createElement("div")
    row.className = "letter-row"
    row.dataset.i = i

    for (let j = 0; j < 5; j++) {
      let numberAdded = false
      let box = document.createElement("div")
      box.className = "letter-box"
      box.dataset.j = j

      if (GRID[i][j] === '0') {
        box.classList.add("black-box")
      } else {
        if (!acrossNumberAdded) {
          const numberDiv = document.createElement("div")
          numberDiv.className = "box-number"
          numberDiv.textContent = clueNumber
          box.appendChild(numberDiv)
          acrossNumberAdded = true
          numberAdded = true
          clueNumber++
        }

        if (!downNumbersAddedForColumns.includes(j)) {
          if (!numberAdded) {
            const numberDiv = document.createElement("div")
            numberDiv.className = "box-number"
            numberDiv.textContent = clueNumber
            box.appendChild(numberDiv)
            clueNumber++
          }
          downNumbersAddedForColumns.push(j)
        }

        if (i === 0) { box.classList.add("top-row") }
        if (j === 0) { box.classList.add("left-column") }

        if (i === 0) {
          if (j === 0) {
            box.classList.add("primary-selection")
          } else {
            box.classList.add("secondary-selection")
          }
        }

        const letterSpan = document.createElement("span");
        letterSpan.className = "letter-content";
        box.appendChild(letterSpan);

        box.addEventListener("click", () => {
          if (box.classList.contains("primary-selection")) rowMode = !rowMode
          setSelectedBox(i, j)
        })
      }

      row.appendChild(box)
    }

    board.appendChild(row)
  }
}

function initClue() {
  let clueDiv = document.getElementById("clue-text")
  clueDiv.addEventListener("click", () => {
    let primarySelection = document.getElementsByClassName("primary-selection")[0]
    let i = parseInt(primarySelection.parentNode.dataset.i)
    let j = parseInt(primarySelection.dataset.j)

    rowMode = !rowMode
    setSelectedBox(i, j)
    displayClue()
  })

  let previousClueDiv = document.getElementById("previous-clue")
  previousClueDiv.addEventListener("click", () => selectPreviousClue())
  previousClueDiv.textContent = "<"

  let nextClueDiv = document.getElementById("next-clue")
  nextClueDiv.addEventListener("click", () => selectNextClue())
  nextClueDiv.textContent = ">"

  displayClue()
}

initBoard()
initClue()

function selectPreviousClue() {
  let primarySelection = document.getElementsByClassName("primary-selection")[0]
  let i = parseInt(primarySelection.parentNode.dataset.i)
  let j = parseInt(primarySelection.dataset.j)

  let newi;
  let newj;
  if (rowMode) {
    newi = (i - 1) % 5
    newj = 0
    while (GRID[newi][newj] === '0') {
      j++
    }
  } else {
    newi = 0
    newj = (j - 1) % 5
    while (GRID[newi][newj] === '0') {
      i++
    }
  }

  setSelectedBox(newi, newj)
}

function selectNextClue() {
  let primarySelection = document.getElementsByClassName("primary-selection")[0]
  let i = parseInt(primarySelection.parentNode.dataset.i)
  let j = parseInt(primarySelection.dataset.j)

  let newi;
  let newj;
  if (rowMode) {
    newi = (i + 1) % 5
    newj = 0
    while (GRID[newi][newj] === '0') {
      newj++
    }
  } else {
    newi = 0
    newj = (j + 1) % 5
    while (GRID[newi][newj] === '0') {
      newi++
    }
  }

  setSelectedBox(newi, newj)
}

document.addEventListener("keyup", (e) => {
  let pressedKey = String(e.key)
  if (pressedKey === "Backspace") {
      deleteLetter()
      return
  }

  let found = pressedKey.match(/[a-z]/gi)
  if (!found || found.length > 1) {
      return
  } else {
      insertLetter(pressedKey)
  }
})

function insertLetter (pressedKey) {
  pressedKey = pressedKey.toLowerCase()

  let box = document.getElementsByClassName("primary-selection")[0]
  let letterSpan = box.querySelector(".letter-content")
  letterSpan.textContent = pressedKey;
  selectNextBox()
  checkPuzzle()
}

function checkPuzzle() {
  for (let i=0; i<5; i++) {
    for (let j=0; j<5; j++) {
      let row = document.querySelector(`.letter-row[data-i='${i}']`)
      let box = row.querySelector(`.letter-box[data-j='${j}']`)
      let letterSpan = box.querySelector(".letter-content")

      if (GRID[i][j] !== '0' && GRID[i][j] !== letterSpan.textContent) {
        return false
      }
    }
  }
  var audio = document.getElementById('audioPlayer');
  audio.play();
  toastr.success("You win!")
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
  })
  return true
}

function deleteLetter () {
  let primarySelection = document.getElementsByClassName("primary-selection")[0]
  let letterSpan = primarySelection.querySelector(".letter-content")

  if (letterSpan.textContent === "") {
    let [previousi, previousj] = previousBox()
    setSelectedBox(previousi, previousj)
  }

  primarySelection = document.getElementsByClassName("primary-selection")[0]
  letterSpan = primarySelection.querySelector(".letter-content")
  letterSpan.textContent = ""
}

function selectNextBox() {
  let [nexti, nextj] = nextBox()
  setSelectedBox(nexti, nextj)
}

function nextBox() {
  let box = document.getElementsByClassName("primary-selection")[0]
  let nexti = parseInt(box.parentNode.dataset.i)
  let nextj = parseInt(box.dataset.j)

  if (rowMode) {
    nextj++

    if (nextj === 5 || GRID[nexti][nextj] === '0') {
      nexti++
      nextj = 0
    }

    if (nexti === 5) {
      nexti = 0
    }

    while(GRID[nexti][nextj] === '0') {
      nextj++
    }
  } else {
    nexti++

    if (nexti === 5 || GRID[nexti][nextj] === '0') {
      nextj++
      nexti = 0
    }

    if (nextj === 5) {
      nextj = 0
    }

    while(GRID[nexti][nextj] === '0') {
      nexti = (nexti + 1) % 5
    }
  }

  return [nexti, nextj]
}

function previousBox() {
  let box = document.getElementsByClassName("primary-selection")[0]
  let previousi = parseInt(box.parentNode.dataset.i)
  let previousj = parseInt(box.dataset.j)

  if (rowMode) {
    previousj--

    if (previousj === -1 || GRID[previousi][previousj] === '0') {
      previousi--
      previousj = 4
    }

    if (previousi === -1) {
      previousi = 4
    }

    while(GRID[previousi][previousj] === '0') {
      previousj--
    }
  } else {
    previousi--

    if (previousi === -1 || GRID[previousi][previousj] === '0') {
      previousj--
      previousi = 4
    }

    if (previousj === -1) {
      previousj = 4
    }

    while(GRID[previousi][previousj] === '0') {
      previousi = (previousi - 1) % 5
    }
  }

  return [previousi, previousj]
}
 
function setSelectedBox(newi, newj) {
  let primary = document.getElementsByClassName("primary-selection")[0]
  primary.classList.remove("primary-selection")
  let secondaries = document.getElementsByClassName("secondary-selection")
  Array.from(secondaries).forEach((box) => box.classList.remove('secondary-selection'))

  let newPrimaryRow = document.querySelector(`.letter-row[data-i='${newi}']`)
  let newPrimaryBox = newPrimaryRow.querySelector(`.letter-box[data-j='${newj}']`) 
  newPrimaryBox.classList.add("primary-selection")

  if (rowMode) {
    for (let j=0; j<5; j++) {
      if (newj !== j && GRID[newi][j] !== '0') {
        let newSecondaryBox = newPrimaryRow.querySelector(`.letter-box[data-j='${j}']`)
        newSecondaryBox.classList.add("secondary-selection")
      }
    }
  } else {
    for (let i=0; i<5; i++) {
      if (newi !== i && GRID[i][newj] !== '0') {
        let newSecondaryRow = document.querySelector(`.letter-row[data-i='${i}']`)
        let newSecondaryBox = newSecondaryRow.querySelector(`.letter-box[data-j='${newj}']`)
        newSecondaryBox.classList.add("secondary-selection")
      }
    }
  }
  displayClue()
}

function displayClue() {
  const clueText = document.getElementById('clue-text')
  const primaryBox = document.getElementsByClassName("primary-selection")[0]
  const i = parseInt(primaryBox.parentNode.dataset.i)
  const j = parseInt(primaryBox.dataset.j)

  if (rowMode) {
    clueText.textContent = ACROSS_CLUES[i] || ''
  } else {
    clueText.textContent = DOWN_CLUES[j] || ''
  }
}

document.getElementById("keyboard-cont").addEventListener("click", (e) => {
  const target = e.target
  
  if (!target.classList.contains("keyboard-button")) {
      return
  }
  let key = target.id

  if (key === "Del") {
      key = "Backspace"
  } 

  document.dispatchEvent(new KeyboardEvent("keyup", {'key': key}))
})