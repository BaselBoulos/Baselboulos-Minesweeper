'use strict'

const MINE = '💣'
const FLAG = '🚩'
const EMPTY = ' '

var gBoard
var gMinesPos = []

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
  if (!gGame.isTimerOn) {
    startTimer(Date.now())
    gGame.isTimerOn = !gGame.isTimerOn
  }
  // TODO:
  // @CR: look cr in utils.js line 7
  if (event.button === 2) {
    if (gGame.isHintMode)
      handleElIndicator(
        'visible',
        'red',
        'CANNOT DO THIS\nYOU ARE ON HINT MODE'
      )
    else handleRightClick(i, j)
    return
  }
  if (gBoard[i][j].isMarked) return
  if (gGame.isHintMode) {
    cellClickedHintMode(i, j)
    return
  }
  var cellPos = { i, j }
  // First click
  if (!gGame.shownCount) {
    // Model:
    gBoard[i][j].isShown = !gBoard[i][j].isShown
    // DOM:
    renderCell(cellPos, EMPTY)
    elCell.classList.toggle('revealed')
    gGame.shownCount++
    // First click is never a mine
    gBoard = setMinesOnBoard(gBoard, gGame.level.MINES)
    setMinesNegsCount(gBoard)
    expandShown(gBoard, i, j)
    printBoard(gBoard)
    return
  }
  if (gBoard[i][j].isMine) {
    if (!gGame.livesCount) gameOver()
    // Model:
    gBoard[i][j].isShown = !gBoard[i][j].isShown
    // DOM:
    renderCell(cellPos, MINE)
    elCell.classList.toggle('revealed')
    elCell.classList.toggle('mine')
    gGame.shownCount++
    updateLives()
    return
  }
  var cellNegsCount = gBoard[i][j].minesAroundCount
  var cellVal = cellNegsCount > 0 ? cellNegsCount : EMPTY
  if (cellNegsCount) {
    // Model:
    gBoard[i][j].isShown = !gBoard[i][j].isShown
    // DOM:
    renderCell(cellPos, cellVal)
    elCell.classList.toggle('revealed')
    gGame.shownCount++
  } else {
    expandShown(gBoard, i, j)
  }
  checkVictory()
}

function handleRightClick(i, j) {
  cellMarked(i, j)
  var currCell = gBoard[i][j]
  gGame.markedCount = currCell.isMarked
    ? gGame.markedCount + 1
    : gGame.markedCount - 1
  if (currCell.isMine) {
    gGame.flaggedMinesCount = currCell.isMarked
      ? gGame.flaggedMinesCount + 1
      : gGame.flaggedMinesCount - 1
  }
  checkVictory()
}

function cellMarked(i, j) {
  var pos = { i, j }
  var currCell = gBoard[i][j]
  if (!currCell.isMarked) renderCell(pos, FLAG)
  else renderCell(pos, '')
  currCell.isMarked = !gBoard[i][j].isMarked
}

function expandShown(board, cellI, cellJ) {
  for (var i = cellI - 1; i <= cellI + 1; i++) {
    if (i < 0 || i >= board.length) continue
    for (var j = cellJ - 1; j <= cellJ + 1; j++) {
      // if (i === cellI && j === cellJ) continue
      if (j < 0 || j >= board[i].length) continue
      if (
        !board[i][j].isMarked &&
        !board[i][j].isShown &&
        !board[i][j].isMine
      ) {
        board[i][j].isShown = !board[i][j].isShown
        var className = getClassName({ i, j })
        var elCell = document.querySelector(`.${className}`)
        elCell.classList.toggle('revealed')
        gGame.shownCount++
        var pos = { i, j }
        // Model:
        var cellNegsCount = board[i][j].minesAroundCount
        var cellVal = cellNegsCount > 0 ? cellNegsCount : EMPTY
        // DOM:
        renderCell(pos, cellVal)
        if (!cellNegsCount) {
          expandShown(board, pos.i, pos.j)
        }
      }
    }
  }
}

function setMinesOnBoard(board, minesCount) {
  for (var i = 0; i < minesCount; i++) {
    var pos = getEmptyLocations(board)
    gMinesPos.push(pos)
    var cell = board[pos.i][pos.j]
    cell.isMine = !cell.isMine
    if (cell.isMarked && cell.isMine) gGame.flaggedMinesCount++
  }
  return board
}

function getEmptyLocations(board) {
  var nonMineCells = []
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[0].length; j++) {
      if (!board[i][j].isMine && !board[i][j].isShown)
        nonMineCells.push({ i: i, j: j })
    }
  }
  if (!nonMineCells.length) return false
  var randIdx = getRandomInt(0, nonMineCells.length - 1)
  var randCellPos = nonMineCells[randIdx]
  return randCellPos
}

