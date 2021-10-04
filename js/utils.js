function printMat(mat, selector) {
  var strHTML = `<table oncontextmenu="return false" border="0"><tbody>`
  for (var i = 0; i < mat.length; i++) {
    strHTML += `<tr>`
    for (var j = 0; j < mat[0].length; j++) {
      var className = `cell cell${i}-${j}`
      strHTML += `<td class="${className}" onmousedown="cellClicked(${i},${j},event)"></td>`
    }
    strHTML += `<tr>`
  }
  strHTML += `</tbody></table>`
  var elContainer = document.querySelector(selector)
  elContainer.innerHTML = strHTML
}

function getRandomInt(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1) + min) //The maximum is inclusive and the minimum is inclusive
}
