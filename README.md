# 🏏 FanClub — CricHeroes-Style Cricket Scoring & Tournament Web App

> **Live Domain**: `https://fanclub.srijandev.in`  
> **Deployment Target**: Cloudflare Pages (via GitHub / Git)  
> **Built with**: React 19 + TypeScript + Vite + Tailwind CSS + Lucide Icons + Canvas Confetti  

---

## 🌟 Overview

**FanClub** is a feature-rich, high-performance web-based cricket scoring application inspired by **CricHeroes**, tailored for local tournaments, gully cricket stars, cricket academies, and streaming broadcasters.

---

## 🎨 Themes & Design System (Light Backgrounds)

All themes are engineered on a clean, daylight-readable crisp background:

1. **🏆 World Cup Grand Final Theme** (`wcFinal`)
   - Vibe: Last World Cup final stadium glory.
   - Accents: Royal Stadium Navy, Championship Trophy Gold (`#F59E0B`), Ice Blue gradients.
   - Status: Available as default flagship theme!

2. **🌿 Asia Cup Prestige Theme** (`asiaCup`)
   - Vibe: Subcontinental turf cricket heritage.
   - Accents: Deep Emerald Green (`#059669`), Ivory White, Golden Sand, and Ruby highlights.

3. **🏏 CricHeroes Classic Theme** (`cricHeroes`)
   - Vibe: Authentic cricket lawn grass green (`#16A34A`), clean scorecards, high-contrast match ticker.

4. **🌅 Sunset Premier League Theme** (`sunsetIPL`)
   - Vibe: High-voltage T20 carnival under stadium floodlights with Sunset Coral (`#EA580C`) and Midnight Indigo.

5. **🎨 Dynamic Team Identity Theming** (`teamCustom` - Premium Feature)
   - When a match is played, the **entire scoreboard, accents, striker indicators, and badges dynamically adapt in real-time to the current batting team's color and logo** (e.g. CSK Canary Yellow, MI Blue, KKR Purple, RCB Red, IND Navy Blue, AUS Canary Gold)!

---

## 💰 Subscription & Monetization Plans

FanClub offers a transparent, hyper-affordable 3-tier membership model:

| Feature | Free Tier (₹0) | Pro Scorer (₹21 / mo) | Premium VIP (₹51 / mo) |
|---|:---:|:---:|:---:|
| **Live Ball-by-ball Scoring** | ✅ | ✅ | ✅ |
| **Full Batting & Bowling Scorecard** | ✅ | ✅ | ✅ |
| **World Cup Final & Asia Cup Themes** | ✅ | ✅ | ✅ |
| **Interactive 360° Wagon Wheel** | ❌ | ✅ | ✅ |
| **Realistic Hindi/Eng Commentary Feed** | ❌ | ✅ | ✅ |
| **Scorecard WhatsApp Share & Export** | ❌ | ✅ | ✅ |
| **Ad-Free Scoring Experience** | ❌ | ✅ | ✅ |
| **Dynamic Team Color & Logo Theming** | ❌ | ❌ | ✅ |
| **AI Match Win Predictor & Tactics** | ❌ | ❌ | ✅ |
| **Tournament Suite & Points Table (NRR)** | ❌ | ❌ | ✅ |
| **Live Broadcast HUD for OBS / YouTube** | ❌ | ❌ | ✅ |

> **In-App Plan Switcher**: You can switch between Free, Pro, and Premium anytime with the top-right Plan button to test and demo all features instantly.

---

## ⚡ Core Features

- **Live Ball-by-Ball Console**: 0 (Dot), 1, 2, 3, 4 (FOUR), 6 (SIX), Wide, No Ball, Bye, Leg Bye.
- **Wicket Engine**: Bowled, Caught, LBW, Run Out, Stumped, Hit Wicket with immediate incoming batsman selection.
- **Undo Ball Support**: 1-click mistake reversal that restores exact striker, bowler, over, and team totals.
- **Strike Swap**: Quick toggle button to swap striker and non-striker.
- **Target & DLS Equation**: Real-time required run rate (RRR) and balls-remaining ticker.
- **Tournament Leaderboard**: Auto-calculates Net Run Rate (NRR) and standings.
- **OBS Broadcast Overlay**: Clean TV-grade lower third graphics with Chroma green screen toggle for live video streaming.
- **Persistent State**: Matches and plan selections persist in `localStorage`.

---

## 🚀 Cloudflare Pages Deployment Guide

### Step 1: Push Repository to GitHub
```bash
git add .
git commit -m "feat: complete FanClub cricket scoring web app"
git remote add origin https://github.com/<your-username>/fanclub.git
git push -u origin main
```

### Step 2: Connect to Cloudflare Pages
1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**
3. Select your repository `fanclub`
4. Set Build Settings:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Node.js version**: `20` or higher
5. Click **Save and Deploy**.

### Step 3: Configure Custom Domain (`fanclub.srijandev.in`)
1. In your Cloudflare Pages project dashboard, go to the **Custom domains** tab.
2. Click **Set up a custom domain**.
3. Enter `fanclub.srijandev.in` and click **Continue**.
4. Cloudflare automatically configures the CNAME and provisions free SSL/TLS!
