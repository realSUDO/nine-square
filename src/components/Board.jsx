const cellCenters = [
  [105, 115], [182, 115], [260, 115],
  [105, 188], [182, 188], [260, 188],
  [105, 260], [182, 260], [260, 260],
];

export default function Board({ cells, onCellClick, winLine }) {
  const strikeStart = winLine ? cellCenters[winLine[0]] : null;
  const strikeEnd   = winLine ? cellCenters[winLine[2]] : null;

  return (
    <svg width="360" height="360" viewBox="0 0 360 360" className="board">
      <defs>
        <filter id="roughen">
          <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="2" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.2" />
        </filter>
      </defs>

      {cells.map((_, index) => {
        const row = Math.floor(index / 3);
        const col = index % 3;
        return (
          <rect
            key={index}
            x={65 + col * 78} y={75 + row * 73}
            width="78" height="73"
            fill="transparent"
            className={winLine ? undefined : "cellHitbox"}
            onClick={() => !winLine && onCellClick(index)}
          />
        );
      })}

      <path d="M143 82 C141 105, 141 130, 140 154 C139 183, 137 213, 136 241 C135 260, 135 277, 134 293" className="gridLine" />
      <path d="M221 87 C219 113, 219 138, 218 165 C217 194, 216 222, 216 250 C216 267, 216 282, 216 295" className="gridLine" />
      <path d="M75 154 C104 151, 132 150, 160 150 C188 150, 218 150, 248 151 C267 151, 286 152, 303 152" className="gridLine" />
      <path d="M73 224 C101 221, 132 219, 163 218 C195 217, 226 217, 256 218 C274 218, 291 219, 306 220" className="gridLine" />

      {cells.map((cell, index) => {
        if (!cell) return null;
        const [x, y] = cellCenters[index];
        return (
          <text key={index} x={x} y={y} className="cellSymbol" dominantBaseline="middle" textAnchor="middle">
            {cell}
          </text>
        );
      })}

      {strikeStart && (
        <line
          x1={strikeStart[0]} y1={strikeStart[1]}
          x2={strikeEnd[0]}   y2={strikeEnd[1]}
          className="strikeLine"
          vectorEffect="non-scaling-stroke"
        />
      )}
    </svg>
  );
}
