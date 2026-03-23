# Student Hustle Hub

Student Hustle Hub is a full-stack campus marketplace allowing students to seamlessly switch between buying and selling services. It manages the complete order lifecycle—from request to delivery—and builds community trust through a robust rating and review system.

 **link**:https://student-hustle-hub.vercel.app
 
## Highlights
- Student accounts with editable profiles
- Buyer/Seller mode switch per user
- Service posting and service editing
- Ratings and reviews for each student provider
- Admin dashboard with usage stats and moderation actions
- Kenyan currency support (KES) and WhatsApp support button

## Project Structure

The project is organized into two main directories: `frontend` and `backend`.

-   `backend/`: Contains the Node.js, Express, and MongoDB server application.
    -   `controllers/`, `middleware/`, `models/`, `routes/`, `config/`
    -   `server.js`: The main entry point for the API.
    -   `package.json`: Backend dependencies.
-   `frontend/`: Contains all the client-side static files (HTML, CSS, JS).
    -   `.html` files for all pages.
    -   `.js` files for client-side logic.
    -   `app.css` for styling.

## Run Locally

You will need two terminal windows open to run both the frontend and backend simultaneously.

### Backend
1.  Navigate to the backend directory:
    ```sh
    cd backend
    ```
2.  Install dependencies:
    ```sh
    npm install
    ```
3.  Create your environment file from the example (use `cp` on Mac/Linux):
    ```sh
    copy .env.example .env
    ```
4.  Update the `.env` file with your MongoDB connection string and a JWT secret.
5.  Start the backend server:
    ```sh
    npm run dev
    ```
    The API will be running on `http://localhost:5000`.

### Optional: Seed Demo Data
If you want sample users/services in your local database, run:
```sh
cd backend
node scripts/seedDemo.js --confirm
```
This adds 3 demo users and services (prices KES 200–1000). It does nothing unless you pass `--confirm`.

### Admin Access (Manual)
If the Admin button does not appear, you can manually promote your account:
```sh
cd backend
node scripts/makeAdmin.js --email you@example.com
```
Then log out and log back in.

### Frontend
1.  Open the `frontend/index.html` file in your browser using a live server extension (like VS Code's "Live Server").
2.  The site will open, likely at `http://127.0.0.1:5500`.
3.  The app will automatically connect to your local backend. If you need to change the API URL, you can do so on the `settings.html` page.

## Deploy

This structure is ideal for deployment.

### Recommended Free Setup (Netlify + Render)
This keeps hosting free and simple.

**Backend (Render – Free Web Service)**
1. Connect your repo on Render and choose **New → Web Service**.
2. Set **Root Directory** to `backend`.
3. Build command: `npm install`
4. Start command: `npm start`
5. Set env vars:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `ADMIN_EMAILS` (comma-separated)
6. Deploy. Render free services can spin down after ~15 minutes of inactivity and resume on the next request.

**Frontend (Netlify – Free)**
1. Connect your repo on Netlify and choose **New site from Git**.
2. Build command: *(leave empty)*
3. Publish directory: `frontend`
4. Deploy. A `netlify.toml` is included to simplify this.

**Set API URL**
1. Once Render gives you a URL (example: `https://your-service.onrender.com`), open:
   - `frontend/config.js`
2. Set:
   ```js
   window.SHHub_API_BASE_URL = 'https://your-service.onrender.com/api';
   ```
3. Commit and redeploy the frontend.

**Database (MongoDB Atlas)**
Ensure your MongoDB Atlas network access allows your Render service to connect. The quickest option is `0.0.0.0/0` (then use a strong password).

---

Alternative options:
- **Frontend:** Vercel or GitHub Pages
- **Backend:** Railway or Render
- **Database:** MongoDB Atlas
---
**Support**
If you like this project, consider giving it a star.
