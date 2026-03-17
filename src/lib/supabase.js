/*
-------------------------------------------------------
استيراد مكتبة Supabase
-------------------------------------------------------

createClient هي الدالة المستخدمة لإنشاء اتصال
بين التطبيق وقاعدة البيانات في Supabase
*/

import { createClient } from '@supabase/supabase-js'


/*
-------------------------------------------------------
قراءة متغيرات البيئة (Environment Variables)
-------------------------------------------------------

هذه القيم يتم تعريفها في ملف .env

VITE_SUPABASE_URL
رابط مشروع Supabase

VITE_SUPABASE_ANON_KEY
المفتاح العام (Anonymous Key) المستخدم للاتصال
من الواجهة الأمامية (Frontend)

import.meta.env يستخدم في مشاريع Vite لقراءة
متغيرات البيئة أثناء تشغيل التطبيق
*/

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY


/*
-------------------------------------------------------
التحقق من وجود متغيرات البيئة
-------------------------------------------------------

إذا لم يتم تعريف القيم في ملف .env
سيتم إيقاف التطبيق وإظهار خطأ واضح
حتى لا يعمل التطبيق بدون اتصال بقاعدة البيانات
*/

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check your .env file.')
}


/*
-------------------------------------------------------
إنشاء عميل Supabase
-------------------------------------------------------

createClient يقوم بإنشاء كائن يمكن استخدامه
للتواصل مع قاعدة البيانات مثل:

- جلب البيانات (select)
- إضافة بيانات (insert)
- تحديث بيانات (update)
- حذف بيانات (delete)

سيتم استيراد هذا الكائن في باقي ملفات المشروع
عند الحاجة للتعامل مع قاعدة البيانات
*/

export const supabase = createClient(supabaseUrl, supabaseAnonKey)