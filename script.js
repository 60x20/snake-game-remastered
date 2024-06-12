// Define HTML elements
const root = document.querySelector(':root');
const board = document.getElementById('game-board');
const startWrapper = document.getElementById('start-wrapper')
const logo = document.getElementById('logo');
const instructionText = document.getElementById('instruction-text');

// instruments
const score = document.getElementById('score');
const highScoreText = document.getElementById('highScore');
const speedInstrument = document.getElementById('speed-instrument');
const areaInstrument = document.getElementById('area-instrument');
const gridPxInstrument = document.getElementById('grid-px-instrument');
const gamePausedInstrument = document.getElementById('game-paused-instrument');
const collisionInstrument = document.getElementById('collision-instrument');

// variable setters
const setSpeed = document.getElementById('set-speed');
const setGridColumnSize = document.getElementById('set-grid-column-size');
const setGridRowSize = document.getElementById('set-grid-row-size');
const setGridColumnPx = document.getElementById('set-grid-column-px');
const setGridRowPx = document.getElementById('set-grid-row-px');
const collisionBtn = document.getElementById('collision-btn');
setSpeed.addEventListener('change', setSpeedFromInput);
setSpeed.addEventListener('keyup', (e) => {if (e.key === 'Enter') {setSpeedFromInput(e)}});
setGridColumnSize.addEventListener('change', setGridColumnFromInput);
setGridColumnSize.addEventListener('keyup', (e) => {if (e.key === 'Enter') {setGridColumnFromInput(e)}});
setGridRowSize.addEventListener('change', setGridRowFromInput);
setGridRowSize.addEventListener('keyup', (e) => {if (e.key === 'Enter') {setGridRowFromInput(e)}});
setGridColumnPx.addEventListener('change', setGridColumnPxFromInput);
setGridColumnPx.addEventListener('keyup', (e) => {if (e.key === 'Enter') {setGridColumnPxFromInput(e)}});
setGridRowPx.addEventListener('change', setGridRowPxFromInput);
setGridRowPx.addEventListener('keyup', (e) => {if (e.key === 'Enter') {setGridRowPxFromInput(e)}});
collisionBtn.addEventListener('click', setCollisionState);
for (const button of document.querySelectorAll("button.increment-btn")) {
  button.addEventListener('click', incrementInputButton);
  button.addEventListener('mousedown', holdToIncrementInputButton);
  button.addEventListener('touchstart', holdToIncrementInputButton);
}
for (const button of document.querySelectorAll("button.decrement-btn")) {
  button.addEventListener('click', decrementInputButton);
  button.addEventListener('mousedown', holdToDecrementInputButton);
  button.addEventListener('touchstart', holdToDecrementInputButton);
}

// accessibility buttons
const moveUpBtn = document.getElementById('move-up-btn');
const moveLeftBtn = document.getElementById('move-left-btn');
const moveRightBtn = document.getElementById('move-right-btn');
const moveDownBtn = document.getElementById('move-down-btn');
const upKeyEvent = new KeyboardEvent('keydown', {key: 'ArrowUp'});
const downKeyEvent = new KeyboardEvent('keydown', {key: 'ArrowDown'});
const leftKeyEvent = new KeyboardEvent('keydown', {key: 'ArrowLeft'});
const rightKeyEvent = new KeyboardEvent('keydown', {key: 'ArrowRight'});
moveUpBtn.addEventListener('click', () => {handleKeyPress(upKeyEvent)});
moveLeftBtn.addEventListener('click', () => {handleKeyPress(leftKeyEvent)});
moveRightBtn.addEventListener('click', () => {handleKeyPress(rightKeyEvent)});
moveDownBtn.addEventListener('click', () => {handleKeyPress(downKeyEvent)});

// number inputs should have a limitation like 0 <= x <= 10000 and should not be rendered as '00100'
const numberInputs = document.querySelectorAll('#variable-setters input[type="number"]')
for (const numberInput of numberInputs) {
  numberInput.addEventListener('input', limitNumberInput)
}

