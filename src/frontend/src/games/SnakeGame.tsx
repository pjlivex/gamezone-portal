import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Play, RefreshCw, Shield, Zap } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const CELL = 20;
const COLS = 20;
const ROWS = 20;
const MIN_SPEED = 60;

type Point = { x: number; y: number };
type Dir = { dx: number; dy: number };
type Difficulty = "easy" | "normal" | "hard";
type PowerUpType = "shield" | "speedBoost" | "slowMotion";
type GameStatus = "idle" | "playing" | "dead";

interface ActivePowerUp {
  type: PowerUpType;
  expiresAt: number; // timestamp
}

interface PowerUpItem {
  pos: Point;
  type: PowerUpType;
}

const DIFFICULTY_SPEEDS: Record<Difficulty, number> = {
  easy: 200,
  normal: 150,
  hard: 100,
};

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "Easy",
  normal: "Normal",
  hard: "Hard",
};

const POWERUP_COLORS: Record<PowerUpType, string> = {
  shield: "oklch(0.65 0.25 255)", // blue
  speedBoost: "oklch(0.82 0.22 90)", // yellow
  slowMotion: "oklch(0.65 0.22 290)", // purple
};

const POWERUP_DURATION = 5000; // 5 seconds in ms

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

function randPoint(occupied: Point[]): Point {
  let p: Point;
  do {
    p = {
      x: Math.floor(Math.random() * COLS),
      y: Math.floor(Math.random() * ROWS),
    };
  } while (occupied.some((o) => o.x === p.x && o.y === p.y));
  return p;
}

function randPowerUpType(): PowerUpType {
  const types: PowerUpType[] = ["shield", "speedBoost", "slowMotion"];
  return types[Math.floor(Math.random() * types.length)];
}

