import { useState } from "react";
import "./game.css";
import Board from "./components/Board.jsx";
import { checkWinner } from "./utils/winner.js";

export default function App() {
  const [mode, setMode] = useState(null);
  const [cells, setCells] = useState(Array(9).fill(null));
  const [turn, setTurn] = useState("X");

  if (!mode) {
    return <ModeSelect onSelect={setMode} />;
  }

  const result = checkWinner(cells);
  const winLine = result?.line ?? null;

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
      <TurnIndicator turn={turn} winner={result?.winner} p1Name={p1Name} p2Name={p2Name} />

      <div className="gameArea">
        <PlayerCard name={p1Name} symbol="X" active={!winLine && turn === "X"} flip={true} />
        <Board cells={cells} onCellClick={handleCellClick} winLine={winLine} />
        <PlayerCard name={p2Name} symbol="O" active={!winLine && turn === "O"} flip={false} />
      </div>
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

function TurnIndicator({ turn, winner, p1Name, p2Name }) {
  if (winner) {
    const name = winner === "X" ? p1Name : p2Name;
    return (
      <div className="turnIndicator">
        <span className="turnSub">{name} wins!</span>
      </div>
    );
  }

  const name = turn === "X" ? p1Name : p2Name;
  return (
    <div className="turnIndicator">
      <span className="turnSub">{name}'s move</span>
    </div>
  );
}

function PlayerCard({ name, symbol, active, flip }) {
  return (
    <div className={`playerCard${active ? " active" : ""}`}>
      <img
        src="/user-base.png"
        alt={name}
        className="playerAvatar"
        style={flip ? { transform: "scaleX(-1)" } : undefined}
      />
      <div className="playerName"><span className="playerSymbol">{symbol}</span> : {name}</div>
    </div>
  );
}
