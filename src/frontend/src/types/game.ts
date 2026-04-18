export type GameCategory = "Action" | "Puzzle" | "Strategy" | "Adventure";

export interface GameMeta {
  id: string;
  title: string;
  description: string;
  category: GameCategory;
  tags: string[];
  color: string; // CSS gradient string
  emoji: string;
  implemented: boolean;
}
