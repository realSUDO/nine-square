import { useState, useEffect } from "react";

const CopyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

export default function FriendsFlow({ socket, onJoined, onBack }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [waiting, setWaiting] = useState(false);
  const [roomCode, setRoomCode] = useState("");
  const [copied, setCopied] = useState("");

  // read ?room= from URL on mount — pre-fill join code
  const urlRoom = new URLSearchParams(window.location.search).get("room") || "";
  const [code, setCode] = useState(urlRoom.toUpperCase());

  function handleCreate() {
    if (!name.trim()) return setError("Enter your name");
    setError("");
    socket.emit("create_room", { name: name.trim() }, ({ ok, code, symbol }) => {
      if (!ok) return setError("Failed to create room");
      setRoomCode(code);
      setWaiting(true);
      // push room code into URL so it's shareable
      window.history.replaceState(null, "", `?room=${code}`);
      socket.once("game_start", ({ p1Name, p2Name }) => {
        window.history.replaceState(null, "", "/");
        onJoined({ symbol, code, myName: p1Name, opponentName: p2Name });
      });
    });
  }

  function handleJoin() {
    if (!name.trim()) return setError("Enter your name");
    if (!code.trim()) return setError("Enter a room code");
    setError("");
    socket.emit("join_room", { name: name.trim(), code: code.trim().toUpperCase() }, ({ ok, symbol, error: err }) => {
      if (!ok) return setError(err || "Failed to join");
      window.history.replaceState(null, "", "/");
      socket.once("game_start", ({ p1Name, p2Name }) =>
        onJoined({ symbol, code: code.trim().toUpperCase(), myName: p2Name, opponentName: p1Name }));
    });
  }

  function copyText(text, key) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(""), 1500);
    });
  }

  const shareUrl = `${window.location.origin}?room=${roomCode}`;

  if (waiting) {
    return (
      <div className="modeSelect">
        <h1 className="gameTitle">ONLINE</h1>

        <div className="waitCard">
          <p className="waitLabel">Room Code</p>
          <div className="codeRow">
            <span className="roomCode">{roomCode}</span>
            <button className="copyBtn" onClick={() => copyText(roomCode, "code")}>
              {copied === "code" ? <CheckIcon /> : <CopyIcon />}
            </button>
          </div>

          <div className="codeDivider" />

          <button className="shareLinkBtn" onClick={() => copyText(shareUrl, "url")}>
            {copied === "url" ? <><CheckIcon /> Copied!</> : <><CopyIcon /> Copy invite link</>}
          </button>

          <p className="waitingText">Waiting for opponent...</p>
        </div>

        <button className="backBtn" onClick={() => {
          setWaiting(false); setRoomCode("");
          window.history.replaceState(null, "", "/");
          onBack();
        }}>← Cancel</button>
      </div>
    );
  }

  return (
    <div className="onlineForm">
      <h1 className="gameTitle">ONLINE</h1>

      <div className="onlineFormInner">
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
      </div>

      <button className="backBtn" onClick={onBack}>← Back</button>
    </div>
  );
}
