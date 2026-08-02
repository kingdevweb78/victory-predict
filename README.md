# ⚽ Victory Predict — Premium WhatsApp Football Prediction Bot

<p align="center">
  <img src="https://img.shields.io/badge/Version-1.0.0-green?style=for-the-badge" alt="Version"/>
  <img src="https://img.shields.io/badge/Node.js-18%2B-brightgreen?style=for-the-badge" alt="Node.js"/>
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="License"/>
</p>

---

**Victory Predict** is a complete, production-ready WhatsApp football prediction bot powered by AI. It offers match predictions, live scores, league tables, team statistics, VIP subscriptions, group management, and a beautiful admin dashboard — all accessible through WhatsApp.

Built with ❤️ by **KING DEV** 🇭🇹

---

## ✨ Features

### 🤖 WhatsApp Bot
- 15+ user commands accessible via `.` prefix
- Works in private chat and WhatsApp groups
- AI-powered football match predictions
- Automatic group management (anti-spam, anti-link, anti-flood, bad word filter)
- Welcome/goodbye messages for groups
- Payment screenshot processing

### 🔮 AI Prediction Engine
- Analyzes: team form, H2H, goals scored/conceded, clean sheets, win rate, attack/defense strength
- Generates: match winner, double chance, over 1.5/2.5/3.5, BTTS, correct score, confidence %
- Powered by **Groq AI** (Llama 3.1 70B)

### 📊 Live Match Data
- Today's fixtures, Live scores, Recent results, League standings, Team statistics, Head-to-head history
- Powered by **API-Football**

### 💎 VIP Subscription System
- **Weekly**: 1,500 HTG (7 days) | **Monthly**: 4,500 HTG (30 days)
- Payment via MonCash or NatCash
- Screenshot verification workflow with Admin approval/rejection
- Automatic expiry and renewal reminders

### 🎨 Admin Dashboard
- Modern dark theme with green + gold accents | Glassmorphism UI
- Fully responsive (mobile + desktop)
- Pages: Dashboard, Users, VIP Members, Payments, Predictions, Groups, Notifications, Analytics, Settings
- Real-time stats and charts (Recharts) | Payment approval/rejection | Broadcast messages | Revenue analytics

### 🌐 Multi-Language: 🇭🇹 Haitian Creole (default) | 🇺🇸 English | 🇫🇷 French

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 18+ |
| Framework | Express.js |
| Database | MongoDB (Mongoose) |
| WhatsApp | Baileys |
| AI | Groq API (Llama 3.1 70B) |
| Football Data | API-Football (v3) |
| Admin Frontend | React 18 + Tailwind CSS |
| Charts | Recharts |
| Auth | JWT |
| Deployment | Railway / Docker |

---

## 📁 Project Structure

```
victory-predict/
├── server/
│   ├── config/         # Configuration
│   ├── database/       # MongoDB connection & seed
│   ├── models/         # Mongoose models (9 models)
│   ├── services/       # AI, Football API, Payment, Notification
│   ├── bot/            # WhatsApp bot & command handler
│   ├── middleware/      # Auth, rate limiting, error handling
│   ├── routes/          # API routes (11 route files)
│   ├── webhook/         # Webhook handler
│   └── index.js         # Server entry point
├── client/admin/        # React admin dashboard
├── Dockerfile
├── railway.toml
└── README.md
```

---

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/kingdevweb78/victory-predict.git
cd victory-predict
npm install
cd client/admin && npm install && cd ../..
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your MongoDB URI, Groq API key, Football API key, etc.
```

### 3. Seed & Start
```bash
SEED_DB=true npm start        # Creates admin user
START_BOT=true npm run dev    # Dev mode with bot
```

### 4. Scan QR Code
When the bot starts, scan the QR code with WhatsApp (Linked Devices).

**Server:** http://localhost:3000 | **Admin:** http://localhost:3001/admin
**Login:** admin@victorypredict.com / Admin@123!

---

## 💬 Bot Commands

| Command | Description |
|---------|-------------|
| `.menu` | Show main menu |
| `.predict Barcelona vs Real Madrid` | AI match prediction |
| `.matches` | Today's fixtures |
| `.results` | Recent results |
| `.stats Barcelona` | Team statistics |
| `.table premier league` | League standings |
| `.vip` | VIP info |
| `.subscribe` | Subscribe to VIP |
| `.weekly` / `.monthly` | Choose plan |
| `.status` | Account status |
| `.profile` | Your profile |
| `.language [ht/en/fr]` | Change language |
| `.help` | Show all commands |
| `.contact` | Contact admin |

---

## 🚢 Deploy on Railway

1. Push to GitHub
2. Go to [Railway](https://railway.com) → New Project → Deploy from GitHub
3. Select `kingdevweb78/victory-predict`
4. Add environment variables from `.env.example`
5. Deploy!

Or with Docker:
```bash
docker build -t victory-predict .
docker run -d --name victory-predict -p 3000:3000 --env-file .env victory-predict
```

---

## 📡 API Endpoints

**Auth:** `POST /api/auth/login` | `GET /api/auth/me`
**Users:** `GET/PUT /api/users` | `GET /api/users/stats`
**Payments:** `GET /api/payments` | `PUT /api/payments/:id/approve` | `PUT /api/payments/:id/reject`
**Predictions:** `GET /api/predictions` | `POST /api/predictions/generate` | `GET /api/predictions/stats`
**Matches:** `GET /api/matches/today` | `GET /api/matches/live`
**Admin:** `GET /api/admin/dashboard` | `GET /api/admin/analytics`
**Webhook:** `GET/POST /webhook`

---

## 🔐 Security
- JWT authentication | bcrypt password hashing | Rate limiting
- Helmet.js headers | Input validation | Webhook signature verification

---

## 👑 Author
**KING DEV** 🇭🇹 — [github.com/kingdevweb78](https://github.com/kingdevweb78)

---

<p align="center">⚽ Made with ❤️ in Haiti 🇭🇹</p>
