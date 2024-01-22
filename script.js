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

startGame();

restarttButton.addEventListener("click", startGame);

const socket = new WebSocket("ws://localhost:5501");
socket.onopen = (event) => {
  socket.send(
    JSON.stringify({
      type: "name",
    })
  );
};

const sendPlayerInfoToServer = ({
  type,
  playerXMoves,
  playerCircleMoves,
  isCircleTurn,
}) => {
  let sendObj = {};
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
    console.log("turn sendObj");
    sendObj = {
      type: "turn",
      data: { isCircleTurn },
    };
  }
  socket.send(JSON.stringify(sendObj));
};

const receivePlayerMoveFromServer = () => {
  socket.onmessage = (event) => {
    const replyFromServer = JSON.parse(event.data);
    console.log("replyFromServer", replyFromServer);
    if (replyFromServer.type === "move") {
      cellElements.forEach((cell, index) => {
        const PLAYER_O_MOVES = replyFromServer.data.PLAYER_O;
        const PLAYER_X_MOVES = replyFromServer.data.PLAYER_X;
        console.log("PLAYER_O_MOVES", PLAYER_O_MOVES);
        if (PLAYER_O_MOVES.includes(index)) {
          console.log("test reply from server");
          cell.classList.add(CIRCLE_CLASS);
        }
        if (PLAYER_X_MOVES.includes(index)) {
          cell.classList.add(X_CLASS);
        }
      });
    }

    if (replyFromServer.type === "turn") {
      console.log("turn received from server");
      circleTurn = replyFromServer.data.isCircleTurn;
      console.log("circle turn", circleTurn);
    }
  };
};

receivePlayerMoveFromServer();
// socket.onmessage = (event) => {
//   console.log("message form server " + event.data);
// };

function startGame() {
  circleTurn = false;
  //   sendPlayerInfoToServer({ type: "turn", isCircleTurn: circleTurn });
  cellElements.forEach((cell) => {
    cell.classList.remove(X_CLASS);
    cell.classList.remove(CIRCLE_CLASS);

    cell.removeEventListener("click", handleClick);
    cell.addEventListener("click", handleClick, { once: true });
  });
  setBoardHoverClass();
  winningMessageTextElement.classList.remove("show");
}

function handleClick(e) {
  //place mark
  //switch turn
  //check for win
  //check for draw

  const cell = e.target;
  const currentClass = circleTurn ? CIRCLE_CLASS : X_CLASS;
  //   console.log("cell index", cellElements.indexOf(cell));
  placeMark(cell, currentClass);
  // if (checkWin(currentClass)) {
  //   endGame(false);
  // } else if (isDraw()) {
  //   endGame(true);
  // } else {
  // swapTurn();
  setBoardHoverClass();
  // }
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
  // sendPlayerInfoToServer({ type: "turn", isCircleTurn: !circleTurn });
}

function setBoardHoverClass() {
  board.classList.remove(X_CLASS);
  board.classList.remove(CIRCLE_CLASS);
  console.log("HOVER BOARD", circleTurn);
  if (currentPlayer === PLAYERS.PLAYER_O) {
    board.classList.add(CIRCLE_CLASS);
  } else {
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