// game state buttons
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const toggleBtn = document.getElementById('toggle-btn');
const resetBtn = document.getElementById('reset-btn');
startBtn.addEventListener('click', startGame);
stopBtn.addEventListener('click', stopGame);
toggleBtn.addEventListener('click', () => {gameStarted ? stopGame() : startGame()});
resetBtn.addEventListener('click', resetGame);

// Define game variables
let gridPixelBeginning = calculateGridPixelBeginning();
let gridColumnPx = gridPixelBeginning;
let gridRowPx = gridPixelBeginning;
// gridColumnSize === 50vw / gridColumnPx(= 4vw || 4 vh || 8px), should not be less than 1
root.style.setProperty('--grid-column-size', Math.round(root.clientWidth / parseInt(gridColumnPx) * .5) || 1);
// gridRowSize === 50vh / gridRowPx(= 4vw || 4 vh || 8px)
root.style.setProperty('--grid-row-size', Math.round(root.clientHeight / parseInt(gridRowPx) * .5) || 1);
let gridColumnSize = Number(getComputedStyle(root).getPropertyValue('--grid-column-size'));
let gridRowSize = Number(getComputedStyle(root).getPropertyValue('--grid-row-size'));
let gridColumnCenter = Math.floor(gridColumnSize / 2) + 1;
let gridRowCenter = Math.floor(gridRowSize / 2) + 1;
let snake = [{ x: gridColumnCenter, y: gridRowCenter }];
let food = generateRandomCoordinates();
let highScore = 0;
let direction = 'right';
let gameIntervalID;
const gameSpeedDelayStart = 200;
let gameSpeedDelay = gameSpeedDelayStart;
let gameStarted = false;
let collisionState = false;

// Generate random food
function generateRandomCoordinates() {
  // x represents the gridColumn
  const x = Math.floor(Math.random() * gridColumnSize) + 1;
  // y represents the gridRow
  const y = Math.floor(Math.random() * gridRowSize) + 1;
  return { x, y };
}

// draw Food, then change its gridArea
const foodElement = document.createElement('div');
foodElement.className = 'food';
changeFoodGrid();
function changeFoodGrid () {
  foodElement.style.gridArea = `${food.y} / ${food.x}`;
}
board.appendChild(foodElement);

// draw the first snake
addSnake(snake[0])

// func to reset game board
function resetGameBoard () {
  board.innerHTML = '';
}

// functions to render instruments
function renderInstruments() {
  renderSpeed();
  renderArea();
  renderGridPx();
  updateScore();
  renderPause();
  renderCollisionState();
}
function renderSpeed () {
  speedInstrument.innerText = gameSpeedDelay;
}
function renderArea () {
  areaInstrument.innerText = `${gridColumnSize}x${gridRowSize}`;
}
function renderGridPx () {
  gridPxInstrument.innerText = `${gridColumnPx}*${gridRowPx}`;
}
function renderPause () {
  if (gameStarted) {
    gamePausedInstrument.classList.add('displayNone');
    stopBtn.style.backgroundColor = '';
  } else {
    stopBtn.style.backgroundColor = 'tomato';
    gamePausedInstrument.classList.remove('displayNone');
  }
}
function renderCollisionState () {
  collisionInstrument.innerText = collisionState ? 'Collision enabled' : 'Collision disabled';
  collisionBtn.style.backgroundColor = collisionState ? 'var(--green-text-color)' : '';
}

// rendering instruments once
renderInstruments()
// rendering values of grid area variable setters
setGridColumnSize.value = gridColumnSize;
setGridRowSize.value = gridRowSize;
setGridColumnPx.value = parseInt(gridColumnPx);
setGridRowPx.value = parseInt(gridRowPx);

function startGame() {
  gameStarted = true; // Keep track of a running game
  startWrapper.classList.add('displayNone');
  renderPause();
  clearInterval(gameIntervalID); // clear past interval
  gameIntervalID = setInterval(move, gameSpeedDelay);
}

function stopGame() {
  clearInterval(gameIntervalID);
  gameStarted = false;
  renderPause();
}

