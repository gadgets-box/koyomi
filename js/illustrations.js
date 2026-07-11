/**
 * illustrations.js
 * 「切り絵（kirie）」風・単色シルエットの季節イラストを月ごと・特別な日ごとに
 * 生成する。すべて同じ視覚言語（円・弧・単色シルエット）で統一し、
 * 366日分の個別イラストの代わりに「今日らしさ」を表現する。
 */
(function (global) {
  function petal(cx, cy, r) {
    return `<ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${r * 0.62}" />`;
  }

  function blossomCluster(cx, cy, scale, petals) {
    const n = petals || 5;
    let out = "";
    for (let i = 0; i < n; i++) {
      const angle = (Math.PI * 2 * i) / n;
      const px = cx + Math.cos(angle) * scale;
      const py = cy + Math.sin(angle) * scale;
      out += `<g transform="rotate(${(angle * 180) / Math.PI} ${px} ${py})">${petal(px, py, scale * 0.9)}</g>`;
    }
    out += `<circle cx="${cx}" cy="${cy}" r="${scale * 0.5}" />`;
    return out;
  }

  function branch(x1, y1, x2, y2, width) {
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke-width="${width || 3}" stroke-linecap="round" />`;
  }

  function wave(y, amp, len, x0) {
    const x = x0 || 0;
    return `<path d="M ${x} ${y} Q ${x + len / 4} ${y - amp} ${x + len / 2} ${y} T ${x + len} ${y}" />`;
  }

  function mountain(cx, baseY, w, h) {
    return `<path d="M ${cx - w / 2} ${baseY} L ${cx} ${baseY - h} L ${cx + w / 2} ${baseY} Z" />`;
  }

  const SCENES = {
    1: () => `
      <circle class="accent-fill" cx="150" cy="70" r="34" opacity="0.9" />
      <g class="base-fill">
        ${branch(40, 190, 70, 120)}${branch(70,120,55,90)}${branch(70,120,95,95)}
        ${branch(230,190,205,115)}${branch(205,115,185,85)}${branch(205,115,225,92)}
        <circle cx="55" cy="88" r="9" /><circle cx="95" cy="93" r="8" /><circle cx="185" cy="83" r="9" /><circle cx="225" cy="90" r="8" />
      </g>
      <path class="accent-fill" fill="none" stroke-width="2" d="M 0 210 Q 75 195 150 210 T 300 210" />
    `,
    2: () => `
      <g class="base-fill">${branch(30,200,120,60,4)}${branch(120,60,170,40,3)}${branch(120,60,90,30,3)}</g>
      <g class="accent-fill">
        ${blossomCluster(170,40,10)}${blossomCluster(90,28,8)}${blossomCluster(60,120,7)}${blossomCluster(140,90,6)}
      </g>
      <g class="base-fill" opacity="0.5">
        <circle cx="230" cy="50" r="3"/><circle cx="245" cy="90" r="2.5"/><circle cx="20" cy="60" r="2.5"/>
      </g>
    `,
    3: () => `
      <g class="base-fill">${branch(20,60,240,60,3)}${branch(60,60,50,20)}${branch(140,60,150,15)}${branch(200,60,210,25)}</g>
      <g class="accent-fill">
        ${blossomCluster(50,20,9)}${blossomCluster(150,15,9)}${blossomCluster(210,25,8)}
        ${blossomCluster(30,90,6)}${blossomCluster(90,110,7)}${blossomCluster(180,100,6)}${blossomCluster(220,120,5)}
      </g>
    `,
    4: () => `
      <g class="accent-fill">
        ${blossomCluster(60,40,10)}${blossomCluster(140,25,11)}${blossomCluster(210,55,9)}${blossomCluster(30,100,8)}
        <circle cx="100" cy="140" r="3"/><circle cx="180" cy="160" r="3"/><circle cx="230" cy="120" r="2.5"/><circle cx="70" cy="180" r="2.5"/>
      </g>
    `,
    5: () => `
      <g class="base-fill">${branch(140,190,140,40,4)}${branch(140,60,220,50)}${branch(140,90,210,85)}</g>
      <g class="accent-fill">
        <path d="M140,55 Q210,40 235,55 Q210,70 140,55 Z" />
        <path d="M140,88 Q205,78 225,88 Q205,98 140,88 Z" opacity="0.7"/>
        ${blossomCluster(40,140,7)}${blossomCluster(70,170,6)}
      </g>
    `,
    6: () => `
      <g class="accent-fill">
        ${blossomCluster(120,90,8,6)}${blossomCluster(100,110,7,6)}${blossomCluster(140,115,7,6)}${blossomCluster(120,130,8,6)}
      </g>
      <g class="base-fill" opacity="0.55">
        <line x1="40" y1="20" x2="30" y2="55" stroke-width="2"/>
        <line x1="90" y1="10" x2="80" y2="50" stroke-width="2"/>
        <line x1="200" y1="15" x2="190" y2="55" stroke-width="2"/>
        <line x1="240" y1="30" x2="230" y2="65" stroke-width="2"/>
      </g>
    `,
    7: () => `
      <g class="accent-fill">
        <circle cx="150" cy="70" r="2.5"/>
        ${[0,45,90,135,180,225,270,315].map(a=>`<line x1="150" y1="70" x2="${150+Math.cos(a*Math.PI/180)*38}" y2="${70+Math.sin(a*Math.PI/180)*38}" stroke-width="2" stroke-linecap="round"/>`).join('')}
      </g>
      <g class="base-fill" opacity="0.6">
        <circle cx="60" cy="150" r="2"/><circle cx="230" cy="160" r="2"/><circle cx="90" cy="180" r="1.5"/>
      </g>
    `,
    8: () => `
      <g class="base-fill" opacity="0.85">
        <circle cx="70" cy="55" r="20"/><circle cx="95" cy="45" r="26"/><circle cx="125" cy="55" r="20"/><circle cx="50" cy="65" r="15"/>
      </g>
      <g class="accent-fill">${blossomCluster(210,140,11,5)}${blossomCluster(230,110,7,5)}${branch(210,150,205,190,3)}</g>
    `,
    9: () => `
      <circle class="accent-fill" cx="190" cy="55" r="30" />
      <g class="base-fill">
        <path d="M40,190 Q45,90 55,60" fill="none" stroke-width="2"/>
        <path d="M60,190 Q68,100 80,65" fill="none" stroke-width="2"/>
        <path d="M85,190 Q92,110 100,75" fill="none" stroke-width="2"/>
      </g>
    `,
    10: () => `
      <g class="base-fill">${branch(140,190,140,60,4)}${branch(140,90,60,50)}${branch(140,110,220,70)}</g>
      <g class="accent-fill">
        ${blossomCluster(60,50,10)}${blossomCluster(220,70,10)}${blossomCluster(140,60,9)}
        <circle cx="30" cy="130" r="4"/><circle cx="230" cy="150" r="4"/><circle cx="100" cy="170" r="3"/>
      </g>
    `,
    11: () => `
      <g class="base-fill">${branch(140,190,140,50,4)}${branch(140,80,80,45)}${branch(140,100,200,60)}</g>
      <g class="accent-fill">
        ${blossomCluster(80,45,9)}${blossomCluster(200,60,9)}${blossomCluster(140,50,8)}
      </g>
    `,
    12: () => `
      <g class="accent-fill">
        <circle cx="40" cy="40" r="3"/><circle cx="90" cy="20" r="2.5"/><circle cx="150" cy="45" r="3"/>
        <circle cx="200" cy="25" r="2"/><circle cx="240" cy="55" r="3"/><circle cx="20" cy="90" r="2"/>
        <circle cx="120" cy="15" r="2"/><circle cx="260" cy="90" r="2.5"/>
      </g>
      <g class="base-fill">
        ${branch(70,190,80,120,3)}
        <circle cx="75" cy="115" r="4"/><circle cx="85" cy="122" r="4"/><circle cx="70" cy="128" r="4"/><circle cx="82" cy="132" r="4"/>
      </g>
    `,
  };

  const SPECIAL = {
    "1-1": SCENES[1],
    "2-3": () => `
      <g class="accent-fill">
        <circle cx="90" cy="90" r="26"/><circle cx="180" cy="70" r="20"/>
        <path d="M65,80 l-14,-10 M65,100 l-16,4 M112,80 l14,-10 M112,100 l16,4" stroke-width="3" stroke-linecap="round"/>
      </g>
      <g class="base-fill" opacity="0.6"><circle cx="40" cy="150" r="3"/><circle cx="230" cy="140" r="3"/></g>
    `,
    "3-3": () => `
      <g class="accent-fill">
        <path d="M110,140 L150,60 L190,140 Z"/>
        <circle cx="150" cy="55" r="9"/>
      </g>
      <g class="base-fill" opacity="0.7">${blossomCluster(70,100,7)}${blossomCluster(220,110,7)}</g>
    `,
    "5-5": SCENES[5],
    "7-7": SCENES[7],
    "10-31": () => `
      <g class="accent-fill">
        <path d="M150,50 Q110,60 105,110 Q100,150 150,155 Q200,150 195,110 Q190,60 150,50 Z"/>
        <path d="M120,80 h14 M96,110 h-10 M186,80 h-14 M204,110 h10" stroke-width="4"/>
      </g>
    `,
    "12-24": () => `
      <g class="base-fill">${mountain(150,180,120,120)}</g>
      <g class="accent-fill">
        <circle cx="150" cy="70" r="3"/><circle cx="120" cy="100" r="3"/><circle cx="180" cy="110" r="3"/>
        <circle cx="150" cy="140" r="3"/><circle cx="100" cy="150" r="3"/><circle cx="200" cy="150" r="3"/>
      </g>
    `,
  };
  SPECIAL["12-25"] = SPECIAL["12-24"];
  SPECIAL["12-31"] = SCENES[12];

  function getSeason(month) {
    if (month === 12 || month === 1 || month === 2) return "winter";
    if (month >= 3 && month <= 5) return "spring";
    if (month >= 6 && month <= 8) return "summer";
    return "autumn";
  }

  function getIllustrationSVG(month, day) {
    const key = `${month}-${day}`;
    const builder = SPECIAL[key] || SCENES[month] || SCENES[1];
    const inner = builder();
    return `<svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="seasonal illustration">${inner}</svg>`;
  }

  global.KoyomiIllustration = { getIllustrationSVG, getSeason };
})(typeof window !== "undefined" ? window : globalThis);
