import { PUZZLE } from "./puzzle.js";

const GRID = PUZZLE['grid']

let currentString = "";
let isDragging = false;

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

      box.textContent = GRID[i][j]

      box.addEventListener("mousedown", startDragging);
      box.addEventListener("mouseenter", addLetter);
      row.appendChild(box)
    }

    board.appendChild(row)
  }

  document.addEventListener("mouseup", stopDragging);
  document.addEventListener("mousemove", onMouseMove);
}

function startDragging(event) {
  event.preventDefault(); // Prevents the default drag behavior
  isDragging = true;
  currentString = event.target.textContent;
  console.log("Started dragging:", currentString);
}

function addLetter(event) {
  if (isDragging) {
    currentString += event.target.textContent;
    console.log("Current string:", currentString);
  }
}

function stopDragging(event) {
  if (isDragging) {
    isDragging = false;
    console.log("Final string:", currentString);
  }
}

function onMouseMove(event) {
  if (isDragging) {
    const element = document.elementFromPoint(event.clientX, event.clientY);
    if (element && element.classList.contains('letter-box')) {
      addLetter({ target: element });
    }
  }
}

initBoard()
