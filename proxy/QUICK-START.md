# 🚀 البدء السريع - HTTPS Proxy

**الوقت المتوقع: 5 دقائق**

## الخطوات:

### 1️⃣ افتح PowerShell/CMD

```bash
cd C:\HardwareAgent\proxy
```

### 2️⃣ شغل الـ Setup (يفعل كل شيء تلقائياً)

```bash
setup-all.cmd
```

أو في PowerShell:
```powershell
npm run setup
```

### 3️⃣ اختبر الـ Proxy

```bash
npm test
```

يجب أن ترى ✅ عندما يعمل كل شيء.

### 4️⃣ استخدم من Vercel

```javascript
// بدل
fetch('http://127.0.0.1:5275/api/...')

// استخدم
fetch('https://127.0.0.1:443/api/...')
```

## ✅ نجح إذا رأيت:

```
✅ PASS: Proxy is running
✅ PASS: Proxy status is running
✅ PASS: Request forwarded to Agent
```

## ❌ إذا فشل:

1. **خطأ OpenSSL**: ثبت OpenSSL أو Git Bash
   - https://git-scm.com/download/win

2. **Port 443 مشغول**: أوقف العملية الأخرى
   ```bash
   netstat -ano | findstr :443
   ```

3. **Agent لا يعمل**: شغل Agent أولاً
   ```bash
   C:\HardwareAgent\YAS.HardwareAgent.exe
   ```

4. **Permission denied**: شغل كـ Administrator

## 📝 أوامر مفيدة:

```bash
# تشغيل الـ Proxy
npm start

# اختبار الـ Proxy
npm test

# إعادة إنشاء Certificate
npm run setup:cert

# الإعداد الكامل
npm run setup
```

## 🔗 أمثلة الاستخدام:

### React
```javascript
fetch('https://127.0.0.1:443/api/hardware', {
  method: 'POST',
  body: JSON.stringify(data)
})
```

### Node.js/Next.js
```javascript
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

fetch('https://127.0.0.1:443/api/hardware', { agent })
```

### Axios
```javascript
axios.post('https://127.0.0.1:443/api/hardware', data)
```

### cURL
```bash
curl -k https://127.0.0.1:443/api/health
```

## 📊 Health Endpoints:

```bash
# Health Check
curl -k https://127.0.0.1:443/proxy-health

# Status
curl -k https://127.0.0.1:443/proxy-status
```

## 🛑 الإيقاف:

اضغط `Ctrl+C` في النافذة

## 📚 مزيد من المعلومات:

- **README.md**: دليل شامل
- **SETUP-GUIDE.md**: حل الأخطاء
- **VERCEL-INTEGRATION.md**: أمثلة الكود

---

**جاهز؟ ابدأ مع `setup-all.cmd`**
