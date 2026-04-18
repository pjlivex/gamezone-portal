# Design Brief — Poki Gaming Portal

**Purpose**: Youth-oriented gaming entertainment hub with vibrant, energetic, playful personality.

**Tone**: Maximalist playfulness — bold neon confidence, high-saturation colors, rounded typography, dynamic interactions.

**Differentiation**: Vibrant rainbow gradient game cards with smooth hover scale animations + colorful category badges + animated entrance effects. Anti-corporate, anti-beige — candy-colored, memorable.

## Color Palette (OKLCH)

| Token | L | C | H | Purpose |
|-------|---|---|---|---------|
| primary (hot pink) | 0.65 | 0.25 | 345 | Primary CTA, game highlights |
| secondary (sunny) | 0.75 | 0.20 | 90 | Secondary accents, badges |
| accent (electric blue) | 0.60 | 0.28 | 255 | Interactive elements, hover |
| tertiary (lime) | 0.70 | 0.25 | 145 | Category badges, playful highlights |
| purple | 0.68 | 0.22 | 290 | Alternative badge/accent |
| background | 0.99 | 0 | 0 | Clean white, color pop focus |
| foreground | 0.15 | 0 | 0 | Near-black, high contrast |

## Typography

| Tier | Font | Size | Weight | Usage |
|------|------|------|--------|-------|
| Display | Space Grotesk | 2.5–3.5rem | 700 | Hero, section headers, game titles |
| Body | Figtree | 1rem | 400 | Body text, descriptions |
| Body Small | Figtree | 0.875rem | 400 | Meta, labels |
| Mono | System | 0.75rem | 400 | Debug, timestamps |

## Elevation & Depth

- **Default card**: 0 8px 24px rgba(0,0,0,0.12) with subtle color tint
- **Hover state**: 0 12px 32px rgba(0,0,0,0.16) + scale 1.05 transform
- **Shadows include chroma**: Hot pink primary casts warm, colored shadow on game cards

## Structural Zones

| Zone | Treatment | Border | BG |
|------|-----------|--------|-----|
| Header/Nav | White, rounded pill buttons, slight shadow | None | bg-background |
| Hero Section | Gradient background (hot pink→electric blue), text gradient | None | linear-gradient |
| Game Grid | 4-col desktop, 2-col tablet, 1-col mobile | rounded-3xl per card | bg-card |
| Footer | Light muted background, text contrast | border-t | bg-muted/5 |
| Game Card | Colorful accent bar top, hover glow | rounded-2xl | bg-card + gradient overlay |

## Component Patterns

- **Game Card**: title (Space Grotesk bold), thumbnail, category badge (hot pink/lime/electric/sunny), play button (rounded full), hover = scale 1.05 + shadow-card-hover
- **Category Badge**: pill-shaped (rounded-full), 3 color variants, small typography
- **Hero CTA**: Large gradient button, rounded-full, shadow-play, animation on load
- **Nav**: Horizontal pill-nav, text primary, underline on active, no background

## Motion & Animation

- **Card entrance**: 0.5s ease-out opacity 0→1, translateY 8px→0
- **Float effect**: Continuous 3s ease-in-out translateY ±8px (hero badges, decorative elements)
- **Glow pulse**: 2s ease-in-out box-shadow pulse (active game card hover state)
- **Smooth interaction**: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) on hover states

## Spacing & Rhythm

- **Padding**: 2rem (header), 1.5rem (cards), 1rem (button)
- **Gap**: 1.5rem (grid), 1rem (flex)
- **Margin**: 2rem sections, 3rem hero, 1.5rem footer

## Constraints

- No dark mode by default — light mode is the hero
- Max 5 colors at a time (avoid rainbow fatigue)
- No glow effects on background — only on interactive hover states
- High contrast maintained (L diff ≥ 0.7 foreground/background)
- Rounded radii min 1.5rem (lg), inherit from CSS variable --radius

## Signature Detail

Neon gradient game cards with colored shadow matching card accent color + smooth hover scale. Each game category gets a distinct badge color (hot pink for action, lime for puzzle, electric for adventure, sunny for casual). Hero tagline in vibrant gradient text — primary→accent.

