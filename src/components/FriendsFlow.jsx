import { useState } from "react";

export default function FriendsFlow({ socket, onJoined, onBack }) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [waiting, setWaiting] = useState(false);
  const [roomCode, setRoomCode] = useState("");

  function handleCreate() {
    if (!name.trim()) return setError("Enter your name");
    setError("");
    socket.emit("create_room", { name: name.trim() }, ({ ok, code, symbol }) => {
      if (!ok) return setError("Failed to create room");
      setRoomCode(code); setWaiting(true);
      socket.once("game_start", ({ p1Name, p2Name }) =>
        onJoined({ symbol, code, myName: p1Name, opponentName: p2Name }));
    });
  }

  function handleJoin() {
    if (!name.trim()) return setError("Enter your name");
    if (!code.trim()) return setError("Enter a room code");
    setError("");
    socket.emit("join_room", { name: name.trim(), code: code.trim().toUpperCase() }, ({ ok, symbol, error: err }) => {
      if (!ok) return setError(err || "Failed to join");
      socket.once("game_start", ({ p1Name, p2Name }) =>
        onJoined({ symbol, code: code.trim().toUpperCase(), myName: p2Name, opponentName: p1Name }));
    });
  }

  if (waiting) {
    return (
      <div className="modeSelect">
        <h1 className="gameTitle">ONLINE</h1>
        <p className="turnSub">Share this code with your friend</p>
        <p className="roomCode">{roomCode}</p>
        <p className="turnSub">Waiting for opponent...</p>
        <button className="modeBtn" onClick={() => { setWaiting(false); setRoomCode(""); onBack(); }}>CANCEL</button>
      </div>
    );
  }

  return (
    <div className="onlineForm">
      <h1 className="gameTitle">ONLINE</h1>

      <label className="fieldLabel">Your name</label>
      <input className="friendInput" placeholder="Enter name"
        value={name} maxLength={16} onChange={e => { setName(e.target.value); setError(""); }} />

      <div className="formDivider"><span>create a room</span></div>
      <button className="modeBtn" onClick={handleCreate}>Create Room</button>

      <div className="formDivider"><span>or join with a code</span></div>
      <input className="friendInput" placeholder="Room code" value={code} maxLength={5}
        style={{ textAlign: "center", letterSpacing: 6 }}
        onChange={e => { setCode(e.target.value.toUpperCase()); setError(""); }} />
      <button className="modeBtn" onClick={handleJoin}>Join Room</button>

      {error && <p className="fieldError">{error}</p>}
      <button className="backBtn" onClick={onBack}>← Back</button>
    </div>
  );
}
