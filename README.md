# Student Hustle Hub

Student Hustle Hub is a modern campus marketplace where students can offer services, request help, and build trust through ratings and reviews.

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

### Frontend
1.  Open the `frontend/index.html` file in your browser using a live server extension (like VS Code's "Live Server").
2.  The site will open, likely at `http://127.0.0.1:5500`.
3.  Navigate to the settings page (`settings.html`) and set the API URL to `http://localhost:5000/api` to connect to your local backend.

## Deploy

This structure is ideal for deployment.

-   **Frontend:** Deploy the contents of the `frontend/` directory to a static host like Netlify, Vercel, or GitHub Pages.
-   **Backend:** Deploy the contents of the `backend/` directory to a Node.js hosting service like Render or Railway.
-   **Database:** MongoDB Atlas is recommended for a free, managed database.
