/**
 * Leaderboard Component
 *
 * هذا الكومبوننت مسؤول عن عرض قائمة أفضل اللاعبين (Leaderboard).
 *
 * الحالات التي يتعامل معها:
 * 1️⃣ أثناء تحميل البيانات من السيرفر
 * 2️⃣ عندما لا توجد نتائج بعد
 * 3️⃣ عرض قائمة النتائج
 *
 * @param {Array} scores
 * قائمة النتائج القادمة من قاعدة البيانات.
 * كل عنصر يحتوي على:
 * - player_name
 * - score
 *
 * @param {boolean} loading
 * يحدد هل البيانات ما زالت يتم تحميلها من السيرفر.
 *
 * @param {string|null} highlightName
 * اسم اللاعب الذي نريد تمييزه في القائمة
 */

export function Leaderboard({ scores, loading, highlightName = null }) {

  /*
  -------------------------------------------------------
  حالة التحميل
  -------------------------------------------------------
  إذا كانت البيانات ما زالت تُحمّل من السيرفر
  نعرض مؤشر تحميل (Spinner)
  */

  if (loading) {
    return (
      <div
        className="row gap-8"
        style={{ justifyContent: 'center', padding: '16px 0' }}
      >
        {/* مؤشر التحميل */}
        <div className="spinner" />

        {/* نص يوضح أن النتائج يتم تحميلها */}
        <span className="text-secondary text-sm">
          جاري تحميل المتصدرين...
        </span>
      </div>
    )
  }


  /*
  -------------------------------------------------------
  حالة عدم وجود نتائج
  -------------------------------------------------------
  إذا كانت القائمة فارغة
  */

  if (!scores.length) {
    return (
      <p
        className="text-dim text-sm center"
        style={{ padding: '16px 0' }}
      >
        لا يوجد متصدرين بعد — كن أنت الأول!
      </p>
    )
  }


  /*
  -------------------------------------------------------
  عرض قائمة النتائج
  -------------------------------------------------------
  يتم عرض كل لاعب في صف داخل القائمة
  */

  return (

    <div className="leaderboard-list">

      {scores.map((player, i) => {

        /*
        player
        يمثل سجل لاعب واحد من قاعدة البيانات
        */

        /*
        التحقق هل هذا اللاعب يجب تمييزه
        عادة يكون اللاعب الذي أنهى اللعبة حالياً
        */

        const isHighlighted =
          highlightName && player.player_name === highlightName


        return (
          <div
            key={i}

            /*
            إضافة كلاس highlight إذا كان هذا اللاعب
            هو اللاعب الذي نريد إبراز اسمه
            */

            className={`leaderboard-row${isHighlighted ? ' highlight' : ''}`}
          >

            {/*
            -------------------------------------------------------
            ترتيب اللاعب
            -------------------------------------------------------
            أول ثلاثة مراكز يحصلون على ميداليات
            */}

            <span className={`leaderboard-rank${i < 3 ? ' top' : ''}`}>
              {i === 0
                ? '🥇'
                : i === 1
                  ? '🥈'
                  : i === 2
                    ? '🥉'
                    : `${i + 1}.`}
            </span>


            {/*
            اسم اللاعب
            */}

            <span className="leaderboard-name">
              {player.player_name}
            </span>


            {/*
            النقاط
            toLocaleString يستخدم لتنسيق الرقم
            مثال:
            10000 → 10,000
            */}

            <span className="leaderboard-score">
              {player.score.toLocaleString()}
            </span>

          </div>
        )

      })}

    </div>
  )
}