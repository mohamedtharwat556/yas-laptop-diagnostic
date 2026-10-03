# YAS Laptop Diagnostic System

نظام فحص أجهزة اللابتوب قبل دخولها إلى الصيانة داخل شركة YAS.

## 🌐 Live Demo

- **Vercel:** https://yas-laptop-diagnostic.vercel.app
- **GitHub:** https://github.com/mohamedtharwat556/yas-laptop-diagnostic

## 📋 Overview

نظام متصفح متخصص في فحص أجهزة اللابتوب باستخدام:
- Browser APIs للاختبارات التفاعلية
- Windows Hardware Agent (اختياري) لمعلومات الهاردوير الحقيقية
- Supabase لحفظ الجلسات والبيانات
- LocalStorage للعمل بدون إنترنت

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    YAS Diagnostic System                 │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
   Client Portal    Admin Portal    Hardware Agent
        │                 │                 │
        └─────────────────┼─────────────────┘
                          │
                    ┌─────┴─────┐
                    │  Session  │
                    │  Service  │
                    └─────┬─────┘
                          │
              ┌───────────┼───────────┐
              │           │           │
        Supabase   LocalStorage   Browser APIs
```

## ✨ Features

### Client Portal
- 📝 جمع بيانات العميل
- 🔍 11 اختبار تشخيصي:
  - فحص الشاشة (تفاعلي)
  - فحص لوحة المفاتيح (تفاعلي)
  - فحص الماوس/Touchpad (تفاعلي)
  - فحص الكاميرا (تفاعلي)
  - فحص الميكروفون (تفاعلي)
  - فحص السماعات (تفاعلي)
  - فحص الشبكة (تلقائي)
  - فحص البطارية (تلقائي)
  - فحص الأداء (تلقائي)
  - فحص التخزين (تلقائي)
  - فحص الرسوميات (تلقائي)
- 📊 ملخص النتائج
- 🖨️ طباعة التقرير

### Admin Portal
- 📋 عرض جميع الجلسات
- 🔍 تفاصيل الجلسة
- ✏️ ملاحظات الفني
- 📈 إحصائيات الفحوصات

### Hardware Agent (اختياري)
- 💻 C#/.NET 8 Windows Application
- 📍 يعمل على `http://127.0.0.1:5275`
- 🔧 جمع معلومات Windows الحقيقية:
  - الشركة المصنعة والموديل
  - نظام التشغيل
  - المعالج (CPU)
  - الذاكرة (RAM)
  - الرسوميات (GPU)
  - التخزين (Physical Disks)
  - البطارية
- 🔒 Local فقط - لا يعتمد على إنترنت

### Supabase Integration
- ☁️ حفظ الجلسات في السحابة
- 🔄 مزامنة البيانات
- 📱 Offline-first behavior
- 🔒 ANON key فقط في Frontend

## 🚀 Quick Start

### Local Development

1. **استنساخ المشروع:**
```bash
git clone https://github.com/mohamedtharwat556/yas-laptop-diagnostic.git
cd tast tharwat
```

2. **تشغيل الخادم المحلي:**
```bash
python -m http.server 8080
```

3. **فتح المتصفح:**
```
http://localhost:8080
```

### Hardware Agent (اختياري)

1. **الدخول إلى مجلد Agent:**
```bash
cd hardware-agent
```

2. **تشغيل Agent:**
```bash
dotnet run --project src/YAS.HardwareAgent
```

3. **التحقق من العمل:**
```
http://127.0.0.1:5275/api/health
http://127.0.0.1:5275/api/hardware
```

### Supabase Setup

1. **إنشاء Supabase Project:**
   - اذهب إلى https://supabase.com
   - أنشئ project جديد

2. **تنفيذ Migration:**
   - افتح SQL Editor في Supabase
   - شغّل `supabase/migrations/001_create_diagnostic_sessions.sql`

3. **إضافة Environment Variables:**
   - في Vercel: Settings → Environment Variables
   - أضف:
     - `SUPABASE_URL`
     - `SUPABASE_ANON_KEY`

## 📁 Project Structure

