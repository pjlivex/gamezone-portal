import { j as jsxRuntimeExports, L as Link } from "./index-Ds2o10Gm.js";
import { m as motion, C as CategoryBadge, b as Lock, P as Play } from "./games-Bbm2lcuG.js";
function GameCard({ game, index = 0 }) {
  const cardContent = /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.div,
    {
      "data-ocid": `game.item.${index + 1}`,
      className: "group relative bg-card rounded-2xl overflow-hidden border border-border cursor-pointer",
      initial: { opacity: 0, y: 20 },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true },
      transition: { duration: 0.4, delay: index % 8 * 0.05 },
      whileHover: {
        y: -4,
        boxShadow: "0 16px 40px oklch(0.65 0.25 345 / 0.25)"
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "relative h-36 flex items-center justify-center overflow-hidden",
            style: { background: game.color },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: "text-6xl select-none filter drop-shadow-lg transition-transform duration-300 group-hover:scale-110",
                  role: "img",
                  "aria-label": game.title,
                  children: game.emoji
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-2 left-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CategoryBadge, { category: game.category }) }),
              !game.implemented && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-foreground/40 backdrop-blur-[2px] flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "w-6 h-6 text-card" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-card text-xs font-display font-bold", children: "Coming Soon" })
              ] }) })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display font-bold text-foreground text-sm leading-tight mb-1 truncate", children: game.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-xs line-clamp-2 leading-relaxed mb-3", children: game.description }),
          game.implemented ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-xs font-display font-bold text-primary group-hover:gap-2.5 transition-all duration-200", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "w-3.5 h-3.5 fill-current" }),
            "Play Now"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-xs font-display font-medium text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "w-3.5 h-3.5" }),
            "Coming Soon"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none",
            style: {
              boxShadow: `inset 0 0 0 2px ${game.implemented ? "oklch(0.65 0.25 345 / 0.5)" : "oklch(0.5 0 0 / 0.2)"}`
            }
          }
        )
      ]
    }
  );
  if (!game.implemented) {
    return cardContent;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/play/$gameId", params: { gameId: game.id }, children: cardContent });
}
export {
  GameCard as G
};
