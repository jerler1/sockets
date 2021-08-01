const io = require("socket.io-client");

const socket = io();

socket.on("connect", () => {
    console.log("Client has connected with id: " + socket.id);
})