```
tast tharwat/
├── client/                 # Client Portal
│   ├── index.html         # صفحة البداية
│   ├── diagnostic.html     # صفحة الفحص
│   └── result.html        # صفحة النتائج
├── admin/                  # Admin Portal
│   ├── login.html         # تسجيل الدخول
│   ├── dashboard.html     # لوحة التحكم
│   ├── sessions.html      # قائمة الجلسات
│   └── session-details.html # تفاصيل الجلسة
├── js/                     # JavaScript Files
│   ├── state.js           # إدارة الحالة
│   ├── client.js          # وظائف العميل
│   ├── diagnostic.js      # محرك الفحص
│   ├── admin.js           # وظائف المشرف
│   ├── hardwareAgent.js   # تكامل Agent
│   ├── supabaseClient.js  # Supabase Client
│   ├── sessionService.js  # Session Service
│   └── supabaseConfig.js  # Supabase Config
├── css/                    # Styles
│   ├── style.css          # General Styles
│   ├── client.css         # Client Styles
│   ├── admin.css          # Admin Styles
│   └── responsive.css     # Responsive Styles
├── api/                    # Vercel API Functions
│   └── config.js          # Environment Variables
├── supabase/               # Supabase Files
│   └── migrations/        # Database Migrations
├── hardware-agent/         # C# Hardware Agent
│   ├── src/               # Source Code
│   └── tests/             # Tests
├── docs/                   # Documentation
└── vercel.json            # Vercel Config
```

## 🔧 Technology Stack

### Frontend
- **HTML5** - Structure
- **CSS3** - Styling
- **Vanilla JavaScript** - Logic
- **Supabase JS Client** - Database
- **Browser APIs** - Diagnostics

### Backend (Hardware Agent)
- **C#/.NET 8** - Language
- **ASP.NET Core** - Web API
- **WMI/CIM** - Windows Hardware Info

### Database
- **Supabase (PostgreSQL)** - Cloud Database
- **LocalStorage** - Offline Storage

### Deployment
- **Vercel** - Frontend Hosting
- **Local** - Hardware Agent

## 📊 Diagnostic Tests

### Interactive Tests (User Confirmation Required)
1. **Screen Test** - فحص الشاشة بالألوان (أسود، أبيض، أحمر، أخضر، أزرق)
2. **Keyboard Test** - فحص جميع مفاتيح لوحة المفاتيح
3. **Mouse/Touchpad Test** - فحص حركة الماوس والنقر
4. **Camera Test** - فحص الكاميرا
5. **Microphone Test** - فحص الميكروفون
6. **Speaker Test** - فحص السماعات (يمين/يسار)

### Automatic Tests
1. **Network Test** - فحص الاتصال بالإنترنت
2. **Battery Test** - فحص البطارية
3. **Performance Test** - فحص أداء المتصفح
4. **Storage Test** - فحص مساحة التخزين المتاحة للمتصفح
5. **GPU Test** - فحص WebGL/GPU

## 🔒 Security

- ✅ ANON key فقط في Frontend
- ✅ No service_role في Frontend
- ✅ Environment variables فقط
- ✅ No secrets in Git
- ✅ Hardware Agent local فقط (localhost)
- ⚠️ RLS policies تسمح بالوصول العام (development only)

## 📝 Batch History

### Batch 3
- Device Information collection
- Interactive tests (Screen, Keyboard, Mouse, Camera, Microphone)
- LocalStorage session persistence

### Batch 4
- Speaker test (left/right channels)
- Network test
- Battery test
- Browser performance test
- Storage capability test
- GPU/WebGL test
- Unified test execution

### Batch 5
- Normalized result model
- Test categories and statuses
- Summary engine
- Evidence-based issue extraction
- Customer and technician views
- Arabic customer-facing language

### Batch 6A
- Hardware Agent web client integration
- Device info rendering updates
- Source/confidence tracking
- Agent timeout handling

### Batch 6A-FIX
- Fixed Agent detection hangs
- Fixed timeout handling
- Fixed display issues

### Batch 6B-1
- C#/.NET 8 Hardware Agent foundation
- Windows Hardware Provider abstraction
- Agent endpoints (/api/health, /api/hardware)
- Strongly typed models

### Batch 6B-2a
- Supabase Foundation
- Session Service
- Vercel Integration
- Offline-first behavior
- Async config loading

## 🚧 Future Batches

### Batch 6B-2b (Not Started)
- Agent Detection UI
- Agent Download Page
- Installation verification
- Real Agent integration

### Future
- WMI Collectors (CPU, RAM, GPU, Storage, Battery, Network)
- Windows Installer
- Windows Service
- Auto-start
- AI Analysis (evidence-based only)
- Admin Authentication
- RLS Policies restriction

## 🤝 Contributing

هذا مشروع داخلي لشركة YAS. للمساهمات، يرجى التواصل مع الفريق.

## 📄 License

Proprietary - YAS Internal Use Only

## 👥 Team

- **Mohamed Tharwat** - Project Lead
- **YAS Development Team**

---

© 2026 YAS Laptop Diagnostic System
