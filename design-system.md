# Design System — Habit Tracker

> Referentiedocument voor alle visuele beslissingen in de web-app (`apps/web`).
> Bronnen van waarheid: `tailwind.config.ts` en `app/globals.css`.

---

## Kleuren

### Primaire kleuren

| Token | Waarde | Gebruik |
|---|---|---|
| `accent` | `#6C63FF` | Knoppen, focus-rings, links, actieve states, streaks |
| `surface.light` | `#FFFFFF` | Achtergrond lichtmodus |
| `surface.dark` | `#0F0F0F` | Achtergrond donkermodus |

### Achtergronden (Tailwind)

| Klasse | Licht | Donker | Gebruik |
|---|---|---|---|
| `bg-white dark:bg-[#0F0F0F]` | wit | `#0F0F0F` | Primair oppervlak (body, kaarten) |
| `dark:bg-stone-900` | — | stone-900 | Subtiel achtergrond (hover, sidebar-actief, inputs) |
| `dark:bg-[#1A1A1A]` | — | `#1A1A1A` | Inputs in donkermodus |
| `bg-stone-50 dark:bg-stone-900/50` | stone-50 | stone-900/50 | Toggle-achtergrond, lichte secties |
| `bg-stone-100 dark:bg-stone-800` | stone-100 | stone-800 | Hover-states op icon-knoppen |

### Tekst

| Klasse | Gebruik |
|---|---|
| `text-stone-950 dark:text-[#F5F5F5]` | Body tekst (globaal, via `body` in globals.css) |
| `text-stone-900 dark:text-white` | Primaire koppen, labels |
| `text-stone-600 dark:text-stone-400` | Secundaire tekst |
| `text-stone-500 dark:text-stone-400` | Lichte meta-info |
| `text-stone-400 dark:text-stone-500` | Placeholders, subtekst |
| `text-stone-400` | Section headers, labels (uppercase) |
| `text-accent` | Links, accenttekst |
| `text-red-500` | Fout-indicatoren, vervallen deadlines |

### Borders en scheidingen

| Klasse | Gebruik |
|---|---|
| `border-stone-200 dark:border-stone-800` | Standaard border op kaarten (globale default) |
| `divide-stone-100 dark:divide-stone-900` | Scheidingslijnen binnen kaartgroepen |
| `border-stone-300 dark:border-stone-700` | Hover-state borders (bijv. subtiele knoppen) |

### Status-kleuren (badges/toasts)

| Status | Light | Dark |
|---|---|---|
| Succes | `bg-green-50 text-green-700` | `dark:bg-green-950/40 dark:text-green-400` |
| Fout | `bg-red-50 text-red-800` | `dark:bg-red-950/60 dark:text-red-300` |
| Info / Neutraal | `bg-stone-50 text-stone-700` | `dark:bg-stone-900 dark:text-stone-300` |
| Accent dot | `bg-green-500` (verbonden) | `bg-stone-400` (niet verbonden) |

### Prioriteitskleur taken (PRIORITY_COLORS in `packages/types`)

| Prioriteit | Kleur |
|---|---|
| `high` | rood |
| `normal` | stone/grijs |
| `low` | blauw/gedimpt |

---

## Typografie

### Lettertypes
- **Sans-serif:** Geist Sans (`var(--font-geist-sans)`) — geladen via Next.js font loader
- **Monospace:** Geist Mono (`var(--font-geist-mono)`)
- Rendering: `-webkit-font-smoothing: antialiased`

### Tekstgroottes (gebruik in de app)

| Klasse | Gebruik |
|---|---|
| `text-2xl font-semibold tracking-tight` | Paginatitels (h1) |
| `text-lg font-semibold` | Sectietitels (h2 in kaarten) |
| `text-sm font-medium` | Kaart-labels, form labels |
| `text-sm` | Body tekst, knoppen |
| `text-xs` | Subtekst, meta-informatie |
| `text-xs font-semibold uppercase tracking-widest text-stone-400` | Section headers (Notificaties, Account, etc.) |
| `text-[10px] font-medium` | Dense labels (datum badges op taakkaartjes, heatmap) |

