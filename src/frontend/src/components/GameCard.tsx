import { Link } from "@tanstack/react-router";
import { Lock, Play } from "lucide-react";
import { motion } from "motion/react";
import type { GameMeta } from "../types/game";
import { CategoryBadge } from "./CategoryBadge";

interface GameCardProps {
  game: GameMeta;
  index?: number;
}

export function GameCard({ game, index = 0 }: GameCardProps) {
  const cardContent = (
    <motion.div
      data-ocid={`game.item.${index + 1}`}
      className="group relative bg-card rounded-2xl overflow-hidden border border-border cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: (index % 8) * 0.05 }}
      whileHover={{
        y: -4,
        boxShadow: "0 16px 40px oklch(0.65 0.25 345 / 0.25)",
      }}
    >
      {/* Thumbnail */}
      <div
        className="relative h-36 flex items-center justify-center overflow-hidden"
        style={{ background: game.color }}
      >
        <span
          className="text-6xl select-none filter drop-shadow-lg transition-transform duration-300 group-hover:scale-110"
          role="img"
          aria-label={game.title}
        >
          {game.emoji}
        </span>

        {/* Category badge overlay */}
        <div className="absolute bottom-2 left-2">
          <CategoryBadge category={game.category} />
        </div>

        {/* Coming soon overlay */}
        {!game.implemented && (
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-[2px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-1">
              <Lock className="w-6 h-6 text-card" />
              <span className="text-card text-xs font-display font-bold">
                Coming Soon
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-3">
        <h3 className="font-display font-bold text-foreground text-sm leading-tight mb-1 truncate">
          {game.title}
        </h3>
        <p className="text-muted-foreground text-xs line-clamp-2 leading-relaxed mb-3">
          {game.description}
        </p>

        {game.implemented ? (
          <div className="flex items-center gap-1.5 text-xs font-display font-bold text-primary group-hover:gap-2.5 transition-all duration-200">
            <Play className="w-3.5 h-3.5 fill-current" />
            Play Now
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs font-display font-medium text-muted-foreground">
            <Lock className="w-3.5 h-3.5" />
            Coming Soon
          </div>
        )}
      </div>

      {/* Hover glow border */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          boxShadow: `inset 0 0 0 2px ${game.implemented ? "oklch(0.65 0.25 345 / 0.5)" : "oklch(0.5 0 0 / 0.2)"}`,
        }}
      />
    </motion.div>
  );

  if (!game.implemented) {
    return cardContent;
  }

  return (
    <Link to="/play/$gameId" params={{ gameId: game.id }}>
      {cardContent}
    </Link>
  );
}
