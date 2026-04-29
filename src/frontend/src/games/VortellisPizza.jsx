import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────
const W = 480;
const H = 600;
const PW = 22;
const PH = 22;
const SPEED = 3.5;
const INITIAL_LIVES = 3;
const GAME_TIME = 90;
const CAR_W = 58;
const CAR_H = 24;

const REST = { x: W / 2 - 38, y: 14, w: 76, h: 60 };

const HOUSES = [
  { id: 0, x: 16,  y: 148, w: 52, h: 46 },
  { id: 1, x: 412, y: 148, w: 52, h: 46 },
  { id: 2, x: 16,  y: 303, w: 52, h: 46 },
  { id: 3, x: 412, y: 303, w: 52, h: 46 },
  { id: 4, x: 16,  y: 458, w: 52, h: 46 },
  { id: 5, x: 412, y: 458, w: 52, h: 46 },
  { id: 6, x: 196, y: 524, w: 52, h: 46 },
];

const LANE_DEFS = [
  { y: 104, dir:  1, spd: 1.9 },
  { y: 176, dir: -1, spd: 2.4 },
  { y: 253, dir:  1, spd: 2.1 },
  { y: 356, dir: -1, spd: 2.8 },
  { y: 411, dir:  1, spd: 2.4 },
  { y: 488, dir: -1, spd: 3.2 },
];

