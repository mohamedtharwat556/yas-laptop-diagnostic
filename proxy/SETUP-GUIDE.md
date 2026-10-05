# دليل الإعداد الشامل - HTTPS Proxy

## 🚀 البدء السريع (3 خطوات)

### الخطوة 1: تثبيت OpenSSL (الأساسي)

هذه خطوة واحدة مرة واحدة فقط.

**الخيار A: Git Bash (الأسهل والأسرع)**
- اذهب إلى: https://git-scm.com/download/win
- ثبت Git Bash
- ثم أعد فتح PowerShell/CMD

**الخيار B: Win32 OpenSSL**
- اذهب إلى: https://slproweb.com/products/Win32OpenSSL.html
- ثبت `Win32 OpenSSL v3.x Light`
- اختر: "Copy OpenSSL DLLs to the Windows system directory"

**الخيار C: mkcert (الأحدث)**
- اذهب إلى: https://github.com/FiloSottile/mkcert/releases
- حمل آخر release (mkcert-v1.x.x-windows-amd64.exe)
- ضع الملف في مجلد يكون في PATH أو ضع الـ path يدويًا

### الخطوة 2: إنشاء Certificate

```bash
# اختر واحدة من هذه:

# إذا استخدمت Git Bash/OpenSSL
setup-cert-openssl.cmd

# أو إذا استخدمت mkcert
setup-cert-mkcert.cmd

# أو باستخدام PowerShell (متقدم)
powershell -ExecutionPolicy Bypass -File setup-cert.ps1
```

### الخطوة 3: تشغيل الـ Proxy

```bash
start-proxy.cmd
```

جاهز! الـ Proxy يعمل الآن على `https://127.0.0.1:443`

---

## 🔐 تفاصيل إنشاء Certificate

### ما هو Certificate؟

- **Certificate (.crt)**: شهادة توثيق الموقع
- **Private Key (.key)**: مفتاح سري يستخدم للتشفير

كلاهما مطلوب لتشغيل HTTPS.

### التحقق من Certificate

```bash
# بعد الإنشاء، تحقق من وجود الملفات:
dir C:\HardwareAgent\proxy\certs

# يجب أن ترى:
# - localhost.crt
# - localhost.key
```

### إعادة إنشاء Certificate

إذا حدث خطأ:

```bash
# احذف الملفات القديمة
cd C:\HardwareAgent\proxy\certs
del localhost.crt localhost.key

# أعد الإنشاء
cd ..
setup-cert-openssl.cmd
```

---

## 🧪 الاختبار

بعد التشغيل:

### 1. اختبر الـ Proxy نفسه

```bash
curl -k https://127.0.0.1:443/proxy-health
```

**يجب أن ترى:**
```json
{
  "status": "ok",
  "message": "HTTPS Proxy is running",
  ...
}
```

### 2. اختبر الـ Hardware Agent

```bash
# تأكد أن Agent يعمل أولاً
curl http://127.0.0.1:5275/api/health

# ثم اختبر عبر الـ Proxy
curl -k https://127.0.0.1:443/api/health
```

### 3. اختبر من Vercel (من المتصفح)

```javascript
// في console Vercel
fetch('https://127.0.0.1:443/api/hardware', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ ... })
})
.then(r => r.json())
.then(console.log)
.catch(console.error)
```

---

## 🆘 استكشاف الأخطاء

### ❌ Error: "openssl: not found"

**الحل:**
1. ثبت OpenSSL من أحد الخيارات أعلاه
2. أعد فتح PowerShell/CMD
3. جرب `where openssl` للتأكد
4. أعد تشغيل Setup

### ❌ Error: "Port 443 already in use"

```bash
# ابحث عن العملية
netstat -ano | findstr :443

# أوقف العملية (استبدل PID برقم)
taskkill /PID <PID> /F

# ثم أعد التشغيل
start-proxy.cmd
```

### ❌ Error: "Access is denied" (Permission denied)

