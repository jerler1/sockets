const io = require("socket.io-client");

const serverIp = process.argv[2];
const port = process.argv[3];

const socket = io(`http://${serverIp}:${port}`);

socket.on("connect", () => {
    console.log("Client has connected with id: " + socket.id);
})

socket.on("game-start", () => {
    console.log("The game has started.");
})

socket.on("clientdisconnect", id => {
    console.log("A client has disconnected.");
    console.log(id);
})


console.log(process.argv);