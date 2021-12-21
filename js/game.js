'use strict'

const DEFAULT_SMILEY = '😊'
const DEAD_SMILEY = '🥴'
const WINNER_SMILEY = '😎'
const HINT = '💡'

var gGame  = {
  isOn: false,
  shownCount: 0,
  markedCount: 0,
  secsPassed: 0,
  isHintMode: false,
  isSafeMode: false,
  isTimerOn: false,
  level: { SIZE: 4, MINES: 2 },
  livesCount: 3,
  safeClicksCount: 3,
  hintsCount: 3,
  flaggedMinesCount: 0
}
var gTimerInterval
var gCurrHintId

function initGame() {
	gBoard = buildBoard(gGame.level.SIZE, gGame.level.MINES)
	gGame.flaggedMinesCount = 0
	renderBoard(gBoard, '.board-container')
	gGame.markedCount = 0
	gGame.shownCount = 0
	gGame.secsPassed = 0
	gGame.livesCount = 3
	var elLivesSpan = document.querySelector('.lives span')
	elLivesSpan.innerText = gGame.livesCount
	gMinesPos = []
	gGame.isTimerOn = false
	renderSmiley(DEFAULT_SMILEY)
	gGame.hintsCount = 3
	gCurrHintId = null
	gGame.isHintMode = false
	renderHints()
	gGame.safeClicksCount = 3
	var elSafeClickBtnTxt = document.querySelector('.safeclick-btn span span')
	elSafeClickBtnTxt.innerText = `${gGame.safeClicksCount}`
	gGame.isSafeMode = false
	renderBestScore()
	gGame.isOn = true
}

function resetGame() {
  gGame.isOn = !gGame.isOn
	clearInterval(gTimerInterval)
	if (gTimerInterval) gTimerInterval = null
	var elTimerSpan = document.querySelector('.timer span')
	elTimerSpan.innerText = '00:00:00'
	var elGameOverModal = document.querySelector('.finish-modal')
	elGameOverModal.style.display = 'none'
	var elModalTxt = elGameOverModal.querySelector('p')
	elModalTxt.innerText = ''
	gMinesPos = []
	gGame.secsPassed = 0
	var elSafeClickBtn = document.querySelector('.safeclick-btn')
	elSafeClickBtn.style.opacity = '1'
	initGame()
}

function setGameMode(elMode) {
	switch (elMode.dataset.level) {
		case 'Beginner':
			gGame.level.SIZE = 4
			gGame.level.MINES = 2
			break
		case 'Medium':
			gGame.level.SIZE = 8
			gGame.level.MINES = 12
			break
		case 'Expert':
			gGame.level.SIZE = 12
			gGame.level.MINES = 30
			break
		default:
			gGame.level.SIZE = 4
			gGame.level.MINES = 2
			break
	}

	resetGame()
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
	openFinishModal(false)
}

function checkVictory() {
	var totalCells = gGame.level.SIZE ** 2
	var playedCellsCount = gGame.shownCount + gGame.flaggedMinesCount
	var isWinner = playedCellsCount === totalCells ? true : false
	if (!isWinner) return
	openFinishModal(isWinner)
	handleLocalStorage()
}

function openFinishModal(isWin) {
	gGame.isOn = !gGame.isOn
	clearInterval(gTimerInterval)
	if (gTimerInterval) gTimerInterval = null
	var elGameOverModal = document.querySelector('.finish-modal')
	elGameOverModal.style.display = 'block'
	var elModalTxt = elGameOverModal.querySelector('p')
	elModalTxt.innerText = isWin ? 'VICTORY' : 'GAMEOVER'
	if (isWin) renderSmiley(WINNER_SMILEY)
	else renderSmiley(DEAD_SMILEY)
}

function handleLocalStorage() {
	var highestScore = +localStorage.getItem(`bestScore-board-${gGame.level.SIZE}`)
	if (highestScore === 0) {
		localStorage.setItem(`bestScore-board-${gGame.level.SIZE}`, gGame.secsPassed)
	} else {
		if (gGame.secsPassed < highestScore) {
			localStorage.setItem(`bestScore-board-${gGame.level.SIZE}`, gGame.secsPassed)
		}
	}
}

function updateLives() {
	if (!gGame.livesCount) return
	gGame.livesCount--
	renderSmiley(DEAD_SMILEY)
	var elLivesSpan = document.querySelector('.lives span')
	elLivesSpan.innerText = gGame.livesCount
	handleElIndicator('visible', 'red', 'YOU STEPPED ON A MINE!')
	gGame.isOn = !gGame.isOn
	setTimeout(() => {
		handleElIndicator('hidden', 'red', '')
		renderSmiley(DEFAULT_SMILEY)
		gGame.isOn = !gGame.isOn
		checkVictory()
	}, 1000)
}

function handleElIndicator(visibility, color, msg) {
	var elIndicator = document.querySelector('.indicator')
	elIndicator.style.visibility = visibility
	var elIndicatorSpan = elIndicator.querySelector('span')
	elIndicatorSpan.innerText = msg
	elIndicatorSpan.style.color = color
}

function startTimer(startTime) {
	var elTimerSpan = document.querySelector('.timer span')
	var totalSecs = 0
	var time = 0
	gTimerInterval = setInterval(() => {
		totalSecs = Math.floor((Date.now() - startTime) / 1000)
		time = getTime(totalSecs)
		elTimerSpan.innerHTML = time
		gGame.secsPassed++
	}, 1000)
}

function renderBestScore() {
	var highestScore = +localStorage.getItem(`bestScore-board-${gGame.level.SIZE}`)
	if (!highestScore) {
		localStorage.setItem(`bestScore-board-${gGame.level.SIZE}`, gGame.secsPassed)
	}
	var time = getTime(highestScore)
	var elBestScoreSpan = document.querySelector('.best-score span')
	elBestScoreSpan.innerHTML = time
}

function getTime(totalSecs) {
	var hour = Math.floor(totalSecs / 3600).toString()
	var minute = Math.floor((totalSecs - hour * 3600) / 60).toString()
	var seconds = (totalSecs - (hour * 3600 + minute * 60)).toString()
	return `
  ${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:${seconds.padStart(2, '0')}`
}

function renderHints() {
	var elHints = document.querySelector('.hints')
	var strHTML = ''
	for (var i = 0; i < gGame.hintsCount; i++) {
		strHTML += `<span data-hint="${i}" onclick="handleHintMode(this)">${HINT}</span>`
	}
	elHints.innerHTML = strHTML
}

function renderSmiley(smiley) {
	var elGameController = document.querySelector('.game-controller')
	elGameController.innerHTML = `<span class="control-btn smiley" onclick="resetGame()">${smiley}</span>`
}
