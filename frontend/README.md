# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## Password reset configuration

Set these environment variables for the URLs used in reset emails and API requests:

- Backend `.env`: `FRONTEND_URL` must be the browser-accessible frontend origin (for example, `https://shop.example.com`).
- Frontend `.env`: `VITE_BACKEND_URL` must be the backend origin (for example, `https://api.example.com`).
- Backend `.env`: configure `EMAIL_USER` and `EMAIL_APP_PASS` for the account that sends reset emails. `EMAIL_SERVICE` is optional and defaults to Gmail.

For local development, the frontend and backend default to `http://localhost:5173` and `http://localhost:5000`. Vite environment variables are embedded at build time, so rebuild the frontend after changing `VITE_BACKEND_URL`. Do not commit email credentials.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
