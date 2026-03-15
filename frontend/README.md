# PromptVault — Frontend

A production-ready React frontend for the PromptVault AI Prompt Manager.

## Stack

| Tool | Version |
|------|---------|
| React | 18 |
| Vite | 5 |
| TailwindCSS | 3 |
| React Router | v6 |
| Axios | 1.6 |
| react-hot-toast | 2.4 |
| lucide-react | 0.294 |

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Create your env file
cp .env.example .env
# Edit .env — set VITE_API_URL to your backend URL

# 3. Run dev server
npm run dev
```

The app runs at `http://localhost:5173` by default.

## Environment Variables

```
VITE_API_URL=http://localhost:5000
```

For production, set this to your deployed backend URL (e.g. on Railway or Render).

## Project Structure

```
src/
├── App.jsx                        # Root — routes + providers
├── main.jsx                       # Entry point
├── index.css                      # Design system (149 CSS tokens, light+dark)
│
├── context/
│   ├── AuthContext.jsx            # Auth state, login/register/logout
│   └── ThemeContext.jsx           # Light/dark theme, system preference
│
├── components/
│   ├── common/
│   │   ├── ProtectedRoute.jsx
│   │   ├── Spinner.jsx            # Spinner, MiniSpinner, LoadingDots, PageLoader
│   │   ├── ThemeToggle.jsx        # Sun/Moon toggle button
│   │   └── ViewToggle.jsx         # Grid/List toggle
│   │
│   ├── layout/
│   │   ├── DashboardLayout.jsx    # Sidebar + Navbar shell
│   │   ├── Sidebar.jsx            # Navigation + theme toggle
│   │   └── Navbar.jsx             # Top bar
│   │
│   └── prompts/
│       ├── AIGeneratorModal.jsx   # Generate / Improve / Variations / SmartTags
│       ├── DeleteConfirm.jsx
│       ├── PromptAnalytics.jsx    # Bar charts + donut ring
│       ├── PromptCard.jsx         # Grid card
│       ├── PromptDetail.jsx       # Full-screen modal
│       ├── PromptForm.jsx         # Create / Edit modal
│       ├── PromptListItem.jsx     # List row
│       └── SearchFilter.jsx       # Search + selects
│
├── hooks/
│   ├── useDebounce.js
│   ├── useLocalStorage.js
│   └── usePrompts.js              # All prompt CRUD state
│
├── pages/
│   ├── Landing.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Dashboard.jsx
│   ├── Prompts.jsx
│   ├── Favorites.jsx
│   ├── Analytics.jsx
│   ├── Collections.jsx
│   ├── Explore.jsx
│   └── Profile.jsx
│
├── services/
│   ├── api.js                     # Axios instance + JWT interceptors
│   ├── aiGeneratorService.js      # Groq AI endpoints
│   ├── authService.js
│   ├── promptService.js
│   └── userService.js
│
└── utils/
    └── constants.js               # CATEGORIES, AI_TOOLS, colour maps
```

## Theme System

The design system lives entirely in `src/index.css` as CSS custom properties.
Light/dark switching is done by toggling `data-theme="light|dark"` on `<html>`.

**Key tokens:**

| Token | Purpose |
|-------|---------|
| `--bg-base` | Page background |
| `--bg-surface` | Cards, modals |
| `--bg-subtle` | Inputs, nested surfaces |
| `--bg-muted` | Hover states, dividers |
| `--text-primary` | Headings, body |
| `--text-secondary` | Supporting text |
| `--text-tertiary` | Metadata, placeholders |
| `--accent` | Primary CTAs, links |
| `--sage` | Secondary green accent |
| `--amber` | Tertiary warm accent |
| `--border` | Default borders |
| `--border-strong` | Emphasis borders |

Theme preference is read from `localStorage` on load and falls back to the OS setting (`prefers-color-scheme`).

## Build & Deploy (Vercel)

```bash
npm run build
# Deploy the dist/ folder, or connect the repo to Vercel directly
```

`vercel.json` is included for SPA routing rewrites.

Set the environment variable `VITE_API_URL` in your Vercel project settings.
