# K-Merce Frontend

React + Vite frontend for the K-Merce marketplace.

## Local development

```powershell
npm install
npm run dev
```

The frontend uses `VITE_BACKEND_URL`, defaulting to `http://localhost:5000`.

```text
VITE_BACKEND_URL=http://localhost:5000
```

Build and test:

```powershell
npm test
npm run lint
npm run build
```

Vite environment variables are embedded at build time. Rebuild after changing `VITE_BACKEND_URL`.
