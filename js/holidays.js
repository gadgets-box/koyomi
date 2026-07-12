/**
 * holidays.js
 * 日本の国民の祝日情報を外部API (holidays-jp) から取得する。
 *   https://holidays-jp.github.io/api/v1/date.json
 *   -> { "2026-01-01": "元日", "2026-01-02": "元日 振替休日", ... }
 * 取得結果は localStorage に24時間キャッシュし、以降はキャッシュを利用する。
 */
(function (global) {
  const CACHE_KEY = "koyomi_holidays_cache_v1";
  const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24時間
  const API_URL = "https://holidays-jp.github.io/api/v1/date.json";

  const EN_NAMES = {
    "元日": "New Year's Day",
    "成人の日": "Coming of Age Day",
    "建国記念の日": "National Foundation Day",
    "天皇誕生日": "The Emperor's Birthday",
    "春分の日": "Vernal Equinox Day",
    "昭和の日": "Shōwa Day",
    "憲法記念日": "Constitution Memorial Day",
    "みどりの日": "Greenery Day",
    "こどもの日": "Children's Day",
    "海の日": "Marine Day",
    "山の日": "Mountain Day",
    "敬老の日": "Respect for the Aged Day",
    "秋分の日": "Autumnal Equinox Day",
    "スポーツの日": "Sports Day",
    "体育の日": "Health and Sports Day",
    "文化の日": "Culture Day",
    "勤労感謝の日": "Labor Thanksgiving Day",
    "振替休日": "Substitute Holiday",
    "国民の休日": "Citizens' Holiday",
  };

  let memoryMap = null; // { "YYYY-MM-DD": "祝日名" }
  let loadingPromise = null;

  function readCache() {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.fetchedAt || !parsed.data) return null;
      if (Date.now() - parsed.fetchedAt > CACHE_TTL_MS) return null;
      return parsed.data;
    } catch (e) {
      return null;
    }
  }

  function writeCache(data) {
    try {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ fetchedAt: Date.now(), data })
      );
    } catch (e) {
      /* localStorageが使えない環境では無視 */
    }
  }

  async function ensureLoaded() {
    if (memoryMap) return memoryMap;
    if (loadingPromise) return loadingPromise;

    const cached = readCache();
    if (cached) {
      memoryMap = cached;
      return memoryMap;
    }

    loadingPromise = fetch(API_URL, { headers: { Accept: "application/json" } })
      .then((res) => {
        if (!res.ok) throw new Error("holidays-jp fetch failed: " + res.status);
        return res.json();
      })
      .then((data) => {
        memoryMap = data;
        writeCache(data);
        return memoryMap;
      })
      .catch((err) => {
        memoryMap = {}; // 取得失敗時は「祝日なし」として扱う（赤色表示は日曜のみになる）
        return memoryMap;
      })
      .finally(() => {
        loadingPromise = null;
      });

    return loadingPromise;
  }

  function translateName(jaName) {
    if (!jaName) return "";
    return jaName
      .split(/\s+/)
      .map((part) => EN_NAMES[part] || part)
      .join(" ");
  }

  /**
   * @param {string} isoDate "YYYY-MM-DD"
   * @returns {Promise<{name: string, nameEn: string}|null>}
   */
  async function getHoliday(isoDate) {
    const map = await ensureLoaded();
    const name = map[isoDate];
    if (!name) return null;
    return { name, nameEn: translateName(name) };
  }

  global.KoyomiHolidays = { getHoliday, ensureLoaded };
})(typeof window !== "undefined" ? window : globalThis);
