/**
 * historyEvents.js
 * 「今日は何の日」（できごと・誕生日）を取得する。
 *
 * - 英語版: Wikipedia の "On this day" REST API (認証不要・CORS対応)
 *     https://en.wikipedia.org/api/rest_v1/feed/onthisday/{type}/{mm}/{dd}
 * - 日本語版: 上記のREST APIは日本語版ウィキペディアでは正式にサポートされて
 *   おらず(501 Unsupported language等)空振りすることがあるため、
 *   ja.wikipedia.org の「M月D日」ページ本文(wikitext)を MediaWiki Action API
 *   (origin=* でCORS許可) から取得し、「== できごと ==」「== 誕生日 ==」の
 *   節を直接パースする方式を採用している。
 *   万一そちらも失敗した場合は、最終手段として英語版のデータを
 *   「(English Wikipedia)」の注記付きで表示する。
 */
(function (global) {
  const cache = new Map();

  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  // ---------- 英語版: REST "onthisday" フィード ----------

  async function fetchEnglishRest(month, day) {
    const url = `https://en.wikipedia.org/api/rest_v1/feed/onthisday/all/${pad2(
      month
    )}/${pad2(day)}`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error("REST response not ok: " + res.status);
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
    return { events, births };
  }

  // ---------- 日本語版: 日付ページのwikitextを直接パース ----------

  function cleanWikitext(raw) {
    let s = raw;
    // <ref>...</ref> と <ref .../> を除去
    s = s.replace(/<ref[^>]*\/>/g, "");
    s = s.replace(/<ref[^>]*>[\s\S]*?<\/ref>/g, "");
    // テンプレート {{...}} を除去（数値ソート用の{{0}}等も含めシンプルに除去）
    for (let i = 0; i < 3; i++) {
      s = s.replace(/\{\{[^{}]*\}\}/g, "");
    }
    // [[記事|表示]] → 表示 、 [[記事]] → 記事
    s = s.replace(/\[\[([^\]|]*)\|([^\]]*)\]\]/g, "$2");
    s = s.replace(/\[\[([^\]]*)\]\]/g, "$1");
    // '''強調''' や ''強調'' を除去
    s = s.replace(/'''''/g, "").replace(/'''/g, "").replace(/''/g, "");
    // 先頭の "*" 記号を除去
    s = s.replace(/^\*+\s*/, "");
    // 前後の空白・句読点の整理
    return s.trim();
  }

  function extractSection(wikitext, sectionTitle) {
    const re = new RegExp(
      `==\\s*${sectionTitle}\\s*==([\\s\\S]*?)(?=\\n==[^=]|$)`,
      "u"
    );
    const m = wikitext.match(re);
    return m ? m[1] : "";
  }

  function parseBullets(sectionText, maxItems) {
    const lines = sectionText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.startsWith("*") && !l.startsWith("**"));

    const items = [];
    for (const line of lines) {
      const cleaned = cleanWikitext(line);
      if (!cleaned) continue;
      const m = cleaned.match(
        /^(\d{1,4})年[^-−ー―–]{0,40}[-−ー―–]\s*(.+)$/u
      );
      if (m) {
        items.push({ year: Number(m[1]), text: m[2].trim() });
      } else {
        items.push({ year: null, text: cleaned });
      }
      if (items.length >= maxItems) break;
    }
    return items;
  }

  async function fetchJapaneseWikitext(month, day) {
    const title = `${month}月${day}日`;
    const url =
      `https://ja.wikipedia.org/w/api.php?action=query&prop=revisions` +
      `&rvprop=content&rvslots=main&formatversion=2&format=json&origin=*` +
      `&titles=${encodeURIComponent(title)}`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error("Action API response not ok: " + res.status);
    const data = await res.json();
    const page = data && data.query && data.query.pages && data.query.pages[0];
    if (!page || page.missing || !page.revisions || !page.revisions[0]) {
      throw new Error("page not found: " + title);
    }
    const wikitext = page.revisions[0].slots.main.content;

    const eventsSection = extractSection(wikitext, "できごと");
    const birthsSection = extractSection(wikitext, "誕生日");

    const events = parseBullets(eventsSection, 8).sort(
      (a, b) => (b.year || 0) - (a.year || 0)
    );
    const births = parseBullets(birthsSection, 6).sort(
      (a, b) => (b.year || 0) - (a.year || 0)
    );

    if (events.length === 0 && births.length === 0) {
      throw new Error("no items parsed for " + title);
    }
    return { events, births };
  }

  // ---------- 統合ロジック（フォールバック付き） ----------

  async function fetchOnThisDay(lang, month, day) {
    const cacheKey = `${lang}-${pad2(month)}-${pad2(day)}`;
    if (cache.has(cacheKey)) return cache.get(cacheKey);

    let result;

    if (lang === "en") {
      try {
        const data = await fetchEnglishRest(month, day);
        result = { ...data, ok: true, sourceNote: null };
      } catch (err) {
        result = { events: [], births: [], ok: false, error: String(err) };
      }
    } else {
      // 日本語版: まず日付ページのwikitextパースを試みる
      try {
        const data = await fetchJapaneseWikitext(month, day);
        result = { ...data, ok: true, sourceNote: null };
      } catch (err1) {
        // フォールバック1: 英語版のデータを表示（注記付き）
        try {
          const data = await fetchEnglishRest(month, day);
          result = {
            ...data,
            ok: true,
            sourceNote: "en-fallback",
          };
        } catch (err2) {
          result = {
            events: [],
            births: [],
            ok: false,
            error: `${err1}; ${err2}`,
          };
        }
      }
    }

    cache.set(cacheKey, result);
    return result;
  }

  global.KoyomiHistory = { fetchOnThisDay };
})(typeof window !== "undefined" ? window : globalThis);