function resetGame() {
  stopGame();
  resetGameBoard();
  snake = [{ x: gridColumnCenter, y: gridRowCenter }];
  food = generateRandomCoordinates();
  changeFoodGrid();
  board.appendChild(foodElement);
  addSnake(snake[0]);
  gameSpeedDelay = gameSpeedDelayStart;
  startWrapper.classList.remove('displayNone');
  renderInstruments();
}

// Moving the snake
function move() {
  
  const head = { ...snake[0] };
  let localDirection = direction; 
  let pastDirection = '';

  // if collision state is on, opposite directions should not be allowed 
  if (collisionState) {
    stopHeadOverlapping();
  }

  // CSS; change the shape of the head depending on the direction
  changeHeadShape();

  switch (localDirection) {
    case 'up':
      head.y--;
      break;
    case 'down':
      head.y++;
      break;
    case 'left':
      head.x--;
      break;
    case 'right':
      head.x++;
      break;
  }

  if (collisionState) {
    if (resetOnCollision()) {
      // if game is reset func must stop executing
      return undefined;
    };
  } else {
    displaceOnCollision();
  }

  snake.unshift(head);

  // if head gets to the food do not pop
  if (head.x === food.x && head.y === food.y) {
    updateScore();
    food = generateRandomCoordinates();
    changeFoodGrid();
    increaseSpeed();
    clearInterval(gameIntervalID); // Clear past interval
    gameIntervalID = setInterval(move, gameSpeedDelay);
    addSnake(head);
  } else {
    snake.pop();
    const snakeElements = document.querySelectorAll('.snake');
    const lastSnake = snakeElements[snakeElements.length - 1];
    lastSnake.remove();
    addSnake(head);
  }

  // right to left, left to right, up to down, down to right should be illegal when snake size is >= 2
  function stopHeadOverlapping () {
    if (snake.length >= 2) {
      let horizontalDistance = snake[0].x - snake[1].x;
      let verticalDistance = snake[0].y - snake[1].y;
      // difference can either be [-+]1 or [-+](1 - gridColumnSize)
      if (horizontalDistance === 1 || horizontalDistance === (1 - gridColumnSize)) {
        pastDirection = 'right';
      } else if (horizontalDistance === -1 || horizontalDistance === (gridColumnSize - 1)) {
        pastDirection = 'left';
      } else if (verticalDistance === 1 || verticalDistance === (1 - gridRowSize)) {
        pastDirection = 'down';
      } else if (verticalDistance === -1 || verticalDistance === (gridColumnSize - 1) ) {
        pastDirection = 'up';
      }
    }
    if (pastDirection === 'left' && localDirection === 'right') {
      localDirection = pastDirection;
    } else if (pastDirection === 'right' && localDirection === 'left') {
      localDirection = pastDirection;
    } else if (pastDirection === 'up' && localDirection === 'down') {
      localDirection = pastDirection;
    } else if (pastDirection === 'down' && localDirection === 'up') {
      localDirection = pastDirection;
    }
  }

  // CSS; change the shape of the head depending on the direction
  function changeHeadShape () {
    switch (localDirection) {
      case 'up':
        root.style.setProperty('--head-top', '0');
        root.style.setProperty('--head-bottom', 'var(--bottomAsHead)');
        root.style.setProperty('--head-left', 'var(--leftAsSide)');
        root.style.setProperty('--head-right', 'var(--rightAsSide)');
        break;
      case 'down':
        root.style.setProperty('--head-top', 'var(--topAsHead)');
        root.style.setProperty('--head-bottom', '0');
        root.style.setProperty('--head-left', 'var(--leftAsSide)');
        root.style.setProperty('--head-right', 'var(--rightAsSide)');
        break;
      case 'left':
        root.style.setProperty('--head-top', 'var(--topAsSide)');
        root.style.setProperty('--head-bottom', 'var(--bottomAsSide)');
        root.style.setProperty('--head-left', '0');
        root.style.setProperty('--head-right', 'var(--rightAsHead)');
        break;
      case 'right':
        root.style.setProperty('--head-top', 'var(--topAsSide)');
        root.style.setProperty('--head-bottom', 'var(--bottomAsSide)');
        root.style.setProperty('--head-left', 'var(--leftAsHead)');
        root.style.setProperty('--head-right', '0');  
        break;
    }
  }

  function resetOnCollision () { 
    if (head.x < 1 || head.x > gridColumnSize || head.y < 1 || head.y > gridRowSize) {
      resetGame();
      return true;
    }
  }
  // stopping snake from getting outside of the grid
  function displaceOnCollision () { 
    if (head.x < 1) {
      head.x = gridColumnSize;
    } else if (head.x > gridColumnSize) {
      head.x = 1;
    } else if (head.y < 1) {
      head.y = gridRowSize;
    } else if (head.y > gridRowSize) {
      head.y = 1;
    }
  }
}

