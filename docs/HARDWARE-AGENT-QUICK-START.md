# YAS Hardware Agent - Quick Start Guide
**تشغيل مساعد فحص YAS بسرعة**

---

## ✅ شروط التشغيل

- Windows 10 أو أحدث
- .NET 8 Runtime (أو أحدث)
- المساعد يستمع على `http://127.0.0.1:5275`

---

## 🚀 طريقة التشغيل السريعة

### الطريقة 1: من CMD (الأسهل)

```bash
cd C:\HardwareAgent
YAS.HardwareAgent.exe
```

**النتيجة المتوقعة:**
```
info: Program[0]
      YAS Hardware Agent starting...

info: Program[0]
      Server URL: http://127.0.0.1:5275

info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://127.0.0.1:5275

info: Microsoft.Hosting.Lifetime[0]
      Application started. Press Ctrl+C to shut down.
```

---

### الطريقة 2: تشغيل مباشر

1. اذهب إلى `C:\HardwareAgent`
2. Double-click على `YAS.HardwareAgent.exe`
3. نافذة CMD ستفتح وتظهر الرسائل أعلاه

---

## 🌐 التحقق من الاتصال

### من المتصفح:

```
http://127.0.0.1:5275/api/health
```

**النتيجة المتوقعة:**
```json
{
  "status": "ok",
  "agent": "YAS Hardware Agent",
  "version": "1.0.0"
}
```

### من CMD (PowerShell):

```powershell
Invoke-WebRequest http://127.0.0.1:5275/api/health
```

---

## 📊 الحصول على معلومات الجهاز

### من المتصفح:

```
http://127.0.0.1:5275/api/hardware
```

**النتيجة:** JSON يحتوي على:
- معلومات الحاسوب (الشركة المصنعة، الموديل)
- نظام التشغيل
- المعالج (CPU)
- الذاكرة (RAM)
- بطاقة الرسوميات (GPU)
- التخزين (Disks)
- البطارية
- الشبكة

---

## 🔗 استخدام مع Diagnostic System

1. **شغّل المساعد أولاً:**
   ```bash
   cd C:\HardwareAgent
   YAS.HardwareAgent.exe
   ```

2. **اذهب للموقع:**
   ```
   https://yas-laptop-diagnostic.vercel.app/client/
   ```

3. **ملي البيانات واضغط "بدء الفحص"**

4. **النظام سيكتشف المساعد تلقائياً ويبدأ الفحص**

---

## ⚠️ استكشاف الأخطاء

### الخطأ: "Agent Not Found"

**الحل:**
- تأكد أن المساعد شغّال
- اتأكد من رابط `http://127.0.0.1:5275` من المتصفح
- أعد تشغيل المساعد

### الخطأ: "Permission Required"

**السبب:**
- أنت على HTTPS (Vercel) وتحاول الوصول HTTP (localhost)
- المتصفح يطلب إذن

**الحل:**
- اقبل إذن المتصفح عندما يطلبه
- أو استخدم `http://localhost:8080` للتطوير المحلي

### الخطأ: "Connection Refused"

**الحل:**
- تأكد أن المساعد شغّال (`Now listening on: http://127.0.0.1:5275`)
- أعد تشغيل المساعد
- تأكد من عدم وجود برنامج آخر على المنفذ 5275

---

## 📝 تسجيل الدخول

المساعد يطبع معلومات مهمة:

```
info: Program[0]
      YAS Hardware Agent starting...
```

**البحث عن أخطاء:**
- ابحث عن `error:` أو `Exception`
- اقرأ الرسالة واطلب دعم

---

## 🛑 إيقاف المساعد

**في نافذة CMD:**
```
Ctrl + C
```

أو أغلق نافذة CMD مباشرة.

---

## 📦 الملفات المطلوبة

```
C:\HardwareAgent\
├── YAS.HardwareAgent.exe      ← البرنامج الرئيسي
├── YAS.HardwareAgent.dll      ← مكتبة البرنامج
├── appsettings.json           ← إعدادات CORS
├── ... (ملفات DLL أخرى)
└── runtimes\                  ← مكتبات النظام
```

---

## 🔧 إعدادات متقدمة

### تغيير CORS Origins

في `appsettings.json`:

```json
{
  "AllowedOrigins": [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://yas-laptop-diagnostic.vercel.app",
    "http://localhost:8080"  ← أضفها للتطوير المحلي
  ]
}
```

### تغيير المنفذ

```json
{
  "Urls": "http://127.0.0.1:5275"  ← غيّر الرقم هنا
}
```

---

## 📱 للاستخدام الدائم (Windows Service)

سيتم شرح هذا في Batch 6B-2c.

للآن: شغّل المساعد يدويًا عند الحاجة.

---

## ✅ Checklist التشغيل

- [ ] فتحت نافذة CMD
- [ ] ذهبت إلى `C:\HardwareAgent`
- [ ] شغّلت `YAS.HardwareAgent.exe`
- [ ] رسالة "Now listening on: http://127.0.0.1:5275" ظهرت
- [ ] اختبرت `http://127.0.0.1:5275/api/health` في المتصفح
- [ ] استجاب بـ JSON صحيح
- [ ] ذهبت لـ https://yas-laptop-diagnostic.vercel.app/client/
- [ ] ملأت البيانات وضغطت "بدء الفحص"
- [ ] النظام اكتشف المساعد تلقائياً ✓

---

**الآن أنت جاهز للفحص الكامل!** 🚀