const CAR_COLORS = [
  "oklch(0.58 0.22 25)",
  "oklch(0.60 0.20 60)",
  "oklch(0.55 0.20 145)",
  "oklch(0.58 0.24 255)",
  "oklch(0.60 0.22 300)",
  "oklch(0.55 0.15 200)",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function makeCars() {
  return LANE_DEFS.flatMap((lane, li) =>
    [0, 1, 2].map((ci) => {
      const gap = (W + CAR_W + 50) / 3;
      const startX =
        lane.dir === 1 ? -CAR_W + ci * gap : W + ci * gap;
      return {
        id: li * 10 + ci,
        x: startX,
        y: lane.y - CAR_H / 2,
        vx: lane.dir * lane.spd,
        color: CAR_COLORS[(li * 3 + ci) % CAR_COLORS.length],
      };
    })
  );
}

function hits(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function VortellisPizza() {
  const canvasRef = useRef(null);

  // game-state refs (mutated in rAF loop — no re-render)
  const pxRef     = useRef(W / 2 - PW / 2);
  const pyRef     = useRef(REST.y + REST.h + 22);
  const hasPRef   = useRef(false);
  const carsRef   = useRef([]);
  const targetRef = useRef(0);
  const livesRef  = useRef(INITIAL_LIVES);
  const scoreRef  = useRef(0);
  const highRef   = useRef(0);
  const timerRef  = useRef(GAME_TIME);
  const comboRef  = useRef(0);
  const lastDRef  = useRef(0);
  const invRef    = useRef(0);
  const pulseRef  = useRef(0);
  const animRef   = useRef(0);
  const statusRef = useRef("idle");
  const keysRef   = useRef({});
  const tickRef   = useRef(null);

  // React state — HUD only
  const [score,    setScore]    = useState(0);
  const [lives,    setLives]    = useState(INITIAL_LIVES);
  const [status,   setStatus]   = useState("idle");
  const [hasPizza, setHasPizza] = useState(false);
  const [target,   setTarget]   = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [combo,    setCombo]    = useState(0);

  const setStatusB = useCallback((s) => {
    statusRef.current = s;
    setStatus(s);
  }, []);

  const randomTarget = useCallback((exclude) => {
    const pool = HOUSES.filter((h) => h.id !== exclude);
    const h = pool[Math.floor(Math.random() * pool.length)];
    targetRef.current = h.id;
    setTarget(h.id);
  }, []);

  // ─── Draw ─────────────────────────────────────────────────────────────────
  const draw = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    ctx.clearRect(0, 0, W, H);

    const pulse = Math.sin((pulseRef.current / 90) * Math.PI * 2) * 0.5 + 0.5;

    // ── Background
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "oklch(0.18 0.04 145)");
    bg.addColorStop(1, "oklch(0.13 0.02 200)");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Pavement grid
    ctx.strokeStyle = "oklch(0.24 0.03 145)";
    ctx.lineWidth = 0.8;
    for (let x = 0; x < W; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // ── Roads
    LANE_DEFS.forEach((lane) => {
      const ry = lane.y - CAR_H / 2 - 8;
      const rh = CAR_H + 16;
      ctx.fillStyle = "oklch(0.22 0.02 250)";
      ctx.fillRect(0, ry, W, rh);
      // Edge stripes
      ctx.strokeStyle = "oklch(0.38 0.05 255 / 0.5)";
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, ry); ctx.lineTo(W, ry); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, ry + rh); ctx.lineTo(W, ry + rh); ctx.stroke();
      // Dashed center
      ctx.strokeStyle =
        lane.dir === 1
          ? "oklch(0.65 0.18 60 / 0.45)"
          : "oklch(0.55 0.15 145 / 0.45)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([14, 10]);
      ctx.beginPath(); ctx.moveTo(0, lane.y); ctx.lineTo(W, lane.y); ctx.stroke();
      ctx.setLineDash([]);
      // Direction arrows
      ctx.fillStyle = "oklch(0.48 0.05 255 / 0.35)";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "center";
      for (let ax = 55; ax < W; ax += 110) {
        ctx.fillText(lane.dir === 1 ? "→" : "←", ax, lane.y + 4);
      }
      ctx.textAlign = "left";
    });

    // ── Restaurant
    ctx.save();
    if (!hasPRef.current) {
      ctx.shadowColor = "oklch(0.80 0.22 55)";
      ctx.shadowBlur = 12 + pulse * 14;
    }
    // Building
    const rg = ctx.createLinearGradient(REST.x, REST.y, REST.x + REST.w, REST.y + REST.h);
    rg.addColorStop(0, "oklch(0.58 0.24 20)");
    rg.addColorStop(1, "oklch(0.46 0.20 15)");
    ctx.fillStyle = rg;
    ctx.beginPath(); ctx.roundRect(REST.x, REST.y, REST.w, REST.h, 8); ctx.fill();
    // Striped awning
    const stripes = 5;
    for (let i = 0; i < stripes; i++) {
      ctx.fillStyle = i % 2 === 0 ? "oklch(0.72 0.24 25)" : "oklch(0.85 0.20 55)";
      const sw = REST.w / stripes;
      const r = i === 0 ? [8, 0, 0, 8] : i === stripes - 1 ? [0, 8, 8, 0] : 0;
      ctx.beginPath(); ctx.roundRect(REST.x + i * sw, REST.y, sw, 16, r); ctx.fill();
    }
    ctx.restore();
    // Sign text
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.font = "bold 9px monospace";
    ctx.fillText("🍕 VORTELLI'S", REST.x + REST.w / 2, REST.y + 30);
    ctx.font = "7px monospace";
    ctx.fillStyle = "rgba(255,240,200,0.85)";
    ctx.fillText("PIZZA DELIVERY", REST.x + REST.w / 2, REST.y + 42);
    if (!hasPRef.current) {
      ctx.fillStyle = `oklch(0.95 0.18 60 / ${0.7 + pulse * 0.3})`;
      ctx.font = "bold 7px monospace";
      ctx.fillText("▼ PICK UP ▼", REST.x + REST.w / 2, REST.y + 57);
    }
    ctx.textAlign = "left";

    // ── Houses
    HOUSES.forEach((h) => {
      const isTgt = h.id === targetRef.current && hasPRef.current;
      ctx.save();
      if (isTgt) {
        ctx.shadowColor = "oklch(0.80 0.25 145)";
        ctx.shadowBlur = 18 + pulse * 14;
      }
      // Body
      ctx.fillStyle = isTgt
        ? `oklch(${0.44 + pulse * 0.14} 0.22 145)`
        : "oklch(0.38 0.10 255)";
      ctx.beginPath(); ctx.roundRect(h.x, h.y, h.w, h.h, 5); ctx.fill();
      ctx.restore();
      // Roof
      ctx.fillStyle = isTgt ? "oklch(0.36 0.20 145)" : "oklch(0.30 0.08 255)";
      ctx.beginPath();
      ctx.moveTo(h.x - 4, h.y + 6);
      ctx.lineTo(h.x + h.w / 2, h.y - 12);
      ctx.lineTo(h.x + h.w + 4, h.y + 6);
      ctx.closePath(); ctx.fill();
      // Roof highlight
      ctx.fillStyle = "rgba(255,255,255,0.11)";
      ctx.beginPath();
      ctx.moveTo(h.x + 5, h.y + 4);
      ctx.lineTo(h.x + h.w / 2, h.y - 10);
      ctx.lineTo(h.x + h.w / 2 + 7, h.y - 2);
      ctx.closePath(); ctx.fill();
      // Door
      ctx.fillStyle = "oklch(0.28 0.06 60)";
      ctx.beginPath();
      ctx.roundRect(h.x + h.w / 2 - 7, h.y + h.h - 17, 14, 17, [3, 3, 0, 0]);
      ctx.fill();
      // Windows
      ctx.fillStyle = isTgt
        ? `oklch(0.92 0.18 60 / ${0.7 + pulse * 0.3})`
        : "oklch(0.55 0.10 60 / 0.45)";
      ctx.beginPath(); ctx.roundRect(h.x + 5,          h.y + 10, 10, 8, 2); ctx.fill();
      ctx.beginPath(); ctx.roundRect(h.x + h.w - 15,   h.y + 10, 10, 8, 2); ctx.fill();
      // Label
      ctx.textAlign = "center";
      ctx.fillStyle = isTgt
        ? `oklch(0.98 0.10 145 / ${0.8 + pulse * 0.2})`
        : "rgba(255,255,255,0.42)";
      ctx.font = isTgt ? "bold 8px monospace" : "7px monospace";
      ctx.fillText(isTgt ? "DELIVER!" : `#${h.id + 1}`, h.x + h.w / 2, h.y + h.h + 11);
      ctx.textAlign = "left";
    });

    // ── Cars
    carsRef.current.forEach((car) => {
      const fwd = car.vx > 0;
      // Drop shadow
      ctx.fillStyle = "rgba(0,0,0,0.20)";
      ctx.beginPath();
      ctx.ellipse(car.x + CAR_W / 2, car.y + CAR_H + 2, CAR_W / 2 - 3, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();
      // Body
      ctx.fillStyle = car.color;
      ctx.beginPath(); ctx.roundRect(car.x, car.y, CAR_W, CAR_H, 5); ctx.fill();
      // Cabin roof
      ctx.fillStyle = "rgba(0,0,0,0.22)";
      ctx.beginPath();
      ctx.roundRect(car.x + CAR_W * 0.18, car.y + 2, CAR_W * 0.64, CAR_H * 0.46, [3, 3, 0, 0]);
      ctx.fill();
      // Windshield
      ctx.fillStyle = "oklch(0.85 0.05 220 / 0.65)";
      ctx.beginPath();
      ctx.roundRect(
        fwd ? car.x + CAR_W - 21 : car.x + 4,
        car.y + 4, 15, CAR_H - 10, 2
      );
      ctx.fill();
      // Lights
      ctx.fillStyle = fwd
        ? "oklch(0.95 0.18 60)"
        : "oklch(0.68 0.22 25)";
      const lx = fwd ? car.x + CAR_W - 4 : car.x + 4;
      ctx.beginPath(); ctx.arc(lx, car.y + 6, 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(lx, car.y + CAR_H - 6, 2.5, 0, Math.PI * 2); ctx.fill();
      // Wheels
      ctx.fillStyle = "oklch(0.15 0.01 255)";
      [
        [car.x + 9,          car.y],
        [car.x + CAR_W - 13, car.y],
        [car.x + 9,          car.y + CAR_H],
        [car.x + CAR_W - 13, car.y + CAR_H],
      ].forEach(([wx, wy]) => {
        ctx.beginPath(); ctx.ellipse(wx, wy, 5, 3, 0, 0, Math.PI * 2); ctx.fill();
      });
    });

    // ── Player scooter
    const px = pxRef.current;
    const py = pyRef.current;
    const inv = invRef.current;
    if (inv === 0 || Math.floor(inv / 5) % 2 === 0) {
      ctx.save();
      ctx.shadowColor = "oklch(0.78 0.28 330)";
      ctx.shadowBlur = 10;
      // Scooter deck
      ctx.fillStyle = "oklch(0.68 0.26 340)";
      ctx.beginPath(); ctx.roundRect(px + 3, py + 9, PW - 6, PH - 10, 5); ctx.fill();
      // Handlebar
      ctx.fillStyle = "oklch(0.55 0.20 300)";
      ctx.beginPath(); ctx.roundRect(px + 1, py + 5, PW - 2, 7, 4); ctx.fill();
      // Rider torso
      ctx.fillStyle = "oklch(0.55 0.14 200)";
      ctx.beginPath(); ctx.roundRect(px + 5, py + 1, PW - 10, 9, 3); ctx.fill();
      // Helmet
      ctx.fillStyle = "oklch(0.58 0.22 25)";
      ctx.beginPath(); ctx.arc(px + PW / 2, py + 3, 6, 0, Math.PI * 2); ctx.fill();
      // Visor
      ctx.fillStyle = "oklch(0.78 0.15 55)";
      ctx.beginPath();
      ctx.arc(px + PW / 2, py + 3, 4.5, Math.PI * 0.15, Math.PI * 0.85);
      ctx.fill();
      ctx.restore();
      // Pizza box on carrier
      if (hasPRef.current) {
        ctx.fillStyle = "oklch(0.82 0.18 55)";
        ctx.beginPath(); ctx.roundRect(px + PW - 2, py + 1, 13, 10, 2); ctx.fill();
        ctx.fillStyle = "rgba(0,0,0,0.28)";
        ctx.beginPath(); ctx.roundRect(px + PW - 2, py + 1, 13, 2, [2, 2, 0, 0]); ctx.fill();
        ctx.font = "7px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("🍕", px + PW + 4.5, py + 9);
        ctx.textAlign = "left";
      }
      // Wheels
      ctx.fillStyle = "oklch(0.20 0.02 255)";
      ctx.beginPath(); ctx.ellipse(px + 5,      py + PH + 1, 4, 2.5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(px + PW - 5, py + PH + 1, 4, 2.5, 0, 0, Math.PI * 2); ctx.fill();
      // Wheel shine
      ctx.fillStyle = "rgba(255,255,255,0.28)";
      ctx.beginPath(); ctx.ellipse(px + 5,      py + PH, 2, 1.2, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(px + PW - 5, py + PH, 2, 1.2, 0, 0, Math.PI * 2); ctx.fill();
    }
  }, []);

  // ─── Game Loop ────────────────────────────────────────────────────────────
  const loop = useCallback(() => {
    if (statusRef.current !== "playing") return;

    pulseRef.current = (pulseRef.current + 1) % 180;

    // Move player
    const k = keysRef.current;
    let px = pxRef.current;
    let py = pyRef.current;
    if (k["ArrowLeft"]  || k["a"] || k["A"]) px -= SPEED;
    if (k["ArrowRight"] || k["d"] || k["D"]) px += SPEED;
    if (k["ArrowUp"]    || k["w"] || k["W"]) py -= SPEED;
    if (k["ArrowDown"]  || k["s"] || k["S"]) py += SPEED;
    px = Math.max(0, Math.min(W - PW, px));
    py = Math.max(0, Math.min(H - PH, py));
    pxRef.current = px;
    pyRef.current = py;

    // Move cars
    carsRef.current = carsRef.current.map((car) => {
      let nx = car.x + car.vx;
      if (car.vx > 0 && nx > W + 15)        nx = -CAR_W - 15;
      if (car.vx < 0 && nx < -CAR_W - 15)   nx = W + 15;
      return { ...car, x: nx };
    });

    // Pick up pizza
    if (!hasPRef.current && hits(px, py, PW, PH, REST.x, REST.y, REST.w, REST.h)) {
      hasPRef.current = true;
      setHasPizza(true);
    }

    // Deliver pizza
    if (hasPRef.current) {
      const h = HOUSES[targetRef.current];
      if (h && hits(px, py, PW, PH, h.x, h.y, h.w, h.h)) {
        hasPRef.current = false;
        setHasPizza(false);
        const now = Date.now();
        const dt = (now - lastDRef.current) / 1000;
        const newCombo =
          lastDRef.current > 0 && dt < 12 ? comboRef.current + 1 : 1;
        comboRef.current = newCombo;
        setCombo(newCombo);
        lastDRef.current = now;
        scoreRef.current += 100 * newCombo;
        setScore(scoreRef.current);
        randomTarget(targetRef.current);
      }
    }

    // Car collision
    if (invRef.current > 0) {
      invRef.current--;
    } else {
      for (const car of carsRef.current) {
        if (
          hits(
            px + 4, py + 7, PW - 8, PH - 9,
            car.x + 2, car.y + 2, CAR_W - 4, CAR_H - 4
          )
        ) {
          livesRef.current -= 1;
          setLives(livesRef.current);
          invRef.current = 120;
          hasPRef.current = false;
          setHasPizza(false);
          comboRef.current = 0;
          setCombo(0);
          if (livesRef.current <= 0) {
            if (scoreRef.current > highRef.current)
              highRef.current = scoreRef.current;
            setStatusB("dead");
            draw();
            return;
          }
          break;
        }
      }
    }

    draw();
    animRef.current = requestAnimationFrame(loop);
  }, [draw, randomTarget, setStatusB]);

  // ─── Start / Reset ────────────────────────────────────────────────────────
  const startGame = useCallback(() => {
    cancelAnimationFrame(animRef.current);
    clearInterval(tickRef.current);

    pxRef.current  = W / 2 - PW / 2;
    pyRef.current  = REST.y + REST.h + 22;
    hasPRef.current = false;            setHasPizza(false);
    livesRef.current = INITIAL_LIVES;   setLives(INITIAL_LIVES);
    scoreRef.current = 0;               setScore(0);
    timerRef.current = GAME_TIME;       setTimeLeft(GAME_TIME);
    comboRef.current = 0;               setCombo(0);
    lastDRef.current = 0;
    invRef.current   = 0;
    pulseRef.current = 0;
    carsRef.current  = makeCars();

    const first = HOUSES[Math.floor(Math.random() * HOUSES.length)];
    targetRef.current = first.id;
    setTarget(first.id);

    setStatusB("playing");

    tickRef.current = setInterval(() => {
      timerRef.current -= 1;
      setTimeLeft(timerRef.current);
      if (timerRef.current <= 0) {
        clearInterval(tickRef.current);
        if (scoreRef.current > highRef.current)
          highRef.current = scoreRef.current;
        setStatusB("timesup");
      }
    }, 1000);
  }, [setStatusB]);

  // ─── Effects ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const dn = (e) => {
      keysRef.current[e.key] = true;
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key))
        e.preventDefault();
    };
    const up = (e) => { keysRef.current[e.key] = false; };
    window.addEventListener("keydown", dn);
    window.addEventListener("keyup",   up);
    return () => {
      window.removeEventListener("keydown", dn);
      window.removeEventListener("keyup",   up);
    };
  }, []);

  useEffect(() => {
    if (status === "playing") animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [status, loop]);

  useEffect(() => () => clearInterval(tickRef.current), []);
  useEffect(() => { draw(); }, [draw]);

  // ─── Render ───────────────────────────────────────────────────────────────
  const hearts = Array.from({ length: INITIAL_LIVES }, (_, i) => ({
    key: `h${i}`,
    e: i < lives ? "❤️" : "🖤",
  }));

  const tClr =
    timeLeft <= 15
      ? "text-red-400 animate-pulse"
      : timeLeft <= 30
      ? "text-yellow-400"
      : "text-emerald-400";

  const tHouseNum = (HOUSES.find((h) => h.id === target)?.id ?? 0) + 1;

  return (
    <div className="flex flex-col items-center gap-3">
      {/* HUD */}
      <div className="flex items-center justify-between w-full max-w-[480px] px-1">
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className="font-mono font-bold px-3 py-1.5 text-sm"
          >
            🍕 {score}
          </Badge>
          <Badge
            variant="outline"
            className="font-mono font-bold px-3 py-1.5 text-sm"
          >
            🏆 {Math.max(score, highRef.current)}
          </Badge>
          {combo > 1 && (
            <Badge className="font-mono font-bold px-2 py-1 text-xs bg-amber-400 text-black animate-bounce">
              ×{combo} COMBO!
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className={`font-mono font-bold text-sm ${tClr}`}>
            ⏱ {timeLeft}s
          </span>
          <div className="flex gap-0.5 text-base leading-none">
            {hearts.map((h) => (
              <span key={h.key}>{h.e}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Mission strip */}
      {status === "playing" && (
        <div className="w-full max-w-[480px] px-1">
          <span
            className={`text-xs font-mono ${
              hasPizza ? "text-emerald-400" : "text-amber-400"
            }`}
          >
            {hasPizza
              ? `🛵  Deliver to House #${tHouseNum}!`
              : "📦  Go to Vortelli's to pick up your pizza!"}
          </span>
        </div>
      )}

      {/* Canvas */}
      <div className="relative rounded-2xl overflow-hidden border border-border select-none shadow-2xl">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="block max-w-full"
        />

        {/* Idle overlay */}
        {status === "idle" && (
          <div className="absolute inset-0 bg-black/55 backdrop-blur-sm flex flex-col items-center justify-center gap-5">
            <div className="text-center space-y-1">
              <div className="text-6xl mb-1">🍕</div>
              <p className="font-bold text-3xl text-white tracking-tight">
                Vortelli's Pizza
              </p>
              <p className="font-bold text-xl text-amber-300 tracking-widest">
                DELIVERY
              </p>
              <p className="text-white/60 text-sm mt-3 max-w-[260px] leading-snug">
                Race through the city! Pick up pizzas &amp; deliver to the
                glowing house before time runs out.
              </p>
            </div>
            <Button
              onClick={startGame}
              size="lg"
              className="rounded-full px-10 font-bold text-base"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Delivering!
            </Button>
            <div className="text-white/50 text-xs text-center space-y-0.5">
              <p>Arrow keys or WASD to move</p>
              <p>Combo bonus for back-to-back deliveries 🔥</p>
            </div>
          </div>
        )}

        {/* Dead / Time's Up overlay */}
        {(status === "dead" || status === "timesup") && (
          <div className="absolute inset-0 bg-black/55 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
            <div className="text-center space-y-1">
              <div className="text-5xl">
                {status === "dead" ? "💥" : "⏰"}
              </div>
              <p className="font-bold text-2xl text-white">
                {status === "dead" ? "Delivery Wrecked!" : "Time's Up!"}
              </p>
              <p className="text-white/80 text-xl font-mono font-bold">
                Score: {score}
              </p>
              {score > 0 && score >= highRef.current && (
                <p className="text-amber-300 text-sm font-bold mt-1">
                  🏆 New High Score!
                </p>
              )}
            </div>
            <Button
              onClick={startGame}
              className="rounded-full px-8 font-bold"
            >
              <Play className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        )}
      </div>

      {/* Mobile D-pad */}
      <div className="sm:hidden flex flex-col items-center gap-1 mt-1">
        <Button
          variant="outline"
          size="icon"
          className="w-12 h-12 rounded-full text-xl"
          onTouchStart={() => { keysRef.current["ArrowUp"] = true; }}
          onTouchEnd={()   => { keysRef.current["ArrowUp"] = false; }}
        >
          ↑
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            className="w-12 h-12 rounded-full text-xl"
            onTouchStart={() => { keysRef.current["ArrowLeft"] = true; }}
            onTouchEnd={()   => { keysRef.current["ArrowLeft"] = false; }}
          >
            ←
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="w-12 h-12 rounded-full text-xl"
            onTouchStart={() => { keysRef.current["ArrowDown"] = true; }}
            onTouchEnd={()   => { keysRef.current["ArrowDown"] = false; }}
          >
            ↓
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="w-12 h-12 rounded-full text-xl"
            onTouchStart={() => { keysRef.current["ArrowRight"] = true; }}
            onTouchEnd={()   => { keysRef.current["ArrowRight"] = false; }}
          >
            →
          </Button>
        </div>
      </div>
    </div>
  );
}
