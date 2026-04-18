import type { GameCategory } from "../types/game";

interface CategoryBadgeProps {
  category: GameCategory;
  size?: "sm" | "md";
}

const categoryStyles: Record<GameCategory, string> = {
  Action: "badge-hot-pink",
  Puzzle: "badge-lime",
  Strategy: "badge-electric",
  Adventure: "badge-purple",
};

export function CategoryBadge({ category, size = "sm" }: CategoryBadgeProps) {
  const sizeClasses =
    size === "sm" ? "text-[10px] px-2 py-0.5" : "text-xs px-3 py-1";

  return (
    <span
      className={`${categoryStyles[category]} ${sizeClasses} rounded-full font-display font-bold uppercase tracking-wider inline-block`}
    >
      {category}
    </span>
  );
}
