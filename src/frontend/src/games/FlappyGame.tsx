import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const W = 360;
const H = 500;
const GRAVITY = 0.5;
const FLAP = -9;
const PIPE_WIDTH = 52;
const PIPE_GAP = 140;
const PIPE_SPEED = 2.5;
const BIRD_X = 80;
const BIRD_SIZE = 28;

interface Pipe {
  x: number;
  top: number;
}

function newPipe(): Pipe {
  return {
    x: W,
    top: 60 + Math.random() * (H - PIPE_GAP - 120),
  };
}

export default function FlappyGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const birdYRef = useRef(H / 2);
  const birdVelRef = useRef(0);
  const pipesRef = useRef<Pipe[]>([]);
  const scoreRef = useRef(0);
  const animRef = useRef(0);
  const frameRef = useRef(0);

  const [score, setScore] = useState(0);
  const [status, setStatus] = useState<"idle" | "playing" | "dead">("idle");
  const statusRef = useRef<"idle" | "playing" | "dead">("idle");

  const flap = useCallback(() => {
    if (statusRef.current === "idle") {
      statusRef.current = "playing";
      setStatus("playing");
    }
    if (statusRef.current === "playing") {
      birdVelRef.current = FLAP;
    }
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, W, H);

    // Sky
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, "oklch(0.75 0.18 255)");
    sky.addColorStop(1, "oklch(0.88 0.12 210)");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    // Ground
    ctx.fillStyle = "oklch(0.65 0.22 145)";
    ctx.fillRect(0, H - 40, W, 40);
    ctx.fillStyle = "oklch(0.55 0.22 145)";
    ctx.fillRect(0, H - 40, W, 8);

    // Pipes
    for (const pipe of pipesRef.current) {
      // Top pipe
      ctx.fillStyle = "oklch(0.55 0.22 145)";
      ctx.beginPath();
      ctx.roundRect(pipe.x, 0, PIPE_WIDTH, pipe.top - 8, [0, 0, 8, 8]);
      ctx.fill();
      ctx.fillStyle = "oklch(0.60 0.22 145)";
      ctx.beginPath();
      ctx.roundRect(
        pipe.x - 4,
        pipe.top - 24,
        PIPE_WIDTH + 8,
        24,
        [6, 6, 0, 0],
      );
      ctx.fill();

      // Bottom pipe
      const bottom = pipe.top + PIPE_GAP;
      ctx.fillStyle = "oklch(0.55 0.22 145)";
      ctx.beginPath();
      ctx.roundRect(
        pipe.x,
        bottom + 8,
        PIPE_WIDTH,
        H - bottom - 48,
        [8, 8, 0, 0],
      );
      ctx.fill();
      ctx.fillStyle = "oklch(0.60 0.22 145)";
      ctx.beginPath();
      ctx.roundRect(pipe.x - 4, bottom, PIPE_WIDTH + 8, 24, [0, 0, 6, 6]);
      ctx.fill();
    }

    // Bird
    const birdY = birdYRef.current;
    ctx.save();
    ctx.translate(BIRD_X, birdY);
    ctx.rotate(Math.min(Math.max(birdVelRef.current * 0.06, -0.5), 1));
    ctx.font = `${BIRD_SIZE * 1.4}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🐦", 0, 0);
    ctx.restore();

    // Score HUD
    ctx.fillStyle = "white";
    ctx.font = "bold 28px sans-serif";
    ctx.textAlign = "center";
    ctx.shadowColor = "rgba(0,0,0,0.3)";
    ctx.shadowBlur = 4;
    ctx.fillText(String(scoreRef.current), W / 2, 40);
    ctx.shadowBlur = 0;
  }, []);

  const gameLoop = useCallback(() => {
    if (statusRef.current !== "playing") return;
    frameRef.current++;

    // Physics
    birdVelRef.current += GRAVITY;
    birdYRef.current += birdVelRef.current;

    // Add pipe
    if (frameRef.current % 90 === 0) {
      pipesRef.current.push(newPipe());
    }

    // Move pipes + score
    pipesRef.current = pipesRef.current
      .map((p) => ({ ...p, x: p.x - PIPE_SPEED }))
      .filter((p) => p.x > -PIPE_WIDTH - 10);

    for (const p of pipesRef.current) {
      if (Math.floor(p.x + PIPE_SPEED) === BIRD_X && p.x < BIRD_X) {
        scoreRef.current++;
        setScore(scoreRef.current);
      }
    }

    // Collision
    const bY = birdYRef.current;
    if (bY + BIRD_SIZE / 2 > H - 40 || bY - BIRD_SIZE / 2 < 0) {
      statusRef.current = "dead";
      setStatus("dead");
      draw();
      return;
    }
    for (const p of pipesRef.current) {
      if (
        BIRD_X + BIRD_SIZE / 2 - 4 > p.x &&
        BIRD_X - BIRD_SIZE / 2 + 4 < p.x + PIPE_WIDTH &&
        (bY - BIRD_SIZE / 2 + 4 < p.top ||
          bY + BIRD_SIZE / 2 - 4 > p.top + PIPE_GAP)
      ) {
        statusRef.current = "dead";
        setStatus("dead");
        draw();
        return;
      }
    }

    draw();
    animRef.current = requestAnimationFrame(gameLoop);
  }, [draw]);

  const startGame = useCallback(() => {
    birdYRef.current = H / 2;
    birdVelRef.current = 0;
    pipesRef.current = [];
    scoreRef.current = 0;
    frameRef.current = 0;
    setScore(0);
    statusRef.current = "idle";
    setStatus("idle");
    draw();
  }, [draw]);

  useEffect(() => {
    draw();
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        flap();
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      cancelAnimationFrame(animRef.current);
    };
  }, [draw, flap]);

  useEffect(() => {
    if (status === "playing") {
      animRef.current = requestAnimationFrame(gameLoop);
    }
    return () => cancelAnimationFrame(animRef.current);
  }, [status, gameLoop]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-4 w-full justify-between">
        <Badge variant="secondary" className="font-display font-bold px-4 py-2">
          Score: {score}
        </Badge>
        <span className="text-muted-foreground text-xs hidden sm:block">
          Space or tap to flap
        </span>
      </div>

      <button
        type="button"
        className="relative rounded-2xl overflow-hidden shadow-play border border-border cursor-pointer select-none p-0 bg-transparent"
        onClick={flap}
        onKeyDown={(e) => {
          if (e.code === "Space") flap();
        }}
        data-ocid="flappy.canvas_target"
      >
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="block max-w-full"
        />
        {(status === "idle" || status === "dead") && (
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
            {status === "dead" && (
              <div className="text-center mb-2">
                <p className="font-display font-extrabold text-2xl text-card">
                  Game Over!
                </p>
                <p className="text-card/80 text-sm">Score: {score}</p>
              </div>
            )}
            <Button
              onClick={(e) => {
                e.stopPropagation();
                startGame();
              }}
              data-ocid="flappy.start_button"
              className="rounded-full px-8 font-display font-bold shadow-play"
            >
              <Play className="w-4 h-4 mr-2" />
              {status === "dead" ? "Play Again" : "Start"}
            </Button>
            {status === "idle" && (
              <p className="text-card/70 text-sm font-display">
                Tap or press Space to flap!
              </p>
            )}
          </div>
        )}
      </button>

      <Button
        variant="outline"
        size="sm"
        onClick={flap}
        className="sm:hidden rounded-full font-display font-bold px-8 h-12 text-base"
        data-ocid="flappy.flap_button"
      >
        🐦 Flap!
      </Button>
    </div>
  );
}
