# DealerPulse

A real-time performance dashboard for a 5-branch dealership network — built
with Next.js, TypeScript, Tailwind CSS, and Recharts. See `DECISIONS.md` for
the product/design writeup.

---

## 1. Install the tools you need (one-time setup)

You need two things: **Node.js** (to run/build the app) and **VS Code** (to
edit it). If you already have both, skip to step 2 — just confirm your Node
version with step 1.3.

### 1.1 Install Node.js

1. Go to **https://nodejs.org** in your browser.
2. Download the **LTS** version (it'll say something like "20.x.x LTS" —
   always pick LTS, not "Current").
3. Run the downloaded `.msi` installer. Click Next through the wizard,
   accepting the defaults.
4. Finish the install and **restart your computer** (Windows sometimes
   doesn't pick up the new PATH variable until you do).

### 1.2 Install VS Code

1. Go to **https://code.visualstudio.com**.
2. Download for Windows, run the installer, accept defaults.
3. During install, check the box for **"Add to PATH"** if offered — lets
   you type `code .` from a terminal to open a folder.

### 1.3 Confirm everything is installed correctly

1. Open **VS Code**.
2. Open its built-in terminal: menu bar → **Terminal → New Terminal** (or
   press `Ctrl+backtick`).
3. In that terminal, type:
   ```
   node -v
   npm -v
   ```
   Press Enter after each. You should see version numbers (e.g. `v20.11.0`
   and `10.2.4`). If you see "not recognized as an internal or external
   command," Node didn't install correctly or you skipped the restart —
   go back to step 1.1.

---

## 2. Get the project into VS Code

You were given a folder called **dealerpulse** (or a `dealerpulse.zip` —
if it's zipped, right-click it in File Explorer → **Extract All...** first).

1. Open **VS Code**.
2. Menu bar → **File → Open Folder...**
3. Browse to and select the `dealerpulse` folder (the one containing
   `package.json`, `src`, `public`, etc. — not a parent folder that just
   contains it).
4. Click **Select Folder**. VS Code will reload with the project open —
   you should see `src`, `public`, `package.json` etc. in the Explorer
   panel on the left.

---

## 3. Install project dependencies

This project's own code is small, but it depends on packages (React,
Next.js, Tailwind, Recharts) that live in `node_modules`, which is **not**
included in what you were given — you install them yourself, once.

1. Open the built-in terminal again (`Ctrl+backtick`) — make sure it
   opened *inside* the `dealerpulse` folder (the terminal prompt should
   show the folder name).
2. Run:
   ```
   npm install
   ```
3. This downloads everything the project needs. It can take 1–3 minutes
   depending on your internet connection. You'll see a progress bar and
   then a summary like "added 420 packages." Some deprecation warnings in
   yellow/orange text are normal and safe to ignore.

If this step fails with a network error, check your internet connection
and firewall/antivirus (corporate networks sometimes block npm's registry).

---

## 4. Run it locally

1. In the same terminal, run:
   ```
   npm run dev
   ```
2. Wait for output like:
   ```
   Next.js 15.x.x
   - Local:  http://localhost:3000
   Ready in 1.2s
   ```
3. Open your browser and go to **http://localhost:3000**. You should see
   the DealerPulse overview dashboard.
4. To stop the server, click back into the VS Code terminal and press
   `Ctrl+C`.

**Making changes:** with `npm run dev` running, any file you save in
`src/` automatically reloads the page in your browser. This is the mode
you'll use while exploring or tweaking the code.

---

## 5. Project structure — where everything lives

```
dealerpulse/
├── src/
│   ├── app/
│   │   ├── page.tsx              <- Overview page (route: /)
│   │   ├── layout.tsx            <- Root HTML layout, wraps every page
│   │   ├── globals.css           <- Design tokens (colors, fonts) + Tailwind
│   │   ├── branch/[branchId]/
│   │   │   └── page.tsx          <- Branch drill-down (route: /branch/B1 etc.)
│   │   └── rep/[repId]/
│   │       └── page.tsx          <- Rep drill-down (route: /rep/SR1 etc.)
│   ├── components/                <- All reusable UI pieces
│   │   ├── AppShell.tsx           <- Sidebar nav + page frame
│   │   ├── TimeRangeControl.tsx   <- The month-range filter
│   │   ├── KpiCard.tsx
│   │   ├── InsightsPanel.tsx      <- The "needs attention" cards
│   │   ├── FunnelChart.tsx
│   │   ├── BranchTable.tsx
│   │   ├── RepTable.tsx
│   │   ├── LeadAgingTable.tsx
│   │   ├── LostReasonList.tsx
│   │   ├── MonthlyTrendChart.tsx  <- Recharts bookings-vs-target chart
│   │   ├── SourceBreakdownChart.tsx
│   │   └── AttainmentBar.tsx
│   ├── lib/
│   │   ├── types.ts               <- TypeScript types matching the JSON shape
│   │   ├── data.ts                <- Loads the JSON, lookup maps, formatters
│   │   ├── metrics.ts             <- ALL the analytics: funnel, KPIs, targets,
│   │   │                              stale leads, insights engine
│   │   └── time-range-context.tsx <- Global time-range filter (React Context)
│   └── data/
│       └── dealership_data.json  <- Your dataset, bundled into the app
├── package.json                   <- Dependency list + npm scripts
├── DECISIONS.md                   <- Product/design writeup
└── README.md                       <- This file
```

**If you want to change something:**
- Change a number/metric definition -> `src/lib/metrics.ts`
- Change what's on the overview page -> `src/app/page.tsx`
- Change colors/fonts -> `src/app/globals.css` (the `:root { --paper: ...}`
  block at the top)
- Add a new chart or table -> create a new file in `src/components/`, then
  import and use it in the relevant `page.tsx`

---

## 6. Deploying to Vercel 

Vercel is the company that makes Next.js, and deploying a Next.js app to
it is a two-minute, no-config process.

### Option A -- GitHub (recommended, easiest to keep updating)

1. **Create a GitHub account** at https://github.com if you don't have one.
2. **Create a new empty repository** on GitHub (click the `+` top-right ->
   "New repository"). Name it `dealerpulse`. Don't initialize it with a
   README (you already have one).
3. Back in VS Code's terminal, run these one at a time (replace the URL
   in the last line with the one GitHub shows you after creating the repo):
   ```
   git init
   git add .
   git commit -m "Initial DealerPulse dashboard"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/dealerpulse.git
   git push -u origin main
   ```
   (If `git` isn't recognized, install it from https://git-scm.com/download/win
   first, then restart VS Code.)
4. Go to **https://vercel.com**, sign up/log in with your GitHub account.
5. Click **Add New... -> Project**, select your `dealerpulse` repo, click
   **Import**.
6. Leave all settings at their defaults (Vercel auto-detects Next.js) and
   click **Deploy**.
7. Wait ~1-2 minutes. Vercel gives you a live URL like
   `https://dealerpulse-yourname.vercel.app` -- that's your submission link.

### Option B -- Vercel CLI (no GitHub needed)

1. In the VS Code terminal:
   ```
   npm install -g vercel
   vercel login
   ```
   (follow the prompts -- it opens a browser to confirm login)
2. Then:
   ```
   vercel
   ```
   Answer the prompts (accept defaults -- "Link to existing project?" -> No,
   project name -> accept default, directory -> `./`).
3. For a permanent production URL, run:
   ```
   vercel --prod
   ```
4. It prints your live URL directly in the terminal.

---

## 7. Common problems

| Problem | Fix |
|---|---|
| `'npm' is not recognized...` | Node.js isn't installed or PATH wasn't refreshed -- reinstall Node, then restart your PC. |
| `npm install` hangs or fails | Check your internet connection; if on a corporate/school network, try a different network or a personal hotspot. |
| Port 3000 already in use | Another app is using it. Run `npm run dev -- -p 3001` instead, then open `http://localhost:3001`. |
| Blank page / errors in browser | Check the VS Code terminal for red error text -- it usually names the exact file and line. |
| Changes not showing up | Make sure `npm run dev` is still running in the terminal; hard-refresh the browser with `Ctrl+Shift+R`. |
