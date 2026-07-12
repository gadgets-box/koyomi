/**
 * illustrations.js
 * 「切り絵（kirie）」風・単色シルエットの季節イラストを生成する。
 * 各月ごとに3種類（上旬・中旬・下旬）のバリエーションを用意し、月の中でも
 * 見た目が移り変わるようにしている。色は外部CSSに依存せず、生成時に
 * インライン属性として直接埋め込むため、CSSの読み込みに問題があっても
 * イラスト自体は必ず表示される。
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

  // 上旬(0) / 中旬(1) / 下旬(2) のどのバリエーションを使うか
  function variantIndex(day) {
    if (day <= 10) return 0;
    if (day <= 20) return 1;
    return 2;
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

  function bird(cx, cy, size, color) {
    return `<path d="M ${cx - size} ${cy} Q ${cx - size / 2} ${cy - size} ${cx} ${cy}
      Q ${cx + size / 2} ${cy - size} ${cx + size} ${cy}"
      fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" />`;
  }

  function butterfly(cx, cy, size, color) {
    return `<g>
      <ellipse cx="${cx - size * 0.5}" cy="${cy}" rx="${size * 0.6}" ry="${size * 0.4}" fill="${color}" transform="rotate(-20 ${cx - size * 0.5} ${cy})" />
      <ellipse cx="${cx + size * 0.5}" cy="${cy}" rx="${size * 0.6}" ry="${size * 0.4}" fill="${color}" transform="rotate(20 ${cx + size * 0.5} ${cy})" />
      <line x1="${cx}" y1="${cy - size * 0.4}" x2="${cx}" y2="${cy + size * 0.4}" stroke="${color}" stroke-width="1.5" />
    </g>`;
  }

  function dragonfly(cx, cy, size, color) {
    return `<g opacity="0.85">
      <line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy + size * 1.6}" stroke="${color}" stroke-width="2" stroke-linecap="round" />
      <ellipse cx="${cx - size}" cy="${cy}" rx="${size}" ry="${size * 0.35}" fill="${color}" opacity="0.7" />
      <ellipse cx="${cx + size}" cy="${cy}" rx="${size}" ry="${size * 0.35}" fill="${color}" opacity="0.7" />
      <circle cx="${cx}" cy="${cy - size * 0.3}" r="${size * 0.35}" fill="${color}" />
    </g>`;
  }

  function heart(cx, cy, size, color) {
    return `<path d="M ${cx} ${cy + size * 0.8}
      C ${cx - size * 1.3} ${cy - size * 0.4}, ${cx - size * 0.5} ${cy - size * 1.3}, ${cx} ${cy - size * 0.5}
      C ${cx + size * 0.5} ${cy - size * 1.3}, ${cx + size * 1.3} ${cy - size * 0.4}, ${cx} ${cy + size * 0.8} Z"
      fill="${color}" />`;
  }

  function lantern(cx, cy, w, h, color) {
    return `<g>
      <line x1="${cx}" y1="${cy - h / 2 - 14}" x2="${cx}" y2="${cy - h / 2}" stroke="${color}" stroke-width="1.5" />
      <ellipse cx="${cx}" cy="${cy}" rx="${w / 2}" ry="${h / 2}" fill="${color}" opacity="0.85" />
      <line x1="${cx}" y1="${cy + h / 2}" x2="${cx}" y2="${cy + h / 2 + 10}" stroke="${color}" stroke-width="1.5" />
    </g>`;
  }

  function candyBag(cx, cy, w, h, color) {
    return `<g>
      <path d="M ${cx - w / 2} ${cy + h} L ${cx - w / 6} ${cy} L ${cx + w / 6} ${cy} L ${cx + w / 2} ${cy + h} Z" fill="${color}" />
      <line x1="${cx - w / 6}" y1="${cy}" x2="${cx - w / 10}" y2="${cy - 22}" stroke="${color}" stroke-width="3" stroke-linecap="round" />
      <line x1="${cx + w / 6}" y1="${cy}" x2="${cx + w / 10}" y2="${cy - 22}" stroke="${color}" stroke-width="3" stroke-linecap="round" />
    </g>`;
  }

  function snow(points, color) {
    return points.map(([x, y, r]) => dot(x, y, r, color)).join("");
  }

  // ---- 月ごと・上旬/中旬/下旬ごとのシーン ----

  function buildScenes(accent) {
    const ink = INK;
    return {
      1: [
        () => `
          ${dot(150, 70, 34, accent)}
          ${branch(40, 190, 70, 120, ink)}${branch(70, 120, 55, 90, ink)}${branch(70, 120, 95, 95, ink)}
          ${branch(230, 190, 205, 115, ink)}${branch(205, 115, 185, 85, ink)}${branch(205, 115, 225, 92, ink)}
          ${dot(55, 88, 9, ink)}${dot(95, 93, 8, ink)}${dot(185, 83, 9, ink)}${dot(225, 90, 8, ink)}
          <path d="M 0 210 Q 75 195 150 210 T 300 210" fill="none" stroke="${accent}" stroke-width="2" />
        `,
        () => `
          ${branch(40, 190, 70, 110, ink)}${branch(70, 110, 50, 80, ink)}${branch(70, 110, 100, 90, ink)}
          ${branch(230, 190, 200, 110, ink)}${branch(200, 110, 175, 80, ink)}${branch(200, 110, 225, 90, ink)}
          ${dot(50, 78, 9, ink)}${dot(100, 88, 8, ink)}${dot(175, 78, 9, ink)}${dot(225, 88, 8, ink)}
          ${snow([[30,40,3],[80,20,2.5],[150,35,3],[210,15,2],[260,45,3],[100,60,2],[190,55,2.5]], accent)}
        `,
        () => `
          ${mountain(150, 190, 260, 60, accent)}
          ${branch(60, 190, 80, 130, ink)}${branch(80, 130, 65, 105, ink)}${branch(80, 130, 100, 108, ink)}
          ${dot(65, 100, 8, ink)}${dot(100, 103, 7, ink)}
          ${bird(150, 50, 14, ink)}${bird(190, 40, 10, ink)}${bird(120, 45, 9, ink)}
        `,
      ],
      2: [
        () => `
          ${branch(30, 200, 120, 60, ink, 4)}${branch(120, 60, 165, 42, ink, 3)}
          ${blossomCluster(165, 42, 8, accent)}${blossomCluster(140, 90, 5, accent)}
          ${snow([[220,50,3],[245,90,2.5],[20,60,2.5],[200,20,2]], accent)}
        `,
        () => `
          ${branch(30, 200, 120, 60, ink, 4)}${branch(120, 60, 170, 40, ink, 3)}${branch(120, 60, 90, 30, ink, 3)}
          ${blossomCluster(170, 40, 10, accent)}${blossomCluster(90, 28, 8, accent)}${blossomCluster(60, 120, 7, accent)}${blossomCluster(140, 90, 6, accent)}
          ${dot(190, 55, 8, ink, 0.85)}${dot(196, 50, 3, accent)}
        `,
        () => `
          ${dot(230, 40, 22, accent, 0.5)}
          ${branch(30, 200, 120, 60, ink, 4)}${branch(120, 60, 170, 40, ink, 3)}
          ${blossomCluster(170, 40, 9, accent)}${blossomCluster(60, 120, 7, accent)}${blossomCluster(110, 100, 6, accent)}
          ${butterfly(210, 130, 8, accent)}
        `,
      ],
      3: [
        () => `
          ${branch(20, 60, 240, 60, ink, 3)}${branch(60, 60, 55, 35, ink)}${branch(150, 60, 155, 35, ink)}
          ${dot(55, 32, 4, accent)}${dot(155, 32, 4, accent)}
          ${dot(30, 100, 3, accent)}${dot(90, 115, 3, accent)}${dot(180, 105, 3, accent)}${dot(220, 120, 3, accent)}
        `,
        () => `
          ${branch(20, 60, 240, 60, ink, 3)}${branch(60, 60, 50, 20, ink)}${branch(140, 60, 150, 15, ink)}
          ${blossomCluster(50, 20, 8, accent)}${blossomCluster(150, 15, 8, accent)}
          ${butterfly(100, 110, 8, accent)}
        `,
        () => `
          ${branch(20, 60, 240, 60, ink, 3)}${branch(60, 60, 50, 20, ink)}${branch(140, 60, 150, 15, ink)}${branch(200, 60, 210, 25, ink)}
          ${blossomCluster(50, 20, 9, accent)}${blossomCluster(150, 15, 9, accent)}${blossomCluster(210, 25, 8, accent)}
          ${blossomCluster(30, 90, 6, accent)}${blossomCluster(90, 110, 7, accent)}${blossomCluster(180, 100, 6, accent)}${blossomCluster(220, 120, 5, accent)}
        `,
      ],
      4: [
        () => `
          ${blossomCluster(60, 40, 10, accent)}${blossomCluster(140, 25, 11, accent)}${blossomCluster(210, 55, 9, accent)}${blossomCluster(30, 100, 8, accent)}
          ${dot(100, 140, 3, accent)}${dot(180, 160, 3, accent)}
        `,
        () => `
          ${blossomCluster(60, 40, 10, accent)}${blossomCluster(140, 25, 11, accent)}${blossomCluster(210, 55, 9, accent)}${blossomCluster(30, 100, 8, accent)}
          ${dot(100, 140, 3, accent)}${dot(180, 160, 3, accent)}${dot(230, 120, 2.5, accent)}${dot(70, 180, 2.5, accent)}${dot(150, 170, 2.5, accent)}${dot(200, 90, 2, accent)}
        `,
        () => `
          ${blossomCluster(60, 40, 8, accent)}${blossomCluster(140, 25, 8, accent)}${blossomCluster(210, 55, 7, accent)}
          ${dot(90, 60, 5, ink, 0.6)}${dot(170, 45, 5, ink, 0.6)}${dot(230, 80, 5, ink, 0.6)}
          ${dot(100, 140, 3, accent)}${dot(180, 160, 3, accent)}
        `,
      ],
      5: [
        () => `
          ${branch(140, 190, 140, 40, ink, 4)}${branch(140, 60, 220, 50, ink)}${branch(140, 90, 210, 85, ink)}
          <path d="M140,55 Q210,40 235,55 Q210,70 140,55 Z" fill="${accent}" />
          <path d="M140,88 Q205,78 225,88 Q205,98 140,88 Z" fill="${accent}" opacity="0.7" />
          ${blossomCluster(40, 140, 7, accent)}${blossomCluster(70, 170, 6, accent)}
        `,
        () => `
          ${branch(140, 190, 140, 40, ink, 4)}${branch(140, 60, 220, 50, ink)}
          <path d="M140,55 Q210,40 235,55 Q210,70 140,55 Z" fill="${accent}" />
          ${dot(60, 130, 6, accent)}${dot(90, 160, 6, accent)}${dot(200, 150, 6, accent)}
          ${dragonfly(220, 110, 6, ink)}
        `,
        () => `
          ${branch(140, 190, 140, 40, ink, 4)}
          <path d="M140,55 Q195,45 215,55 Q195,65 140,55 Z" fill="${accent}" opacity="0.8" />
          ${dot(60, 130, 6, accent)}${dot(90, 160, 6, accent)}${dot(200, 150, 6, accent)}${dot(230, 120, 5, accent)}
          ${dot(255, 45, 20, accent, 0.4)}
        `,
      ],
      6: [
        () => `
          ${blossomCluster(140, 110, 7, accent, 6)}${blossomCluster(120, 130, 6, accent, 6)}
          <line x1="90" y1="10" x2="80" y2="50" stroke="${ink}" stroke-width="2" opacity="0.55" />
          <line x1="200" y1="15" x2="190" y2="55" stroke="${ink}" stroke-width="2" opacity="0.55" />
        `,
        () => `
          ${blossomCluster(120, 90, 8, accent, 6)}${blossomCluster(100, 110, 7, accent, 6)}${blossomCluster(140, 115, 7, accent, 6)}${blossomCluster(120, 130, 8, accent, 6)}
          <line x1="40" y1="20" x2="30" y2="55" stroke="${ink}" stroke-width="2" opacity="0.55" />
          <line x1="90" y1="10" x2="80" y2="50" stroke="${ink}" stroke-width="2" opacity="0.55" />
          <line x1="200" y1="15" x2="190" y2="55" stroke="${ink}" stroke-width="2" opacity="0.55" />
          <line x1="240" y1="30" x2="230" y2="65" stroke="${ink}" stroke-width="2" opacity="0.55" />
        `,
        () => `
          ${blossomCluster(120, 130, 8, accent, 6)}${blossomCluster(100, 150, 6, accent, 6)}
          <path d="M20,150 A130,130 0 0 1 280,150" fill="none" stroke="${accent}" stroke-width="3" opacity="0.6" />
          <path d="M45,150 A105,105 0 0 1 255,150" fill="none" stroke="${ink}" stroke-width="2" opacity="0.3" />
        `,
      ],
      7: [
        () => `
          ${branch(150, 190, 150, 30, ink, 4)}
          ${branch(150, 60, 190, 45, ink, 2)}${branch(150, 90, 195, 80, ink, 2)}${branch(150, 120, 190, 115, ink, 2)}
          ${dot(190, 45, 6, accent)}${dot(195, 80, 6, accent)}${dot(190, 115, 6, accent)}
          ${dot(120, 55, 3, accent)}${dot(110, 85, 3, accent)}
        `,
        () => `
          ${dot(150, 70, 2.5, accent)}${dot(90, 40, 2, accent)}${dot(210, 50, 2, accent)}${dot(60, 90, 1.8, accent)}${dot(240, 90, 1.8, accent)}
          <path d="M20,30 Q150,10 280,30" fill="none" stroke="${accent}" stroke-width="1.5" opacity="0.4" />
        `,
        () => `
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
      ],
      8: [
        () => `
          ${dot(70, 55, 20, ink, 0.85)}${dot(95, 45, 26, ink, 0.85)}${dot(125, 55, 20, ink, 0.85)}${dot(50, 65, 15, ink, 0.85)}
          ${blossomCluster(210, 140, 11, accent, 5)}${blossomCluster(230, 110, 7, accent, 5)}${branch(210, 150, 205, 190, accent, 3)}
        `,
        () => `
          ${mountain(150, 190, 220, 90, accent)}
          ${mountain(90, 190, 130, 55, ink)}
          ${dot(230, 45, 24, accent, 0.6)}
        `,
        () => `
          ${lantern(90, 110, 44, 55, accent)}
          ${lantern(200, 100, 40, 50, accent)}
          ${dot(150, 40, 2, ink, 0.5)}${dot(180, 30, 1.5, ink, 0.5)}
        `,
      ],
      9: [
        () => `
          ${dot(190, 55, 30, accent)}
          <path d="M40,190 Q45,90 55,60" fill="none" stroke="${ink}" stroke-width="2" />
          <path d="M60,190 Q68,100 80,65" fill="none" stroke="${ink}" stroke-width="2" />
        `,
        () => `
          ${dot(190, 55, 26, accent)}
          <path d="M40,190 Q45,90 55,60" fill="none" stroke="${ink}" stroke-width="2" />
          <path d="M60,190 Q68,100 80,65" fill="none" stroke="${ink}" stroke-width="2" />
          <path d="M85,190 Q92,110 100,75" fill="none" stroke="${ink}" stroke-width="2" />
          ${dragonfly(150, 90, 7, accent)}
        `,
        () => `
          ${dot(190, 55, 20, accent)}
          <path d="M40,190 Q45,90 55,60" fill="none" stroke="${ink}" stroke-width="2" />
          <path d="M60,190 Q68,100 80,65" fill="none" stroke="${ink}" stroke-width="2" />
          ${dot(230, 150, 8, ink, 0.8)}${dot(245, 160, 6, ink, 0.8)}
        `,
      ],
      10: [
        () => `
          ${branch(140, 190, 140, 60, ink, 4)}${branch(140, 90, 70, 55, ink)}
          ${blossomCluster(70, 55, 8, accent)}${blossomCluster(140, 60, 7, accent)}
          ${dot(90, 130, 3, ink, 0.5)}
        `,
        () => `
          ${branch(140, 190, 140, 60, ink, 4)}${branch(140, 90, 60, 50, ink)}${branch(140, 110, 220, 70, ink)}
          ${blossomCluster(60, 50, 10, accent)}${blossomCluster(220, 70, 10, accent)}${blossomCluster(140, 60, 9, accent)}
          ${dot(30, 130, 4, accent)}${dot(230, 150, 4, accent)}${dot(100, 170, 3, accent)}
        `,
        () => `
          ${branch(200, 190, 200, 90, ink, 4)}
          ${dot(200, 80, 12, accent)}${dot(180, 100, 10, accent)}${dot(220, 105, 10, accent)}
          ${dot(60, 150, 4, accent)}${dot(90, 170, 3, accent)}${dot(40, 130, 3, accent)}${dot(120, 160, 3, accent)}
        `,
      ],
      11: [
        () => `
          ${branch(140, 190, 140, 50, ink, 4)}${branch(140, 80, 90, 55, ink)}
          ${blossomCluster(90, 55, 8, accent)}${blossomCluster(140, 50, 7, accent)}
        `,
        () => `
          ${branch(140, 190, 140, 50, ink, 4)}${branch(140, 80, 80, 45, ink)}${branch(140, 100, 200, 60, ink)}
          ${blossomCluster(80, 45, 9, accent)}${blossomCluster(200, 60, 9, accent)}${blossomCluster(140, 50, 8, accent)}
        `,
        () => `
          ${branch(200, 190, 200, 100, ink, 3)}
          ${dot(200, 90, 11, accent)}${dot(180, 110, 9, accent)}${dot(220, 115, 9, accent)}
          ${dot(60, 160, 4, ink, 0.6)}${dot(90, 170, 3, ink, 0.6)}
        `,
      ],
      12: [
        () => `
          ${snow([[40,40,3],[90,20,2.5],[150,45,3],[200,25,2],[240,55,3]], accent)}
          ${branch(70, 190, 80, 130, ink, 3)}
          ${dot(75, 125, 4, ink)}${dot(85, 132, 4, ink)}
        `,
        () => `
          ${snow([[40,40,3],[90,20,2.5],[150,45,3],[200,25,2],[240,55,3],[20,90,2],[120,15,2],[260,90,2.5],[170,80,2]], accent)}
          ${branch(70, 190, 80, 120, ink, 3)}
          ${dot(75, 115, 4, ink)}${dot(85, 122, 4, ink)}${dot(70, 128, 4, ink)}${dot(82, 132, 4, ink)}
        `,
        () => `
          ${mountain(150, 190, 260, 70, accent)}
          ${snow([[60,40,3],[140,20,2.5],[220,45,3],[260,25,2]], accent)}
          ${branch(70, 190, 78, 145, ink, 3)}
          ${dot(74, 140, 4, ink)}${dot(82, 145, 4, ink)}
        `,
      ],
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
      "1-1": scenes[1][0],
      "2-3": () => `
        ${dot(90, 90, 26, accent)}${dot(180, 70, 20, accent)}
        <path d="M65,80 l-14,-10 M65,100 l-16,4 M112,80 l14,-10 M112,100 l16,4" stroke="${ink}" stroke-width="3" stroke-linecap="round" fill="none" />
        ${dot(40, 150, 3, ink, 0.6)}${dot(230, 140, 3, ink, 0.6)}
      `,
      "2-14": () => `
        ${heart(120, 100, 34, accent)}
        ${heart(200, 130, 18, accent)}
        ${heart(70, 140, 14, accent)}
      `,
      "3-3": () => `
        <path d="M110,140 L150,60 L190,140 Z" fill="${accent}" />
        ${dot(150, 55, 9, accent)}
        ${blossomCluster(70, 100, 7, accent)}${blossomCluster(220, 110, 7, accent)}
      `,
      "5-5": scenes[5][0],
      "7-7": scenes[7][0],
      "8-11": scenes[8][1],
      "8-15": scenes[8][2],
      "10-31": halloween,
      "11-15": () => `
        ${candyBag(150, 110, 90, 60, accent)}
        ${dot(150, 60, 6, accent)}
      `,
      "12-24": christmas,
      "12-25": christmas,
      "12-31": scenes[12][2],
    };
  }

  function getIllustrationSVG(month, day) {
    const accent = accentColorForMonth(month);
    const scenes = buildScenes(accent);
    const special = buildSpecial(accent);
    const key = `${month}-${day}`;
    const builder =
      special[key] || (scenes[month] && scenes[month][variantIndex(day)]) || scenes[1][0];
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
    1: [
      { ja: "松と初日の出", en: "Pine branches and the New Year's sunrise" },
      { ja: "雪をかぶった松", en: "Snow-capped pine branches" },
      { ja: "松と正月の余韻", en: "Pine branches in the lingering New Year mood" },
    ],
    2: [
      { ja: "咲き始めの梅と雪", en: "Early plum blossoms in the snow" },
      { ja: "満開の梅とメジロ", en: "Plum blossoms in full bloom with a white-eye bird" },
      { ja: "梅とやわらかな春の日差し", en: "Plum blossoms in soft early-spring sunlight" },
    ],
    3: [
      { ja: "芽吹く若草", en: "Sprouting spring grass" },
      { ja: "ちらほら咲きの桜", en: "Cherry blossoms starting to open" },
      { ja: "桜と若葉", en: "Cherry blossoms alongside fresh green leaves" },
    ],
    4: [
      { ja: "満開の桜", en: "Cherry blossoms in full bloom" },
      { ja: "桜吹雪", en: "Cherry blossom petals swirling in the wind" },
      { ja: "葉桜へ移りゆく頃", en: "Cherry blossoms giving way to fresh leaves" },
    ],
    5: [
      { ja: "若葉と鯉のぼり", en: "Fresh greenery and carp streamers" },
      { ja: "深まる緑とトンボ", en: "Deepening greenery with a dragonfly" },
      { ja: "初夏の気配", en: "The first hints of early summer" },
    ],
    6: [
      { ja: "咲き始めの紫陽花", en: "Hydrangeas just beginning to bloom" },
      { ja: "満開の紫陽花と雨", en: "Hydrangeas in full bloom in the rain" },
      { ja: "雨上がりの虹", en: "A rainbow after the rain" },
    ],
    7: [
      { ja: "七夕の笹飾り", en: "Bamboo decorations for the Tanabata festival" },
      { ja: "天の川と星", en: "The Milky Way and stars" },
      { ja: "打ち上げ花火", en: "Fireworks lighting up the sky" },
    ],
    8: [
      { ja: "入道雲と朝顔", en: "Summer thunderclouds and morning glories" },
      { ja: "夏山と青空", en: "Summer mountains under a blue sky" },
      { ja: "お盆の灯籠", en: "Lanterns for the Obon festival" },
    ],
    9: [
      { ja: "満月とすすき", en: "The full moon with pampas grass" },
      { ja: "月とトンボ", en: "The moon and a dragonfly" },
      { ja: "欠けてゆく月と実り", en: "The waning moon and autumn's harvest" },
    ],
    10: [
      { ja: "色づき始めの紅葉", en: "Autumn leaves just beginning to turn" },
      { ja: "見頃の紅葉", en: "Autumn leaves at their peak" },
      { ja: "落ち葉と柿", en: "Fallen leaves and persimmons" },
    ],
    11: [
      { ja: "色づき始めの銀杏", en: "Ginkgo leaves just beginning to turn gold" },
      { ja: "黄金色の銀杏並木", en: "A golden avenue of ginkgo trees" },
      { ja: "晩秋の実り", en: "The harvest of late autumn" },
    ],
    12: [
      { ja: "初雪と南天", en: "The season's first snow and nanten berries" },
      { ja: "本格的な雪景色", en: "A landscape blanketed in snow" },
      { ja: "年の暮れ", en: "The close of the year" },
    ],
  };

  const SPECIAL_CAPTIONS = {
    "1-1": { ja: "初日の出と松飾り", en: "New Year's sunrise and pine decorations" },
    "2-3": { ja: "節分の豆まきと鬼", en: "Setsubun bean-throwing and the oni" },
    "2-14": { ja: "バレンタインデーのハート", en: "Hearts for Valentine's Day" },
    "3-3": { ja: "ひな祭りのひな人形", en: "Hinamatsuri doll display" },
    "5-5": { ja: "こどもの日の鯉のぼり", en: "Children's Day carp streamers" },
    "7-7": { ja: "七夕の星まつり", en: "The Tanabata star festival" },
    "8-11": { ja: "山の日の夏山", en: "Summer mountains for Mountain Day" },
    "8-15": { ja: "お盆の灯籠", en: "Lanterns for the Obon festival" },
    "10-31": { ja: "ハロウィンのかぼちゃ", en: "A Halloween pumpkin" },
    "11-15": { ja: "七五三の千歳飴", en: "Chitose-ame candy for Shichi-Go-San" },
    "12-24": { ja: "クリスマスイブの雪山", en: "A snowy hill on Christmas Eve" },
    "12-25": { ja: "クリスマスの雪山", en: "A snowy hill on Christmas Day" },
    "12-31": { ja: "大晦日の雪景色", en: "A snowy scene on New Year's Eve" },
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