function addSnake(head) {
  const snakeElement = document.createElement('div');
  snakeElement.className = 'snake';
  snakeElement.style.gridArea = `${head.y} / ${head.x}`
  board.prepend(snakeElement);
}

function calculateGridPixelBeginning() {
  root.style.removeProperty('--grid-column-px'); // the --grid-column-px defined in the css will be obtained
  const gridColumnPxCSS = getComputedStyle(root).getPropertyValue('--grid-column-px'); // max(Nvh, Nvw, Npx)
  // should not be less than 1
  const vhNumerator = Number(gridColumnPxCSS.match(/(?:\d*[.]\d*|\d+)(?=vh)/)[0]) || 1;
  const vwNumerator = Number(gridColumnPxCSS.match(/(?:\d*[.]\d*|\d+)(?=vw)/)[0]) || 1;
  const pxNumerator = Number(gridColumnPxCSS.match(/(?:\d*[.]\d*|\d+)(?=px)/)[0]) || 1;
  const oneVH = Math.round(root.clientHeight * .01) || 1;
  const oneVW = Math.round(root.clientWidth * .01) || 1;
  const localGridPixelBeginning = Math.round(Math.max((vhNumerator * oneVH), (vwNumerator * oneVW), pxNumerator)) + 'px';
  root.style.setProperty('--grid-column-px', localGridPixelBeginning);
  root.style.setProperty('--grid-row-px', localGridPixelBeginning);
  return localGridPixelBeginning;
}

