# 🚀 PromptVault — AI Prompt Manager

A production-ready full-stack application for saving, organizing, and managing AI prompts across ChatGPT, Claude, Midjourney, and more.

---

## 📁 Project Structure

```
ai-prompt-manager/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js     # Register, Login
│   │   ├── userController.js     # Profile CRUD
│   │   └── promptController.js   # Prompt CRUD + extras
│   ├── middleware/
│   │   ├── auth.js               # JWT protect middleware
│   │   ├── errorHandler.js       # Global error handler
│   │   └── validation.js         # express-validator rules
│   ├── models/
│   │   ├── User.js               # User schema
│   │   └── Prompt.js             # Prompt schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   └── promptRoutes.js
│   ├── utils/
│   │   └── generateToken.js      # JWT token helper
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── ProtectedRoute.jsx
│   │   │   │   └── Spinner.jsx
│   │   │   ├── layout/
│   │   │   │   ├── DashboardLayout.jsx
│   │   │   │   ├── Navbar.jsx
│   │   │   │   └── Sidebar.jsx
│   │   │   └── prompts/
│   │   │       ├── DeleteConfirm.jsx
│   │   │       ├── PromptCard.jsx
│   │   │       ├── PromptForm.jsx
│   │   │       └── SearchFilter.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Auth state + actions
│   │   ├── hooks/
│   │   │   └── usePrompts.js     # Prompt state management
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Favorites.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Prompts.jsx
│   │   │   └── Register.jsx
│   │   ├── services/
│   │   │   ├── api.js            # Axios instance + interceptors
│   │   │   ├── authService.js
│   │   │   ├── promptService.js
│   │   │   └── userService.js
│   │   ├── utils/
│   │   │   └── constants.js      # Categories, tools, colors
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── PromptVault_API.postman_collection.json
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ai-prompt-manager
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🛠️ Installation & Setup

### Prerequisites
- Node.js v18+
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### 1. Clone & Install

```bash
# Install backend dependencies
cd backend
cp .env.example .env
# Edit .env with your values
npm install

# Install frontend dependencies
cd ../frontend
cp .env.example .env
npm install
```

### 2. Run Locally

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev    # Development with nodemon
# or
npm start      # Production
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

The app will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

---

## 📡 API Reference

### Auth Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |

### User Endpoints (🔒 Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/profile` | Get profile |
| PUT | `/api/user/profile` | Update profile |

### Prompt Endpoints (🔒 Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/prompts` | Get all prompts (with filters) |
| POST | `/api/prompts` | Create prompt |
| GET | `/api/prompts/:id` | Get single prompt |
| PUT | `/api/prompts/:id` | Update prompt |
| DELETE | `/api/prompts/:id` | Delete prompt |
| PUT | `/api/prompts/favorite/:id` | Toggle favorite |
| POST | `/api/prompts/duplicate/:id` | Duplicate prompt |
| GET | `/api/prompts/stats` | Get dashboard stats |

### Query Parameters for GET /api/prompts
```
?search=react          # Search title, tags, category
?category=Coding       # Filter by category
?aiTool=ChatGPT        # Filter by AI tool
?sort=newest           # newest | oldest | favorites
?isFavorite=true       # Only favorites
?tags=react,ai         # Filter by tags (comma-separated)
```

---

## 🧪 Postman Collection

Import `PromptVault_API.postman_collection.json` into Postman.

The collection auto-saves your JWT token after login via a test script — no manual copy-pasting needed.

---

## 🚀 Deployment

### Backend (Railway / Render / Heroku)

```bash
# Set environment variables in your hosting platform:
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/promptvault
JWT_SECRET=your_production_secret_min_32_chars
JWT_EXPIRE=7d
NODE_ENV=production
CLIENT_URL=https://your-frontend-domain.com
```

**Railway:**
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

**Render:** Connect GitHub repo, set root directory to `backend`, build command `npm install`, start command `npm start`.

### Frontend (Vercel / Netlify)

```bash
# Vercel
npm install -g vercel
cd frontend
vercel --prod

# Netlify
cd frontend
npm run build
# Deploy the dist/ folder
```

**Set environment variable:**
```
VITE_API_URL=https://your-backend-url.com/api
```

**Vercel — vercel.json for SPA routing:**
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## 📈 Scaling for Production

### Database
- **MongoDB Atlas** with replica sets for high availability
- **Indexes** already set on `userId`, `createdAt`, `isFavorite`, text search on `title` and `tags`
- Use **MongoDB Atlas Search** for advanced full-text search at scale
- Implement **cursor-based pagination** for large datasets (add `limit` + `cursor` params)

### Backend
- **Horizontal scaling** with PM2 cluster mode: `pm2 start server.js -i max`
- **Redis** for session caching and rate limiting
- **Rate limiting** with `express-rate-limit` + Redis store
- **Helmet.js** for security headers
- **Compression** middleware for response compression
- Use **environment-specific configs** (dev/staging/prod)

### Frontend
- **Code splitting** with React.lazy + Suspense per route
- **CDN** for static assets (CloudFront, Cloudflare)
- **Service Worker** for offline support and caching
- **Virtualized lists** (react-window) for large prompt lists

### Monitoring
- **Sentry** for error tracking
- **Datadog / New Relic** for APM
- **Morgan** for HTTP request logging
- **Health check endpoint** at `/api/health`

### Security
- Rotate `JWT_SECRET` regularly
- Implement refresh tokens for long sessions
- Add 2FA via TOTP
- Input sanitization with `express-mongo-sanitize`
- HTTPS enforced via reverse proxy (Nginx)

---

## ✨ Features

- ✅ JWT Authentication (register, login, persistent sessions)
- ✅ Full CRUD for AI Prompts
- ✅ Copy Prompt to Clipboard
- ✅ Favorite / Unfavorite system
- ✅ Duplicate prompts
- ✅ Tags system (add, edit, delete, search by tag)
- ✅ Search by title, tag, category
- ✅ Filter by AI tool, category, favorites
- ✅ Sort by newest, oldest, favorites
- ✅ Dashboard with real-time stats
- ✅ Category color coding
- ✅ Toast notifications
- ✅ Axios interceptors for auth + error handling
- ✅ Protected routes
- ✅ Responsive design
- ✅ Loading, empty, and error states
- ✅ Delete confirmation modal
- ✅ Profile management (name, email, password)

---

## 🛡️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TailwindCSS, React Router v6 |
| State | Context API, Custom Hooks |
| HTTP | Axios with interceptors |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcryptjs |
| Validation | express-validator |
| Notifications | react-hot-toast |
