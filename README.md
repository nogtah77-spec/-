# 🏢 منصة العمودي للتسويق العقاري (Alamoudi Luxury Estate Hub)

> **منصة رقمية عربية متكاملة للتسويق العقاري الفاخر وإدارة العمليات الذكية، مدعومة بمحركات الذكاء الاصطناعي (Gemini Pro)، منظومة واتساب متعددة الموظفين، وحاسبة تمويل تفاعلية، متوافقة كلياً كتطبيق هاتف ذكي (PWA) ومنشورة سحابياً على Vercel.**

---

## 🌟 نظرة عامة على النظام (Architecture Overview)

صُممت المنصة لتلبي احتياجات المكاتب والشركات العقارية الرائدة في الشرق الأوسط، وتجمع بين:
1. **واجهة الزوار والعملاء الفاخرة:** تصفح سريع، فلترة متقدمة ومتطابقة، بحث حي فوري، مقارنة عقارات، واستشارات.
2. **محرك الذكاء الاصطناعي (AI Smart Ingestion & Gemini Pro):** استخراج وتعبئة بيانات العقارات آلياً من الرسائل والإعلانات العشوائية.
3. **منظومة ربط الواتساب للموظفين (Multi-Staff WhatsApp Bot Hub):** استلام العروض وتوزيعها على مسؤولي المبيعات مع ردود فورية مخصصة.
4. **حاسبة التمويل والأقساط المستقلة (Mortgage Calculator):** حساب الأقساط، الفوائد، جدول السداد، والمشاركة المباشرة عبر الواتساب.
5. **لوحة الإدارة والتحكم الشاملة:** إدارة العقارات، العقود، العملاء، الطلبات، التشطيبات، المصادر، الإعلانات، وسجلات النشاط.

---

## 🛠️ حزمة التقنيات المستخدمة (Tech Stack)

- **Frontend & Framework:** React 18, TypeScript, Vite, Wouter (Routing), TanStack Query.
- **Styling & UI:** Tailwind CSS v4, Radix UI Primitives, Lucide Icons, Glassmorphism & Gold/Midnight Theme.
- **AI & Automation:** Google Gemini Pro API Integration + Fast Local Arabic NLP Parser.
- **Data & Storage:** Persistent Client Cache (v4) with Smart Merge Algorithm + REST API connectors.
- **Deployment & PWA:** Vercel Global Edge Network, Service Worker PWA, GitHub CI/CD.

---

## 📁 هيكل المجلدات والملفات (Folder Structure)

```text
Luxury-Estate-Hub/
├── artifacts/
│   └── alamoudi/                  # الكود المصدري للواجهة ولوحة التحكم
│       ├── src/
│       │   ├── components/        # المكونات القابلة لإعادة الاستخدام
│       │   │   ├── admin/         # مكونات لوحة الإدارة والهيدر
│       │   │   ├── ai/            # مكوّن الشات بوت الذكي
│       │   │   ├── layout/        # Navbar, Footer, AdminSidebar, AdminLayout
│       │   │   ├── property/      # كروت العقارات، السلايدر، المقارنة
│       │   │   └── ui/            # مكتبة أزرار ومدخلات Radix UI
│       │   ├── context/           # إدارة الحالة والجلسات
│       │   │   ├── AuthContext.tsx # إدارة تسجيل الدخول وثبات الجلسات الدائمة
│       │   │   └── DataContext.tsx # قاعدة البيانات، العقارات، والمزامنة الذكية
│       │   ├── data/              # البيانات الأساسية وقاعدة العقارات الأولية
│       │   │   └── seedProperties.ts # بنك العقارات الافتراضية
│       │   ├── lib/               # أدوات مساعدة والمحلل الذكي
│       │   │   ├── aiPropertyParser.ts # خوارزمية الذكاء الاصطناعي لاستخراج البيانات
│       │   │   ├── geminiApi.ts        # مكتبة الاتصال بـ Gemini API
│       │   │   ├── qrCodeGenerator.ts  # خوارزمية توليد باركود SVG بدون مكتبات
│       │   │   └── utils.ts            # تنسيق العملات والأرقام
│       │   ├── pages/             # صفحات الموقع ولوحة التحكم
│       │   │   ├── admin/         # صفحات الإدارة (العقارات، الواتساب، الحاسبة، الوكلاء...)
│       │   │   ├── Home.tsx       # الصفحة الرئيسية
│       │   │   └── PropertyDetails.tsx # صفحة تفاصيل العقار
│       │   ├── App.tsx            # موجه المسارات وإعدادات النظام
│       │   └── main.tsx           # نقطة الدخول للتطبيق
│       ├── public/                # الأصول الثابتة والشعار وmanifest.json
│       ├── package.json           # حزم واجهة React
│       └── vite.config.ts         # إعدادات Vite ومسارات البناء (dist)
├── vercel.json                    # إعدادات التوجيه السحابي (SPA Rewrites & dist)
└── package.json                   # إعدادات مساحة عمل pnpm
```

---

## 🚀 التشغيل المحلي والتطوير (Local Development)

### 1. تثبيت الاعتماديات:
```bash
pnpm install
```

### 2. تشغيل السيرفر المحلي للتطوير:
```bash
pnpm --filter @workspace/alamoudi run dev
```
> سيفتح التطبيق على الرابط المحلي: `http://localhost:5173`

### 3. فحص الأخطاء البرمجية والأنماط (Typecheck):
```bash
pnpm --filter @workspace/alamoudi run typecheck
```

### 4. بناء نسخة الإنتاج (Production Build):
```bash
pnpm --filter @workspace/alamoudi run build
```

---

## 🌐 النشر على Vercel و GitHub

المشروع مضبوط تلقائياً للنشر على Vercel بمجرد عمل `git push`:
- **المستودع الرسمي:** `https://github.com/nogtah77-spec/-`
- **الموقع المباشر:** `https://alamoudi-real-estate.vercel.app`
- **إعدادات Vercel:**
  - **Root Directory:** `artifacts/alamoudi` (أو جذر المشروع مع `vercel.json`).
  - **Build Command:** `vite build`
  - **Output Directory:** `dist`

---

## 🔑 بيانات الدخول الإدارية الافتراضية

- **اسم المستخدم:** `saeed` أو `admin` أو `admin@alamoudi.com`
- **كلمة المرور الافتراضية:** `admin1234` أو `123456`
- **فريق العمل الافتراضي:**
  - سعيد العمودي (المدير العام) — `saeed`
  - محمد رمضان (مستشار مبيعات) — `mohamed`
  - نسرين (مستشارة مبيعات) — `nisreen`
  - أحمد سليم (مستشار مبيعات) — `ahmed`

---

## 📄 الترخيص
حقوق الملكية الفكرية محفوظة لشركة **العمودي للتسويق العقاري** © 2026.