**الحل:**
1. فتح PowerShell كـ Administrator
2. ثم تشغيل `start-proxy.cmd`

أو استخدم هذا الأمر:

```powershell
# Run as Administrator
powershell -Command "Start-Process cmd -ArgumentList '/c start-proxy.cmd' -Verb RunAs"
```

### ❌ Proxy يعمل لكن لا يتصل بـ Agent

```bash
# تحقق من أن Agent يعمل
curl http://127.0.0.1:5275/api/health

# إذا فشل، ابدأ Agent أولاً ثم الـ Proxy
```

### ❌ Certificate Error في المتصفح

**طبيعي!** لأن الـ Certificate self-signed.

- استخدم `-k` مع curl لتجاهل التحذير
- في المتصفح، اضغط "Advanced" و "Proceed anyway"
- للـ API، استخدم `rejectUnauthorized: false`

---

## 🔄 Advanced Configuration

### تغيير Ports

عدّل `server.js`:

```javascript
const PROXY_PORT = 8443;        // بدل 443
const TARGET_PORT = 5275;       // لا تغيره عادة
```

ثم أعد التشغيل.

### استخدام Certificate موجود

إذا كان لديك certificate وkey بالفعل:

```bash
# انسخ الملفات
copy your-cert.crt C:\HardwareAgent\proxy\certs\localhost.crt
copy your-key.key C:\HardwareAgent\proxy\certs\localhost.key

# ثم شغل الـ Proxy
npm start
```

### Logging والـ Debugging

الـ Proxy يطبع كل طلب:

```
[2024-01-15T10:30:45.123Z] GET /api/health
[2024-01-15T10:30:46.456Z] POST /api/hardware
```

لحفظ السجلات:

```bash
# في PowerShell
npm start | Tee-Object -FilePath "proxy.log"

# أو في CMD
npm start > proxy.log 2>&1
```

---

## 📊 Endpoints

بعد التشغيل:

| URL | الوصف |
|-----|------|
| `https://127.0.0.1:443/proxy-health` | Health check |
| `https://127.0.0.1:443/proxy-status` | Current status |
| `https://127.0.0.1:443/*` | جميع الـ requests تذهب للـ Agent على 5275 |

---

## ⏹️ الإيقاف والبدء

### إيقاف الـ Proxy
- اضغط `Ctrl+C` في نافذة الـ Proxy

### البدء مجدداً
```bash
cd C:\HardwareAgent\proxy
npm start
```

### التشغيل تلقائي (Windows)

#### باستخدام pm2:
```bash
npm install -g pm2
pm2 start server.js --name "https-proxy"
pm2 startup
pm2 save
```

#### باستخدام Task Scheduler:
1. افتح Task Scheduler
2. Create Basic Task
3. Trigger: At startup
4. Action: Start program: `C:\HardwareAgent\proxy\start-proxy.cmd`

---

## 🎯 Checklist النهائي

- [ ] Node.js مثبت: `node --version`
- [ ] npm dependencies: `npm list` (يجب أن ترى express و http-proxy)
- [ ] OpenSSL متاح: `where openssl` (أو mkcert)
- [ ] Certificates موجودة: `dir certs` (يجب أن ترى .crt و .key)
- [ ] Proxy يعمل: `npm start` (بدون أخطاء)
- [ ] Health check يعمل: `curl -k https://127.0.0.1:443/proxy-health`
- [ ] Agent متصل: `curl -k https://127.0.0.1:443/api/health`

---

## 📞 التواصل والمساعدة

إذا استمرت المشاكل:

1. تحقق من أن كل tools مثبتة:
   - Node.js: https://nodejs.org
   - OpenSSL أو Git Bash
   
2. احذف كل شيء و أعد التشغيل:
   ```bash
   cd C:\HardwareAgent\proxy
   del /Q certs\* node_modules\*
   npm install
   setup-cert-openssl.cmd
   npm start
   ```

3. تحقق من السجلات والأخطاء

---

**آخر تحديث:** يناير 2025
