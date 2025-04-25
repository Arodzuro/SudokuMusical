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
        cell.classList.add("editable");
        cell.addEventListener("click", () => {
          if (!cell.classList.contains("prefilled")) {
            cell.textContent = selectedSymbol || "";
            if (selectedSymbol) {
              highlightSameSymbols(cell.textContent);
            } else {
              document.querySelectorAll(".cell").forEach(c => c.classList.remove("highlight"));
            }

            const allFilled = Array.from(document.querySelectorAll('.cell.editable'))
              .every(cell => cell.textContent.trim() !== '');

            if (allFilled) {
              validateSolution();
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
  picker.innerHTML = "";

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

  // Borrador
  const eraser = document.createElement("div");
  eraser.className = "symbol";
  eraser.textContent = "🧽";
  eraser.title = "Borrador";
  eraser.addEventListener("click", () => {
    document.querySelectorAll(".symbol").forEach(s => s.classList.remove("selected"));
    eraser.classList.add("selected");
    selectedSymbol = null;
  });
  picker.appendChild(eraser);
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
  currentDifficulty = difficulty;
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
  let isValid = true;

  // Limpiar errores anteriores
  document.querySelectorAll(".cell").forEach(cell => cell.classList.remove("error"));

  for (let i = 0; i < 9; i++) {
    const row = board[i];
    const col = board.map(r => r[i]);
    const box = [];
    const rowStart = 3 * Math.floor(i / 3);
    const colStart = 3 * (i % 3);
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        box.push(board[rowStart + r][colStart + c]);
      }
    }

    if (!checkGroup(row)) highlightErrors('row', i), isValid = false;
    if (!checkGroup(col)) highlightErrors('col', i), isValid = false;
    if (!checkGroup(box)) highlightErrors('box', i), isValid = false;
  }

  if (isValid) {
    alert("¡Correcto! Sudoku completado.");
  } else {
    alert("Hay errores en tu solución.");
  }
}

// Helper: Checa si un grupo tiene 9 valores únicos y válidos
function checkGroup(group) {
  const nums = group.filter(Boolean);
  return nums.length === 9 && new Set(nums).size === 9;
}

// Resalta errores según tipo de grupo
function highlightErrors(type, index) {
  const cells = document.querySelectorAll(".cell");

  for (let i = 0; i < 9; i++) {
    let idx;
    switch (type) {
      case 'row':
        idx = index * 9 + i;
        break;
      case 'col':
        idx = i * 9 + index;
        break;
      case 'box':
        const rowStart = 3 * Math.floor(index / 3);
        const colStart = 3 * (index % 3);
        const r = rowStart + Math.floor(i / 3);
        const c = colStart + (i % 3);
        idx = r * 9 + c;
        break;
    }
    const cell = cells[idx];
    if (cell && cell.classList.contains("editable")) {
      cell.classList.add("error");
    }
  }
}

/*function validateSolution() {
  const board = getCurrentBoard();
  const cells = document.querySelectorAll(".cell.editable");

  // Quitar clases previas de error
  cells.forEach(cell => cell.classList.remove("error"));

  if (isBoardCompleteAndValid(board)) {
    alert("¡Felicidades! Sudoku musical completo y correcto 🎶🎉");
  } else {
    // Marcar celdas incorrectas
    const correctBoard = getCorrectBoardSymbols();
    cells.forEach((cell, index) => {
      const row = Math.floor(index / 9);
      const col = index % 9;
      const expectedSymbol = correctBoard[row][col];
      if (cell.textContent !== expectedSymbol) {
        cell.classList.add("error");
      }
    });
    alert("Algo no está bien aún. ¡Sigue intentándolo!");
  }
}*/
function getCorrectBoardSymbols() {
  const full = generateCompleteBoard(); // Genera un tablero nuevo (el mismo método usado en loadPuzzle)
  return numberToSymbolBoard(full); // Lo convierte a símbolos para comparar
}


window.onload = () => {
  createSymbolPicker();
  loadPuzzle("easy");
};
