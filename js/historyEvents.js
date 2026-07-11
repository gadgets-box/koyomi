/**
 * historyEvents.js
 * Wikipedia の "On this day" REST API (認証不要・CORS対応) を利用して、
 * 「今日は何の日」（できごと・誕生日）を取得する。
 *   https://<lang>.wikipedia.org/api/rest_v1/feed/onthisday/{type}/{mm}/{dd}
 * ネットワークエラー時は簡易フォールバックメッセージを返す。
 */
(function (global) {
  const cache = new Map();

  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  async function fetchOnThisDay(lang, month, day) {
    const wikiLang = lang === "en" ? "en" : "ja";
    const cacheKey = `${wikiLang}-${pad2(month)}-${pad2(day)}`;
    if (cache.has(cacheKey)) return cache.get(cacheKey);

    const url = `https://${wikiLang}.wikipedia.org/api/rest_v1/feed/onthisday/all/${pad2(
      month
    )}/${pad2(day)}`;

    try {
      const res = await fetch(url, {
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error("network response not ok: " + res.status);
      const data = await res.json();

      const events = (data.events || [])
        .filter((e) => e.text)
        .sort((a, b) => (b.year || 0) - (a.year || 0))
        .slice(0, 8)
        .map((e) => ({ year: e.year, text: e.text }));

      const births = (data.births || [])
        .filter((b) => b.text)
        .sort((a, b) => (b.year || 0) - (a.year || 0))
        .slice(0, 6)
        .map((b) => ({ year: b.year, text: b.text }));

      const result = { events, births, ok: true };
      cache.set(cacheKey, result);
      return result;
    } catch (err) {
      const result = { events: [], births: [], ok: false, error: String(err) };
      return result;
    }
  }

  global.KoyomiHistory = { fetchOnThisDay };
})(typeof window !== "undefined" ? window : globalThis);
