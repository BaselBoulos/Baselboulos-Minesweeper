'use strict'

/*

TODOs:

- Save the seconds in the gGame object, don't forget to reset when reseting the game and init
- Make modals divs for WIN/LOSE/LIVES..Etc

-Ideas-
- probably can make isWin property in the gGame object..and do something with it to check winning
- Check all the guidelines and read the PDF again
- Can do something with the levels, maybe 1 object for each level in gLevel ? instead of setMode or something

*/

const MINE = '💣'
const FLAG = '🚩'
const EMPTY = '🗅'
const DEFAULT_SMILEY = '😊'
const DEAD_SMILEY = '🥴'
const WINNER_SMILEY = '😎'

var gGame = { isOn: false, shownCount: 0, markedCount: 0, secsPassed: 0 }
var gLevel = { SIZE: 4, MINES: 2 }
var gBoard

var gFlagMinesCnt
var isTimerOn
var gTimerInterval
var gLives
var gMinesPos = []

function initGame() {
  gBoard = buildBoard(gLevel.SIZE, gLevel.MINES)
  gFlagMinesCnt = 0
  printMat(gBoard, '.board-container')
  gGame.markedCount = 0
  gGame.shownCount = 0
  gLives = 3
  gMinesPos = []
  isTimerOn = false
  renderSmiley(DEFAULT_SMILEY)
  gGame.isOn = true
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
        isMarked: false,
      }
    }
  }
  return board
}

function cellClicked(i, j, event) {
  if (!gGame.isOn) return
  if (gBoard[i][j].isShown) return
  if (!isTimerOn) {
    startTimer(Date.now())
    isTimerOn = !isTimerOn
  }
  if (event.button === 2) {
    handleRightClick(i, j)
    return
  }
  if (gBoard[i][j].isMarked) return

  var pos = { i, j }
  if (!gGame.shownCount) {
    gBoard[i][j].isShown = true
    renderCell(pos, EMPTY)
    gGame.shownCount++
    // printBoard(gBoard)
    gBoard = setMinesOnBoard(gBoard, gLevel.MINES)
    setMinesNegsCount(gBoard)
    // printBoard(gBoard)
    expandShown(gBoard, i, j)
    return
  }

  if (gBoard[i][j].isMine) {
    if (gLives) {
      gBoard[i][j].isShown = true
      renderCell(pos, MINE)
      gGame.shownCount++
      renderSmiley(DEAD_SMILEY)
      gLives--
    } else {
      gameOver()
    }
    isVictory()
    return
  }

  var cellNegsCount = gBoard[i][j].minesAroundCount
  var cellVal = cellNegsCount > 0 ? cellNegsCount : EMPTY
  if (!cellNegsCount) expandShown(gBoard, i, j)
  gBoard[i][j].isShown = true
  renderCell(pos, cellVal)
  renderSmiley(DEFAULT_SMILEY)
  gGame.shownCount++
  isVictory()
}

function handleRightClick(i, j) {
  cellMarked(i, j)
  var currCell = gBoard[i][j]
  gGame.markedCount = currCell.isMarked
    ? gGame.markedCount + 1
    : gGame.markedCount - 1
  if (currCell.isMarked) isVictory()
  if (currCell.isMine) {
    gFlagMinesCnt = currCell.isMarked ? gFlagMinesCnt + 1 : gFlagMinesCnt - 1
  }
}

function expandShown(board, cellI, cellJ) {
  for (var i = cellI - 1; i <= cellI + 1; i++) {
    if (i < 0 || i >= board.length) continue
    for (var j = cellJ - 1; j <= cellJ + 1; j++) {
      if (i === cellI && j === cellJ) continue
      if (j < 0 || j >= board[i].length) continue
      if (
        !board[i][j].isMarked &&
        !board[i][j].isShown &&
        !board[i][j].isMine
      ) {
        board[i][j].isShown = !board[i][j].isShown
        gGame.shownCount++
        var pos = { i, j }
        var cellNegsCount = board[i][j].minesAroundCount
        var cellVal = cellNegsCount > 0 ? cellNegsCount : EMPTY
        renderCell(pos, cellVal)
      }
    }
  }
}

function setMinesOnBoard(board, minesCount) {
  for (var i = 0; i < minesCount; i++) {
    var pos = getRandNonMinePos(board)
    gMinesPos.push(pos)
    board[pos.i][pos.j].isMine = !board[pos.i][pos.j].isMine
    if (board[pos.i][pos.j].isMarked) gFlagMinesCnt++
  }
  return board
}

function getRandNonMinePos(board) {
  var nonMineCells = []
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[0].length; j++) {
      if (!board[i][j].isMine && !board[i][j].isShown)
        nonMineCells.push({ i: i, j: j })
    }
  }
  if (!nonMineCells.length) return
  var randIdx = getRandomInt(0, nonMineCells.length - 1)
  var randCellPos = nonMineCells[randIdx]
  return randCellPos
}

function setMinesNegsCount(board) {
  var mineNegsCount = 0
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board.length[0]; j++) {
      mineNegsCount = countMineNegs(i, j, board)
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

function cellMarked(cellI, cellJ) {
  var pos = { i: cellI, j: cellJ }
  var currCell = gBoard[cellI][cellJ]
  if (!currCell.isMarked) renderCell(pos, FLAG)
  else renderCell(pos, '')
  currCell.isMarked = !gBoard[cellI][cellJ].isMarked
}

function resetGame() {
  var timer = document.querySelector('.timer')
  timer.innerText = '00:00:00'
  clearInterval(gTimerInterval)
  if (gTimerInterval) gTimerInterval = null
  isTimerOn = !isTimerOn
  gMinesPos = []
  initGame()
}

function gameOver() {
  for (var i = 0; i < gMinesPos.length; i++) {
    var currMinePos = gMinesPos[i]
    gBoard[currMinePos.i][currMinePos.j].isShown = true
    renderCell(currMinePos, MINE)
  }
  gMinesPos = []
  gGame.isOn = false
  clearInterval(gTimerInterval)
  if (gTimerInterval) gTimerInterval = null
  renderSmiley(DEAD_SMILEY)
  console.log('You lost..Make a modal here.')
}

function isVictory() {
  var totalCells = gLevel.SIZE ** 2
  var playedCellsCount = gGame.shownCount + gFlagMinesCnt
  var isWinner = playedCellsCount === totalCells ? true : false
  if (!isWinner) return
  clearInterval(gTimerInterval)
  if (gTimerInterval) gTimerInterval = null
  gGame.isOn = false
  renderSmiley(WINNER_SMILEY)
  console.log('You are a Winner make a modal')
}

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

function renderCell(pos, value) {
  var elCell = document.querySelector(`.cell${pos.i}-${pos.j}`)
  elCell.innerHTML = value
}

function renderSmiley(smiley) {
  var elMainContainer = document.querySelector('.game-controller')
  elMainContainer.innerHTML = `<span class="smiley" onclick="resetGame()">${smiley}</span>`
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
