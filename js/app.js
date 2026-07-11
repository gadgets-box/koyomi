/**
 * app.js — 今日の暦 メインコントローラ
 */
(function () {
  "use strict";

  const $ = (sel) => document.querySelector(sel);

  const REIWA_START_YEAR = 2019; // 令和元年

  const state = {
    lang: "ja",
    date: null, // {y,m,d} JST calendar date currently displayed
    historyTab: "events",
    historyCache: {},
  };

  function todayJST() {
    const now = new Date();
    const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    return { y: jst.getUTCFullYear(), m: jst.getUTCMonth() + 1, d: jst.getUTCDate() };
  }

  function isSameDate(a, b) {
    return a.y === b.y && a.m === b.m && a.d === b.d;
  }

  function addDays({ y, m, d }, delta) {
    const dt = new Date(Date.UTC(y, m - 1, d));
    dt.setUTCDate(dt.getUTCDate() + delta);
    return { y: dt.getUTCFullYear(), m: dt.getUTCMonth() + 1, d: dt.getUTCDate() };
  }

  function weekdayIndex({ y, m, d }) {
    return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  }

  function daysBetween(a, b) {
    const ta = Date.UTC(a.y, a.m - 1, a.d);
    const tb = Date.UTC(b.y, b.m - 1, b.d);
    return Math.round((tb - ta) / 86400000);
  }

  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  function fmtISO({ y, m, d }) {
    return `${y}-${pad2(m)}-${pad2(d)}`;
  }

  function reiwaYear(y) {
    return y - REIWA_START_YEAR + 1;
  }

  // ---------- URL hash routing ----------

  function parseHash() {
    const h = location.hash.replace(/^#\/?/, "");
    const parts = h.split("/").filter(Boolean);
    let date = null;
    let lang = null;
    for (const p of parts) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(p)) {
        const [y, m, d] = p.split("-").map(Number);
        date = { y, m, d };
      } else if (p === "ja" || p === "en") {
        lang = p;
      }
    }
    return { date, lang };
  }

  function updateHash() {
    const newHash = `#/${fmtISO(state.date)}/${state.lang}`;
    history.replaceState(null, "", newHash);
  }

  // ---------- Rendering ----------

  function t(key) {
    return window.KoyomiI18n.t(state.lang, key);
  }

  function applyLangAttrs() {
    document.documentElement.lang = state.lang === "ja" ? "ja" : "en";
  }

  function renderHeader() {
    $("#siteTitle").textContent = t("siteName");
    $("#siteTagline").textContent = t("tagline");
    $("#langToggle").textContent = t("langToggle");
    $("#todayJump").textContent = t("today");
    $("#keyboardHint").textContent = t("keyboardHint");
    $("#birthdaySectionTitle").textContent = t("birthdayLabel");
    $("#birthdayInput").setAttribute("aria-label", t("birthdayInputPlaceholder"));
    $("#birthdaySetBtn").textContent = t("birthdaySet");
    $("#birthdayClearBtn").textContent = t("birthdayClear");
    $("#birthdayHint").textContent = t("birthdayHint");
    $("#historyTitle").textContent = t("historyLabel");
    $("#tabEvents").textContent = t("historyEvents");
    $("#tabBirths").textContent = t("historyBirths");
    $("#historySource").textContent = t("historySource");
    $("#shareLabel").textContent = t("shareLabel");
    $("#backToTop").textContent = t("backToTop");
    $("#lunarLabel").textContent = t("lunarLabel");
    $("#rokuyoLabel").textContent = t("rokuyoLabel");
    $("#sekkiLabel").textContent = t("sekkiLabel");
  }

  function renderDate() {
    const d = state.date;
    const weekdayNames = t("weekday");
    const wIdx = weekdayIndex(d);
    const isJa = state.lang === "ja";

    $("#dateNumber").textContent = String(d.d);
    $("#monthYear").textContent = isJa
      ? `${d.y}年（令和${reiwaYear(d.y)}年） ${d.m}月`
      : new Date(Date.UTC(d.y, d.m - 1, d.d)).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          timeZone: "UTC",
        });
    $("#weekdayBadge").textContent = isJa
      ? `${weekdayNames[wIdx]}曜日`
      : weekdayNames[wIdx];

    const today = todayJST();
    $("#todayJump").style.display = isSameDate(d, today) ? "none" : "inline-block";

    document.title = isJa
      ? `${d.y}年${d.m}月${d.d}日（${weekdayNames[wIdx]}）の暦 | 今日の暦`
      : `Almanac for ${new Date(Date.UTC(d.y, d.m - 1, d.d)).toLocaleDateString(
          "en-US",
          { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }
        )} | Today's Almanac`;

    const desc = isJa
      ? `${d.y}年${d.m}月${d.d}日の旧暦・六曜・二十四節気・今日は何の日をまとめた日めくりカレンダー。`
      : `Lunar date, rokuyō, solar term, and historical events for ${fmtISO(
          d
        )} — a daily tear-off calendar.`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", desc);
  }

  function renderLunarSekkiRokuyo() {
    const d = state.date;
    const L = window.KoyomiLunar;
    const isJa = state.lang === "ja";

    const lunar = L.getLunarDate(d.y, d.m, d.d);
    const leapPrefix = lunar.isLeapMonth ? t("leapMonthPrefix") : "";
    $("#lunarValue").textContent = isJa
      ? `${leapPrefix}${lunar.month}月${lunar.day}日`
      : `${leapPrefix}Month ${lunar.month}, Day ${lunar.day}`;

    const rokuyo = L.getRokuyo(lunar.month, lunar.day);
    $("#rokuyoValue").innerHTML = `<span class="rokuyo-dot" aria-hidden="true"></span>${
      isJa ? rokuyo.ja : rokuyo.en
    }`;

    const sekki = L.getSekkiInfo(d.y, d.m, d.d);
    const cur = sekki.current;
    const curName = isJa ? cur.ja : cur.en;
    $("#sekkiValue").textContent = curName;
    if (sekki.isToday) {
      $("#sekkiSub").textContent = t("sekkiTodayNote");
    } else if (sekki.next) {
      const daysToNext = daysBetween(d, sekki.next.date);
      $("#sekkiSub").textContent = `${t("sekkiCurrentNote")} ・ ${t(
        "sekkiNextNote"
      )}${daysToNext}${t("daysUnit")}`;
    } else {
      $("#sekkiSub").textContent = t("sekkiCurrentNote");
    }
  }

  function renderIllustration() {
    const d = state.date;
    const svg = window.KoyomiIllustration.getIllustrationSVG(d.m, d.d);
    $("#illustrationFrame").innerHTML = svg;
    const season = window.KoyomiIllustration.getSeason(d.m);
    document.body.className = document.body.className
      .replace(/season-\w+/g, "")
      .trim();
    document.body.classList.add(`season-${season}`);
  }

  async function renderHistory() {
    const d = state.date;
    const listEl = $("#historyList");
    listEl.innerHTML = `<li class="history-loading">${t("historyLoading")}</li>`;

    const requestedDate = d;
    const requestedLang = state.lang;
    const data = await window.KoyomiHistory.fetchOnThisDay(state.lang, d.m, d.d);

    // 取得中にページ遷移していたら古い結果を描画しない
    if (!isSameDate(requestedDate, state.date) || requestedLang !== state.lang) return;

    if (!data.ok) {
      listEl.innerHTML = `<li>${t("historyError")}</li>`;
      return;
    }

    const items = state.historyTab === "events" ? data.events : data.births;
    if (!items || items.length === 0) {
      listEl.innerHTML = `<li>${t("historyError")}</li>`;
      return;
    }

    listEl.innerHTML = items
      .map(
        (item) =>
          `<li><span class="year">${item.year ?? ""}</span>${escapeHTML(
            item.text
          )}</li>`
      )
      .join("");
  }

  function escapeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function renderBirthday() {
    const d = state.date;
    const isJa = state.lang === "ja";
    const saved = localStorage.getItem("koyomi_birthday");
    const resultEl = $("#birthdayResult");
    $("#birthdayInput").value = saved || "";

    if (!saved) {
      resultEl.textContent = "";
      $("#birthdayClearBtn").style.display = "none";
      return;
    }
    $("#birthdayClearBtn").style.display = "inline-block";

    const [by, bm, bd] = saved.split("-").map(Number);
    const birth = { y: by, m: bm, d: bd };
    const diff = daysBetween(birth, d) + 1;

    if (diff < 1) {
      resultEl.textContent = t("birthdayFuture");
    } else {
      resultEl.innerHTML = isJa
        ? `${t("birthdayResultPrefix")}<strong>${diff.toLocaleString(
            "ja-JP"
          )}</strong>${t("birthdayResultSuffix")}`
        : `${t("birthdayResultPrefix")} <strong>${diff.toLocaleString(
            "en-US"
          )}</strong> ${t("birthdayResultSuffix")}`;
    }
  }

  function renderStructuredData() {
    const d = state.date;
    const existing = document.getElementById("structuredData");
    if (existing) existing.remove();
    const metaDesc = document.querySelector('meta[name="description"]');
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "structuredData";
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: document.title,
      description: metaDesc ? metaDesc.getAttribute("content") : "",
      about: {
        "@type": "Event",
        name: `${fmtISO(d)} 今日の暦`,
        startDate: fmtISO(d),
      },
      inLanguage: state.lang,
    });
    document.head.appendChild(script);
  }

  function renderAll() {
    applyLangAttrs();
    renderHeader();
    renderDate();
    renderLunarSekkiRokuyo();
    renderIllustration();
    renderBirthday();
    renderHistory();
    renderStructuredData();
    updateHash();
  }

  // ---------- Event wiring ----------

  function goToDate(newDate) {
    state.date = newDate;
    renderAll();
  }

  function setHistoryTab(tab) {
    state.historyTab = tab;
    $("#tabEvents").setAttribute("aria-selected", String(tab === "events"));
    $("#tabBirths").setAttribute("aria-selected", String(tab === "births"));
    renderHistory();
  }

  function navigatorPreferredLang() {
    const nav = (navigator.language || "ja").toLowerCase();
    return nav.startsWith("ja") ? "ja" : "en";
  }

  function init() {
    const { date: hashDate, lang: hashLang } = parseHash();
    state.date = hashDate || todayJST();
    state.lang = hashLang || navigatorPreferredLang();

    $("#prevDayBtn").addEventListener("click", () =>
      goToDate(addDays(state.date, -1))
    );
    $("#nextDayBtn").addEventListener("click", () =>
      goToDate(addDays(state.date, 1))
    );
    $("#todayJump").addEventListener("click", () => goToDate(todayJST()));

    $("#langToggle").addEventListener("click", () => {
      state.lang = state.lang === "ja" ? "en" : "ja";
      renderAll();
    });

    $("#tabEvents").addEventListener("click", () => setHistoryTab("events"));
    $("#tabBirths").addEventListener("click", () => setHistoryTab("births"));

    $("#birthdaySetBtn").addEventListener("click", () => {
      const val = $("#birthdayInput").value;
      if (val) {
        localStorage.setItem("koyomi_birthday", val);
        renderBirthday();
      }
    });
    $("#birthdayClearBtn").addEventListener("click", () => {
      localStorage.removeItem("koyomi_birthday");
      renderBirthday();
    });

    $("#shareBtn").addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(location.href);
        const original = $("#shareBtn").textContent;
        $("#shareBtn").textContent = t("copied");
        setTimeout(() => ($("#shareBtn").textContent = original), 1800);
      } catch (e) {
        /* clipboard unavailable — ignore silently */
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.target.tagName === "INPUT") return;
      if (e.key === "ArrowLeft") goToDate(addDays(state.date, -1));
      if (e.key === "ArrowRight") goToDate(addDays(state.date, 1));
    });

    window.addEventListener("hashchange", () => {
      const { date, lang } = parseHash();
      let changed = false;
      if (date && !isSameDate(date, state.date)) {
        state.date = date;
        changed = true;
      }
      if (lang && lang !== state.lang) {
        state.lang = lang;
        changed = true;
      }
      if (changed) renderAll();
    });

    renderAll();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
