import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const W = 480;
const H = 600;
const PADDLE_W = 14;
const PADDLE_H = 80;
const PADDLE_RADIUS = 7;
const BALL_RADIUS = 9;
const PADDLE_MARGIN = 20;
const WIN_SCORE = 7;
const AI_SPEED = 4.2;
const BALL_SPEED_INIT = 5;
const BALL_SPEED_MAX = 10;
const BALL_SPEED_INCREMENT = 0.25;
const GO_FLASH_FRAMES = 60;

type GameStatus = "idle" | "playing" | "over";

interface GameState {
  ballX: number;
  ballY: number;
  ballVx: number;
  ballVy: number;
  playerY: number;
  aiY: number;
  playerScore: number;
  aiScore: number;
  speed: number;
  goFlash: number;
}

function clampPaddle(y: number): number {
  return Math.max(0, Math.min(H - PADDLE_H, y));
}

function initialState(): GameState {
  const angle = ((Math.random() * 60 - 30) * Math.PI) / 180;
  const dir = Math.random() > 0.5 ? 1 : -1;
  return {
    ballX: W / 2,
    ballY: H / 2,
    ballVx: BALL_SPEED_INIT * dir * Math.cos(angle),
    ballVy: BALL_SPEED_INIT * Math.sin(angle),
    playerY: H / 2 - PADDLE_H / 2,
    aiY: H / 2 - PADDLE_H / 2,
    playerScore: 0,
    aiScore: 0,
    speed: BALL_SPEED_INIT,
    goFlash: GO_FLASH_FRAMES,
  };
}

