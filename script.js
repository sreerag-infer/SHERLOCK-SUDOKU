const grid = document.getElementById("sudoku-grid");
const timerEl = document.getElementById("timer");
const message = document.getElementById("message");
const winSound = document.getElementById("winSound");

let timer;
let seconds = 0;
let currentDifficulty = 'easy';
let currentPuzzle = [];

// Pre-solved Sudoku base solution
const baseSolution = [
  [5,3,4,6,7,8,9,1,2],
  [6,7,2,1,9,5,3,4,8],
  [1,9,8,3,4,2,5,6,7],
  [8,5,9,7,6,1,4,2,3],
  [4,2,6,8,5,3,7,9,1],
  [7,1,3,9,2,4,8,5,6],
  [9,6,1,5,3,7,2,8,4],
  [2,8,7,4,1,9,6,3,5],
  [3,4,5,2,8,6,1,7,9]
];

// -------------------- Timer --------------------
function startTimer() {
  clearInterval(timer);
  seconds = 0;
  timerEl.textContent = "Time: 00:00";

  timer = setInterval(() => {
    seconds++;
    const m = String(Math.floor(seconds / 60)).padStart(2,'0');
    const s = String(seconds % 60).padStart(2,'0');
    timerEl.textContent = `Time: ${m}:${s}`;
  }, 1000);
}

// -------------------- Helpers --------------------
function shuffleArray(arr) {
  for (let i = arr.length-1; i>0; i--) {
    const j = Math.floor(Math.random() * (i+1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// -------------------- Puzzle Generation --------------------
function generatePuzzle() {
  const puzzle = JSON.parse(JSON.stringify(baseSolution));

  let removeCount;
  if(currentDifficulty === 'easy') removeCount = 35;
  else if(currentDifficulty === 'medium') removeCount = 45;
  else removeCount = 55;

  const cells = Array.from({length:81}, (_,i)=>i);
  shuffleArray(cells);

  for(let i=0;i<removeCount;i++){
    const idx = cells[i];
    const row = Math.floor(idx/9);
    const col = idx%9;
    puzzle[row][col] = 0;
  }

  return puzzle;
}

// -------------------- Load Game --------------------
function loadGame() {
  grid.innerHTML = "";
  message.textContent = "";
  message.className = "";
  startTimer();

  currentPuzzle = generatePuzzle();

  currentPuzzle.flat().forEach(num => {
    const input = document.createElement("input");
    input.maxLength = 1;

    if (num !== 0) {
      input.value = num;
      input.disabled = true;
    } else {
      input.addEventListener("input", () => {
        if (!/^[1-9]$/.test(input.value)) input.value = "";
      });
    }

    grid.appendChild(input);
  });
}

// -------------------- Get Board --------------------
function getBoard() {
  const board = [];
  const cells = grid.querySelectorAll("input");
  for(let r=0;r<9;r++){
    board.push([]);
    for(let c=0;c<9;c++){
      board[r][c] = Number(cells[r*9+c].value)||0;
    }
  }
  return board;
}

// -------------------- Validation --------------------
function isValid(board,r,c,num){
  for(let i=0;i<9;i++){
    if(i!==c && board[r][i]===num) return false;
    if(i!==r && board[i][c]===num) return false;
  }
  const br = Math.floor(r/3)*3;
  const bc = Math.floor(c/3)*3;
  for(let i=br;i<br+3;i++){
    for(let j=bc;j<bc+3;j++){
      if((i!==r||j!==c)&&board[i][j]===num) return false;
    }
  }
  return true;
}

// -------------------- Check Solution --------------------
function checkSolution(){
  const board = getBoard();
  const cells = grid.querySelectorAll("input");
  cells.forEach(cell=>cell.style.backgroundColor="");

  for(let r=0;r<9;r++){
    for(let c=0;c<9;c++){
      if(board[r][c]===0 || !isValid(board,r,c,board[r][c])){
        message.textContent="❌ Case not solved yet!";
        message.className="message error";
        return;
      }
    }
  }

  clearInterval(timer);
  message.textContent=`🎉 Case Solved in ${timerEl.textContent}!`;
  message.className="message success";
  winSound.play();
}

// -------------------- New Game --------------------
function newGame(){ loadGame(); }

// -------------------- Set Difficulty --------------------
function setDifficulty(level){ 
  currentDifficulty = level;
  loadGame();
}

// -------------------- Peek Solution Feature --------------------
let fullSolution = JSON.parse(JSON.stringify(baseSolution));
const peekBtn = document.getElementById("show-solution");
let tempUserInputs = []; // store user progress

// Store current user inputs
function getUserInputs() {
  const cells = grid.querySelectorAll("input");
  const userInputs = [];
  for (let r=0; r<9; r++){
    userInputs.push([]);
    for (let c=0; c<9; c++){
      const idx = r*9 + c;
      userInputs[r][c] = cells[idx].value;
    }
  }
  return userInputs;
}

// Show full solution on hold
peekBtn.addEventListener("mousedown", () => {
  tempUserInputs = getUserInputs(); // save current values
  const cells = grid.querySelectorAll("input");
  for (let r=0;r<9;r++){
    for (let c=0;c<9;c++){
      const idx = r*9 + c;
      cells[idx].value = fullSolution[r][c];
      cells[idx].style.color = "#ffeb3b"; // golden peek
    }
  }
});

// Restore user inputs on release
function hideSolution(){
  const cells = grid.querySelectorAll("input");
  for (let r=0;r<9;r++){
    for (let c=0;c<9;c++){
      const idx = r*9 + c;
      cells[idx].value = tempUserInputs[r][c];
      cells[idx].style.color = ""; // reset color
    }
  }
}

peekBtn.addEventListener("mouseup", hideSolution);
peekBtn.addEventListener("mouseleave", hideSolution);

// -------------------- Initialize --------------------
loadGame();
