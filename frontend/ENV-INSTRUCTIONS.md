Instructions to fix "Invalid Host header" when running the frontend locally

1. Why this happens
- The Create React App dev server validates the Host header. If you access the dev server
  from another machine or via an IP address (e.g. http://192.168.x.y:3000) the Host header
  won't be `localhost` and the dev server blocks the request with "Invalid Host header".

2. Quick fix (recommended for local/network testing)
- Create a file named `.env` inside the `frontend/` folder (DO NOT commit `.env`).
- Add these lines to `frontend/.env`:

  HOST=0.0.0.0
  PORT=3000

- Restart the frontend dev server: `cd frontend && npm start`
- You can now access the app at `http://<your-machine-ip>:3000`.

3. Alternate safer option
- Instead of committing `.env`, add the values to your shell when starting:
  - Windows (PowerShell): `set "HOST=0.0.0.0"; npm start`
  - macOS/Linux: `HOST=0.0.0.0 npm start`

4. Security note
- Do NOT commit `.env` to the repository. The repo already ignores `.env` files.
  If you want to share the configuration, use `frontend/.env.example` or this file.
