# 📑 دليل الملفات - HTTPS Proxy

## 🎯 ابدأ من هنا

1. **[QUICK-START.md](./QUICK-START.md)** ⭐ - **5 دقائق فقط**
   - أسرع طريقة للبدء
   - 4 خطوات فقط
   - للمستخدمين العجلى

2. **[README.md](./README.md)** - دليل شامل
   - شرح المشروع
   - كيفية الاستخدام
   - حل الأخطاء الشائعة

3. **[SETUP-GUIDE.md](./SETUP-GUIDE.md)** - دليل الإعداد التفصيلي
   - خطوات الإعداد الكاملة
   - خيارات متعددة
   - استكشاف الأخطاء المتقدم

4. **[VERCEL-INTEGRATION.md](./VERCEL-INTEGRATION.md)** - أمثلة الكود
   - كيفية الاستخدام من Vercel
   - أمثلة React, Next.js, Node.js
   - أفضل الممارسات

---

## 🚀 الملفات الرئيسية

### Server Files
- **[server.js](./server.js)** - الخادم الرئيسي
  - HTTPS listener على port 443
  - Reverse proxy للـ Hardware Agent
  - CORS handling
  - Error handling

### Configuration & Setup
- **[package.json](./package.json)** - npm dependencies
  - Scripts للتشغيل والاختبار
  - Express و http-proxy

### Certificate Setup (اختر واحد)
- **[setup-all.cmd](./setup-all.cmd)** ⭐ - **الطريقة الموصى بها**
  - Setup كامل تلقائي
  - جرّب عدة طرق إنشاء certificate
  - أسهل للمبتدئين

- **[setup-cert-openssl.cmd](./setup-cert-openssl.cmd)** - OpenSSL
  - إذا كان لديك OpenSSL

- **[setup-cert-mkcert.cmd](./setup-cert-mkcert.cmd)** - mkcert
  - إذا كان لديك mkcert (الأفضل)

- **[setup-cert.ps1](./setup-cert.ps1)** - PowerShell
  - باستخدام Windows Certificate Store
  - متقدم

- **[setup-cert-simple.ps1](./setup-cert-simple.ps1)** - PowerShell بسيط
  - بدون متطلبات إضافية

### Startup Scripts
- **[start-proxy.cmd](./start-proxy.cmd)** - تشغيل الـ Proxy (Batch)
  - التحقق من التبعيات
  - التحقق من Certificates
  - تشغيل الخادم

- **[start-proxy.ps1](./start-proxy.ps1)** - تشغيل الـ Proxy (PowerShell)
  - نفس الوظيفة بـ PowerShell

### Testing & Debugging
- **[test-proxy.js](./test-proxy.js)** - اختبار بدون GUI
  - 5 اختبارات تلقائية
  - تحقق من الـ connectivity
  - تشخيص المشاكل

- **[test.html](./test.html)** - اختبار من المتصفح
  - UI جميلة
  - اختبار الـ proxy من المتصفح
  - رؤية النتائج بصرياً

### Additional Tools
- **[generate-cert.js](./generate-cert.js)** - منشئ Certificates قديم
  - بديل لـ setup scripts
  - للـ Node.js فقط

- **[generate-cert-nodejs.js](./generate-cert-nodejs.js)** - منشئ Certificates محسّن
  - يجرب عدة طرق
  - بدون dependencies خارجية

---

## 📂 هيكل المشروع

```
proxy/
├── 📄 server.js                    # الخادم الرئيسي
├── 📄 package.json                 # npm config
├── 📁 node_modules/                # Dependencies
├── 📁 certs/                       # SSL Certificates (تُنشأ تلقائياً)
│   ├── localhost.crt
│   ├── localhost.key
│   └── localhost.pfx
│
├── 🔧 Startup & Setup
│   ├── setup-all.cmd               # ⭐ Setup شامل
│   ├── setup-cert-openssl.cmd
│   ├── setup-cert-mkcert.cmd
│   ├── setup-cert.ps1
│   ├── setup-cert-simple.ps1
│   ├── start-proxy.cmd             # تشغيل الـ Proxy
│   └── start-proxy.ps1
│
├── 🧪 Testing
│   ├── test-proxy.js               # اختبار CLI
│   └── test.html                   # اختبار Web UI
│
├── 📚 Documentation
│   ├── INDEX.md                    # هذا الملف
│   ├── QUICK-START.md              # ⭐ ابدأ هنا
│   ├── README.md                   # دليل شامل
│   ├── SETUP-GUIDE.md              # دليل تفصيلي
│   └── VERCEL-INTEGRATION.md       # أمثلة الكود
│
└── 🛠️ Advanced
    ├── generate-cert.js
    └── generate-cert-nodejs.js
```

