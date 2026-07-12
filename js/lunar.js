/**
 * lunar.js
 * astro.js の太陽黄経・新月計算をもとに、旧暦（太陰太陽暦）・二十四節気・
 * 六曜・雑節などを算出する。
 */
(function (global) {
  const A = global.KoyomiAstro;

  const SEKKI_NAMES = [
    { deg: 0, ja: "春分", en: "Spring Equinox" },
    { deg: 15, ja: "清明", en: "Pure Brightness" },
    { deg: 30, ja: "穀雨", en: "Grain Rain" },
    { deg: 45, ja: "立夏", en: "Start of Summer" },
    { deg: 60, ja: "小満", en: "Lesser Fullness" },
    { deg: 75, ja: "芒種", en: "Grain in Ear" },
    { deg: 90, ja: "夏至", en: "Summer Solstice" },
    { deg: 105, ja: "小暑", en: "Lesser Heat" },
    { deg: 120, ja: "大暑", en: "Greater Heat" },
    { deg: 135, ja: "立秋", en: "Start of Autumn" },
    { deg: 150, ja: "処暑", en: "End of Heat" },
    { deg: 165, ja: "白露", en: "White Dew" },
    { deg: 180, ja: "秋分", en: "Autumn Equinox" },
    { deg: 195, ja: "寒露", en: "Cold Dew" },
    { deg: 210, ja: "霜降", en: "Frost's Descent" },
    { deg: 225, ja: "立冬", en: "Start of Winter" },
    { deg: 240, ja: "小雪", en: "Lesser Snow" },
    { deg: 255, ja: "大雪", en: "Greater Snow" },
    { deg: 270, ja: "冬至", en: "Winter Solstice" },
    { deg: 285, ja: "小寒", en: "Lesser Cold" },
    { deg: 300, ja: "大寒", en: "Greater Cold" },
    { deg: 315, ja: "立春", en: "Start of Spring" },
    { deg: 330, ja: "雨水", en: "Rain Water" },
    { deg: 345, ja: "啓蟄", en: "Awakening of Insects" },
  ];

  // 「中気」＝偶数番目（0,30,60...330）の12個。月の番号付けの基準になる。
  const ZHONGQI_DEGS = SEKKI_NAMES.filter((_, i) => i % 2 === 0).map((s) => s.deg);

  const ROKUYO_NAMES = [
    { ja: "先勝", en: "Sakigachi (a.m. lucky)" },
    { ja: "友引", en: "Tomobiki (draw)" },
    { ja: "先負", en: "Sakimake (p.m. lucky)" },
    { ja: "仏滅", en: "Butsumetsu (unlucky)" },
    { ja: "大安", en: "Taian (very lucky)" },
    { ja: "赤口", en: "Shakkou (caution)" },
  ];

  function jstNoonJD(y, m, d) {
    // JST(UTC+9)の正午をユリウス日に変換（暦日の境界を安定させるため正午を使用）
    const utc = new Date(Date.UTC(y, m - 1, d, 3, 0, 0)); // JST12:00 = UTC03:00
    return A.toJulianDay(utc);
  }

  function jdToJSTDateParts(jd) {
    const utcDate = A.fromJulianDay(jd);
    const jst = new Date(utcDate.getTime() + 9 * 60 * 60 * 1000);
    return {
      y: jst.getUTCFullYear(),
      m: jst.getUTCMonth() + 1,
      d: jst.getUTCDate(),
    };
  }

  function daysBetweenJSTDates(a, b) {
    // a, b: {y,m,d} JSTの暦日。aからbまでの日数差
    const ta = Date.UTC(a.y, a.m - 1, a.d);
    const tb = Date.UTC(b.y, b.m - 1, b.d);
    return Math.round((tb - ta) / 86400000);
  }

  /**
   * 指定の太陽黄経(度)を通過する直近の日時(JST暦日)を求める
   */
  function solarTermJSTDate(deg, seedY, seedM, seedD) {
    const seedJD = jstNoonJD(seedY, seedM, seedD);
    const seedDate = A.fromJulianDay(seedJD);
    const jd = A.findSolarLongitudeCrossing(deg, seedDate);
    return jdToJSTDateParts(jd);
  }

  /**
   * 指定日(JST暦日)における、直近(当日を含む、当日以前)の新月の暦日を返す。
   * 新月の瞬間がその日のいつであっても、暦日単位では「新月の起きた日」が
   * 旧暦の月の初日(朔日)になるため、時刻ではなく暦日(年月日)で比較する。
   */
  function precedingNewMoonJSTDate(y, m, d) {
    const target = { y, m, d };
    const seedJD = jstNoonJD(y, m, d);
    const seedDate = A.fromJulianDay(seedJD);
    let { k } = A.findPrecedingNewMoon(seedDate);
    let candidate = newMoonJSTDateByK(k);

    // candidateがtargetより後の暦日なら、遡る
    while (daysBetweenJSTDates(candidate, target) < 0) {
      k -= 1;
      candidate = newMoonJSTDateByK(k);
    }
    // 次の新月の暦日がtarget以前(=同日を含む)なら、そちらを採用する
    let nextCandidate = newMoonJSTDateByK(k + 1);
    while (daysBetweenJSTDates(nextCandidate, target) >= 0) {
      k += 1;
      candidate = nextCandidate;
      nextCandidate = newMoonJSTDateByK(k + 1);
    }
    return { date: candidate, k };
  }

  function newMoonJSTDateByK(k) {
    const jd = A.newMoonJulianDay(k);
    return jdToJSTDateParts(jd);
  }

  /**
   * 指定した2つの暦日区間 [startDate, endDate) の間に「中気」が含まれるかを判定
   */
  function containsZhongqi(startDate, endDate) {
    // startDateの少し後を種にして、startDate以降で最初に来る中気を探す
    for (const deg of ZHONGQI_DEGS) {
      // 探索の種はstartDateの翌日あたり
      const seed = { ...startDate };
      const jdSeedBase = jstNoonJD(seed.y, seed.m, seed.d) + 1;
      const seedDate = A.fromJulianDay(jdSeedBase);
      const crossingJD = A.findSolarLongitudeCrossing(deg, seedDate);
      const crossingDate = jdToJSTDateParts(crossingJD);
      const afterStart = daysBetweenJSTDates(startDate, crossingDate) >= 0;
      const beforeEnd = daysBetweenJSTDates(crossingDate, endDate) > 0;
      if (afterStart && beforeEnd) return true;
    }
    return false;
  }

  /**
   * 旧暦（太陰太陽暦）の年月日・閏月フラグ・六曜を算出する
   * @param {number} y 西暦年 (JST基準)
   * @param {number} m 月(1-12)
   * @param {number} d 日
   */
  function getLunarDate(y, m, d) {
    // 1. 対象日以前の直近の新月 = 今の旧暦月の開始日
    const { date: nm0, k: k0 } = precedingNewMoonJSTDate(y, m, d);
    const target = { y, m, d };
    const lunarDay = daysBetweenJSTDates(nm0, target) + 1;

    // 2. 対象日以前の直近の冬至(270°)を求め、それを含む旧暦月を「11月」の基準にする
    const wsSeed = solarTermJSTDate(270, y, m, d);
    // solarTermJSTDateは種日に最も近い冬至を返すため、対象日より後になっていないか確認
    let ws1 = wsSeed;
    if (daysBetweenJSTDates(target, ws1) > 0) {
      // 対象日より未来なら、1年前の冬至を再探索
      ws1 = solarTermJSTDate(270, y - 1, m, d);
    }

    // 冬至ws1を含む旧暦月の開始新月(月11の開始)を求める
    const { date: nmAtWs1, k: kAtWs1 } = precedingNewMoonJSTDate(ws1.y, ws1.m, ws1.d);

    // 3. kAtWs1(月11開始)からk0(現在月開始)まで、新月を1つずつ進めながら
    //    月番号を割り振る。中気を含まない月は閏月として番号を進めない。
    let monthNumber = 11;
    let isLeap = false;
    let curK = kAtWs1;
    let curStart = nmAtWs1;

    // 安全装置: 最大15回(閏月を含めても1年で最大13-14ヶ月)
    for (let i = 0; i < 15; i++) {
      if (curK >= k0) break;
      const nextStart = newMoonJSTDateByK(curK + 1);
      const hasZhongqi = containsZhongqi(curStart, nextStart);
      if (!hasZhongqi) {
        isLeap = true; // 次の月(=これから進む月)が閏月
      } else {
        monthNumber += 1;
        isLeap = false;
        if (monthNumber > 12) monthNumber = 1;
      }
      curK += 1;
      curStart = nextStart;
    }

    return {
      year: y,
      month: monthNumber,
      day: lunarDay,
      isLeapMonth: isLeap,
    };
  }

  /**
   * 六曜を算出（旧暦月+旧暦日の合計を6で割った余りで決まる伝統的な計算式）
   */
  function getRokuyo(lunarMonth, lunarDay) {
    const idx = (lunarMonth + lunarDay + 4) % 6;
    return ROKUYO_NAMES[idx];
  }

  /**
   * 指定日が二十四節気の「当日」であればその節気情報を返す。該当しなければ
   * 直近に迎えた節気（今の季節を表す節気）を返す。
   */
  function getSekkiInfo(y, m, d) {
    const target = { y, m, d };
    let current = null;
    let isToday = false;
    let nextInfo = null;
    let minPastDiff = Infinity;
    let minFutureDiff = Infinity;

    for (const sekki of SEKKI_NAMES) {
      const seedGuess = solarTermJSTDate(sekki.deg, y, m, d);
      const diff = daysBetweenJSTDates(target, seedGuess); // >0なら未来, <0なら過去, 0なら当日
      if (diff === 0) {
        current = { ...sekki, date: seedGuess };
        isToday = true;
      }
      if (diff <= 0 && Math.abs(diff) < minPastDiff) {
        minPastDiff = Math.abs(diff);
        current = current && isToday ? current : { ...sekki, date: seedGuess };
      }
      if (diff > 0 && diff < minFutureDiff) {
        minFutureDiff = diff;
        nextInfo = { ...sekki, date: seedGuess };
      }
    }

    return { current, isToday, next: nextInfo };
  }

  /**
   * 月齢（新月からの経過日数）と満ち欠けの位相(0=新月,0.5=満月)を算出
   */
  function getMoonAge(y, m, d) {
    const targetJD = jstNoonJD(y, m, d);
    const seedDate = A.fromJulianDay(targetJD);
    const { jd: nmJD } = A.findPrecedingNewMoon(seedDate);
    const synodic = 29.530588853;
    let age = targetJD - nmJD;
    if (age < 0) age += synodic;
    const phase = (age % synodic) / synodic;
    return { age, phase };
  }

  global.KoyomiLunar = {
    getLunarDate,
    getRokuyo,
    getSekkiInfo,
    getMoonAge,
    SEKKI_NAMES,
    ROKUYO_NAMES,
  };
})(typeof window !== "undefined" ? window : globalThis);
