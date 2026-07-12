/**
 * illustrations.js
 * 「切り絵（kirie）」風・単色シルエットの季節イラストを月ごと・特別な日ごとに
 * 生成する。色は外部CSSに依存せず、生成時にインライン属性として直接埋め込む
 * ため、CSSの読み込みに問題があってもイラスト自体は必ず表示される。
 */
(function (global) {
  const SEASON_COLORS = {
    winter: "#35506e",
    spring: "#c76a7f",
    summer: "#1f7a6c",
    autumn: "#b1531f",
  };
  const INK = "#2b2621";

  function getSeason(month) {
    if (month === 12 || month === 1 || month === 2) return "winter";
    if (month >= 3 && month <= 5) return "spring";
    if (month >= 6 && month <= 8) return "summer";
    return "autumn";
  }

  function accentColorForMonth(month) {
    return SEASON_COLORS[getSeason(month)];
  }

  // ---- 図形ヘルパー（すべて fill / stroke をインラインで指定） ----

  function petal(cx, cy, r, color) {
    return `<ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${r * 0.62}" fill="${color}" />`;
  }

  function blossomCluster(cx, cy, scale, color, petals) {
    const n = petals || 5;
    let out = "";
    for (let i = 0; i < n; i++) {
      const angle = (Math.PI * 2 * i) / n;
      const px = cx + Math.cos(angle) * scale;
      const py = cy + Math.sin(angle) * scale;
      out += `<g transform="rotate(${(angle * 180) / Math.PI} ${px} ${py})">${petal(
        px,
        py,
        scale * 0.9,
        color
      )}</g>`;
    }
    out += `<circle cx="${cx}" cy="${cy}" r="${scale * 0.5}" fill="${color}" />`;
    return out;
  }

  function branch(x1, y1, x2, y2, color, width) {
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${
      width || 3
    }" stroke-linecap="round" />`;
  }

  function dot(cx, cy, r, color, opacity) {
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}"${
      opacity ? ` opacity="${opacity}"` : ""
    } />`;
  }

  function mountain(cx, baseY, w, h, color) {
    return `<path d="M ${cx - w / 2} ${baseY} L ${cx} ${baseY - h} L ${
      cx + w / 2
    } ${baseY} Z" fill="${color}" />`;
  }

  function buildScenes(accent) {
    const ink = INK;
    return {
      1: () => `
        ${dot(150, 70, 34, accent)}
        ${branch(40, 190, 70, 120, ink)}${branch(70, 120, 55, 90, ink)}${branch(70, 120, 95, 95, ink)}
        ${branch(230, 190, 205, 115, ink)}${branch(205, 115, 185, 85, ink)}${branch(205, 115, 225, 92, ink)}
        ${dot(55, 88, 9, ink)}${dot(95, 93, 8, ink)}${dot(185, 83, 9, ink)}${dot(225, 90, 8, ink)}
        <path d="M 0 210 Q 75 195 150 210 T 300 210" fill="none" stroke="${accent}" stroke-width="2" />
      `,
      2: () => `
        ${branch(30, 200, 120, 60, ink, 4)}${branch(120, 60, 170, 40, ink, 3)}${branch(120, 60, 90, 30, ink, 3)}
        ${blossomCluster(170, 40, 10, accent)}${blossomCluster(90, 28, 8, accent)}${blossomCluster(60, 120, 7, accent)}${blossomCluster(140, 90, 6, accent)}
        ${dot(230, 50, 3, ink, 0.5)}${dot(245, 90, 2.5, ink, 0.5)}${dot(20, 60, 2.5, ink, 0.5)}
      `,
      3: () => `
        ${branch(20, 60, 240, 60, ink, 3)}${branch(60, 60, 50, 20, ink)}${branch(140, 60, 150, 15, ink)}${branch(200, 60, 210, 25, ink)}
        ${blossomCluster(50, 20, 9, accent)}${blossomCluster(150, 15, 9, accent)}${blossomCluster(210, 25, 8, accent)}
        ${blossomCluster(30, 90, 6, accent)}${blossomCluster(90, 110, 7, accent)}${blossomCluster(180, 100, 6, accent)}${blossomCluster(220, 120, 5, accent)}
      `,
      4: () => `
        ${blossomCluster(60, 40, 10, accent)}${blossomCluster(140, 25, 11, accent)}${blossomCluster(210, 55, 9, accent)}${blossomCluster(30, 100, 8, accent)}
        ${dot(100, 140, 3, accent)}${dot(180, 160, 3, accent)}${dot(230, 120, 2.5, accent)}${dot(70, 180, 2.5, accent)}
      `,
      5: () => `
        ${branch(140, 190, 140, 40, ink, 4)}${branch(140, 60, 220, 50, ink)}${branch(140, 90, 210, 85, ink)}
        <path d="M140,55 Q210,40 235,55 Q210,70 140,55 Z" fill="${accent}" />
        <path d="M140,88 Q205,78 225,88 Q205,98 140,88 Z" fill="${accent}" opacity="0.7" />
        ${blossomCluster(40, 140, 7, accent)}${blossomCluster(70, 170, 6, accent)}
      `,
      6: () => `
        ${blossomCluster(120, 90, 8, accent, 6)}${blossomCluster(100, 110, 7, accent, 6)}${blossomCluster(140, 115, 7, accent, 6)}${blossomCluster(120, 130, 8, accent, 6)}
        <line x1="40" y1="20" x2="30" y2="55" stroke="${ink}" stroke-width="2" opacity="0.55" />
        <line x1="90" y1="10" x2="80" y2="50" stroke="${ink}" stroke-width="2" opacity="0.55" />
        <line x1="200" y1="15" x2="190" y2="55" stroke="${ink}" stroke-width="2" opacity="0.55" />
        <line x1="240" y1="30" x2="230" y2="65" stroke="${ink}" stroke-width="2" opacity="0.55" />
      `,
      7: () => `
        ${dot(150, 70, 2.5, accent)}
        ${[0, 45, 90, 135, 180, 225, 270, 315]
          .map(
            (a) =>
              `<line x1="150" y1="70" x2="${150 + Math.cos((a * Math.PI) / 180) * 38}" y2="${
                70 + Math.sin((a * Math.PI) / 180) * 38
              }" stroke="${accent}" stroke-width="2" stroke-linecap="round" />`
          )
          .join("")}
        ${dot(60, 150, 2, ink, 0.6)}${dot(230, 160, 2, ink, 0.6)}${dot(90, 180, 1.5, ink, 0.6)}
      `,
      8: () => `
        ${dot(70, 55, 20, ink, 0.85)}${dot(95, 45, 26, ink, 0.85)}${dot(125, 55, 20, ink, 0.85)}${dot(50, 65, 15, ink, 0.85)}
        ${blossomCluster(210, 140, 11, accent, 5)}${blossomCluster(230, 110, 7, accent, 5)}${branch(210, 150, 205, 190, accent, 3)}
      `,
      9: () => `
        ${dot(190, 55, 30, accent)}
        <path d="M40,190 Q45,90 55,60" fill="none" stroke="${ink}" stroke-width="2" />
        <path d="M60,190 Q68,100 80,65" fill="none" stroke="${ink}" stroke-width="2" />
        <path d="M85,190 Q92,110 100,75" fill="none" stroke="${ink}" stroke-width="2" />
      `,
      10: () => `
        ${branch(140, 190, 140, 60, ink, 4)}${branch(140, 90, 60, 50, ink)}${branch(140, 110, 220, 70, ink)}
        ${blossomCluster(60, 50, 10, accent)}${blossomCluster(220, 70, 10, accent)}${blossomCluster(140, 60, 9, accent)}
        ${dot(30, 130, 4, accent)}${dot(230, 150, 4, accent)}${dot(100, 170, 3, accent)}
      `,
      11: () => `
        ${branch(140, 190, 140, 50, ink, 4)}${branch(140, 80, 80, 45, ink)}${branch(140, 100, 200, 60, ink)}
        ${blossomCluster(80, 45, 9, accent)}${blossomCluster(200, 60, 9, accent)}${blossomCluster(140, 50, 8, accent)}
      `,
      12: () => `
        ${dot(40, 40, 3, accent)}${dot(90, 20, 2.5, accent)}${dot(150, 45, 3, accent)}
        ${dot(200, 25, 2, accent)}${dot(240, 55, 3, accent)}${dot(20, 90, 2, accent)}
        ${dot(120, 15, 2, accent)}${dot(260, 90, 2.5, accent)}
        ${branch(70, 190, 80, 120, ink, 3)}
        ${dot(75, 115, 4, ink)}${dot(85, 122, 4, ink)}${dot(70, 128, 4, ink)}${dot(82, 132, 4, ink)}
      `,
    };
  }

  function buildSpecial(accent) {
    const ink = INK;
    const scenes = buildScenes(accent);
    const halloween = () => `
      <path d="M150,50 Q110,60 105,110 Q100,150 150,155 Q200,150 195,110 Q190,60 150,50 Z" fill="${accent}" />
      <path d="M120,80 h14 M96,110 h-10 M186,80 h-14 M204,110 h10" stroke="${ink}" stroke-width="4" fill="none" stroke-linecap="round" />
    `;
    const christmas = () => `
      ${mountain(150, 180, 120, 120, ink)}
      ${dot(150, 70, 3, accent)}${dot(120, 100, 3, accent)}${dot(180, 110, 3, accent)}
      ${dot(150, 140, 3, accent)}${dot(100, 150, 3, accent)}${dot(200, 150, 3, accent)}
    `;
    return {
      "1-1": scenes[1],
      "2-3": () => `
        ${dot(90, 90, 26, accent)}${dot(180, 70, 20, accent)}
        <path d="M65,80 l-14,-10 M65,100 l-16,4 M112,80 l14,-10 M112,100 l16,4" stroke="${ink}" stroke-width="3" stroke-linecap="round" fill="none" />
        ${dot(40, 150, 3, ink, 0.6)}${dot(230, 140, 3, ink, 0.6)}
      `,
      "3-3": () => `
        <path d="M110,140 L150,60 L190,140 Z" fill="${accent}" />
        ${dot(150, 55, 9, accent)}
        ${blossomCluster(70, 100, 7, accent)}${blossomCluster(220, 110, 7, accent)}
      `,
      "5-5": scenes[5],
      "7-7": scenes[7],
      "10-31": halloween,
      "12-24": christmas,
      "12-25": christmas,
      "12-31": scenes[12],
    };
  }

  function getIllustrationSVG(month, day) {
    const accent = accentColorForMonth(month);
    const scenes = buildScenes(accent);
    const special = buildSpecial(accent);
    const key = `${month}-${day}`;
    const builder = special[key] || scenes[month] || scenes[1];
    const inner = builder();
    return `<svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="seasonal illustration">${inner}</svg>`;
  }

  /**
   * 月齢イラスト（月の満ち欠けアイコン）を生成する。
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

  const MONTH_CAPTIONS = {
    1: { ja: "松と初日の出", en: "Pine branches and the New Year's sunrise" },
    2: { ja: "雪の中に咲く梅", en: "Plum blossoms in the snow" },
    3: { ja: "桜と芽吹く若葉", en: "Cherry blossoms and fresh spring leaves" },
    4: { ja: "満開の桜吹雪", en: "Cherry blossoms in full bloom" },
    5: { ja: "若葉と鯉のぼり", en: "Fresh greenery and carp streamers" },
    6: { ja: "紫陽花と梅雨", en: "Hydrangeas in the rainy season" },
    7: { ja: "天の川と打ち上げ花火", en: "The Milky Way and fireworks" },
    8: { ja: "入道雲と朝顔", en: "Summer thunderclouds and morning glories" },
    9: { ja: "お月見とすすき", en: "Moon-viewing with pampas grass" },
    10: { ja: "色づく紅葉", en: "Autumn leaves changing color" },
    11: { ja: "銀杏と実りの秋", en: "Ginkgo leaves and the autumn harvest" },
    12: { ja: "雪と南天の実", en: "Snow and nanten berries" },
  };

  const SPECIAL_CAPTIONS = {
    "1-1": { ja: "初日の出と松飾り", en: "New Year's sunrise and pine decorations" },
    "2-3": { ja: "節分の豆まきと鬼", en: "Setsubun bean-throwing and the oni" },
    "3-3": { ja: "ひな祭りのひな人形", en: "Hinamatsuri doll display" },
    "5-5": { ja: "こどもの日の鯉のぼり", en: "Children's Day carp streamers" },
    "7-7": { ja: "七夕の星まつり", en: "The Tanabata star festival" },
    "10-31": { ja: "ハロウィンのかぼちゃ", en: "A Halloween pumpkin" },
    "12-24": { ja: "クリスマスイブの雪山", en: "A snowy hill on Christmas Eve" },
    "12-25": { ja: "クリスマスの雪山", en: "A snowy hill on Christmas Day" },
    "12-31": { ja: "大晦日の雪景色", en: "A snowy scene on New Year's Eve" },
  };

  function getCaption(month, day, lang) {
    const key = `${month}-${day}`;
    const entry = SPECIAL_CAPTIONS[key] || MONTH_CAPTIONS[month] || MONTH_CAPTIONS[1];
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
