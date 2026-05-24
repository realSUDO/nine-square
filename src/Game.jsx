import { useState, useEffect, useRef, forwardRef } from "react";
import { io } from "socket.io-client";
import "./game.css";
import Board from "./components/Board.jsx";
import FriendsFlow from "./components/FriendsFlow.jsx";
import { checkWinner } from "./utils/winner.js";
import { sfx } from "./utils/sfx.js";
import confetti from "canvas-confetti";

let socket = null;
function getSocket() {
  if (!socket) socket = io({ autoConnect: true });
  return socket;
}

export default function App() {
  const [mode, setMode] = useState(() => {
    // if URL has ?room=, go straight to online flow
    return new URLSearchParams(window.location.search).get("room") ? "friends" : null;
  });
  const [cells, setCells] = useState(Array(9).fill(null));
  const [turn, setTurn] = useState("X");
  const [dark, setDark] = useState(false);
  const firedRef = useRef(null);
  const p1Ref = useRef(null);
  const p2Ref = useRef(null);

  useEffect(() => {
    document.body.classList.toggle("dark", dark);
  }, [dark]);

  const [friendsReady, setFriendsReady] = useState(false);
  const [mySymbol, setMySymbol] = useState(null);
  const [roomCode, setRoomCode] = useState(null);
  const [p1Name, setP1Name] = useState("Player 1");
  const [p2Name, setP2Name] = useState("Player 2");
  const [opponentLeft, setOpponentLeft] = useState(false);
  const [iWantReset, setIWantReset] = useState(false);
  const [opponentWantsReset, setOpponentWantsReset] = useState(false);

  const result = checkWinner(cells);
  const winLine = result?.line ?? null;
  const winner = result?.winner ?? null;
  const isTie = !winner && cells.every(Boolean);
  const isOver = !!winner || isTie;
  const isFriends = mode === "friends";

  useEffect(() => {
    if (!isFriends || !friendsReady) return;
    const s = getSocket();

    s.on("opponent_move", ({ index }) => {
      setCells(prev => {
        if (prev[index]) return prev;
        const next = [...prev];
        next[index] = mySymbol === "X" ? "O" : "X";
        return next;
      });
      setTurn(mySymbol);
    });

    s.on("opponent_wants_reset", () => setOpponentWantsReset(true));

    s.on("opponent_reset", () => {
      setCells(Array(9).fill(null));
      setTurn("X");
      firedRef.current = null;
      setIWantReset(false);
      setOpponentWantsReset(false);
    });

    s.on("opponent_left", () => setOpponentLeft(true));

    return () => {
      s.off("opponent_move");
      s.off("opponent_wants_reset");
      s.off("opponent_reset");
      s.off("opponent_left");
    };
  }, [isFriends, friendsReady, mySymbol]);

  useEffect(() => {
    if (winner && firedRef.current !== winner) {
      firedRef.current = winner;
      const cardEl = winner === "X" ? p1Ref.current : p2Ref.current;
      const rect = cardEl?.getBoundingClientRect();
      const x = rect ? (rect.left + rect.width / 2) / window.innerWidth : (winner === "X" ? 0.15 : 0.85);
      const y = rect ? (rect.top + rect.height / 2) / window.innerHeight : 0.55;
      confetti({ particleCount: 40, spread: 50, startVelocity: 20, gravity: 1, ticks: 100, scalar: 0.8,
        colors: ["#050505", "#222222", "#ffff00", "#ffffff"], origin: { x, y } });
    }
  }, [winner]);

  function goHome() {
    setMode(null);
    setFriendsReady(false);
    setOpponentLeft(false);
    setIWantReset(false);
    setOpponentWantsReset(false);
    setCells(Array(9).fill(null));
    setTurn("X");
    firedRef.current = null;
    history.replaceState(null, "");
  }

  // sound effects
  const prevIsOver = useRef(false);
  useEffect(() => {
    if (isOver && !prevIsOver.current) {
      prevIsOver.current = true;
      if (isTie) {
        sfx.tie();
      } else if (isFriends && mySymbol) {
        winner === mySymbol ? sfx.win() : sfx.lose();
      } else {
        sfx.win();
      }
    }
    if (!isOver) prevIsOver.current = false;
  }, [isOver, isTie, winner, isFriends, mySymbol]);
  useEffect(() => {
    if (mode) {
      history.pushState({ mode }, "");
    }
  }, [mode]);

  useEffect(() => {
    function onPop() { goHome(); }
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  if (!mode) {
    return (
      <>
        <ThemeToggle dark={dark} onToggle={() => setDark(d => !d)} />
        <ModeSelect onSelect={(m) => {
          setP1Name("Player 1"); setP2Name("Player 2");
          setMode(m);
        }} />
      </>
    );
  }

  if (isFriends && !friendsReady) {
    return (
      <>
        <ThemeToggle dark={dark} onToggle={() => setDark(d => !d)} />
        <FriendsFlow
        socket={getSocket()}
        onJoined={({ symbol, code, myName, opponentName }) => {
          setMySymbol(symbol);
          setRoomCode(code);
          setP1Name(symbol === "X" ? myName : opponentName);
          setP2Name(symbol === "O" ? myName : opponentName);
          setFriendsReady(true);
          setCells(Array(9).fill(null));
          setTurn("X");
          firedRef.current = null;
        }}
        onBack={goHome}
      />
      </>
    );
  }

  if (opponentLeft) {
    return (
      <div className="modeSelect">
        <h1 className="gameTitle">ONLINE</h1>
        <p className="turnSub">Opponent disconnected.</p>
        <button className="modeBtn" onClick={goHome}>← BACK</button>
      </div>
    );
  }

  const myTurn = !isFriends || turn === mySymbol;

  function handleCellClick(index) {
    if (cells[index] || winLine || !myTurn) return;
    sfx.click();
    const newCells = [...cells];
    newCells[index] = turn;
    setCells(newCells);
    setTurn(turn === "X" ? "O" : "X");
    if (isFriends) getSocket().emit("move", { code: roomCode, index, symbol: turn });
  }

  function handleNextRound() {
    if (!isFriends) {
      setCells(Array(9).fill(null)); setTurn("X"); firedRef.current = null;
    } else {
      setIWantReset(true);
      getSocket().emit("reset", { code: roomCode });
    }
  }

  // online next round label
  let nextLabel = "Next Round";
  if (isFriends && isOver) {
    if (iWantReset && !opponentWantsReset) nextLabel = "Waiting for opponent...";
    else if (!iWantReset && opponentWantsReset) nextLabel = "Opponent wants next round!";
  }

  return (
    <div className="gameScreen">
      <ThemeToggle dark={dark} onToggle={() => setDark(d => !d)} />
      <TurnIndicator turn={turn} winner={winner} isTie={isTie} p1Name={p1Name} p2Name={p2Name} mySymbol={isFriends ? mySymbol : null} />

      <div className="gameArea">
        <div className="cardSlot">
          <PlayerCard ref={p1Ref} name={p1Name} symbol="X" active={!isOver && turn === "X"} flip={true} dark={dark} />
        </div>
        <Board cells={cells} onCellClick={handleCellClick} winLine={winLine} />
        <div className="cardSlot">
          <PlayerCard ref={p2Ref} name={p2Name} symbol="O" active={!isOver && turn === "O"} flip={false} dark={dark} />
        </div>
      </div>

      <div className="gameFooter">
        <button
          className="nextBtn"
          style={{ visibility: isOver && !iWantReset ? "visible" : isOver && iWantReset ? "visible" : "hidden", opacity: iWantReset ? 0.5 : 1, cursor: iWantReset ? "default" : "pointer" }}
          onClick={!iWantReset ? handleNextRound : undefined}
        >{nextLabel}</button>
        <button className="backBtn" onClick={goHome}>← Home</button>
      </div>
    </div>
  );
}

function ModeSelect({ onSelect }) {
  return (
    <div className="modeSelect">
      <h1 className="gameTitle">NINE SQUARE</h1>
      <button className="modeBtn" onClick={() => onSelect("local")}>LOCAL MULTIPLAYER</button>
      <button className="modeBtn" onClick={() => onSelect("friends")}>ONLINE MULTIPLAYER</button>
    </div>
  );
}

function TurnIndicator({ turn, winner, isTie, p1Name, p2Name, mySymbol }) {
  if (isTie) return <div className="turnIndicator"><span className="turnSub">It's a tie!</span></div>;
  if (winner) {
    if (mySymbol) {
      const msg = winner === mySymbol ? "You win!" : "You lose!";
      return <div className="turnIndicator"><span className="turnSub">{msg}</span></div>;
    }
    const name = winner === "X" ? p1Name : p2Name;
    return <div className="turnIndicator"><span className="turnSub">{name} wins!</span></div>;
  }
  const name = turn === "X" ? p1Name : p2Name;
  const label = mySymbol
    ? `${name}${turn === mySymbol ? " — your move" : " — wait..."}`
    : `${name}'s move`;
  return <div className="turnIndicator"><span className="turnSub">{label}</span></div>;
}

function ThemeToggle({ dark, onToggle }) {
  return (
    <button className="themeToggle" onClick={onToggle} aria-label="Toggle theme">
      {dark ? (
        // sun
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/>
          <line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
      ) : (
        // moon
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      )}
    </button>
  );
}

const PlayerCard = forwardRef(function PlayerCard({ name, symbol, active, flip, dark }, ref) {
  return (
    <div ref={ref} className={`playerCard${active ? " active" : ""}`}>
      <img src={dark ? "/user-base-dark.png" : "/user-base.png"} alt={name} className="playerAvatar"
        style={flip ? { transform: "scaleX(-1)" } : undefined} />
      <div className="playerName"><span className="playerSymbol">{symbol}</span> : {name}</div>
    </div>
  );
});
