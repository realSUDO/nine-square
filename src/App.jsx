import { useState } from "react";
import "./App.css";

export default function App() {
  const [cells, setCells] = useState(Array(9).fill(null));
  const [turn, setTurn] = useState("X");

const cellCenters = [
  [105, 115], [182, 115], [260, 115],
  [105, 188], [182, 188], [260, 188],
  [105, 260], [182, 260], [260, 260],
];
  function handleCellClick(index) {
    if (cells[index]) return;

    const newCells = [...cells];
    newCells[index] = turn;

    setCells(newCells);
    setTurn(turn === "X" ? "O" : "X");
  }

  return (
    <div className="wrap">
      <p className="turnText">Turn: {turn}</p>

      <svg
        width="360"
        height="360"
        viewBox="0 0 360 360"
        className="board"
      >
        <defs>
          <filter id="roughen">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.08"
              numOctaves="2"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="2.2"
            />
          </filter>
        </defs>

        {/* clickable invisible cells */}
        {cells.map((_, index) => {
          const row = Math.floor(index / 3);
          const col = index % 3;

          return (
            <rect
              key={index}
              x={65 + col * 78}
              y={75 + row * 73}
              width="78"
              height="73"
              fill="transparent"
              className="cellHitbox"
              onClick={() => handleCellClick(index)}
            />
          );
        })}

        {/* grid */}
        <path
          d="
            M143 82
            C141 105, 141 130, 140 154
            C139 183, 137 213, 136 241
            C135 260, 135 277, 134 293
          "
          className="gridLine"
        />

        <path
          d="
            M221 87
            C219 113, 219 138, 218 165
            C217 194, 216 222, 216 250
            C216 267, 216 282, 216 295
          "
          className="gridLine"
        />

        <path
          d="
            M75 154
            C104 151, 132 150, 160 150
            C188 150, 218 150, 248 151
            C267 151, 286 152, 303 152
          "
          className="gridLine"
        />

        <path
          d="
            M73 224
            C101 221, 132 219, 163 218
            C195 217, 226 217, 256 218
            C274 218, 291 219, 306 220
          "
          className="gridLine"
        />

        {/* X and O */}
        {cells.map((cell, index) => {
          if (!cell) return null;

          const [x, y] = cellCenters[index];

          if (cell === "X") {
            return <HandDrawnX key={index} x={x} y={y} />;
          }

          return <HandDrawnO key={index} x={x} y={y} />;
        })}
      </svg>
    </div>
  );
}

function HandDrawnX({ x, y, variant = 0 }) {
  const rotations = [-4, 3, -2, 4, -3];
const scales = [0.64, 0.62, 0.66, 0.63, 0.65];
  const rotation = rotations[variant % rotations.length];
  const scale = scales[variant % scales.length];

  return (
    <g
      transform={`translate(${x}, ${y}) rotate(${rotation}) scale(${scale})`}
      className="fatMarkerX"
    >
      {/* diagonal 1 as a thick filled marker shape */}
      <path
        d="
          M-26 -20
          C-24 -24, -20 -26, -16 -23
          C-7 -15, 2 -6, 11 3
          C18 10, 24 16, 29 22
          C31 25, 29 29, 25 31
          C21 32, 18 30, 15 27
          C8 18, -1 9, -10 0
          C-17 -7, -23 -13, -26 -20
          Z
        "
      />

      {/* diagonal 2 as a thick filled marker shape */}
      <path
        d="
          M24 -24
          C28 -22, 30 -18, 27 -14
          C19 -5, 10 4, 2 12
          C-5 19, -12 26, -19 31
          C-23 34, -28 32, -30 28
          C-31 24, -29 21, -26 18
          C-17 10, -8 1, 1 -8
          C8 -15, 15 -22, 24 -24
          Z
        "
      />
    </g>
  );
}


function HandDrawnO({ x, y }) {
  return (
    <g
      transform={`translate(${x}, ${y}) scale(0.78)`}
      className="symbol"
    >
      <path
        d="
          M-3 -24
          C-19 -23, -29 -10, -27 7
          C-25 26, -5 33, 13 26
          C29 20, 33 -3, 23 -17
          C17 -25, 6 -28, -3 -24
        "
        className="symbolLine"
      />
      <path
        d="
          M-5 -18
          C-15 -14, -21 -3, -18 9
          C-14 23, 2 26, 13 17
          C23 9, 23 -8, 11 -16
        "
        className="symbolLine innerO"
      />
    </g>
  );
}
