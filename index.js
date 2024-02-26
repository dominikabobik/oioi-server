const express = require("express");
const app = express();
const http = require("http").Server(app);
const cors = require("cors");
// const { useAzureSocketIO } = require("@azure/web-pubsub-socket.io");

const port = process.env.PORT || 4000;
let users = [];

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

  let newUserList = [];

  for (let [id, socket] of socketIO.of("/").sockets) {
    newUserList.push({
      socketId: id,
      username: socket.handshake.auth.username,
    });
  }

  users = newUserList;

  // users.push({ socketId: socket.id, username: socket.handshake.auth.username });

  // socketIO.emit("users", {
  //   socketId: socket.id,
  //   username: socket.handshake.auth.username,
  // });

  socketIO.emit("users", users);
  console.log("Emtting users", users);

  //sends the message to all the users on the server
  socket.on("message", (data) => {
    console.log("Message: ", data);
    socketIO.emit("messageResponse", data);
  });

  socket.on("private-message", (data) => {
    console.log("Message: ", data);
    socket.to(data.toId).emit("private-message", data);
    socket.emit("private-message", data);
    // socketIO.emit("messageResponse", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected: ", socket.id);
    let index = users.findIndex((e) => e.socketId === socket.id);
    users.splice(index, 1);
    console.log("New user list: ", users);
    socketIO.emit("users", users);
    socketIO.emit("user-disconnected", socket.id);
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
