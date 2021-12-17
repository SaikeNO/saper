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
  }

  generateBoard() {
    for (let y = 0; y < this.fields; y++) {
      this.board[y] = [];
      for (let x = 0; x < this.fields; x++) {
        this.board[y][x] = 0;
      }
    }
  }

  showFields() {
    for (let y = 0; y < this.board.length; y++) {
      for (let x = 0; x < this.board[y].length; x++) {
        const elem = document.createElement("div");
        elem.classList.add("btn");
        elem.dataset.y = y;
        elem.dataset.x = x;
        this.boardElem.appendChild(elem);
        this.boardElem.style.gridTemplateColumns = `repeat(${this.fields}, 1fr)`;
      }
    }
  }

  placeBombs() {
    const tab = [];
    let i = this.bombs;
    while (i > 0) {
      const row = Math.floor(Math.random() * this.fields);
      const column = Math.floor(Math.random() * this.fields);
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

          for (let offsetX = -1; offsetX <= 1; offsetX++) {
            for (let offsetY = -1; offsetY <= 1; offsetY++) {
              if (this.board[y + offsetY]?.[x + offsetX] === -1) number++;
            }
          }

          this.board[y][x] = number;
        }
      }
    }
  }

  setTime() {
    this.counter.textContent = this.bombs;
    let time = 0;

    this.indexInterval = setInterval(() => {
      this.timer.textContent = time;
      time++;
    }, 1000);
  }

  defeat(btns) {
    this.boardElem.classList.add("lost");
    clearInterval(this.indexInterval);

    for (let y = 0; y < this.fields; y++) {
      for (let x = 0; x < this.fields; x++) {
        btns.forEach((btn) => {
          const x = btn.dataset.x;
          const y = btn.dataset.y;
          const boardItem = this.board[y][x];
          if (boardItem === -1 && !btn.classList.contains("flag")) {
            btn.innerHTML = "&#128163;";
          }
        });
      }
    }
  }

  nearbyFields(x, y) {
    let tab = [];
    for (let offsetX = -1; offsetX <= 1; offsetX++) {
      for (let offsetY = -1; offsetY <= 1; offsetY++) {
        const btn = document.querySelector(
          `[data-x="${offsetX + x}"][data-y="${offsetY + y}"]`
        );

        if (
          offsetX + x < this.fields &&
          offsetY + y < this.fields &&
          offsetY + y >= 0 &&
          offsetX + x >= 0 &&
          !btn.classList.contains("btn--active") &&
          !btn.classList.contains("flag")
        ) {
          const tile = {
            element: btn,
            x: offsetX + x,
            y: offsetY + y,
          };
          tab.push(tile);
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
      }
      if (this.board[field.y]?.[field.x] === 0) {
        const tab = this.nearbyFields(field.x, field.y);
        this.revealFields(tab);
      }
    });
  }

  checkWin(btns) {
    let number = 0;
    const winElem = document.querySelector(".overlay-win");
    for (let y = 0; y < this.fields; y++) {
      for (let x = 0; x < this.fields; x++) {
        const btn = document.querySelector(`[data-x="${x}"][data-y="${y}"]`);
        if (this.board[y][x] === -1 && btn.classList.contains("flag")) number++;

        const tab = btns.filter((btn) => btn.classList.length === 1);

        let contidtional =
          number === this.bombs &&
          this.flagCounter === this.bombs &&
          tab.length === 0;

        if (contidtional) {
          this.boardElem.classList.add("win");
          winElem.classList.add("active");
        }
      }
    }
  }

  addListeners() {
    const btns = [...document.querySelectorAll("#board div")];

    btns.forEach((btn) => {
      btn.addEventListener("click", () => {
        if (!btn.classList.contains("flag")) {
          const x = parseInt(btn.dataset.x);
          const y = parseInt(btn.dataset.y);
          const boardItem = this.board[y][x];
          if (boardItem === -1) {
            btn.innerHTML = "&#128163;";
            this.defeat(btns);
          } else if (boardItem === 0) {
            const nearbyFieldsTab = this.nearbyFields(x, y);
            this.revealFields(nearbyFieldsTab);
          } else {
            btn.textContent = boardItem;
            btn.classList.add("btn--active");
            btn.classList.add(`btn--${boardItem}`);
          }
          this.checkWin(btns);
        }
      });
      btn.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        if (btn.classList.contains("flag")) {
          btn.innerHTML = "";
          this.flagCounter--;
        } else {
          this.flagCounter++;
          btn.innerHTML = "&#128681;";
        }
        btn.classList.toggle("flag");
        this.checkWin(btns);
      });
    });
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
    saper = new Saper(board, 7, 2);
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
    saper = new Saper(board, 17, 20);
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
  saper.destroy();
});
