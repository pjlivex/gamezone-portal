import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const W = 480;
const H = 600;
const PADDLE_W = 80;
const PADDLE_H = 12;
const PADDLE_Y = H - 40;
const BALL_R = 8;
const BALL_SPEED = 4.5;
const COLS = 8;
const ROWS = 5;
const BRICK_W = 50;
const BRICK_H = 18;
const BRICK_GAP = 4;
const BRICK_TOP = 60;
const INITIAL_LIVES = 3;

// Row color palette matching site OKLCH aesthetic
const ROW_COLORS = [
  { fill: "oklch(0.62 0.22 25)", highlight: "oklch(0.72 0.22 25)" }, // red
  { fill: "oklch(0.68 0.22 60)", highlight: "oklch(0.78 0.22 60)" }, // orange
  { fill: "oklch(0.75 0.22 90)", highlight: "oklch(0.85 0.18 90)" }, // yellow
  { fill: "oklch(0.65 0.22 145)", highlight: "oklch(0.75 0.22 145)" }, // green
  { fill: "oklch(0.62 0.25 255)", highlight: "oklch(0.72 0.25 255)" }, // blue
];

interface Brick {
  x: number;
  y: number;
  row: number;
  alive: boolean;
}

type Status = "idle" | "playing" | "dead" | "won";

function makeBricks(): Brick[] {
  const bricks: Brick[] = [];
  const totalW = COLS * BRICK_W + (COLS - 1) * BRICK_GAP;
  const startX = (W - totalW) / 2;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      bricks.push({
        x: startX + c * (BRICK_W + BRICK_GAP),
        y: BRICK_TOP + r * (BRICK_H + BRICK_GAP),
        row: r,
        alive: true,
      });
    }
  }
  return bricks;
}

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

