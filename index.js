const express = require("express");
const app = express();
const http = require("http").Server(app);
const cors = require("cors");
// const { useAzureSocketIO } = require("@azure/web-pubsub-socket.io");

const port = process.env.PORT || 4000;

app.use(cors());
//happy-river-0e9a44c10.4.azurestaticapps.net/
// const socketIO = require("socket.io")(http, {
//   cors: {
//     origin: "http://localhost:3000",
//     credentials: true,
//     methods: ["GET", "POST"],
//   },
// });
const originUrl = "https://happy-river-0e9a44c10.4.azurestaticapps.net";
// const originUrl = "http://localhost:3000";
const socketIO = require("socket.io")(http, {
  cors: {
    origin: originUrl,
    credentials: true,
    methods: ["GET", "POST"],
  },
});

https: socketIO.on("connection", (socket) => {
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
