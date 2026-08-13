# Ascend — Calisthenics Journey

A beautiful, highly interactive **PWA** that guides you from your very first plank to the
hardest bodyweight skills: **handstand push-ups, planche, front lever, human flag, pull-ups &
muscle-ups, one-arm push-ups, pistol & dragon squats** — plus a dedicated **mobility &
external-rotation** path that unlocks everything else.

## Features

- **9 skill paths · 62 progression levels**, ordered easy → hard, each with a mastery gate
  (hit the standard in two separate sessions to unlock the next level)
- **Evidence-based programming** — isometric-first with movement patterns woven in.
  Hold durations, rep ranges and rest periods follow published research
  (Oranchuk 2019, Grgic 2018, Schoenfeld 2017, Behm 2016, Rio 2015, Lloyd 2014),
  all cited in-app on **The Method** page
- **Adaptive engine** — log what you actually achieved plus RPE after every set;
  targets ratchet up or down, levels unlock, and repeated under-target sessions
  trigger regression advice
- **Age-aware (8–40)** — kid / teen / adult / prime scaling of sets, hold caps and
  rests, with youth-specific safety notes on exercises
- **Immersive session player** — countdown hold timers, tap-to-count rep sets,
  per-side handling with switch timers, audio + vibration cues, screen wake-lock,
  and **rest timers filled with recommended stretches** matched to the muscles you
  just loaded
- **Visual exercise cards** — 70+ hand-built parametric SVG pose illustrations,
  technique care-abouts, common pitfalls, protocols and science notes
- **Onboarding baseline assessment** that places you at the right level of every path
- **Installable & offline-capable PWA** (Workbox precache, manifest, icons)

## Stack

Vite 8 · React 19 · TypeScript · Tailwind CSS 4 · framer-motion · zustand (persisted) ·
vite-plugin-pwa · Cloudflare Workers (static assets)

## Develop

```bash
npm install
npm run dev        # http://localhost:5173
```

Useful dev routes: `/poses` shows the full pose-illustration gallery.

```bash
npm run build      # type-check + production build to dist/
npm run cf:dev     # serve the production build through the Workers runtime
npm run icons      # regenerate PWA icons from the SVG mark
```

## Deploy to Cloudflare

The app ships as a Cloudflare **Worker with static assets** (see `wrangler.jsonc`,
SPA fallback enabled).

One-time interactive deploy:

```bash
npx wrangler login
npm run deploy
```

Or non-interactive (CI / agents): set `CLOUDFLARE_API_TOKEN` (create one at
Cloudflare Dashboard → My Profile → API Tokens → *Edit Cloudflare Workers* template)
and `CLOUDFLARE_ACCOUNT_ID`, then run `npm run deploy`.

A GitHub Actions workflow (`.github/workflows/deploy.yml`) deploys automatically on
pushes to `main` when the `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`
repository secrets are configured.

## Disclaimer

Ascend is an educational training companion, not medical advice. Train on safe
surfaces, warm up, and see a professional for pain that persists. Young athletes
should train with adult supervision.
