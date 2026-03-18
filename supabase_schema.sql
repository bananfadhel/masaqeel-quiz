-- ============================================================
-- مسابقة مصاقيل — هيكلة الجداول في Supabase
-- شغّل هذا الكود في SQL Editor داخل Supabase
-- ============================================================


-- ============================================================
-- الجداول
-- ============================================================

-- جدول الأسئلة
create table if not exists questions (
  id              uuid primary key default gen_random_uuid(),
  question_text   text not null,   -- نص السؤال (من 10 إلى 15 كلمة)
  correct_answer  text not null,   -- الإجابة الصحيحة (يجب أن تطابق أحد الخيارات)
  created_at      timestamptz default now()
);

-- جدول الخيارات (4 خيارات لكل سؤال)
create table if not exists choices (
  id            uuid primary key default gen_random_uuid(),
  question_id   uuid references questions(id) on delete cascade,
  text          text not null
);

-- جدول النقاط / لوحة المتصدرين
create table if not exists scores (
  id            uuid primary key default gen_random_uuid(),
  player_name   text not null,
  score         int not null,
  created_at    timestamptz default now()
);


-- ============================================================
-- تفعيل الحماية على مستوى الصفوف (RLS)
-- ============================================================

alter table questions enable row level security;
alter table choices   enable row level security;
alter table scores    enable row level security;

-- السماح بالقراءة العامة للأسئلة
create policy "Public read questions"
  on questions
  for select
  using (true);

-- السماح بالقراءة العامة للخيارات
create policy "Public read choices"
  on choices
  for select
  using (true);

-- السماح بالقراءة العامة للنقاط
create policy "Public read scores"
  on scores
  for select
  using (true);

-- السماح بإضافة نقاط بدون تسجيل دخول
create policy "Public insert scores"
  on scores
  for insert
  with check (true);


-- ============================================================
-- البيانات التجريبية — 10 أسئلة (كل سؤال من 10 إلى 15 كلمة)
-- ============================================================


-- ============================================================
-- السؤال 1
-- ============================================================

with q as (
  insert into questions (question_text, correct_answer)
  values (
    'في أي عام تم توحيد المملكة العربية السعودية على يد الملك عبدالعزيز؟',
    '1932'
  )
  returning id
)
insert into choices (question_id, text)
select id, choice_text
from q,
(
  values
    ('1932'),
    ('1925'),
    ('1918'),
    ('1945')
) as v(choice_text);


-- ============================================================
-- السؤال 2
-- ============================================================

with q as (
  insert into questions (question_text, correct_answer)
  values (
    'ما اسم أول بئر نفط تجاري اكتشف في المملكة العربية السعودية؟',
    'بئر الدمام رقم 7'
  )
  returning id
)
insert into choices (question_id, text)
select id, choice_text
from q,
(
  values
    ('بئر الدمام رقم 7'),
    ('بئر الظهران'),
    ('بئر الجبيل'),
    ('بئر الأحساء')
) as v(choice_text);


-- ============================================================
-- السؤال 3
-- ============================================================

with q as (
  insert into questions (question_text, correct_answer)
  values (
    'ما هي المدينة السعودية اللتي كانت عاصمة المملكة العربية السعودية الأولى؟',
    'الدرعية'
  )
  returning id
)
insert into choices (question_id, text)
select id, choice_text
from q,
(
  values
    ('الدرعية'),
    ('الرياض'),
    ('حائل'),
    ('القصيم')
) as v(choice_text);


-- ============================================================
-- السؤال 4
-- ============================================================

with q as (
  insert into questions (question_text, correct_answer)
  values (
    'ما اسم المضيق البحري الذي يربط البحر الأحمر بخليج عدن؟',
    'باب المندب'
  )
  returning id
)
insert into choices (question_id, text)
select id, choice_text
from q,
(
  values
    ('باب المندب'),
    ('هرمز'),
    ('جبل طارق'),
    ('البوسفور')
) as v(choice_text);


-- ============================================================
-- السؤال 5
-- ============================================================

with q as (
  insert into questions (question_text, correct_answer)
  values (
    'أي منطقة سعودية تشتهر بإنتاج أجود أنواع التمور مثل الخلاص والسكري؟',
    'القصيم'
  )
  returning id
)
insert into choices (question_id, text)
select id, choice_text
from q,
(
  values
    ('القصيم'),
    ('نجران'),
    ('تبوك'),
    ('حائل')
) as v(choice_text);


-- ============================================================
-- السؤال 6
-- ============================================================

with q as (
  insert into questions (question_text, correct_answer)
  values (
    'ما اسم أطول سلسلة جبال تمتد في غرب المملكة العربية السعودية؟',
    'جبال السروات'
  )
  returning id
)
insert into choices (question_id, text)
select id, choice_text
from q,
(
  values
    ('جبال السروات'),
    ('جبال طويق'),
    ('جبال الحجاز'),
    ('جبال أجا')
) as v(choice_text);


-- ============================================================
-- السؤال 7
-- ============================================================

with q as (
  insert into questions (question_text, correct_answer)
  values (
    'أي حضارة قديمة عاشت في منطقة العلا وتركت آثار مدائن صالح؟',
    'الأنباط'
  )
  returning id
)
insert into choices (question_id, text)
select id, choice_text
from q,
(
  values
    ('الأنباط'),
    ('الفراعنة'),
    ('الآشوريون'),
    ('البابليون')
) as v(choice_text);


-- ============================================================
-- السؤال 8
-- ============================================================

with q as (
  insert into questions (question_text, correct_answer)
  values (
    'ما اسم أكبر وادٍ في شبه الجزيرة العربية ويقع في السعودية؟',
    'وادي الرمة'
  )
  returning id
)
insert into choices (question_id, text)
select id, choice_text
from q,
(
  values
    ('وادي الرمة'),
    ('وادي حنيفة'),
    ('وادي الدواسر'),
    ('وادي فاطمة')
) as v(choice_text);


-- ============================================================
-- السؤال 9
-- ============================================================

with q as (
  insert into questions (question_text, correct_answer)
  values (
    'ما اسم أعلى قمة جبلية متواجدة في المملكة العربية السعودية؟',
    'جبل السودة'
  )
  returning id
)
insert into choices (question_id, text)
select id, choice_text
from q,
(
  values
    ('جبل السودة'),
    ('جبل طويق'),
    ('جبل اللوز'),
    ('جبل رضوى')
) as v(choice_text);


-- ============================================================
-- السؤال 10
-- ============================================================

with q as (
  insert into questions (question_text, correct_answer)
  values (
    'ما اسم المعلم الصخري الشهير في مدينة العلا والذي يشبه الفيل؟',
    'جبل الفيل'
  )
  returning id
)
insert into choices (question_id, text)
select id, choice_text
from q,
(
  values
    ('جبل الفيل'),
    ('جبل القارة'),
    ('جبل أحد'),
    ('جبل عرفة')
) as v(choice_text);
