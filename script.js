const symbols = ["𝅘𝅥", "𝅘𝅥𝅮", "𝅘𝅥𝅯", "𝅘𝅥𝅰", "𝅗𝅥", "𝄞", "𝄢", "𝄡", "𝅝"]; // 9 símbolos

let selectedSymbol = null;
let currentDifficulty = "easy";

function createBoard(puzzle) {
  const board = document.getElementById("sudoku-board");
  board.innerHTML = "";

  puzzle.forEach((row, rowIndex) => {
    row.forEach((symbol, colIndex) => {
      const cell = document.createElement("div");
      cell.classList.add("cell");

      if (symbol !== null) {
        cell.textContent = symbol;
        cell.classList.add("prefilled");
      } else {
        cell.addEventListener("click", () => {
          if (selectedSymbol && !cell.classList.contains("prefilled")) {
            cell.textContent = selectedSymbol;

            if (currentDifficulty === "easy" || currentDifficulty === "medium") {
              highlightSameSymbols(selectedSymbol);
            }
          }
        });
      }

      board.appendChild(cell);
    });
  });
}

function highlightSameSymbols(symbol) {
  document.querySelectorAll(".cell").forEach(cell => {
    cell.classList.remove("highlight");
    if (cell.textContent === symbol) {
      cell.classList.add("highlight");
    }
  });
}


function createSymbolPicker() {
  const picker = document.getElementById("symbol-picker");
  symbols.forEach(sym => {
    const span = document.createElement("div");
    span.className = "symbol";
    span.textContent = sym;
    span.addEventListener("click", () => {
      document.querySelectorAll(".symbol").forEach(s => s.classList.remove("selected"));
      span.classList.add("selected");
      selectedSymbol = sym;
    });
    picker.appendChild(span);
  });
}

function generateCompleteBoard() {
    const board = Array.from({ length: 9 }, () => Array(9).fill(0));
  
    function isValid(board, row, col, num) {
      for (let i = 0; i < 9; i++) {
        if (board[row][i] === num || board[i][col] === num) return false;
        const boxRow = 3 * Math.floor(row / 3) + Math.floor(i / 3);
        const boxCol = 3 * Math.floor(col / 3) + i % 3;
        if (board[boxRow][boxCol] === num) return false;
      }
      return true;
    }
  
    function fill(board, row = 0, col = 0) {
      if (row === 9) return true;
      if (col === 9) return fill(board, row + 1, 0);
  
      const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
      for (let num of nums) {
        if (isValid(board, row, col, num)) {
          board[row][col] = num;
          if (fill(board, row, col + 1)) return true;
          board[row][col] = 0;
        }
      }
      return false;
    }
  
    fill(board);
    return board;
  }
  
  function removeCells(board, difficulty) {
    const removed = { easy: 30, medium: 45, hard: 60 }[difficulty];
    const newBoard = board.map(row => [...row]);
  
    let count = 0;
    while (count < removed) {
      const row = Math.floor(Math.random() * 9);
      const col = Math.floor(Math.random() * 9);
      if (newBoard[row][col] !== null) {
        newBoard[row][col] = null;
        count++;
      }
    }
    return newBoard;
  }

  function numberToSymbolBoard(board) {
    return board.map(row => row.map(cell => (cell ? symbols[cell - 1] : null)));
  }
  
// Ejemplo de puzzles por dificultad (incompleto)
const puzzles = {
  easy: [
    [null, null, "𝄞", null, "𝄌", null, null, null, "𝅘𝅥𝅰"],
    // ...
  ],
  medium: [
    // ...
  ],
  hard: [
    // ...
  ]
};

function loadPuzzle(difficulty) {
  currentDifficulty = difficulty; // Guardamos el nivel
  const full = generateCompleteBoard();
  const partial = removeCells(full, difficulty);
  const symbolBoard = numberToSymbolBoard(partial);
  createBoard(symbolBoard);
}

  function getCurrentBoard() {
    const cells = document.querySelectorAll(".cell");
    const board = Array.from({ length: 9 }, () => Array(9).fill(null));
  
    cells.forEach((cell, index) => {
      const row = Math.floor(index / 9);
      const col = index % 9;
      const sym = cell.textContent;
      board[row][col] = symbols.includes(sym) ? symbols.indexOf(sym) + 1 : null;
    });
  
    return board;
  }
  
  function isBoardCompleteAndValid(board) {
    function checkGroup(group) {
      const nums = group.filter(Boolean);
      return nums.length === 9 && new Set(nums).size === 9;
    }
  
    for (let i = 0; i < 9; i++) {
      const row = board[i];
      const col = board.map(r => r[i]);
      const box = [];
      const rowStart = 3 * Math.floor(i / 3);
      const colStart = 3 * (i % 3);
      for (let r = 0; r < 3; r++)
        for (let c = 0; c < 3; c++)
          box.push(board[rowStart + r][colStart + c]);
  
      if (!checkGroup(row) || !checkGroup(col) || !checkGroup(box)) return false;
    }
  
    return true;
  }
  
  function validateSolution() {
    const board = getCurrentBoard();
    if (isBoardCompleteAndValid(board)) {
      alert("¡Felicidades! Sudoku musical completo y correcto 🎶🎉");
    } else {
      alert("Algo no está bien aún. ¡Sigue intentándolo!");
    }
  }
  

window.onload = () => {
  createSymbolPicker();
  loadPuzzle("easy"); // carga inicial
};
