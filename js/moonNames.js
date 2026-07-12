/**
 * moonNames.js
 * 月齢（新月からの経過日数）に対応する、和名の月の呼び名と英語の対訳を返す。
 * 実際の暦の月齢は毎回わずかに変動するため、最も近い伝統的な呼び名を
 * 最近傍探索で選んでいる（多くの月齢カレンダーアプリと同様の方式）。
 */
(function (global) {
  // day: 新月からの経過日数の目安（0=新月）
  const MOON_NAMES = [
    { day: 0, ja: "新月", kana: "しんげつ", en: "New Moon" },
    { day: 2, ja: "三日月", kana: "みかづき", en: "Crescent Moon" },
    { day: 6, ja: "上弦の月", kana: "じょうげんのつき", en: "First Quarter Moon" },
    { day: 9, ja: "十日夜の月", kana: "とおかんやのつき", en: "Tenth-Night Moon" },
    { day: 12, ja: "十三夜月", kana: "じゅうさんやづき", en: "Thirteen-Night Moon" },
    { day: 13, ja: "小望月", kana: "こもちづき", en: "Almost-Full Moon" },
    { day: 14, ja: "満月（十五夜）", kana: "まんげつ", en: "Full Moon" },
    { day: 15, ja: "十六夜", kana: "いざよい", en: "Izayoi (Hesitant Moon)" },
    { day: 16, ja: "立待月", kana: "たちまちづき", en: "Standing-Wait Moon" },
    { day: 17, ja: "居待月", kana: "いまちづき", en: "Sitting-Wait Moon" },
    { day: 18, ja: "寝待月（臥待月）", kana: "ねまちづき", en: "Reclining-Wait Moon" },
    { day: 19, ja: "更待月", kana: "ふけまちづき", en: "Late-Night-Wait Moon" },
    { day: 21, ja: "下弦の月", kana: "かげんのつき", en: "Last Quarter Moon" },
    { day: 25, ja: "有明の月", kana: "ありあけのつき", en: "Dawn Moon" },
    { day: 27, ja: "三十日月", kana: "みそかづき", en: "Moon of the Last Day" },
  ];

  const SYNODIC = 29.530588853;

  function getMoonPhaseName(age) {
    let best = MOON_NAMES[0];
    let bestDist = Infinity;
    for (const entry of MOON_NAMES) {
      // 月末→月初へのラップアラウンドも考慮した円環距離
      const d1 = Math.abs(age - entry.day);
      const d2 = Math.abs(age - entry.day - SYNODIC);
      const d3 = Math.abs(age - entry.day + SYNODIC);
      const dist = Math.min(d1, d2, d3);
      if (dist < bestDist) {
        bestDist = dist;
        best = entry;
      }
    }
    return best;
  }

  global.KoyomiMoonNames = { getMoonPhaseName, MOON_NAMES };
})(typeof window !== "undefined" ? window : globalThis);
