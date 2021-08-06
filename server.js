const server = require("http").createServer();
const io = require("socket.io")(server);

const PORT = 5050;

let usersConnected = 0;
let clientsConnected = {};
let firstPlayer = {};
let secondPlayer = {};
let unmatched = true;
// Starting turn at 2 to be able to use modulus effectively to determine even or odd.
let turn = 2;
let boardState = [
  [".", ".", "."],
  [".", ".", "."],
  [".", ".", "."],
];

io.on("connection", (socket) => {
  let id = socket.id;

  addClient(socket);

  io.on("disconnect", () => {
    socket.broadcast.emit("clientdisconnect", id);
    removeClient(socket);
  });

  socket.on("moveMade", ({ socketId, selection, playerSymbol }) => {
    console.log(
      socketId + "with symbol: " + playerSymbol + " at location " + selection
    );
    updateBoard(playerSymbol, selection);
    checkForGameOver(socketId);
    newTurn();
  });

  socket.on("resigning", ({ socketId }) => {
    if (socketId === firstPlayer.socketId) {
      io.to(socketId).emit("resigned", "You lost via resignation.");
      io.to(secondPlayer.socketId).emit(
        "wonViaResign",
        "You won via opponent resigning."
      );
      endGame();
    } else {
      io.to(secondPlayer.socketId).emit(
        "resigned",
        "You lost via resignation."
      );
      io.to(firstPlayer.socketId).emit(
        "wonViaResign",
        "You won via opponent resigning."
      );
      endGame();
    }
  });
});

const addClient = (socket) => {
  console.log("Client has connected.", socket.id);
  clientsConnected[socket.id] = socket;
  convertSocketToPlayer(socket);
  usersConnected++;
  if (usersConnected === 2) {
    startingGame(socket);
  }
};

const removeClient = (socket) => {
  console.log("Client has disconnected.", socket.id);
  delete clientsConnected[socket.id];
  usersConnected--;
};

const convertSocketToPlayer = (socket) => {
  if (unmatched) {
    firstPlayer = {
      playersSocket: socket,
      socketId: socket.id,
      symbol: "X",
      firstPlayer: true,
      opponentsSocket: null,
    };
    unmatched = false;
    return;
  }
  secondPlayer = {
    playersSocket: socket,
    socketId: socket.id,
    symbol: "O",
    firstPlayer: false,
    opponentsSocket: null,
  };
};

const startingGame = (socket) => {
  firstPlayer.opponentsSocket = secondPlayer.playersSocket;
  secondPlayer.opponentsSocket = firstPlayer.playersSocket;
  console.log("Starting the game.");
  console.log("Sending game has started messages.");
  io.to(firstPlayer.socketId).emit(
    "gameStartMessage",
    "Game Started. You are the first player."
  );
  io.to(secondPlayer.socketId).emit(
    "gameStartMessage",
    "Game Started. You are the second player."
  );
  newTurn(firstPlayer.playersSocket);
};

const newTurn = (socket) => {
  if (turn % 2 === 0) {
    turn++;
    showBoard();
    io.to(firstPlayer.socketId).emit("yourTurn", {
      message:
        "Your turn. Make a valid move via typing or using history (up and down arrows) to make a selection.",
      playerSymbol: firstPlayer.symbol,
    });
    io.to(secondPlayer.socketId).emit("opponentsTurn", {
      message: "Your opponent is taking his turn.  Type resign or r to resign.",
    });
  } else {
    turn++;
    showBoard();
    io.to(secondPlayer.socketId).emit("yourTurn", {
      message:
        "Your turn. Make a valid move via typing or using history (up and down arrows) to make a selection.",
      playerSymbol: secondPlayer.symbol,
    });
    io.to(firstPlayer.socketId).emit("opponentsTurn", {
      message: "Your opponent is taking his turn.  Type resign or r to resign.",
    });
  }
};

const showBoard = () => {
  io.local.emit(
    "boardState",
    `
    ${boardState[0].join("")}
    ${boardState[1].join("")}
    ${boardState[2].join("")}`
  );
};

const updateBoard = (playerSymbol, selection) => {
  selection = parseInt(selection);
  switch (selection) {
    case 1:
      boardState[0][0] = playerSymbol;
      break;
    case 2:
      boardState[0][1] = playerSymbol;
      break;
    case 3:
      boardState[0][2] = playerSymbol;
      break;
    case 4:
      boardState[1][0] = playerSymbol;
      break;
    case 5:
      boardState[1][1] = playerSymbol;
      break;
    case 6:
      boardState[1][2] = playerSymbol;
      break;
    case 7:
      boardState[2][0] = playerSymbol;
      break;
    case 8:
      boardState[2][1] = playerSymbol;
      break;
    case 9:
      boardState[2][2] = playerSymbol;
      break;
    default:
      break;
  }
};

const checkForGameOver = (socketId) => {
  const completedRow = ["XXX", "OOO"];
  const rows = [
    boardState[0][0] + boardState[0][1] + boardState[0][2],
    boardState[1][0] + boardState[1][1] + boardState[1][2],
    boardState[2][0] + boardState[2][1] + boardState[2][2],
    boardState[0][0] + boardState[1][0] + boardState[2][0],
    boardState[0][1] + boardState[1][1] + boardState[2][2],
    boardState[0][2] + boardState[1][2] + boardState[2][2],
    boardState[0][0] + boardState[1][1] + boardState[2][2],
    boardState[0][2] + boardState[1][1] + boardState[2][0],
  ];

  for (let i = 0; i < rows.length; i++) {
    if (rows[i] === completedRow[0] || rows[i] === completedRow[1]) {
      showBoard();
      if (socketId === firstPlayer.socketId) {
        io.to(socketId).emit("Won", "You win!");
        io.to(secondPlayer.socketId).emit("Lost", "You lost.");
        endGame();
      } else {
        io.to(secondPlayer.socketId).emit("Won", "You win!");
        io.to(firstPlayer.socketId).emit("Lost", "You lost!");
        endGame();
      }
    }
  }
  if (turn >= 11) {
    showBoard();
    io.emit("tied", "Game is tied.");
    endGame();
  }
};

const endGame = () => {
  console.log("Game is over.");
  console.log("Disconnecting players.");
  io.disconnectSockets();
  usersConnected = 0;
  clientsConnected = {};
  firstPlayer = {};
  secondPlayer = {};
  unmatched = true;
  turn = 2;
  boardState = [
    [".", ".", "."],
    [".", ".", "."],
    [".", ".", "."],
  ];
};

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
