const server = require("http").createServer();
const io = require("socket.io")(server);

const PORT = 5050;

let usersConnected = 0;
const clientsConnected = {};
let firstPlayer = {};
let secondPlayer = {};
let unmatched = true;
// Starting turn at 2 to be able to use modulus effectively to determine even or odd.
let turn = 2;
const boardState = [
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
    io.to(firstPlayer.socketId).emit(
      "yourTurn",
      "Your turn. Make a valid move via typing or using history (up and down arrows) to make a selection."
    );
    io.to(secondPlayer.socketId).emit(
      "opponentsTurn",
      "Your opponent is taking his turn.  Type resign or r to resign."
    );
  } else {
    turn++;
    showBoard();
    io.to(secondPlayer.socketId).emit(
      "yourTurn",
      "Your turn. Make a valid move via typing or using history (up and down arrows) to make a selection."
    );
    io.to(firstPlayer.socketId).emit(
      "opponentsTurn",
      "Your opponent is taking his turn.  Type resign or r to resign."
    );
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

const findCurrentOpponent = (socket) => {
  if (firstPlayer.playersSocket === socket) {
    return secondPlayer.playersSocket;
  } else {
    return firstPlayer.playersSocket;
  }
};

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
