const express = require("express");
const app = express();
const http = require("http").Server(app);
const cors = require("cors");

const port = process.env.PORT || 4000;

app.use(cors());

const socketIO = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:3000",
  },
});

socketIO.on("connection", (socket) => {
  console.log(
    `ID: ${socket.id} Username: ${socket.handshake.auth.username} user just connected!`
  );

  const users = [];
  for (let [id, socket] of socketIO.of("/").sockets) {
    users.push({
      socketId: id,
      username: socket.handshake.auth.username,
    });
  }

  socket.emit("users", users);

  //sends the message to all the users on the server
  socket.on("message", (data) => {
    console.log("Message: ", data);
    socketIO.emit("messageResponse", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

app.get("/api", (req, res) => {
  res.json({
    message: "Hello world",
  });
});

http.listen(port, () => {
  console.log(`Server listening on ${port}`);
});
