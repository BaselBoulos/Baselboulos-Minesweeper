// function getNumOfMines() {
//   switch (gGameMode) {
//     case 'Easy':
//       return 2
//     case 'Medium':
//       return 12
//     case 'Hard':
//       return 30
//     default:
//       return 2
//   }
// }

// function getBoardSize() {
//   switch (gGameMode) {
//     case 'Easy':
//       return 4
//     case 'Medium':
//       return 8
//     case 'Hard':
//       return 12
//     default:
//       return 4
//   }
// }

// function initGame() {
//   //   gBoardSize = getBoardSize()
//   gBoardSize = gLevel.SIZE
//   // gNumOfMines = getNumOfMines()
//   gNumOfMines = gLevel.MINES
//   gBoard = buildBoard(gBoardSize, gNumOfMines)
//   printMat(gBoard, '.board-container')
// }

function setMines(board, minesCount) {
  for (var i = 0; i < minesCount; i++) {
    var emptyCells = getEmptyCells(board)
    var pos = getRandomInt(0, emptyCells.length - 1)
    console.log(pos)
    var minePos = emptyCells[pos]
    board[minePos.i][minePos.j] = MINE
  }
  return board
}

function getEmptyCells(board) {
  var emptyCells = []
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[0].length; j++) {
      console.log(board[i][j])
      if (board[i][j] === EMPTY) {
        emptyCells.push({ i: i, j: j })
      }
    }
  }
  return emptyCells
}

// pos such as: {i: 2, j: 7}
function renderCell(pos, value) {
  // Select the elCell and set the value
  var elCell = document.querySelector(`.cell${pos.i}-${pos.j}`)
  elCell.innerHTML = value
}

// Returns the class name for a specific cell
function getClassName(pos) {
  var cellClass = 'cell-' + pos.i + '-' + pos.j
  return cellClass
}
