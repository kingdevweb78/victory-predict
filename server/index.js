const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const config = require('./config');
const logger = require('./utils/logger');
const { apiLimiter } = require('./middleware/rateLimiter');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || config.port || 10000;

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' }, contentSecurityPolicy: false }));
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());
if (config.nodeEnv === 'development') app.use(morgan('dev'));
app.use('/api/', apiLimiter);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/health', (req, res) => res.json({ success: true, message: '🏆 Victory Predict — Render Ready!', timestamp: new Date().toISOString(), storage: 'JSON File Store' }));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/predictions', require('./routes/predictionRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/settings', require('./routes/settingRoutes'));
app.use('/webhook', require('./webhook/webhookHandler'));

const adminPath = path.join(__dirname, '../client/admin/build');
if (require('fs').existsSync(path.join(adminPath, 'index.html'))) {
  app.use('/admin', express.static(adminPath));
  app.get('/admin/*', (req, res) => res.sendFile(path.join(adminPath, 'index.html')));
} else {
  app.get('/admin', (req, res) => {
    res.send(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>🏆 Victory Predict — Admin</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:system-ui,-apple-system,sans-serif;background:linear-gradient(135deg,#0f0c29,#302b63,#24243e);min-height:100vh;display:flex;align-items:center;justify-content:center;color:#fff}.card{background:rgba(255,255,255,.08);backdrop-filter:blur(10px);border-radius:20px;padding:40px;width:100%;max-width:400px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.1)}h1{font-size:28px;margin-bottom:8px}h1 span{font-size:36px;display:block;margin-bottom:5px}p{color:#aaa;margin-bottom:25px;font-size:14px}input{width:100%;padding:14px 16px;margin:8px 0;border-radius:12px;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.06);color:#fff;font-size:15px;outline:none;transition:.3s}input:focus{border-color:#6c5ce7;box-shadow:0 0 0 3px rgba(108,92,231,.2)}button{width:100%;padding:14px;margin-top:16px;background:linear-gradient(135deg,#6c5ce7,#a855f7);border:none;border-radius:12px;color:#fff;font-size:16px;font-weight:700;cursor:pointer;transition:.3s}button:hover{transform:translateY(-2px);box-shadow:0 10px 30px rgba(108,92,231,.4)}.link{color:#a855f7;font-size:13px;margin-top:15px;display:block;text-decoration:none}.status{background:rgba(0,255,0,.1);border:1px solid rgba(0,255,0,.2);border-radius:10px;padding:10px;margin-bottom:20px;font-size:13px}.status span{color:#4ade80;font-weight:700}</style></head><body><div class="card"><h1><span>🏆</span>Victory Predict</h1><p>Admin Dashboard 🇭🇹</p><div class="status">🟢 <span>API Live</span> — JSON Storage Active</div><form id="loginForm" onsubmit="return login(event)"><input type="email" id="email" placeholder="📧 admin@victorypredict.com" required><input type="password" id="password" placeholder="🔑 Password" required><button type="submit">🚀 Sign In</button></form><p id="error" style="color:#f87171;margin-top:10px;display:none"></p><a class="link" href="/health">View API Status →</a></div><script>async function login(e){e.preventDefault();const email=document.getElementById('email').value;const pwd=document.getElementById('password').value;const err=document.getElementById('error');try{const r=await fetch('/api/auth/admin-login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,pwd})});const d=await r.json();if(d.success){localStorage.setItem('token',d.token);window.location.href='/admin/dashboard'}else{err.textContent=d.message||'Login failed';err.style.display='block'}}catch(ex){err.textContent='Connection error';err.style.display='block'}}setTimeout(()=>{fetch('/health').then(r=>r.json()).then(d=>console.log('✅ API:',d)).catch(()=>{})},1000)</script></body></html>`);
  });
}

app.get('/', (req, res) => res.json({ success: true, name: '🏆 Victory Predict', version: '2.2.0', storage: 'JSON File Store' }));
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info('Victory Predict v2.2.0 — Render Ready!');
  logger.info('Storage: JSON File Store (No MongoDB!)');
  logger.info('Port: ' + PORT);
});

module.exports = app;
