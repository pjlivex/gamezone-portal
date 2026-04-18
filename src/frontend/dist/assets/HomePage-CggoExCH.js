import { r as reactExports, j as jsxRuntimeExports, L as Link } from "./index-DVZ7AijH.js";
import { c as createLucideIcon, G as GAMES, L as Layout, m as motion, B as Button, C as CategoryBadge, a as Gamepad2 } from "./Layout-bfeKLfHg.js";
import { G as GameCard } from "./GameCard-DcG5FwQ5.js";
import { Z as Zap } from "./zap-DwBv7T87.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["path", { d: "M5 12h14", key: "1ays0h" }],
  ["path", { d: "m12 5 7 7-7 7", key: "xquz4c" }]
];
const ArrowRight = createLucideIcon("arrow-right", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  [
    "path",
    {
      d: "M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z",
      key: "4pj2yx"
    }
  ],
  ["path", { d: "M20 3v4", key: "1olli1" }],
  ["path", { d: "M22 5h-4", key: "1gvqau" }],
  ["path", { d: "M4 17v2", key: "vumght" }],
  ["path", { d: "M5 18H3", key: "zchphs" }]
];
const Sparkles = createLucideIcon("sparkles", __iconNode);
const CATEGORIES = [
  "Action",
  "Puzzle",
  "Strategy",
  "Adventure"
];
const FEATURED_GAMES = GAMES.filter((g) => g.implemented);
function HomePage() {
  const [activeCategory, setActiveCategory] = reactExports.useState(
    null
  );
  const displayedGames = activeCategory ? GAMES.filter((g) => g.category === activeCategory) : GAMES.slice(0, 8);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Layout, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "section",
      {
        "data-ocid": "hero.section",
        className: "relative overflow-hidden",
        style: {
          background: "linear-gradient(135deg, oklch(0.97 0.04 345) 0%, oklch(0.96 0.05 255) 50%, oklch(0.97 0.04 145) 100%)"
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none",
              style: { background: "oklch(0.65 0.25 345)" }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "absolute -bottom-16 -right-16 w-80 h-80 rounded-full opacity-20 blur-3xl pointer-events-none",
              style: { background: "oklch(0.60 0.28 255)" }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto px-4 py-16 md:py-20 flex flex-col md:flex-row items-center gap-10", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              motion.div,
              {
                className: "flex-1 min-w-0",
                initial: { opacity: 0, x: -30 },
                animate: { opacity: 1, x: 0 },
                transition: { duration: 0.6 },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "w-5 h-5 text-primary" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-display font-bold text-sm text-primary uppercase tracking-widest", children: "Free Browser Games" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "font-display font-extrabold text-5xl md:text-6xl leading-none mb-5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gradient-primary", children: "Play Amazing" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground", children: "Games" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-lg max-w-md mb-8 leading-relaxed", children: "Explore 10 awesome free games instantly. No downloads, no sign-up — just pure fun!" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-3", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Button,
                      {
                        asChild: true,
                        "data-ocid": "hero.play_button",
                        className: "rounded-full px-8 h-12 font-display font-bold text-base shadow-play hover:shadow-card-hover",
                        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/games", search: { q: "" }, children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "w-4 h-4 mr-2" }),
                          "Play Now"
                        ] })
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Button,
                      {
                        asChild: true,
                        variant: "outline",
                        "data-ocid": "hero.browse_button",
                        className: "rounded-full px-8 h-12 font-display font-bold text-base",
                        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/games", search: { q: "" }, children: [
                          "Browse All Games",
                          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "w-4 h-4 ml-2" })
                        ] })
                      }
                    )
                  ] })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              motion.div,
              {
                className: "flex-shrink-0 grid grid-cols-3 gap-3",
                initial: { opacity: 0, x: 30 },
                animate: { opacity: 1, x: 0 },
                transition: { duration: 0.6, delay: 0.15 },
                children: FEATURED_GAMES.map((game, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                  motion.div,
                  {
                    animate: { y: [0, -8, 0] },
                    transition: {
                      duration: 3,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: i * 0.4,
                      ease: "easeInOut"
                    },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/play/$gameId", params: { gameId: game.id }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "div",
                      {
                        className: "w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-play hover:shadow-card-hover transition-smooth cursor-pointer",
                        style: { background: game.color },
                        title: game.title,
                        children: game.emoji
                      }
                    ) })
                  },
                  game.id
                ))
              }
            )
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "bg-muted/30 border-b border-border py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto px-4 flex items-center gap-2 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          "data-ocid": "category.all.tab",
          onClick: () => setActiveCategory(null),
          className: `px-4 py-1.5 rounded-full font-display font-bold text-sm transition-smooth ${activeCategory === null ? "bg-foreground text-background" : "bg-card border border-border text-foreground hover:bg-muted"}`,
          children: "All Games"
        }
      ),
      CATEGORIES.map((cat) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          "data-ocid": `category.${cat.toLowerCase()}.tab`,
          onClick: () => setActiveCategory(activeCategory === cat ? null : cat),
          className: `px-4 py-1.5 rounded-full font-display font-bold text-sm transition-smooth ${activeCategory === cat ? "ring-2 ring-primary" : "bg-card border border-border hover:bg-muted"}`,
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(CategoryBadge, { category: cat, size: "sm" })
        },
        cat
      ))
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "section",
      {
        "data-ocid": "games.section",
        className: "max-w-7xl mx-auto px-4 py-10",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display font-extrabold text-2xl text-foreground", children: activeCategory ? `${activeCategory} Games` : "Featured Games" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Link,
              {
                to: "/games",
                search: { q: "" },
                className: "font-display font-bold text-sm text-primary hover:underline flex items-center gap-1",
                "data-ocid": "games.see_all.link",
                children: [
                  "See All ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "w-4 h-4" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4", children: displayedGames.map((game, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(GameCard, { game, index: i }, game.id)) })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "section",
      {
        "data-ocid": "cta.section",
        className: "mx-4 mb-12 rounded-3xl overflow-hidden",
        style: {
          background: "linear-gradient(135deg, oklch(0.65 0.25 345) 0%, oklch(0.60 0.28 255) 100%)"
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row items-center justify-between gap-6 px-8 py-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display font-bold text-primary-foreground/80 text-sm uppercase tracking-wider mb-1", children: "More Games" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display font-extrabold text-2xl text-primary-foreground", children: "Want to explore more?" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              asChild: true,
              "data-ocid": "cta.see_all_button",
              variant: "secondary",
              className: "rounded-full px-8 h-12 font-display font-bold text-base shrink-0",
              children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/games", search: { q: "" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Gamepad2, { className: "w-4 h-4 mr-2" }),
                "See All Games"
              ] })
            }
          )
        ] })
      }
    )
  ] });
}
export {
  HomePage as default
};
