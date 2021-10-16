'use strict'

function renderBoard(board, selector) {
  var strHTML = `<table oncontextmenu="return false" border="0"><tbody>`
  for (var i = 0; i < board.length; i++) {
    strHTML += `<tr>`
    for (var j = 0; j < board[0].length; j++) {
      var className = `cell cell-${i}-${j}`
      // TODO:
      // @CR: I would use different events. for exp:
      // onclick="cellClicked(...args)"
      // oncontextmenu="cellMarked(...args)"
      // more clean and detailed like that
      strHTML += `<td class="${className}" onmousedown="cellClicked(this,${i},${j},event)"></td>`
    }
    strHTML += `<tr>`
  }
  strHTML += `</tbody></table>`
  var elContainer = document.querySelector(selector)
  elContainer.innerHTML = strHTML
}

// Shows The board in the developer tools for debugging
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

function renderCell(pos, value) {
  var selector = getClassName(pos)
  var elCell = document.querySelector(`.${selector}`)
  elCell.innerHTML = value
}

function getClassName(pos) {
  var cellClass = 'cell-' + pos.i + '-' + pos.j
  return cellClass
}

// The maximum is inclusive and the minimum is inclusive
function getRandomInt(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1) + min)
}
