'use strict'

const MINE = '💣'
const FLAG = '🚩'
const EMPTY = '🗅'

var gGame
var gLevel
var gBoard
var isTimerOn = false
var gTimerInterval
var gFlaggedMinesCount = 0

gGame = { isOn: false, shownCount: 0, markedCount: 0, secsPassed: 0 }
gLevel = { SIZE: 4, MINES: 2 }

// This is called when page loads
function initGame() {
  gBoard = buildBoard(gLevel.SIZE, gLevel.MINES)
  gGame.isOn = true
  printMat(gBoard, '.board-container')
}

// Builds the board Set mines at random locations Call setMinesNegsCount() Return the created board
function buildBoard(size) {
  var board = []
  for (var i = 0; i < size; i++) {
    board.push([])
    for (var j = 0; j < size; j++) {
      board[i][j] = {
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false,
      }
    }
  }
  board = setMinesOnBoard(board)
  setMinesNegsCount(board)
  printBoard(board)
  return board
}

// Count mines around each cell and set the cell's minesAroundCount.
function setMinesOnBoard(board) {
  for (var i = 0; i < gLevel.MINES; i++) {
    var pos = getRandPos(board)
    board[pos.i][pos.j].isMine = true
  }
  return board
}

function getRandPos(board) {
  var nonMineCells = getNonMinesCells(board)
  if (!nonMineCells.length) return
  var randIdx = getRandomInt(0, nonMineCells.length - 1)
  var randPos = nonMineCells[randIdx]
  return randPos
}

function getNonMinesCells(board) {
  var nonMineCells = []
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[0].length; j++) {
      if (!board[i][j].isMine) {
        nonMineCells.push({ i: i, j: j })
      }
    }
  }
  return nonMineCells
}

function setMinesNegsCount(board) {
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board.length; j++) {
      var mineNegsCount = countMineNegs(i, j, board)
      board[i][j].minesAroundCount = mineNegsCount
    }
  }
}

function countMineNegs(cellI, cellJ, board) {
  var mineNegsCount = 0
  for (var i = cellI - 1; i <= cellI + 1; i++) {
    if (i < 0 || i >= board.length) continue
    for (var j = cellJ - 1; j <= cellJ + 1; j++) {
      if (i === cellI && j === cellJ) continue
      if (j < 0 || j >= board[i].length) continue
      if (board[i][j].isMine) mineNegsCount++
    }
  }
  return mineNegsCount
}

// Called when a cell (td) is clicked
function cellClicked(elCell, i, j, event) {
  if (!gGame.isOn) return
  if (gBoard[i][j].isShown) return

  var pos = { i, j }

  if (!isTimerOn) {
    startTimer(Date.now())
    isTimerOn = !isTimerOn
  }

  // Right click stuff
  if (event.button === 2) {
    cellMarked(elCell, i, j)
    return
  }

  // If flagged and we try to left click..
  if (gBoard[i][j].isMarked) return

  // Left click stuff
  if (gBoard[i][j].isMine) {
    gBoard[i][j].isShown = true
    renderCell(pos, MINE)
    gameOver()
    return
  }
  if (!gBoard[i][j].minesAroundCount) {
    gBoard[i][j].isShown = true
    renderCell(pos, EMPTY)
  } else if (gBoard[i][j].minesAroundCount > 0) {
    var minesAroundCnt = gBoard[i][j].minesAroundCount
    gBoard[i][j].isShown = true
    renderCell(pos, minesAroundCnt)
  }

  isVictory()
}

function resetGame() {
  var timer = document.querySelector('.timer')
  timer.innerText = '00:00:00'
  clearInterval(gTimerInterval)
  gTimerInterval = null
  initGame()
}

/*
Called on right click to mark a cell that is suspected to be a mine
*/
function cellMarked(elCell, i, j) {
  var pos = { i, j }
  if (!gBoard[i][j].isMarked) {
    renderCell(pos, FLAG)
    gFlaggedMinesCount = gBoard[i][j].isMine
      ? gFlaggedMinesCount + 1
      : gFlaggedMinesCount
  } else {
    renderCell(pos, '')
    gFlaggedMinesCount = gBoard[i][j].isMine
      ? gFlaggedMinesCount - 1
      : gFlaggedMinesCount
  }
  gBoard[i][j].isMarked = !gBoard[i][j].isMarked
}

function renderCell(pos, value) {
  var elCell = document.querySelector(`.cell${pos.i}-${pos.j}`)
  elCell.innerHTML = value
}

function gameOver() {
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard.length; j++) {
      var cell = gBoard[i][j]
      var pos = { i, j }
      if (cell.isMine) renderCell(pos, MINE)
    }
    gGame.isOn = false
    clearInterval(gTimerInterval)
    gTimerInterval = null
  }
}

function isVictory() {
  var totalCells = gLevel.SIZE ** 2
  var revealedCellsCnt = 0
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard.length; j++) {
      var cell = gBoard[i][j]
      if (!cell.isMine && cell.isShown) {
        revealedCellsCnt++
      }
    }
  }
  var playedCellsCount = revealedCellsCnt + gFlaggedMinesCount
  var isWinner = playedCellsCount === totalCells ? true : false
  if (isWinner) {
    console.log('You are a Winner')
    gGame.isOn = false
    clearInterval(gTimerInterval)
    gTimerInterval = null
  } else {
    console.log('not a winner yet')
  }
}

/*
When user clicks a cell with no mines around, we need to open not only that cell, but also its neighbors.
NOTE: start with a basic implementation that only opens the non-mine 1st degree neighbors 
BONUS: if you have the time later, try to work more like the real algorithm (see description at the Bonuses section below)
*/
function expandShown(board, elCell, i, j) {}

function setMode(elMode) {
  switch (elMode.dataset.level) {
    case 'Beginner':
      gLevel.SIZE = 4
      gLevel.MINES = 2
      break
    case 'Medium':
      gLevel.SIZE = 8
      gLevel.MINES = 12
      break
    case 'Expert':
      gLevel.SIZE = 12
      gLevel.MINES = 30
      break
    default:
      gLevel.SIZE = 4
      gLevel.MINES = 2
      break
  }
  resetGame()
}

function startTimer(startTime) {
  var elTimer = document.querySelector('.timer')
  gTimerInterval = setInterval(() => {
    var totalSecs = Math.floor((Date.now() - startTime) / 1000)
    var hour = Math.floor(totalSecs / 3600)
    var minute = Math.floor((totalSecs - hour * 3600) / 60)
    var seconds = totalSecs - (hour * 3600 + minute * 60)
    if (hour < 10) hour = '0' + hour
    if (minute < 10) minute = '0' + minute
    if (seconds < 10) seconds = '0' + seconds
    elTimer.innerHTML = `${hour}:${minute}:${seconds}`
  }, 1000)
}

// Currently only used for debugging
function printBoard(board) {
  var printedBoard = []
  for (var i = 0; i < board.length; i++) {
    printedBoard[i] = []
    for (var j = 0; j < board.length; j++) {
      var currCell = board[i][j]
      var isMine = currCell.isMine ? true : false
      printedBoard[i][j] = isMine ? MINE : currCell.minesAroundCount
    }
  }
  console.table(printedBoard)
}
