import { Button } from "@/components/ui/button";
import { useParams } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Lock } from "lucide-react";
import { CategoryBadge } from "../components/CategoryBadge";
import { Layout } from "../components/Layout";
import { getGameById } from "../data/games";
import BreakoutGame from "../games/BreakoutGame";
import FlappyGame from "../games/FlappyGame";
import Game2048 from "../games/Game2048";
import MemoryGame from "../games/MemoryGame";
import PongGame from "../games/PongGame";
import SnakeGame from "../games/SnakeGame";
import TicTacToeGame from "../games/TicTacToeGame";

const GAME_COMPONENTS: Record<string, React.ComponentType> = {
  snake: SnakeGame,
  game2048: Game2048,
  memory: MemoryGame,
  flappy: FlappyGame,
  tictactoe: TicTacToeGame,
  breakout: BreakoutGame,
  pong: PongGame,
};

export default function PlayPage() {
  const { gameId } = useParams({ from: "/play/$gameId" });
  const game = getGameById(gameId);

  if (!game) {
    return (
      <Layout>
        <div
          data-ocid="play_page.not_found"
          className="flex flex-col items-center justify-center py-32 gap-4"
        >
          <span className="text-6xl">❓</span>
          <h1 className="font-display font-bold text-2xl text-foreground">
            Game not found
          </h1>
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/games" search={{ q: "" }}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Games
            </Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const GameComponent = GAME_COMPONENTS[game.id];

  return (
    <Layout>
      {/* Breadcrumb + meta */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="rounded-full font-display font-semibold"
            data-ocid="play_page.back_button"
          >
            <Link to="/games" search={{ q: "" }}>
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Games
            </Link>
          </Button>
          <span className="text-muted-foreground">/</span>
          <span className="font-display font-bold text-foreground text-sm">
            {game.title}
          </span>
          <CategoryBadge category={game.category} />
        </div>
      </div>

      {/* Game area */}
      <div
        className="max-w-7xl mx-auto px-4 py-8"
        data-ocid="play_page.game.section"
      >
        <div className="flex flex-col items-center gap-6">
          {/* Game title */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-play"
                style={{ background: game.color }}
              >
                {game.emoji}
              </div>
              <h1 className="font-display font-extrabold text-3xl text-foreground">
                {game.title}
              </h1>
            </div>
            <p className="text-muted-foreground text-sm max-w-md">
              {game.description}
            </p>
          </div>

          {/* Game canvas area */}
          {game.implemented && GameComponent ? (
            <div
              data-ocid="play_page.canvas_target"
              className="w-full max-w-2xl"
            >
              <GameComponent />
            </div>
          ) : (
            <div
              data-ocid="play_page.coming_soon"
              className="w-full max-w-2xl rounded-3xl overflow-hidden"
              style={{ background: game.color }}
            >
              <div className="flex flex-col items-center justify-center gap-6 py-32 text-primary-foreground">
                <Lock className="w-12 h-12 opacity-80" />
                <div className="text-center">
                  <h2 className="font-display font-extrabold text-3xl mb-2">
                    Coming Soon!
                  </h2>
                  <p className="text-primary-foreground/80 text-base max-w-xs">
                    This game is under development and will be available very
                    soon.
                  </p>
                </div>
                <Button
                  asChild
                  variant="secondary"
                  className="rounded-full px-8 font-display font-bold"
                  data-ocid="play_page.browse_more_button"
                >
                  <Link to="/games" search={{ q: "" }}>
                    Browse Playable Games
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
