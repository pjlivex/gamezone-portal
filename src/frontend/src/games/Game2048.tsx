import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";

type Board = number[][];

function createBoard(): Board {
  const b: Board = Array.from({ length: 4 }, () => [0, 0, 0, 0]);
  return addTile(addTile(b));
}

function addTile(board: Board): Board {
  const empty: [number, number][] = [];
  board.forEach((row, r) =>
    row.forEach((v, c) => {
      if (!v) empty.push([r, c]);
    }),
  );
  if (!empty.length) return board;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  const nb = board.map((row) => [...row]);
  nb[r][c] = Math.random() < 0.9 ? 2 : 4;
  return nb;
}

function slide(row: number[]): { row: number[]; score: number } {
  const filtered = row.filter(Boolean);
  let score = 0;
  const merged: number[] = [];
  let i = 0;
  while (i < filtered.length) {
    if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
      merged.push(filtered[i] * 2);
      score += filtered[i] * 2;
      i += 2;
    } else {
      merged.push(filtered[i]);
      i++;
    }
  }
  while (merged.length < 4) merged.push(0);
  return { row: merged, score };
}

function moveLeft(board: Board): {
  board: Board;
  score: number;
  moved: boolean;
} {
  let totalScore = 0;
  let moved = false;
  const nb = board.map((row) => {
    const { row: newRow, score } = slide(row);
    totalScore += score;
    if (newRow.some((v, i) => v !== row[i])) moved = true;
    return newRow;
  });
  return { board: nb, score: totalScore, moved };
}

function rotate90(board: Board): Board {
  return board[0].map((_, i) => board.map((row) => row[i]).reverse());
}

function move(board: Board, dir: "left" | "right" | "up" | "down") {
  const rotations = { left: 0, down: 1, right: 2, up: 3 };
  let b = board;
  const r = rotations[dir];
  for (let i = 0; i < r; i++) b = rotate90(b);
  const result = moveLeft(b);
  let nb = result.board;
  for (let i = 0; i < (4 - r) % 4; i++) nb = rotate90(nb);
  return { board: nb, score: result.score, moved: result.moved };
}

function isGameOver(board: Board): boolean {
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (!board[r][c]) return false;
      if (c < 3 && board[r][c] === board[r][c + 1]) return false;
      if (r < 3 && board[r][c] === board[r + 1][c]) return false;
    }
  }
  return true;
}

const TILE_COLORS: Record<number, string> = {
  0: "bg-muted",
  2: "bg-secondary text-secondary-foreground",
  4: "bg-accent/30 text-accent-foreground",
  8: "bg-accent/60 text-accent-foreground",
  16: "bg-primary/40 text-primary-foreground",
  32: "bg-primary/70 text-primary-foreground",
  64: "bg-primary text-primary-foreground",
  128: "bg-chart-3/80 text-primary-foreground",
  256: "bg-chart-3 text-primary-foreground",
  512: "bg-chart-5/70 text-primary-foreground",
  1024: "bg-chart-5 text-primary-foreground",
  2048: "bg-secondary text-secondary-foreground",
};

function getTileClass(val: number): string {
  return TILE_COLORS[val] ?? "bg-foreground text-background";
}

export default function Game2048() {
  const [board, setBoard] = useState<Board>(createBoard);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  const handleMove = useCallback(
    (dir: "left" | "right" | "up" | "down") => {
      if (gameOver) return;
      setBoard((prev) => {
        const { board: nb, score: gained, moved } = move(prev, dir);
        if (!moved) return prev;
        const withTile = addTile(nb);
        const over = isGameOver(withTile);
        const hasWon = withTile.some((r) => r.some((v) => v === 2048));
        if (over) setGameOver(true);
        if (hasWon && !won) setWon(true);
        setScore((s) => {
          const ns = s + gained;
          setBest((b) => Math.max(b, ns));
          return ns;
        });
        return withTile;
      });
    },
    [gameOver, won],
  );

  const reset = () => {
    setBoard(createBoard());
    setScore(0);
    setGameOver(false);
    setWon(false);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const map: Record<string, "left" | "right" | "up" | "down"> = {
        ArrowLeft: "left",
        ArrowRight: "right",
        ArrowUp: "up",
        ArrowDown: "down",
      };
      const d = map[e.key];
      if (d) {
        handleMove(d);
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleMove]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-3 w-full justify-between">
        <div className="flex gap-2">
          <Badge
            variant="secondary"
            className="font-display font-bold px-4 py-2"
          >
            Score: {score}
          </Badge>
          <Badge variant="outline" className="font-display font-bold px-4 py-2">
            Best: {best}
          </Badge>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={reset}
          className="rounded-full font-display"
          data-ocid="game2048.restart_button"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1" /> New Game
        </Button>
      </div>

      <div
        className="relative bg-muted p-3 rounded-2xl shadow-play"
        data-ocid="game2048.canvas_target"
      >
        <div className="grid grid-cols-4 gap-2">
          {board.flat().map((val, idx) => (
            <motion.div
              key={`tile-${Math.floor(idx / 4)}-${idx % 4}`}
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl flex items-center justify-center font-display font-extrabold text-base sm:text-xl ${getTileClass(val)}`}
              initial={val !== 0 ? { scale: 0.8 } : undefined}
              animate={{ scale: 1 }}
              transition={{ duration: 0.1 }}
            >
              {val !== 0 ? val : ""}
            </motion.div>
          ))}
        </div>

        <AnimatePresence>
          {(gameOver || won) && (
            <motion.div
              className="absolute inset-0 rounded-2xl bg-foreground/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="font-display font-extrabold text-2xl text-card">
                {won ? "🎉 You Win!" : "Game Over!"}
              </p>
              <p className="text-card/80 text-sm">Score: {score}</p>
              <Button
                onClick={reset}
                data-ocid="game2048.play_again_button"
                className="rounded-full px-8 font-display font-bold"
              >
                Play Again
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile controls */}
      <div className="grid grid-cols-3 gap-2">
        {(["left", "up", "right", "empty1", "down", "empty2"] as const).map(
          (d, _i) => {
            if (d === "empty1" || d === "empty2") return <div key={d} />;
            const validDir = d as "left" | "right" | "up" | "down";
            const arrows: Record<string, string> = {
              left: "←",
              right: "→",
              up: "↑",
              down: "↓",
            };
            const colClass = d === "up" || d === "down" ? "col-start-2" : "";
            return (
              <Button
                key={d}
                variant="outline"
                size="sm"
                className={`w-12 h-12 rounded-xl font-display font-bold text-lg ${colClass}`}
                onClick={() => handleMove(validDir)}
              >
                {arrows[d]}
              </Button>
            );
          },
        )}
      </div>
      <p className="text-muted-foreground text-xs">Arrow keys to move</p>
    </div>
  );
}
