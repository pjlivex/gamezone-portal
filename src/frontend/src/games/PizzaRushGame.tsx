import React, { useEffect, useMemo, useRef, useState } from 'react';

type Vec2 = { x: number; y: number };
type Building = { x: number; y: number; w: number; h: number; color: string };
type Delivery = { id: number; pos: Vec2; deadline: number; reward: number; pizzas: number; active: boolean };
type Coin = { id: number; pos: Vec2; taken: boolean };
type BoostPad = { id: number; x: number; y: number; w: number; h: number };
type JumpRamp = { id: number; x: number; y: number; w: number; h: number; dir: 'h' | 'v' };
type Garage = { x: number; y: number };
type Car = { x: number; y: number; angle: number; speed: number; damage: number; airtime: number; boost: number };
type Input = { up: boolean; down: boolean; left: boolean; right: boolean; drift: boolean };
type UpgradeState = { speed: number; handling: number; durability: number; boost: number };

const WORLD_W = 3600;
const WORLD_H = 2400;
const CELL = 240;
const ROAD = 64;
const BLOCK = CELL - ROAD;
const SHOP = { x: 260, y: 240 };
const PICKUP_RADIUS = 76;
const DELIVERY_RADIUS = 56;
const GARAGES: Garage[] = [{ x: 1760, y: 1200 }, { x: 3080, y: 620 }, { x: 850, y: 1960 }];

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
const dist = (a: Vec2, b: Vec2) => Math.hypot(a.x - b.x, a.y - b.y);
const rand = (min: number, max: number) => Math.random() * (max - min) + min;

const laneXs = Array.from({ length: Math.floor(WORLD_W / CELL) + 1 }, (_, i) => i * CELL + ROAD / 2);
const laneYs = Array.from({ length: Math.floor(WORLD_H / CELL) + 1 }, (_, i) => i * CELL + ROAD / 2);

function createBuildings(): Building[] {
  const colors = ['#d8c29d', '#e3c49b', '#b9d4ea', '#d6c0df', '#bfd7b5', '#d8a88c'];
  const list: Building[] = [];
  for (let gy = 0; gy < WORLD_H; gy += CELL) {
    for (let gx = 0; gx < WORLD_W; gx += CELL) {
      if (gx === 0 || gy === 0) continue;
      list.push({
        x: gx + ROAD / 2 + 12,
        y: gy + ROAD / 2 + 12,
        w: BLOCK - 24,
        h: BLOCK - 24,
        color: colors[(gx / CELL + gy / CELL) % colors.length],
      });
    }
  }
  return list;
}

function createCoins(): Coin[] {
  const coins: Coin[] = [];
  let id = 1;
  laneXs.forEach((x) => {
    laneYs.forEach((y) => {
      if ((x + y) % 480 === 0 || Math.random() > 0.34) return;
      coins.push({ id: id++, pos: { x, y }, taken: false });
    });
  });
  return coins;
}

function createBoostPads(): BoostPad[] {
  return [
    { id: 1, x: 710, y: 273, w: 110, h: 24 },
    { id: 2, x: 1690, y: 753, w: 24, h: 110 },
    { id: 3, x: 2410, y: 1713, w: 110, h: 24 },
    { id: 4, x: 3130, y: 993, w: 24, h: 110 },
    { id: 5, x: 1210, y: 1953, w: 110, h: 24 },
  ];
}

function createRamps(): JumpRamp[] {
  return [
    { id: 1, x: 1160, y: 512, w: 84, h: 36, dir: 'h' },
    { id: 2, x: 2080, y: 1232, w: 36, h: 84, dir: 'v' },
    { id: 3, x: 2840, y: 1712, w: 84, h: 36, dir: 'h' },
  ];
}

function chooseLanePoint(farFrom?: Vec2): Vec2 {
  let p = { x: laneXs[Math.floor(rand(0, laneXs.length))], y: laneYs[Math.floor(rand(0, laneYs.length))] };
  while ((farFrom && dist(p, farFrom) < 700) || dist(p, SHOP) < 360) {
    p = { x: laneXs[Math.floor(rand(0, laneXs.length))], y: laneYs[Math.floor(rand(0, laneYs.length))] };
  }
  return p;
}

