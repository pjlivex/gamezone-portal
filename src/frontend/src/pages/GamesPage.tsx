import { Input } from "@/components/ui/input";
import { useSearch } from "@tanstack/react-router";
import { Gamepad2, Search } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
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

export default function GamesPage() {
  const search = useSearch({ from: "/games" });
  const [query, setQuery] = useState(search.q ?? "");
  const [activeCategory, setActiveCategory] = useState<GameCategory | null>(
    null,
  );

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return GAMES.filter((g) => {
      const matchesCategory = !activeCategory || g.category === activeCategory;
      const matchesQuery =
        !q ||
        g.title.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q) ||
        g.tags.some((t) => t.includes(q));
      return matchesCategory && matchesQuery;
    });
  }, [query, activeCategory]);

  return (
    <Layout onSearch={setQuery} searchValue={query}>
      {/* Header */}
      <section
        className="bg-muted/30 border-b border-border py-8"
        data-ocid="games_page.header.section"
      >
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="font-display font-extrabold text-4xl mb-2">
              <span className="text-gradient-primary">All Games</span>
            </h1>
            <p className="text-muted-foreground text-base">
              {GAMES.length} games · {GAMES.filter((g) => g.implemented).length}{" "}
              playable now
            </p>
          </motion.div>

          {/* Search + filters row */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                data-ocid="games_page.search_input"
                type="search"
                placeholder="Search games..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9 rounded-full bg-card border-border"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                type="button"
                data-ocid="games_page.filter.all.tab"
                onClick={() => setActiveCategory(null)}
                className={`px-4 py-1.5 rounded-full font-display font-bold text-sm transition-smooth border ${
                  activeCategory === null
                    ? "bg-foreground text-background border-foreground"
                    : "bg-card border-border text-foreground hover:bg-muted"
                }`}
              >
                All
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  data-ocid={`games_page.filter.${cat.toLowerCase()}.tab`}
                  onClick={() =>
                    setActiveCategory(activeCategory === cat ? null : cat)
                  }
                  className={`px-3 py-1.5 rounded-full font-display font-bold text-sm transition-smooth border ${
                    activeCategory === cat
                      ? "ring-2 ring-primary ring-offset-1 border-transparent"
                      : "bg-card border-border hover:bg-muted"
                  }`}
                >
                  <CategoryBadge category={cat} size="sm" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section
        className="max-w-7xl mx-auto px-4 py-10"
        data-ocid="games_page.grid.section"
      >
        {filtered.length === 0 ? (
          <div
            data-ocid="games_page.empty_state"
            className="flex flex-col items-center justify-center py-24 gap-4"
          >
            <span className="text-6xl">🎮</span>
            <h3 className="font-display font-bold text-xl text-foreground">
              No games found
            </h3>
            <p className="text-muted-foreground text-sm">
              Try a different search term or category
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setActiveCategory(null);
              }}
              className="font-display font-bold text-sm text-primary hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <p className="text-muted-foreground text-sm mb-4 font-display">
              Showing {filtered.length} game{filtered.length !== 1 ? "s" : ""}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filtered.map((game, i) => (
                <GameCard key={game.id} game={game} index={i} />
              ))}
            </div>
          </>
        )}
      </section>

      {/* Stats bar */}
      <div className="bg-muted/40 border-t border-border py-6">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap gap-6 justify-center sm:justify-start">
          {[
            { icon: "🎮", label: "Total Games", value: GAMES.length },
            {
              icon: "⚡",
              label: "Playable Now",
              value: GAMES.filter((g) => g.implemented).length,
            },
            {
              icon: "🔜",
              label: "Coming Soon",
              value: GAMES.filter((g) => !g.implemented).length,
            },
          ].map(({ icon, label, value }) => (
            <div key={label} className="flex items-center gap-3">
              <span className="text-2xl">{icon}</span>
              <div>
                <p className="font-display font-extrabold text-2xl text-foreground leading-none">
                  {value}
                </p>
                <p className="text-muted-foreground text-xs font-body">
                  {label}
                </p>
              </div>
            </div>
          ))}
          <div className="flex items-center gap-3">
            <Gamepad2 className="w-6 h-6 text-primary" />
            <div>
              <p className="font-display font-extrabold text-2xl text-foreground leading-none">
                Free
              </p>
              <p className="text-muted-foreground text-xs font-body">
                Always & Forever
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
