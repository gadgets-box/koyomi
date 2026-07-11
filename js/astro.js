/**
 * astro.js
 * 低精度の太陽黄経・新月時刻の近似計算（Jean Meeus "Astronomical Algorithms" の
 * 低精度公式をベースにした実装）。二十四節気・旧暦・六曜の算出に利用する。
 *
 * 精度について：
 *  - 太陽黄経は角度誤差 0.01°未満（節気の「日付」を特定するには十分な精度）
 *  - 新月時刻は数分〜十数分程度の誤差（旧暦の「月の境目」を特定するには十分）
 *  - まれに、算出結果が国立天文台の公式暦と1日程度ずれる可能性があります
 *    （特に閏月が入る年の月境界付近）。将来的に暦要項データで補正可能です。
 */

(function (global) {
  const DEG2RAD = Math.PI / 180;
  const RAD2DEG = 180 / Math.PI;

  function normalizeDeg(deg) {
    let d = deg % 360;
    if (d < 0) d += 360;
    return d;
  }

  // 日付(UTC想定のY/M/D,時刻)からユリウス日を計算
  function toJulianDay(date) {
    // date: JS Date (UTC基準として扱う)
    const Y = date.getUTCFullYear();
    const M = date.getUTCMonth() + 1;
    const D =
      date.getUTCDate() +
      (date.getUTCHours() +
        date.getUTCMinutes() / 60 +
        date.getUTCSeconds() / 3600) /
        24;
    let y = Y;
    let m = M;
    if (m <= 2) {
      y -= 1;
      m += 12;
    }
    const A = Math.floor(y / 100);
    const B = 2 - A + Math.floor(A / 4);
    return (
      Math.floor(365.25 * (y + 4716)) +
      Math.floor(30.6001 * (m + 1)) +
      D +
      B -
      1524.5
    );
  }

  function fromJulianDay(jd) {
    const Z = Math.floor(jd + 0.5);
    const F = jd + 0.5 - Z;
    let A = Z;
    if (Z >= 2299161) {
      const alpha = Math.floor((Z - 1867216.25) / 36524.25);
      A = Z + 1 + alpha - Math.floor(alpha / 4);
    }
    const B = A + 1524;
    const C = Math.floor((B - 122.1) / 365.25);
    const D = Math.floor(365.25 * C);
    const E = Math.floor((B - D) / 30.6001);
    const day = B - D - Math.floor(30.6001 * E) + F;
    const month = E < 14 ? E - 1 : E - 13;
    const year = month > 2 ? C - 4716 : C - 4715;

    const dayInt = Math.floor(day);
    const dayFrac = day - dayInt;
    const hours = dayFrac * 24;
    const h = Math.floor(hours);
    const minutes = (hours - h) * 60;
    const min = Math.floor(minutes);
    const sec = Math.round((minutes - min) * 60);

    return new Date(Date.UTC(year, month - 1, dayInt, h, min, sec));
  }

  /**
   * 太陽の視黄経 (apparent geocentric longitude) を度数で返す
   * @param {number} jd ユリウス日
   */
  function sunApparentLongitude(jd) {
    const T = (jd - 2451545.0) / 36525;
    const L0 = normalizeDeg(280.46646 + 36000.76983 * T + 0.0003032 * T * T);
    const M = normalizeDeg(357.52911 + 35999.05029 * T - 0.0001537 * T * T);
    const Mrad = M * DEG2RAD;
    const C =
      (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mrad) +
      (0.019993 - 0.000101 * T) * Math.sin(2 * Mrad) +
      0.000289 * Math.sin(3 * Mrad);
    const trueLong = L0 + C;
    const omega = 125.04 - 1934.136 * T;
    const apparentLong = trueLong - 0.00569 - 0.00478 * Math.sin(omega * DEG2RAD);
    return normalizeDeg(apparentLong);
  }

  /**
   * 指定した黄経（0,15,30...345度）を太陽が通過する直近の日時をニュートン法で求める
   * @param {number} targetDeg 目標黄経(0-360)
   * @param {Date} nearDate 探索の起点となる日時
   */
  function findSolarLongitudeCrossing(targetDeg, nearDate) {
    let jd = toJulianDay(nearDate);
    const target = normalizeDeg(targetDeg);

    for (let i = 0; i < 20; i++) {
      const lon = sunApparentLongitude(jd);
      let diff = target - lon;
      // 角度差を -180〜180 の範囲に正規化
      diff = ((diff + 180) % 360 + 360) % 360 - 180;
      // 太陽は1日あたり約0.9856度動く
      const deltaDays = diff / 0.9856;
      jd += deltaDays;
      if (Math.abs(deltaDays) < 0.0001) break;
    }
    return jd;
  }

  /**
   * 新月（朔）のおおよそのユリウス日を求める（Meeusの簡易周期項を使用）
   * @param {number} k 朔望月番号（k=0が2000年1月6日頃の新月）
   */
  function newMoonJulianDay(k) {
    const T = k / 1236.85;
    const T2 = T * T;
    const T3 = T2 * T;
    const T4 = T3 * T;

    let JDE =
      2451550.09766 +
      29.530588861 * k +
      0.00015437 * T2 -
      0.00000015 * T3 +
      0.00000000073 * T4;

    const M = normalizeDeg(2.5534 + 29.10535669 * k - 0.0000218 * T2 - 0.00000011 * T3);
    const Mp = normalizeDeg(
      201.5643 + 385.81693528 * k + 0.0107582 * T2 + 0.00001238 * T3 - 0.000000058 * T4
    );
    const F = normalizeDeg(
      160.7108 + 390.67050284 * k - 0.0016118 * T2 - 0.00000227 * T3 + 0.000000011 * T4
    );
    const Omega = normalizeDeg(124.7746 - 1.56375588 * k + 0.0020672 * T2 + 0.00000215 * T3);

    const E = 1 - 0.002516 * T - 0.0000074 * T2;

    const Mrad = M * DEG2RAD;
    const Mprad = Mp * DEG2RAD;
    const Frad = F * DEG2RAD;
    const Omegarad = Omega * DEG2RAD;

    // 主要な周期補正項（主要12項のみ、精度は数分程度）
    let corr = 0;
    corr += -0.4072 * Math.sin(Mprad);
    corr += 0.17241 * E * Math.sin(Mrad);
    corr += 0.01608 * Math.sin(2 * Mprad);
    corr += 0.01039 * Math.sin(2 * Frad);
    corr += 0.00739 * E * Math.sin(Mprad - Mrad);
    corr += -0.00514 * E * Math.sin(Mprad + Mrad);
    corr += 0.00208 * E * E * Math.sin(2 * Mrad);
    corr += -0.00111 * Math.sin(Mprad - 2 * Frad);
    corr += -0.00057 * Math.sin(Mprad + 2 * Frad);
    corr += 0.00056 * E * Math.sin(2 * Mprad + Mrad);
    corr += -0.00042 * Math.sin(3 * Mprad);
    corr += 0.00042 * E * Math.sin(Mrad + 2 * Frad);
    corr += 0.00038 * E * Math.sin(Mrad - 2 * Frad);
    corr += -0.00024 * E * Math.sin(2 * Mprad - Mrad);
    corr += -0.00017 * Math.sin(Omegarad);
    corr += -0.00007 * Math.sin(Mprad + 2 * Mrad);

    JDE += corr;
    return JDE;
  }

  /**
   * 指定日時に最も近い過去の新月(朔)のユリウス日を返す
   */
  function findPrecedingNewMoon(date) {
    const jd = toJulianDay(date);
    // kのおおよその値を逆算
    const T = (jd - 2451550.09766) / 29.530588861;
    let k = Math.floor(T);
    let result = newMoonJulianDay(k);
    // 前後にずれる場合があるので探索して確実に「直前」の新月を取得
    while (result > jd) {
      k -= 1;
      result = newMoonJulianDay(k);
    }
    let next = newMoonJulianDay(k + 1);
    while (next <= jd) {
      k += 1;
      result = next;
      next = newMoonJulianDay(k + 1);
    }
    return { jd: result, k };
  }

  global.KoyomiAstro = {
    toJulianDay,
    fromJulianDay,
    sunApparentLongitude,
    findSolarLongitudeCrossing,
    newMoonJulianDay,
    findPrecedingNewMoon,
    normalizeDeg,
  };
})(typeof window !== "undefined" ? window : globalThis);
