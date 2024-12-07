class TicTacToe {
  constructor() {
    this.cellElements = document.querySelectorAll("[data-cell]");
    this.circleTurn = false;
    this.isPair = false;
    this.currentPlayer = null;
    this.receiverPlayer = null;

    this.aiSocket = null;

    this.WINNING_COMBINATIONS = Object.freeze([
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ]);

    this.X_CLASS = "x";
    this.CIRCLE_CLASS = "circle";
    this.PLAYERS = Object.freeze({
      PLAYER_X: "PLAYER_X",
      PLAYER_O: "PLAYER_O",
    });

    this.board = document.getElementById("board");
    this.playerTurn = document.querySelector("#player-turn");
    this.winningMessageText = document.querySelector(
      "[data-winning-message-text]"
    );
    this.winningMessageTextElement = document.getElementById("winning-message");
    this.restartButton = document.getElementById("restartButton");
    this.playerModeOptions = document.getElementById("playmode-options");
    this.playerModeOptions.classList.add("show");

    //socket setup for multiplayer
    document
      .querySelector("#multiplayer-button")
      .addEventListener("click", () => {
        this.aiMode = false;
        this.socket = new WebSocket("ws://localhost:5501");
        this.setupSocketEvents();
        this.startGame();
      });

    //socket setup for single player neural net
    document.querySelector("#ai-mode-button").addEventListener("click", () => {
      this.aiMode = true;
      this.AI_SOCKET_URL = "ws://localhost:8765";
      this.setupAISocket();
      this.startGame();
    });

    this.restartButton.addEventListener("click", () => this.startGame());
  }

  setupSocketEvents() {
    this.socket.onopen = (event) => {
      console.log("Socket connected:", event);
      this.socket.send(JSON.stringify({ type: "name" }));
      this.receivePlayerInfoFromServer();
    };
  }

  setupAISocket() {
    this.aiSocket = new WebSocket(this.AI_SOCKET_URL);
    this.aiSocket.onopen = (event) => {
      console.log("Connected to AI server");
    };

    this.aiSocket.onmessage = (event) => {
      const replyFromAIServer = JSON.parse(event.data);

      if (replyFromAIServer.type === "aiMove") {
        // Update board with AI's move
        const aiMoveIndex = replyFromAIServer.move;
        const cell = this.cellElements[aiMoveIndex];
        console.log("heres AI MOVES", aiMoveIndex, cell);
        this.handleClick(cell);

        this.currentPlayer = this.PLAYERS.PLAYER_X;
        // const currentClass = this.circleTurn ? this.CIRCLE_CLASS : this.X_CLASS;

        // this.placeMark(cell, currentClass);

        // if (this.checkWin(currentClass)) {
        //   this.endGame(false);
        // } else if (this.isDraw()) {
        //   this.endGame(true);
        // } else {
        //   this.swapTurn();
        //   this.updatePlayerTurn();
        //   this.setBoardHoverClass();
        //   if (this.aiMode && !this.circleTurn) {
        //     const boardState = [...this.cellElements].map((cell) => {
        //       if (cell.classList.contains(this.X_CLASS)) return "X";
        //       if (cell.classList.contains(this.CIRCLE_CLASS)) return "O";
        //       return null;
        //     });

        //     this.aiSocket.send(
        //       JSON.stringify({
        //         type: "playerMove",
        //         board: boardState,
        //       })
        //     );
        //   }
        // }
      }
    };

    this.aiSocket.onclose = () => {
      console.log("Disconnected from AI server");
    };

    this.aiSocket.onerror = (error) => {
      console.error("AI server error:", error);
    };
  }

  sendPlayerInfoToServer({
    type,
    playerXMoves,
    playerCircleMoves,
    isCircleTurn,
    isDraw,
  }) {
    if (this.aiMode) return;
    const payload = { type, data: {} };
    if (type === "isPair") payload.data = {};
    if (type === "move") {
      payload.data = {
        PLAYER_X: [...playerXMoves],
        PLAYER_O: [...playerCircleMoves],
      };
    }
    if (type === "turn") payload.data = { isCircleTurn };
    if (type === "endGame") payload.data = { isDraw };

    this.socket.send(JSON.stringify(payload));
    this.receivePlayerInfoFromServer();
  }

  receivePlayerInfoFromServer() {
    if (this.aiMode) return;
    this.socket.onmessage = (event) => {
      const replyFromServer = JSON.parse(event.data);
      console.log("Reply from server:", replyFromServer);

      switch (replyFromServer.type) {
        case "assignName":
          this.currentPlayer = replyFromServer.name;
          this.assignPlayer();
          this.updatePlayerTurn();
          this.setBoardHoverClass();
          this.checkPair();
          break;

        case "isPair":
          this.isPair = replyFromServer.data.isPair;
          this.updatePlayerTurn();
          break;

        case "move":
          this.updateBoardFromServer(replyFromServer.data);
          break;

        case "turn":
          this.circleTurn = replyFromServer.data.isCircleTurn;
          this.receiverPlayer = replyFromServer.name;
          this.updatePlayerTurn();
          this.setBoardHoverClass();
          break;

        case "endGame":
          this.endGame(replyFromServer.data.isDraw);
          break;

        case "disconnect":
          this.startGame();
          this.isPair = replyFromServer.data.isPair;
          this.updatePlayerTurn();
          break;
      }
    };
  }

  updateBoardFromServer(data) {
    const { PLAYER_O, PLAYER_X } = data;
    this.cellElements.forEach((cell, index) => {
      if (PLAYER_O.includes(index)) cell.classList.add(this.CIRCLE_CLASS);
      if (PLAYER_X.includes(index)) cell.classList.add(this.X_CLASS);
    });
  }

  startGame() {
    this.circleTurn = false;

    this.cellElements.forEach((cell) => {
      cell.classList.remove(this.X_CLASS, this.CIRCLE_CLASS);
      cell.removeEventListener("click", this.handleClick);
      cell.addEventListener("click", (e) => this.handleClick(e.target), {
        once: true,
      });
    });

    this.winningMessageTextElement.classList.remove("show");
    this.playerModeOptions.classList.remove("show");

    if (!this.aiMode && this.currentPlayer) {
      this.sendPlayerInfoToServer({
        type: "turn",
        isCircleTurn: this.circleTurn,
      });
    }

    if (this.aiMode) {
      this.currentPlayer = this.PLAYERS.PLAYER_X;
      this.assignPlayer();
      this.updatePlayerTurn();
      this.setBoardHoverClass();
    }
    // if (this.aiMode) {
    //   this.currentPlayer = this.PLAYERS.PLAYER_X;
    // }
  }

  handleClick(clickedCell) {
    const cell = clickedCell;
    const currentClass = this.circleTurn ? this.CIRCLE_CLASS : this.X_CLASS;
    console.log(
      "hereeeee circle turn,currentPlayer",
      this.circleTurn,
      this.currentPlayer
    );
    if (!this.isPair && !this.aiMode) return;

    // //handle ai case if ai lags and player move too fast
    // if (
    //   this.aiMode &&
    //   this.currentPlayer === this.PLAYERS.PLAYER_X &&
    //   this.circleTurn === true
    // )
    //   return;

    if (this.circleTurn && this.currentPlayer === this.PLAYERS.PLAYER_X) return;
    if (!this.circleTurn && this.currentPlayer === this.PLAYERS.PLAYER_O)
      return;

    this.placeMark(cell, currentClass);
    if (!this.aiMode) {
      this.playMultiPlayer(currentClass);
      return;
    }

    setTimeout(() => {
      this.playWithAI(currentClass);
    }, 500);
  }

  placeMark(cell, currentClass) {
    cell.classList.add(currentClass);
  }

  swapTurn() {
    this.circleTurn = !this.circleTurn;
  }

  checkWin(currentClass) {
    return this.WINNING_COMBINATIONS.some((combination) => {
      return combination.every((index) => {
        return this.cellElements[index].classList.contains(currentClass);
      });
    });
  }

  isDraw() {
    return [...this.cellElements].every((cell) => {
      return (
        cell.classList.contains(this.X_CLASS) ||
        cell.classList.contains(this.CIRCLE_CLASS)
      );
    });
  }

  endGame(draw) {
    this.winningMessageText.innerText = draw
      ? "Draw"
      : `${this.circleTurn ? "O" : "X"} Wins!`;
    this.winningMessageTextElement.classList.add("show");
  }

  setBoardHoverClass() {
    this.board.classList.remove(this.X_CLASS, this.CIRCLE_CLASS);
    if (this.currentPlayer === this.PLAYERS.PLAYER_O) {
      this.board.classList.add(this.CIRCLE_CLASS);
    } else if (this.currentPlayer === this.PLAYERS.PLAYER_X) {
      this.board.classList.add(this.X_CLASS);
    }
  }

  assignPlayer() {
    const playerNameElement = document.getElementById("player-name");
    playerNameElement.innerHTML = this.currentPlayer || "";
  }

  updatePlayerTurn() {
    if (this.aiMode) {
      this.playerTurn.innerHTML = this.circleTurn ? "AI's Turn" : "Your Turn";
      return;
    }
    if (!this.isPair) {
      this.playerTurn.innerHTML = "Waiting for another player to join...";
      return;
    }
    this.playerTurn.innerHTML =
      this.circleTurn && this.currentPlayer === this.PLAYERS.PLAYER_O
        ? "Your Turn"
        : !this.circleTurn && this.currentPlayer === this.PLAYERS.PLAYER_X
        ? "Your Turn"
        : "Opponent's Turn";
  }

  checkPair() {
    this.sendPlayerInfoToServer({ type: "isPair" });
  }

  playMultiPlayer(currentClass) {
    const playerXMoves = [];
    const playerCircleMoves = [];

    this.cellElements.forEach((cell, index) => {
      if (cell.classList.contains(this.X_CLASS)) playerXMoves.push(index);
      if (cell.classList.contains(this.CIRCLE_CLASS))
        playerCircleMoves.push(index);
    });

    this.sendPlayerInfoToServer({
      type: "move",
      playerXMoves,
      playerCircleMoves,
    });

    if (this.checkWin(currentClass)) {
      this.endGame(false);
      this.sendPlayerInfoToServer({ type: "endGame", isDraw: false });
    } else if (this.isDraw()) {
      this.endGame(true);
      this.sendPlayerInfoToServer({ type: "endGame", isDraw: true });
    } else {
      this.swapTurn();
      this.updatePlayerTurn();
      this.sendPlayerInfoToServer({
        type: "turn",
        isCircleTurn: this.circleTurn,
      });
    }
  }

  playWithAI(currentClass) {
    if (this.checkWin(currentClass)) {
      this.endGame(false);
    } else if (this.isDraw()) {
      this.endGame(true);
    } else {
      this.swapTurn();
      this.updatePlayerTurn();
      this.setBoardHoverClass();

      if (this.aiMode && this.circleTurn) {
        // in board for neural net PLAYER_X=1,PLAYER_O(ai) = -1
        // board blank = 0
        this.currentPlayer = this.PLAYERS.PLAYER_O;
        const boardState = [...this.cellElements].map((cell) => {
          if (cell.classList.contains(this.X_CLASS)) return 1;
          if (cell.classList.contains(this.CIRCLE_CLASS)) return -1;
          return 0;
        });
        this.aiSocket.send(
          JSON.stringify({
            type: "playerMove",
            board: boardState,
          })
        );
      }
    }
  }

  getRandomDelay(max, min) {
    return Math.random() * (max - min) + min;
  }
}

const game = new TicTacToe();
