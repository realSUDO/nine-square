const LINES = [
  [0,1,2],[3,4,5],[6,7,8], // rows
  [0,3,6],[1,4,7],[2,5,8], // cols
  [0,4,8],[2,4,6],         // diagonals
];

// returns { winner: "X"|"O", line: [i,j,k] } or null
export function checkWinner(cells) {
  for (const [a,b,c] of LINES) {
    if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) {
      return { winner: cells[a], line: [a,b,c] };
    }
  }
  return null;
}
