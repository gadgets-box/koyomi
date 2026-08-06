/**
 * anniversaries.js
 * 祝日（法定休日）とは別に、日本のカレンダーでよく取り上げられる「記念日」を
 * 固定の月日で管理する。中でも原爆の日・大震災の日など、鎮魂・追悼の意味を
 * 持つ日は type: "memorial" として区別し、表示上も落ち着いたトーンにする。
 * それ以外の一般的な記念日は type: "general" とする。
 *
 * 祝日と異なり外部APIには頼らず、固定の月日データとしてこのファイル内に
 * 保持している（年をまたいでも変わらないため）。
 */
(function (global) {
  // key: "M-D"
  const ANNIVERSARIES = {
    "1-17": {
      type: "memorial",
      ja: "阪神・淡路大震災",
      en: "Great Hanshin-Awaji Earthquake",
    },
    "3-11": {
      type: "memorial",
      ja: "東日本大震災",
      en: "Great East Japan Earthquake",
    },
    "3-14": {
      type: "general",
      ja: "ホワイトデー",
      en: "White Day",
    },
    "4-1": {
      type: "general",
      ja: "エイプリルフール",
      en: "April Fools' Day",
    },
    "6-23": {
      type: "memorial",
      ja: "沖縄慰霊の日",
      en: "Okinawa Memorial Day",
    },
    "8-6": {
      type: "memorial",
      ja: "広島原爆の日",
      en: "Hiroshima Atomic Bombing Memorial Day",
    },
    "8-9": {
      type: "memorial",
      ja: "長崎原爆の日",
      en: "Nagasaki Atomic Bombing Memorial Day",
    },
    "8-15": {
      type: "memorial",
      ja: "終戦記念日",
      en: "End of World War II Memorial Day",
    },
    "9-1": {
      type: "memorial",
      ja: "防災の日（関東大震災）",
      en: "Disaster Prevention Day (Great Kantō Earthquake)",
    },
    "11-22": {
      type: "general",
      ja: "いい夫婦の日",
      en: "Good Couple's Day",
    },
  };

  /**
   * 指定日の記念日情報を返す。該当する記念日がなければ null。
   */
  function getAnniversary(month, day) {
    return ANNIVERSARIES[`${month}-${day}`] || null;
  }

  global.KoyomiAnniversaries = { getAnniversary };
})(typeof window !== "undefined" ? window : globalThis);
