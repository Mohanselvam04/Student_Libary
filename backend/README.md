Setup and where to paste credentials

1) Create backend `.env`
- Copy `backend/.env.example` to `backend/.env` and fill in real values.
- Required: `MONGODB_URI` and `JWT_SECRET`.

2) Install and run
```powershell
cd backend
npm install
# development (auto-restart):
npm run dev
# or production:
npm start
```

3) Common notes
- The DB connector is `backend/db.js` (uses `MONGODB_URI`).
- Models live in `backend/models/` (`User.js`, `Course.js`, `Material.js`, `Message.js`).
- Auth endpoints: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` (send header `Authorization: Bearer <token>`).

If you want me to create the actual `backend/.env` file with values you provide, tell me the values and I will add it (be careful with secrets).
