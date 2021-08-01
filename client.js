const io = require("socket.io-client");

const serverIp = process.argv[2];
const port = process.argv[3];

const socket = io(`http://${serverIp}:${port}`);

socket.on("connect", () => {
    console.log("Client has connected with id: " + socket.id);
})

console.log(process.argv);