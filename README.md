# D-Fence Warranty Management System

Warranty Management Application for Paint Protection Film (PPF), Wrap, and Window Filming services operated by Wheelspa Private Limited under the **D-Fence** brand.

## Stack Overview
- **Backend**: FastAPI (Python), Motor (Async MongoDB), ReportLab (PDF), PyJWT, SendGrid.
- **Frontend**: React 19, Tailwind CSS, Radix UI / Shadcn, Recharts, Axios.

---

## Environment Configuration

### Backend Configuration (`backend/.env`)

| Variable | Description | Local Dev Default | Production Example |
|---|---|---|---|
| `MONGO_URL` | MongoDB connection string | `mongodb://localhost:27017` | `mongodb+srv://user:pass@cluster.mongodb.net` |
| `DB_NAME` | Database name | `dfence_db` | `dfence_prod_db` |
| `JWT_SECRET` | Secret key for signing JWT tokens (**REQUIRED**) | `dfence-warranty-secret-key-2026` | `<generate-strong-random-key>` |
| `FRONTEND_URL` | Base URL of frontend (used for QR code URLs & emails) | `http://localhost:3000` | `https://warranty.d-fence.com` |
| `CORS_ORIGINS` | Allowed CORS origins (comma-separated or `*`) | `*` | `https://warranty.d-fence.com` |
| `SENDGRID_API_KEY` | SendGrid API key for certificate emails | `your_sendgrid_key_here` | `SG.xxxxxxxx...` |
| `SENDER_EMAIL` | Sender address for emails | `noreply@yourdomain.com` | `certificates@d-fence.com` |

> **Note on `FRONTEND_URL` Deployment**:
> The `FRONTEND_URL` is baked into the QR codes stored in MongoDB during warranty creation. Always set `FRONTEND_URL` to your live domain before registering production warranties, otherwise QR codes will point to `localhost`.

### Frontend Configuration (`frontend/.env`)

| Variable | Description | Local Dev Default | Production Example |
|---|---|---|---|
| `REACT_APP_BACKEND_URL` | Base URL for FastAPI backend | `http://localhost:8000` | `https://api.d-fence.com` |

---

## Running Locally

### Backend Setup
1. `cd backend`
2. `python -m venv venv`
3. `venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Linux/Mac)
4. `pip install -r requirements.txt`
5. Copy `.env.example` to `.env` and fill in values.
6. `uvicorn server:app --reload --port 8000`

### Frontend Setup
1. `cd frontend`
2. `npm install` (or `yarn install`)
3. Copy `.env.example` to `.env` and set `REACT_APP_BACKEND_URL`.
4. `npm start`
