# Student Hustle Hub

Campus marketplace for student services with:
- Static frontend (`index.html`, `service.html`, `login.html`, `register.html`, `create-service.html`, `dashboard.html`, `settings.html`)
- Node + Express + MongoDB backend API (`server.js`, `routes/`, `controllers/`, `models/`)

## 1) Run backend locally

1. Install packages:
   - `npm install`
2. Copy env:
   - `copy .env.example .env`
3. Update `.env` values:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `CORS_ORIGINS` (comma-separated list of frontend origins)
4. Start server:
   - `npm run dev`
   - or `npm start`

Health check:
- `GET /api/health`

## 2) Frontend modes

The static frontend supports two modes:

- **API mode (recommended)**: uses backend auth + services API.
- **Demo mode**: localStorage fallback for static-only hosting.

API mode is enabled only after you set an API URL.

You can configure API URL from UI:
- Open `settings.html`
- Save your backend URL (for example `http://localhost:5000/api` or `https://your-api-domain/api`)

To point the frontend to another backend URL, open browser console and run:
- `localStorage.setItem('shhub_api_base_url', 'https://your-api-domain/api')`

Clear it with:
- `localStorage.removeItem('shhub_api_base_url')`

## 3) API endpoints

### Auth
- `POST /api/auth/register`
  - body: `{ name, email, password, university, course }`
- `POST /api/auth/login`
  - body: `{ email, password }`
- `GET /api/auth/me` (Bearer token)
- `PUT /api/auth/me` (Bearer token)
  - body (any subset): `{ name, email, university, course, image, whatsappNumber, bio, marketMode }`

### Services
- `GET /api/services?keyword=&category=&listingType=`
- `POST /api/services` (Bearer token)
  - body: `{ title, description, category, listingType, price, contactInfo }`
- `GET /api/services/my-services` (Bearer token)
- `GET /api/services/:id`
- `PUT /api/services/:id` (Bearer token; owner only)
- `DELETE /api/services/:id` (Bearer token; owner only)

## 4) Data model updates included

- `User` now supports:
  - `whatsappNumber`
  - `bio`
  - `marketMode` (`buyer` | `seller`)
- `Service` now supports:
  - `listingType` (`buyer` | `seller`)
  - `price` treated as KES amount (numeric)

## 5) Deploy

### Static frontend
You can host HTML/CSS/JS on:
- GitHub Pages
- Netlify
- Vercel static

### Backend API
Deploy Node + MongoDB on:
- Render / Railway / Fly.io / VPS

After backend deploy:
1. Set `CORS_ORIGINS` to your frontend domain.
2. Set frontend API base URL (`shhub_api_base_url`) to deployed API URL.
