const server = require("http").createServer();
const io = require("socket.io")(server);

const PORT = process.env.PORT || 5050;

io.on("connection", client => {
    console.log("a user connected");
})

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
