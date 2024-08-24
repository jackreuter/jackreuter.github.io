import { PUZZLE } from "./puzzle.js"
import confetti from 'https://cdn.skypack.dev/canvas-confetti'

const GRID = PUZZLE['grid']
const ANSWERS = PUZZLE['answers'] // Assuming the answer key is an array of strings
const TOTAL_ANSWERS = ANSWERS.length

let currentString = ""
let isDragging = false
let previousElement = null
let selectedCoordinates = []
let completedAnswers = []
let lines = [] // To keep track of the drawn lines

function initBoard() {
  let board = document.getElementById("game-board")

  for (let i = 0; i < 8; i++) {
    let row = document.createElement("div")
    row.className = "letter-row"
    row.dataset.i = i

    for (let j = 0; j < 6; j++) {
      let box = document.createElement("div")
      box.className = "letter-box"
      box.dataset.j = j

      let letterCircle = document.createElement("div")
      letterCircle.className = "letter-circle"
      letterCircle.dataset.i = i
      letterCircle.dataset.j = j

      let innerCircle = document.createElement("div")
      innerCircle.className = "inner-circle"
      innerCircle.textContent = GRID[i][j]

      letterCircle.appendChild(innerCircle)
      box.appendChild(letterCircle)
      row.appendChild(box)
    }

    board.appendChild(row)
  }

  // Event delegation for mouse and touch events
  board.addEventListener("mousedown", (event) => {
    const target = event.target.closest(".letter-circle");
    if (target && board.contains(target)) {
      startDragging(event, target);
    }
  });

  board.addEventListener("mouseover", (event) => {
    const target = event.target.closest(".letter-circle");
    if (target && board.contains(target)) {
      addLetter(event, target);
    }
  });

  board.addEventListener("touchstart", (event) => {
    const target = event.target.closest(".letter-circle");
    if (target && board.contains(target)) {
      startDragging(event, target);
    }
  }, { passive: false });

  board.addEventListener("touchmove", (event) => {
    const touchEvent = event.touches[0];
    const target = document.elementFromPoint(touchEvent.clientX, touchEvent.clientY);
    if (target && target.closest(".letter-circle") && board.contains(target)) {
      addLetter(event, target.closest(".letter-circle"));
    }
  }, { passive: true });

  // Mouse events
  document.addEventListener("mouseup", stopDragging)
  document.addEventListener("mousemove", onMouseMove)

  // Touch events
  document.addEventListener("touchend", stopDragging, { passive: true })
  document.addEventListener("touchmove", onTouchMove, { passive: true })

  updateProgressIndicator()
}

function startDragging(event, target) {
  const innerCircle = target.childNodes[0]
  if (innerCircle.classList.contains('used')) { return }

  event.preventDefault() // Prevents the default drag behavior
  isDragging = true
  const i = target.dataset.i
  const j = target.dataset.j
  currentString = target.textContent
  updateCurrentString(currentString)
  target.childNodes[0].style.backgroundColor = 'aqua'
  previousElement = target
  selectedCoordinates.push(`${i},${j}`)
}

function addLetter(event, target) {
  if (isDragging) {
    const i = target.dataset.i
    const j = target.dataset.j
    const coordinates = `${i},${j}`
    if (!selectedCoordinates.includes(coordinates)) {
      const innerCircle = target.childNodes[0]
      if (innerCircle.classList.contains('used')) { return }

      const [prevI, prevJ] = selectedCoordinates[selectedCoordinates.length - 1].split(',').map(Number)
      if (Math.abs(i - prevI) > 1 || Math.abs(j - prevJ) > 1) { return }

      const letter = innerCircle.textContent
      currentString += letter
      updateCurrentString(currentString)
      innerCircle.style.backgroundColor = 'aqua'
      drawLine(previousElement, target)
      previousElement = target
      selectedCoordinates.push(coordinates)
    }
  }
}

