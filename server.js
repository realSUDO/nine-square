import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { fileURLToPath } from "url";
import { join, dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });

// serve built client in production
app.use(express.static(join(__dirname, "dist")));
app.get("*", (_, res) => res.sendFile(join(__dirname, "dist", "index.html")));

// rooms: { [code]: { players: [{id, name, symbol}], turn: "X" } }
const rooms = {};

function makeCode() {
  return Math.random().toString(36).slice(2, 7).toUpperCase();
}

io.on("connection", (socket) => {

  socket.on("create_room", ({ name }, cb) => {
    const code = makeCode();
    rooms[code] = { players: [{ id: socket.id, name, symbol: "X" }], turn: "X" };
    socket.join(code);
    cb({ ok: true, code, symbol: "X" });
  });

  socket.on("join_room", ({ name, code }, cb) => {
    const room = rooms[code];
    if (!room) return cb({ ok: false, error: "Room not found" });
    if (room.players.length >= 2) return cb({ ok: false, error: "Room is full" });

    room.players.push({ id: socket.id, name, symbol: "O" });
    socket.join(code);
    cb({ ok: true, symbol: "O" });

    // notify both players — game can start
    const [p1, p2] = room.players;
    io.to(code).emit("game_start", { p1Name: p1.name, p2Name: p2.name });
  });

  socket.on("move", ({ code, index, symbol }) => {
    const room = rooms[code];
    if (!room || room.turn !== symbol) return;
    room.turn = symbol === "X" ? "O" : "X";
    // broadcast to the OTHER player only
    socket.to(code).emit("opponent_move", { index });
  });

  socket.on("reset", ({ code }) => {
    const room = rooms[code];
    if (!room) return;
    if (!room.resetVotes) room.resetVotes = new Set();
    room.resetVotes.add(socket.id);
    // notify opponent that this player wants next round
    socket.to(code).emit("opponent_wants_reset");
    if (room.resetVotes.size >= 2) {
      room.turn = "X";
      room.resetVotes = new Set();
      io.to(code).emit("opponent_reset");
    }
  });

  socket.on("disconnecting", () => {
    for (const code of socket.rooms) {
      if (!rooms[code]) continue;
      socket.to(code).emit("opponent_left");
      delete rooms[code];
    }
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => console.log(`Server on ${PORT}`));
