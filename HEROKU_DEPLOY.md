# ☁️ Deploy Victory Predict sou Heroku

## 🔗 Bouton Rapid

[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/kingdevweb78/victory-predict)

## 📋 Etap

### 1️⃣ MongoDB GRATIS

1. https://cloud.mongodb.com → kreye kont
2. "Build a Database" → **M0 FREE**
3. "Database Access" → kreye user/modpas
4. "Network Access" → "Allow Access from Anywhere"
5. "Connect" → "Drivers" → kopye URI

### 2️⃣ Deplwaye

Klike bouton anwo a, ranpli:

- MONGODB_URI → URI MongoDB ou
- GROQ_API_KEY → kle Groq AI ou
- PAIRING_PHONE_NUMBER → nimewo bot (509XXXXXXXX)
- ADMIN_NUMBER → nimewo admin
- JWT_SECRET → sekrè ou

Klike "Deploy App" — tann 2-3 minit.

### 3️⃣ WhatsApp

Logs → pairing code → WhatsApp > Aparèy Konekte > Lyen ak Nimewo Telefòn

### 4️⃣ Dashboard

`https://[app].herokuapp.com/admin`
- admin@victorypredict.com / Admin@123!

## CLI

```bash
heroku create victory-predict-bot
heroku config:set MONGODB_URI="..." GROQ_API_KEY="..." USE_PAIRING_CODE=true PAIRING_PHONE_NUMBER=509XXXXXXXX ADMIN_NUMBER=509XXXXXXXX JWT_SECRET=secret NODE_ENV=production START_BOT=true SEED_DB=true
https://github.com/kingdevweb78/victory-predict.git heroku main
```

🏆 **Victory Predict** | 🇭🇹 KING DEV