function stopDragging(event) {
  if (isDragging) {
    isDragging = false
    const possibleAnswer = selectedCoordinates.join(':')
    if (ANSWERS.includes(possibleAnswer) && !completedAnswers.includes(possibleAnswer)) {
      const isFirstAnswer = possibleAnswer === ANSWERS[0]
      const bgColor = isFirstAnswer ? 'yellow' : 'aqua'
      if (isFirstAnswer) {
        toastr.success('Spangram!')
      }

      completedAnswers.push(possibleAnswer)
      selectedCoordinates.forEach(coord => {
        let [i, j] = coord.split(',')
        let box = document.querySelector(`[data-i="${i}"] [data-j="${j}"] .letter-circle .inner-circle`)
        box.classList.add('used')
        box.parentNode.removeEventListener("mousedown", startDragging)
        box.parentNode.removeEventListener("mouseover", addLetter)
        box.parentNode.removeEventListener("touchstart", startDragging)
        box.parentNode.removeEventListener("touchmove", addLetter)
        box.style.backgroundColor = bgColor
      })
      lines.forEach(line => line.style.backgroundColor = bgColor)
      updateProgressIndicator()
      currentString = ""
    } else {
      selectedCoordinates.forEach(coord => {
        let [i, j] = coord.split(',')
        let box = document.querySelector(`[data-i="${i}"] [data-j="${j}"] .letter-circle .inner-circle`)
        box.style.backgroundColor = '' // Reset background color if not correct
      })
      // Remove lines if the string is not correct
      lines.forEach(line => line.remove())
      currentString = ""
      updateCurrentString("Not in word list")
    }
    previousElement = null
    selectedCoordinates = []
    lines = [] // Reset the lines array
  }
}

function updateProgressIndicator() {
  const progressIndicator = document.querySelector(".progress-indicator");
  const completedCount = `<span class="bold-number">${completedAnswers.length}</span>`;
  const totalCount = `<span class="bold-number">${TOTAL_ANSWERS}</span>`;
  progressIndicator.innerHTML = `${completedCount} of ${totalCount} theme words found`;

  if (completedCount === totalCount) {
    toastr.success("You win!")
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    })
  }
}

function updateCurrentString(newString) {
  const currenStringDiv = document.querySelector(".current-string")
  currenStringDiv.textContent = newString
}

function onMouseMove(event) {
  if (isDragging) {
    const element = document.elementFromPoint(event.clientX, event.clientY)
    if (element && element.closest(".letter-circle")) {
      addLetter(event, element.closest(".letter-circle"))
    }
  }
}

function onTouchMove(event) {
  if (isDragging) {
    const touchEvent = event.touches[0]
    if (Number.isFinite(touchEvent.clientX) && Number.isFinite(touchEvent.clientY)) {
      const element = document.elementFromPoint(touchEvent.clientX, touchEvent.clientY)
      if (element && element.closest(".letter-circle")) {
        addLetter(event, element.closest(".letter-circle"))
      }
    }
  }
}

function drawLine(startElement, endElement) {
  const board = document.getElementById("game-board")
  const line = document.createElement("div")
  line.className = "line"

  const startRect = startElement.getBoundingClientRect()
  const endRect = endElement.getBoundingClientRect()
  const lineWeight = 10

  const scrollX = window.scrollX || window.pageXOffset;
  const scrollY = window.scrollY || window.pageYOffset;

  let x1 = Math.round(startRect.left + (startRect.width / 2)) + scrollX
  let y1 = Math.round(startRect.top + (startRect.height / 2)) + scrollY
  let x2 = Math.round(endRect.left + (endRect.width / 2)) + scrollX
  let y2 = Math.round(endRect.top + (endRect.height / 2)) + scrollY

  // Adjust coordinates based on direction
  if (x2 > x1 || y2 > y1) {
    x1 += lineWeight / 2
    x2 += lineWeight / 2
    y1 -= lineWeight / 2
    y2 -= lineWeight / 2
  } else {
    x1 -= lineWeight / 2
    x2 -= lineWeight / 2
    y1 += lineWeight / 2
    y2 += lineWeight / 2
  }

  const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
  const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI)

  line.style.width = `${length}px`
  line.style.transform = `rotate(${angle}deg)`
  line.style.position = "absolute"
  line.style.top = `${y1}px`
  line.style.left = `${x1}px`
  line.style.transformOrigin = "0 0"
  line.style.backgroundColor = "aqua"
  line.style.height = "10px"  // Increase the width of the line

  board.appendChild(line)
  lines.push(line) // Add the line to the lines array
}

initBoard()
