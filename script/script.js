'use strict';

const playField = document.querySelector('.playfield');

class ApplesClass {
  #playField;
  #playFieldRows;
  #playFieldColumns;
  count = 1;
  elements = [];

  constructor(playField) {
    this.#playField = playField;
    const playFieldStyle = getComputedStyle(this.#playField); // получаем стили игрового поля
    this.#playFieldRows = playFieldStyle.gridTemplateRows.split(' ').length; //количесвто строк игрового поля
    this.#playFieldColumns = playFieldStyle.gridTemplateColumns.split(' ').length; //количесвто столбцов игрового поля
  }

  clear() {
    this.elements.forEach(item => item.remove());
    this.elements = [];
    // count = 1;
  };

  createElement() {
    // создаем элемент, добавляем его в DOM с аттрибутом appleID
    // также добавялем его в поле elements объекта
    this.clear();
    for (let i = 1; i <= this.count; i++) {
      const element = document.createElement('div');
      element.classList.add('apple');
      const appleID = this.elements.length;
      element.setAttribute('apple-id', appleID);
      this.elements.push(element);
      this.setNewRandomPos(appleID);
      this.#playField.prepend(element);
    }
  }

  setNewRandomPos(appleID) {
    const element = this.elements[appleID];
    let coordVariants = [];
    for (let i = 1; i <= this.#playFieldColumns; i++) {
      for (let j = 1; j <= this.#playFieldRows; j++) {
        if (document.elementFromPoint(...this.getXY(i, j)) == this.#playField) {
          coordVariants.push([i, j]);
        }
      }
    }
    if (!coordVariants.length) {
      element.style.display = 'none';
      return true
    }; // в случае, если более нет свободных клеток, то вернуть признак победы;
    let i = Math.round(Math.random() * (coordVariants.length - 1)); // индекс случаной свободной клетки  
    [element.style.gridColumnStart, element.style.gridRowStart] = coordVariants[i];
    return false;
  };

  repositionAllElements() {
    this.elements.forEach((item, index) => this.setNewRandomPos(index));
  }

  getXY(column, row) {
    const playFieldStyle = getComputedStyle(this.#playField);
    const playFieldBorder = parseInt(playFieldStyle.borderWidth);
    const playFieldOffset = this.#playField.getBoundingClientRect()
    const width = playFieldOffset.width - (2 * playFieldBorder);
    const height = playFieldOffset.height - (2 * playFieldBorder);
    let x = playFieldBorder + playFieldOffset.left + (width / this.#playFieldColumns) * (column - 0.5);
    let y = +playFieldBorder + playFieldOffset.top + (height / this.#playFieldRows) * (row - 0.5);
    return [x, y];
  }
}

class SnakeClass {
  #playField;
  #playFieldRows;
  #playFieldColumns;
  #snakeDirection = 'down';
  #tempDirection = this.#snakeDirection;

  parts = []; //массив с частями змейки в виде элементов DOM-дерева

  constructor(playField) {
    this.#playField = playField;
    const playFieldStyle = getComputedStyle(this.#playField); // получаем стили игрового поля
    this.#playFieldRows = playFieldStyle.gridTemplateRows.split(' ').length; //количесвто строк игрового поля
    this.#playFieldColumns = playFieldStyle.gridTemplateColumns.split(' ').length; //количесвто столбцов игрового поля
    this.positionSnake();
  };

  positionSnake(startX = 1, startY = 3, lengthOfSnake = 3) {
    this.#tempDirection = this.#snakeDirection = 'down';
    this.parts.forEach(item => item.remove());
    this.parts = [];
    // Размещение хвоста змейки "серпантином"
    let step = -1;
    while (startX > 0 && lengthOfSnake > 0) {
      // если элемент первый, то добавляем класс 'snake-head'
      if (!this.parts.length) {
        this.addPart(startX, startY, 'snake-parts', 'snake-head', 'down')
      } else {
        this.addPart(startX, startY, 'snake-parts', 'snake-tale');
      }
      startY += step;
      if (startY < 1) {
        step = +1;
        startY = 1;
        startX--;
      } else if (startY > this.#playFieldRows) {
        step = -1;
        startY = this.#playFieldRows;
        startX--;
      };
      lengthOfSnake--;
    };
  };

  set direction(value) {
    if (!(
      ((value == 'right' || value == 'left') && (this.#snakeDirection == 'right' || this.#snakeDirection == 'left')) ||
      ((value == 'down' || value == 'up') && (this.#snakeDirection == 'down' || this.#snakeDirection == 'up'))
    )) this.#tempDirection = value; // проверяем, чтобы заданное нами направление не было равно или протвоположно (+180deg) текущему. 
  }
  get direction() {
    return this.#tempDirection;
  }

  addPart(x, y, ...partsClasses) {
    const part = document.createElement('div');
    partsClasses.forEach((item) => part.classList.add(item))
    part.style.gridColumnStart = x;
    part.style.gridRowStart = y;
    this.#playField.append(part);
    this.parts.push(part);
  }

  moveSnake() {
    this.#snakeDirection = this.direction;
    let dx, dy;
    switch (this.#snakeDirection) {
      case 'right': dx = 1; dy = 0; break;
      case 'down': dx = 0; dy = 1; break;
      case 'left': dx = -1; dy = 0; break;
      case 'up': dx = 0; dy = -1; break;
    };
    const snakeHeadStyle = getComputedStyle(this.parts[0]);
    let snakeHeadX = dx + +snakeHeadStyle.gridColumnStart;
    let snakeHeadY = dy + +snakeHeadStyle.gridRowStart;
    let snakeTaleEnd = document.querySelector('.snake-tale:last-child'); // самый последний сегмент хвоста змеи
    let targetCellElem = document.elementFromPoint(...this.getXY(snakeHeadX, snakeHeadY));
    if (targetCellElem != this.#playField) {
      if (targetCellElem.classList.contains('apple')) {  // является ли яблоком встреченный на пути объект 
        const appleID = +targetCellElem.getAttribute('apple-id');
        apples.setNewRandomPos(appleID);
        this.addPart(1, 1, 'snake-parts', 'snake-tale');
        scoreValue.increase();
        scoreBoard.textContent = scoreValue.value;
      } else if (targetCellElem != snakeTaleEnd) {  
        // условие выше: если в целевой ячейке находится кончик хвоста, то мы можем двигаться в эту ячейку, т.к. в следующем ходу ее там уже не будет
        deathScreen.score = scoreValue.value;
        scoreValue.value = 0;
        scoreBoard.textContent = scoreValue.value;
        deathScreen.visible = true;
        return;
      }
    }
    for (let i = this.parts.length - 1; i > 0; i--) {
      this.parts[i].style.gridColumnStart = this.parts[i - 1].style.gridColumnStart;
      this.parts[i].style.gridRowStart = this.parts[i - 1].style.gridRowStart;
    }
    if (['left', 'right'].includes(this.#snakeDirection) &&
      snakeHeadX >= 1 &&
      snakeHeadX <= this.#playFieldColumns) {
      this.parts[0].style.gridColumnStart = snakeHeadX;
      this.parts[0].classList.remove('up', 'right', 'down', 'left')
      this.parts[0].classList.add(this.#snakeDirection);
    };
    if (['up', 'down'].includes(this.#snakeDirection) &&
      snakeHeadY >= 1 &&
      snakeHeadY <= this.#playFieldRows) {
      this.parts[0].style.gridRowStart = snakeHeadY
      this.parts[0].classList.remove('up', 'right', 'down', 'left')
      this.parts[0].classList.add(this.#snakeDirection);
    };
  }

  keyAction(event) {
    switch (event.code) {
      case 'ArrowUp':
      case 'KeyW':
        this.direction = 'up';
        // this.movdweSnake();
        break;
      case 'ArrowLeft':
      case 'KeyA':
        this.direction = 'left';
        // this.moveSnake();
        break;
      case 'ArrowDown':
      case 'KeyS':
        this.direction = 'down';
        // this.moveSnake();
        break;
      case 'ArrowRight':
      case 'KeyD':
        this.direction = 'right';
        // this.moveSnake();
        break;
    }
  };

  // На входе: столбец и строка нужной клетки игрового поля, на выходе: координаты XY центра клетки
  getXY(column, row) {
    const playFieldStyle = getComputedStyle(this.#playField);
    const playFieldBorder = parseInt(playFieldStyle.borderWidth);
    const playFieldOffset = this.#playField.getBoundingClientRect()
    const width = playFieldOffset.width - (2 * playFieldBorder);
    const height = playFieldOffset.height - (2 * playFieldBorder);
    let x = playFieldBorder + playFieldOffset.left + (width / this.#playFieldColumns) * (column - 0.5);
    let y = +playFieldBorder + playFieldOffset.top + (height / this.#playFieldRows) * (row - 0.5);
    return [x, y];
  }
};

class DeathScreenClass {
  element;
  #playField;
  #tryButton;
  #mainMenuButton;
  #scorePanel;
  constructor(playField) {
    this.#playField = playField;
    this.element = document.querySelector('.death-screen');
    this.element.style.display = 'none'
    this.#scorePanel = this.element.querySelector('.score__value');
    this.#tryButton = this.element.querySelector('.death-screen__retry');
    this.#mainMenuButton = this.element.querySelector('.death-screen__go-menu');
    this.element.addEventListener('click', (event) => {
      switch (event.target) {
        case this.#tryButton:
          this.visible = false;
          newGame();
          break;
        case this.#mainMenuButton:
          this.visible = false;
          mainScreen.visible = true;
          break;
      }
    });
  }
  get visible() {
    return this.element.style.display != 'none';
  }
  set visible(value) {
    if (value) {
      this.element.style.display = 'block'
      scoreBoard.parentElement.style.display = 'none';
      gameStop = true;
    } else {
      this.element.style.display = 'none'
      scoreBoard.parentElement.style.display = 'block';
      gameStop = false;
    };
  }
  set score(value) {
    this.#scorePanel.textContent = value;
  }
}

class MainScreenClass {
  #playField;
  element;
  startButton;

  levelElem;
  levelElemUp;
  levelElemDown;

  applesElem;
  applesElemUp;
  applesElemDown;

  constructor(playField) {
    this.#playField = playField;
    this.element = document.querySelector('.main-screen');
    this.element.style.display = 'none';
    this.startButton = this.element.querySelector('.main-screen__start');

    this.levelElem = this.element.querySelector('.main-screen__level-count');
    this.levelElem.textContent = gameLevel;
    this.levelElemUp = this.element.querySelector('.main-screen__level-up');
    this.levelElemDown = this.element.querySelector('.main-screen__level-down');

    this.applesElem = this.element.querySelector('.main-screen__apples-count');
    this.applesElem.textContent = apples.count;
    this.applesElemUp = this.element.querySelector('.main-screen__apples-up');
    this.applesElemDown = this.element.querySelector('.main-screen__apples-down');
    this.visible = true;

    this.element.addEventListener('click', (event) => {
      switch (event.target) {
        case this.startButton:
          this.visible = false; newGame(); break;
        case this.levelElemDown:
          if (gameLevel > 1) gameLevel--; this.levelElem.textContent = gameLevel; break;
        case this.levelElemUp:
          if (gameLevel < 5) gameLevel++; this.levelElem.textContent = gameLevel; break;
        case this.applesElemDown:
          if (apples.count > 1) apples.count--; this.applesElem.textContent = apples.count; break;
        case this.applesElemUp:
          if (apples.count < 10) apples.count++; this.applesElem.textContent = apples.count; break;
      }
    });

  }
  get visible() {
    return this.element.style.display != 'none';
  }
  set visible(value) {
    if (value) {
      this.element.style.display = 'block';
      this.applesElem.textContent = apples.count;
      scoreBoard.parentElement.style.display = 'none';
      gameStop = true;
    } else {
      this.element.style.display = 'none';
      scoreBoard.parentElement.style.display = 'block';
      gameStop = false;
    };
  }

}

class PauseScreenClass {
  element;
  #playField;
  #resumeButton;
  #mainMenuButton;
  constructor(playField) {
    this.#playField = playField;
    this.element = document.querySelector('.pause-screen');
    this.#resumeButton = this.element.querySelector('.pause-screen__resume');
    this.#mainMenuButton = this.element.querySelector('.pause-screen__go-menu');
    this.visible = false;
    this.element.addEventListener('click', (event) => {
      switch (event.target) {
        case this.#resumeButton:
          this.visible = false;
          break;
        case this.#mainMenuButton:
          this.visible = false;
          mainScreen.visible = true;
          break;
      }
    });
    document.addEventListener('keydown', (event) => {
      if (event.code == 'Escape' || event.code == 'Space') {
        if (gameStop) return console.log(111);
        this.toggle();
      };
    });
  }

  toggle() {
    switch (this.visible) {
      case true: this.visible = false; break;
      case false: this.visible = true; break;
    }
  };
  get visible() {
    return this.element.style.display != 'none';
  }
  set visible(value) {
    // if (gameStop) return;
    if (value) {
      this.element.style.display = 'block'
      isPaused = true;
    } else {
      this.element.style.display = 'none'
      isPaused = false;
    };
  }
}

class ScoreClass {
  #data = 0;
  #digits;
  constructor(digits) {
    this.#digits = digits;
  }
  set value(data) {
    this.#data = data;
  }
  get value() {
    let res = String(this.#data);
    while (res.length < this.#digits) {
      res = '0' + res;
    }
    return res;
  }
  increase(increment = 10) {
    this.#data += increment;
  }
}

function turnOnCursorTracking() {
  const cursorTracker = document.querySelector('.cursor-coords');
  const cursorTrackerX = cursorTracker.querySelector('p:nth-child(1)>span');
  const cursorTrackerY = cursorTracker.querySelector('p:nth-child(2)>span');
  document.addEventListener('mousemove', (event) => {
    cursorTrackerX.textContent = event.clientX;
    cursorTrackerY.textContent = event.clientY;
  })
  cursorTracker.style.display = 'block';
}

function newGame() {
  snake.positionSnake(); //обнуляем змейку при смерти
  apples.createElement();
  isPaused = false;
};

// turnOnCursorTracking(); // включить отслеживание координат курсора

let isPaused = false; // признак паузы
let gameStop = false; // признак главного меню или меню Game Over
let gameLevel = 4; // уровень от 1 до 5

const scoreValue = new ScoreClass(5);
const scoreBoard = document.querySelector('.score-board__container span');
scoreBoard.textContent = scoreValue.value;

const snake = new SnakeClass(playField);
const apples = new ApplesClass(playField);

const deathScreen = new DeathScreenClass(playField);
const mainScreen = new MainScreenClass(playField);
const pauseScreen = new PauseScreenClass(playField);

document.addEventListener('keydown', (event) => {
  if (!isPaused && !gameStop) snake.keyAction(event);
})

function moveSnakeForEvent() {
  if (!isPaused && !gameStop) snake.moveSnake();
  setTimeout(moveSnakeForEvent, 600 - 100 * gameLevel);
};
const snakeMove = setTimeout(moveSnakeForEvent, 600 - 100 * gameLevel);