function setMinesNegsCount(board) {
  var negsCount = 0
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[0].length; j++) {
      negsCount = countMineNegs(i, j, board)
      if (board[i][j].isShown) continue
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

function cellClickedHintMode(i, j) {
  gGame.isOn = !gGame.isOn
  var hintCells = getNegsPos(i, j, gBoard)
  for (var i = 0; i < hintCells.length; i++) {
    var cellPos = hintCells[i]
    var selector = '.' + getClassName(cellPos)
    var elCurrCell = document.querySelector(selector)
    var currCell = gBoard[cellPos.i][cellPos.j]
    if (currCell.isMine) {
      renderCell(cellPos, MINE)
      elCurrCell.classList.toggle('mine')
    }
    if (!currCell.isMine) {
      if (currCell.minesAroundCount > 0)
        renderCell(cellPos, currCell.minesAroundCount)
      else renderCell(cellPos, EMPTY)
    }
    elCurrCell.classList.toggle('revealed')
  }
  setTimeout(() => {
    for (var i = 0; i < hintCells.length; i++) {
      var cellPos = hintCells[i]
      var selector = '.' + getClassName(cellPos)
      var elCurrCell = document.querySelector(selector)
      var currCell = gBoard[cellPos.i][cellPos.j]
      renderCell(cellPos, EMPTY)
      if (currCell.isMine) elCurrCell.classList.toggle('mine')
      elCurrCell.classList.toggle('revealed')
      gCurrHintId = null
      gGame.isHintMode = false
    }
    gGame.isOn = !gGame.isOn
  }, 1000)

  var elCurrHint = document.querySelector(`[data-hint="${gCurrHintId}"]`)
  elCurrHint.innerText = ''
  handleElIndicator('hidden', 'red', '')
  gGame.isHintMode = !gGame.isHintMode
}

function getNegsPos(cellI, cellJ, board) {
  var negsPosToShow = [] // cells we want to show for a second
  for (var i = cellI - 1; i <= cellI + 1; i++) {
    if (i < 0 || i >= board.length) continue
    for (var j = cellJ - 1; j <= cellJ + 1; j++) {
      // if (i === cellI && j === cellJ) continue
      if (j < 0 || j >= board[i].length) continue
      if (!board[i][j].isShown && !board[i][j].isMarked) {
        negsPosToShow.push({ i, j })
      }
    }
  }
  return negsPosToShow
}

function handleHintMode(elHint) {
  if (gGame.isHintMode && elHint.dataset.hint !== gCurrHintId) return
  if (!gGame.shownCount) {
    handleElIndicator(
      'visible',
      'red',
      'YOU CAN ONLY USE HINT\n AFTER FIRST LEFT CLICK ON BOARD'
    )
    gGame.isOn = !gGame.isOn
    setTimeout(() => {
      handleElIndicator('hidden', 'red', '')
      gGame.isOn = !gGame.isOn
    }, 1000)
    return
  }
  if (!gGame.isHintMode && gCurrHintId === null) {
    gCurrHintId = elHint.dataset.hint
    gGame.isHintMode = !gGame.isHintMode
    elHint.style.transform = 'rotate(90deg)'
    handleElIndicator('visible', 'yellow', 'HINT MODE: ON')
    return
  }
  if (gGame.isHintMode && gCurrHintId === elHint.dataset.hint) {
    gCurrHintId = null
    gGame.isHintMode = !gGame.isHintMode
    elHint.style.transform = 'rotate(0deg)'
    handleElIndicator('hidden', 'red', '')
    return
  }
}

function safeClick() {
  if (gGame.isSafeMode || !gGame.safeClicksCount) return
  if (!gGame.shownCount) {
    handleElIndicator(
      'visible',
      'red',
      'YOU CAN ONLY USE SAFE CLICK AFTER FIRST CLICK'
    )
    gGame.isOn = !gGame.isOn
    setTimeout(() => {
      handleElIndicator('hidden', 'red', '')
      gGame.isOn = !gGame.isOn
    }, 1000)
    return
  }
  var cellPos = getEmptyLocations(gBoard)
  if (!cellPos) {
    var elSafeClickBtn = document.querySelector('.safeclick-btn')
    elSafeClickBtn.style.opacity = '0.3'
    handleElIndicator('visible', 'red', 'NO SAFE CELLS AVAILABLE')
    return
  }
  gGame.isOn = !gGame.isOn
  gGame.safeClicksCount--
  var elSafeClickBtnTxt = document.querySelector('.safeclick-btn span span')
  elSafeClickBtnTxt.innerText = `${gGame.safeClicksCount}`
  gGame.isSafeMode = !gGame.isSafeMode
  var selector = '.' + getClassName(cellPos)
  var elCurrCell = document.querySelector(selector)
  elCurrCell.classList.toggle('safe')
  setTimeout(() => {
    elCurrCell.classList.toggle('safe')
    gGame.isSafeMode = !gGame.isSafeMode
    gGame.isOn = !gGame.isOn
  }, 1000)
  if (!gGame.safeClicksCount) {
    var elSafeClickBtn = document.querySelector('.safeclick-btn')
    elSafeClickBtn.style.opacity = '0.3'
  }
}