// Canvas drawing helpers
function drawGlowCircle(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  color: string,
  glowColor: string,
  glowBlur: number,
  pulseOffset = 0,
) {
  const pr = r + Math.sin(pulseOffset) * 2;
  ctx.save();
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = glowBlur + Math.sin(pulseOffset) * 4;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, pr, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawPowerUp(
  ctx: CanvasRenderingContext2D,
  pos: Point,
  type: PowerUpType,
  pulseOffset: number,
) {
  const cx = pos.x * CELL + CELL / 2;
  const cy = pos.y * CELL + CELL / 2;
  const color = POWERUP_COLORS[type];
  const bounce = Math.sin(pulseOffset * 1.5) * 2;

  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = 12 + Math.sin(pulseOffset) * 5;
  ctx.translate(cx, cy + bounce);

  if (type === "shield") {
    // Blue glowing orb with shield shape
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, 0, CELL / 2 - 2, 0, Math.PI * 2);
    ctx.fill();
    // Inner highlight
    ctx.fillStyle = "oklch(0.85 0.15 255 / 0.6)";
    ctx.beginPath();
    ctx.arc(-2, -2, CELL / 4, 0, Math.PI * 2);
    ctx.fill();
    // Shield icon lines
    ctx.strokeStyle = "oklch(0.98 0 0 / 0.9)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, -5);
    ctx.lineTo(4, -2);
    ctx.lineTo(4, 2);
    ctx.lineTo(0, 6);
    ctx.lineTo(-4, 2);
    ctx.lineTo(-4, -2);
    ctx.closePath();
    ctx.stroke();
  } else if (type === "speedBoost") {
    // Yellow lightning bolt
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, 0, CELL / 2 - 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "oklch(0.15 0 0 / 0.85)";
    ctx.beginPath();
    ctx.moveTo(2, -6);
    ctx.lineTo(-2, 0);
    ctx.lineTo(1, 0);
    ctx.lineTo(-2, 6);
    ctx.lineTo(3, -1);
    ctx.lineTo(0, -1);
    ctx.closePath();
    ctx.fill();
  } else {
    // Purple clock (slowMotion)
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, 0, CELL / 2 - 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "oklch(0.98 0 0 / 0.9)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, CELL / 2 - 4, 0, Math.PI * 2);
    ctx.stroke();
    // Clock hands
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -4);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(3, 2);
    ctx.stroke();
  }
  ctx.restore();
}

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const snakeRef = useRef<Point[]>([{ x: 10, y: 10 }]);
  const dirRef = useRef<Dir>({ dx: 1, dy: 0 });
  const nextDirRef = useRef<Dir>({ dx: 1, dy: 0 });
  const foodRef = useRef<Point>(randPoint([{ x: 10, y: 10 }]));
  const obstaclesRef = useRef<Point[]>([]);
  const powerUpsRef = useRef<PowerUpItem[]>([]);
  const activePowerUpRef = useRef<ActivePowerUp | null>(null);
  const shieldActiveRef = useRef(false);
  const scoreRef = useRef(0);
  const foodEatenRef = useRef(0);
  const difficultyRef = useRef<Difficulty>("normal");
  const currentSpeedRef = useRef(DIFFICULTY_SPEEDS.normal);
  const highScoreRef = useRef(0);
  const pulseRef = useRef(0);

  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [status, setStatus] = useState<GameStatus>("idle");
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");
  const [activePowerUp, setActivePowerUp] = useState<ActivePowerUp | null>(
    null,
  );
  const [powerUpTimeLeft, setPowerUpTimeLeft] = useState(0);

  const animRef = useRef<number>(0);
  const lastTickRef = useRef<number>(0);
  const lastPowerUpCheckRef = useRef<number>(0);

  const getOccupied = useCallback(
    (): Point[] => [
      ...snakeRef.current,
      ...obstaclesRef.current,
      ...powerUpsRef.current.map((p) => p.pos),
      foodRef.current,
    ],
    [],
  );

  const draw = useCallback((ts = 0) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    pulseRef.current = ts / 400; // slow pulse

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background grid
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

    // Draw obstacles
    for (const obs of obstaclesRef.current) {
      ctx.fillStyle = "oklch(0.35 0.02 240)";
      ctx.beginPath();
      ctx.roundRect(obs.x * CELL + 1, obs.y * CELL + 1, CELL - 2, CELL - 2, 3);
      ctx.fill();
      // Highlight edge
      ctx.strokeStyle = "oklch(0.45 0.04 240)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(obs.x * CELL + 1, obs.y * CELL + 1, CELL - 2, CELL - 2, 3);
      ctx.stroke();
    }

    // Draw food with glow + pulse
    drawGlowCircle(
      ctx,
      foodRef.current.x * CELL + CELL / 2,
      foodRef.current.y * CELL + CELL / 2,
      CELL / 2 - 2,
      "oklch(0.65 0.25 345)",
      "oklch(0.65 0.25 345)",
      14,
      pulseRef.current,
    );

    // Draw power-ups
    for (const pu of powerUpsRef.current) {
      drawPowerUp(ctx, pu.pos, pu.type, pulseRef.current);
    }

    // Draw snake
    snakeRef.current.forEach((seg, i) => {
      const isHead = i === 0;
      if (isHead) {
        // Distinct head: gradient fill + eye dots
        const grad = ctx.createRadialGradient(
          seg.x * CELL + CELL / 2,
          seg.y * CELL + CELL / 2,
          1,
          seg.x * CELL + CELL / 2,
          seg.y * CELL + CELL / 2,
          CELL / 2,
        );
        grad.addColorStop(
          0,
          shieldActiveRef.current
            ? "oklch(0.65 0.3 255)"
            : "oklch(0.45 0.28 145)",
        );
        grad.addColorStop(
          1,
          shieldActiveRef.current
            ? "oklch(0.50 0.25 255)"
            : "oklch(0.35 0.22 145)",
        );
        ctx.fillStyle = grad;
        ctx.shadowColor = shieldActiveRef.current
          ? "oklch(0.65 0.3 255)"
          : "oklch(0.55 0.25 145)";
        ctx.shadowBlur = shieldActiveRef.current ? 10 : 6;
        ctx.beginPath();
        ctx.roundRect(
          seg.x * CELL + 1,
          seg.y * CELL + 1,
          CELL - 2,
          CELL - 2,
          8,
        );
        ctx.fill();
        ctx.shadowBlur = 0;
        // Eyes
        ctx.fillStyle = "oklch(0.98 0 0)";
        const d = dirRef.current;
        const ex = d.dx === 0 ? [-3, 3] : d.dx > 0 ? [3, 3] : [-3, -3];
        const ey = d.dy === 0 ? [-3, 3] : d.dy > 0 ? [3, 3] : [-3, -3];
        const eyes: [number, number][] = [
          [ex[0], d.dy === 0 ? ey[0] : d.dy > 0 ? 2 : -2],
          [ex[1], d.dy === 0 ? ey[1] : d.dy > 0 ? 2 : -2],
        ];
        for (const [ex2, ey2] of eyes) {
          ctx.beginPath();
          ctx.arc(
            seg.x * CELL + CELL / 2 + ex2,
            seg.y * CELL + CELL / 2 + ey2,
            2,
            0,
            Math.PI * 2,
          );
          ctx.fill();
          ctx.fillStyle = "oklch(0.15 0 0)";
          ctx.beginPath();
          ctx.arc(
            seg.x * CELL + CELL / 2 + ex2,
            seg.y * CELL + CELL / 2 + ey2,
            1,
            0,
            Math.PI * 2,
          );
          ctx.fill();
          ctx.fillStyle = "oklch(0.98 0 0)";
        }
      } else {
        // Body gradient from head to tail
        const alpha = Math.max(0.5, 1 - i * 0.03);
        ctx.fillStyle = `oklch(0.58 0.22 145 / ${alpha})`;
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.roundRect(
          seg.x * CELL + 2,
          seg.y * CELL + 2,
          CELL - 4,
          CELL - 4,
          4,
        );
        ctx.fill();
      }
    });
  }, []);

  const tick = useCallback(
    (ts: number) => {
      const now = performance.now();
      const ap = activePowerUpRef.current;

      // Update active power-up timer
      if (ap && now > ap.expiresAt) {
        activePowerUpRef.current = null;
        shieldActiveRef.current = false;
        setActivePowerUp(null);
      } else if (ap) {
        const left = Math.ceil((ap.expiresAt - now) / 1000);
        setPowerUpTimeLeft(left);
      }

      // Compute effective speed
      let speed = currentSpeedRef.current;
      if (ap?.type === "speedBoost")
        speed = Math.max(MIN_SPEED, Math.floor(speed * 0.5));
      if (ap?.type === "slowMotion")
        speed = Math.min(300, Math.floor(speed * 2));

      if (ts - lastTickRef.current < speed) {
        draw(ts);
        animRef.current = requestAnimationFrame(tick);
        return;
      }
      lastTickRef.current = ts;

      // Occasional power-up spawn (every ~8 seconds, max 2 on board)
      if (
        ts - lastPowerUpCheckRef.current > 8000 &&
        powerUpsRef.current.length < 2
      ) {
        lastPowerUpCheckRef.current = ts;
        if (Math.random() < 0.6) {
          const newPU: PowerUpItem = {
            pos: randPoint(getOccupied()),
            type: randPowerUpType(),
          };
          powerUpsRef.current = [...powerUpsRef.current, newPU];
        }
      }

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
      const hitObstacle = obstaclesRef.current.some(
        (o) => o.x === newHead.x && o.y === newHead.y,
      );

      if (hitWall || hitSelf || hitObstacle) {
        if (shieldActiveRef.current) {
          // Shield absorbs one hit
          shieldActiveRef.current = false;
          activePowerUpRef.current = null;
          setActivePowerUp(null);
        } else {
          if (scoreRef.current > highScoreRef.current) {
            highScoreRef.current = scoreRef.current;
            setHighScore(scoreRef.current);
          }
          setStatus("dead");
          return;
        }
      }

      const atFood =
        newHead.x === foodRef.current.x && newHead.y === foodRef.current.y;
      const pickedPU = powerUpsRef.current.find(
        (p) => p.pos.x === newHead.x && p.pos.y === newHead.y,
      );

      const newSnake = atFood
        ? [newHead, ...snakeRef.current]
        : [newHead, ...snakeRef.current.slice(0, -1)];
      snakeRef.current = newSnake;

      if (atFood) {
        foodEatenRef.current += 1;
        const newScore = scoreRef.current + 10;
        scoreRef.current = newScore;
        setScore(newScore);
        foodRef.current = randPoint(getOccupied());

        // Speed progression every 5 food
        if (foodEatenRef.current % 5 === 0) {
          currentSpeedRef.current = Math.max(
            MIN_SPEED,
            currentSpeedRef.current - 5,
          );
        }

        // Spawn obstacles
        const baseScore = 50;
        const extraObstacles = Math.floor((newScore - baseScore) / 10);
        if (
          newScore >= baseScore &&
          extraObstacles + 1 > obstaclesRef.current.length
        ) {
          const newObs = randPoint(getOccupied());
          obstaclesRef.current = [...obstaclesRef.current, newObs];
        }
      }

      if (pickedPU) {
        powerUpsRef.current = powerUpsRef.current.filter((p) => p !== pickedPU);
        const newAP: ActivePowerUp = {
          type: pickedPU.type,
          expiresAt: performance.now() + POWERUP_DURATION,
        };
        activePowerUpRef.current = newAP;
        if (pickedPU.type === "shield") shieldActiveRef.current = true;
        setActivePowerUp(newAP);
      }

      draw(ts);
      animRef.current = requestAnimationFrame(tick);
    },
    [draw, getOccupied],
  );

  const startGame = useCallback((diff: Difficulty = difficultyRef.current) => {
    difficultyRef.current = diff;
    currentSpeedRef.current = DIFFICULTY_SPEEDS[diff];
    snakeRef.current = [{ x: 10, y: 10 }];
    dirRef.current = { dx: 1, dy: 0 };
    nextDirRef.current = { dx: 1, dy: 0 };
    obstaclesRef.current = [];
    powerUpsRef.current = [];
    activePowerUpRef.current = null;
    shieldActiveRef.current = false;
    scoreRef.current = 0;
    foodEatenRef.current = 0;
    foodRef.current = randPoint([{ x: 10, y: 10 }]);
    setScore(0);
    setActivePowerUp(null);
    setPowerUpTimeLeft(0);
    setDifficulty(diff);
    setStatus("playing");
    lastTickRef.current = 0;
    lastPowerUpCheckRef.current = performance.now();
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
    draw(0);
  }, [draw]);

  const PowerUpIcon = ({ type }: { type: PowerUpType }) => {
    if (type === "shield") return <Shield className="w-3.5 h-3.5" />;
    if (type === "speedBoost") return <Zap className="w-3.5 h-3.5" />;
    return <Clock className="w-3.5 h-3.5" />;
  };

  const powerUpLabel: Record<PowerUpType, string> = {
    shield: "Shield",
    speedBoost: "Speed Boost",
    slowMotion: "Slow Motion",
  };

  const powerUpBadgeClass: Record<PowerUpType, string> = {
    shield: "badge-electric",
    speedBoost: "badge-sunny",
    slowMotion: "badge-purple",
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* HUD */}
      <div className="flex items-center gap-2 w-full flex-wrap justify-between">
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className="font-display font-bold text-sm px-3 py-1"
            data-ocid="snake.score_display"
          >
            {score}
          </Badge>
          <Badge
            variant="outline"
            className="font-display text-xs px-3 py-1 text-muted-foreground"
            data-ocid="snake.highscore_display"
          >
            Best: {highScore}
          </Badge>
        </div>
        <Badge
          className={`font-display text-xs px-3 py-1 ${difficulty === "easy" ? "badge-lime" : difficulty === "hard" ? "badge-hot-pink" : "badge-electric"}`}
          data-ocid="snake.difficulty_badge"
        >
          {DIFFICULTY_LABELS[difficulty]}
        </Badge>
        {activePowerUp && (
          <Badge
            className={`font-display text-xs px-3 py-1 flex items-center gap-1 ${powerUpBadgeClass[activePowerUp.type]}`}
            data-ocid="snake.powerup_display"
          >
            <PowerUpIcon type={activePowerUp.type} />
            {powerUpLabel[activePowerUp.type]} {powerUpTimeLeft}s
          </Badge>
        )}
        <div className="flex items-center gap-2 ml-auto">
          <div className="text-muted-foreground text-xs font-body hidden sm:block">
            WASD / ↑↓←→
          </div>
          {status !== "idle" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => startGame(difficulty)}
              className="rounded-full font-display text-xs"
              data-ocid="snake.restart_button"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" /> New Game
            </Button>
          )}
        </div>
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
          <div className="absolute inset-0 bg-foreground/55 backdrop-blur-sm flex flex-col items-center justify-center gap-4 p-6">
            {status === "dead" && (
              <div className="text-center mb-1">
                <p className="font-display font-extrabold text-2xl text-card">
                  Game Over!
                </p>
                <p className="text-card/80 text-sm font-body">
                  Final Score: {score}
                </p>
                {score === highScore && score > 0 && (
                  <p className="text-secondary text-xs font-display font-bold mt-1">
                    🏆 New High Score!
                  </p>
                )}
              </div>
            )}

            {/* Difficulty Selector */}
            <div className="flex flex-col items-center gap-2">
              <p className="text-card/70 text-xs font-body uppercase tracking-widest">
                Difficulty
              </p>
              <div className="flex gap-2" data-ocid="snake.difficulty_selector">
                {(["easy", "normal", "hard"] as Difficulty[]).map((d) => (
                  <button
                    type="button"
                    key={d}
                    data-ocid={`snake.difficulty_${d}`}
                    onClick={() => setDifficulty(d)}
                    className={`px-4 py-1.5 rounded-full font-display font-bold text-sm transition-smooth border-2 ${
                      difficulty === d
                        ? "border-secondary bg-secondary text-secondary-foreground shadow-play"
                        : "border-card/40 bg-card/20 text-card hover:bg-card/30"
                    }`}
                  >
                    {DIFFICULTY_LABELS[d]}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={() => startGame(difficulty)}
              data-ocid="snake.start_button"
              className="rounded-full px-8 font-display font-bold shadow-play"
            >
              <Play className="w-4 h-4 mr-2" />
              {status === "dead" ? "Play Again" : "Start Game"}
            </Button>

            {status === "idle" && (
              <div className="text-card/60 text-xs font-body text-center max-w-[200px] leading-relaxed">
                Collect power-ups for shields, speed boosts & slow motion.
                Obstacles appear at 50+ points!
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile controls */}
      <div className="grid grid-cols-3 gap-2 sm:hidden">
        {[
          { label: "←", key: "ArrowLeft", col: "" },
          { label: "↑", key: "ArrowUp", col: "col-start-2" },
          { label: "→", key: "ArrowRight", col: "" },
          { label: "", key: "empty1", col: "" },
          { label: "↓", key: "ArrowDown", col: "col-start-2" },
          { label: "", key: "empty2", col: "" },
        ].map(({ label, key, col }) =>
          label ? (
            <Button
              key={key}
              variant="outline"
              size="sm"
              className={`w-12 h-12 rounded-xl font-display font-bold text-lg ${col}`}
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
