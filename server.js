const server = require("http").createServer();
const io = require("socket.io")(server);

const PORT = 5050;

let usersConnected = 0;
const clientsConnected = {};
const firstPlayer = {};
const secondPlayer = {};

const addClient = (socket) => {
  console.log("Client has connected.", socket.id);
  clientsConnected[socket.id] = socket;
  convertSocketToPlayer(socket);
  usersConnected++;
  if (usersConnected === 2) {
    console.log("Starting the game.");
    socket.broadcast.emit("game-start");
  }
};

const removeClient = (socket) => {
  console.log("Client has disconnected.", socket.id);
  delete clientsConnected[socket.id];
};

io.on("connection", (socket) => {
  let id = socket.id;

  addClient(socket);

  socket.on("disconnect", () => {
    socket.broadcast.emit("clientdisconnect", id);
    removeClient(socket);
  });
});

function convertSocketToPlayer(socket) {
  firstPlayer
    ? (secondPlayer = {
        playersSocket: socket,
        symbol: "O",
        firstPlayer: false,
        opponentsSocket: null,
      })
    : (firstPlayer = {
        playersSocket: socket,
        symbol: "X",
        firstPlayer: true,
        opponentsSocket: null,
      });
}

function isThereAnOpponent(socket) {
  if (!players[socket.id].opponent) {
    return;
  }
  return players[players[socket.id].opponent].socket;
}

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