---

## Border radius

Tailwind `borderRadius.DEFAULT` is overschreven naar `16px`.

| Klasse | Radius | Gebruik |
|---|---|---|
| `rounded` | `16px` | — (default, zelden direct gebruikt) |
| `rounded-2xl` | `16px` | Kaarten, modals, secties |
| `rounded-xl` | `12px` | Inputs, select-velden, primaire knoppen, kleinere kaarten |
| `rounded-lg` | `8px` | Icon-knoppen, kleine acties |
| `rounded-full` | `9999px` | Checkboxes, avatars, status-dots, badges |
| `rounded-[10px]` | `10px` | Toggle-opties in segmented control |

---

## Spacing & Layout

### Container
- Maximale breedte: `max-w-5xl`
- Horizontale padding: `px-4 sm:px-6 lg:px-8`
- Verticale padding: `py-6 md:py-10`

### Sidebar
- Breedte desktop: `w-64` (256px), fixed
- Mobile: volledige hoogte slide-over drawer
- Main content offset: `pt-14 md:pt-0 md:pl-64`

### Kaarten
- Standaard padding: `px-4 py-3` (compact) of `px-5 py-4` (ruim)
- Sectie-spacing: `space-y-8` tussen secties op een pagina
- Binnen een kaart: `space-y-2` of `space-y-3`

### Breakpoints
- **Gebruik `md:` als primaire layout-breakpoint** (niet `sm:`)
- Grid habitkaartjes: `grid-cols-1 md:grid-cols-2`

---

## Componenten

### Kaart

```
rounded-2xl border border-stone-200 dark:border-stone-800
bg-white dark:bg-[#0F0F0F]
px-4 py-3  (of px-5 py-4)
```

### Kaartgroep (meerdere rijen in één card)

```
rounded-2xl border border-stone-200 dark:border-stone-800
divide-y divide-stone-100 dark:divide-stone-900
```

### Primaire knop (accent)

```
rounded-xl bg-accent px-4 py-2.5
text-sm font-semibold text-white
hover:bg-accent/90 disabled:opacity-60
transition
```

### Subtiele / outline knop

```
rounded-xl border border-stone-200 dark:border-stone-800
bg-white dark:bg-[#1A1A1A]
px-3 py-2.5 text-xs text-stone-500 dark:text-stone-400
hover:text-stone-900 dark:hover:text-white
hover:border-stone-300 dark:hover:border-stone-700
transition
```

### Icon-knop (hover-actie)

```
rounded-lg p-1.5
text-stone-400
hover:text-stone-700 dark:hover:text-stone-200
hover:bg-stone-100 dark:hover:bg-stone-800
transition
```

### Input / Select

```
rounded-xl border border-stone-200 dark:border-stone-800
bg-white dark:bg-[#1A1A1A]
px-4 py-2.5 text-sm
focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20
transition
```

### Toggle switch (EmailDigestToggle-patroon)

- Track aan: `bg-stone-900 dark:bg-white`
- Track uit: `bg-stone-200 dark:bg-stone-700`
- Thumb: `bg-white dark:bg-stone-900`, animatie `translate-x-5` / `translate-x-0`

### Segmented control (ThemeToggle-patroon)

```
Container: inline-flex rounded-xl border border-stone-200 dark:border-stone-800
           p-0.5 gap-0.5 bg-stone-50 dark:bg-stone-900/50

Actieve optie: bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-sm rounded-[10px] px-3 py-1.5
Inactieve optie: text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300
```

### Badge / Pill

```
rounded-full px-2.5 py-1 text-xs font-medium
```
Combineer met statuskleuren (zie Kleuren → Status-kleuren).

### Section header