export default function BreakoutGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Game state refs (mutable, used in rAF loop)
  const paddleXRef = useRef((W - PADDLE_W) / 2);
  const ballXRef = useRef(W / 2);
  const ballYRef = useRef(PADDLE_Y - BALL_R - 1);
  const ballVXRef = useRef(0);
  const ballVYRef = useRef(0);
  const bricksRef = useRef<Brick[]>(makeBricks());
  const livesRef = useRef(INITIAL_LIVES);
  const scoreRef = useRef(0);
  const highScoreRef = useRef(0);
  const launchedRef = useRef(false);
  const animRef = useRef(0);
  const statusRef = useRef<Status>("idle");

  // React state for HUD re-renders
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(INITIAL_LIVES);
  const [status, setStatus] = useState<Status>("idle");
  const [launched, setLaunched] = useState(false);

  const setStatusBoth = useCallback((s: Status) => {
    statusRef.current = s;
    setStatus(s);
  }, []);

  // Park ball on paddle center
  const parkBall = useCallback(() => {
    ballXRef.current = paddleXRef.current + PADDLE_W / 2;
    ballYRef.current = PADDLE_Y - BALL_R - 1;
    ballVXRef.current = 0;
    ballVYRef.current = 0;
    launchedRef.current = false;
    setLaunched(false);
  }, []);

  const launch = useCallback(() => {
    if (launchedRef.current) return;
    launchedRef.current = true;
    setLaunched(true);
    // Random angle between -45 and 45 deg upward
    const angle = (Math.random() * 90 - 45) * (Math.PI / 180);
    ballVXRef.current = BALL_SPEED * Math.sin(angle);
    ballVYRef.current = -BALL_SPEED * Math.cos(angle);
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, W, H);

    // Background — dark navy gradient
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "oklch(0.14 0.04 255)");
    bg.addColorStop(1, "oklch(0.10 0.03 270)");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Grid lines (subtle)
    ctx.strokeStyle = "oklch(0.22 0.03 255)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= W; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y <= H; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    // Bricks
    for (const brick of bricksRef.current) {
      if (!brick.alive) continue;
      const col = ROW_COLORS[brick.row];
      const grad = ctx.createLinearGradient(
        brick.x,
        brick.y,
        brick.x,
        brick.y + BRICK_H,
      );
      grad.addColorStop(0, col.highlight);
      grad.addColorStop(1, col.fill);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(brick.x, brick.y, BRICK_W, BRICK_H, 4);
      ctx.fill();

      // Shine line
      ctx.fillStyle = "rgba(255,255,255,0.18)";
      ctx.beginPath();
      ctx.roundRect(brick.x + 4, brick.y + 3, BRICK_W - 8, 3, 2);
      ctx.fill();
    }

    // Paddle
    const px = paddleXRef.current;
    const paddleGrad = ctx.createLinearGradient(
      px,
      PADDLE_Y,
      px + PADDLE_W,
      PADDLE_Y + PADDLE_H,
    );
    paddleGrad.addColorStop(0, "oklch(0.75 0.25 345)");
    paddleGrad.addColorStop(0.5, "oklch(0.70 0.28 255)");
    paddleGrad.addColorStop(1, "oklch(0.65 0.22 290)");
    ctx.fillStyle = paddleGrad;
    ctx.beginPath();
    ctx.roundRect(px, PADDLE_Y, PADDLE_W, PADDLE_H, 6);
    ctx.fill();

    // Paddle top-shine
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.beginPath();
    ctx.roundRect(px + 6, PADDLE_Y + 2, PADDLE_W - 12, 3, 2);
    ctx.fill();

    // Ball
    const bx = ballXRef.current;
    const by = ballYRef.current;
    ctx.save();
    ctx.shadowColor = "oklch(0.75 0.28 255)";
    ctx.shadowBlur = 16;
    const ballGrad = ctx.createRadialGradient(
      bx - 2,
      by - 2,
      1,
      bx,
      by,
      BALL_R,
    );
    ballGrad.addColorStop(0, "oklch(0.95 0.08 255)");
    ballGrad.addColorStop(1, "oklch(0.72 0.28 255)");
    ctx.fillStyle = ballGrad;
    ctx.beginPath();
    ctx.arc(bx, by, BALL_R, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }, []);

  const gameLoop = useCallback(() => {
    if (statusRef.current !== "playing") return;

    const px = paddleXRef.current;
    let bx = ballXRef.current;
    let by = ballYRef.current;
    let vx = ballVXRef.current;
    let vy = ballVYRef.current;

    if (!launchedRef.current) {
      // Park ball on paddle while waiting for launch
      ballXRef.current = px + PADDLE_W / 2;
      ballYRef.current = PADDLE_Y - BALL_R - 1;
      draw();
      animRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    // Move ball
    bx += vx;
    by += vy;

    // Wall bounces (left/right)
    if (bx - BALL_R <= 0) {
      bx = BALL_R;
      vx = Math.abs(vx);
    }
    if (bx + BALL_R >= W) {
      bx = W - BALL_R;
      vx = -Math.abs(vx);
    }

    // Ceiling bounce
    if (by - BALL_R <= 0) {
      by = BALL_R;
      vy = Math.abs(vy);
    }

    // Paddle collision
    if (
      by + BALL_R >= PADDLE_Y &&
      by + BALL_R <= PADDLE_Y + PADDLE_H + 4 &&
      bx >= px - BALL_R &&
      bx <= px + PADDLE_W + BALL_R &&
      vy > 0
    ) {
      by = PADDLE_Y - BALL_R;
      // Angle depends on where ball hits paddle: center = straight, edges = steep
      const hitPos = (bx - px) / PADDLE_W; // 0..1
      const angle = (hitPos - 0.5) * 2 * (Math.PI * 0.4); // -40° to +40°
      const speed = Math.sqrt(vx * vx + vy * vy);
      vx = speed * Math.sin(angle);
      vy = -Math.abs(speed * Math.cos(angle));
    }

    // Ball lost below
    if (by - BALL_R > H) {
      const newLives = livesRef.current - 1;
      livesRef.current = newLives;
      setLives(newLives);
      if (newLives <= 0) {
        if (scoreRef.current > highScoreRef.current)
          highScoreRef.current = scoreRef.current;
        setStatusBoth("dead");
        draw();
        return;
      }
      // Reset ball
      parkBall();
      bx = ballXRef.current;
      by = ballYRef.current;
      vx = 0;
      vy = 0;
    }

    // Brick collision
    let bricksLeft = 0;
    const bricks = bricksRef.current;
    for (let i = 0; i < bricks.length; i++) {
      const brick = bricks[i];
      if (!brick.alive) continue;
      bricksLeft++;

      const closestX = clamp(bx, brick.x, brick.x + BRICK_W);
      const closestY = clamp(by, brick.y, brick.y + BRICK_H);
      const dx = bx - closestX;
      const dy = by - closestY;

      if (dx * dx + dy * dy < BALL_R * BALL_R) {
        brick.alive = false;
        bricksLeft--;
        scoreRef.current += 10;
        setScore(scoreRef.current);

        // Determine bounce axis
        const overlapX = BALL_R - Math.abs(dx);
        const overlapY = BALL_R - Math.abs(dy);
        if (overlapX < overlapY) {
          vx = dx > 0 ? Math.abs(vx) : -Math.abs(vx);
        } else {
          vy = dy > 0 ? Math.abs(vy) : -Math.abs(vy);
        }
        break;
      }
    }

    // Win check
    if (bricksLeft === 0) {
      if (scoreRef.current > highScoreRef.current)
        highScoreRef.current = scoreRef.current;
      ballXRef.current = bx;
      ballYRef.current = by;
      setStatusBoth("won");
      draw();
      return;
    }

    ballXRef.current = bx;
    ballYRef.current = by;
    ballVXRef.current = vx;
    ballVYRef.current = vy;

    draw();
    animRef.current = requestAnimationFrame(gameLoop);
  }, [draw, parkBall, setStatusBoth]);

  const startGame = useCallback(() => {
    cancelAnimationFrame(animRef.current);
    paddleXRef.current = (W - PADDLE_W) / 2;
    bricksRef.current = makeBricks();
    livesRef.current = INITIAL_LIVES;
    scoreRef.current = 0;
    setScore(0);
    setLives(INITIAL_LIVES);
    parkBall();
    setStatusBoth("playing");
  }, [parkBall, setStatusBoth]);

  const handleLaunch = useCallback(() => {
    if (statusRef.current === "playing") {
      launch();
    }
  }, [launch]);

  // Keyboard controls
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        if (statusRef.current === "playing") launch();
      }
      if (e.code === "ArrowLeft") {
        e.preventDefault();
        paddleXRef.current = clamp(paddleXRef.current - 22, 0, W - PADDLE_W);
      }
      if (e.code === "ArrowRight") {
        e.preventDefault();
        paddleXRef.current = clamp(paddleXRef.current + 22, 0, W - PADDLE_W);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [launch]);

  // Mouse tracking
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (statusRef.current !== "playing") return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = W / rect.width;
      const mouseX = (e.clientX - rect.left) * scaleX;
      paddleXRef.current = clamp(mouseX - PADDLE_W / 2, 0, W - PADDLE_W);
    };
    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, []);

  // Touch tracking
  useEffect(() => {
    const onTouchMove = (e: TouchEvent) => {
      if (statusRef.current !== "playing") return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = W / rect.width;
      const touch = e.touches[0];
      const touchX = (touch.clientX - rect.left) * scaleX;
      paddleXRef.current = clamp(touchX - PADDLE_W / 2, 0, W - PADDLE_W);
      e.preventDefault();
    };
    const el = canvasRef.current;
    el?.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => el?.removeEventListener("touchmove", onTouchMove);
  }, []);

  // Start loop when status = playing
  useEffect(() => {
    if (status === "playing") {
      animRef.current = requestAnimationFrame(gameLoop);
    }
    return () => cancelAnimationFrame(animRef.current);
  }, [status, gameLoop]);

  // Initial draw
  useEffect(() => {
    draw();
  }, [draw]);

  const heartsDisplay = Array.from({ length: INITIAL_LIVES }, (_, i) => ({
    key: `life-${i}-${i < lives ? "full" : "empty"}`,
    emoji: i < lives ? "❤️" : "🖤",
  }));

  return (
    <div className="flex flex-col items-center gap-3" ref={wrapperRef}>
      {/* HUD */}
      <div className="flex items-center justify-between w-full max-w-[480px] px-1">
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className="font-display font-bold px-3 py-1.5 text-sm"
          >
            Score: {score}
          </Badge>
          <Badge
            variant="outline"
            className="font-display font-bold px-3 py-1.5 text-sm"
          >
            Best: {Math.max(score, highScoreRef.current)}
          </Badge>
        </div>
        <div
          className="flex gap-0.5 text-lg leading-none"
          data-ocid="breakout.lives_display"
        >
          {heartsDisplay.map((h) => (
            <span key={h.key}>{h.emoji}</span>
          ))}
        </div>
      </div>

      {/* Canvas wrapper */}
      <div className="relative rounded-2xl overflow-hidden shadow-play border border-border select-none">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="block max-w-full cursor-none"
          onClick={handleLaunch}
          onKeyDown={(e) => {
            if (e.code === "Space") handleLaunch();
          }}
          tabIndex={0}
          data-ocid="breakout.canvas_target"
        />

        {/* Idle overlay */}
        {status === "idle" && (
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
            <div className="text-center">
              <p className="font-display font-extrabold text-3xl text-card mb-1">
                🧱 Breakout
              </p>
              <p className="text-card/70 text-sm font-display">
                Destroy all bricks to win!
              </p>
            </div>
            <Button
              onClick={startGame}
              data-ocid="breakout.start_button"
              className="rounded-full px-8 font-display font-bold shadow-play"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Game
            </Button>
            <div className="text-card/60 text-xs font-display text-center space-y-1">
              <p>🖱️ Mouse or ← → arrow keys to move paddle</p>
              <p>Space or click to launch ball</p>
            </div>
          </div>
        )}

        {/* Playing: waiting to launch */}
        {status === "playing" && !launched && (
          <div className="absolute bottom-16 left-0 right-0 flex justify-center pointer-events-none">
            <span className="bg-foreground/60 text-card text-xs font-display px-3 py-1.5 rounded-full backdrop-blur-sm">
              Click or press Space to launch!
            </span>
          </div>
        )}

        {/* Dead overlay */}
        {status === "dead" && (
          <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
            <div className="text-center">
              <p className="font-display font-extrabold text-3xl text-card mb-1">
                💥 Game Over!
              </p>
              <p className="text-card/80 text-base font-display">
                Final Score: {score}
              </p>
              {score >= highScoreRef.current && score > 0 && (
                <p className="text-yellow-300 text-sm font-display mt-1">
                  🏆 New High Score!
                </p>
              )}
            </div>
            <Button
              onClick={startGame}
              data-ocid="breakout.restart_button"
              className="rounded-full px-8 font-display font-bold shadow-play"
            >
              <Play className="w-4 h-4 mr-2" />
              Play Again
            </Button>
          </div>
        )}

        {/* Won overlay */}
        {status === "won" && (
          <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
            <div className="text-center">
              <p className="font-display font-extrabold text-4xl text-card mb-1">
                🎉 You Won!
              </p>
              <p className="text-card/80 text-base font-display">
                All bricks destroyed!
              </p>
              <p className="text-card/90 font-display font-bold text-xl mt-1">
                Score: {score}
              </p>
              {score >= highScoreRef.current && (
                <p className="text-yellow-300 text-sm font-display mt-1">
                  🏆 High Score!
                </p>
              )}
            </div>
            <Button
              onClick={startGame}
              data-ocid="breakout.play_again_button"
              className="rounded-full px-8 font-display font-bold shadow-play"
            >
              <Play className="w-4 h-4 mr-2" />
              Play Again
            </Button>
          </div>
        )}
      </div>

      {/* Mobile launch button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleLaunch}
        className="sm:hidden rounded-full font-display font-bold px-8 h-12 text-base"
        data-ocid="breakout.launch_button"
      >
        🏓 Launch!
      </Button>
    </div>
  );
}
