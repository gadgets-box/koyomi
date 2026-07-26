/**
 * illustrations.js
 *
 * これまで（v1〜v2）は独自のSVGパスで季節のモチーフを描画していたが、
 * 小さいサイズで表示すると何を描いているか伝わりにくいという指摘が
 * 繰り返しあった。パスの複雑さを調整しても抽象的になりやすいため、
 * 作成方法を根本的に変更し、実在の絵文字（Unicode Emoji）をモチーフの
 * 本体として使うことにした。絵文字は各OS/ブラウザが持つカラー絵文字
 * フォントによって専門家がデザインした絵として描画されるため、
 * 自作のSVGパスより確実に「何を表しているか」が伝わる。
 *
 * 見た目の統一感を保つため、絵文字の背後に季節のアクセントカラーを
 * 薄く敷いた円形の背景を置いている（サイト全体の配色との一貫性を保つ
 * ための唯一の自作描画要素）。
 */
(function (global) {
  const SEASON_COLORS = {
    winter: "#35506e",
    spring: "#c76a7f",
    summer: "#1f7a6c",
    autumn: "#b1531f",
  };

  function getSeason(month) {
    if (month === 12 || month === 1 || month === 2) return "winter";
    if (month >= 3 && month <= 5) return "spring";
    if (month >= 6 && month <= 8) return "summer";
    return "autumn";
  }

  function accentColorForMonth(month) {
    return SEASON_COLORS[getSeason(month)];
  }

  // 週インデックス 0-3（およそ1週間ごとに切り替わる）
  function variantIndex(day) {
    if (day <= 7) return 0;
    if (day <= 14) return 1;
    if (day <= 21) return 2;
    return 3;
  }

  // ================= 月ごと・週ごとの絵文字モチーフ =================
  // 実在の絵文字を使うことで、誰が見ても一目で意味が伝わることを優先している。

  const MONTH_EMOJI = {
    1: ["🌅", "🎍", "🪁", "❄️"],
    2: ["❄️", "👹", "🌸", "🐦"],
    3: ["🌱", "🌸", "🌸", "🦋"],
    4: ["🌸", "🌸", "🍡", "🍃"],
    5: ["🎏", "🍃", "🐞", "🌿"],
    6: ["🌸", "☔", "🐌", "🌈"],
    7: ["🎋", "⭐", "🎆", "🍧"],
    8: ["⛈️", "🌺", "⛰️", "🏮"],
    9: ["🌕", "🌾", "🦗", "🌰"],
    10: ["🍂", "🍁", "🐿️", "🍊"],
    11: ["🍂", "🍂", "🍠", "🍂"],
    12: ["❄️", "⛄", "🎄", "🔔"],
  };

  const SPECIAL_EMOJI = {
    "1-1": "🌅",
    "2-3": "👹",
    "2-14": "💝",
    "3-3": "🎎",
    "5-5": "🎏",
    "7-7": "🎋",
    "8-11": "⛰️",
    "8-15": "🏮",
    "10-31": "🎃",
    "11-15": "🍬",
    "12-24": "🎄",
    "12-25": "🎄",
    "12-31": "🔔",
  };

  // 2/14はバレンタインなので、冬の寒色ではなく暖かい赤系にする特例
  const SPECIAL_ACCENT = {
    "2-14": "#c8425a",
  };

  function getEmoji(month, day) {
    const key = `${month}-${day}`;
    if (SPECIAL_EMOJI[key]) return SPECIAL_EMOJI[key];
    const list = MONTH_EMOJI[month] || MONTH_EMOJI[1];
    return list[variantIndex(day)];
  }

  function getIllustrationSVG(month, day) {
    const key = `${month}-${day}`;
    const accent = SPECIAL_ACCENT[key] || accentColorForMonth(month);
    const emoji = getEmoji(month, day);
    return `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="seasonal illustration">
      <circle cx="60" cy="60" r="52" fill="${accent}" opacity="0.12" />
      <text x="60" y="66" font-size="58" text-anchor="middle" dominant-baseline="central">${emoji}</text>
    </svg>`;
  }

  /**
   * 月齢イラスト（月の満ち欠けアイコン）を生成する。
   * こちらは絵文字だと満ち欠けの割合を正確に表現できないため、引き続き
   * 独自のSVG図形（照らされた部分の面積比が数学的に正しい三日月〜満月の形）
   * で描画する。
   * @param {number} phase 0=新月, 0.5=満月, 1=新月(次)
   * @param {string} color 満ちている部分の色
   */
  function getMoonPhaseSVG(phase, color) {
    const r = 34;
    const cx = 40;
    const cy = 40;
    const theta = phase * 2 * Math.PI;
    const rx = r * Math.cos(theta);
    const rxAbs = Math.max(Math.abs(rx), 0.01);
    const sweep2 = rx >= 0 ? 0 : 1;
    const illumPath = `M ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx} ${cy + r} A ${rxAbs} ${r} 0 0 ${sweep2} ${cx} ${cy - r} Z`;
    return `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="moon phase">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="#241f3a" />
      <path d="${illumPath}" fill="${color}" />
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="1.5" opacity="0.6" />
    </svg>`;
  }

  // ================= キャプション（週替わりに対応） =================

  const MONTH_CAPTIONS = {
    1: [
      { ja: "初日の出", en: "The New Year's first sunrise" },
      { ja: "門松・松飾り", en: "Kadomatsu New Year pine decorations" },
      { ja: "凧あげ", en: "Flying a New Year's kite" },
      { ja: "冬本番の寒さ", en: "The depths of winter cold" },
    ],
    2: [
      { ja: "雪の結晶", en: "A snowflake" },
      { ja: "節分の鬼", en: "The oni of Setsubun" },
      { ja: "咲き始めの梅", en: "Plum blossoms beginning to open" },
      { ja: "春を待つ小鳥", en: "A small bird awaiting spring" },
    ],
    3: [
      { ja: "芽吹く若草", en: "Sprouting spring grass" },
      { ja: "咲き始めの桜", en: "Cherry blossoms starting to bloom" },
      { ja: "満開の桜", en: "Cherry blossoms in full bloom" },
      { ja: "桜と舞う蝶", en: "Cherry blossoms and a fluttering butterfly" },
    ],
    4: [
      { ja: "満開の桜", en: "Cherry blossoms in full bloom" },
      { ja: "舞い散る桜吹雪", en: "Cherry petals swirling in the wind" },
      { ja: "お花見の団子", en: "Dango for cherry-blossom viewing" },
      { ja: "芽吹く若葉", en: "Fresh young leaves emerging" },
    ],
    5: [
      { ja: "泳ぐ鯉のぼり", en: "A carp streamer swimming in the wind" },
      { ja: "深まる新緑", en: "Deepening fresh greenery" },
      { ja: "てんとう虫", en: "A ladybug" },
      { ja: "青々とした若葉", en: "Lush early-summer greenery" },
    ],
    6: [
      { ja: "咲きそろう紫陽花", en: "Hydrangeas blooming together" },
      { ja: "雨の日の傘", en: "An umbrella for a rainy day" },
      { ja: "でんでん虫", en: "A snail out in the rain" },
      { ja: "雨上がりの虹", en: "A rainbow after the rain" },
    ],
    7: [
      { ja: "七夕の笹飾り", en: "Bamboo decorations for Tanabata" },
      { ja: "夜空の星", en: "A star in the night sky" },
      { ja: "打ち上げ花火", en: "Fireworks lighting up the sky" },
      { ja: "夏のかき氷", en: "Summer shaved ice" },
    ],
    8: [
      { ja: "夏の夕立", en: "A summer thunderstorm" },
      { ja: "咲き誇る夏の花", en: "Summer flowers in full bloom" },
      { ja: "夏山と太陽", en: "Summer mountains under the sun" },
      { ja: "お盆の灯籠", en: "A lantern for the Obon festival" },
    ],
    9: [
      { ja: "夜空に浮かぶ満月", en: "The full moon rising in the sky" },
      { ja: "揺れるすすき", en: "Pampas grass swaying in the breeze" },
      { ja: "秋を告げる虫の声", en: "Insects singing to announce autumn" },
      { ja: "実った栗", en: "A ripened chestnut" },
    ],
    10: [
      { ja: "色づき始めの葉", en: "A leaf just beginning to change color" },
      { ja: "真っ赤なもみじ", en: "A maple leaf turned bright red" },
      { ja: "どんぐりを探すリス", en: "A squirrel searching for acorns" },
      { ja: "実りの秋の果物", en: "Autumn's colorful ripened fruit" },
    ],
    11: [
      { ja: "色づく銀杏の葉", en: "A ginkgo leaf turning gold" },
      { ja: "散り敷く銀杏の葉", en: "Ginkgo leaves scattered on the ground" },
      { ja: "ほくほくの焼き芋", en: "A warm roasted sweet potato" },
      { ja: "晩秋の実り", en: "The harvest of late autumn" },
    ],
    12: [
      { ja: "冬の初雪", en: "The season's first snow" },
      { ja: "雪だるま", en: "A snowman" },
      { ja: "クリスマスツリー", en: "A Christmas tree" },
      { ja: "除夜の鐘", en: "The temple bell rung on New Year's Eve" },
    ],
  };

  const SPECIAL_CAPTIONS = {
    "1-1": { ja: "初日の出", en: "The New Year's first sunrise" },
    "2-3": { ja: "節分の鬼", en: "The oni of Setsubun" },
    "2-14": { ja: "バレンタインデー", en: "Valentine's Day" },
    "3-3": { ja: "ひな祭りのお雛様", en: "Hina dolls for Hinamatsuri" },
    "5-5": { ja: "こどもの日の鯉のぼり", en: "A carp streamer for Children's Day" },
    "7-7": { ja: "七夕の笹飾り", en: "Bamboo decorations for Tanabata" },
    "8-11": { ja: "山の日の夏山", en: "Summer mountains for Mountain Day" },
    "8-15": { ja: "お盆の灯籠", en: "A lantern for the Obon festival" },
    "10-31": { ja: "ハロウィンのかぼちゃ", en: "A Halloween jack-o'-lantern" },
    "11-15": { ja: "七五三の千歳飴", en: "Chitose-ame candy for Shichi-Go-San" },
    "12-24": { ja: "クリスマスツリー", en: "A Christmas tree" },
    "12-25": { ja: "クリスマスツリー", en: "A Christmas tree" },
    "12-31": { ja: "除夜の鐘", en: "The temple bell rung on New Year's Eve" },
  };

  function getCaption(month, day, lang) {
    const key = `${month}-${day}`;
    const entry =
      SPECIAL_CAPTIONS[key] ||
      (MONTH_CAPTIONS[month] && MONTH_CAPTIONS[month][variantIndex(day)]) ||
      MONTH_CAPTIONS[1][0];
    return lang === "en" ? entry.en : entry.ja;
  }

  global.KoyomiIllustration = {
    getIllustrationSVG,
    getMoonPhaseSVG,
    getSeason,
    getCaption,
    SEASON_COLORS,
  };
})(typeof window !== "undefined" ? window : globalThis);
