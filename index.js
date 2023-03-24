import express from "express";
const app = express();
const port = 3001;
import { Server } from "socket.io";
// var expressWs = require("express-ws")(app);
const io = new Server(3002, {
  cors: {
    origin: "*",
  },
});
import cors from "cors";
app.use(cors());
const lobbies = {};
io.on("connection", (socket) => {
  socket.on("login", async (arg) => {
    console.log("arg", arg);
    if (lobbies[arg.code]) {
      socket.emit("successLogin", "success");
      socket.join(arg.code);
      socket.data.user = arg;
      const host = (await io.in(`${arg.code}-host`).fetchSockets())[0];
      host.emit("userJoin", arg);
      lobbies[arg.code].users = [...lobbies[arg.code].users, arg.name];
    } else {
      socket.emit("failedLogin", "failed");
    }
  });
  socket.on("reconnectUser", async (arg) => {
    console.log("arg", arg);
    if (lobbies[arg.code]) {
      socket.emit("successLogin", "success");
      socket.join(arg.code);
      //   const host = (await io.in(`${arg.code}-host`).fetchSockets())[0];
      //   host.emit("userJoin", arg);
      //   lobbies[arg.code].users = [...lobbies[arg.code].users, arg.name];
    } else {
      socket.emit("failedLogin", "failed");
    }
  });
  socket.on("createLobby", (arg) => {
    const lobbyId = arg;
    console.log("lobbyId", lobbyId);
    if (lobbyId) {
      lobbies[lobbyId] = { users: [] };
      socket.join(`${lobbyId}-host`);
      socket.emit("lobbyCreateSuccess");
    } else {
      socket.emit("lobbyCreateFailure");
    }
  });
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/createLobby/:lobbyId", (req, res) => {
  const lobbyId = req.params.lobbyId;
  console.log("lobbyId", lobbyId);
  if (lobbyId) {
    lobbies[lobbyId] = { users: [] };
    res.send("Success");
  } else {
    res.status(400).send("error, no lobby Id");
  }
});

// app.ws("/", function (ws, req) {
//   ws.on("message", function (msg) {
//     console.log("msg");
//     ws.send(msg);
//   });
// });

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
