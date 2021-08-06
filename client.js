const io = require("socket.io-client");

const serverIp = process.argv[2];
const port = process.argv[3];

const socket = io(`http://${serverIp}:${port}`);

socket.on("connect", () => {
  console.log(
    "Connected to " + serverIp + " " + port + ". Socket id is: " + socket.id
  );
});

socket.on("game-start", () => {
  console.log("The game has started.");
});

socket.on("boardState", (boardState) => {
  console.log(boardState);
});

socket.on("clientdisconnect", (id) => {
  console.log("A client has disconnected.");
  console.log(id);
});

socket.on("Won", (data) => {
  console.log(data);
});

socket.on("Lost", (data) => {
  console.log(data);
});

socket.on("tied", (data) => {
  console.log(data);
})

socket.on("yourTurn", (data) => {
  console.log(data.message);
  require("readcommand").read(
    { history: ["resign", "1", "2", "3", "4", "5", "6", "7", "8", "9"] },
    function (err, args) {
      resign(args, socket);
      socket.emit("moveMade", {
        socketId: socket.id,
        selection: args[0],
        playerSymbol: data.playerSymbol,
      });
    }
  );
});

socket.on("opponentsTurn", (data) => {
  console.log(data.message);
  require("readcommand").read(
    { history: ["Resign", "r"] },
    function (err, args) {
      resign(args, socket);
    }
  );
});

socket.on("resigned", (data) => {
  console.log(data);
});

socket.on("wonViaResign", (data) => {
  console.log(data);
});

// Tells the client the game has started and if they are first or second.
socket.on("gameStartMessage", (message) => {
  console.log(message);
});

const resign = (args, socket) => {
  if (args[0] === "r" || args[0] === "retire" || args[0] === "resign") {
    socket.emit("resigning", {
      socketId: socket.id,
    });
  }
};
