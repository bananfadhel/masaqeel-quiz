// ============================================================
// GameScreen.jsx
// شاشة اللعبة الرئيسية — تتحكم في كشف الكلمات والإجابات والنقاط
// ============================================================

import { useState, useEffect, useCallback } from 'react'
import { useWordReveal } from '../hooks/useWordReveal'       // هوك كشف الكلمات والتايمر
import { calculateScore } from '../lib/scoring'              // دالة حساب النقاط
import { CountdownTimer } from '../components/CountdownTimer' // مكوّن العداد التنازلي

// مدة عرض بانر النتيجة (صح/خطأ/وقت) قبل الانتقال للسؤال التالي
const FEEDBACK_DURATION_MS = 1200

export function GameScreen({ questions, onGameEnd, totalScore, questionIndex, onQuestionEnd }) {

  // السؤال الحالي بناءً على الرقم الممرّر من App.jsx
  const question = questions[questionIndex]

  // مرحلة السؤال:
  // 'revealing' = الكلمات تظهر تلقائياً
  // 'guessing'  = اللاعب جاهز يختار الإجابة
  // 'feedback'  = تم الاختيار وتظهر النتيجة
  const [phase, setPhase] = useState('revealing')

  // بيانات بانر النتيجة: نوعه (correct/wrong/timeout) والنقاط المكتسبة
  const [feedback, setFeedback] = useState(null)

  // الخيار اللي ضغطه اللاعب — نحتاجه عشان نلوّنه أحمر لو غلط
  const [selectedChoice, setSelectedChoice] = useState(null)

  // ============================================================
  // دالة انتهاء الوقت — تُستدعى من هوك useWordReveal لما ينتهي العداد
  // ============================================================
  const handleTimeUp = useCallback(() => {
    // تجاهل لو السؤال خلص أصلاً
    if (phase !== 'revealing' && phase !== 'guessing') return

    // انتقل لمرحلة النتيجة وأظهر رسالة انتهاء الوقت
    setPhase('feedback')
    setFeedback({ type: 'timeout', points: 0 })

    // بعد فترة انتقل للسؤال التالي بدون نقاط
    setTimeout(() => advanceQuestion(0), FEEDBACK_DURATION_MS)
  }, [phase])

  // ============================================================
  // هوك كشف الكلمات — يرجع:
  // revealedCount : عدد الكلمات الظاهرة حتى الآن
  // isStopped     : هل اللاعب ضغط "توقف واجب"
  // timeLeft      : الثواني المتبقية من العداد
  // stopReveal    : دالة لإيقاف الكشف يدوياً
  // ============================================================
  const { revealedCount, isStopped, timeLeft, stopReveal } = useWordReveal(
    question.words, // مصفوفة كلمات السؤال
    true,           // السؤال نشط الآن
    handleTimeUp    // callback لما ينتهي الوقت
  )

  // ============================================================
  // لما تنكشف كل الكلمات تلقائياً — انتقل لمرحلة الإجابة
  // ============================================================
  useEffect(() => {
    if (revealedCount >= question.words.length && phase === 'revealing') {
      setPhase('guessing')
    }
  }, [revealedCount, question.words.length, phase])

  // ============================================================
  // لما اللاعب يضغط زر "توقف واجب"
  // يوقف الكشف التلقائي وينتقل لمرحلة الإجابة
  // ============================================================
  function handleStopAndGuess() {
    if (phase !== 'revealing') return
    stopReveal()
    setPhase('guessing')
  }

  // ============================================================
  // لما اللاعب يختار إجابة
  // يحسب النقاط ويظهر النتيجة ثم ينتقل للسؤال التالي
  // ============================================================
  function handleChoiceSelect(choiceText) {
    // تجاهل الضغط لو مو في مرحلة الإجابة
    if (phase !== 'guessing') return

    // تحقق من صحة الإجابة
    const isCorrect = choiceText === question.correct_answer

    // احسب النقاط — لو غلط يرجع صفر
    const points = isCorrect ? calculateScore(revealedCount, question.words.length) : 0

    // احفظ الخيار المحدد عشان تلوّنه
    setSelectedChoice(choiceText)

    // انتقل لمرحلة النتيجة
    setPhase('feedback')
    setFeedback({
      type: isCorrect ? 'correct' : 'wrong',
      points,
    })

    // بعد فترة انتقل للسؤال التالي
    setTimeout(() => advanceQuestion(points), FEEDBACK_DURATION_MS)
  }

  // ============================================================
  // تمرير النقاط لـ App.jsx عشان يحدّث المجموع وينتقل للسؤال التالي
  // ============================================================
  function advanceQuestion(points) {
    onQuestionEnd(points)
  }

  // الكلمات المرئية فقط — من أول الكلمات حتى عدد ما انكشف
  const visibleWords = question.words.slice(0, revealedCount)

  // ============================================================
  // الواجهة
  // ============================================================
  return (
    <div className="screen stack gap-20">

      {/* ── هيدر السؤال: رقم السؤال + النقاط الحالية + شريط التقدم ── */}
      <div className="stack gap-8">
        <div className="row between">
          {/* رقم السؤال الحالي من الإجمالي */}
          <span className="text-secondary" style={{ fontSize: '22px', fontWeight: '800' }}>
            سؤال {questionIndex + 1} / {questions.length}
          </span>
          {/* مجموع النقاط المتراكمة */}
          <span className="score-badge">{totalScore.toLocaleString()} نقطة</span>
        </div>

        {/* شريط التقدم — يمتلئ كلما تقدم اللاعب في الأسئلة */}
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${((questionIndex) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* ── التايمر + عداد الكلمات + زر التوقف ── */}
      <div className="row between">

        {/* العداد التنازلي الدائري (10 ثوانٍ) */}
        <CountdownTimer timeLeft={timeLeft} />

        <div className="row gap-8">
          {/* عدد الكلمات المكشوفة من الإجمالي */}
          <span className="text-secondary" style={{ fontSize: '22px', fontWeight: '800' }}>
            {revealedCount} / {question.words.length} كلمة
          </span>

          {/* زر التوقف — يظهر فقط في مرحلة الكشف */}
          {phase === 'revealing' && (
            <button className="btn btn-stop" onClick={handleStopAndGuess}>
              توقف واجب
            </button>
          )}
        </div>
      </div>

      {/* ── نقاط صغيرة تمثل كل كلمة — الخضراء = مكشوفة ── */}
      <div className="word-progress">
        {question.words.map((_, i) => (
          <div
            key={i}
            className={`word-dot${i < revealedCount ? ' revealed' : ''}`}
          />
        ))}
      </div>

      {/* ── منطقة ظهور الكلمات واحدة تلو الأخرى ── */}
      <div className="words-area">
        {/* اعرض الكلمات المكشوفة حتى الآن */}
        {visibleWords.map((word, i) => (
          <span
            key={i}
            className="word"
            style={{ animationDelay: '0ms' }}
          >
            {word}
          </span>
        ))}

        {/* نقاط الانتظار — تظهر فقط لما الكشف لسه مستمر */}
        {phase === 'revealing' && (
          <span
            className="word"
            style={{
              opacity: 0.3,
              fontSize: '18px',
              fontWeight: 600,
              transform: 'none',
              animation: 'none',
            }}
          >
            …
          </span>
        )}
      </div>

      {/* ── بانر النتيجة — يظهر بعد الإجابة أو انتهاء الوقت ── */}
      {feedback && (
        <div className={`feedback-banner ${feedback.type}`}>
          {feedback.type === 'correct' && <>✓ إجابة صحيحة! +{feedback.points} نقطة</>}
          {feedback.type === 'wrong' && <>✗ إجابة خاطئة — 0 نقطة</>}
          {feedback.type === 'timeout' && <>⏱ انتهى الوقت — 0 نقطة</>}
        </div>
      )}

      {/* ── خيارات الإجابة — تظهر فقط في مرحلة الإجابة والنتيجة ── */}
      {(phase === 'guessing' || phase === 'feedback') && (
        <div className="stack gap-12">
          <div className="label">اختر الإجابة</div>
          <div className="choices-grid">
            {question.choices.map(choice => {

              // الكلاس الافتراضي للزر
              let choiceClass = 'choice-btn'

              // في مرحلة النتيجة: لوّن الصحيح أخضر والغلط أحمر
              if (phase === 'feedback') {
                if (choice.text === question.correct_answer) choiceClass += ' correct'
                else if (choice.text === selectedChoice) choiceClass += ' wrong'
              }

              return (
                <button
                  key={choice.id}
                  className={choiceClass}
                  onClick={() => handleChoiceSelect(choice.text)}
                  disabled={phase === 'feedback'} // عطّل الضغط بعد الإجابة
                >
                  {choice.text}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ── تلميح للاعب لما الكلمات لسه تنكشف ── */}
      {phase === 'revealing' && (
        <p className="text-secondary center" style={{ fontSize: '20px', fontWeight: '700' }}>
          اضغط "توقف و اجب !" لما تعرف الإجابة
        </p>
      )}

    </div>
  )
}