export default function PongGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState>(initialState());
  const statusRef = useRef<GameStatus>("idle");
  const animRef = useRef(0);
  const mouseYRef = useRef<number | null>(null);

  const [status, setStatus] = useState<GameStatus>("idle");
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [winner, setWinner] = useState<"Player" | "AI" | null>(null);

  // --- Drawing ---
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const s = stateRef.current;

    // Background
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "oklch(0.13 0.04 255)");
    bg.addColorStop(1, "oklch(0.10 0.03 280)");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Center dashed line
    ctx.save();
    ctx.setLineDash([12, 14]);
    ctx.strokeStyle = "oklch(0.40 0.04 255)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(W / 2, 0);
    ctx.lineTo(W / 2, H);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // Score display
    ctx.font = "bold 48px 'Space Grotesk', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillStyle = "oklch(0.80 0.15 200)";
    ctx.fillText(String(s.playerScore), W / 4, 20);
    ctx.fillStyle = "oklch(0.80 0.20 345)";
    ctx.fillText(String(s.aiScore), (W * 3) / 4, 20);

    // Score labels
    ctx.font = "bold 13px 'Space Grotesk', sans-serif";
    ctx.fillStyle = "oklch(0.55 0.08 255)";
    ctx.fillText("YOU", W / 4, 72);
    ctx.fillText("AI", (W * 3) / 4, 72);

    // Player paddle (cyan gradient, left side)
    const playerGrad = ctx.createLinearGradient(
      PADDLE_MARGIN,
      s.playerY,
      PADDLE_MARGIN + PADDLE_W,
      s.playerY + PADDLE_H,
    );
    playerGrad.addColorStop(0, "oklch(0.80 0.22 195)");
    playerGrad.addColorStop(1, "oklch(0.60 0.28 220)");
    ctx.fillStyle = playerGrad;
    ctx.shadowColor = "oklch(0.75 0.28 200)";
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.roundRect(PADDLE_MARGIN, s.playerY, PADDLE_W, PADDLE_H, PADDLE_RADIUS);
    ctx.fill();
    ctx.shadowBlur = 0;

    // AI paddle (pink gradient, right side)
    const aiGrad = ctx.createLinearGradient(
      W - PADDLE_MARGIN - PADDLE_W,
      s.aiY,
      W - PADDLE_MARGIN,
      s.aiY + PADDLE_H,
    );
    aiGrad.addColorStop(0, "oklch(0.80 0.25 345)");
    aiGrad.addColorStop(1, "oklch(0.60 0.28 310)");
    ctx.fillStyle = aiGrad;
    ctx.shadowColor = "oklch(0.75 0.28 345)";
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.roundRect(
      W - PADDLE_MARGIN - PADDLE_W,
      s.aiY,
      PADDLE_W,
      PADDLE_H,
      PADDLE_RADIUS,
    );
    ctx.fill();
    ctx.shadowBlur = 0;

    // Ball glow
    ctx.shadowColor = "oklch(0.95 0.18 80)";
    ctx.shadowBlur = 24;
    const ballGrad = ctx.createRadialGradient(
      s.ballX,
      s.ballY,
      2,
      s.ballX,
      s.ballY,
      BALL_RADIUS,
    );
    ballGrad.addColorStop(0, "oklch(0.98 0.10 80)");
    ballGrad.addColorStop(1, "oklch(0.80 0.25 90)");
    ctx.fillStyle = ballGrad;
    ctx.beginPath();
    ctx.arc(s.ballX, s.ballY, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // GO! flash
    if (s.goFlash > 0) {
      const alpha = Math.min(1, s.goFlash / 20);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = "bold 80px 'Space Grotesk', sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "oklch(0.98 0.22 90)";
      ctx.shadowColor = "oklch(0.90 0.28 90)";
      ctx.shadowBlur = 30;
      ctx.fillText("GO!", W / 2, H / 2);
      ctx.restore();
    }
  }, []);

  // --- Game loop ---
  const gameLoop = useCallback(() => {
    if (statusRef.current !== "playing") return;
    const s = stateRef.current;

    // Player paddle: mouse tracking
    if (mouseYRef.current !== null) {
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const scaleY = H / rect.height;
        const targetY = (mouseYRef.current - rect.top) * scaleY - PADDLE_H / 2;
        s.playerY = clampPaddle(targetY);
      }
    }

    // AI paddle: follow ball with speed limit
    const aiCenter = s.aiY + PADDLE_H / 2;
    const diff = s.ballY - aiCenter;
    if (Math.abs(diff) > AI_SPEED) {
      s.aiY = clampPaddle(s.aiY + (diff > 0 ? AI_SPEED : -AI_SPEED));
    } else {
      s.aiY = clampPaddle(s.aiY + diff);
    }

    // Ball movement
    s.ballX += s.ballVx;
    s.ballY += s.ballVy;

    // Top/bottom wall bounce
    if (s.ballY - BALL_RADIUS < 0) {
      s.ballY = BALL_RADIUS;
      s.ballVy = Math.abs(s.ballVy);
    } else if (s.ballY + BALL_RADIUS > H) {
      s.ballY = H - BALL_RADIUS;
      s.ballVy = -Math.abs(s.ballVy);
    }

    // Player paddle collision (left)
    const playerRight = PADDLE_MARGIN + PADDLE_W;
    if (
      s.ballX - BALL_RADIUS < playerRight &&
      s.ballX + BALL_RADIUS > PADDLE_MARGIN &&
      s.ballY > s.playerY &&
      s.ballY < s.playerY + PADDLE_H &&
      s.ballVx < 0
    ) {
      const hitPos = (s.ballY - s.playerY) / PADDLE_H - 0.5; // -0.5 to 0.5
      const maxAngle = 60 * (Math.PI / 180);
      const angle = hitPos * maxAngle;
      s.speed = Math.min(s.speed + BALL_SPEED_INCREMENT, BALL_SPEED_MAX);
      s.ballVx = Math.abs(Math.cos(angle) * s.speed);
      s.ballVy = Math.sin(angle) * s.speed;
      s.ballX = playerRight + BALL_RADIUS;
    }

    // AI paddle collision (right)
    const aiLeft = W - PADDLE_MARGIN - PADDLE_W;
    if (
      s.ballX + BALL_RADIUS > aiLeft &&
      s.ballX - BALL_RADIUS < W - PADDLE_MARGIN &&
      s.ballY > s.aiY &&
      s.ballY < s.aiY + PADDLE_H &&
      s.ballVx > 0
    ) {
      const hitPos = (s.ballY - s.aiY) / PADDLE_H - 0.5;
      const maxAngle = 60 * (Math.PI / 180);
      const angle = hitPos * maxAngle;
      s.speed = Math.min(s.speed + BALL_SPEED_INCREMENT, BALL_SPEED_MAX);
      s.ballVx = -Math.abs(Math.cos(angle) * s.speed);
      s.ballVy = Math.sin(angle) * s.speed;
      s.ballX = aiLeft - BALL_RADIUS;
    }

    // Scoring
    if (s.ballX - BALL_RADIUS < 0) {
      // AI scores
      s.aiScore++;
      setAiScore(s.aiScore);
      if (s.aiScore >= WIN_SCORE) {
        statusRef.current = "over";
        setStatus("over");
        setWinner("AI");
        draw();
        return;
      }
      resetBall(s, 1);
    } else if (s.ballX + BALL_RADIUS > W) {
      // Player scores
      s.playerScore++;
      setPlayerScore(s.playerScore);
      if (s.playerScore >= WIN_SCORE) {
        statusRef.current = "over";
        setStatus("over");
        setWinner("Player");
        draw();
        return;
      }
      resetBall(s, -1);
    }

    // GO flash timer
    if (s.goFlash > 0) s.goFlash--;

    draw();
    animRef.current = requestAnimationFrame(gameLoop);
  }, [draw]);

  function resetBall(s: GameState, dir: 1 | -1) {
    s.ballX = W / 2;
    s.ballY = H / 2;
    s.speed = BALL_SPEED_INIT;
    const angle = ((Math.random() * 40 - 20) * Math.PI) / 180;
    s.ballVx = BALL_SPEED_INIT * dir * Math.cos(angle);
    s.ballVy = BALL_SPEED_INIT * Math.sin(angle);
  }

  const startGame = useCallback(() => {
    cancelAnimationFrame(animRef.current);
    stateRef.current = initialState();
    setPlayerScore(0);
    setAiScore(0);
    setWinner(null);
    statusRef.current = "playing";
    setStatus("playing");
  }, []);

  // Keyboard controls
  useEffect(() => {
    const keys: Record<string, boolean> = {};
    let frameId = 0;

    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" && statusRef.current !== "playing") {
        startGame();
        e.preventDefault();
        return;
      }
      keys[e.code] = true;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keys[e.code] = false;
    };

    const moveLoop = () => {
      if (statusRef.current === "playing") {
        const s = stateRef.current;
        if (keys.KeyW || keys.ArrowUp) {
          s.playerY = clampPaddle(s.playerY - 6);
          mouseYRef.current = null;
        }
        if (keys.KeyS || keys.ArrowDown) {
          s.playerY = clampPaddle(s.playerY + 6);
          mouseYRef.current = null;
        }
      }
      frameId = requestAnimationFrame(moveLoop);
    };
    frameId = requestAnimationFrame(moveLoop);

    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKeyUp);
      cancelAnimationFrame(frameId);
    };
  }, [startGame]);

  // Mouse tracking
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      mouseYRef.current = e.clientY;
    },
    [],
  );

  // Touch tracking
  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      if (e.touches.length > 0) {
        mouseYRef.current = e.touches[0].clientY;
      }
    },
    [],
  );

  // Click to start
  const handleCanvasClick = useCallback(() => {
    if (statusRef.current !== "playing") startGame();
  }, [startGame]);

  // Game loop effect
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

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-4 w-full justify-between">
        <Badge
          variant="secondary"
          className="font-display font-bold px-4 py-2 text-sm"
        >
          First to {WIN_SCORE} wins
        </Badge>
        <span className="text-muted-foreground text-xs hidden sm:block">
          W/S or ↑/↓ keys · Mouse to aim paddle
        </span>
      </div>

      <div
        className="relative rounded-2xl overflow-hidden shadow-play border border-border"
        data-ocid="pong.canvas_target"
      >
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="block max-w-full cursor-none"
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
          onClick={handleCanvasClick}
          onKeyDown={(e) => {
            if (e.code === "Space") handleCanvasClick();
          }}
          tabIndex={0}
          aria-label="Pong game canvas"
        />

        {/* Idle overlay */}
        {status === "idle" && (
          <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm flex flex-col items-center justify-center gap-5">
            <div className="text-center">
              <p className="font-display font-extrabold text-3xl text-card mb-1">
                🏓 Pong
              </p>
              <p className="text-card/70 text-sm font-display">
                First to {WIN_SCORE} points wins
              </p>
            </div>
            <div className="flex flex-col gap-2 items-center text-card/60 text-xs font-display">
              <span>🖱 Move mouse to control your paddle</span>
              <span>⌨ Or use W/S · ↑/↓ keys</span>
            </div>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                startGame();
              }}
              data-ocid="pong.start_button"
              className="rounded-full px-8 font-display font-bold shadow-play"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Game
            </Button>
          </div>
        )}

        {/* Game-over overlay */}
        {status === "over" && (
          <div className="absolute inset-0 bg-foreground/55 backdrop-blur-sm flex flex-col items-center justify-center gap-5">
            <div className="text-center">
              <p className="font-display font-extrabold text-4xl text-card mb-2">
                {winner === "Player" ? "🎉 You Win!" : "🤖 AI Wins"}
              </p>
              <p className="text-card/80 text-lg font-display font-bold">
                {playerScore} — {aiScore}
              </p>
            </div>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                startGame();
              }}
              data-ocid="pong.play_again_button"
              className="rounded-full px-8 font-display font-bold shadow-play"
            >
              <Play className="w-4 h-4 mr-2" />
              Play Again
            </Button>
          </div>
        )}
      </div>

      {/* Mobile touch area */}
      <div className="flex gap-3 sm:hidden">
        <Button
          variant="outline"
          size="sm"
          className="rounded-full font-display font-bold px-6 h-12 text-base"
          data-ocid="pong.move_up_button"
          onPointerDown={() => {
            if (statusRef.current === "playing") {
              stateRef.current.playerY = clampPaddle(
                stateRef.current.playerY - 40,
              );
              mouseYRef.current = null;
            }
          }}
        >
          ▲ Up
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full font-display font-bold px-6 h-12 text-base"
          data-ocid="pong.move_down_button"
          onPointerDown={() => {
            if (statusRef.current === "playing") {
              stateRef.current.playerY = clampPaddle(
                stateRef.current.playerY + 40,
              );
              mouseYRef.current = null;
            }
          }}
        >
          ▼ Down
        </Button>
      </div>
    </div>
  );
}
