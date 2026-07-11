# 🎓 Student Hustle Hub — Campus Marketplace💡.

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
- [📈 Performance Optimizations](#-performance-optimizations)
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
- **Dark mode** — early theme hydration in `<head>` prevents flash during navigation
- **Smooth navigation** — single-page-app feel with traditional HTML pages

---

## 🛠️ Tech Stack

| Layer       | Technology                                                                    |
| ----------- | ----------------------------------------------------------------------------- |
| **Frontend**  | HTML5, CSS3, Vanilla JavaScript (no framework)                                |
| **Backend**   | Node.js, Express.js                                                           |
| **Database**  | MongoDB with Mongoose ODM                                                     |
| **Auth**      | bcrypt (passwords), JSON Web Tokens (sessions), Google OAuth 2.0              |
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
│   ├── js/                    # Client-side JavaScript modules
│   │   └── seo.js             # Dynamic SEO metadata injection
│   ├── app.css                # Global stylesheet
│   ├── app.js                 # Shared client logic
│   ├── config.js              # Frontend configuration (API URL, Google Client ID)
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
│   ├── settings.html          # User settings
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

## 🚀 Run Locally🚀

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

By default, the app connects to `http://localhost:5000`. You can change the API URL on the **settings page** once logged in.

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

## 📈 Performance Optimizations

The app includes lightweight performance tweaks with zero UI impact:

- **📦 Browser-side caching** — Public API reads (services, profiles, reviews) are cached in memory for faster repeat loads
- **🔒 Cache headers** — Public endpoints send `private` cache headers so browsers reuse data without exposing it through shared caches
- **🗄️ MongoDB indexes** — Models declare indexes for common query patterns (services, reviews, jobs, reports, admin)
- **⚡ Lean queries** — Read-heavy list/detail endpoints use `.lean()` to reduce server overhead
- **🔄 Cache invalidation** — After create, update, delete, review, or moderation actions, the frontend clears stale cached data

> **Note:** For production databases with large existing datasets, verify indexes exist in MongoDB Atlas. If auto-index creation is disabled, create equivalent indexes manually.

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

## 🤝🫡Contributing

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

Your support keeps this project alive and growing!🔥🎊

---

<p align="center">
  <strong>Built with ❤️ by <a href="https://github.com/denismunene2006-lab">Denis Munene</a></strong>
</p>
