import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Gamepad2, Sparkles, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { CategoryBadge } from "../components/CategoryBadge";
import { GameCard } from "../components/GameCard";
import { Layout } from "../components/Layout";
import { GAMES } from "../data/games";
import type { GameCategory } from "../types/game";

const CATEGORIES: GameCategory[] = [
  "Action",
  "Puzzle",
  "Strategy",
  "Adventure",
];

const FEATURED_GAMES = GAMES.filter((g) => g.implemented);

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState<GameCategory | null>(
    null,
  );

  const displayedGames = activeCategory
    ? GAMES.filter((g) => g.category === activeCategory)
    : GAMES.slice(0, 8);

  return (
    <Layout>
      {/* Hero Section */}
      <section
        data-ocid="hero.section"
        className="relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.97 0.04 345) 0%, oklch(0.96 0.05 255) 50%, oklch(0.97 0.04 145) 100%)",
        }}
      >
        {/* Decorative blobs */}
        <div
          className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ background: "oklch(0.65 0.25 345)" }}
        />
        <div
          className="absolute -bottom-16 -right-16 w-80 h-80 rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ background: "oklch(0.60 0.28 255)" }}
        />

        <div className="max-w-7xl mx-auto px-4 py-16 md:py-20 flex flex-col md:flex-row items-center gap-10">
          {/* Text */}
          <motion.div
            className="flex-1 min-w-0"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="font-display font-bold text-sm text-primary uppercase tracking-widest">
                Free Browser Games
              </span>
            </div>
            <h1 className="font-display font-extrabold text-5xl md:text-6xl leading-none mb-5">
              <span className="text-gradient-primary">Play Amazing</span>
              <br />
              <span className="text-foreground">Games</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-md mb-8 leading-relaxed">
              Explore 10 awesome free games instantly. No downloads, no sign-up
              — just pure fun!
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                data-ocid="hero.play_button"
                className="rounded-full px-8 h-12 font-display font-bold text-base shadow-play hover:shadow-card-hover"
              >
                <Link to="/games" search={{ q: "" }}>
                  <Zap className="w-4 h-4 mr-2" />
                  Play Now
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                data-ocid="hero.browse_button"
                className="rounded-full px-8 h-12 font-display font-bold text-base"
              >
                <Link to="/games" search={{ q: "" }}>
                  Browse All Games
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Floating game icons */}
          <motion.div
            className="flex-shrink-0 grid grid-cols-3 gap-3"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            {FEATURED_GAMES.map((game, i) => (
              <motion.div
                key={game.id}
                animate={{ y: [0, -8, 0] }}
                transition={{
                  duration: 3,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: i * 0.4,
                  ease: "easeInOut",
                }}
              >
                <Link to="/play/$gameId" params={{ gameId: game.id }}>
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-play hover:shadow-card-hover transition-smooth cursor-pointer"
                    style={{ background: game.color }}
                    title={game.title}
                  >
                    {game.emoji}
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Category filters */}
      <section className="bg-muted/30 border-b border-border py-4">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-2 flex-wrap">
          <button
            type="button"
            data-ocid="category.all.tab"
            onClick={() => setActiveCategory(null)}
            className={`px-4 py-1.5 rounded-full font-display font-bold text-sm transition-smooth ${
              activeCategory === null
                ? "bg-foreground text-background"
                : "bg-card border border-border text-foreground hover:bg-muted"
            }`}
          >
            All Games
          </button>
          {CATEGORIES.map((cat) => (
            <button
              type="button"
              key={cat}
              data-ocid={`category.${cat.toLowerCase()}.tab`}
              onClick={() =>
                setActiveCategory(activeCategory === cat ? null : cat)
              }
              className={`px-4 py-1.5 rounded-full font-display font-bold text-sm transition-smooth ${
                activeCategory === cat
                  ? "ring-2 ring-primary"
                  : "bg-card border border-border hover:bg-muted"
              }`}
            >
              <CategoryBadge category={cat} size="sm" />
            </button>
          ))}
        </div>
      </section>

      {/* Games Grid */}
      <section
        data-ocid="games.section"
        className="max-w-7xl mx-auto px-4 py-10"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-extrabold text-2xl text-foreground">
            {activeCategory ? `${activeCategory} Games` : "Featured Games"}
          </h2>
          <Link
            to="/games"
            search={{ q: "" }}
            className="font-display font-bold text-sm text-primary hover:underline flex items-center gap-1"
            data-ocid="games.see_all.link"
          >
            See All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {displayedGames.map((game, i) => (
            <GameCard key={game.id} game={game} index={i} />
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section
        data-ocid="cta.section"
        className="mx-4 mb-12 rounded-3xl overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.65 0.25 345) 0%, oklch(0.60 0.28 255) 100%)",
        }}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-8 py-8">
          <div>
            <p className="font-display font-bold text-primary-foreground/80 text-sm uppercase tracking-wider mb-1">
              More Games
            </p>
            <h3 className="font-display font-extrabold text-2xl text-primary-foreground">
              Want to explore more?
            </h3>
          </div>
          <Button
            asChild
            data-ocid="cta.see_all_button"
            variant="secondary"
            className="rounded-full px-8 h-12 font-display font-bold text-base shrink-0"
          >
            <Link to="/games" search={{ q: "" }}>
              <Gamepad2 className="w-4 h-4 mr-2" />
              See All Games
            </Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
}
