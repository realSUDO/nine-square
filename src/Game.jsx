import { useState, useEffect, useRef, forwardRef } from "react";
import "./game.css";
import Board from "./components/Board.jsx";
import { checkWinner } from "./utils/winner.js";
import confetti from "canvas-confetti";

export default function App() {
  const [mode, setMode] = useState(null);
  const [cells, setCells] = useState(Array(9).fill(null));
  const [turn, setTurn] = useState("X");
  const firedRef = useRef(null);
  const p1Ref = useRef(null);
  const p2Ref = useRef(null);

  const result = checkWinner(cells);
  const winLine = result?.line ?? null;
  const winner = result?.winner ?? null;
  const isTie = !winner && cells.every(Boolean);
  const isOver = !!winner || isTie;

  function resetRound() {
    setCells(Array(9).fill(null));
    setTurn("X");
    firedRef.current = null;
  }

  useEffect(() => {
    if (winner && firedRef.current !== winner) {
      firedRef.current = winner;
      const cardEl = winner === "X" ? p1Ref.current : p2Ref.current;
      const rect = cardEl?.getBoundingClientRect();
      const x = rect ? (rect.left + rect.width / 2) / window.innerWidth : (winner === "X" ? 0.15 : 0.85);
      const y = rect ? (rect.top + rect.height / 2) / window.innerHeight : 0.55;
      confetti({
        particleCount: 40,
        spread: 50,
        startVelocity: 20,
        gravity: 1,
        ticks: 100,
        scalar: 0.8,
        colors: ["#050505", "#222222", "#ffff00", "#ffffff"],
        origin: { x, y },
      });
    }
  }, [winner]);

  if (!mode) {
    return <ModeSelect onSelect={setMode} />;
  }

  function handleCellClick(index) {
    if (cells[index] || winLine) return;
    const newCells = [...cells];
    newCells[index] = turn;
    setCells(newCells);
    setTurn(turn === "X" ? "O" : "X");
  }

  const p1Name = "Player 1";
  const p2Name = "Player 2";

  return (
    <div className="gameScreen">
      <TurnIndicator turn={turn} winner={winner} isTie={isTie} p1Name={p1Name} p2Name={p2Name} />

      <div className="gameArea">
        <PlayerCard ref={p1Ref} name={p1Name} symbol="X" active={!isOver && turn === "X"} flip={true} />
        <Board cells={cells} onCellClick={handleCellClick} winLine={winLine} />
        <PlayerCard ref={p2Ref} name={p2Name} symbol="O" active={!isOver && turn === "O"} flip={false} />
      </div>

      <button
        className="nextBtn"
        style={{ visibility: isOver ? "visible" : "hidden" }}
        onClick={resetRound}
      >Next Round</button>
    </div>
  );
}

function ModeSelect({ onSelect }) {
  return (
    <div className="modeSelect">
      <h1 className="gameTitle">TIC TAC TOE</h1>
      <button className="modeBtn" onClick={() => onSelect("single")}>LOCAL MULTIPLAYER</button>
      <button className="modeBtn" onClick={() => onSelect("multi")}>ONLINE MULTIPLAYER</button>
    </div>
  );
}

function TurnIndicator({ turn, winner, isTie, p1Name, p2Name }) {
  if (isTie) return <div className="turnIndicator"><span className="turnSub">It's a tie!</span></div>;
  if (winner) {
    const name = winner === "X" ? p1Name : p2Name;
    return <div className="turnIndicator"><span className="turnSub">{name} wins!</span></div>;
  }
  const name = turn === "X" ? p1Name : p2Name;
  return <div className="turnIndicator"><span className="turnSub">{name}'s move</span></div>;
}

const PlayerCard = forwardRef(function PlayerCard({ name, symbol, active, flip }, ref) {
  return (
    <div ref={ref} className={`playerCard${active ? " active" : ""}`}>
      <img
        src="/user-base.png"
        alt={name}
        className="playerAvatar"
        style={flip ? { transform: "scaleX(-1)" } : undefined}
      />
      <div className="playerName"><span className="playerSymbol">{symbol}</span> : {name}</div>
    </div>
  );
});