function makeDelivery(id: number, level: number): Delivery {
  const pizzas = clamp(1 + Math.floor(level / 2), 1, 5);
  return {
    id,
    pos: chooseLanePoint(),
    deadline: 34 + Math.max(0, 20 - level * 1.5),
    reward: 90 + level * 25 + Math.floor(rand(0, 60)),
    pizzas,
    active: true,
  };
}

function nextDeliveries(level: number): Delivery[] {
  const count = clamp(2 + Math.floor(level / 2), 2, 5);
  return Array.from({ length: count }, (_, i) => makeDelivery(level * 10 + i + 1, level));
}

function fmtTime(n: number) {
  const s = Math.max(0, Math.floor(n));
  return `${Math.floor(s / 60)}:${`${s % 60}`.padStart(2, '0')}`;
}

export default function VortellisInspiredFullGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const viewRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<Input>({ up: false, down: false, left: false, right: false, drift: false });
  const lastRef = useRef(0);
  const buildingsRef = useRef<Building[]>(createBuildings());
  const coinsRef = useRef<Coin[]>(createCoins());
  const boostsRef = useRef<BoostPad[]>(createBoostPads());
  const rampsRef = useRef<JumpRamp[]>(createRamps());
  const carRef = useRef<Car>({ x: SHOP.x + 120, y: SHOP.y + 30, angle: 0, speed: 0, damage: 0, airtime: 0, boost: 100 });
  const pizzasRef = useRef(0);
  const moneyRef = useRef(0);
  const scoreRef = useRef(0);
  const skillCoinsRef = useRef(0);
  const shiftTimeRef = useRef(180);
  const deliveriesRef = useRef<Delivery[]>(nextDeliveries(1));
  const levelRef = useRef(1);
  const gameOverRef = useRef(false);
  const upgradesRef = useRef<UpgradeState>({ speed: 0, handling: 0, durability: 0, boost: 0 });
  const [started, setStarted] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [hud, setHud] = useState({
    money: 0,
    skillCoins: 0,
    pizzas: 0,
    score: 0,
    damage: 0,
    boost: 100,
    level: 1,
    time: 180,
    message: 'Pick up pizzas at the shop',
    objective: 'Drive, drift, boost, jump, earn, upgrade',
  });

  const palette = useMemo(() => ({
    bg: '#efe4cf', grass: '#96c36f', road: '#363a42', lane: '#ffd35d', curb: '#aab1bf',
    text: '#231d16', panel: 'rgba(255,250,242,0.9)', player: '#f97316', shop: '#cf3f33',
  }), []);

  const syncHud = (message?: string, objective?: string) => {
    setHud({
      money: moneyRef.current,
      skillCoins: skillCoinsRef.current,
      pizzas: pizzasRef.current,
      score: scoreRef.current,
      damage: Math.round(carRef.current.damage),
      boost: Math.round(carRef.current.boost),
      level: levelRef.current,
      time: Math.ceil(shiftTimeRef.current),
      message: message ?? hud.message,
      objective: objective ?? hud.objective,
    });
  };

  const reset = () => {
    carRef.current = { x: SHOP.x + 120, y: SHOP.y + 30, angle: 0, speed: 0, damage: 0, airtime: 0, boost: 100 };
    pizzasRef.current = 0;
    moneyRef.current = 0;
    scoreRef.current = 0;
    skillCoinsRef.current = 0;
    shiftTimeRef.current = 180;
    deliveriesRef.current = nextDeliveries(1);
    levelRef.current = 1;
    gameOverRef.current = false;
    lastRef.current = 0;
    upgradesRef.current = { speed: 0, handling: 0, durability: 0, boost: 0 };
    coinsRef.current = createCoins();
    syncHud('Fresh shift started', 'Collect pizzas, deliver fast, spend earnings at garages');
    setStarted(true);
    setRefresh((v) => v + 1);
  };

  const activeDeliveries = () => deliveriesRef.current.filter((d) => d.active);

  const refillOrdersIfNeeded = () => {
    if (activeDeliveries().length === 0) {
      levelRef.current += 1;
      deliveriesRef.current = nextDeliveries(levelRef.current);
      syncHud(`Rush hour level ${levelRef.current}`, 'More orders spawn and stacks get larger as levels rise');
    }
  };

  const pickUpOrDeliver = () => {
    const car = carRef.current;
    if (dist(car, SHOP) < PICKUP_RADIUS) {
      const needed = activeDeliveries().reduce((sum, d) => sum + d.pizzas, 0);
      pizzasRef.current = Math.max(pizzasRef.current, needed);
      syncHud(`Loaded ${pizzasRef.current} pizzas`, 'Blue markers are customers; press Space when close');
      return;
    }
    for (const garage of GARAGES) {
      if (dist(car, garage) < 90) {
        if (moneyRef.current >= 60 && car.damage > 0) {
          moneyRef.current -= 60;
          car.damage = Math.max(0, car.damage - 45 - upgradesRef.current.durability * 8);
          syncHud('Car repaired at garage (-$60)', 'Use garages to fix crash damage and buy upgrades below');
        } else {
          syncHud('Need $60 and some damage to repair', 'Keep delivering or collect skill coins');
        }
        return;
      }
    }
    const target = deliveriesRef.current.find((d) => d.active && dist(car, d.pos) < DELIVERY_RADIUS);
    if (target && pizzasRef.current >= target.pizzas) {
      const timeBonus = Math.max(0, Math.round(target.deadline * 5));
      const cleanBonus = Math.max(0, 80 - Math.round(car.damage));
      const earned = target.reward + timeBonus + cleanBonus;
      moneyRef.current += earned;
      scoreRef.current += earned;
      skillCoinsRef.current += 4 + target.pizzas;
      pizzasRef.current -= target.pizzas;
      target.active = false;
      syncHud(`Delivered ${target.pizzas} pizzas +$${earned}`, pizzasRef.current ? 'Keep the chain going' : 'Return to Vortelli\'s to restock');
      refillOrdersIfNeeded();
    }
  };

  const buyUpgrade = (key: keyof UpgradeState) => {
    const tier = upgradesRef.current[key];
    const cost = 120 + tier * 100;
    if (skillCoinsRef.current < cost || tier >= 5) return;
    skillCoinsRef.current -= cost;
    upgradesRef.current[key] += 1;
    syncHud(`${key} upgraded to tier ${upgradesRef.current[key]}`, 'Faster car, tighter handling, more durability, bigger boost');
    setRefresh((v) => v + 1);
  };

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Shift'].includes(e.key)) e.preventDefault();
      const k = e.key.toLowerCase();
      if (k === 'w' || e.key === 'ArrowUp') inputRef.current.up = true;
      if (k === 's' || e.key === 'ArrowDown') inputRef.current.down = true;
      if (k === 'a' || e.key === 'ArrowLeft') inputRef.current.left = true;
      if (k === 'd' || e.key === 'ArrowRight') inputRef.current.right = true;
      if (e.key === 'Shift') inputRef.current.drift = true;
      if (e.key === ' ' && started && !gameOverRef.current) pickUpOrDeliver();
      if (k === 'r') reset();
    };
    const onUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'w' || e.key === 'ArrowUp') inputRef.current.up = false;
      if (k === 's' || e.key === 'ArrowDown') inputRef.current.down = false;
      if (k === 'a' || e.key === 'ArrowLeft') inputRef.current.left = false;
      if (k === 'd' || e.key === 'ArrowRight') inputRef.current.right = false;
      if (e.key === 'Shift') inputRef.current.drift = false;
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, [started]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const view = viewRef.current;
    if (!canvas || !view || !started) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      canvas.width = view.clientWidth * ratio;
      canvas.height = view.clientHeight * ratio;
      canvas.style.width = `${view.clientWidth}px`;
      canvas.style.height = `${view.clientHeight}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const loop = (t: number) => {
      if (!lastRef.current) lastRef.current = t;
      const dt = Math.min(0.032, (t - lastRef.current) / 1000);
      lastRef.current = t;
      const car = carRef.current;
      const input = inputRef.current;
      const upgrades = upgradesRef.current;

      const accel = 220 + upgrades.speed * 28;
      const maxSpeed = 260 + upgrades.speed * 35;
      const reverse = -120;
      const handling = 1.4 + upgrades.handling * 0.18;
      const driftTurn = 2.35 + upgrades.handling * 0.22;
      const durability = 1 + upgrades.durability * 0.15;
      const maxBoost = 100 + upgrades.boost * 25;

      if (input.up) car.speed += accel * dt;
      else if (input.down) car.speed -= 180 * dt;
      else car.speed *= input.drift ? 0.992 : 0.975;

      if (input.drift && input.up && car.boost > 0) {
        car.speed += (120 + upgrades.boost * 24) * dt;
        car.boost = Math.max(0, car.boost - 24 * dt);
      } else {
        car.boost = Math.min(maxBoost, car.boost + 11 * dt);
      }

      car.speed = clamp(car.speed, reverse, maxSpeed);
      if (Math.abs(car.speed) < 1) car.speed = 0;

      const steerScale = clamp(Math.abs(car.speed) / 90, 0.25, 2.2);
      if (input.left) car.angle -= (input.drift ? driftTurn : handling) * dt * steerScale * (car.speed >= 0 ? 1 : -1);
      if (input.right) car.angle += (input.drift ? driftTurn : handling) * dt * steerScale * (car.speed >= 0 ? 1 : -1);

      const prev = { x: car.x, y: car.y };
      car.x += Math.cos(car.angle) * car.speed * dt;
      car.y += Math.sin(car.angle) * car.speed * dt;
      car.x = clamp(car.x, 30, WORLD_W - 30);
      car.y = clamp(car.y, 30, WORLD_H - 30);

      for (const ramp of rampsRef.current) {
        const hit = car.x > ramp.x && car.x < ramp.x + ramp.w && car.y > ramp.y && car.y < ramp.y + ramp.h;
        if (hit && car.airtime <= 0) {
          car.airtime = 0.65;
          car.speed += 36;
          skillCoinsRef.current += 18;
          scoreRef.current += 35;
        }
      }
      if (car.airtime > 0) car.airtime -= dt;

      for (const pad of boostsRef.current) {
        const hit = car.x > pad.x && car.x < pad.x + pad.w && car.y > pad.y && car.y < pad.y + pad.h;
        if (hit) {
          car.speed += 220 * dt;
          skillCoinsRef.current += 0.25;
        }
      }

      for (const c of coinsRef.current) {
        if (!c.taken && dist(car, c.pos) < 28) {
          c.taken = true;
          skillCoinsRef.current += 10;
          scoreRef.current += 10;
        }
      }

      if (input.drift && Math.abs(car.speed) > 120) {
        skillCoinsRef.current += 7 * dt;
        scoreRef.current += 8 * dt;
      }
      if (Math.abs(car.speed) > 210) {
        skillCoinsRef.current += 4 * dt;
      }

      for (const b of buildingsRef.current) {
        const hit = car.x > b.x - 16 && car.x < b.x + b.w + 16 && car.y > b.y - 16 && car.y < b.y + b.h + 16;
        if (hit) {
          car.x = prev.x;
          car.y = prev.y;
          car.speed *= -0.26;
          car.damage = clamp(car.damage + 8 / durability, 0, 100);
          scoreRef.current = Math.max(0, scoreRef.current - 20);
          break;
        }
      }

      deliveriesRef.current.forEach((d) => {
        if (d.active) d.deadline -= dt;
        if (d.active && d.deadline <= 0) {
          d.active = false;
          scoreRef.current = Math.max(0, scoreRef.current - 55);
        }
      });
      refillOrdersIfNeeded();

      shiftTimeRef.current -= dt;
      if (car.damage >= 100 || shiftTimeRef.current <= 0) {
        shiftTimeRef.current = Math.max(0, shiftTimeRef.current);
        gameOverRef.current = true;
      }

      const camX = clamp(car.x - view.clientWidth / 2, 0, WORLD_W - view.clientWidth);
      const camY = clamp(car.y - view.clientHeight / 2, 0, WORLD_H - view.clientHeight);

      ctx.clearRect(0, 0, view.clientWidth, view.clientHeight);
      ctx.fillStyle = palette.bg;
      ctx.fillRect(0, 0, view.clientWidth, view.clientHeight);
      ctx.save();
      ctx.translate(-camX, -camY);

      ctx.fillStyle = palette.grass;
      ctx.fillRect(0, 0, WORLD_W, WORLD_H);

      for (let x = 0; x <= WORLD_W; x += CELL) {
        ctx.fillStyle = palette.road;
        ctx.fillRect(x, 0, ROAD, WORLD_H);
        ctx.fillStyle = palette.curb;
        ctx.fillRect(x + 28, 0, 8, WORLD_H);
        ctx.fillRect(x + 48, 0, 8, WORLD_H);
        ctx.fillStyle = palette.lane;
        for (let y = 0; y < WORLD_H; y += 48) ctx.fillRect(x + 30, y + 14, 4, 20);
      }
      for (let y = 0; y <= WORLD_H; y += CELL) {
        ctx.fillStyle = palette.road;
        ctx.fillRect(0, y, WORLD_W, ROAD);
        ctx.fillStyle = palette.curb;
        ctx.fillRect(0, y + 28, WORLD_W, 8);
        ctx.fillRect(0, y + 48, WORLD_W, 8);
        ctx.fillStyle = palette.lane;
        for (let x = 0; x < WORLD_W; x += 48) ctx.fillRect(x + 14, y + 30, 20, 4);
      }

      buildingsRef.current.forEach((b) => {
        ctx.fillStyle = b.color;
        ctx.fillRect(b.x, b.y, b.w, b.h);
        ctx.fillStyle = 'rgba(0,0,0,0.08)';
        ctx.fillRect(b.x + 10, b.y + 10, b.w - 20, 16);
        ctx.fillStyle = 'rgba(255,255,255,0.28)';
        for (let yy = 0; yy < 4; yy++) for (let xx = 0; xx < 4; xx++) ctx.fillRect(b.x + 18 + xx * 36, b.y + 42 + yy * 28, 16, 12);
      });

      boostsRef.current.forEach((p) => {
        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.fillStyle = '#e0fbff';
        for (let i = 0; i < 4; i++) {
          if (p.w > p.h) ctx.fillRect(p.x + 10 + i * 22, p.y + 8, 12, 8);
          else ctx.fillRect(p.x + 8, p.y + 10 + i * 22, 8, 12);
        }
      });

      rampsRef.current.forEach((r) => {
        ctx.fillStyle = '#8b5a2b';
        ctx.fillRect(r.x, r.y, r.w, r.h);
        ctx.fillStyle = '#deb887';
        if (r.dir === 'h') {
          for (let i = 0; i < 5; i++) ctx.fillRect(r.x + i * 16, r.y + 4 + i * 2, 10, r.h - 8 - i * 4);
        } else {
          for (let i = 0; i < 5; i++) ctx.fillRect(r.x + 4 + i * 2, r.y + i * 16, r.w - 8 - i * 4, 10);
        }
      });

      GARAGES.forEach((g) => {
        ctx.fillStyle = '#4f46e5';
        ctx.fillRect(g.x - 38, g.y - 38, 76, 76);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px system-ui';
        ctx.fillText('FIX', g.x - 14, g.y + 4);
      });

      ctx.fillStyle = palette.shop;
      ctx.fillRect(SHOP.x - 48, SHOP.y - 48, 96, 96);
      ctx.fillStyle = '#fff6e8';
      ctx.font = 'bold 16px system-ui';
      ctx.fillText('PIZZA', SHOP.x - 30, SHOP.y + 5);

      coinsRef.current.forEach((c) => {
        if (c.taken) return;
        ctx.beginPath();
        ctx.fillStyle = '#facc15';
        ctx.arc(c.pos.x, c.pos.y, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#7c5d0f';
        ctx.stroke();
      });

      deliveriesRef.current.forEach((d) => {
        if (!d.active) return;
        ctx.beginPath();
        ctx.fillStyle = d.deadline < 9 ? '#ef4444' : '#2563eb';
        ctx.arc(d.pos.x, d.pos.y, 24, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px system-ui';
        ctx.fillText(`${d.pizzas}`, d.pos.x - 4, d.pos.y + 4);
      });

      const target = deliveriesRef.current.find((d) => d.active);
      if (target && pizzasRef.current > 0) {
        ctx.strokeStyle = 'rgba(37,99,235,0.4)';
        ctx.lineWidth = 4;
        ctx.setLineDash([14, 10]);
        ctx.beginPath();
        ctx.moveTo(car.x, car.y);
        ctx.lineTo(target.pos.x, target.pos.y);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      ctx.save();
      ctx.translate(car.x, car.y - (car.airtime > 0 ? 10 : 0));
      ctx.rotate(car.angle);
      ctx.fillStyle = palette.player;
      ctx.fillRect(-18, -12, 36, 24);
      ctx.fillStyle = '#2d2218';
      ctx.fillRect(-9, -8, 18, 16);
      ctx.fillStyle = '#111827';
      ctx.fillRect(-14, -15, 10, 4);
      ctx.fillRect(4, -15, 10, 4);
      ctx.fillRect(-14, 11, 10, 4);
      ctx.fillRect(4, 11, 10, 4);
      if (input.drift && Math.abs(car.speed) > 70) {
        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        ctx.fillRect(-24, 10, 8, 4);
        ctx.fillRect(16, 10, 8, 4);
      }
      ctx.restore();

      ctx.restore();

      syncHud(
        gameOverRef.current ? 'Shift ended — restart to run again' : dist(car, SHOP) < PICKUP_RADIUS ? 'Press Space to restock pizzas' : 'Hit Space near customers or garages',
        gameOverRef.current ? 'Damage maxed or timer ran out' : 'R to restart • Shift while accelerating to drift and burn boost'
      );

      if (!gameOverRef.current) requestAnimationFrame(loop);
      else setRefresh((v) => v + 1);
    };

    requestAnimationFrame(loop);
    return () => window.removeEventListener('resize', resize);
  }, [started, refresh, palette]);

  const minimap = (() => {
    const car = carRef.current;
    const scaleX = 200 / WORLD_W;
    const scaleY = 140 / WORLD_H;
    return {
      car: { x: car.x * scaleX, y: car.y * scaleY },
      shop: { x: SHOP.x * scaleX, y: SHOP.y * scaleY },
      garages: GARAGES.map((g) => ({ x: g.x * scaleX, y: g.y * scaleY })),
      deliveries: deliveriesRef.current.filter((d) => d.active).map((d) => ({ x: d.pos.x * scaleX, y: d.pos.y * scaleY })),
    };
  })();

  const upgradeCost = (tier: number) => 120 + tier * 100;

  return (
    <div style={styles.page}>
      <div style={styles.topBar}>
        <div>
          <h1 style={styles.title}>Pizza Rush City</h1>
          <p style={styles.subtitle}>A full-featured original TSX game inspired by the same style of open-world pizza delivery: timed runs, drifting, jumps, boosts, coins, garages, upgrades, and escalating order waves.</p>
        </div>
        <div style={styles.actionsRow}>
          <button style={styles.primaryBtn} onClick={() => (started ? reset() : reset())}>{started ? 'Restart shift' : 'Start game'}</button>
        </div>
      </div>

      <div style={styles.layout}>
        <aside style={styles.sidePanel}>
          <Stat label="Time" value={fmtTime(hud.time)} />
          <Stat label="Money" value={`$${hud.money}`} />
          <Stat label="Skill coins" value={`${Math.floor(hud.skillCoins)}`} />
          <Stat label="Pizzas" value={`${hud.pizzas}`} />
          <Stat label="Level" value={`${hud.level}`} />
          <Stat label="Score" value={`${Math.floor(hud.score)}`} />
          <Stat label="Damage" value={`${hud.damage}%`} warning={hud.damage > 65} />
          <Stat label="Boost" value={`${hud.boost}%`} />

          <div style={styles.panelBox}>
            <strong>Controls</strong>
            <span>WASD / Arrows = drive</span>
            <span>Shift = drift + burn boost</span>
            <span>Space = pickup / deliver / repair</span>
            <span>R = restart</span>
          </div>

          <div style={styles.panelBox}>
            <strong>Objective</strong>
            <span>Red building is the pizza shop.</span>
            <span>Blue dots are customers with pizza counts.</span>
            <span>Cyan pads boost, brown ramps jump, gold coins pay out.</span>
            <span>Purple garages repair the car.</span>
          </div>

          <div style={styles.panelBox}>
            <strong>Garage upgrades</strong>
            <UpgradeRow name="Speed" tier={upgradesRef.current.speed} cost={upgradeCost(upgradesRef.current.speed)} onBuy={() => buyUpgrade('speed')} />
            <UpgradeRow name="Handling" tier={upgradesRef.current.handling} cost={upgradeCost(upgradesRef.current.handling)} onBuy={() => buyUpgrade('handling')} />
            <UpgradeRow name="Durability" tier={upgradesRef.current.durability} cost={upgradeCost(upgradesRef.current.durability)} onBuy={() => buyUpgrade('durability')} />
            <UpgradeRow name="Boost" tier={upgradesRef.current.boost} cost={upgradeCost(upgradesRef.current.boost)} onBuy={() => buyUpgrade('boost')} />
          </div>
        </aside>

        <main style={styles.mainPanel}>
          <div style={styles.messageBar}>
            <span>{hud.message}</span>
            <span>{hud.objective}</span>
          </div>
          <div ref={viewRef} style={styles.gameView}>
            {!started && (
              <div style={styles.overlay}>
                <div style={styles.overlayCard}>
                  <h2 style={styles.overlayTitle}>Start your shift</h2>
                  <p style={styles.overlayText}>This is a full original game inspired by the public style and mechanics people describe for Vortelli&apos;s Pizza Delivery, including open-world driving, drifting, boosts, jumps, skill coins, and progression.</p>
                  <button style={styles.primaryBtn} onClick={reset}>Play now</button>
                </div>
              </div>
            )}
            {started && gameOverRef.current && (
              <div style={styles.overlay}>
                <div style={styles.overlayCard}>
                  <h2 style={styles.overlayTitle}>Shift complete</h2>
                  <p style={styles.overlayText}>You earned ${hud.money}, collected {Math.floor(hud.skillCoins)} skill coins, reached level {hud.level}, and scored {Math.floor(hud.score)}.</p>
                  <button style={styles.primaryBtn} onClick={reset}>Run again</button>
                </div>
              </div>
            )}
            <canvas ref={canvasRef} style={styles.canvas} />
            <div style={styles.miniMap}>
              <svg width="200" height="140" viewBox="0 0 200 140" style={{ display: 'block' }}>
                <rect x="0" y="0" width="200" height="140" rx="14" fill="rgba(255,255,255,0.75)" />
                {minimap.garages.map((g, i) => <rect key={i} x={g.x - 3} y={g.y - 3} width="6" height="6" fill="#4f46e5" />)}
                {minimap.deliveries.map((d, i) => <circle key={i} cx={d.x} cy={d.y} r="4" fill="#2563eb" />)}
                <rect x={minimap.shop.x - 4} y={minimap.shop.y - 4} width="8" height="8" fill="#cf3f33" />
                <circle cx={minimap.car.x} cy={minimap.car.y} r="4" fill="#f97316" />
              </svg>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function Stat({ label, value, warning }: { label: string; value: string; warning?: boolean }) {
  return <div style={{ ...styles.stat, ...(warning ? { background: 'rgba(254,226,226,0.92)' } : {}) }}><span style={styles.statLabel}>{label}</span><strong style={styles.statValue}>{value}</strong></div>;
}

function UpgradeRow({ name, tier, cost, onBuy }: { name: string; tier: number; cost: number; onBuy: () => void }) {
  return (
    <div style={styles.upgradeRow}>
      <div>
        <div style={{ fontWeight: 700 }}>{name}</div>
        <div style={{ color: '#6a5b4a', fontSize: 13 }}>Tier {tier}/5</div>
      </div>
      <button style={styles.smallBtn} onClick={onBuy}>{tier >= 5 ? 'Max' : `${cost}`}</button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: 'linear-gradient(180deg,#f4e8d4 0%,#e9d8bf 100%)', color: '#231d16', fontFamily: 'Inter, system-ui, sans-serif', padding: 20 },
  topBar: { display: 'flex', justifyContent: 'space-between', gap: 18, alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: 18 },
  title: { margin: 0, fontSize: 'clamp(2rem,4vw,3.5rem)', lineHeight: 1.02 },
  subtitle: { margin: '8px 0 0', maxWidth: 980, color: '#6b5d4d', lineHeight: 1.5 },
  actionsRow: { display: 'flex', gap: 12 },
  primaryBtn: { border: 0, background: '#cf3f33', color: '#fff', padding: '14px 20px', borderRadius: 16, fontWeight: 800, cursor: 'pointer', boxShadow: '0 14px 34px rgba(207,63,51,0.26)' },
  smallBtn: { border: 0, background: '#231d16', color: '#fff', padding: '8px 12px', borderRadius: 12, fontWeight: 700, cursor: 'pointer' },
  layout: { display: 'grid', gridTemplateColumns: '320px 1fr', gap: 18 },
  sidePanel: { display: 'flex', flexDirection: 'column', gap: 12 },
  mainPanel: { display: 'flex', flexDirection: 'column', gap: 12 },
  stat: { background: 'rgba(255,250,242,0.84)', border: '1px solid rgba(35,29,22,0.08)', borderRadius: 18, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  statLabel: { fontSize: 12, letterSpacing: 0.7, textTransform: 'uppercase', color: '#6b5d4d' },
  statValue: { fontSize: 22 },
  panelBox: { background: 'rgba(255,250,242,0.76)', border: '1px solid rgba(35,29,22,0.08)', borderRadius: 18, padding: 14, display: 'grid', gap: 6, color: '#5b4e40' },
  upgradeRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.6)', borderRadius: 14, padding: 10, marginTop: 8 },
  messageBar: { background: 'rgba(255,250,242,0.84)', border: '1px solid rgba(35,29,22,0.08)', borderRadius: 18, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', fontWeight: 700 },
  gameView: { position: 'relative', minHeight: 760, borderRadius: 28, overflow: 'hidden', border: '1px solid rgba(35,29,22,0.12)', boxShadow: '0 24px 70px rgba(35,29,22,0.18)', background: '#96c36f' },
  canvas: { width: '100%', height: '100%', display: 'block' },
  miniMap: { position: 'absolute', right: 16, bottom: 16, zIndex: 2, borderRadius: 18, overflow: 'hidden', border: '1px solid rgba(35,29,22,0.08)', boxShadow: '0 8px 18px rgba(35,29,22,0.12)' },
  overlay: { position: 'absolute', inset: 0, zIndex: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(35,29,22,0.38)', padding: 20 },
  overlayCard: { maxWidth: 600, textAlign: 'center', background: 'rgba(255,248,239,0.94)', borderRadius: 26, padding: 28, border: '1px solid rgba(35,29,22,0.08)' },
  overlayTitle: { margin: '0 0 10px', fontSize: 34, lineHeight: 1.05 },
  overlayText: { margin: '0 0 18px', color: '#6a5b4a', lineHeight: 1.55 },
};
