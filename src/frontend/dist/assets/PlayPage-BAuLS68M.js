import { r as reactExports, j as jsxRuntimeExports, c as cn, a as useParams, L as Link } from "./index-Ds2o10Gm.js";
import { c as createLucideIcon, M as MotionConfigContext, i as isHTMLElement, u as useConstant, d as PresenceContext, e as usePresence, f as useIsomorphicLayoutEffect, g as LayoutGroupContext, h as Slot, j as cva, B as Button, P as Play, m as motion, k as getGameById, L as Layout, C as CategoryBadge, b as Lock } from "./games-Bbm2lcuG.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["path", { d: "m12 19-7-7 7-7", key: "1l729n" }],
  ["path", { d: "M19 12H5", key: "x3x0zl" }]
];
const ArrowLeft = createLucideIcon("arrow-left", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8", key: "v9h5vc" }],
  ["path", { d: "M21 3v5h-5", key: "1q7to0" }],
  ["path", { d: "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16", key: "3uifl3" }],
  ["path", { d: "M8 16H3v5", key: "1cv678" }]
];
const RefreshCw = createLucideIcon("refresh-cw", __iconNode);
function setRef(ref, value) {
  if (typeof ref === "function") {
    return ref(value);
  } else if (ref !== null && ref !== void 0) {
    ref.current = value;
  }
}
function composeRefs(...refs) {
  return (node) => {
    let hasCleanup = false;
    const cleanups = refs.map((ref) => {
      const cleanup = setRef(ref, node);
      if (!hasCleanup && typeof cleanup === "function") {
        hasCleanup = true;
      }
      return cleanup;
    });
    if (hasCleanup) {
      return () => {
        for (let i = 0; i < cleanups.length; i++) {
          const cleanup = cleanups[i];
          if (typeof cleanup === "function") {
            cleanup();
          } else {
            setRef(refs[i], null);
          }
        }
      };
    }
  };
}
function useComposedRefs(...refs) {
  return reactExports.useCallback(composeRefs(...refs), refs);
}
class PopChildMeasure extends reactExports.Component {
  getSnapshotBeforeUpdate(prevProps) {
    const element = this.props.childRef.current;
    if (isHTMLElement(element) && prevProps.isPresent && !this.props.isPresent && this.props.pop !== false) {
      const parent = element.offsetParent;
      const parentWidth = isHTMLElement(parent) ? parent.offsetWidth || 0 : 0;
      const parentHeight = isHTMLElement(parent) ? parent.offsetHeight || 0 : 0;
      const computedStyle = getComputedStyle(element);
      const size = this.props.sizeRef.current;
      size.height = parseFloat(computedStyle.height);
      size.width = parseFloat(computedStyle.width);
      size.top = element.offsetTop;
      size.left = element.offsetLeft;
      size.right = parentWidth - size.width - size.left;
      size.bottom = parentHeight - size.height - size.top;
    }
    return null;
  }
  /**
   * Required with getSnapshotBeforeUpdate to stop React complaining.
   */
  componentDidUpdate() {
  }
  render() {
    return this.props.children;
  }
}
function PopChild({ children, isPresent, anchorX, anchorY, root, pop }) {
  var _a;
  const id = reactExports.useId();
  const ref = reactExports.useRef(null);
  const size = reactExports.useRef({
    width: 0,
    height: 0,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  });
  const { nonce } = reactExports.useContext(MotionConfigContext);
  const childRef = ((_a = children.props) == null ? void 0 : _a.ref) ?? (children == null ? void 0 : children.ref);
  const composedRef = useComposedRefs(ref, childRef);
  reactExports.useInsertionEffect(() => {
    const { width, height, top, left, right, bottom } = size.current;
    if (isPresent || pop === false || !ref.current || !width || !height)
      return;
    const x = anchorX === "left" ? `left: ${left}` : `right: ${right}`;
    const y = anchorY === "bottom" ? `bottom: ${bottom}` : `top: ${top}`;
    ref.current.dataset.motionPopId = id;
    const style = document.createElement("style");
    if (nonce)
      style.nonce = nonce;
    const parent = root ?? document.head;
    parent.appendChild(style);
    if (style.sheet) {
      style.sheet.insertRule(`
          [data-motion-pop-id="${id}"] {
            position: absolute !important;
            width: ${width}px !important;
            height: ${height}px !important;
            ${x}px !important;
            ${y}px !important;
          }
        `);
    }
    return () => {
      var _a2;
      (_a2 = ref.current) == null ? void 0 : _a2.removeAttribute("data-motion-pop-id");
      if (parent.contains(style)) {
        parent.removeChild(style);
      }
    };
  }, [isPresent]);
  return jsxRuntimeExports.jsx(PopChildMeasure, { isPresent, childRef: ref, sizeRef: size, pop, children: pop === false ? children : reactExports.cloneElement(children, { ref: composedRef }) });
}
const PresenceChild = ({ children, initial, isPresent, onExitComplete, custom, presenceAffectsLayout, mode, anchorX, anchorY, root }) => {
  const presenceChildren = useConstant(newChildrenMap);
  const id = reactExports.useId();
  let isReusedContext = true;
  let context = reactExports.useMemo(() => {
    isReusedContext = false;
    return {
      id,
      initial,
      isPresent,
      custom,
      onExitComplete: (childId) => {
        presenceChildren.set(childId, true);
        for (const isComplete of presenceChildren.values()) {
          if (!isComplete)
            return;
        }
        onExitComplete && onExitComplete();
      },
      register: (childId) => {
        presenceChildren.set(childId, false);
        return () => presenceChildren.delete(childId);
      }
    };
  }, [isPresent, presenceChildren, onExitComplete]);
  if (presenceAffectsLayout && isReusedContext) {
    context = { ...context };
  }
  reactExports.useMemo(() => {
    presenceChildren.forEach((_, key) => presenceChildren.set(key, false));
  }, [isPresent]);
  reactExports.useEffect(() => {
    !isPresent && !presenceChildren.size && onExitComplete && onExitComplete();
  }, [isPresent]);
  children = jsxRuntimeExports.jsx(PopChild, { pop: mode === "popLayout", isPresent, anchorX, anchorY, root, children });
  return jsxRuntimeExports.jsx(PresenceContext.Provider, { value: context, children });
};
function newChildrenMap() {
  return /* @__PURE__ */ new Map();
}
const getChildKey = (child) => child.key || "";
function onlyElements(children) {
  const filtered = [];
  reactExports.Children.forEach(children, (child) => {
    if (reactExports.isValidElement(child))
      filtered.push(child);
  });
  return filtered;
}
const AnimatePresence = ({ children, custom, initial = true, onExitComplete, presenceAffectsLayout = true, mode = "sync", propagate = false, anchorX = "left", anchorY = "top", root }) => {
  const [isParentPresent, safeToRemove] = usePresence(propagate);
  const presentChildren = reactExports.useMemo(() => onlyElements(children), [children]);
  const presentKeys = propagate && !isParentPresent ? [] : presentChildren.map(getChildKey);
  const isInitialRender = reactExports.useRef(true);
  const pendingPresentChildren = reactExports.useRef(presentChildren);
  const exitComplete = useConstant(() => /* @__PURE__ */ new Map());
  const exitingComponents = reactExports.useRef(/* @__PURE__ */ new Set());
  const [diffedChildren, setDiffedChildren] = reactExports.useState(presentChildren);
  const [renderedChildren, setRenderedChildren] = reactExports.useState(presentChildren);
  useIsomorphicLayoutEffect(() => {
    isInitialRender.current = false;
    pendingPresentChildren.current = presentChildren;
    for (let i = 0; i < renderedChildren.length; i++) {
      const key = getChildKey(renderedChildren[i]);
      if (!presentKeys.includes(key)) {
        if (exitComplete.get(key) !== true) {
          exitComplete.set(key, false);
        }
      } else {
        exitComplete.delete(key);
        exitingComponents.current.delete(key);
      }
    }
  }, [renderedChildren, presentKeys.length, presentKeys.join("-")]);
  const exitingChildren = [];
  if (presentChildren !== diffedChildren) {
    let nextChildren = [...presentChildren];
    for (let i = 0; i < renderedChildren.length; i++) {
      const child = renderedChildren[i];
      const key = getChildKey(child);
      if (!presentKeys.includes(key)) {
        nextChildren.splice(i, 0, child);
        exitingChildren.push(child);
      }
    }
    if (mode === "wait" && exitingChildren.length) {
      nextChildren = exitingChildren;
    }
    setRenderedChildren(onlyElements(nextChildren));
    setDiffedChildren(presentChildren);
    return null;
  }
  const { forceRender } = reactExports.useContext(LayoutGroupContext);
  return jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: renderedChildren.map((child) => {
    const key = getChildKey(child);
    const isPresent = propagate && !isParentPresent ? false : presentChildren === renderedChildren || presentKeys.includes(key);
    const onExit = () => {
      if (exitingComponents.current.has(key)) {
        return;
      }
      if (exitComplete.has(key)) {
        exitingComponents.current.add(key);
        exitComplete.set(key, true);
      } else {
        return;
      }
      let isEveryExitComplete = true;
      exitComplete.forEach((isExitComplete) => {
        if (!isExitComplete)
          isEveryExitComplete = false;
      });
      if (isEveryExitComplete) {
        forceRender == null ? void 0 : forceRender();
        setRenderedChildren(pendingPresentChildren.current);
        propagate && (safeToRemove == null ? void 0 : safeToRemove());
        onExitComplete && onExitComplete();
      }
    };
    return jsxRuntimeExports.jsx(PresenceChild, { isPresent, initial: !isInitialRender.current || initial ? void 0 : false, custom, presenceAffectsLayout, mode, root, onExitComplete: isPresent ? void 0 : onExit, anchorX, anchorY, children: child }, key);
  }) });
};
const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary: "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive: "border-transparent bg-destructive text-destructive-foreground [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline: "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
function Badge({
  className,
  variant,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "span";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Comp,
    {
      "data-slot": "badge",
      className: cn(badgeVariants({ variant }), className),
      ...props
    }
  );
}
const W = 360;
const H = 500;
const GRAVITY = 0.5;
const FLAP = -9;
const PIPE_WIDTH = 52;
const PIPE_GAP = 140;
const PIPE_SPEED = 2.5;
const BIRD_X = 80;
const BIRD_SIZE = 28;
function newPipe() {
  return {
    x: W,
    top: 60 + Math.random() * (H - PIPE_GAP - 120)
  };
}
function FlappyGame() {
  const canvasRef = reactExports.useRef(null);
  const birdYRef = reactExports.useRef(H / 2);
  const birdVelRef = reactExports.useRef(0);
  const pipesRef = reactExports.useRef([]);
  const scoreRef = reactExports.useRef(0);
  const animRef = reactExports.useRef(0);
  const frameRef = reactExports.useRef(0);
  const [score, setScore] = reactExports.useState(0);
  const [status, setStatus] = reactExports.useState("idle");
  const statusRef = reactExports.useRef("idle");
  const flap = reactExports.useCallback(() => {
    if (statusRef.current === "idle") {
      statusRef.current = "playing";
      setStatus("playing");
    }
    if (statusRef.current === "playing") {
      birdVelRef.current = FLAP;
    }
  }, []);
  const draw = reactExports.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, W, H);
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, "oklch(0.75 0.18 255)");
    sky.addColorStop(1, "oklch(0.88 0.12 210)");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "oklch(0.65 0.22 145)";
    ctx.fillRect(0, H - 40, W, 40);
    ctx.fillStyle = "oklch(0.55 0.22 145)";
    ctx.fillRect(0, H - 40, W, 8);
    for (const pipe of pipesRef.current) {
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
        [6, 6, 0, 0]
      );
      ctx.fill();
      const bottom = pipe.top + PIPE_GAP;
      ctx.fillStyle = "oklch(0.55 0.22 145)";
      ctx.beginPath();
      ctx.roundRect(
        pipe.x,
        bottom + 8,
        PIPE_WIDTH,
        H - bottom - 48,
        [8, 8, 0, 0]
      );
      ctx.fill();
      ctx.fillStyle = "oklch(0.60 0.22 145)";
      ctx.beginPath();
      ctx.roundRect(pipe.x - 4, bottom, PIPE_WIDTH + 8, 24, [0, 0, 6, 6]);
      ctx.fill();
    }
    const birdY = birdYRef.current;
    ctx.save();
    ctx.translate(BIRD_X, birdY);
    ctx.rotate(Math.min(Math.max(birdVelRef.current * 0.06, -0.5), 1));
    ctx.font = `${BIRD_SIZE * 1.4}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🐦", 0, 0);
    ctx.restore();
    ctx.fillStyle = "white";
    ctx.font = "bold 28px sans-serif";
    ctx.textAlign = "center";
    ctx.shadowColor = "rgba(0,0,0,0.3)";
    ctx.shadowBlur = 4;
    ctx.fillText(String(scoreRef.current), W / 2, 40);
    ctx.shadowBlur = 0;
  }, []);
  const gameLoop = reactExports.useCallback(() => {
    if (statusRef.current !== "playing") return;
    frameRef.current++;
    birdVelRef.current += GRAVITY;
    birdYRef.current += birdVelRef.current;
    if (frameRef.current % 90 === 0) {
      pipesRef.current.push(newPipe());
    }
    pipesRef.current = pipesRef.current.map((p) => ({ ...p, x: p.x - PIPE_SPEED })).filter((p) => p.x > -PIPE_WIDTH - 10);
    for (const p of pipesRef.current) {
      if (Math.floor(p.x + PIPE_SPEED) === BIRD_X && p.x < BIRD_X) {
        scoreRef.current++;
        setScore(scoreRef.current);
      }
    }
    const bY = birdYRef.current;
    if (bY + BIRD_SIZE / 2 > H - 40 || bY - BIRD_SIZE / 2 < 0) {
      statusRef.current = "dead";
      setStatus("dead");
      draw();
      return;
    }
    for (const p of pipesRef.current) {
      if (BIRD_X + BIRD_SIZE / 2 - 4 > p.x && BIRD_X - BIRD_SIZE / 2 + 4 < p.x + PIPE_WIDTH && (bY - BIRD_SIZE / 2 + 4 < p.top || bY + BIRD_SIZE / 2 - 4 > p.top + PIPE_GAP)) {
        statusRef.current = "dead";
        setStatus("dead");
        draw();
        return;
      }
    }
    draw();
    animRef.current = requestAnimationFrame(gameLoop);
  }, [draw]);
  const startGame = reactExports.useCallback(() => {
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
  reactExports.useEffect(() => {
    draw();
    const onKey = (e) => {
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
  reactExports.useEffect(() => {
    if (status === "playing") {
      animRef.current = requestAnimationFrame(gameLoop);
    }
    return () => cancelAnimationFrame(animRef.current);
  }, [status, gameLoop]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 w-full justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", className: "font-display font-bold px-4 py-2", children: [
        "Score: ",
        score
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground text-xs hidden sm:block", children: "Space or tap to flap" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        type: "button",
        className: "relative rounded-2xl overflow-hidden shadow-play border border-border cursor-pointer select-none p-0 bg-transparent",
        onClick: flap,
        onKeyDown: (e) => {
          if (e.code === "Space") flap();
        },
        "data-ocid": "flappy.canvas_target",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "canvas",
            {
              ref: canvasRef,
              width: W,
              height: H,
              className: "block max-w-full"
            }
          ),
          (status === "idle" || status === "dead") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-0 bg-foreground/40 backdrop-blur-sm flex flex-col items-center justify-center gap-4", children: [
            status === "dead" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display font-extrabold text-2xl text-card", children: "Game Over!" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-card/80 text-sm", children: [
                "Score: ",
                score
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                onClick: (e) => {
                  e.stopPropagation();
                  startGame();
                },
                "data-ocid": "flappy.start_button",
                className: "rounded-full px-8 font-display font-bold shadow-play",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "w-4 h-4 mr-2" }),
                  status === "dead" ? "Play Again" : "Start"
                ]
              }
            ),
            status === "idle" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-card/70 text-sm font-display", children: "Tap or press Space to flap!" })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button,
      {
        variant: "outline",
        size: "sm",
        onClick: flap,
        className: "sm:hidden rounded-full font-display font-bold px-8 h-12 text-base",
        "data-ocid": "flappy.flap_button",
        children: "🐦 Flap!"
      }
    )
  ] });
}
function createBoard() {
  const b = Array.from({ length: 4 }, () => [0, 0, 0, 0]);
  return addTile(addTile(b));
}
function addTile(board) {
  const empty = [];
  board.forEach(
    (row, r2) => row.forEach((v, c2) => {
      if (!v) empty.push([r2, c2]);
    })
  );
  if (!empty.length) return board;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  const nb = board.map((row) => [...row]);
  nb[r][c] = Math.random() < 0.9 ? 2 : 4;
  return nb;
}
function slide(row) {
  const filtered = row.filter(Boolean);
  let score = 0;
  const merged = [];
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
function moveLeft(board) {
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
function rotate90(board) {
  return board[0].map((_, i) => board.map((row) => row[i]).reverse());
}
function move(board, dir) {
  const rotations = { left: 0, down: 1, right: 2, up: 3 };
  let b = board;
  const r = rotations[dir];
  for (let i = 0; i < r; i++) b = rotate90(b);
  const result = moveLeft(b);
  let nb = result.board;
  for (let i = 0; i < (4 - r) % 4; i++) nb = rotate90(nb);
  return { board: nb, score: result.score, moved: result.moved };
}
function isGameOver(board) {
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (!board[r][c]) return false;
      if (c < 3 && board[r][c] === board[r][c + 1]) return false;
      if (r < 3 && board[r][c] === board[r + 1][c]) return false;
    }
  }
  return true;
}
const TILE_COLORS = {
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
  2048: "bg-secondary text-secondary-foreground"
};
function getTileClass(val) {
  return TILE_COLORS[val] ?? "bg-foreground text-background";
}
function Game2048() {
  const [board, setBoard] = reactExports.useState(createBoard);
  const [score, setScore] = reactExports.useState(0);
  const [best, setBest] = reactExports.useState(0);
  const [gameOver, setGameOver] = reactExports.useState(false);
  const [won, setWon] = reactExports.useState(false);
  const handleMove = reactExports.useCallback(
    (dir) => {
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
    [gameOver, won]
  );
  const reset = () => {
    setBoard(createBoard());
    setScore(0);
    setGameOver(false);
    setWon(false);
  };
  reactExports.useEffect(() => {
    const handler = (e) => {
      const map = {
        ArrowLeft: "left",
        ArrowRight: "right",
        ArrowUp: "up",
        ArrowDown: "down"
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
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 w-full justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Badge,
          {
            variant: "secondary",
            className: "font-display font-bold px-4 py-2",
            children: [
              "Score: ",
              score
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "font-display font-bold px-4 py-2", children: [
          "Best: ",
          best
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          size: "sm",
          variant: "outline",
          onClick: reset,
          className: "rounded-full font-display",
          "data-ocid": "game2048.restart_button",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-3.5 h-3.5 mr-1" }),
            " New Game"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "relative bg-muted p-3 rounded-2xl shadow-play",
        "data-ocid": "game2048.canvas_target",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-4 gap-2", children: board.flat().map((val, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              className: `w-16 h-16 sm:w-20 sm:h-20 rounded-xl flex items-center justify-center font-display font-extrabold text-base sm:text-xl ${getTileClass(val)}`,
              initial: val !== 0 ? { scale: 0.8 } : void 0,
              animate: { scale: 1 },
              transition: { duration: 0.1 },
              children: val !== 0 ? val : ""
            },
            `tile-${Math.floor(idx / 4)}-${idx % 4}`
          )) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: (gameOver || won) && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.div,
            {
              className: "absolute inset-0 rounded-2xl bg-foreground/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3",
              initial: { opacity: 0 },
              animate: { opacity: 1 },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display font-extrabold text-2xl text-card", children: won ? "🎉 You Win!" : "Game Over!" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-card/80 text-sm", children: [
                  "Score: ",
                  score
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    onClick: reset,
                    "data-ocid": "game2048.play_again_button",
                    className: "rounded-full px-8 font-display font-bold",
                    children: "Play Again"
                  }
                )
              ]
            }
          ) })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-2", children: ["left", "up", "right", "empty1", "down", "empty2"].map(
      (d, _i) => {
        if (d === "empty1" || d === "empty2") return /* @__PURE__ */ jsxRuntimeExports.jsx("div", {}, d);
        const validDir = d;
        const arrows = {
          left: "←",
          right: "→",
          up: "↑",
          down: "↓"
        };
        const colClass = d === "up" || d === "down" ? "col-start-2" : "";
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "outline",
            size: "sm",
            className: `w-12 h-12 rounded-xl font-display font-bold text-lg ${colClass}`,
            onClick: () => handleMove(validDir),
            children: arrows[d]
          },
          d
        );
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-xs", children: "Arrow keys to move" })
  ] });
}
const EMOJIS = ["🎸", "🌈", "🦄", "🍕", "🚀", "🎮", "🌺", "🦋"];
const CARDS = [...EMOJIS, ...EMOJIS];
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function initCards() {
  return shuffle(CARDS).map((emoji, id) => ({
    id,
    emoji,
    flipped: false,
    matched: false
  }));
}
function MemoryGame() {
  const [cards, setCards] = reactExports.useState(initCards);
  const [selected, setSelected] = reactExports.useState([]);
  const [moves, setMoves] = reactExports.useState(0);
  const [locked, setLocked] = reactExports.useState(false);
  const [won, setWon] = reactExports.useState(false);
  const reset = () => {
    setCards(initCards());
    setSelected([]);
    setMoves(0);
    setLocked(false);
    setWon(false);
  };
  const handleFlip = reactExports.useCallback(
    (id) => {
      if (locked) return;
      const card = cards[id];
      if (card.flipped || card.matched || selected.includes(id)) return;
      const newSelected = [...selected, id];
      setCards(
        (prev) => prev.map((c) => c.id === id ? { ...c, flipped: true } : c)
      );
      setSelected(newSelected);
      if (newSelected.length === 2) {
        setMoves((m) => m + 1);
        setLocked(true);
        const [a, b] = newSelected.map((i) => cards[i]);
        if (a.emoji === b.emoji) {
          setTimeout(() => {
            setCards((prev) => {
              const updated = prev.map(
                (c) => newSelected.includes(c.id) ? { ...c, matched: true } : c
              );
              if (updated.every((c) => c.matched)) setWon(true);
              return updated;
            });
            setSelected([]);
            setLocked(false);
          }, 400);
        } else {
          setTimeout(() => {
            setCards(
              (prev) => prev.map(
                (c) => newSelected.includes(c.id) ? { ...c, flipped: false } : c
              )
            );
            setSelected([]);
            setLocked(false);
          }, 900);
        }
      }
    },
    [cards, selected, locked]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 w-full justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Badge,
          {
            variant: "secondary",
            className: "font-display font-bold px-4 py-2",
            children: [
              "Moves: ",
              moves
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "font-display font-bold px-4 py-2", children: [
          "Pairs: ",
          cards.filter((c) => c.matched).length / 2,
          "/",
          EMOJIS.length
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          size: "sm",
          variant: "outline",
          onClick: reset,
          className: "rounded-full font-display",
          "data-ocid": "memory.restart_button",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-3.5 h-3.5 mr-1" }),
            " Reset"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "relative grid grid-cols-4 gap-3 p-4 bg-muted rounded-2xl shadow-play",
        "data-ocid": "memory.canvas_target",
        children: [
          cards.map((card) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.button,
            {
              "data-ocid": `memory.card.${card.id + 1}`,
              onClick: () => handleFlip(card.id),
              className: `w-16 h-16 sm:w-20 sm:h-20 rounded-xl flex items-center justify-center text-3xl font-bold cursor-pointer transition-smooth border-2 ${card.matched ? "bg-chart-3/30 border-chart-3/50 opacity-60" : card.flipped ? "bg-card border-primary shadow-play" : "bg-accent/20 border-accent/30 hover:bg-accent/40"}`,
              whileHover: !card.flipped && !card.matched ? { scale: 1.08 } : {},
              whileTap: { scale: 0.95 },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { mode: "wait", children: card.flipped || card.matched ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                motion.span,
                {
                  initial: { rotateY: 90 },
                  animate: { rotateY: 0 },
                  exit: { rotateY: 90 },
                  transition: { duration: 0.15 },
                  children: card.emoji
                },
                "face"
              ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
                motion.span,
                {
                  className: "text-accent font-display font-extrabold text-xl",
                  children: "?"
                },
                "back"
              ) })
            },
            card.id
          )),
          /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: won && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.div,
            {
              className: "absolute inset-0 rounded-2xl bg-foreground/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3",
              initial: { opacity: 0 },
              animate: { opacity: 1 },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display font-extrabold text-2xl text-card", children: "🎉 You Win!" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-card/80 text-sm", children: [
                  "Completed in ",
                  moves,
                  " moves"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    onClick: reset,
                    "data-ocid": "memory.play_again_button",
                    className: "rounded-full px-8 font-display font-bold",
                    children: "Play Again"
                  }
                )
              ]
            }
          ) })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-xs", children: "Flip cards to find matching pairs" })
  ] });
}
const CELL = 20;
const COLS = 20;
const ROWS = 20;
const INITIAL_SPEED = 150;
const DIRS = {
  ArrowUp: { dx: 0, dy: -1 },
  ArrowDown: { dx: 0, dy: 1 },
  ArrowLeft: { dx: -1, dy: 0 },
  ArrowRight: { dx: 1, dy: 0 },
  w: { dx: 0, dy: -1 },
  s: { dx: 0, dy: 1 },
  a: { dx: -1, dy: 0 },
  d: { dx: 1, dy: 0 }
};
function randFood(snake) {
  let p;
  do {
    p = {
      x: Math.floor(Math.random() * COLS),
      y: Math.floor(Math.random() * ROWS)
    };
  } while (snake.some((s) => s.x === p.x && s.y === p.y));
  return p;
}
function SnakeGame() {
  const canvasRef = reactExports.useRef(null);
  const snakeRef = reactExports.useRef([{ x: 10, y: 10 }]);
  const dirRef = reactExports.useRef({ dx: 1, dy: 0 });
  const nextDirRef = reactExports.useRef({ dx: 1, dy: 0 });
  const foodRef = reactExports.useRef(randFood(snakeRef.current));
  const [score, setScore] = reactExports.useState(0);
  const [status, setStatus] = reactExports.useState("idle");
  const animRef = reactExports.useRef(0);
  const lastTickRef = reactExports.useRef(0);
  const draw = reactExports.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
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
    const food = foodRef.current;
    ctx.fillStyle = "oklch(0.65 0.25 345)";
    ctx.beginPath();
    ctx.arc(
      food.x * CELL + CELL / 2,
      food.y * CELL + CELL / 2,
      CELL / 2 - 2,
      0,
      Math.PI * 2
    );
    ctx.fill();
    snakeRef.current.forEach((seg, i) => {
      const isHead = i === 0;
      ctx.fillStyle = isHead ? "oklch(0.50 0.25 145)" : "oklch(0.65 0.22 145)";
      ctx.beginPath();
      ctx.roundRect(
        seg.x * CELL + 1,
        seg.y * CELL + 1,
        CELL - 2,
        CELL - 2,
        isHead ? 6 : 4
      );
      ctx.fill();
    });
  }, []);
  const tick = reactExports.useCallback(
    (ts) => {
      if (ts - lastTickRef.current < INITIAL_SPEED) {
        animRef.current = requestAnimationFrame(tick);
        return;
      }
      lastTickRef.current = ts;
      dirRef.current = nextDirRef.current;
      const head = snakeRef.current[0];
      const newHead = {
        x: head.x + dirRef.current.dx,
        y: head.y + dirRef.current.dy
      };
      const hitWall = newHead.x < 0 || newHead.x >= COLS || newHead.y < 0 || newHead.y >= ROWS;
      const hitSelf = snakeRef.current.some(
        (s) => s.x === newHead.x && s.y === newHead.y
      );
      if (hitWall || hitSelf) {
        setStatus("dead");
        return;
      }
      const atFood = newHead.x === foodRef.current.x && newHead.y === foodRef.current.y;
      const newSnake = atFood ? [newHead, ...snakeRef.current] : [newHead, ...snakeRef.current.slice(0, -1)];
      snakeRef.current = newSnake;
      if (atFood) {
        foodRef.current = randFood(newSnake);
        setScore((s) => s + 10);
      }
      draw();
      animRef.current = requestAnimationFrame(tick);
    },
    [draw]
  );
  const startGame = reactExports.useCallback(() => {
    snakeRef.current = [{ x: 10, y: 10 }];
    dirRef.current = { dx: 1, dy: 0 };
    nextDirRef.current = { dx: 1, dy: 0 };
    foodRef.current = randFood(snakeRef.current);
    setScore(0);
    setStatus("playing");
    lastTickRef.current = 0;
  }, []);
  reactExports.useEffect(() => {
    if (status === "playing") {
      animRef.current = requestAnimationFrame(tick);
    }
    return () => cancelAnimationFrame(animRef.current);
  }, [status, tick]);
  reactExports.useEffect(() => {
    if (status !== "playing") return;
    const onKey = (e) => {
      const d = DIRS[e.key];
      if (!d) return;
      const cur = dirRef.current;
      if (d.dx !== -cur.dx || d.dy !== -cur.dy) nextDirRef.current = d;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [status]);
  reactExports.useEffect(() => {
    draw();
  }, [draw]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 w-full justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Badge,
        {
          variant: "secondary",
          className: "font-display font-bold text-base px-4 py-2",
          children: [
            "Score: ",
            score
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground text-xs font-body hidden sm:block", children: "Arrow keys or WASD to move" }),
      status !== "idle" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          size: "sm",
          variant: "outline",
          onClick: startGame,
          className: "rounded-full font-display",
          "data-ocid": "snake.restart_button",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-3.5 h-3.5 mr-1" }),
            " Restart"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative rounded-2xl overflow-hidden shadow-play border border-border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "canvas",
        {
          ref: canvasRef,
          width: COLS * CELL,
          height: ROWS * CELL,
          "data-ocid": "snake.canvas_target",
          className: "block"
        }
      ),
      status !== "playing" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-0 bg-foreground/50 backdrop-blur-sm flex flex-col items-center justify-center gap-4", children: [
        status === "dead" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-card text-center mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display font-extrabold text-2xl", children: "Game Over!" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-card/80 text-sm", children: [
            "Final Score: ",
            score
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            onClick: startGame,
            "data-ocid": "snake.start_button",
            className: "rounded-full px-8 font-display font-bold shadow-play",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "w-4 h-4 mr-2" }),
              status === "dead" ? "Play Again" : "Start Game"
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-2 sm:hidden", children: [
      { label: "←", key: "ArrowLeft", pos: "" },
      { label: "↑", key: "ArrowUp", pos: "col-start-2" },
      { label: "→", key: "ArrowRight", pos: "" },
      { label: "", key: "empty1", pos: "" },
      { label: "↓", key: "ArrowDown", pos: "col-start-2" },
      { label: "", key: "empty2", pos: "" }
    ].map(
      ({ label, key, pos }) => label ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "outline",
          size: "sm",
          className: `w-12 h-12 rounded-xl font-display font-bold text-lg ${pos}`,
          onPointerDown: () => {
            const d = DIRS[key];
            if (!d) return;
            const cur = dirRef.current;
            if (d.dx !== -cur.dx || d.dy !== -cur.dy)
              nextDirRef.current = d;
          },
          children: label
        },
        key
      ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", {}, key)
    ) })
  ] });
}
const POSITIONS = [0, 1, 2, 3, 4, 5, 6, 7, 8];
const WINNING_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];
function checkWinner(board) {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line };
    }
  }
  return { winner: null, line: null };
}
function minimax(board, isMax) {
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
function getBestMove(board) {
  let best = Number.NEGATIVE_INFINITY;
  let move2 = -1;
  board.forEach((cell, i) => {
    if (!cell) {
      const nb = [...board];
      nb[i] = "O";
      const score = minimax(nb, false);
      if (score > best) {
        best = score;
        move2 = i;
      }
    }
  });
  return move2;
}
function TicTacToeGame() {
  const [board, setBoard] = reactExports.useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = reactExports.useState(true);
  const [scores, setScores] = reactExports.useState({ X: 0, O: 0, draw: 0 });
  const [highlight, setHighlight] = reactExports.useState(null);
  const [result, setResult] = reactExports.useState(null);
  const reset = reactExports.useCallback((keepScores = true) => {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
    setHighlight(null);
    setResult(null);
    if (!keepScores) setScores({ X: 0, O: 0, draw: 0 });
  }, []);
  const handleClick = reactExports.useCallback(
    (idx) => {
      if (board[idx] || result || !xIsNext) return;
      const newBoard = [...board];
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
    [board, result, xIsNext]
  );
  const statusText = result ? result === "draw" ? "It's a draw!" : result === "X" ? "You win! 🎉" : "AI wins! 🤖" : xIsNext ? "Your turn (X)" : "AI thinking…";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Badge,
        {
          variant: "secondary",
          className: "font-display font-bold px-4 py-2 text-base",
          style: {
            background: "oklch(0.65 0.25 345 / 0.15)",
            color: "oklch(0.55 0.25 345)"
          },
          children: [
            "You (X): ",
            scores.X
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "font-display font-bold px-3 py-2", children: [
        "Draw: ",
        scores.draw
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Badge,
        {
          variant: "secondary",
          className: "font-display font-bold px-4 py-2 text-base",
          style: {
            background: "oklch(0.60 0.28 255 / 0.15)",
            color: "oklch(0.50 0.28 255)"
          },
          children: [
            "AI (O): ",
            scores.O
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display font-bold text-lg text-foreground", children: statusText }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "grid grid-cols-3 gap-3 p-4 bg-muted rounded-2xl shadow-play",
        "data-ocid": "tictactoe.canvas_target",
        children: POSITIONS.map((pos) => {
          const cell = board[pos];
          const i = pos;
          return /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.button,
            {
              "data-ocid": `tictactoe.cell.${i + 1}`,
              onClick: () => handleClick(i),
              disabled: !!cell || !!result || !xIsNext,
              className: `w-24 h-24 rounded-xl font-display font-extrabold text-5xl flex items-center justify-center transition-smooth border-2 ${(highlight == null ? void 0 : highlight.includes(i)) ? "border-chart-3 bg-chart-3/20" : cell ? "border-border bg-card cursor-default" : "border-border bg-card hover:bg-accent/10 hover:border-accent cursor-pointer"}`,
              whileHover: !cell && !result && xIsNext ? { scale: 1.05 } : {},
              whileTap: { scale: 0.95 },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: cell && /* @__PURE__ */ jsxRuntimeExports.jsx(
                motion.span,
                {
                  initial: { scale: 0, rotate: -30 },
                  animate: { scale: 1, rotate: 0 },
                  transition: { type: "spring", stiffness: 300, damping: 18 },
                  style: {
                    color: cell === "X" ? "oklch(0.65 0.25 345)" : "oklch(0.60 0.28 255)"
                  },
                  children: cell
                }
              ) })
            },
            `ttt-${pos}`
          );
        })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          variant: "outline",
          size: "sm",
          onClick: () => reset(true),
          className: "rounded-full font-display",
          "data-ocid": "tictactoe.reset_button",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-3.5 h-3.5 mr-1" }),
            " New Round"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "ghost",
          size: "sm",
          onClick: () => reset(false),
          className: "rounded-full font-display text-muted-foreground",
          "data-ocid": "tictactoe.reset_scores_button",
          children: "Reset Scores"
        }
      )
    ] })
  ] });
}
const GAME_COMPONENTS = {
  snake: SnakeGame,
  game2048: Game2048,
  memory: MemoryGame,
  flappy: FlappyGame,
  tictactoe: TicTacToeGame
};
function PlayPage() {
  const { gameId } = useParams({ from: "/play/$gameId" });
  const game = getGameById(gameId);
  if (!game) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Layout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        "data-ocid": "play_page.not_found",
        className: "flex flex-col items-center justify-center py-32 gap-4",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-6xl", children: "❓" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display font-bold text-2xl text-foreground", children: "Game not found" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "outline", className: "rounded-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/games", search: { q: "" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "w-4 h-4 mr-2" }),
            " Back to Games"
          ] }) })
        ]
      }
    ) });
  }
  const GameComponent = GAME_COMPONENTS[game.id];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Layout, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-b border-border bg-card", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto px-4 py-3 flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          asChild: true,
          variant: "ghost",
          size: "sm",
          className: "rounded-full font-display font-semibold",
          "data-ocid": "play_page.back_button",
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/games", search: { q: "" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "w-4 h-4 mr-1.5" }),
            " Games"
          ] })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "/" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-display font-bold text-foreground text-sm", children: game.title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CategoryBadge, { category: game.category })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "max-w-7xl mx-auto px-4 py-8",
        "data-ocid": "play_page.game.section",
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-3 mb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-play",
                  style: { background: game.color },
                  children: game.emoji
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display font-extrabold text-3xl text-foreground", children: game.title })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm max-w-md", children: game.description })
          ] }),
          game.implemented && GameComponent ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              "data-ocid": "play_page.canvas_target",
              className: "w-full max-w-2xl",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(GameComponent, {})
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              "data-ocid": "play_page.coming_soon",
              className: "w-full max-w-2xl rounded-3xl overflow-hidden",
              style: { background: game.color },
              children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center gap-6 py-32 text-primary-foreground", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "w-12 h-12 opacity-80" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display font-extrabold text-3xl mb-2", children: "Coming Soon!" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-primary-foreground/80 text-base max-w-xs", children: "This game is under development and will be available very soon." })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    asChild: true,
                    variant: "secondary",
                    className: "rounded-full px-8 font-display font-bold",
                    "data-ocid": "play_page.browse_more_button",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/games", search: { q: "" }, children: "Browse Playable Games" })
                  }
                )
              ] })
            }
          )
        ] })
      }
    )
  ] });
}
export {
  PlayPage as default
};
