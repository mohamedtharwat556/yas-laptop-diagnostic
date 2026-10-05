# HTTPS Reverse Proxy for Hardware Agent

يوفر هذا المشروع reverse proxy HTTPS على `localhost:443` يعيد توجيه الطلبات إلى Hardware Agent على `127.0.0.1:5275`.

## 🎯 الهدف

حل مشكلة HTTPS → HTTP على localhost:
- متصفح الويب يمنع الوصول من HTTPS إلى HTTP على localhost
- الحل: إضافة HTTPS proxy يستمع على 127.0.0.1:443 ويرسل للـ Agent على 5275

## ✨ المميزات

- ✅ HTTPS على localhost:443
- ✅ Reverse proxy آلي للـ Hardware Agent
- ✅ Self-signed certificate مدعوم
- ✅ CORS headers تلقائية
- ✅ Health check endpoints
- ✅ تشغيل بسيط وسهل

## 📋 المتطلبات

1. **Node.js** (v14+)
   - Download: https://nodejs.org

2. **OpenSSL** (اختياري لكن موصى به)
   - Windows: https://slproweb.com/products/Win32OpenSSL.html
   - أو استخدم Git Bash الذي يتضمن OpenSSL

3. **Hardware Agent** يعمل على `127.0.0.1:5275`

## 🚀 البدء السريع

### الخيار 1: استخدام Batch Script (الأسهل)

```bash
start-proxy.cmd
```

سيقوم بـ:
1. فحص Node.js
2. تثبيت Dependencies
3. إنشاء Self-signed Certificate
4. تشغيل الـ Proxy

### الخيار 2: خطوة بخطوة

```bash
# 1. تثبيت Dependencies
npm install

# 2. إنشاء Certificate (اختر واحد)

# باستخدام OpenSSL (الأفضل)
setup-cert-openssl.cmd

# أو باستخدام PowerShell (متقدم)
powershell -ExecutionPolicy Bypass -File setup-cert.ps1

# 3. تشغيل الـ Proxy
npm start
# أو
node server.js
```

## 🔐 إعداد SSL Certificate

### الطريقة 1: OpenSSL (موصى به)

```bash
setup-cert-openssl.cmd
```

**المتطلبات:**
- OpenSSL في PATH أو Git Bash

### الطريقة 2: PowerShell

```powershell
powershell -ExecutionPolicy Bypass -File setup-cert.ps1
```

**الملاحظات:**
- قد يطلب Administrator privileges
- يستخدم Windows Certificate Store

### الطريقة 3: إنشاء يدوي

إذا لم تعمل الطرق السابقة:

```bash
# باستخدام Git Bash أو WSL
openssl req -x509 -newkey rsa:2048 -keyout certs/localhost.key -out certs/localhost.crt -days 365 -nodes -subj "/CN=localhost"
```

## 🧪 الاختبار

بعد التشغيل، جرب التالي:

### 1. Health Check
```bash
curl -k https://127.0.0.1:443/proxy-health
```

**النتيجة المتوقعة:**
```json
{
  "status": "ok",
  "message": "HTTPS Proxy is running",
  "uptime": 123.456,
  "proxyConfig": {
    "listeningOn": "https://127.0.0.1:443",
    "forwardingTo": "http://127.0.0.1:5275"
  }
}
```

### 2. Hardware Agent Endpoint
```bash
curl -k https://127.0.0.1:443/api/health
```

### 3. من Vercel

استخدم هذا الـ URL:
```
https://127.0.0.1:443
```

مثال:
```javascript
const response = await fetch('https://127.0.0.1:443/api/hardware', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ /* data */ })
});
```

## 📂 هيكل الملفات

```
proxy/
├── server.js                 # الخادم الرئيسي
├── package.json             # Dependencies
├── setup-cert.ps1           # إعداد Certificate (PowerShell)
├── setup-cert-openssl.cmd   # إعداد Certificate (OpenSSL)
├── start-proxy.cmd          # Script بدء التشغيل
├── generate-cert.js         # Generator قديم (اختياري)
├── certs/                   # مجلد Certificates
│   ├── localhost.crt        # Certificate
│   ├── localhost.key        # Private Key
│   └── localhost.pfx        # PFX Export (إن وجد)
└── README.md                # هذا الملف
```

## ⚙️ التكوين

لتغيير الإعدادات، عدّل `server.js`:

```javascript
// Configuration
const PROXY_HOST = '127.0.0.1';      // اترك كما هو
const PROXY_PORT = 443;              // HTTPS port
const TARGET_HOST = '127.0.0.1';     // Hardware Agent host
const TARGET_PORT = 5275;            // Hardware Agent port
```

## 🔗 Endpoints

- `https://127.0.0.1:443/proxy-health` - Health check
- `https://127.0.0.1:443/proxy-status` - Status endpoint
- `https://127.0.0.1:443/*` - جميع الطلبات الأخرى توجه للـ Agent

## 🐛 استكشاف الأخطاء

### خطأ: "Port 443 already in use"
```bash
# ابحث عن العملية التي تستخدم Port 443
netstat -ano | findstr :443

# أغلق العملية (استبدل PID برقم العملية)
taskkill /PID <PID> /F
```

### خطأ: "Certificate not found"
```bash
# أعد إنشاء الـ Certificate
setup-cert-openssl.cmd
# أو
powershell -ExecutionPolicy Bypass -File setup-cert.ps1
```

### خطأ: "Permission denied"
- تأكد أن الـ Proxy يعمل كـ Administrator
- Port 443 يتطلب تصاريح عالية

### الـ Proxy يعمل لكن لا يتصل بـ Agent
```bash
# تحقق من أن Hardware Agent يعمل
curl http://127.0.0.1:5275/api/health

# تحقق من Ports
netstat -ano | findstr :5275
```

## 📊 السجلات

الـ Proxy يطبع السجلات مع كل طلب:

```
[2024-01-15T10:30:45.123Z] GET /api/health
[2024-01-15T10:30:46.456Z] POST /api/hardware
[2024-01-15T10:30:47.789Z] OPTIONS /api/config
```

## 🛑 الإيقاف

اضغط `Ctrl+C` في النافذة التي يعمل فيها الـ Proxy.

## 🔄 التشغيل التلقائي (Advanced)

### كـ Windows Service

يمكنك إضافة الـ Proxy كـ Windows Service:

```bash
# استخدم pm2 لتشغيل الـ Proxy كـ Service
npm install -g pm2

pm2 start server.js --name "https-proxy" --cwd "C:\HardwareAgent\proxy"
pm2 save
pm2 startup
```

### كـ Task Scheduler

1. افتح Task Scheduler
2. Create Basic Task
3. Set trigger: At startup
4. Set action: Start program `C:\HardwareAgent\proxy\start-proxy.cmd`

## 📝 الملاحظات

- الـ Certificate تنتهي صلاحيتها بعد سنة واحدة
- Browser قد يعطي تحذير عن Certificate لأنه Self-signed (طبيعي)
- استخدم `-k` مع curl لتجاوز عدم ثقة الـ Certificate

## 📞 المساعدة

إذا واجهت مشاكل:

1. تحقق من أن Node.js مثبت: `node --version`
2. تحقق من أن npm مثبت: `npm --version`
3. احذف `node_modules` و `certs` وأعد التشغيل من جديد
4. تأكد من تشغيل الـ Proxy كـ Administrator

## 📄 الترخيص

هذا المشروع للاستخدام الداخلي.

---

**آخر تحديث:** يناير 2025