---

## 🎯 استخدام حسب الحالة

### 👶 مستخدم جديد؟
1. اقرأ: [QUICK-START.md](./QUICK-START.md)
2. شغّل: `setup-all.cmd`
3. اختبر: `npm test`

### 🔧 مطور؟
1. اقرأ: [README.md](./README.md)
2. عدّل: [server.js](./server.js)
3. اختبر: [test-proxy.js](./test-proxy.js)

### 🐛 مشاكل؟
1. اقرأ: [SETUP-GUIDE.md](./SETUP-GUIDE.md)
2. شغّل: `npm test`
3. تحقق من: [test.html](./test.html)

### 💻 استخدام من Vercel?
1. اقرأ: [VERCEL-INTEGRATION.md](./VERCEL-INTEGRATION.md)
2. انسخ أحد الأمثلة
3. عدّل الـ URL من `http://127.0.0.1:5275` إلى `https://127.0.0.1:443`

---

## 🚀 أوامر سريعة

```bash
# 📦 إعداد كامل (يفعل كل شيء)
setup-all.cmd

# 🔐 إنشاء Certificates فقط
npm run setup:cert

# ⚙️ تشغيل الـ Proxy
npm start

# 🧪 اختبار الـ Proxy
npm test

# 🔧 PowerShell Setup (متقدم)
npm run setup:cert:ps1

# 📋 mkcert Setup (إذا كان لديك)
npm run setup:cert:mkcert
```

---

## 🌐 URLs بعد التشغيل

بعد `npm start`، استخدم:

```
https://127.0.0.1:443/proxy-health   # Health Check
https://127.0.0.1:443/proxy-status   # Status
https://127.0.0.1:443/api/...        # أي endpoint من Agent
```

---

## ❌ استكشاف الأخطاء

| المشكلة | الحل | الملف |
|--------|-----|------|
| OpenSSL not found | ثبت OpenSSL أو Git Bash | [SETUP-GUIDE.md](./SETUP-GUIDE.md) |
| Port 443 in use | أوقف العملية الأخرى | [SETUP-GUIDE.md](./SETUP-GUIDE.md) |
| Agent not responding | تأكد من تشغيل Agent | [README.md](./README.md) |
| Certificate error | أعد إنشاء certificate | [SETUP-GUIDE.md](./SETUP-GUIDE.md) |
| Permission denied | شغّل كـ Administrator | [SETUP-GUIDE.md](./SETUP-GUIDE.md) |

---

## 📞 Get Help

1. **للأسئلة السريعة:** [QUICK-START.md](./QUICK-START.md)
2. **للمشاكل:** [SETUP-GUIDE.md](./SETUP-GUIDE.md)
3. **للأخطاء الفنية:** [README.md](./README.md)
4. **لأمثلة الكود:** [VERCEL-INTEGRATION.md](./VERCEL-INTEGRATION.md)

---

## 📊 ملخص المشروع

| الميزة | الحالة |
|--------|--------|
| HTTPS على localhost | ✅ |
| Reverse Proxy | ✅ |
| Self-signed Certificate | ✅ |
| CORS Support | ✅ |
| Health Endpoints | ✅ |
| Testing Tools | ✅ |
| Documentation | ✅ |
| Multiple Setup Methods | ✅ |

---

## 🔗 الروابط السريعة

- **مجلد الـ Proxy:** `C:\HardwareAgent\proxy`
- **مجلد الـ Agent:** `C:\HardwareAgent`
- **Vercel Site:** https://yas-laptop-diagnostic.vercel.app

---

## 📝 الإصدار

- **الإصدار:** 1.0.0
- **التاريخ:** يناير 2025
- **الحالة:** ✅ جاهز للاستخدام

---

**اختر وجهتك:**
- 👶 **جديد تماماً؟** → [QUICK-START.md](./QUICK-START.md)
- 📚 **أقرأ التفاصيل؟** → [README.md](./README.md)
- 🔧 **مشاكل؟** → [SETUP-GUIDE.md](./SETUP-GUIDE.md)
- 💻 **أكود؟** → [VERCEL-INTEGRATION.md](./VERCEL-INTEGRATION.md)
