const cellElements = document.querySelectorAll("[data-cell]");
let circleTurn;
const WINNING_COMBINATIONS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const winningMessageText = document.querySelector(
  "[data-winning-message-text]"
);

const winningMessageTextElement = document.getElementById("winning-message");
const restarttButton = document.getElementById("restartButton");
const X_CLASS = "x";
const CIRCLE_CLASS = "circle";
const board = document.getElementById("board");

const PLAYERS = Object.freeze({ PLAYER_X: "PLAYER_X", PLAYER_O: "PLAYER_O" });

let receiverPlayer;
let currentPlayer;

const playerTurn = document.querySelector("#player-turn");

//Only Pair can play the game
let isPair;

startGame();

restarttButton.addEventListener("click", startGame);

const socket = new WebSocket("ws://localhost:5501");
socket.onopen = (event) => {
  // console.log("client side event",event);
  socket.send(
    JSON.stringify({
      type: "name",
    })
  );
  receivePlayerInfoFromServer();
};

function sendPlayerInfoToServer({
  type,
  playerXMoves,
  playerCircleMoves,
  isCircleTurn,
  isDraw,
}) {
  let sendObj = {};
  if (type === "isPair") {
    sendObj = {
      type: "isPair",
    };
  }

  if (type === "move") {
    sendObj = {
      type: "move",
      data: {
        PLAYER_X: [...playerXMoves],
        PLAYER_O: [...playerCircleMoves],
      },
    };
  }

  if (type === "turn") {
    sendObj = {
      type: "turn",
      data: { isCircleTurn },
    };
  }

  if (type === "endGame") {
    sendObj = {
      type: "endGame",
      data: { isDraw },
    };
  }
  socket.send(JSON.stringify(sendObj));
  receivePlayerInfoFromServer();
}

console.log("isPair", isPair);
const receivePlayerInfoFromServer = () => {
  socket.onmessage = (event) => {
    const replyFromServer = JSON.parse(event.data);
    console.log("reply from server", replyFromServer);
    if (replyFromServer.type === "assignName") {
      currentPlayer = replyFromServer.name;
      assignPlayer();
      updatePlayerTurn();
      setBoardHoverClass();
      checkPair();
    }

    if (replyFromServer.type === "isPair") {
      isPair = replyFromServer.data.isPair;
      console.log("isPair in client", isPair);
      updatePlayerTurn();
    }

    if (replyFromServer.type === "move") {
      cellElements.forEach((cell, index) => {
        const PLAYER_O_MOVES = replyFromServer.data.PLAYER_O;
        const PLAYER_X_MOVES = replyFromServer.data.PLAYER_X;
        if (PLAYER_O_MOVES.includes(index)) {
          cell.classList.add(CIRCLE_CLASS);
        }
        if (PLAYER_X_MOVES.includes(index)) {
          cell.classList.add(X_CLASS);
        }
      });
    }

    if (replyFromServer.type === "turn") {
      circleTurn = replyFromServer.data.isCircleTurn;
      receiverPlayer = replyFromServer.name;
      updatePlayerTurn();
      setBoardHoverClass();
    }

    if (replyFromServer.type === "endGame") {
      endGame(replyFromServer.data.isDraw);
    }

    if (replyFromServer.type === "disconnect") {
      startGame();
      isPair = replyFromServer.data.isPair;
      updatePlayerTurn();
    }
  };
};

function startGame() {
  circleTurn = false;
  if (currentPlayer) {
    sendPlayerInfoToServer({ type: "turn", isCircleTurn: circleTurn });
  }
  //if it is already set to true then dont change to false
  if (!isPair) isPair = false;

  cellElements.forEach((cell) => {
    cell.classList.remove(X_CLASS);
    cell.classList.remove(CIRCLE_CLASS);

    cell.removeEventListener("click", handleClick);
    cell.addEventListener("click", handleClick, { once: true });
  });
  winningMessageTextElement.classList.remove("show");
}

function handleClick(e) {
  //place mark
  //switch turn
  //check for win
  //check for draw
  const cell = e.target;
  const currentClass = circleTurn ? CIRCLE_CLASS : X_CLASS;
  //Only pair can play tic tac toe;
  if (!isPair) return;
  //In circle Turn PLAYER_O can only click and vice versa
  if (circleTurn && currentPlayer === PLAYERS.PLAYER_X) return;
  if (!circleTurn && currentPlayer === PLAYERS.PLAYER_O) return;

  placeMark(cell, currentClass);
  if (checkWin(currentClass)) {
    endGame(false);
    sendPlayerInfoToServer({ type: "endGame", isDraw: false });
    updatePlayerTurn();
  } else if (isDraw()) {
    endGame(true);
    sendPlayerInfoToServer({ type: "endGame", isDraw: true }); //
    updatePlayerTurn();
  } else {
    swapTurn();
    playerTurn.innerHTML = "";
    sendPlayerInfoToServer({ type: "turn", isCircleTurn: circleTurn });
  }
}

function endGame(draw) {
  if (draw) {
    winningMessageText.innerText = "Draw";
  } else {
    winningMessageText.innerText = `${circleTurn ? "O" : "X"} Wins!`;
  }
  winningMessageTextElement.classList.add("show");
}

function isDraw() {
  return [...cellElements].every((cell) => {
    return (
      cell.classList.contains(X_CLASS) || cell.classList.contains(CIRCLE_CLASS)
    );
  });
}

function placeMark(cell, currentClass) {
  if (currentClass === X_CLASS && currentPlayer === PLAYERS.PLAYER_X) {
    cell.classList.add(currentClass);
  }

  if (currentClass === CIRCLE_CLASS && currentPlayer === PLAYERS.PLAYER_O) {
    cell.classList.add(currentClass);
  }

  const playerXMoves = [];
  const playerCircleMoves = [];

  cellElements.forEach((cell, index) => {
    if (cell.classList.contains("x")) {
      playerXMoves.push(index);
    }

    if (cell.classList.contains("circle")) {
      playerCircleMoves.push(index);
    }
  });

  sendPlayerInfoToServer({ type: "move", playerXMoves, playerCircleMoves });
}

function swapTurn() {
  circleTurn = !circleTurn;
}

function setBoardHoverClass() {
  board.classList.remove(X_CLASS);
  board.classList.remove(CIRCLE_CLASS);
  if (currentPlayer === PLAYERS.PLAYER_O) {
    board.classList.add(CIRCLE_CLASS);
  } else if (currentPlayer === PLAYERS.PLAYER_X) {
    board.classList.add(X_CLASS);
  }
}

function checkWin(currentClass) {
  return WINNING_COMBINATIONS.some((combination) => {
    return combination.every((index) => {
      return cellElements[index].classList.contains(currentClass);
    });
  });
}

function assignPlayer() {
  console.log(currentPlayer);
  if (currentPlayer) {
    const playerNameElement = document.getElementById("player-name");
    playerNameElement.innerHTML = currentPlayer;
  }
}

function updatePlayerTurn() {
  if (circleTurn && currentPlayer === PLAYERS.PLAYER_O && isPair) {
    playerTurn.innerHTML = `Your Turn`;
  } else if (!circleTurn && currentPlayer === PLAYERS.PLAYER_X && isPair) {
    playerTurn.innerHTML = `Your Turn`;
  } else if (!isPair) {
    playerTurn.innerHTML = "Please wait for the other player to join!";
  } else {
    playerTurn.innerHTML = "";
  }
}

function checkPair() {
  console.log("RUNNING CHECK PAIR");
  sendPlayerInfoToServer({ type: "isPair" });
}
