import type { GameMeta } from "../types/game";

export const GAMES: GameMeta[] = [
  {
    id: "snake",
    title: "Snake",
    description: "Classic snake game — eat, grow, and don't hit the walls!",
    category: "Action",
    tags: ["classic", "arcade", "fast-paced"],
    color:
      "linear-gradient(135deg, oklch(0.70 0.25 145), oklch(0.55 0.22 170))",
    emoji: "🐍",
    implemented: true,
  },
  {
    id: "game2048",
    title: "2048",
    description: "Slide tiles and merge numbers to reach the legendary 2048!",
    category: "Puzzle",
    tags: ["numbers", "strategy", "relaxing"],
    color: "linear-gradient(135deg, oklch(0.75 0.20 90), oklch(0.65 0.22 65))",
    emoji: "🧩",
    implemented: true,
  },
  {
    id: "memory",
    title: "Memory Match",
    description: "Flip cards and match pairs — test your memory skills!",
    category: "Puzzle",
    tags: ["memory", "matching", "brain"],
    color:
      "linear-gradient(135deg, oklch(0.60 0.28 255), oklch(0.50 0.24 280))",
    emoji: "🃏",
    implemented: true,
  },
  {
    id: "flappy",
    title: "Flappy Bird",
    description: "Tap to flap through the pipes — how far can you go?",
    category: "Action",
    tags: ["tap", "endless", "challenging"],
    color:
      "linear-gradient(135deg, oklch(0.65 0.25 345), oklch(0.55 0.22 320))",
    emoji: "🐦",
    implemented: true,
  },
  {
    id: "tictactoe",
    title: "Tic-Tac-Toe",
    description: "Challenge the AI in the timeless game of Xs and Os!",
    category: "Strategy",
    tags: ["two-player", "classic", "AI"],
    color:
      "linear-gradient(135deg, oklch(0.68 0.22 290), oklch(0.58 0.25 310))",
    emoji: "⭕",
    implemented: true,
  },
  {
    id: "breakout",
    title: "Breakout",
    description: "Smash bricks with a bouncing ball — clear the board!",
    category: "Action",
    tags: ["arcade", "bouncing", "classic"],
    color: "linear-gradient(135deg, oklch(0.65 0.26 20), oklch(0.60 0.24 345))",
    emoji: "🧱",
    implemented: false,
  },
  {
    id: "whackamole",
    title: "Whack-a-Mole",
    description: "Whack those sneaky moles before they disappear — go fast!",
    category: "Action",
    tags: ["reflex", "speed", "fun"],
    color: "linear-gradient(135deg, oklch(0.70 0.24 60), oklch(0.65 0.22 80))",
    emoji: "🔨",
    implemented: false,
  },
  {
    id: "tetris",
    title: "Tetris",
    description: "Drop and arrange blocks to clear lines and score big!",
    category: "Puzzle",
    tags: ["blocks", "classic", "fast"],
    color:
      "linear-gradient(135deg, oklch(0.60 0.28 205), oklch(0.55 0.25 235))",
    emoji: "🟦",
    implemented: false,
  },
  {
    id: "sudoku",
    title: "Sudoku",
    description: "Fill in the grid using numbers 1-9 — no repeats allowed!",
    category: "Puzzle",
    tags: ["logic", "numbers", "relaxing"],
    color:
      "linear-gradient(135deg, oklch(0.72 0.20 145), oklch(0.60 0.22 175))",
    emoji: "🔢",
    implemented: false,
  },
  {
    id: "maze",
    title: "Maze",
    description: "Navigate the labyrinth and find your way to the exit!",
    category: "Adventure",
    tags: ["navigation", "exploration", "puzzle"],
    color:
      "linear-gradient(135deg, oklch(0.62 0.24 310), oklch(0.55 0.26 280))",
    emoji: "🌀",
    implemented: false,
  },
];

export function getGameById(id: string): GameMeta | undefined {
  return GAMES.find((g) => g.id === id);
}