```
text-xs font-semibold uppercase tracking-widest text-stone-400
```

### Skeleton loader

```
rounded-xl bg-stone-100 dark:bg-stone-900 animate-pulse
h-{hoogte} w-{breedte}
```

---

## Focus & Toegankelijkheid

Globale focus-ring (`:focus-visible` in globals.css):

```css
outline: none;
ring-2 ring-accent ring-offset-2
ring-offset-white dark:ring-offset-[#0F0F0F]
```

- Interactieve elementen zonder zichtbare focus-ring krijgen `focus:outline-none` gecombineerd met de eigen hover-stijl.
- De rijke teksteditor (Tiptap) heeft de globale ring onderdrukt en gebruikt eigen focus-cues.

---

## Animaties & Motion

Framer Motion is de standaard animatiebibliotheek.

### Standaard kaartintro (motion.div)

```tsx
initial={{ opacity: 0, y: 4 }}
animate={{ opacity: 1, y: 0 }}
```

### Custom keyframe (check-in)

Gedefinieerd in `tailwind.config.ts`:

```
animation: 'check-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
keyframes: scale(0.8) opacity(0) → scale(1) opacity(1)
```
Gebruik: `className="animate-check-in"` — bouncy spring voor habit-afvinken.

### Toast-animatie (Toaster)

```tsx
initial={{ opacity: 0, y: 12, scale: 0.96 }}
animate={{ opacity: 1, y: 0, scale: 1 }}
exit={{ opacity: 0, y: 8, scale: 0.95 }}
transition={{ duration: 0.2 }}
```

---

## Dark mode

- Strategie: **class-based** (`darkMode: 'class'` in tailwind.config.ts)
- Provider: `next-themes` ThemeProvider in `providers.tsx` (`attribute="class"`, `defaultTheme="system"`, `enableSystem`)
- Gebruiker kan kiezen: **Licht / Donker / Systeem** via `ThemeToggle` in instellingen
- Voorkeur wordt opgeslagen in `profiles.theme`
- `suppressHydrationWarning` staat op `<html>` en `<body>` in layout.tsx

**Conventies:**
- Gebruik nooit `dark:` zonder het light-equivalent te definiëren
- Primair oppervlak: `bg-white dark:bg-[#0F0F0F]`
- Subtiel oppervlak: `bg-stone-50 dark:bg-stone-900`
- Inputs: `bg-white dark:bg-[#1A1A1A]`

---

## Rich text editor (Tiptap)

Stijlen via `.rich-editor .ProseMirror` in globals.css:

| Element | Stijl |
|---|---|
| `h1` | `text-xl font-bold` |
| `h2` | `text-lg font-semibold` |
| `h3` | `text-base font-semibold` |
| `blockquote` | `border-l-4 border-stone-300 italic text-stone-500` |
| `code` (inline) | `bg-stone-100 font-mono text-[0.85em] rounded` |
| `pre` (blok) | `bg-stone-950 text-stone-100 rounded-xl text-xs font-mono` |
| `a` | `text-accent underline underline-offset-2` |
| `img` | `max-w-full rounded-xl border` |

---

## Iconen

Geen icon-bibliotheek — alle iconen zijn inline `<svg>` elementen.

**Conventie:**
- Grootte: `width="13" height="13"` (acties), `width="16" height="16"` (statusbar), `width="12" height="12"` (micro)
- Stijl: `fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"`
- Kleur erft via `currentColor` → stuur aan via `text-{kleur}` op parent

---

## Toast notificaties

- Store: `useToastStore` (Zustand) in `apps/web/hooks/useToast.ts`
- Component: `<Toaster />` (fixed `bottom-5 right-5 z-50`) in dashboard layout
- Auto-dismiss: 4 seconden
- Gebruik in hooks: `addToast({ type: 'success' | 'error' | 'info', message: '...' })`
- Typisch in `onError` callbacks van React Query mutations