// Keypress event listener
function handleKeyPress(event) {
  // if keypress is on an input or button element do nothing
  // will be also called with custom events (like ${upKeyEvent}), in which case event.target will be null
  if (event.target && event.target.matches('input')) {
    return undefined;
  }

  // disabling scrolling with arrow keys and space
  if([' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
    event.preventDefault();
  }

  if (!gameStarted && (event.code === 'Space' || event.key === ' ')) {
    startGame();
  } else {
    switch (event.key) {
      case 'ArrowUp':
        direction = 'up';
        break;
      case 'ArrowDown':
        direction = 'down';
        break;
      case 'ArrowLeft':
        direction = 'left';
        break;
      case 'ArrowRight':
        direction = 'right';
        break;
    }
  }
}
document.addEventListener('keydown', handleKeyPress);

function setSpeedFromInput (e) {
  // delay should be number
  // this handler is also called with an object: ({currentTarget: input})
  const inputDelay = Number(e.currentTarget.value);
  gameSpeedDelay = inputDelay;
  renderSpeed();
  // if game is not started, then do not start it 
  if (gameStarted) {
    clearInterval(gameIntervalID); // Clear past interval
    gameIntervalID = setInterval(move, gameSpeedDelay);
  }
};

function setGridColumnFromInput (e) {
  // this handler will be called when screen orientation changes, in which case e.currentTarget.value will be undefined
  // this handler will be called when screen is resized, in which case e.currentTarget.value will be undefined
  // this handler is also called with an object: ({currentTarget: input})
  const columnSize = e.currentTarget.value || (Math.round(root.clientWidth / parseInt(gridColumnPx) * .5) || 1);
  root.style.setProperty('--grid-column-size', columnSize);
  // columnSize is string
  gridColumnSize = Number(columnSize);
  gridColumnCenter = Math.floor(gridColumnSize / 2) + 1;
  renderArea();
  // food should not overlap
  if (food.x > gridColumnSize) {
    food.x = gridColumnSize;
    changeFoodGrid();
  }
  // grid shows the overlapping only if it's the first child that's overlapping
  if (!gameStarted) {
    if (snake[0].x > gridColumnSize) {
      const firstSnake = document.querySelector('.snake');
      firstSnake.style.gridColumn = 1;
    }
  }
}
function setGridRowFromInput (e) {
  // this handler will be called when screen orientation changes, in which case e.currentTarget.value will be undefined
  // this handler will be called when screen is resized, in which case e.currentTarget.value will be undefined
  // this handler is also called with an object: ({currentTarget: input})
  const rowSize = e.currentTarget.value || (Math.round(root.clientHeight / parseInt(gridRowPx) * .5) || 1);
  root.style.setProperty('--grid-row-size', rowSize);
  // rowSize is string
  gridRowSize = Number(rowSize);
  gridRowCenter = Math.floor(gridRowSize / 2) + 1;
  renderArea();
  // food should not overlap
  if (food.y > gridRowSize) {
    food.y = gridRowSize;
    changeFoodGrid();
  }
  // grid shows the overlapping only if it's the first child that's overlapping
  if (!gameStarted) {
    if (snake[0].y > gridRowSize) {
      const firstSnake = document.querySelector('.snake');
      firstSnake.style.gridRow = 1;
    }
  }
}

function setGridColumnPxFromInput (e) {
  // this handler is also called with an object: ({currentTarget: input})
  const columnPx = e.currentTarget.value + 'px';
  root.style.setProperty('--grid-column-px', columnPx);
  gridColumnPx = columnPx;
  renderGridPx();
}
function setGridRowPxFromInput (e) {
  // this handler is also called with an object: ({currentTarget: input})
  const rowPx = e.currentTarget.value + 'px';
  root.style.setProperty('--grid-row-px', rowPx);
  gridRowPx = rowPx;
  renderGridPx();
}

function limitNumberInput (e) {
  let value = e.currentTarget.value;
  const minVal = Number(e.currentTarget.getAttribute('min'));
  const maxVal = Number(e.currentTarget.getAttribute('max'));

  if (value <= minVal) {
    value = minVal;
  } else if (value >= maxVal) {
    value = maxVal;
  }

  e.currentTarget.value = Number.parseInt(value) || minVal; // value can be '00100', '10.1', converted to 100 || NaN to minVal;
}

function setCollisionState () {
  collisionState = !collisionState;
  renderCollisionState();
}

function increaseSpeed() { 
  if (gameSpeedDelay > 500) {
    gameSpeedDelay -= 75;
  } else if (gameSpeedDelay > 300) {
    gameSpeedDelay -= 50;
  } else if (gameSpeedDelay > 200) {
    gameSpeedDelay -= 30;
  } else if (gameSpeedDelay > 100) {
    gameSpeedDelay -= 10;
  } else if ((gameSpeedDelay > 40) && !collisionState) { // Game should not be fast if collision is on
    gameSpeedDelay -= 3;
  } 

  renderSpeed();
}

function updateScore() {
  const currentScore = snake.length - 1;
  const currentScoreString = currentScore.toString().padStart(3, '0');
  score.innerText = currentScoreString;
  if (currentScore > highScore) {
    highScore = currentScore;
    highScoreText.innerText = currentScoreString;
  }
}

// tab loop
const firstChildForTabLoop = document.querySelector('#accessibility-div > :first-child');
const lastChildForTabLoop = document.querySelector('#accessibility-div > :last-child');
const firstBtnForTabLoop = document.querySelector('#accessibility-div > button:first-of-type');
const lastBtnForTabLoop = document.querySelector('#accessibility-div > button:last-of-type');
firstChildForTabLoop.addEventListener('focus', () => {
  lastBtnForTabLoop.focus();
})
lastChildForTabLoop.addEventListener('focus', () => {
  firstBtnForTabLoop.focus();
})

function incrementInputButton (e) {
  // select the input element inside the .input-wrapper
  const input = e.currentTarget.closest('.input-wrapper').querySelector('input');

  // should not be greater than max
  const maxVal = Number(input.getAttribute('max'));

  if ((Number(input.value) + 1) >= maxVal) {
    input.value = maxVal;
  } else {
    input.value++;
  }

  // should trigger a change event, handlers called with an object that has an 'currentTarget: input' property, so that value of the input can be obtained using e.currentTarget.value
  whichHandlerToCall(input);
}
function decrementInputButton (e) {
  // select the input element inside the .input-wrapper
  const input = e.currentTarget.closest('.input-wrapper').querySelector('input');
  // should not be less than min
  const minVal = Number(input.getAttribute('min'));

  if ((Number(input.value) - 1) <= minVal) {
    input.value = minVal;
  } else {
    input.value--;
  }

  // should trigger a change event, handlers called with an object that has an 'currentTarget: input' property, so that value of the input can be obtained using e.currentTarget.value
  whichHandlerToCall(input);
}

function holdToIncrementInputButton (e) {
  // select the input element inside the .input-wrapper
  const input = e.currentTarget.closest('.input-wrapper').querySelector('input');
      
  // should not be greater than max
  const maxVal = Number(input.getAttribute('max'));

  const intervalID = setInterval(() => {
    if ((Number(input.value) + 1) >= maxVal) {
      input.value = maxVal;
    } else {
      input.value++;
    }
  }, 200)

  if (e.type === 'mousedown') {
    document.addEventListener('mouseup', stopTheCrement, { once: true });
  } else if (e.type === 'touchstart') {
    document.addEventListener('touchend', stopTheCrement, { once: true });
  }
  function stopTheCrement () {
    clearInterval(intervalID);
    whichHandlerToCall(input); // call the handler to apply the input value
  }
}
function holdToDecrementInputButton (e) {
  // select the input element inside the .input-wrapper
  const input = e.currentTarget.closest('.input-wrapper').querySelector('input');
  
  // should not be less than min
  const minVal = Number(input.getAttribute('min'));

  const intervalID = setInterval(() => {
    if ((Number(input.value) - 1) <= minVal) {
      input.value = minVal;
    } else {
      input.value--;
    }
  }, 200)

  if (e.type === 'mousedown') {
    document.addEventListener('mouseup', stopTheCrement, { once: true });
  } else if (e.type === 'touchstart') {
    document.addEventListener('touchend', stopTheCrement, { once: true });
  }
  function stopTheCrement () {
    clearInterval(intervalID);
    whichHandlerToCall(input); // call the handler to apply the input value
  }
}

function whichHandlerToCall (inputElement) {
  const pseudoEvent = {currentTarget: inputElement};
  switch (inputElement) {
    case setSpeed:
      setSpeedFromInput(pseudoEvent);
      break;
    case setGridColumnSize:
      setGridColumnFromInput(pseudoEvent);
      break;
    case setGridRowSize:
      setGridRowFromInput(pseudoEvent);
      break;
    case setGridColumnPx:
      setGridColumnPxFromInput(pseudoEvent);
      break;
    case setGridRowPx:
      setGridRowPxFromInput(pseudoEvent);
      break;
  }
}

// if screen orientation changes, game-board should adapt
screen.orientation.addEventListener('change', (e) => {
  setGridColumnFromInput(e);
  setGridRowFromInput(e);
})

// if screen is resized, game-board should adapt
let aspectRatioGlobal = calculateAspectRatio();
function calculateAspectRatio () {
  return parseInt((root.clientWidth / root.clientHeight) * 1000);
}
window.addEventListener("resize", (e) => {
  // 'resize' event is triggered when zoomed in or out, which disables zooming. When zoomed aspect ratio should not change much
  const localAspectRatio = calculateAspectRatio();
  const ratioOfAspectRatios = aspectRatioGlobal / localAspectRatio;
  if ((ratioOfAspectRatios > 1.05) || (ratioOfAspectRatios < .95)) { 
    // if the ratios are different then resize and save, if similar then do not resize and not save
    aspectRatioGlobal = localAspectRatio;
    gridPixelBeginning = calculateGridPixelBeginning();
    gridColumnPx = gridPixelBeginning;
    gridRowPx = gridPixelBeginning;
    renderGridPx();
    setGridColumnFromInput(e);
    setGridRowFromInput(e);
  }
});