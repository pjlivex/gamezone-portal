import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";

const EMOJIS = ["🎸", "🌈", "🦄", "🍕", "🚀", "🎮", "🌺", "🦋"];
const CARDS = [...EMOJIS, ...EMOJIS];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface Card {
  id: number;
  emoji: string;
  flipped: boolean;
  matched: boolean;
}

function initCards(): Card[] {
  return shuffle(CARDS).map((emoji, id) => ({
    id,
    emoji,
    flipped: false,
    matched: false,
  }));
}

export default function MemoryGame() {
  const [cards, setCards] = useState<Card[]>(initCards);
  const [selected, setSelected] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);
  const [won, setWon] = useState(false);

  const reset = () => {
    setCards(initCards());
    setSelected([]);
    setMoves(0);
    setLocked(false);
    setWon(false);
  };

  const handleFlip = useCallback(
    (id: number) => {
      if (locked) return;
      const card = cards[id];
      if (card.flipped || card.matched || selected.includes(id)) return;

      const newSelected = [...selected, id];
      setCards((prev) =>
        prev.map((c) => (c.id === id ? { ...c, flipped: true } : c)),
      );
      setSelected(newSelected);

      if (newSelected.length === 2) {
        setMoves((m) => m + 1);
        setLocked(true);
        const [a, b] = newSelected.map((i) => cards[i]);
        if (a.emoji === b.emoji) {
          setTimeout(() => {
            setCards((prev) => {
              const updated = prev.map((c) =>
                newSelected.includes(c.id) ? { ...c, matched: true } : c,
              );
              if (updated.every((c) => c.matched)) setWon(true);
              return updated;
            });
            setSelected([]);
            setLocked(false);
          }, 400);
        } else {
          setTimeout(() => {
            setCards((prev) =>
              prev.map((c) =>
                newSelected.includes(c.id) ? { ...c, flipped: false } : c,
              ),
            );
            setSelected([]);
            setLocked(false);
          }, 900);
        }
      }
    },
    [cards, selected, locked],
  );

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-3 w-full justify-between">
        <div className="flex gap-2">
          <Badge
            variant="secondary"
            className="font-display font-bold px-4 py-2"
          >
            Moves: {moves}
          </Badge>
          <Badge variant="outline" className="font-display font-bold px-4 py-2">
            Pairs: {cards.filter((c) => c.matched).length / 2}/{EMOJIS.length}
          </Badge>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={reset}
          className="rounded-full font-display"
          data-ocid="memory.restart_button"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1" /> Reset
        </Button>
      </div>

      <div
        className="relative grid grid-cols-4 gap-3 p-4 bg-muted rounded-2xl shadow-play"
        data-ocid="memory.canvas_target"
      >
        {cards.map((card) => (
          <motion.button
            key={card.id}
            data-ocid={`memory.card.${card.id + 1}`}
            onClick={() => handleFlip(card.id)}
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl flex items-center justify-center text-3xl font-bold cursor-pointer transition-smooth border-2 ${
              card.matched
                ? "bg-chart-3/30 border-chart-3/50 opacity-60"
                : card.flipped
                  ? "bg-card border-primary shadow-play"
                  : "bg-accent/20 border-accent/30 hover:bg-accent/40"
            }`}
            whileHover={!card.flipped && !card.matched ? { scale: 1.08 } : {}}
            whileTap={{ scale: 0.95 }}
          >
            <AnimatePresence mode="wait">
              {card.flipped || card.matched ? (
                <motion.span
                  key="face"
                  initial={{ rotateY: 90 }}
                  animate={{ rotateY: 0 }}
                  exit={{ rotateY: 90 }}
                  transition={{ duration: 0.15 }}
                >
                  {card.emoji}
                </motion.span>
              ) : (
                <motion.span
                  key="back"
                  className="text-accent font-display font-extrabold text-xl"
                >
                  ?
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        ))}

        <AnimatePresence>
          {won && (
            <motion.div
              className="absolute inset-0 rounded-2xl bg-foreground/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="font-display font-extrabold text-2xl text-card">
                🎉 You Win!
              </p>
              <p className="text-card/80 text-sm">Completed in {moves} moves</p>
              <Button
                onClick={reset}
                data-ocid="memory.play_again_button"
                className="rounded-full px-8 font-display font-bold"
              >
                Play Again
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="text-muted-foreground text-xs">
        Flip cards to find matching pairs
      </p>
    </div>
  );
}
