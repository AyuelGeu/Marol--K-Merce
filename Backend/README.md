# K-Merce Backend

Express and MongoDB API for authentication, marketplace products, orders, payments, and administration.

## Local development

```powershell
npm install
npm run dev
```

Run tests:

```powershell
npm test
```

## Required environment variables

Create a backend `.env` containing:

```text
NODE_ENV=development
PORT=5000
HOST=127.0.0.1
MONGO_URI=mongodb://localhost:27017/k-merce
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000
JWT_SECRET=replace-with-at-least-32-random-characters
SESSION_SECRET=use-a-different-secret-of-at-least-32-random-characters
```

`JWT_SECRET` and `SESSION_SECRET` must each be at least 32 characters and are required in every environment. The server refuses to start if either value is missing or too short. Generate distinct random values and rotate any secrets that may have been used with the old fallback.

Configure the integrations used by the relevant features:

- Email: `EMAIL_SERVICE`, `EMAIL_USER`, `EMAIL_APP_PASS`
- Google OAuth: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- Facebook OAuth: `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET`, `FACEBOOK_CALLBACK_URL`
- TikTok OAuth: `TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET`
- M-Pesa: `MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET`, `MPESA_PASSKEY`, `MPESA_SHORTCODE`, `MPESA_CALLBACK_URL`, `MPESA_CALLBACK_TOKEN`
- AI chat: `OPENROUTER_API_KEY`, optional `OPENROUTER_MODEL`

`MPESA_CALLBACK_URL` must be the HTTPS callback endpoint, for example `https://api.example.com/api/mpesa/callback`. The backend appends `MPESA_CALLBACK_TOKEN` to the URL path sent to Safaricom; use a random token of at least 32 characters and do not expose it in public configuration.
