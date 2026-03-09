# Student Hustle Hub

Student Hustle Hub is a modern campus marketplace where students can offer services, request help, and build trust through ratings and reviews.

## Highlights
- Student accounts with editable profiles
- Buyer/Seller mode switch per user
- Service posting and service editing
- Ratings and reviews for each student provider
- Admin dashboard with usage stats and moderation actions
- Kenyan currency support (KES) and WhatsApp support button

## Project structure
- Frontend pages: `index.html`, `service.html`, `login.html`, `register.html`, `create-service.html`, `dashboard.html`, `admin.html`
- Shared frontend logic: `app.js`, `dashboard.js`, `app.css`
- Backend API: `server.js`, `routes/`, `controllers/`, `models/`, `middleware/`, `config/`

## Run locally
1. Install dependencies:
   - `npm install`
2. Create environment file:
   - `copy .env.example .env`
3. Start backend:
   - `npm run dev` (or `npm start`)
4. Open `index.html` with a local static server (for example VS Code Live Server).

## Deploy
- Frontend: GitHub Pages / Netlify / Vercel (static hosting)
- Backend: Render / Railway / Fly.io / VPS
- Database: MongoDB Atlas or self-hosted MongoDB

## Security checklist
- Keep `.env` private and never commit secrets.
- Use a strong `JWT_SECRET`.
- Restrict `CORS_ORIGINS` to your real frontend domain.
- Use HTTPS for both frontend and backend in production.

## Notes
- Demo mode is available for static hosting and local browser testing.
- Admin and connection settings are intentionally restricted in the UI for safer public deployment.
