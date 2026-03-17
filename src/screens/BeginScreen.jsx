// ============================================================
// BeginScreen.jsx
// شاشة البداية — اللاعب يدخل اسمه ويشوف الليدربورد ويبدأ اللعبة
// ============================================================

import { useState } from 'react'
import { Leaderboard } from '../components/Leaderboard' // مكوّن عرض أعلى النقاط

export function BeginScreen({ onStart, leaderboard }) {

  // اسم اللاعب — يتحدث مع كل حرف يكتبه
  const [name, setName] = useState('')

  // ============================================================
  // لما اللاعب يضغط "ابدأ اللعبة"
  // يتحقق إن الاسم مو فاضي ثم يستدعي onStart من App.jsx
  // ============================================================
  function handleSubmit(e) {
    e.preventDefault() // منع إعادة تحميل الصفحة

    const trimmed = name.trim() // احذف المسافات الزيادة
    if (!trimmed) return        // لو الاسم فاضي لا تكمل

    onStart(trimmed) // أرسل الاسم لـ App.jsx لبدء اللعبة
  }

  return (
    <div className="screen stack gap-24">

      {/* ── الهيدر: اسم اللعبة + وصف مختصر ── */}
      <div className="stack gap-8" style={{ textAlign: 'center' }}>
        <div className="logo">
          مصاقيل
        </div>
        <p className="text-secondary" style={{ fontSize: '18px', lineHeight: '1.6', fontWeight: '600' }}>
          خمّن السؤال قبل ما تنكشف كل الكلمات. كلما أجبت أسرع، كل ما صارت نقاطك أعلى.
        </p>
      </div>

      {/* ── إدخال الاسم ضمن بطاقة لتوحيد التصميم ── */}
      <form onSubmit={handleSubmit} className="card stack gap-16">

        <div className="stack gap-8">
          {/* عنوان الحقل */}
          <div className="label" style={{ marginBottom: 0 }}>اسمك</div>

          {/* حقل الاسم — autoFocus يحط الكيبورد عليه تلقائياً */}
          <input
            className="input"
            type="text"
            placeholder="ادخل اسمك"
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={32}
            autoFocus
          />
        </div>

        {/* زر البدء — معطّل لو الاسم فاضي */}
        <button
          className="btn btn-primary"
          type="submit"
          disabled={!name.trim()}
          style={{ fontSize: '18px', padding: '16px', fontWeight: '700' }}
        >
          ابدأ اللعبة ←
        </button>
      </form>

      {/* ── الصندوقين: كيف تلعب والمتصدرون ── */}
      <div className="stack gap-20">
        {/* ── كيف تلعب ── */}
        <div className="card stack gap-12">
          <div className="label">كيف تلعب ؟</div>
          <div className="stack gap-8">
            {[
              ['⚡', 'السؤال يظهر كلمة كلمة، حاول تخمينه بأسرع وقت ممكن'],
              ['🛑', 'توقف وجاوب بأي وقت'],
              ['📈', 'الجواب بأسرع وقت = نقاط أعلى'],
              ['⏱', 'عشرة ثوانٍ لكل سؤال — لا تفكر كثير'],
            ].map(([icon, text]) => (
              // كل سطر: أيقونة + نص تعليمي
              <div key={text} className="instruction-item">
                <span className="instruction-icon">{icon}</span>
                <span className="instruction-text">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── لوحة المتصدرين — تُجلب من Supabase ── */}
        <div className="card stack gap-12">
          <div className="label">المتصدرون</div>
          {/* scores: قائمة النقاط | loading: حالة التحميل */}
          <Leaderboard scores={leaderboard.scores} loading={leaderboard.loading} />
        </div>
      </div>

    </div>
  )
}