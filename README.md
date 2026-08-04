# 🎓 Student Hustle Hub — Campus Marketplace

<p align="center">
  <img src="https://img.shields.io/badge/status-live-brightgreen?style=flat-square" alt="Status">
  <img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="License">
  <img src="https://img.shields.io/badge/frontend-vanilla_JS-yellow?style=flat-square" alt="Frontend">
  <img src="https://img.shields.io/badge/backend-Node.js%20%7C%20Express-339933?style=flat-square&logo=node.js&logoColor=white" alt="Backend">
  <img src="https://img.shields.io/badge/database-MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white" alt="Database">
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square" alt="PRs Welcome">
</p>

<p align="center">
  <strong>A full-stack campus marketplace where students seamlessly switch between buying and selling services.</strong><br>
  Manage the complete order lifecycle — from request to delivery — and build community trust through ratings and reviews.
</p>

<p align="center">
  🔗 <a href="https://student-hustle-hub.vercel.app">https://student-hustle-hub.vercel.app</a>
</p>

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [📁 Project Structure](#-project-structure)
- [🚀 Run Locally](#-run-locally)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [Google Sign-In Setup](#google-sign-in-setup)
  - [Seed Demo Data](#seed-demo-data)
  - [Admin Access](#admin-access)
- [🛡️ Error Handling](#️-error-handling)
- [📈 Performance Optimizations](#-performance-optimizations)
- [📱 PWA & Offline Support](#-pwa--offline-support)
- [🔐 Security](#-security)
- [🔍 SEO & Search Console](#-seo--search-console)
- [🌐 Deployment](#-deployment)
  - [Backend on Render](#backend-on-render)
  - [Frontend on Vercel](#frontend-on-vercel)
  - [Database on MongoDB Atlas](#database-on-mongodb-atlas)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [⭐ Support](#-support)

---

## ✨ Features

### 👤 User Management
- Student accounts with fully editable profiles
- Email/password registration & login
- Google OAuth single sign-on
- Profile photos and bio

### 🔄 Buyer / Seller Mode
- Seamless mode switching per user
- **As a Buyer:** Browse services, place orders, leave reviews
- **As a Seller:** Post services, edit listings, fulfil orders

### 💼 Services Marketplace
- Service posting with descriptions, pricing, and images
- Browse page with search, filters, and sorting for fast discovery
- Detailed service pages with seller info and ratings

### ⭐ Trust & Safety
- Ratings and reviews for each student provider
- Admin dashboard with usage statistics and moderation actions
- Report system for inappropriate content

### 💰 Payment & Contact
- Kenyan Shilling (KES) currency support
- WhatsApp direct messaging with `+254...` number formatting

### 🎨 UI/UX
- **Mobile-first responsive design** — fixed navbar and floating footer
- **Dark mode** — early theme hydration in `<head>` prevents flash during navigation, with full dark mode class synchronization on interactive elements
- **Smooth navigation** — single-page-app feel with traditional HTML pages
- **Loading spinners** — all async form submissions (login, register, create/edit service, profile save) show inline spinners and disable buttons to prevent double-clicks
- **Password strength indicator** — real-time 4-bar visual meter on registration with labels (Weak → Fair → Good → Strong)
- **Back-to-top button** — floating button appears after scrolling 400px, smooth scrolls to top
- **Clear search button** — inline (×) button inside the search input clears and re-fetches results
- **Auto-growing textarea** — description fields expand vertically as the user types
- **Modal Escape key support** — pressing `Esc` closes profile and service edit modals
- **Empty states** — helpful empty state messages with call-to-action buttons on dashboard (services, job history) and browse page
- **Confirmation dialogs** — destructive actions (delete service, cancel job) prompt for confirmation before executing

### 🛡️ Error Handling
- **User-friendly error messages** — technical errors like "Failed to fetch" and "NetworkError" are translated into clear, actionable messages
- **Graceful degradation** — network failures fall back to cached or local data without crashing
- **Loading state safety** — all async operations have guaranteed loading state cleanup, preventing infinite spinners
- **Structured logging** — errors are logged with context prefixes for easy developer debugging
- **Toast notifications** — consistent success/error/info toasts replace disruptive `alert()` dialogs

---

## 🛠️ Tech Stack

| Layer       | Technology                                                                    |
| ----------- | ----------------------------------------------------------------------------- |
| **Frontend**  | HTML5, CSS3, Vanilla JavaScript (no framework)                                |
| **Backend**   | Node.js, Express.js                                                           |
| **Database**  | MongoDB with Mongoose ODM                                                     |
| **Auth**      | bcrypt (passwords), JSON Web Tokens (sessions), Google OAuth 2.0              |
| **Security**  | Helmet, express-rate-limit, express-mongo-sanitize, sanitize-html, morgan     |
| **PWA**       | Service Worker, Web App Manifest, offline-first caching                       |
| **Styling**   | Tailwind CSS (bundled locally), Lucide Icons (bundled locally), Manrope font (bundled locally) |
| **Hosting**   | [Vercel](https://vercel.com) (frontend) + [Render](https://render.com) (backend) |
| **Deploy**    | `netlify.toml` + `render.yaml` for automated deployment                       |

---

## 📁 Project Structure

```
student-hustle-hub/
├── backend/                   # Node.js + Express API server
│   ├── config/                # Database & app configuration
│   ├── controllers/           # Route handler logic
│   ├── middleware/             # Auth, validation, error handling
│   ├── models/                # Mongoose schemas (User, Service, Review, etc.)
│   ├── routes/                # Express route definitions
│   ├── scripts/               # Seed data & admin promotion utilities
│   ├── utils/                 # Helper functions
│   ├── .env.example           # Environment variable template
│   ├── server.js              # API entry point
│   └── package.json
│
├── frontend/                  # Client-side static files
│   ├── assets/                # Images, icons, fonts
│   │   ├── fonts/             # Manrope font files (bundled locally)
│   │   ├── images/            # Background images (bundled locally)
│   │   ├── icons/             # PWA app icons
│   │   └── favicons/          # Favicon files
│   ├── vendor/                # Third-party libraries (bundled locally)
│   │   ├── tailwind.js        # Tailwind CSS runtime (local)
│   │   └── lucide.js          # Lucide icons (local)
│   ├── js/                    # Client-side JavaScript modules
│   │   └── seo.js             # Dynamic SEO metadata injection
│   ├── app.css                # Global stylesheet
│   ├── app.js                 # Shared client logic (error handling, auth, API, UI)
│   ├── config.js              # Frontend configuration (API URL, Google Client ID)
│   ├── sw.js                  # Service Worker (offline caching)
│   ├── manifest.json          # PWA Web App Manifest
│   ├── dashboard.js           # Dashboard page logic
│   ├── home.js                # Homepage logic
│   ├── profile.js             # Profile page logic
│   ├── index.html             # Homepage
│   ├── login.html             # Login page
│   ├── register.html          # Registration page
│   ├── dashboard.html         # User dashboard
│   ├── profile.html           # User profile page
│   ├── service.html           # Service detail page
│   ├── create-service.html    # Create / edit service
│   ├── admin.html             # Admin moderation panel
│   ├── settings.html          # API connection settings
│   ├── guidelines.html        # Community guidelines
│   ├── terms.html             # Terms of service
│   ├── robots.txt             # Crawler instructions
│   └── sitemap.xml            # Search engine sitemap
│
├── scripts/                   # Development helper scripts
├── netlify.toml               # Netlify (or Vercel) deployment config
├── render.yaml                # Render deployment config
├── package.json               # Workspace-level config
└── README.md
```

---

## 🚀 Run Locally

> **Prerequisites:** [Node.js](https://nodejs.org/) 18+ and [MongoDB](https://www.mongodb.com/) (local or Atlas).
>
> You'll need **two terminal windows** — one for the backend and one for the frontend.

### Backend Setup

```sh
cd backend
npm install
copy .env.example .env   # Windows
# or on Mac/Linux: cp .env.example .env
```

Edit `.env` and add your **MongoDB connection string** and a **JWT secret**.

```sh
npm run dev
```

The API starts at **`http://localhost:5000`**.

### Frontend Setup

Open the `frontend/` folder in VS Code and use the **Live Server** extension (or any HTTP server):

```sh
# Option 1: VS Code Live Server (right-click index.html → Open with Live Server)
# Option 2: Use Node.js
cd frontend
npx serve .
```

The site opens — usually at **`http://127.0.0.1:5500`**.

By default, the app connects to `http://localhost:5000`. You can change the API URL on the **settings page** once logged in as admin.

### Google Sign-In Setup

1. Create a **Google OAuth 2.0 Client ID** for a Web Application in the [Google Cloud Console](https://console.cloud.google.com/).
2. Add `http://localhost:5000` and `http://127.0.0.1:5500` to the **Authorized JavaScript origins**.
3. Set the client ID in your environment:
   ```sh
   # backend/.env
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   ```
4. Set it in the frontend config:
   ```js
   // frontend/config.js
   window.SHHub_GOOGLE_CLIENT_ID = 'your-client-id.apps.googleusercontent.com';
   ```
5. Restart the backend and refresh the frontend.

### Seed Demo Data

Populate your local database with sample users and services:

```sh
cd backend
node scripts/seedDemo.js --confirm
```

This adds **3 demo users** and their services (prices KES 200–1000). **It does nothing without `--confirm`.**

### Admin Access

If the **Admin** button doesn't appear in the navbar, promote your account manually:

```sh
cd backend
node scripts/makeAdmin.js --email you@example.com
```

Log out, then log back in to see the admin panel.

---

## 🛡️ Error Handling

The application includes a comprehensive error handling system designed for reliability and user experience:

### Centralized Error Utilities (`frontend/app.js`)

| Utility | Purpose |
|---------|---------|
| `getUserFriendlyErrorMessage(error)` | Translates 22+ technical error patterns into clear, user-friendly messages |
| `logDevError(context, error)` | Logs structured errors with context for developer debugging |
| `isNetworkError(error)` | Detects network-related failures (timeout, fetch failure, CORS, etc.) |
| `withLoading(button, asyncFn)` | Wraps async operations with guaranteed loading state cleanup |

### Error Message Mapping

Technical errors are automatically translated:
- `"Failed to fetch"` → `"Unable to reach the server. Please check your internet connection and try again."`
- `"Request timeout"` → `"The server is taking too long to respond. Please try again."`
- `"Not authenticated"` → `"Please log in to continue."`
- `"Invalid email or password"` → `"The email or password you entered is incorrect."`
- `"Server error"` → `"A server error occurred. Our team has been notified."`

### Graceful Degradation

- **Browse page:** If the API is unreachable, cached/local services are shown instead of a blank page
- **Service details:** Falls back to local data if the API request fails
- **Dashboard:** Network errors silently fall back to cached data; non-network errors show a friendly toast
- **Profile page:** Uses `Promise.allSettled` so one failed API call doesn't break the entire page

---

## 📈 Performance Optimizations

The app includes lightweight performance tweaks with zero UI impact:

- **📦 Browser-side caching** — Public API reads (services, profiles, reviews) are cached in memory for faster repeat loads
- **🔒 Cache headers** — Public endpoints send `private` cache headers so browsers reuse data without exposing it through shared caches
- **🗄️ MongoDB indexes** — Models declare indexes for common query patterns (services, reviews, jobs, reports, admin)
- **⚡ Lean queries** — Read-heavy list/detail endpoints use `.lean()` to reduce server overhead
- **🔄 Cache invalidation** — After create, update, delete, review, or moderation actions, the frontend clears stale cached data
- **⏳ Skeleton loading** — Browse page shows animated skeleton cards while data loads, preventing layout shifts

> **Note:** For production databases with large existing datasets, verify indexes exist in MongoDB Atlas. If auto-index creation is disabled, create equivalent indexes manually.

---

## 📱 PWA & Offline Support

The app is a fully installable Progressive Web App (PWA) with comprehensive offline support:

### 📦 Locally Bundled Assets

All third-party assets are bundled locally — **no CDN dependencies**:

| Asset | Source | Local Path |
|-------|--------|------------|
| **Tailwind CSS** | `cdn.tailwindcss.com` | `frontend/vendor/tailwind.js` |
| **Lucide Icons** | `unpkg.com/lucide@latest` | `frontend/vendor/lucide.js` |
| **Manrope Font** (5 weights) | `fonts.googleapis.com` | `frontend/assets/fonts/` |
| **Background Image** | `images.unsplash.com` | `frontend/assets/images/campus-bg.jpg` |

### 🔄 Service Worker Caching Strategy (`frontend/sw.js`)

| Resource Type | Strategy |
|---------------|----------|
| **Core assets** (22 files) | Pre-cached on install (HTML, CSS, JS, vendor, fonts, images, icons, manifest) |
| **HTML pages** (11 pages) | Network-first with cache fallback (fresh content after deploy) |
| **JS/CSS files** | Network-first with cache fallback (fresh scripts/styles after update) |
| **Font files** | Cache-first (fonts rarely change) |
| **External origins** (Pravatar, etc.) | Network-first with cache fallback (cached on first fetch) |
| **API requests** | Network-only (never cached) |
| **Google OAuth** | Network-only (requires live connection) |

### 🚀 PWA Features

- **Installable** — Web App Manifest with 192x192 and 512x512 icons
- **Standalone display** — App launches in its own window
- **Offline-first** — All static assets load from cache when offline
- **Update prompt** — Users are notified when a new version is available with "Update Now" / "Later" options
- **Theme color** — `#0F766E` brand color for browser UI
- **Portrait orientation** — Optimized for mobile use

### 🧪 Testing Offline

1. Open the app in Chrome/Edge
2. Open **DevTools** → **Application** → **Service Workers**
3. Check **Offline** in the Network tab
4. Reload the page — the app loads fully styled with all icons, fonts, and images

---

## 🔐 Security

This project has been hardened with a comprehensive set of security measures. All fixes were applied **without changing the UI/UX or removing any features**.

### Backend Security

| Protection | Description |
|------------|-------------|
| **Helmet.js** | Sets secure HTTP headers (X-Frame-Options, HSTS, X-Content-Type-Options, Referrer-Policy, etc.) |
| **Rate Limiting** | 6 tiered rate limiters: general (100/min), auth (10/min), login (5/min), admin (30/min), write operations (10/min), email check (5/min) |
| **JWT_SECRET Validation** | Server fails fast at startup if `JWT_SECRET` is missing or under 32 characters |
| **Input Sanitization** | `sanitize-html` strips all HTML tags from `req.body`, `req.query`, and `req.params` to prevent stored XSS |
| **MongoDB Operator Injection Prevention** | `express-mongo-sanitize` blocks `$gt`, `$ne`, `$where`, etc. in user input |
| **CORS Fail-Closed** | If `ALLOWED_ORIGINS` is empty in production, all cross-origin requests are denied |
| **Request Size Limits** | JSON limited to 10MB, URL-encoded limited to 1MB |
| **Structured Logging** | Morgan HTTP request logging in development (dev format) and production (combined format) |
| **Password Complexity** | New passwords require uppercase, lowercase, number, and special character |
| **Schema Maxlengths** | All Mongoose schemas enforce character limits (title 100, description 2000, comment 1000, etc.) |
| **Audit Logging** | All admin actions (promote/demote, suspend, delete user/service/review) are recorded in a dedicated `AuditLog` collection |
| **Dependency Auditing** | `npm audit` reports **0 vulnerabilities** |

### Frontend Security

| Protection | Description |
|------------|-------------|
| **XSS Escaping** | `escapeHtml()` utility on `window.SHHub` applied to ALL user-generated content rendered via `innerHTML` (admin panel, profiles, services, reviews, dashboards) |
| **Hardened CDN Headers** | `netlify.toml` now sets `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security`, and `X-XSS-Protection` for all routes |
| **Removed Hardcoded Secrets** | Google Client ID removed from source code and `render.yaml` — now configured via environment variables only |

### Environment Variables

```sh
# backend/.env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_32_plus_char_random_secret
NODE_ENV=development
ADMIN_EMAILS=admin1@example.com,admin2@example.com
GOOGLE_CLIENT_ID=your_google_oauth_client_id
ALLOWED_ORIGINS=https://student-hustle-hub.vercel.app
```

> **Important:** `JWT_SECRET` must be **at least 32 characters** — the server will refuse to start with a weaker secret.

### Admin Audit Log

Every admin action is now logged to the `AuditLog` MongoDB collection with:
- `adminId` and `adminEmail` — who performed the action
- `action` — what was done (set_admin, suspend_user, delete_service, etc.)
- `targetId` and `targetType` — what was affected
- `details` — additional context
- `timestamp` — when it happened

This provides a complete audit trail for investigating moderation issues.

---

## 🔍 SEO & Search Console

Metadata-focused SEO improvements — no UI changes:

- **Page metadata** — Titles, descriptions, canonical URLs, Open Graph, and Twitter Card tags on every HTML page
- **Structured data** — JSON-LD on the homepage for `WebSite`, `Organization`, and site search
- **Dynamic metadata** — `frontend/js/seo.js` injects listing/profile data into `service.html` and `profile.html`
- **`robots.txt`** — Allows public pages; blocks admin, dashboard, settings, and create-service
- **`sitemap.xml`** — Lists all indexable static pages for crawlers
- **Google Search Console** — HTML meta verification tag on the homepage

After deployment, submit your sitemap:

```
https://student-hustle-hub.vercel.app/sitemap.xml
```

---

## 🌐 Deployment

### Recommended Free Setup

| Service  | What        | Cost  |
| -------- | ----------- | ----- |
| **Render** | Backend API | Free  |
| **Vercel** | Frontend    | Free  |
| **MongoDB Atlas** | Database | Free tier |

#### Backend — Render

1. Connect your GitHub repo → **New Web Service**
2. Set **Root Directory** to `backend`
3. **Build command:** `npm install`
4. **Start command:** `npm start`
5. Add environment variables:
   - `MONGO_URI` — your MongoDB connection string
   - `JWT_SECRET` — a strong random string
   - `ADMIN_EMAILS` — comma-separated admin emails
   - `GOOGLE_CLIENT_ID` — from Google Cloud Console
6. Deploy. Free services may spin down after ~15 min of inactivity.

#### Frontend — Vercel

1. Connect your GitHub repo → **New Project**
2. Set **Root Directory** to `frontend`
3. **Build command:** *(leave empty)*
4. **Output directory:** *(leave default — Vercel auto-detects `frontend`)*
5. Deploy. The project includes a `vercel.json` (or use the default static config).

#### Database — MongoDB Atlas

Ensure your cluster's **Network Access** allows Render to connect. The quickest option: whitelist `0.0.0.0/0` (use a strong database password).

#### Set the API URL

Once Render gives you a URL (e.g. `https://your-service.onrender.com`), update:

```js
// frontend/config.js
window.SHHub_API_BASE_URL = 'https://your-service.onrender.com/api';
window.SHHub_GOOGLE_CLIENT_ID = 'your-google-client-id.apps.googleusercontent.com';
```

Commit and redeploy the frontend.

### Alternative Hosting

- **Frontend:** Netlify, GitHub Pages, Cloudflare Pages
- **Backend:** Railway, Cyclic, Fly.io
- **Database:** MongoDB Atlas (any region)

---

## 🤝 Contributing

Contributions are welcome and appreciated! Here's how to get started:

1. **Fork** the repository
2. **Create a feature branch:** `git checkout -b feature/amazing-feature`
3. **Commit your changes:** `git commit -m 'Add amazing feature'`
4. **Push to the branch:** `git push origin feature/amazing-feature`
5. **Open a Pull Request**

Please make sure your code follows the existing style and all tests pass.

---

## 📄 License

This project is open source and available under the **[MIT License](LICENSE)**.

---

## ⭐ Support

If you find this project useful, please consider:

- ⭐ **Starring** the repository on [GitHub](https://github.com/denismunene2006-lab/student-hustle-hub)
- 🐛 **Reporting issues** if you encounter bugs
- 💡 **Suggesting features** via GitHub Issues.

Your support keeps this project alive and growing! 🎊

---

<p align="center">
  <strong>Built with ❤️ by <a href="https://github.com/denismunene2006-lab">Denis Munene</a></strong>
</p>