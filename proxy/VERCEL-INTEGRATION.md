# تكامل HTTPS Proxy مع Vercel

دليل استخدام HTTPS Proxy من تطبيق Vercel.

## 🔗 استخدام الـ Proxy

بدلاً من الوصول مباشرة إلى `http://127.0.0.1:5275`، استخدم:

```
https://127.0.0.1:443
```

## 💻 أمثلة الكود

### 1. Fetch API (JavaScript/TypeScript)

```javascript
// ❌ قديم - HTTPS blocks HTTP على localhost
fetch('http://127.0.0.1:5275/api/hardware', {
  method: 'POST',
  body: JSON.stringify(data)
})

// ✅ جديد - استخدم HTTPS Proxy
fetch('https://127.0.0.1:443/api/hardware', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
})
```

### 2. بدون التحقق من Certificate (Development)

```javascript
// أثناء التطوير، Certificate self-signed قد يسبب مشاكل
// هذا يعتمد على إعدادات المتصفح

// في الخادم (Node.js/Next.js)
import https from 'https';

const agent = new https.Agent({
  rejectUnauthorized: false // فقط للـ Development!
});

const response = await fetch('https://127.0.0.1:443/api/hardware', {
  method: 'POST',
  agent, // استخدم الـ agent
  body: JSON.stringify(data)
});
```

### 3. Next.js API Route

```javascript
// pages/api/hardware-endpoint.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // استخدم HTTPS Proxy
    const response = await fetch('https://127.0.0.1:443/api/hardware', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...req.headers
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
}
```

### 4. React Component

```javascript
import { useState } from 'react';

export default function HardwareComponent() {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkHardware = async () => {
    setLoading(true);
    setError(null);

    try {
      // استخدم HTTPS Proxy
      const response = await fetch('https://127.0.0.1:443/api/hardware', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          // بيانات المشروع
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setStatus(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={checkHardware} disabled={loading}>
        {loading ? 'Loading...' : 'Check Hardware'}
      </button>

      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {status && <pre>{JSON.stringify(status, null, 2)}</pre>}
    </div>
  );
}
```

### 5. Axios

```javascript
import axios from 'axios';

// Create instance with default base URL
const api = axios.create({
  baseURL: 'https://127.0.0.1:443',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Bypass certificate validation for development
api.defaults.httpsAgent = new (require('https').Agent)({
  rejectUnauthorized: false
});

// استخدام الـ API
export async function checkHardware(data) {
  const response = await api.post('/api/hardware', data);
  return response.data;
}
```

### 6. Testing (Jest/Vitest)

```javascript
describe('Hardware API Integration', () => {
  it('should connect to hardware agent via proxy', async () => {
    const response = await fetch('https://127.0.0.1:443/proxy-health', {
      // في tests، قد تحتاج لتعطيل عدم ثقة الـ certificate
    });

    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(data.status).toBe('ok');
  });

  it('should call hardware endpoint', async () => {
    const response = await fetch('https://127.0.0.1:443/api/hardware', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test: true })
    });

    expect(response.ok).toBe(true);
  });
});
```

## ⚙️ متغيرات البيئة

إذا أردت أن تكون القاعدة URL ديناميكية:

### في Vercel

```bash
# .env.local أو Vercel Environment Variables
NEXT_PUBLIC_HARDWARE_PROXY=https://127.0.0.1:443
NEXT_PUBLIC_HARDWARE_API=https://127.0.0.1:443/api/hardware
```

### الاستخدام

```javascript
const proxyUrl = process.env.NEXT_PUBLIC_HARDWARE_PROXY;
const apiUrl = `${proxyUrl}/api/hardware`;

fetch(apiUrl, {
  method: 'POST',
  body: JSON.stringify(data)
})
```

## 🌐 CORS والـ Headers

الـ Proxy يضيف CORS headers تلقائياً:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

لا تحتاج لإضافة headers إضافية في العادة.

## ⚠️ Certificate Warnings

### في المتصفح

1. يمكنك رؤية تحذير: "Your connection is not private"
2. اضغط "Advanced" ثم "Proceed to 127.0.0.1 (unsafe)"
3. (هذا فقط للـ development!)

### في Node.js/Next.js

للـ development، يمكنك تعطيل عدم ثقة الـ certificate:

```javascript
const https = require('https');

const agent = new https.Agent({
  rejectUnauthorized: false // ⚠️ فقط للـ Development!
});

fetch(url, { agent })
```

**لا تستخدم هذا في الـ production!**

## 🔄 الاتصالات من خلال الـ Proxy

### مثال كامل

```javascript
// services/hardwareService.js

const PROXY_URL = 'https://127.0.0.1:443';

class HardwareService {
  static async checkHealth() {
    const response = await fetch(`${PROXY_URL}/api/health`);
    return response.json();
  }

  static async submitData(data) {
    const response = await fetch(`${PROXY_URL}/api/hardware`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return response.json();
  }

  static async getConfig() {
    const response = await fetch(`${PROXY_URL}/api/config`);
    return response.json();
  }
}

export default HardwareService;
```

## 📊 Debugging

### في Browser Console

```javascript
// اختبر الـ connection
fetch('https://127.0.0.1:443/proxy-health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)

// تحقق من الـ Status
fetch('https://127.0.0.1:443/proxy-status')
  .then(r => r.json())
  .then(console.log)
```

### في Network Tab

1. افتح DevTools (F12)
2. اذهب إلى Network tab
3. قم بـ request للـ API
4. تحقق من:
   - Status code (200)
   - Response headers (CORS headers موجودة)
   - Response body

## 🚀 الـ Deployment

للـ production، قد تحتاج:

1. Certificate حقيقي (لا self-signed)
2. Domain name بدلاً من 127.0.0.1
3. Server على شبكة خارجية

مثال:

```javascript
// production
const apiUrl = process.env.HARDWARE_API_URL || 'https://hardware.company.local/api/hardware';

fetch(apiUrl, {
  method: 'POST',
  body: JSON.stringify(data)
})
```

---

## 📝 ملاحظات مهمة

1. **الـ Proxy يعمل فقط على localhost**: لا يمكن الوصول له من خارج الجهاز
2. **Certificate self-signed**: لا تستخدمه في الـ production
3. **Port 443 يتطلب Admin**: تأكد من تشغيل الـ Proxy كـ Administrator
4. **إعادة التشغيل**: إذا تم إيقاف Proxy أو Agent، الاتصالات ستفشل

---

**آخر تحديث:** يناير 2025
