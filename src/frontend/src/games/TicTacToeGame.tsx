import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useState } from "react";

type Cell = "X" | "O" | null;
type Result = "X" | "O" | "draw" | null;

const POSITIONS = [0, 1, 2, 3, 4, 5, 6, 7, 8] as const;

const WINNING_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function checkWinner(board: Cell[]): { winner: Cell; line: number[] | null } {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line };
    }
  }
  return { winner: null, line: null };
}

function minimax(board: Cell[], isMax: boolean): number {
  const { winner } = checkWinner(board);
  if (winner === "O") return 10;
  if (winner === "X") return -10;
  if (board.every(Boolean)) return 0;

  const scores = board.map((cell, i) => {
    if (cell)
      return isMax ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
    const nb = [...board];
    nb[i] = isMax ? "O" : "X";
    return minimax(nb, !isMax);
  });

  return isMax ? Math.max(...scores) : Math.min(...scores);
}

function getBestMove(board: Cell[]): number {
  let best = Number.NEGATIVE_INFINITY;
  let move = -1;
  board.forEach((cell, i) => {
    if (!cell) {
      const nb = [...board];
      nb[i] = "O";
      const score = minimax(nb, false);
      if (score > best) {
        best = score;
        move = i;
      }
    }
  });
  return move;
}

export default function TicTacToeGame() {
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [scores, setScores] = useState({ X: 0, O: 0, draw: 0 });
  const [highlight, setHighlight] = useState<number[] | null>(null);
  const [result, setResult] = useState<Result>(null);

  const reset = useCallback((keepScores = true) => {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
    setHighlight(null);
    setResult(null);
    if (!keepScores) setScores({ X: 0, O: 0, draw: 0 });
  }, []);

  const handleClick = useCallback(
    (idx: number) => {
      if (board[idx] || result || !xIsNext) return;

      const newBoard: Cell[] = [...board];
      newBoard[idx] = "X";

      const { winner: w1, line: l1 } = checkWinner(newBoard);
      if (w1) {
        setBoard(newBoard);
        setHighlight(l1);
        setResult("X");
        setScores((s) => ({ ...s, X: s.X + 1 }));
        return;
      }

      if (newBoard.every(Boolean)) {
        setBoard(newBoard);
        setResult("draw");
        setScores((s) => ({ ...s, draw: s.draw + 1 }));
        return;
      }

      // AI move
      const aiMove = getBestMove(newBoard);
      newBoard[aiMove] = "O";
      const { winner: w2, line: l2 } = checkWinner(newBoard);
      setBoard(newBoard);
      setXIsNext(true);

      if (w2) {
        setHighlight(l2);
        setResult("O");
        setScores((s) => ({ ...s, O: s.O + 1 }));
      } else if (newBoard.every(Boolean)) {
        setResult("draw");
        setScores((s) => ({ ...s, draw: s.draw + 1 }));
      }
    },
    [board, result, xIsNext],
  );

  const statusText = result
    ? result === "draw"
      ? "It's a draw!"
      : result === "X"
        ? "You win! 🎉"
        : "AI wins! 🤖"
    : xIsNext
      ? "Your turn (X)"
      : "AI thinking…";

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Score board */}
      <div className="flex items-center gap-3">
        <Badge
          variant="secondary"
          className="font-display font-bold px-4 py-2 text-base"
          style={{
            background: "oklch(0.65 0.25 345 / 0.15)",
            color: "oklch(0.55 0.25 345)",
          }}
        >
          You (X): {scores.X}
        </Badge>
        <Badge variant="outline" className="font-display font-bold px-3 py-2">
          Draw: {scores.draw}
        </Badge>
        <Badge
          variant="secondary"
          className="font-display font-bold px-4 py-2 text-base"
          style={{
            background: "oklch(0.60 0.28 255 / 0.15)",
            color: "oklch(0.50 0.28 255)",
          }}
        >
          AI (O): {scores.O}
        </Badge>
      </div>

      {/* Status */}
      <p className="font-display font-bold text-lg text-foreground">
        {statusText}
      </p>

      {/* Board */}
      <div
        className="grid grid-cols-3 gap-3 p-4 bg-muted rounded-2xl shadow-play"
        data-ocid="tictactoe.canvas_target"
      >
        {POSITIONS.map((pos) => {
          const cell = board[pos];
          const i = pos;
          return (
            <motion.button
              key={`ttt-${pos}`}
              data-ocid={`tictactoe.cell.${i + 1}`}
              onClick={() => handleClick(i)}
              disabled={!!cell || !!result || !xIsNext}
              className={`w-24 h-24 rounded-xl font-display font-extrabold text-5xl flex items-center justify-center transition-smooth border-2 ${
                highlight?.includes(i)
                  ? "border-chart-3 bg-chart-3/20"
                  : cell
                    ? "border-border bg-card cursor-default"
                    : "border-border bg-card hover:bg-accent/10 hover:border-accent cursor-pointer"
              }`}
              whileHover={!cell && !result && xIsNext ? { scale: 1.05 } : {}}
              whileTap={{ scale: 0.95 }}
            >
              <AnimatePresence>
                {cell && (
                  <motion.span
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 18 }}
                    style={{
                      color:
                        cell === "X"
                          ? "oklch(0.65 0.25 345)"
                          : "oklch(0.60 0.28 255)",
                    }}
                  >
                    {cell}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => reset(true)}
          className="rounded-full font-display"
          data-ocid="tictactoe.reset_button"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1" /> New Round
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => reset(false)}
          className="rounded-full font-display text-muted-foreground"
          data-ocid="tictactoe.reset_scores_button"
        >
          Reset Scores
        </Button>
      </div>
    </div>
  );
}
