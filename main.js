class Saper {
  constructor(board, fields, bombs) {
    this.bombs = bombs;
    this.board = [];
    this.fields = fields;
    this.boardElem = board;
    this.counter = document.getElementById("counter");
    this.timer = document.getElementById("timer");
    this.indexInterval = null;
    this.flagCounter = 0;
    this.btnsElems = [];
    this.bombsTab = [];
  }

  //helpers
  randomNumber(number) {
    return Math.floor(Math.random() * number);
  }

  getBtn(x, y) {
    return document.querySelector(`[data-x="${x}"][data-y="${y}"]`);
  }
  //end helpers

  generateBoard() {
    for (let y = 0; y < this.fields; y++) {
      this.board[y] = [];
      for (let x = 0; x < this.fields; x++) {
        this.board[y][x] = 0;
      }
    }
  }

  placeBombs() {
    const tab = [];
    let i = this.bombs;
    while (i > 0) {
      const row = this.randomNumber(this.fields);
      const column = this.randomNumber(this.fields);

      // checking if bomb position doesnt repeat
      if (!tab.includes(`${row}${column}`)) {
        tab.push(`${row}${column}`);
        this.board[column][row] = -1;
        i--;
      }
    }
  }

  setNumbers() {
    for (let y = 0; y < this.fields; y++) {
      for (let x = 0; x < this.fields; x++) {
        if (this.board[y][x] !== -1) {
          let number = 0;

          const nearbyFields = this.nearbyFields(x, y);

          nearbyFields.forEach((elem) => {
            if (this.board[elem.y]?.[elem.x] === -1) number++;
          });

          this.board[y][x] = number;
        }
      }
    }
  }

  showFields() {
    for (let y = 0; y < this.fields; y++) {
      for (let x = 0; x < this.fields; x++) {
        const elem = document.createElement("div");
        elem.classList.add("btn");
        elem.dataset.y = y;
        elem.dataset.x = x;
        this.boardElem.appendChild(elem);

        // create tab that contains bombs position
        if (this.board[elem.dataset.y][elem.dataset.x] === -1) {
          this.bombsTab.push(elem);
        }
      }
    }
    this.boardElem.style.gridTemplateColumns = `repeat(${this.fields}, 1fr)`;

    // create global tab that contains all btns objects
    this.btnsElems = [...document.querySelectorAll("#board div")];
  }

  nearbyFields(x, y) {
    let tab = [];

    // checking 8 nearby fields
    for (let offsetX = -1; offsetX <= 1; offsetX++) {
      for (let offsetY = -1; offsetY <= 1; offsetY++) {
        const btn = this.getBtn(offsetX + x, offsetY + y);

        if (
          offsetX + x < this.fields &&
          offsetY + y < this.fields &&
          offsetY + y >= 0 &&
          offsetX + x >= 0 &&
          !btn?.classList.contains("btn--active") &&
          !btn?.classList.contains("flag")
        ) {
          const field = {
            element: btn,
            x: offsetX + x,
            y: offsetY + y,
          };

          tab.push(field);
        }
      }
    }
    return tab;
  }

  revealFields(nearbyFieldsTab) {
    nearbyFieldsTab.forEach((field) => {
      if (this.board[field.y]?.[field.x] === -1) return;

      field.element.classList.add("btn--active");
      field.element.classList.add(`btn--${this.board[field.y]?.[field.x]}`);

      if (this.board[field.y]?.[field.x] !== 0) {
        field.element.textContent = this.board[field.y]?.[field.x];
      } else {
        const tab = this.nearbyFields(field.x, field.y);
        this.revealFields(tab);
      }
    });
  }

  checkWin() {
    const filteredBombsTab = this.bombsTab.filter(
      (btn) => !btn.classList.contains("flag")
    );
    const filteredBtnsTab = this.btnsElems.filter(
      (btn) => btn.classList.length === 1
    );

    const contidional =
      filteredBombsTab.length === 0 &&
      filteredBtnsTab.length === 0 &&
      this.flagCounter === this.bombs;

    if (contidional) {
      const winElem = document.querySelector(".overlay-win");

      //win
      this.boardElem.classList.add("win");
      winElem.classList.add("active");
      clearInterval(this.indexInterval);
    }
  }

  rightClick(btn) {
    if (!btn.classList.contains("btn--active")) {
      if (btn.classList.contains("flag")) {
        btn.innerHTML = "";
        this.flagCounter--;
      } else {
        this.flagCounter++;
        //set flag icon
        btn.innerHTML = "&#128681;";
      }
      btn.classList.toggle("flag");
    }
  }

  leftClick(btn) {
    if (!btn.classList.contains("flag")) {
      const x = parseInt(btn.dataset.x);
      const y = parseInt(btn.dataset.y);
      const boardItem = this.board[y][x];
      if (boardItem === -1) {
        // set bomb icon
        btn.innerHTML = "&#128163;";

        this.defeat();
      } else if (boardItem === 0) {
        const nearbyFieldsTab = this.nearbyFields(x, y);
        this.revealFields(nearbyFieldsTab);
      } else {
        btn.textContent = boardItem;
        btn.classList.add("btn--active");
        btn.classList.add(`btn--${boardItem}`);
      }
    }
  }

  addListeners() {
    this.btnsElems.forEach((btn) => {
      btn.addEventListener("click", () => {
        this.leftClick(btn);
        this.checkWin();
      });
      btn.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        this.rightClick(btn);
        this.checkWin();
      });
    });
  }

  defeat() {
    this.boardElem.classList.add("lost");
    clearInterval(this.indexInterval);

    this.bombsTab.forEach((btn) => {
      if (!btn.classList.contains("flag")) {
        btn.innerHTML = "&#128163;";
      }
    });
  }

  setTime() {
    this.counter.textContent = this.bombs;
    let time = 0;

    this.indexInterval = setInterval(() => {
      this.timer.textContent = time;
      time++;
    }, 1000);
  }

  init() {
    this.generateBoard();
    this.placeBombs();
    this.setNumbers();
    this.showFields();
    this.addListeners();
    this.setTime();
  }

  destroy() {
    const winElem = document.querySelector(".overlay-win");
    winElem.classList.remove("active");
    this.boardElem.classList.remove("lost");
    this.boardElem.innerHTML = "";
    clearInterval(this.indexInterval);
  }
}

const easyBtn = document.getElementById("easy");
const mediumBtn = document.getElementById("medium");
const hardBtn = document.getElementById("hard");
const closeBtn = document.getElementById("close");
const board = document.getElementById("board");

let saper;

easyBtn.addEventListener("click", () => {
  if (!board.innerHTML) {
    saper = new Saper(board, 9, 10);
    saper.init();
    easyBtn.classList.add("active");
  }
});

mediumBtn.addEventListener("click", () => {
  if (!board.innerHTML) {
    saper = new Saper(board, 13, 30);
    saper.init();
    mediumBtn.classList.add("active");
  }
});

hardBtn.addEventListener("click", () => {
  if (!board.innerHTML) {
    saper = new Saper(board, 21, 50);
    saper.init();
    hardBtn.classList.add("active");
  }
});

closeBtn.addEventListener("click", () => {
  const counter = document.getElementById("counter");
  const timer = document.getElementById("timer");
  board.innerHTML = "";
  easyBtn.classList.remove("active");
  mediumBtn.classList.remove("active");
  hardBtn.classList.remove("active");
  counter.textContent = 0;
  timer.textContent = 0;
  saper?.destroy();
});
