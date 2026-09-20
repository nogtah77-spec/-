# معمارية التخزين الهجين (Supabase للبيانات + Cloudinary للصور) والحذف النظيف الشامل

## 1. السياق والمشكلة السابقة (Context & Previous Bottleneck)
- واجهت المنصة سابقاً مشكلة انتهاء الحصة الشهرية (Quota Exceeded) في حساب Supabase المجاني القديم بسبب استهلاك الباندويث ونقل البيانات (Egress) وحجم التخزين الناتج عن حفظ واستعراض صور العقارات المتعددة داخل قاعدة البيانات مباشرة.
- تسبب ذلك في تقييد خوادم Supabase للطلبات، مما أدى إلى حجب استرجاع العقارات وصورها وظهور الموقع كأنه ناقص البيانات.

## 2. القرارات المعمارية المعتمدة (Architectural Decisions)

### أ. الفصل المعماري التام (Separation of Concerns):
1. **قاعدة بيانات Supabase:**
   - مخصصة حصراً للنصوص، الأرقام، المواصفات، والحقول الهيكلية، بالإضافة إلى روابط الصور السحابية.
   - تم ربط المشروع الجديد النظيف:
     - URL: `https://inuouzvmujxjjzfxinvk.supabase.co`
     - الحساب المنظم: `saeed.2098@hotmail.com's Org`
     - تم تفعيل سياسات الأمان RLS الكاملة لجميع الجداول العشرة.

2. **سحابة Cloudinary للصور:**
   - نقل كافة ملفات وسائط وصور العقارات إلى شبكة التوصيل السريع (CDN) عبر خدمة Cloudinary.
   - الإعدادات المعتمدة:
     - Cloud Name: `vis04evc`
     - Upload Preset: `h2ft0erz` (Unsigned)
   - ميزة التحويل والضغط التلقائي لأحدث صيغ الويب (WebP / AVIF) لتوفير أقصى سرعة تصفح وأقل استهلاك للباندويث.

### ب. هيكل المجلدات المنظم (Organized Folder Hierarchy):
- تنظيم رفع صور كل عقار في مجلد مخصص ودقيق لمنع العشوائية:
  `alamoudi_properties/{regionId}/{propertyCode}`
- مثال: صور عقار `S93` في الشروق تُحفظ في: `alamoudi_properties/shorouk/S93/`
- الروابط السحابية الناتجة تُخزن في عمود `images` في جدول `properties` بـ Supabase.

### ج. دورة الحذف وإعادة الضبط الشاملة (Clean Delete & Platform Reset):
1. **حذف العقار الفردي أو المجمّع:**
   - حذف السجل نهائياً من Supabase، وحذف أي مرجع له من الكاش وقاعدة بيانات المتصفح (IndexedDB).
   - تطهير الذاكرة ومنع إعادة إحيائه من السجلات المؤقتة.
2. **إعادة ضبط المنصة (Platform Reset):**
   - تفريغ جدول العقارات السحابي في Supabase بالكامل.
   - تصفير IndexedDB والكاش المحلي ووضع راية `alm_platform_reset_flag = "true"`.
   - منع إعادة زرع العقارات الافتراضية القديمة (SEED_PROPERTIES) تلقائياً بعد التصفير.
   - الإبقاء على حسابات المشرفين والمدير والمدن الأساسية (بما فيها كمبوند وصال) لضمان استقرار النظام.

## 3. الملفات المتأثرة (Impacted Files)
- `artifacts/alamoudi/src/lib/cloudinaryService.ts`: خدمة رفع وإدارة صور Cloudinary.
- `artifacts/alamoudi/src/lib/supabaseClient.ts`: بيانات ربط مشروع Supabase الجديد.
- `artifacts/alamoudi/src/context/DataContext.tsx`: إدارة المزامنة، الدمج، الحذف النظيف، ودالة `resetAllProperties`.
- `artifacts/alamoudi/src/pages/admin/PropertyForm.tsx`: رفع الصور التلقائي لسحابة Cloudinary وتنظيم المجلدات.
- `artifacts/alamoudi/src/pages/admin/Backup.tsx`: تفعيل إعادة الضبط والتنظيف الشامل.
