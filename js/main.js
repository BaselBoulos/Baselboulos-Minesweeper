'use strict'

const MINE = '💣'
const FLAG = '🚩'
const EMPTY = ' '
const DEFAULT_SMILEY = '😊'
const DEAD_SMILEY = '🥴'
const WINNER_SMILEY = '😎'

var gBoard
var gGame = { isOn: false, shownCount: 0, markedCount: 0, secsPassed: 0 }
var gLevel = { SIZE: 4, MINES: 2 }

var gFlagMinesCnt
var gLives
var gMinesPos = []
var isTimerOn
var gTimerInterval

function initGame() {
  gBoard = buildBoard(gLevel.SIZE, gLevel.MINES)
  gFlagMinesCnt = 0
  printMat(gBoard, '.board-container')
  gGame.markedCount = 0
  gGame.shownCount = 0
  gGame.secsPassed = 0
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

function cellClicked(elCell, i, j, event) {
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

  var cellPos = { i, j }
  // First click
  if (!gGame.shownCount) {
    // Model:
    gBoard[i][j].isShown = !gBoard[i][j].isShown
    // DOM:
    renderCell(cellPos, EMPTY)
    elCell.classList.add('revealed')
    gGame.shownCount++
    // First click is never a mine
    gBoard = setMinesOnBoard(gBoard, gLevel.MINES)
    setMinesNegsCount(gBoard)
    expandShown(gBoard, i, j)
    return
  }

  if (gBoard[i][j].isMine) {
    if (!gLives) gameOver()
    // Model:
    gBoard[i][j].isShown = !gBoard[i][j].isShown
    // DOM:
    renderCell(cellPos, MINE)
    elCell.classList.add('revealed', 'mine')
    gGame.shownCount++
    updateLives()
    return
  }

  var cellNegsCount = gBoard[i][j].minesAroundCount
  var cellVal = cellNegsCount > 0 ? cellNegsCount : EMPTY
  if (!cellNegsCount) expandShown(gBoard, i, j)
  // Model:
  gBoard[i][j].isShown = !gBoard[i][j].isShown
  // DOM:
  renderCell(cellPos, cellVal)
  elCell.classList.add('revealed')
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

function cellMarked(i, j) {
  var pos = { i, j }
  var currCell = gBoard[i][j]
  if (!currCell.isMarked) renderCell(pos, FLAG)
  else renderCell(pos, '')
  currCell.isMarked = !gBoard[i][j].isMarked
}

function updateLives() {
  if (!gLives) return
  gLives--
  renderSmiley(DEAD_SMILEY)
  var elLivesSpan = document.querySelector('.lives span')
  elLivesSpan.innerText = gLives
  var elIndicator = document.querySelector('.indicator')
  elIndicator.style.visibility = 'visible'
  gGame.isOn = !gGame.isOn
  setTimeout(() => {
    elIndicator.style.visibility = 'hidden'
    renderSmiley(DEFAULT_SMILEY)
    gGame.isOn = !gGame.isOn
    isVictory()
  }, 1000)
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
        var className = getClassName({ i, j })
        var elCell = document.querySelector(`.${className}`)
        elCell.classList.add('revealed')
        gGame.shownCount++
        var pos = { i, j }
        // Model:
        var cellNegsCount = board[i][j].minesAroundCount
        var cellVal = cellNegsCount > 0 ? cellNegsCount : EMPTY
        // DOM:
        renderCell(pos, cellVal)
        if (cellVal === EMPTY) {
          expandShown(board, pos.i, pos.j)
        }
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
  var negsCount = 0
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[0].length; j++) {
      negsCount = countMineNegs(i, j, board)
      board[i][j].minesAroundCount = negsCount
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

function gameOver() {
  for (var i = 0; i < gMinesPos.length; i++) {
    var currMinePos = gMinesPos[i]
    // Model:
    gBoard[currMinePos.i][currMinePos.j].isShown = true
    // DOM:
    renderCell(currMinePos, MINE)
  }
  gMinesPos = []
  openGameModal(false)
}

function isVictory() {
  var totalCells = gLevel.SIZE ** 2
  var playedCellsCount = gGame.shownCount + gFlagMinesCnt
  var isWinner = playedCellsCount === totalCells ? true : false
  if (!isWinner) return
  else openGameModal(isWinner)
}

function openGameModal(isWin) {
  gGame.isOn = !gGame.isOn
  clearInterval(gTimerInterval)
  if (gTimerInterval) gTimerInterval = null
  var elGameOverModal = document.querySelector('.game-modal')
  var elModalTxt = elGameOverModal.querySelector('p')
  elGameOverModal.style.display = 'block'
  elModalTxt.innerText = isWin ? 'VICTORY' : 'GAMEOVER'
  if (isWin) renderSmiley(WINNER_SMILEY)
  else renderSmiley(DEAD_SMILEY)
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

function resetGame() {
  gGame.isOn = !gGame.isOn
  clearInterval(gTimerInterval)
  if (gTimerInterval) gTimerInterval = null
  var elTimerSpan = document.querySelector('.timer span')
  elTimerSpan.innerText = '00:00:00'
  gLives = 3
  var elLivesSpan = document.querySelector('.lives span')
  elLivesSpan.innerText = gLives
  var elGameOverModal = document.querySelector('.game-modal')
  elGameOverModal.style.display = 'none'
  var elModalTxt = elGameOverModal.querySelector('p')
  elModalTxt.innerText = ''
  gMinesPos = []
  gGame.secsPassed = 0
  initGame()
}

function startTimer(startTime) {
  var elTimerSpan = document.querySelector('.timer span')
  gTimerInterval = setInterval(() => {
    var totalSecs = Math.floor((Date.now() - startTime) / 1000)
    var hour = Math.floor(totalSecs / 3600)
    var minute = Math.floor((totalSecs - hour * 3600) / 60)
    var seconds = totalSecs - (hour * 3600 + minute * 60)
    if (hour < 10) hour = '0' + hour
    if (minute < 10) minute = '0' + minute
    if (seconds < 10) seconds = '0' + seconds
    elTimerSpan.innerHTML = `${hour}:${minute}:${seconds}`
    gGame.secsPassed++
  }, 1000)
}

function renderCell(pos, value) {
  var elCell = document.querySelector(`.cell-${pos.i}-${pos.j}`)
  elCell.innerHTML = value
}

function renderSmiley(smiley) {
  var elGameController = document.querySelector('.game-controller')
  elGameController.innerHTML = `<span class="smiley" onclick="resetGame()">${smiley}</span>`
}
