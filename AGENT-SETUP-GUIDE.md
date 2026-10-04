# Hardware Agent Setup Guide
## مساعد فحص الجهاز - دليل الإعداد

---

## ⚠️ المشكلة الحالية

الـ **Hardware Agent مش بيشتغل لما تدخل من Vercel** (الموقع الإنتاجي).

### السبب:
- ✅ الـ Agent يعمل على **HTTP** (localhost:5275)
- ✅ الموقع على Vercel يعمل على **HTTPS**
- ❌ المتصفح لا يسمح **Mixed Content** (HTTPS → HTTP)

---

## ✅ الحل النهائي (الطريقة الصحيحة)

### للتطوير المحلي (Development):

1. **شغّل Agent محلياً:**
   ```bash
   cd hardware-agent
   dotnet run
   ```

2. **شغّل الموقع محلياً على HTTP:**
   ```bash
   # استخدم local dev server (مثل python)
   python -m http.server 8000
   # أو اي أداة أخرى
   ```

3. **ادخل على:** `http://localhost:8000` (ليس HTTPS)

### للإنتاج (Production):

**Option A: استخدام الموقع من جهازك (Local)**
```
1. شغّل: python -m http.server 8000
2. ادخل: http://127.0.0.1:8000
3. الـ Agent سيشتغل تلقائياً
```

**Option B: استخدام Vercel + تعديل الأمان**
```
// هذا ليس آمن - للاختبار فقط
1. أضف HTTPS للـ Agent (Self-signed cert)
2. أو استخدم Reverse Proxy (nginx)
3. أو تنزيل الموقع locally
```

---

## 🔧 الخيارات المتاحة الآن

### 1. Browser-Only Mode (الآن متاح)
- ✅ يعمل من Vercel
- ✅ لا يحتاج تثبيت Agent
- ❌ معلومات أقل دقة
- ⏱️ بطيء قليلاً

```javascript
// سيتم استخدام هذا تلقائياً إذا الـ Agent مش متاح
DiagnosticSystem.runWithBrowserOnly();
```

### 2. Hardware Agent Mode (محلي فقط)
- ✅ معلومات دقيقة جداً
- ✅ سريع جداً
- ❌ يحتاج تشغيل Agent
- ❌ يعمل فقط على HTTP محلي

```javascript
// سيتم استخدام هذا إذا الـ Agent متاح
DiagnosticSystem.runWithAgent();
```

### 3. Hybrid Mode (الأفضل - قريباً)
- ✅ استخدم Agent إذا متاح
- ✅ استخدم Browser APIs إذا مش متاح
- ✅ يعمل من Vercel و محلي
- ⏳ جاري التطوير

---

## 🚀 التعليمات للمستخدمين

### للفحص على Vercel (أسهل):
```
1. ادخل: https://yas-laptop-diagnostic.vercel.app
2. الفحص سيعمل بدون تثبيت أي شي
3. النتائج ستكون دقيقة ولكن أبطأ قليلاً
```

### للفحص على جهازك (أسرع و أدق):
```
1. شغّل: python -m http.server 8000
2. ادخل: http://localhost:8000
3. اضغط "Verify Installation"
4. إذا الـ Agent متثبت: سيشتغل تلقائياً
5. النتائج ستكون دقيقة جداً و سريعة
```

---

## 🔐 المشكلة الأمنية (Mixed Content)

### التوضيح:
```
❌ HTTPS website → HTTP localhost:5275 = مرفوع من المتصفح
✅ HTTP website → HTTP localhost:5275 = مسموح
✅ HTTPS website → HTTPS localhost:5275 = مسموح (يحتاج شهادة)
```

### الحل الأمثل (للمستقبل):
1. **تشفير Agent على HTTPS** (يحتاج Self-Signed Certificate)
2. **استخدام Proxy Server** (nginx)
3. **API Gateway** (AWS/Azure)

---

## 📋 خطوات الاختبار

### Test 1: فحص محلي بدون Agent
```
1. فتح http://localhost:8000 
2. زر "Start Diagnostic"
3. النتائج تظهر (بدون Agent)
4. ✓ النتائج من Browser APIs
```

### Test 2: فحص محلي مع Agent
```
1. تشغيل Agent: dotnet run
2. فتح http://localhost:8000
3. زر "Verify Installation" 
4. اضغط "Start Diagnostic"
5. ✓ النتائج من Agent (أدق)
```

### Test 3: فحص من Vercel (بدون Agent)
```
1. فتح https://yas-laptop-diagnostic.vercel.app
2. زر "Start Diagnostic"
3. النتائج تظهر (بدون Agent)
4. ✓ يعمل بنجاح على Vercel
```

---

## 💡 التعديلات المطلوبة

### في hardwareAgent.js:
```javascript
// إضافة خيار لتفعيل/تعطيل Agent حسب الـ environment
const USE_AGENT = window.location.protocol === 'http:' || window.location.hostname === 'localhost';

if (USE_AGENT) {
    HardwareAgent.detectAgent(); // جرب الـ Agent
} else {
    console.log('[Agent] Skipped - HTTPS not compatible with HTTP Agent');
    // استخدم Browser APIs فقط
}
```

---

## 🎯 الخطة الإجمالية

| المرحلة | الحالة | التاريخ |
|--------|--------|--------|
| **Phase 1** | Browser-Only Mode | ✅ جاهز |
| **Phase 2** | Local Agent Mode | ✅ جاهز |
| **Phase 3** | Self-Signed HTTPS | ⏳ قريب |
| **Phase 4** | Hybrid Mode (Auto) | 🔄 جاري |
| **Phase 5** | API Gateway (AWS) | 📋 مخطط |

---

## 📝 ملاحظات

- **الـ Agent يعمل فقط على Windows**
- **يحتاج .NET 8.0 Runtime**
- **محلي فقط (localhost)**
- **آمن - لا يرسل بيانات للسحابة**

---

## 🔗 الروابط المهمة

- 📍 **Development:** http://localhost:8000
- 🌐 **Production:** https://yas-laptop-diagnostic.vercel.app
- 📥 **Download Agent:** /client/download-agent.html
- 📖 **Agent Installer:** /downloads/YAS-Hardware-Agent-Setup/

---

**Last Updated:** October 3, 2026  
**Version:** 1.0.0  
**Status:** In Development

