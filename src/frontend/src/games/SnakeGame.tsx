import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const CELL = 20;
const COLS = 20;
const ROWS = 20;
const INITIAL_SPEED = 150;

type Point = { x: number; y: number };
type Dir = { dx: number; dy: number };

const DIRS: Record<string, Dir> = {
  ArrowUp: { dx: 0, dy: -1 },
  ArrowDown: { dx: 0, dy: 1 },
  ArrowLeft: { dx: -1, dy: 0 },
  ArrowRight: { dx: 1, dy: 0 },
  w: { dx: 0, dy: -1 },
  s: { dx: 0, dy: 1 },
  a: { dx: -1, dy: 0 },
  d: { dx: 1, dy: 0 },
};

function randFood(snake: Point[]): Point {
  let p: Point;
  do {
    p = {
      x: Math.floor(Math.random() * COLS),
      y: Math.floor(Math.random() * ROWS),
    };
  } while (snake.some((s) => s.x === p.x && s.y === p.y));
  return p;
}

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const snakeRef = useRef<Point[]>([{ x: 10, y: 10 }]);
  const dirRef = useRef<Dir>({ dx: 1, dy: 0 });
  const nextDirRef = useRef<Dir>({ dx: 1, dy: 0 });
  const foodRef = useRef<Point>(randFood(snakeRef.current));
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState<"idle" | "playing" | "dead">("idle");
  const animRef = useRef<number>(0);
  const lastTickRef = useRef<number>(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.fillStyle = "oklch(0.96 0.02 145)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "oklch(0.90 0.03 145)";
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= COLS; x++) {
      ctx.beginPath();
      ctx.moveTo(x * CELL, 0);
      ctx.lineTo(x * CELL, ROWS * CELL);
      ctx.stroke();
    }
    for (let y = 0; y <= ROWS; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * CELL);
      ctx.lineTo(COLS * CELL, y * CELL);
      ctx.stroke();
    }

    // Draw food
    const food = foodRef.current;
    ctx.fillStyle = "oklch(0.65 0.25 345)";
    ctx.beginPath();
    ctx.arc(
      food.x * CELL + CELL / 2,
      food.y * CELL + CELL / 2,
      CELL / 2 - 2,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Draw snake
    snakeRef.current.forEach((seg, i) => {
      const isHead = i === 0;
      ctx.fillStyle = isHead ? "oklch(0.50 0.25 145)" : "oklch(0.65 0.22 145)";
      ctx.beginPath();
      ctx.roundRect(
        seg.x * CELL + 1,
        seg.y * CELL + 1,
        CELL - 2,
        CELL - 2,
        isHead ? 6 : 4,
      );
      ctx.fill();
    });
  }, []);

  const tick = useCallback(
    (ts: number) => {
      if (ts - lastTickRef.current < INITIAL_SPEED) {
        animRef.current = requestAnimationFrame(tick);
        return;
      }
      lastTickRef.current = ts;

      dirRef.current = nextDirRef.current;
      const head = snakeRef.current[0];
      const newHead = {
        x: head.x + dirRef.current.dx,
        y: head.y + dirRef.current.dy,
      };

      const hitWall =
        newHead.x < 0 ||
        newHead.x >= COLS ||
        newHead.y < 0 ||
        newHead.y >= ROWS;
      const hitSelf = snakeRef.current.some(
        (s) => s.x === newHead.x && s.y === newHead.y,
      );

      if (hitWall || hitSelf) {
        setStatus("dead");
        return;
      }

      const atFood =
        newHead.x === foodRef.current.x && newHead.y === foodRef.current.y;
      const newSnake = atFood
        ? [newHead, ...snakeRef.current]
        : [newHead, ...snakeRef.current.slice(0, -1)];

      snakeRef.current = newSnake;
      if (atFood) {
        foodRef.current = randFood(newSnake);
        setScore((s) => s + 10);
      }

      draw();
      animRef.current = requestAnimationFrame(tick);
    },
    [draw],
  );

  const startGame = useCallback(() => {
    snakeRef.current = [{ x: 10, y: 10 }];
    dirRef.current = { dx: 1, dy: 0 };
    nextDirRef.current = { dx: 1, dy: 0 };
    foodRef.current = randFood(snakeRef.current);
    setScore(0);
    setStatus("playing");
    lastTickRef.current = 0;
  }, []);

  useEffect(() => {
    if (status === "playing") {
      animRef.current = requestAnimationFrame(tick);
    }
    return () => cancelAnimationFrame(animRef.current);
  }, [status, tick]);

  useEffect(() => {
    if (status !== "playing") return;
    const onKey = (e: KeyboardEvent) => {
      const d = DIRS[e.key];
      if (!d) return;
      const cur = dirRef.current;
      if (d.dx !== -cur.dx || d.dy !== -cur.dy) nextDirRef.current = d;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [status]);

  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-4 w-full justify-between">
        <Badge
          variant="secondary"
          className="font-display font-bold text-base px-4 py-2"
        >
          Score: {score}
        </Badge>
        <div className="text-muted-foreground text-xs font-body hidden sm:block">
          Arrow keys or WASD to move
        </div>
        {status !== "idle" && (
          <Button
            size="sm"
            variant="outline"
            onClick={startGame}
            className="rounded-full font-display"
            data-ocid="snake.restart_button"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Restart
          </Button>
        )}
      </div>

      <div className="relative rounded-2xl overflow-hidden shadow-play border border-border">
        <canvas
          ref={canvasRef}
          width={COLS * CELL}
          height={ROWS * CELL}
          data-ocid="snake.canvas_target"
          className="block"
        />
        {status !== "playing" && (
          <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
            {status === "dead" && (
              <div className="text-card text-center mb-2">
                <p className="font-display font-extrabold text-2xl">
                  Game Over!
                </p>
                <p className="text-card/80 text-sm">Final Score: {score}</p>
              </div>
            )}
            <Button
              onClick={startGame}
              data-ocid="snake.start_button"
              className="rounded-full px-8 font-display font-bold shadow-play"
            >
              <Play className="w-4 h-4 mr-2" />
              {status === "dead" ? "Play Again" : "Start Game"}
            </Button>
          </div>
        )}
      </div>

      {/* Mobile controls */}
      <div className="grid grid-cols-3 gap-2 sm:hidden">
        {[
          { label: "←", key: "ArrowLeft", pos: "" },
          { label: "↑", key: "ArrowUp", pos: "col-start-2" },
          { label: "→", key: "ArrowRight", pos: "" },
          { label: "", key: "empty1", pos: "" },
          { label: "↓", key: "ArrowDown", pos: "col-start-2" },
          { label: "", key: "empty2", pos: "" },
        ].map(({ label, key, pos }) =>
          label ? (
            <Button
              key={key}
              variant="outline"
              size="sm"
              className={`w-12 h-12 rounded-xl font-display font-bold text-lg ${pos}`}
              onPointerDown={() => {
                const d = DIRS[key];
                if (!d) return;
                const cur = dirRef.current;
                if (d.dx !== -cur.dx || d.dy !== -cur.dy)
                  nextDirRef.current = d;
              }}
            >
              {label}
            </Button>
          ) : (
            <div key={key} />
          ),
        )}
      </div>
    </div>
  );
}
