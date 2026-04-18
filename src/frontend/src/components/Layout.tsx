import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Gamepad2, Menu, Search, X } from "lucide-react";
import { useCallback, useState } from "react";
import { GAMES } from "../data/games";

interface LayoutProps {
  children: React.ReactNode;
  onSearch?: (query: string) => void;
  searchValue?: string;
}

export function Layout({ children, onSearch, searchValue = "" }: LayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchValue);
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setLocalSearch(val);
      if (onSearch) {
        onSearch(val);
      } else {
        // If on home page, navigate to games with search param
        if (val.trim()) {
          navigate({ to: "/games", search: { q: val } });
        }
      }
    },
    [onSearch, navigate],
  );

  const isActive = (path: string) => currentPath === path;

  const navLinkClass = (path: string) =>
    `font-display font-semibold text-sm px-4 py-2 rounded-full transition-smooth ${
      isActive(path)
        ? "bg-primary text-primary-foreground"
        : "text-foreground hover:bg-muted"
    }`;

  const year = new Date().getFullYear();
  const utmLink = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
    typeof window !== "undefined" ? window.location.hostname : "",
  )}`;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 shrink-0"
            data-ocid="nav.logo.link"
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-primary to-accent shadow-play">
              <Gamepad2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-extrabold text-xl text-gradient-primary hidden sm:block">
              GameZone
            </span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-1 ml-2">
            <Link
              to="/"
              className={navLinkClass("/")}
              data-ocid="nav.home.link"
            >
              Home
            </Link>
            <Link
              to="/games"
              search={{ q: "" }}
              className={navLinkClass("/games")}
              data-ocid="nav.games.link"
            >
              Games
            </Link>
          </nav>

          {/* Search */}
          <div className="flex-1 max-w-xs ml-auto md:ml-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              data-ocid="nav.search_input"
              type="search"
              placeholder="Search games..."
              className="pl-9 h-9 rounded-full bg-muted border-0 text-sm focus-visible:ring-primary"
              value={localSearch}
              onChange={handleSearchChange}
            />
          </div>

          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
            data-ocid="nav.menu.toggle"
          >
            {menuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
        </div>

        {/* Mobile nav */}
        {menuOpen && (
          <div className="md:hidden border-t border-border bg-card px-4 py-3 flex gap-2">
            <Link
              to="/"
              className={navLinkClass("/")}
              onClick={() => setMenuOpen(false)}
              data-ocid="nav.mobile.home.link"
            >
              Home
            </Link>
            <Link
              to="/games"
              search={{ q: "" }}
              className={navLinkClass("/games")}
              onClick={() => setMenuOpen(false)}
              data-ocid="nav.mobile.games.link"
            >
              Games
            </Link>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1 bg-background">{children}</main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-br from-primary to-accent">
              <Gamepad2 className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-foreground">
              GameZone
            </span>
          </div>
          <p className="text-muted-foreground text-sm text-center">
            © {year}. Built with love using{" "}
            <a
              href={utmLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-semibold"
            >
              caffeine.ai
            </a>
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span>{GAMES.length} Games</span>
            <span>•</span>
            <span>{GAMES.filter((g) => g.implemented).length} Playable</span>
            <span>•</span>
            <span>Free Forever</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
