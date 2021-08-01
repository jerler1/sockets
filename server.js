const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);

const PORT = process.env.PORT || 3001;

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
  });

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });