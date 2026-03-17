// ============================================================
// ResultScreen.jsx
// شاشة النتيجة — تعرض النقاط النهائية وتقييم الأداء والليدربورد
// ============================================================

import { Leaderboard } from '../components/Leaderboard' // مكوّن عرض أعلى النقاط

export function ResultScreen({
  playerName,
  finalScore,
  leaderboard,
  onPlayAgain,
  questions
}) {

  // الحد الأقصى للنقاط = 100 نقطة × عدد الأسئلة الحالي
  const maxPossible = questions?.length
    ? questions.length * 100
    : 0

  // حساب النسبة المئوية مع حماية من القسمة على صفر
  const percentage =
    maxPossible > 0
      ? Math.round((finalScore / maxPossible) * 100)
      : 0

  // ============================================================
  // تحديد التقييم النصي بناءً على النسبة المئوية
  // ============================================================
  function getVerdict() {
    if (percentage >= 80) return { emoji: '🔥', text: 'ما شاء الله!' }
    if (percentage >= 60) return { emoji: '⚡', text: 'أداء قوي!' }
    if (percentage >= 40) return { emoji: '👍', text: 'مو بطال!' }
    return { emoji: '🎯', text: 'تدرب أكثر!' }
  }

  // احسب التقييم مرة وخزّنه
  const verdict = getVerdict()

  return (
    <div className="screen stack gap-24">

      {/* ── بطاقة النتيجة النهائية ── */}
      <div
        className="card stack gap-12"
        style={{ textAlign: 'center', padding: '32px 24px' }}
      >

        {/* عنوان النتيجة */}
        <div
          className="text-secondary"
          style={{ letterSpacing: '0.05em', fontSize: '18px', fontWeight: '700' }}
        >
          النتيجة النهائية
        </div>

        {/* الرقم الكبير للنقاط */}
        <div className="big-score">
          {finalScore.toLocaleString()}
        </div>

        {/* التقييم: أيقونة + نص */}
        <div style={{ fontSize: '28px', fontWeight: '700' }}>
          {verdict.emoji}{' '}
          <span className="text-secondary" style={{ fontSize: '20px' }}>
            {verdict.text}
          </span>
        </div>

        {/* اسم اللاعب */}
        <div
          className="text-dim"
          style={{ fontSize: '16px', fontWeight: '600' }}
        >
          {playerName}
        </div>
      </div>

      {/* ── زر اللعب مجدداً ── */}
      <div className="stack gap-12">
        <button
          className="btn btn-primary"
          onClick={onPlayAgain}
          style={{ fontSize: '18px', padding: '16px', fontWeight: '700' }}
        >
          العب مرة ثانية
        </button>
      </div>

      {/* ── لوحة المتصدرين ── */}
      <div className="stack gap-12">
        <div className="label">المتصدرون</div>

        <Leaderboard
          scores={leaderboard.scores}    // قائمة النقاط من Supabase
          loading={leaderboard.loading}  // حالة التحميل
          highlightName={playerName}     // تمييز اللاعب الحالي
        />
      </div>

    </div>
  )
}