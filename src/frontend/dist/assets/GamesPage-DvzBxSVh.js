import { u as useSearch, r as reactExports, j as jsxRuntimeExports } from "./index-DVZ7AijH.js";
import { G as GAMES, L as Layout, m as motion, S as Search, I as Input, C as CategoryBadge, a as Gamepad2 } from "./Layout-bfeKLfHg.js";
import { G as GameCard } from "./GameCard-DcG5FwQ5.js";
const CATEGORIES = [
  "Action",
  "Puzzle",
  "Strategy",
  "Adventure"
];
function GamesPage() {
  const search = useSearch({ from: "/games" });
  const [query, setQuery] = reactExports.useState(search.q ?? "");
  const [activeCategory, setActiveCategory] = reactExports.useState(
    null
  );
  const filtered = reactExports.useMemo(() => {
    const q = query.toLowerCase().trim();
    return GAMES.filter((g) => {
      const matchesCategory = !activeCategory || g.category === activeCategory;
      const matchesQuery = !q || g.title.toLowerCase().includes(q) || g.description.toLowerCase().includes(q) || g.tags.some((t) => t.includes(q));
      return matchesCategory && matchesQuery;
    });
  }, [query, activeCategory]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Layout, { onSearch: setQuery, searchValue: query, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "section",
      {
        className: "bg-muted/30 border-b border-border py-8",
        "data-ocid": "games_page.header.section",
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto px-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.div,
            {
              initial: { opacity: 0, y: -10 },
              animate: { opacity: 1, y: 0 },
              transition: { duration: 0.4 },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display font-extrabold text-4xl mb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gradient-primary", children: "All Games" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground text-base", children: [
                  GAMES.length,
                  " games · ",
                  GAMES.filter((g) => g.implemented).length,
                  " ",
                  "playable now"
                ] })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full max-w-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  "data-ocid": "games_page.search_input",
                  type: "search",
                  placeholder: "Search games...",
                  value: query,
                  onChange: (e) => setQuery(e.target.value),
                  className: "pl-9 rounded-full bg-card border-border"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 flex-wrap", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  "data-ocid": "games_page.filter.all.tab",
                  onClick: () => setActiveCategory(null),
                  className: `px-4 py-1.5 rounded-full font-display font-bold text-sm transition-smooth border ${activeCategory === null ? "bg-foreground text-background border-foreground" : "bg-card border-border text-foreground hover:bg-muted"}`,
                  children: "All"
                }
              ),
              CATEGORIES.map((cat) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  "data-ocid": `games_page.filter.${cat.toLowerCase()}.tab`,
                  onClick: () => setActiveCategory(activeCategory === cat ? null : cat),
                  className: `px-3 py-1.5 rounded-full font-display font-bold text-sm transition-smooth border ${activeCategory === cat ? "ring-2 ring-primary ring-offset-1 border-transparent" : "bg-card border-border hover:bg-muted"}`,
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(CategoryBadge, { category: cat, size: "sm" })
                },
                cat
              ))
            ] })
          ] })
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "section",
      {
        className: "max-w-7xl mx-auto px-4 py-10",
        "data-ocid": "games_page.grid.section",
        children: filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            "data-ocid": "games_page.empty_state",
            className: "flex flex-col items-center justify-center py-24 gap-4",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-6xl", children: "🎮" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display font-bold text-xl text-foreground", children: "No games found" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: "Try a different search term or category" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: () => {
                    setQuery("");
                    setActiveCategory(null);
                  },
                  className: "font-display font-bold text-sm text-primary hover:underline",
                  children: "Clear filters"
                }
              )
            ]
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground text-sm mb-4 font-display", children: [
            "Showing ",
            filtered.length,
            " game",
            filtered.length !== 1 ? "s" : ""
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4", children: filtered.map((game, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(GameCard, { game, index: i }, game.id)) })
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-muted/40 border-t border-border py-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto px-4 flex flex-wrap gap-6 justify-center sm:justify-start", children: [
      [
        { icon: "🎮", label: "Total Games", value: GAMES.length },
        {
          icon: "⚡",
          label: "Playable Now",
          value: GAMES.filter((g) => g.implemented).length
        },
        {
          icon: "🔜",
          label: "Coming Soon",
          value: GAMES.filter((g) => !g.implemented).length
        }
      ].map(({ icon, label, value }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl", children: icon }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display font-extrabold text-2xl text-foreground leading-none", children: value }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-xs font-body", children: label })
        ] })
      ] }, label)),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Gamepad2, { className: "w-6 h-6 text-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display font-extrabold text-2xl text-foreground leading-none", children: "Free" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-xs font-body", children: "Always & Forever" })
        ] })
      ] })
    ] }) })
  ] });
}
export {
  GamesPage as default
};
