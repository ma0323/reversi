const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const turnInfo = document.getElementById("turnInfo");

const size = 8;
const cellSize = canvas.width / size;
let currentPlayer = 1; // 1: 黒, 2: 白
let gameEnded = false;

const board = Array.from({ length: size }, () => Array(size).fill(0));

// 初期配置
board[3][3] = 2;
board[4][4] = 2;
board[3][4] = 1;
board[4][3] = 1;

function drawBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      ctx.strokeStyle = "black";
      ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);

      if (board[y][x] !== 0) {
        drawDisc(x, y, board[y][x] === 1 ? "black" : "white");
      }
    }
  }
}

function drawDisc(x, y, color) {
  ctx.beginPath();
  ctx.arc(
    x * cellSize + cellSize / 2,
    y * cellSize + cellSize / 2,
    cellSize * 0.4,
    0,
    2 * Math.PI
  );
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = "black";
  ctx.stroke();
}

const directions = [
  [-1, -1], [-1, 0], [-1, 1],
  [ 0, -1],          [ 0, 1],
  [ 1, -1], [ 1, 0], [ 1, 1],
];

function isValidMove(x, y, player, doFlip = false) {
  if (board[y][x] !== 0) return false;
  let valid = false;

  for (const [dx, dy] of directions) {
    let i = x + dx;
    let j = y + dy;
    let hasOpponent = false;

    while (i >= 0 && i < size && j >= 0 && j < size) {
      if (board[j][i] === 0) break;
      if (board[j][i] === 3 - player) {
        hasOpponent = true;
      } else if (board[j][i] === player) {
        if (hasOpponent) {
          valid = true;
          if (doFlip) {
            let flipX = x + dx;
            let flipY = y + dy;
            while (board[flipY][flipX] === 3 - player) {
              board[flipY][flipX] = player;
              flipX += dx;
              flipY += dy;
            }
          }
        }
        break;
      } else {
        break;
      }
      i += dx;
      j += dy;
    }
  }

  return valid;
}

function hasValidMove(player) {
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (isValidMove(x, y, player)) return true;
    }
  }
  return false;
}

function countStones() {
  let black = 0;
  let white = 0;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (board[y][x] === 1) black++;
      else if (board[y][x] === 2) white++;
    }
  }
  return { black, white };
}

function endGame() {
  gameEnded = true;
  const { black, white } = countStones();
  if (black > white) {
    turnInfo.textContent = `黒の勝ち！（黒: ${black}, 白: ${white}）`;
  } else if (white > black) {
    turnInfo.textContent = `白の勝ち！（白: ${white}, 黒: ${black}）`;
  } else {
    turnInfo.textContent = `引き分け！（黒: ${black}, 白: ${white}）`;
  }
}

function updateTurn() {
  if (!hasValidMove(currentPlayer)) {
    if (!hasValidMove(3 - currentPlayer)) {
      endGame(); // 両者合法手なし→終局
    } else {
      alert((currentPlayer === 1 ? "黒" : "白") + "はパスします");
      currentPlayer = 3 - currentPlayer;
      updateTurnDisplay();
    }
  } else {
    updateTurnDisplay();
  }
}

canvas.addEventListener("click", (e) => {
  if (gameEnded) return;

  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / cellSize);
  const y = Math.floor((e.clientY - rect.top) / cellSize);

  if (isValidMove(x, y, currentPlayer, true)) {
    board[y][x] = currentPlayer;
    currentPlayer = 3 - currentPlayer;
    drawBoard();
    updateTurn();
  }
});

function updateTurnDisplay() {
  if (gameEnded) return;
  turnInfo.textContent = currentPlayer === 1 ? "黒の番です" : "白の番です";
}

drawBoard();
updateTurnDisplay();
