import { useState, useEffect, useRef, useCallback } from 'react'

/*
---------------------------------------------
إعدادات عامة للنظام
---------------------------------------------

WORD_INTERVAL_MS
المدة الزمنية بين ظهور كل كلمة من السؤال (بالمللي ثانية)

QUESTION_TIMER_S
الوقت الكلي المتاح للإجابة على السؤال (بالثواني)
*/

const WORD_INTERVAL_MS = 570
const QUESTION_TIMER_S = 10


/**
 * Hook مخصص لإدارة:
 *
 * 1️⃣ ظهور كلمات السؤال تدريجياً
 * 2️⃣ العداد الزمني للسؤال
 *
 * الفكرة:
 * السؤال لا يظهر كامل مباشرة، بل تظهر كلمة كلمة
 * وكلما ظهرت كلمات أكثر يصبح السؤال أسهل.
 *
 * @param {string[]} words
 * مصفوفة تحتوي كلمات السؤال
 *
 * مثال:
 * ["ما", "هي", "عاصمة", "المملكة", "العربية", "السعودية"]
 *
 * @param {boolean} active
 * هل السؤال الحالي نشط؟
 * عندما يصبح true يبدأ النظام:
 * - كشف الكلمات
 * - تشغيل العداد
 *
 * @param {function} onTimeUp
 * دالة يتم استدعاؤها عندما ينتهي وقت السؤال
 */
export function useWordReveal(words, active, onTimeUp) {

  /*
  ---------------------------------------------
  الحالات (States)
  ---------------------------------------------
  */

  // عدد الكلمات التي تم كشفها حالياً من السؤال
  const [revealedCount, setRevealedCount] = useState(0)

  // هل تم إيقاف كشف الكلمات؟
  // يستخدم عندما يختار اللاعب إجابة
  const [isStopped, setIsStopped] = useState(false)

  // الوقت المتبقي للسؤال
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIMER_S)


  /*
  ---------------------------------------------
  المراجع (Refs)
  ---------------------------------------------
  */

  // مؤقت كشف الكلمات
  const wordTimerRef = useRef(null)

  // مؤقت العد التنازلي
  const countdownRef = useRef(null)

  // مرجع للدالة onTimeUp لتجنب مشاكل React closures
  const onTimeUpRef = useRef(onTimeUp)
  onTimeUpRef.current = onTimeUp


  /*
  ---------------------------------------------
  useEffect
  يبدأ النظام عند تفعيل السؤال
  ---------------------------------------------
  */

  useEffect(() => {

    // إذا لم يكن السؤال نشطاً لا نفعل شيء
    if (!active) return

    /*
    إعادة ضبط الحالة لبداية سؤال جديد
    */

    setRevealedCount(0)
    setIsStopped(false)
    setTimeLeft(QUESTION_TIMER_S)

    /*
    إظهار أول كلمة مباشرة
    */

    setRevealedCount(1)


    /*
    ---------------------------------------------
    مؤقت كشف الكلمات
    ---------------------------------------------
    كل WORD_INTERVAL_MS يتم كشف كلمة جديدة
    */

    wordTimerRef.current = setInterval(() => {

      setRevealedCount(prev => {

        // إذا ظهرت كل الكلمات نوقف المؤقت
        if (prev >= words.length) {
          clearInterval(wordTimerRef.current)
          return prev
        }

        // كشف كلمة جديدة
        return prev + 1

      })

    }, WORD_INTERVAL_MS)


    /*
    ---------------------------------------------
    مؤقت العد التنازلي للسؤال
    ---------------------------------------------
    */

    countdownRef.current = setInterval(() => {

      setTimeLeft(prev => {

        // عندما يصل الوقت للصفر
        if (prev <= 1) {

          // إيقاف جميع المؤقتات
          clearInterval(countdownRef.current)
          clearInterval(wordTimerRef.current)

          // إبلاغ النظام بانتهاء الوقت
          onTimeUpRef.current()

          return 0
        }

        // إنقاص ثانية
        return prev - 1

      })

    }, 1000)


    /*
    ---------------------------------------------
    تنظيف المؤقتات
    ---------------------------------------------
    يتم عند:
    - تغيير السؤال
    - مغادرة الصفحة
    */

    return () => {
      clearInterval(wordTimerRef.current)
      clearInterval(countdownRef.current)
    }

  }, [active, words])


  /*
  ---------------------------------------------
  إيقاف كشف الكلمات والعد التنازلي
  ---------------------------------------------
  يستخدم عند:
  - اختيار اللاعب للإجابة
  - انتهاء السؤال قبل الوقت
  */

  const stopReveal = useCallback(() => {

    // إذا كان متوقف مسبقاً لا نفعل شيء
    if (isStopped) return

    setIsStopped(true)

    // إيقاف المؤقتات
    clearInterval(wordTimerRef.current)

  }, [isStopped])


  /*
  ---------------------------------------------
  القيم التي يستخدمها الكومبوننت
  ---------------------------------------------
  */

  return {
    revealedCount, // عدد الكلمات الظاهرة حالياً
    isStopped,     // هل توقف الكشف
    timeLeft,      // الوقت المتبقي
    stopReveal     // دالة إيقاف النظام
  }
}