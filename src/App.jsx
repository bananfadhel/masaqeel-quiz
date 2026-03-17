// ============================================================
// App.jsx
// الملف الرئيسي — يتحكم في حالة اللعبة والانتقال بين الشاشات
// ============================================================

import { useState, useCallback } from 'react'
import { useQuestions, useLeaderboard, saveScore } from './hooks/useData'
import { BeginScreen } from './screens/BeginScreen'   // شاشة البداية
import { GameScreen }  from './screens/GameScreen'    // شاشة اللعبة
import { ResultScreen } from './screens/ResultScreen' // شاشة النتيجة

// أسماء الشاشات — نستخدم ثوابت بدل نصوص عشان نتجنب الأخطاء الإملائية
const SCREEN = {
  BEGIN:  'begin',
  GAME:   'game',
  RESULT: 'result',
}

export default function App() {

  // الشاشة الحالية — نبدأ دايماً من شاشة البداية
  const [screen, setScreen] = useState(SCREEN.BEGIN)

  // اسم اللاعب — يُحفظ عند البدء ويُستخدم في حفظ النتيجة وعرضها
  const [playerName, setPlayerName] = useState('')

  // مجموع النقاط المتراكمة خلال اللعبة
  const [totalScore, setTotalScore] = useState(0)

  // رقم السؤال الحالي (يبدأ من 0)
  const [questionIndex, setQuestionIndex] = useState(0)

  // جلب الأسئلة من Supabase عند تحميل التطبيق
  const { questions, loading: questionsLoading, error: questionsError } = useQuestions()

  // جلب لوحة المتصدرين — refetch تُستدعى بعد حفظ النتيجة
  const leaderboard = useLeaderboard()

  // ============================================================
  // لما اللاعب يدخل اسمه ويضغط ابدأ
  // يُهيّئ اللعبة من الصفر وينتقل لشاشة اللعبة
  // ============================================================
  const handleStart = useCallback((name) => {
    setPlayerName(name)
    setTotalScore(0)       // صفّر النقاط
    setQuestionIndex(0)    // ابدأ من السؤال الأول
    setScreen(SCREEN.GAME)
  }, [])

  // ============================================================
  // لما سؤال ينتهي (صح أو غلط أو وقت)
  // يضيف النقاط ويقرر إذا اللعبة خلصت أو يكمل للسؤال التالي
  // ============================================================
  const handleQuestionEnd = useCallback(async (pointsEarned) => {

    // احسب المجموع الجديد
    const newScore = totalScore + pointsEarned
    setTotalScore(newScore)

    const nextIndex = questionIndex + 1

    if (nextIndex >= questions.length) {
      // ── اللعبة خلصت ──

      // احفظ النتيجة في Supabase
      try {
        await saveScore(playerName, newScore)
      } catch (err) {
        // لو فشل الحفظ نسجّل الخطأ بس ما نوقف اللعبة
        console.error('فشل حفظ النتيجة:', err)
      }

      // حدّث لوحة المتصدرين عشان تظهر فيها النتيجة الجديدة
      await leaderboard.refetch()

      // انتقل لشاشة النتيجة
      setScreen(SCREEN.RESULT)

    } else {
      // ── لسه في أسئلة — انتقل للتالي ──
      setQuestionIndex(nextIndex)
    }

  }, [totalScore, questionIndex, questions.length, playerName, leaderboard])

  // ============================================================
  // لما اللاعب يضغط "العب مرة ثانية"
  // يرجع لشاشة البداية ويحدّث الليدربورد
  // ============================================================
  const handlePlayAgain = useCallback(() => {
    leaderboard.refetch()
    setScreen(SCREEN.BEGIN)
  }, [leaderboard])

  // ============================================================
  // حالة التحميل — يظهر لما الأسئلة لسه تُجلب من Supabase
  // ============================================================
  if (questionsLoading) {
    return (
      <div className="app-shell">
        <div className="stack gap-12" style={{ alignItems: 'center' }}>
          <div className="spinner" />
          <span className="text-secondary text-sm">جاري تحميل الأسئلة…</span>
        </div>
      </div>
    )
  }

  // ============================================================
  // حالة الخطأ — يظهر لو فشل الاتصال بـ Supabase
  // ============================================================
  if (questionsError) {
    return (
      <div className="app-shell">
        <div className="card stack gap-12">
          <p className="bold" style={{ color: 'var(--red)' }}>فشل تحميل الأسئلة</p>
          <p className="text-secondary text-sm">{questionsError}</p>
          <p className="text-dim text-sm">تحقق من إعدادات Supabase في ملف .env</p>
        </div>
      </div>
    )
  }

  // ============================================================
  // عرض الشاشة المناسبة حسب حالة اللعبة
  // ============================================================
  return (
    <div className="app-shell">

      {/* شاشة البداية */}
      {screen === SCREEN.BEGIN && (
        <BeginScreen
          onStart={handleStart}
          leaderboard={leaderboard}
        />
      )}

      {/* شاشة اللعبة — key={questionIndex} يعيد تحميل المكوّن مع كل سؤال جديد */}
      {screen === SCREEN.GAME && questions.length > 0 && (
        <GameScreen
          key={questionIndex}
          questions={questions}
          questionIndex={questionIndex}
          totalScore={totalScore}
          onQuestionEnd={handleQuestionEnd}
          onGameEnd={() => {}}
        />
      )}

      {/* شاشة النتيجة */}
      {screen === SCREEN.RESULT && (
        <ResultScreen
          playerName={playerName}
          finalScore={totalScore}
          leaderboard={leaderboard}
          onPlayAgain={handlePlayAgain}
          questions={questions}

        />
      )}

    </div>
  )
}