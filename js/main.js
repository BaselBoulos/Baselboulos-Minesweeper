'use strict'

const MINE = '💣'
const EMPTY = ' '

var gGame
var gLevel
var gBoard

gGame = { isOn: false, shownCount: 0, markedCount: 0, secsPassed: 0 }
gLevel = { SIZE: 4, MINES: 2 }

function initGame() {
  gBoard = buildBoard(gLevel.SIZE, gLevel.MINES)
  printMat(gBoard, '.board-container')
}

function buildBoard(size) {
  var board = []
  for (var i = 0; i < size; i++) {
    board.push([])
    for (var j = 0; j < size; j++) {
      board[i][j] = {
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: true,
      }
    }
  }
  // Example to check if working for a 9x9 board,
  // Seems to be working great!
  //   board[0][0].isMine = true
  //   board[0][0].isShown = true
  //   board[0][4].isMine = true
  //   board[0][4].isShown = true
  //   board[0][7].isMine = true
  //   board[0][7].isShown = true
  //   board[4][1].isMine = true
  //   board[4][1].isShown = true
  //   board[6][0].isMine = true
  //   board[6][0].isShown = true
  //   board[6][2].isMine = true
  //   board[6][2].isShown = true
  //   board[6][4].isMine = true
  //   board[6][4].isShown = true
  //   board[7][7].isMine = true
  //   board[7][7].isShown = true
  //   board[8][3].isMine = true
  //   board[8][3].isShown = true
  //   board[8][5].isMine = true
  //   board[8][5].isShown = true
  setMinesNegsCount(board)
  board = setMinesOnBoard(board)
  printBoard(board)
  return board
}

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

function cellClicked(elCell, i, j) {
  //   if (!gGame.isOn) return
  if (gBoard[i][j].minesAroundCount > 0) {
    var num = gBoard[i][j].minesAroundCount
    gBoard[i][j].isShown = true
    console.log(gBoard[i][j])
    elCell.innerHTML = num
  }
}

// TODO:
function cellMarked(elCell) {}

// TODO:
function checkGameOver() {}

// TODO:
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
  initGame()
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
