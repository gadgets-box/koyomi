/**
 * illustrations.js
 * 小さく表示しても一目で分かる「アイコン」スタイルの季節イラスト。
 * 1つの図につき主役となるモチーフを1つ（＋ごく小さな添え物）に絞り、
 * 太い線・大きな塗りで構成することで視認性を優先している。
 * 月ごとに4種類（およそ1週間ごと）のバリエーションを用意し、特定の記念日
 * にはさらに専用のイラストを割り当てている。
 * 色は外部CSSに依存せず、生成時にインライン属性として直接埋め込むため、
 * CSSの読み込みに問題があってもイラスト自体は必ず表示される。
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

  // 週インデックス 0-3（およそ1週間ごとに切り替わる）
  function variantIndex(day) {
    if (day <= 7) return 0;
    if (day <= 14) return 1;
    if (day <= 21) return 2;
    return 3;
  }

  // ================= 基本図形ヘルパー =================

  function dot(cx, cy, r, color, opacity) {
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}"${
      opacity ? ` opacity="${opacity}"` : ""
    } />`;
  }

  function line(x1, y1, x2, y2, color, w) {
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${
      w || 4
    }" stroke-linecap="round" />`;
  }

  // ================= モチーフ・アイコン =================
  // すべて中心座標(cx,cy)と大きさ(s)を受け取り、単体で意味が伝わる
  // シンプルで太いシルエットになるように設計している。

  function sunrise(cx, cy, r, color) {
    const rays = [20, 55, 90, 125, 160]
      .map((a) => {
        const rad = (a * Math.PI) / 180;
        const x1 = cx + Math.cos(rad) * (r + 6);
        const y1 = cy - Math.sin(rad) * (r + 6);
        const x2 = cx + Math.cos(rad) * (r + 20);
        const y2 = cy - Math.sin(rad) * (r + 20);
        return line(x1, y1, x2, y2, color, 4);
      })
      .join("");
    return `
      <path d="M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy} Z" fill="${color}" />
      ${line(cx - r - 14, cy, cx + r + 14, cy, color, 3)}
      ${rays}
    `;
  }

  function pineSprig(cx, cy, s, color) {
    const needleFan = (bx, by, angle) => {
      const spread = [-26, -13, 0, 13, 26];
      return spread
        .map((da) => {
          const a = ((angle + da) * Math.PI) / 180;
          const x2 = bx + Math.cos(a) * s * 0.55;
          const y2 = by - Math.sin(a) * s * 0.55;
          return line(bx, by, x2, y2, color, 3.5);
        })
        .join("");
    };
    return `
      ${line(cx, cy + s, cx, cy - s * 0.1, INK, 5)}
      ${line(cx, cy - s * 0.1, cx - s * 0.7, cy - s * 0.55, INK, 4)}
      ${line(cx, cy - s * 0.1, cx + s * 0.7, cy - s * 0.75, INK, 4)}
      ${line(cx, cy - s * 0.1, cx, cy - s * 1.05, INK, 4)}
      ${needleFan(cx - s * 0.7, cy - s * 0.55, 55)}
      ${needleFan(cx + s * 0.7, cy - s * 0.75, 60)}
      ${needleFan(cx, cy - s * 1.05, 90)}
    `;
  }

  function kiteIcon(cx, cy, s, color) {
    return `
      <path d="M ${cx} ${cy - s} L ${cx + s * 0.7} ${cy} L ${cx} ${cy + s} L ${cx - s * 0.7} ${cy} Z" fill="${color}" />
      ${line(cx, cy - s, cx, cy + s, INK, 1.5)}
      ${line(cx - s * 0.7, cy, cx + s * 0.7, cy, INK, 1.5)}
      <path d="M ${cx} ${cy + s} q 8 10 -4 18 q 12 6 -2 18" fill="none" stroke="${color}" stroke-width="4" stroke-linecap="round" />
    `;
  }

  function budBranch(cx, cy, s, color) {
    const bx = cx + s * 0.25;
    const by = cy - s * 0.5;
    return `
      ${line(cx - s * 1.1, cy + s * 0.7, bx - s * 0.15, by + s * 0.15, INK, 4)}
      <path d="M ${bx} ${by - s * 0.55} Q ${bx + s * 0.32} ${by - s * 0.1} ${bx} ${by + s * 0.4} Q ${bx - s * 0.32} ${by - s * 0.1} ${bx} ${by - s * 0.55} Z" fill="${color}" />
      <line x1="${bx}" y1="${by - s * 0.4}" x2="${bx}" y2="${by + s * 0.25}" stroke="${INK}" stroke-width="1.5" opacity="0.4" />
      ${dot(cx - s * 0.45, cy + s * 0.25, s * 0.16, color, 0.7)}
    `;
  }

  function snowflakeIcon(cx, cy, r, color) {
    let out = "";
    for (let i = 0; i < 6; i++) {
      const a = (i * 60 * Math.PI) / 180;
      const x2 = cx + Math.cos(a) * r;
      const y2 = cy + Math.sin(a) * r;
      out += line(cx, cy, x2, y2, color, 4);
      const mx = cx + Math.cos(a) * r * 0.6;
      const my = cy + Math.sin(a) * r * 0.6;
      const a1 = a + Math.PI / 4;
      const a2 = a - Math.PI / 4;
      out += line(mx, my, mx + Math.cos(a1) * r * 0.3, my + Math.sin(a1) * r * 0.3, color, 3);
      out += line(mx, my, mx + Math.cos(a2) * r * 0.3, my + Math.sin(a2) * r * 0.3, color, 3);
    }
    return out;
  }

  function bigBlossom(cx, cy, r, color, petals) {
    const n = petals || 5;
    let out = "";
    for (let i = 0; i < n; i++) {
      const a = (Math.PI * 2 * i) / n;
      const px = cx + Math.cos(a) * r;
      const py = cy + Math.sin(a) * r;
      out += `<g transform="rotate(${(a * 180) / Math.PI} ${px} ${py})">
        <ellipse cx="${px}" cy="${py}" rx="${r * 0.85}" ry="${r * 0.55}" fill="${color}" />
      </g>`;
    }
    out += dot(cx, cy, r * 0.42, INK, 0.7);
    return out;
  }

  function oniMask(cx, cy, s, color) {
    return `
      <circle cx="${cx}" cy="${cy}" r="${s}" fill="${color}" />
      <path d="M ${cx - s * 0.5} ${cy - s * 0.85} L ${cx - s * 0.22} ${cy - s * 1.5} L ${cx - s * 0.02} ${cy - s * 0.85} Z" fill="${color}" />
      <path d="M ${cx + s * 0.5} ${cy - s * 0.85} L ${cx + s * 0.22} ${cy - s * 1.5} L ${cx + s * 0.02} ${cy - s * 0.85} Z" fill="${color}" />
      ${dot(cx - s * 0.35, cy - s * 0.05, s * 0.15, INK)}
      ${dot(cx + s * 0.35, cy - s * 0.05, s * 0.15, INK)}
      <path d="M ${cx - s * 0.3} ${cy + s * 0.5} Q ${cx} ${cy + s * 0.72} ${cx + s * 0.3} ${cy + s * 0.5}" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round" />
    `;
  }

  function birdOnBranch(cx, cy, s, color) {
    return `
      ${line(cx - s * 1.3, cy + s * 0.3, cx + s * 1.3, cy + s * 0.5, INK, 4)}
      <path d="M ${cx - s * 0.5} ${cy} Q ${cx} ${cy - s * 0.7} ${cx + s * 0.5} ${cy}
        Q ${cx + s * 0.15} ${cy + s * 0.15} ${cx} ${cy - s * 0.05}
        Q ${cx - s * 0.15} ${cy + s * 0.15} ${cx - s * 0.5} ${cy} Z" fill="${color}" />
      ${dot(cx + s * 0.18, cy - s * 0.35, s * 0.08, INK)}
    `;
  }

  function sproutIcon(cx, cy, s, color) {
    return `
      ${line(cx, cy + s, cx, cy - s * 0.15, color, 4)}
      <path d="M ${cx} ${cy - s * 0.1} Q ${cx - s * 0.8} ${cy - s * 0.6} ${cx - s * 0.9} ${cy - s * 1.15} Q ${cx - s * 0.2} ${cy - s * 0.9} ${cx} ${cy - s * 0.1} Z" fill="${color}" />
      <path d="M ${cx} ${cy - s * 0.1} Q ${cx + s * 0.8} ${cy - s * 0.5} ${cx + s * 0.9} ${cy - s * 1.05} Q ${cx + s * 0.2} ${cy - s * 0.8} ${cx} ${cy - s * 0.1} Z" fill="${color}" />
    `;
  }

  function treeBloom(cx, cy, r, color) {
    return `
      ${line(cx, cy + r * 0.95, cx, cy + r * 0.1, INK, 6)}
      ${dot(cx, cy - r * 0.25, r, color)}
    `;
  }

  function fallingPetalsIcon(cx, cy, s, color) {
    const p = (x, y, r, rot) =>
      `<g transform="rotate(${rot} ${x} ${y})"><ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.6}" fill="${color}" /></g>`;
    return `
      ${p(cx, cy - s * 0.6, s * 0.5, 20)}
      ${p(cx - s * 0.8, cy + s * 0.1, s * 0.32, -15)}
      ${p(cx + s * 0.7, cy + s * 0.3, s * 0.3, 35)}
      ${p(cx - s * 0.2, cy + s * 0.9, s * 0.24, 10)}
      ${p(cx + s * 0.5, cy - s * 0.9, s * 0.2, -25)}
    `;
  }

  function dangoIcon(cx, cy, s, color) {
    return `
      ${line(cx, cy - s * 1.3, cx, cy + s * 1.1, INK, 3)}
      ${dot(cx, cy - s * 0.8, s * 0.42, color)}
      ${dot(cx, cy, s * 0.42, color, 0.78)}
      ${dot(cx, cy + s * 0.8, s * 0.42, color, 0.55)}
    `;
  }

  function leafIcon(cx, cy, s, color) {
    return `
      <path d="M ${cx} ${cy + s} Q ${cx - s} ${cy} ${cx} ${cy - s} Q ${cx + s} ${cy} ${cx} ${cy + s} Z" fill="${color}" />
      ${line(cx, cy + s * 0.8, cx, cy - s * 0.8, INK, 2)}
    `;
  }

  function koinobori(cx, cy, s, color) {
    return `
      <path d="M ${cx - s * 1.3} ${cy - s * 0.35} Q ${cx - s * 0.3} ${cy - s * 0.65} ${cx + s * 0.9} ${cy - s * 0.35}
        Q ${cx + s * 1.5} ${cy - s * 0.15} ${cx + s * 1.5} ${cy}
        Q ${cx + s * 1.5} ${cy + s * 0.15} ${cx + s * 0.9} ${cy + s * 0.35}
        Q ${cx - s * 0.3} ${cy + s * 0.65} ${cx - s * 1.3} ${cy + s * 0.35}
        Q ${cx - s * 1.05} ${cy} ${cx - s * 1.3} ${cy - s * 0.35} Z" fill="${color}" />
      ${line(cx - s * 0.55, cy - s * 0.53, cx - s * 0.55, cy + s * 0.53, INK, 2.5)}
      ${line(cx + s * 0.15, cy - s * 0.42, cx + s * 0.15, cy + s * 0.42, INK, 2.5)}
      <circle cx="${cx - s * 0.95}" cy="${cy - s * 0.05}" r="${s * 0.14}" fill="${INK}" />
      <path d="M ${cx + s * 0.9} ${cy - s * 0.35} L ${cx + s * 1.5} ${cy - s * 0.55} L ${cx + s * 1.15} ${cy} L ${cx + s * 1.5} ${cy + s * 0.55} L ${cx + s * 0.9} ${cy + s * 0.35}" fill="${color}" opacity="0.75" />
    `;
  }

  function ladybugIcon(cx, cy, s, color) {
    return `
      <circle cx="${cx}" cy="${cy}" r="${s}" fill="${color}" />
      ${line(cx, cy - s, cx, cy + s, INK, 2)}
      ${dot(cx - s * 0.4, cy - s * 0.2, s * 0.16, INK)}
      ${dot(cx + s * 0.4, cy - s * 0.2, s * 0.16, INK)}
      ${dot(cx - s * 0.3, cy + s * 0.4, s * 0.14, INK)}
      ${dot(cx, cy - s * 1.05, s * 0.35, INK)}
    `;
  }

  function dragonflyBig(cx, cy, s, color) {
    return `
      ${line(cx, cy - s * 0.9, cx, cy + s * 0.9, INK, 3)}
      <ellipse cx="${cx - s * 0.9}" cy="${cy - s * 0.2}" rx="${s * 0.85}" ry="${s * 0.3}" fill="${color}" opacity="0.8" />
      <ellipse cx="${cx + s * 0.9}" cy="${cy - s * 0.2}" rx="${s * 0.85}" ry="${s * 0.3}" fill="${color}" opacity="0.8" />
      ${dot(cx, cy - s * 0.75, s * 0.3, color)}
    `;
  }

  function hydrangeaBall(cx, cy, s, color) {
    return `
      ${bigBlossom(cx - s * 0.5, cy - s * 0.3, s * 0.5, color, 4)}
      ${bigBlossom(cx + s * 0.5, cy - s * 0.3, s * 0.5, color, 4)}
      ${bigBlossom(cx, cy + s * 0.3, s * 0.55, color, 4)}
      ${bigBlossom(cx, cy - s * 0.65, s * 0.42, color, 4)}
    `;
  }

  function umbrellaIcon(cx, cy, s, color) {
    return `
      <path d="M ${cx - s} ${cy} A ${s} ${s} 0 0 1 ${cx + s} ${cy} Z" fill="${color}" />
      ${line(cx, cy, cx, cy + s * 1.3, INK, 3)}
      <path d="M ${cx} ${cy + s * 1.3} q -10 6 -14 -3" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round" />
      ${[-1, -0.5, 0.5, 1]
        .map((f) => line(cx + f * s, cy, cx + f * s, cy + s * 0.15, color, 3))
        .join("")}
    `;
  }

  function snailIcon(cx, cy, s, color) {
    return `
      <path d="M ${cx - s} ${cy + s * 0.3} Q ${cx - s} ${cy - s * 0.6} ${cx} ${cy - s * 0.6}
        Q ${cx + s * 0.8} ${cy - s * 0.6} ${cx + s * 0.8} ${cy}
        Q ${cx + s * 0.8} ${cy + s * 0.5} ${cx + s * 0.2} ${cy + s * 0.5}
        L ${cx - s} ${cy + s * 0.5} Z" fill="${color}" />
      <circle cx="${cx + s * 0.15}" cy="${cy - s * 0.05}" r="${s * 0.35}" fill="none" stroke="${INK}" stroke-width="2.5" />
      ${line(cx - s, cy + s * 0.5, cx - s * 1.4, cy + s * 0.75, color, 4)}
      ${line(cx - s * 1.15, cy + s * 0.15, cx - s * 1.3, cy - s * 0.15, color, 3)}
      ${line(cx - s * 0.95, cy + s * 0.15, cx - s * 0.85, cy - s * 0.15, color, 3)}
    `;
  }

  function rainbowArc(cx, cy, r, color) {
    return `
      <path d="M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}" fill="none" stroke="${color}" stroke-width="6" opacity="0.9" />
      <path d="M ${cx - r * 0.75} ${cy} A ${r * 0.75} ${r * 0.75} 0 0 1 ${cx + r * 0.75} ${cy}" fill="none" stroke="${INK}" stroke-width="4" opacity="0.35" />
      <path d="M ${cx - r * 0.5} ${cy} A ${r * 0.5} ${r * 0.5} 0 0 1 ${cx + r * 0.5} ${cy}" fill="none" stroke="${color}" stroke-width="4" opacity="0.55" />
    `;
  }

  function tanabataBamboo(cx, cy, s, color) {
    const strip = (x, y, h) => `<rect x="${x - 3}" y="${y}" width="6" height="${h}" fill="${color}" rx="1.5" />`;
    return `
      ${line(cx, cy + s * 1.3, cx, cy - s * 1.3, INK, 5)}
      ${line(cx, cy - s * 0.8, cx - s * 0.5, cy - s * 0.95, INK, 3)}
      ${line(cx, cy - s * 0.2, cx + s * 0.55, cy - s * 0.4, INK, 3)}
      ${strip(cx - s * 0.5, cy - s * 0.95, s * 0.75)}
      ${strip(cx + s * 0.55, cy - s * 0.4, s * 0.65)}
    `;
  }

  function starIcon(cx, cy, r, color) {
    const pts = [];
    for (let i = 0; i < 10; i++) {
      const rad = i % 2 === 0 ? r : r * 0.42;
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      pts.push(`${(cx + Math.cos(a) * rad).toFixed(1)},${(cy + Math.sin(a) * rad).toFixed(1)}`);
    }
    return `<polygon points="${pts.join(" ")}" fill="${color}" />`;
  }

  function fireworkBurst(cx, cy, r, color) {
    const rays = [0, 45, 90, 135, 180, 225, 270, 315]
      .map((a) => {
        const rad = (a * Math.PI) / 180;
        const x2 = cx + Math.cos(rad) * r;
        const y2 = cy + Math.sin(rad) * r;
        return line(cx, cy, x2, y2, color, 3) + dot(x2, y2, 3, color);
      })
      .join("");
    return `${dot(cx, cy, 3, color)}${rays}`;
  }

  function shavedIce(cx, cy, s, color) {
    return `
      <path d="M ${cx - s * 0.7} ${cy} L ${cx + s * 0.7} ${cy} L ${cx + s * 0.25} ${cy + s * 1.1} L ${cx - s * 0.25} ${cy + s * 1.1} Z" fill="${INK}" opacity="0.18" />
      <path d="M ${cx - s * 0.75} ${cy} Q ${cx} ${cy - s * 0.95} ${cx + s * 0.75} ${cy} Q ${cx} ${cy - s * 0.55} ${cx - s * 0.75} ${cy} Z" fill="${color}" />
      ${dot(cx, cy - s * 0.85, s * 0.14, color)}
    `;
  }

  function thunderCloud(cx, cy, s, color) {
    return `
      <circle cx="${cx - s * 0.5}" cy="${cy}" r="${s * 0.55}" fill="${color}" />
      <circle cx="${cx}" cy="${cy - s * 0.3}" r="${s * 0.7}" fill="${color}" />
      <circle cx="${cx + s * 0.55}" cy="${cy}" r="${s * 0.5}" fill="${color}" />
      <rect x="${cx - s * 0.9}" y="${cy}" width="${s * 1.8}" height="${s * 0.4}" fill="${color}" />
    `;
  }

  function morningGlory(cx, cy, s, color) {
    return `
      <path d="M ${cx} ${cy}
        C ${cx - s} ${cy - s * 0.3} ${cx - s * 0.6} ${cy - s * 1.3} ${cx} ${cy - s * 1.3}
        C ${cx + s * 0.6} ${cy - s * 1.3} ${cx + s} ${cy - s * 0.3} ${cx} ${cy} Z" fill="${color}" />
      ${dot(cx, cy - s * 0.75, s * 0.18, INK, 0.4)}
    `;
  }

  function mountainSun(cx, cy, w, h, color) {
    return `
      ${dot(cx + w * 0.28, cy - h * 0.9, w * 0.16, color, 0.7)}
      <path d="M ${cx - w / 2} ${cy} L ${cx} ${cy - h} L ${cx + w / 2} ${cy} Z" fill="${color}" />
    `;
  }

  function lanternBig(cx, cy, w, h, color) {
    return `
      ${line(cx, cy - h / 2 - 16, cx, cy - h / 2, INK, 2)}
      <ellipse cx="${cx}" cy="${cy}" rx="${w / 2}" ry="${h / 2}" fill="${color}" />
      ${line(cx - w * 0.3, cy - h * 0.25, cx + w * 0.3, cy - h * 0.25, INK, 1.5)}
      ${line(cx - w * 0.35, cy + h * 0.25, cx + w * 0.35, cy + h * 0.25, INK, 1.5)}
      ${line(cx, cy + h / 2, cx, cy + h / 2 + 12, INK, 2)}
    `;
  }

  function fullMoonIcon(cx, cy, r, color) {
    return `
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" />
      ${dot(cx - r * 0.3, cy - r * 0.2, r * 0.15, INK, 0.15)}
      ${dot(cx + r * 0.25, cy + r * 0.3, r * 0.1, INK, 0.15)}
    `;
  }

  function pampasGrass(cx, cy, s, color) {
    const blade = (dx, h, rot) => `
      <path d="M ${cx + dx} ${cy + s} Q ${cx + dx * 1.4} ${cy} ${cx + dx * 0.6} ${cy - h}" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round" />
      <g transform="rotate(${rot} ${cx + dx * 0.6} ${cy - h})">
        <ellipse cx="${cx + dx * 0.6}" cy="${cy - h}" rx="${s * 0.16}" ry="${s * 0.4}" fill="${color}" />
      </g>`;
    return blade(-s * 0.55, s * 1.3, -20) + blade(0, s * 1.6, 0) + blade(s * 0.55, s * 1.2, 20);
  }

  function chestnutIcon(cx, cy, s, color) {
    const spike = (dx) =>
      line(cx + dx * s, cy + s * 0.75, cx + dx * s * 1.4, cy + s * 1.05, INK, 2);
    return `
      <ellipse cx="${cx}" cy="${cy + s * 0.2}" rx="${s * 0.75}" ry="${s * 0.65}" fill="${color}" />
      <path d="M ${cx - s * 0.75} ${cy} Q ${cx} ${cy - s * 0.9} ${cx + s * 0.75} ${cy} Q ${cx} ${cy - s * 0.5} ${cx - s * 0.75} ${cy} Z" fill="${INK}" opacity="0.8" />
      ${dot(cx, cy + s * 0.15, s * 0.1, color, 0)}
      ${spike(-0.5)}${spike(-0.2)}${spike(0.2)}${spike(0.5)}
    `;
  }

  function mapleLeaf(cx, cy, s, color) {
    // 丸みのある浅い切れ込みの5裂葉（星型に見えないよう、くぼみを浅くしている）
    const P = (x, y) => `${(cx + x * s).toFixed(1)} ${(cy + y * s).toFixed(1)}`;
    const d = `
      M ${P(0, -1.1)}
      Q ${P(0.55, -0.95)} ${P(0.85, -0.5)}
      Q ${P(0.6, -0.35)} ${P(0.55, -0.05)}
      Q ${P(0.85, 0.2)} ${P(0.68, 0.42)}
      Q ${P(0.35, 0.32)} ${P(0.14, 0.5)}
      Q ${P(0.06, 0.75)} ${P(0, 0.95)}
      Q ${P(-0.06, 0.75)} ${P(-0.14, 0.5)}
      Q ${P(-0.35, 0.32)} ${P(-0.68, 0.42)}
      Q ${P(-0.85, 0.2)} ${P(-0.55, -0.05)}
      Q ${P(-0.6, -0.35)} ${P(-0.85, -0.5)}
      Q ${P(-0.55, -0.95)} ${P(0, -1.1)}
      Z`;
    return `
      <path d="${d}" fill="${color}" />
      ${line(cx, cy + s * 0.95, cx, cy + s * 1.5, INK, 3)}
    `;
  }

  function acornIcon(cx, cy, s, color) {
    return `
      <ellipse cx="${cx}" cy="${cy + s * 0.3}" rx="${s * 0.55}" ry="${s * 0.7}" fill="${color}" />
      <path d="M ${cx - s * 0.6} ${cy - s * 0.25} Q ${cx} ${cy - s * 0.75} ${cx + s * 0.6} ${cy - s * 0.25} Q ${cx} ${cy - s * 0.02} ${cx - s * 0.6} ${cy - s * 0.25} Z" fill="${INK}" />
      ${line(cx, cy - s * 0.75, cx, cy - s * 0.95, INK, 3)}
    `;
  }

  function persimmonIcon(cx, cy, s, color) {
    return `
      <circle cx="${cx}" cy="${cy + s * 0.15}" r="${s * 0.8}" fill="${color}" />
      <path d="M ${cx - s * 0.32} ${cy - s * 0.6} L ${cx} ${cy - s * 0.3} L ${cx + s * 0.32} ${cy - s * 0.6} L ${cx} ${cy - s * 0.78} Z" fill="${INK}" />
      ${line(cx, cy - s * 0.78, cx, cy - s * 0.98, INK, 3)}
    `;
  }

  function pumpkinIcon(cx, cy, s, color) {
    return `
      <ellipse cx="${cx - s * 0.35}" cy="${cy}" rx="${s * 0.4}" ry="${s * 0.65}" fill="${color}" opacity="0.85" />
      <ellipse cx="${cx}" cy="${cy}" rx="${s * 0.4}" ry="${s * 0.7}" fill="${color}" />
      <ellipse cx="${cx + s * 0.35}" cy="${cy}" rx="${s * 0.4}" ry="${s * 0.65}" fill="${color}" opacity="0.85" />
      <path d="M ${cx - s * 0.08} ${cy - s * 0.7} Q ${cx} ${cy - s} ${cx + s * 0.15} ${cy - s * 0.85}" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round" />
    `;
  }

  function ginkgoLeaf(cx, cy, s, color) {
    return `
      <path d="M ${cx} ${cy + s}
        Q ${cx - s * 1.1} ${cy + s * 0.3} ${cx - s * 0.9} ${cy - s * 0.7}
        Q ${cx - s * 0.4} ${cy - s * 0.4} ${cx - s * 0.05} ${cy - s * 0.55}
        L ${cx} ${cy - s * 0.25}
        L ${cx + s * 0.05} ${cy - s * 0.55}
        Q ${cx + s * 0.4} ${cy - s * 0.4} ${cx + s * 0.9} ${cy - s * 0.7}
        Q ${cx + s * 1.1} ${cy + s * 0.3} ${cx} ${cy + s} Z" fill="${color}" />
      ${line(cx, cy + s, cx, cy + s * 1.3, INK, 3)}
    `;
  }

  function sweetPotatoIcon(cx, cy, s, color) {
    const steam = (dx) => `<path d="M ${cx + dx} ${cy - s * 0.7} Q ${cx + dx - 6} ${cy - s * 0.95} ${cx + dx} ${cy - s * 1.15} Q ${cx + dx + 6} ${cy - s * 1.35} ${cx + dx} ${cy - s * 1.55}" fill="none" stroke="${INK}" stroke-width="2" opacity="0.3" stroke-linecap="round" />`;
    return `
      ${steam(-s * 0.25)}${steam(s * 0.3)}
      <path d="M ${cx - s * 0.9} ${cy + s * 0.3}
        Q ${cx - s} ${cy - s * 0.5} ${cx - s * 0.3} ${cy - s * 0.6}
        Q ${cx + s * 0.4} ${cy - s * 0.9} ${cx + s * 0.9} ${cy - s * 0.2}
        Q ${cx + s * 1.1} ${cy + s * 0.5} ${cx + s * 0.4} ${cy + s * 0.7}
        Q ${cx - s * 0.4} ${cy + s * 0.9} ${cx - s * 0.9} ${cy + s * 0.3} Z" fill="${color}" />
      <path d="M ${cx - s * 0.5} ${cy - s * 0.1} q 12 6 24 -6" fill="none" stroke="${INK}" stroke-width="2" opacity="0.35" />
      <path d="M ${cx - s * 0.2} ${cy + s * 0.35} q 14 8 30 -2" fill="none" stroke="${INK}" stroke-width="2" opacity="0.3" />
    `;
  }

  function berryCluster(cx, cy, s, color) {
    return `
      ${dot(cx - s * 0.3, cy - s * 0.2, s * 0.22, color)}${dot(cx + s * 0.1, cy - s * 0.35, s * 0.22, color)}
      ${dot(cx + s * 0.4, cy - s * 0.05, s * 0.22, color)}${dot(cx - s * 0.05, cy + s * 0.15, s * 0.22, color)}
      ${dot(cx + s * 0.3, cy + s * 0.3, s * 0.22, color)}
      ${line(cx - s * 0.5, cy + s * 0.5, cx - s * 0.1, cy - s * 0.1, INK, 2)}
    `;
  }

  function snowmanIcon(cx, cy, s, color) {
    return `
      <circle cx="${cx}" cy="${cy + s * 0.55}" r="${s * 0.6}" fill="${color}" />
      <circle cx="${cx}" cy="${cy - s * 0.25}" r="${s * 0.42}" fill="${color}" />
      <path d="M ${cx - s * 0.42} ${cy - s * 0.5} L ${cx + s * 0.42} ${cy - s * 0.5} L ${cx + s * 0.3} ${cy - s * 0.78} L ${cx - s * 0.3} ${cy - s * 0.78} Z" fill="${INK}" />
      ${dot(cx - s * 0.12, cy - s * 0.3, s * 0.05, INK)}${dot(cx + s * 0.12, cy - s * 0.3, s * 0.05, INK)}
    `;
  }

  function christmasTreeIcon(cx, cy, s, color) {
    return `
      <path d="M ${cx} ${cy - s * 1.1} L ${cx + s * 0.55} ${cy - s * 0.3} L ${cx + s * 0.3} ${cy - s * 0.3}
        L ${cx + s * 0.75} ${cy + s * 0.4} L ${cx + s * 0.4} ${cy + s * 0.4} L ${cx + s * 0.9} ${cy + s}
        L ${cx - s * 0.9} ${cy + s} L ${cx - s * 0.4} ${cy + s * 0.4} L ${cx - s * 0.75} ${cy + s * 0.4}
        L ${cx - s * 0.3} ${cy - s * 0.3} L ${cx - s * 0.55} ${cy - s * 0.3} Z" fill="${color}" />
      <rect x="${cx - s * 0.12}" y="${cy + s}" width="${s * 0.24}" height="${s * 0.3}" fill="${INK}" />
      ${dot(cx - s * 0.3, cy + s * 0.1, s * 0.08, INK)}${dot(cx + s * 0.25, cy + s * 0.25, s * 0.08, INK)}${dot(cx, cy - s * 0.15, s * 0.08, INK)}
    `;
  }

  function templeBell(cx, cy, s, color) {
    return `
      <path d="M ${cx - s * 0.6} ${cy + s * 0.6} Q ${cx - s * 0.7} ${cy - s * 0.6} ${cx} ${cy - s * 0.9} Q ${cx + s * 0.7} ${cy - s * 0.6} ${cx + s * 0.6} ${cy + s * 0.6} Z" fill="${color}" />
      <ellipse cx="${cx}" cy="${cy + s * 0.6}" rx="${s * 0.7}" ry="${s * 0.12}" fill="${INK}" opacity="0.4" />
      ${line(cx, cy - s * 0.9, cx, cy - s * 1.15, INK, 3)}
    `;
  }

  function hinaDoll(cx, cy, s, color) {
    return `
      <path d="M ${cx - s * 0.7} ${cy + s} L ${cx} ${cy - s * 0.3} L ${cx + s * 0.7} ${cy + s} Z" fill="${color}" />
      <circle cx="${cx}" cy="${cy - s * 0.55}" r="${s * 0.32}" fill="#f4e9d8" />
      <path d="M ${cx - s * 0.3} ${cy - s * 0.85} Q ${cx} ${cy - s * 1.15} ${cx + s * 0.3} ${cy - s * 0.85}" fill="none" stroke="${color}" stroke-width="4" />
    `;
  }

  function heart(cx, cy, s, color) {
    return `<path d="M ${cx} ${cy + s * 0.8}
      C ${cx - s * 1.3} ${cy - s * 0.4}, ${cx - s * 0.5} ${cy - s * 1.3}, ${cx} ${cy - s * 0.5}
      C ${cx + s * 0.5} ${cy - s * 1.3}, ${cx + s * 1.3} ${cy - s * 0.4}, ${cx} ${cy + s * 0.8} Z"
      fill="${color}" />`;
  }

  function candyBag(cx, cy, w, h, color) {
    return `
      <path d="M ${cx - w / 2} ${cy + h} L ${cx - w / 6} ${cy} L ${cx + w / 6} ${cy} L ${cx + w / 2} ${cy + h} Z" fill="${color}" />
      <path d="M ${cx - w * 0.38} ${cy + h * 0.6} L ${cx - w * 0.08} ${cy + h * 0.35}
               M ${cx - w * 0.15} ${cy + h} L ${cx + w * 0.2} ${cy + h * 0.55}
               M ${cx + w * 0.05} ${cy + h} L ${cx + w * 0.35} ${cy + h * 0.6}"
        stroke="#f4e9d8" stroke-width="4" opacity="0.85" />
      ${line(cx - w / 6, cy, cx - w / 10, cy - 22, color, 3)}
      ${line(cx + w / 6, cy, cx + w / 10, cy - 22, color, 3)}
    `;
  }

  function jackOLantern(cx, cy, s, color) {
    return `
      ${pumpkinIcon(cx, cy, s, color)}
      <path d="M ${cx - s * 0.28} ${cy - s * 0.1} l ${s * 0.18} 0 M ${cx - s * 0.5} ${cy + s * 0.25} l ${-s * 0.15} 0
        M ${cx + s * 0.28} ${cy - s * 0.1} l ${-s * 0.18} 0 M ${cx + s * 0.5} ${cy + s * 0.25} l ${s * 0.15} 0"
        stroke="${INK}" stroke-width="5" stroke-linecap="round" fill="none" />
    `;
  }

  // ================= 月ごとの週替わりシーン =================

  function buildScenes(accent) {
    const cx = 60,
      cy = 66;
    return {
      1: [
        () => sunrise(cx, cy + 8, 34, accent),
        () => pineSprig(cx, cy + 10, 34, accent),
        () => kiteIcon(cx, cy, 32, accent),
        () => budBranch(cx, cy, 30, accent),
      ],
      2: [
        () => snowflakeIcon(cx, cy, 34, accent),
        () => bigBlossom(cx, cy, 20, accent, 5),
        () => birdOnBranch(cx, cy, 26, accent),
        () => `${bigBlossom(cx - 12, cy + 6, 14, accent, 5)}`,
      ],
      3: [
        () => sproutIcon(cx, cy + 6, 30, accent),
        () => budBranch(cx, cy, 30, accent),
        () => bigBlossom(cx, cy, 22, accent, 5),
        () => fallingPetalsIcon(cx, cy, 30, accent),
      ],
      4: [
        () => treeBloom(cx, cy + 10, 34, accent),
        () => fallingPetalsIcon(cx, cy, 32, accent),
        () => dangoIcon(cx, cy, 26, accent),
        () => leafIcon(cx, cy, 30, accent),
      ],
      5: [
        () => koinobori(cx - 6, cy, 26, accent),
        () => leafIcon(cx, cy, 34, accent),
        () => ladybugIcon(cx, cy, 26, accent),
        () => dragonflyBig(cx, cy, 26, accent),
      ],
      6: [
        () => hydrangeaBall(cx, cy, 30, accent),
        () => umbrellaIcon(cx, cy - 6, 30, accent),
        () => snailIcon(cx, cy, 28, accent),
        () => rainbowArc(cx, cy + 20, 36, accent),
      ],
      7: [
        () => tanabataBamboo(cx, cy, 30, accent),
        () => starIcon(cx, cy, 30, accent),
        () => fireworkBurst(cx, cy, 34, accent),
        () => shavedIce(cx, cy + 6, 30, accent),
      ],
      8: [
        () => thunderCloud(cx, cy, 32, accent),
        () => morningGlory(cx, cy + 10, 28, accent),
        () => mountainSun(cx, cy + 16, 76, 40, accent),
        () => lanternBig(cx, cy, 40, 50, accent),
      ],
      9: [
        () => fullMoonIcon(cx, cy, 32, accent),
        () => pampasGrass(cx, cy + 10, 30, accent),
        () => dragonflyBig(cx, cy, 28, accent),
        () => chestnutIcon(cx, cy, 30, accent),
      ],
      10: [
        () => leafIcon(cx, cy, 30, accent),
        () => mapleLeaf(cx, cy, 32, accent),
        () => acornIcon(cx, cy, 30, accent),
        () => persimmonIcon(cx, cy, 32, accent),
      ],
      11: [
        () => ginkgoLeaf(cx, cy, 30, accent),
        () => `${ginkgoLeaf(cx - 20, cy + 6, 22, accent)}${ginkgoLeaf(cx + 18, cy - 4, 20, accent)}`,
        () => sweetPotatoIcon(cx, cy, 30, accent),
        () => berryCluster(cx, cy, 30, accent),
      ],
      12: [
        () => snowmanIcon(cx, cy, 30, accent),
        () => berryCluster(cx, cy, 30, accent),
        () => christmasTreeIcon(cx, cy, 30, accent),
        () => templeBell(cx, cy, 30, accent),
      ],
    };
  }

  function buildSpecial(accent) {
    const cx = 60,
      cy = 66;
    const scenes = buildScenes(accent);
    return {
      "1-1": scenes[1][0],
      "2-3": () => oniMask(cx, cy, 28, accent),
      "2-14": () => {
        const heartColor = "#c8425a";
        return `${heart(cx, cy, 26, heartColor)}${heart(cx + 30, cy + 16, 12, heartColor)}${heart(cx - 28, cy + 20, 10, heartColor)}`;
      },
      "3-3": () => hinaDoll(cx, cy, 32, accent),
      "5-5": scenes[5][0],
      "7-7": scenes[7][0],
      "8-11": scenes[8][2],
      "8-15": scenes[8][3],
      "10-31": () => jackOLantern(cx, cy, 34, accent),
      "11-15": () => candyBag(cx, cy + 8, 60, 42, accent),
      "12-24": scenes[12][2],
      "12-25": scenes[12][2],
      "12-31": scenes[12][3],
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
    return `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="seasonal illustration">
      <circle cx="60" cy="60" r="52" fill="${accent}" opacity="0.07" />
      ${inner}
    </svg>`;
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

  // ================= キャプション（週替わりに対応） =================

  const MONTH_CAPTIONS = {
    1: [
      { ja: "初日の出", en: "The New Year's first sunrise" },
      { ja: "松の緑", en: "Fresh green pine sprigs" },
      { ja: "凧あげ", en: "Flying a New Year's kite" },
      { ja: "ふくらむ梅のつぼみ", en: "A plum bud starting to swell" },
    ],
    2: [
      { ja: "雪の結晶", en: "A snowflake" },
      { ja: "満開の梅", en: "Plum blossoms in full bloom" },
      { ja: "梅の枝にとまる小鳥", en: "A small bird perched on a plum branch" },
      { ja: "春を待つ蝶と梅", en: "A butterfly and plum blossoms awaiting spring" },
    ],
    3: [
      { ja: "芽吹く若草", en: "Sprouting spring grass" },
      { ja: "桜のつぼみ", en: "A cherry blossom bud" },
      { ja: "咲いた桜の花", en: "A cherry blossom in bloom" },
      { ja: "桜と舞う蝶", en: "Cherry blossoms and a fluttering butterfly" },
    ],
    4: [
      { ja: "満開の桜の木", en: "A cherry tree in full bloom" },
      { ja: "舞い散る桜吹雪", en: "Cherry petals swirling in the wind" },
      { ja: "お花見の団子", en: "Dango for cherry-blossom viewing" },
      { ja: "芽吹く若葉", en: "Fresh young leaves emerging" },
    ],
    5: [
      { ja: "泳ぐ鯉のぼり", en: "A carp streamer swimming in the wind" },
      { ja: "深まる新緑", en: "Deepening fresh greenery" },
      { ja: "てんとう虫", en: "A ladybug" },
      { ja: "飛び交うトンボ", en: "A dragonfly on the wing" },
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
      { ja: "もくもくの入道雲", en: "Billowing summer thunderclouds" },
      { ja: "咲き誇る朝顔", en: "A morning glory in bloom" },
      { ja: "夏山と太陽", en: "Summer mountains under the sun" },
      { ja: "お盆の灯籠", en: "A lantern for the Obon festival" },
    ],
    9: [
      { ja: "夜空に浮かぶ満月", en: "The full moon rising in the sky" },
      { ja: "揺れるすすき", en: "Pampas grass swaying in the breeze" },
      { ja: "秋を告げるトンボ", en: "A dragonfly announcing autumn" },
      { ja: "実った栗", en: "A ripened chestnut" },
    ],
    10: [
      { ja: "色づき始めの葉", en: "A leaf just beginning to change color" },
      { ja: "真っ赤なもみじ", en: "A maple leaf turned bright red" },
      { ja: "落ちたどんぐり", en: "An acorn that has fallen" },
      { ja: "実った柿", en: "A ripened persimmon" },
    ],
    11: [
      { ja: "色づく銀杏の葉", en: "A ginkgo leaf turning gold" },
      { ja: "散り敷く銀杏の葉", en: "Ginkgo leaves scattered on the ground" },
      { ja: "ほくほくの焼き芋", en: "A warm roasted sweet potato" },
      { ja: "南天の赤い実", en: "The red berries of nanten" },
    ],
    12: [
      { ja: "雪だるま", en: "A snowman" },
      { ja: "南天の実と雪", en: "Nanten berries in the snow" },
      { ja: "クリスマスツリー", en: "A Christmas tree" },
      { ja: "除夜の鐘", en: "The temple bell rung on New Year's Eve" },
    ],
  };

  const SPECIAL_CAPTIONS = {
    "1-1": { ja: "初日の出", en: "The New Year's first sunrise" },
    "2-3": { ja: "節分の鬼", en: "The oni of Setsubun" },
    "2-14": { ja: "バレンタインデーのハート", en: "Hearts for Valentine's Day" },
    "3-3": { ja: "ひな祭りのお雛様", en: "A Hina doll for Hinamatsuri" },
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
