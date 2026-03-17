// ============================================================
// useData.js
// كل التعاملات مع Supabase في مكان واحد:
// - جلب الأسئلة والخيارات
// - جلب لوحة المتصدرين
// - حفظ نتيجة اللاعب
// ============================================================

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase' // عميل Supabase المهيّأ بالـ keys

// ============================================================
// useQuestions
// هوك يجلب كل الأسئلة مع خياراتها من Supabase
// يرجع: { questions, loading, error }
// ============================================================
export function useQuestions() {

  // قائمة الأسئلة بعد المعالجة
  const [questions, setQuestions] = useState([])

  // حالة التحميل — true لحين وصول البيانات
  const [loading, setLoading] = useState(true)

  // رسالة الخطأ لو فشل الجلب
  const [error, setError] = useState(null)

  useEffect(() => {

    // دالة الجلب — async عشان نستخدم await
    async function fetchQuestions() {
      setLoading(true)

      // جلب الأسئلة مع خياراتها من Supabase
      // choices هو جدول مرتبط بـ question_id (علاقة one-to-many)
      const { data, error } = await supabase
        .from('questions')
        .select(`
          id,
          question_text,
          correct_answer,
          choices (
            id,
            text
          )
        `)

      if (error) {
        // خزّن رسالة الخطأ عشان تُعرض في الواجهة
        setError(error.message)
      } else {
        // رتّب الأسئلة عشوائياً عشان كل جلسة تكون مختلفة، وخذ 10 أسئلة فقط لكل جولة
        const shuffled = data
          .sort(() => Math.random() - 0.5)
          .slice(0, 10)
          .map(q => ({
            ...q,
            // قسّم نص السؤال لكلمات — نحتاجها لكشف كلمة كلمة
            words: q.question_text.split(' '),
            // رتّب خيارات كل سؤال عشوائياً عشان الجواب الصح ما يكون دايماً في نفس المكان
            choices: [...q.choices].sort(() => Math.random() - 0.5),
          }))

        setQuestions(shuffled)
      }

      setLoading(false)
    }

    // شغّل الجلب لما المكوّن يتحمّل
    fetchQuestions()

  }, []) // [] = شغّل مرة وحدة فقط عند التحميل

  return { questions, loading, error }
}

// ============================================================
// useLeaderboard
// هوك يجلب أعلى 10 نتائج من جدول scores
// يرجع: { scores, loading, error, refetch }
// refetch تُستدعى بعد حفظ نتيجة جديدة عشان تتحدث القائمة
// ============================================================
export function useLeaderboard() {

  // قائمة النتائج
  const [scores, setScores] = useState([])

  // حالة التحميل
  const [loading, setLoading] = useState(true)

  // رسالة الخطأ
  const [error, setError] = useState(null)

  // useCallback عشان نقدر نستدعي fetchLeaderboard من خارج الهوك (بعد حفظ النتيجة)
  const fetchLeaderboard = useCallback(async () => {
    setLoading(true)

    // جلب أعلى 10 نتائج مرتّبة تنازلياً
    const { data, error } = await supabase
      .from('scores')
      .select('player_name, score, created_at')
      .order('score', { ascending: false }) // الأعلى أولاً
      .limit(10)                             // أعلى 10 فقط

    if (error) {
      setError(error.message)
    } else {
      setScores(data)
    }

    setLoading(false)
  }, [])

  // جلب الليدربورد لما المكوّن يتحمّل لأول مرة
  useEffect(() => {
    fetchLeaderboard()
  }, [fetchLeaderboard])

  // نرجع refetch عشان App.jsx يقدر يستدعيه بعد انتهاء اللعبة
  return { scores, loading, error, refetch: fetchLeaderboard }
}

// ============================================================
// saveScore
// دالة عادية (مو هوك) تحفظ نتيجة اللاعب في Supabase
// تُستدعى من App.jsx بعد انتهاء آخر سؤال
// ============================================================
export async function saveScore(playerName, score) {

  // أدخل سجل جديد في جدول scores
  const { error } = await supabase
    .from('scores')
    .insert({ player_name: playerName, score })

  // لو فشل الحفظ ارمِ خطأ عشان App.jsx يعالجه
  if (error) throw new Error(error.message)
}