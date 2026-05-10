/* ===================================================
   see2083 — Search
   =================================================== */

const Search = (() => {
  let externalIndexCache = [];
  let externalIndexLoaded = false;
  let externalIndexPromise = null;

  function getLang() {
    return typeof Lang !== "undefined" && typeof Lang.current === "function"
      ? Lang.current()
      : "en";
  }

  function getTypeLabel(type, lang) {
    if (type === "subject") return lang === "np" ? "विषय" : "Subject";
    if (type === "chapter") return lang === "np" ? "अध्याय" : "Chapter";
    if (type === "mcq") return "MCQ";
    return lang === "np" ? "अध्ययन सामग्री" : "Study Material";
  }

  function getTypeIcon(type) {
    if (type === "subject") return "📚";
    if (type === "chapter") return "📖";
    if (type === "mcq") return "✅";
    return "🔎";
  }

  function keywordText(parts) {
    return parts
      .flat()
      .filter(function (part) {
        return part !== undefined && part !== null;
      })
      .join(" ")
      .toLowerCase();
  }

  function normalizeExternalSearchItem(item) {
    if (!item || !item.url) return null;
    if (item.status && item.status !== "published") return null;

    const lang = getLang();
    const type = item.type || "chapter";
    const title = item.title || item.display || "";
    const titleNp = item.titleNp || title;
    const keywordSource = Array.isArray(item.keywords)
      ? item.keywords
      : item.keywords
        ? [item.keywords]
        : [];
    let subjectTitle = item.subjectTitle || "";

    if (!subjectTitle && item.subject && typeof S2083 !== "undefined" && typeof S2083.getSubject === "function") {
      const subject = S2083.getSubject(item.subject);
      if (subject) {
        subjectTitle = lang === "np" ? (subject.nameNp || subject.name) : subject.name;
      }
    }

    return {
      id: item.id || item.legacyId || item.url,
      type: type,
      typeLabel: getTypeLabel(type, lang),
      title: title,
      titleNp: titleNp,
      display: lang === "np" && titleNp ? titleNp : title,
      keywords: keywordText([
        title,
        titleNp,
        item.subject,
        item.chapter,
        item.medium,
        keywordSource
      ]),
      url: item.url,
      icon: item.icon || getTypeIcon(type),
      subjectTitle: subjectTitle,
      source: "external"
    };
  }

  async function loadExternalIndex() {
    if (externalIndexLoaded) return externalIndexCache;
    if (externalIndexPromise) return externalIndexPromise;

    externalIndexPromise = fetch("data/search-index.json")
      .then(function (response) {
        if (!response.ok) return [];
        return response.json();
      })
      .then(function (items) {
        externalIndexCache = Array.isArray(items)
          ? items
              .map(normalizeExternalSearchItem)
              .filter(Boolean)
          : [];
        externalIndexLoaded = true;
        return externalIndexCache;
      })
      .catch(function () {
        externalIndexCache = [];
        externalIndexLoaded = true;
        return [];
      });

    return externalIndexPromise;
  }

  function mergeIndexes(externalItems, fallbackItems) {
    const merged = [];
    const seenKeys = new Set();
    const seenUrls = new Set();

    function addItem(item) {
      if (!item) return;

      const key = (item.type || "") + "::" + (item.id || "");
      const url = item.url || "";

      if (key !== "::" && seenKeys.has(key)) return;
      if (url && seenUrls.has(url)) return;

      if (key !== "::") seenKeys.add(key);
      if (url) seenUrls.add(url);

      merged.push(item);
    }

    (externalItems || []).forEach(addItem);
    (fallbackItems || []).forEach(addItem);

    return merged;
  }

  function filterResults(index, term) {
    if (!term || term.trim().length < 2) return [];

    const q = term.toLowerCase().trim();

    return index.filter(function (item) {
      const keywords = String(item.keywords || "");
      const display = String(item.display || "");
      const title = String(item.title || "");
      const titleNp = String(item.titleNp || "");

      return keywords.includes(q) ||
        display.toLowerCase().includes(q) ||
        title.toLowerCase().includes(q) ||
        titleNp.toLowerCase().includes(q) ||
        titleNp.includes(q);
    });
  }

  // Build searchable index from all data
  function buildIndex() {
    const index = [];
    const lang = getLang();
    const medium = sessionStorage.getItem("s2083_medium") || "english";

    if (typeof S2083 === "undefined") {
      return index;
    }

    // Add subjects
    (Array.isArray(S2083.subjects) ? S2083.subjects : []).forEach(s => {
      index.push({
        id: s.id,
        type: "subject",
        typeLabel: lang === "np" ? "विषय" : "Subject",
        title: s.name,
        titleNp: s.nameNp,
        display: lang === "np" ? (s.nameNp || s.name) : s.name,
        keywords: [s.name, s.nameNp, s.description, s.descriptionNp].join(" ").toLowerCase(),
        url: `chapters.html?subject=${s.id}&medium=${medium}`,
        icon: s.icon
      });
    });

    // Add chapters
    Object.entries(S2083.chapters || {}).forEach(([subjectId, chapters]) => {
      const subject = S2083.getSubject(subjectId);
      if (!subject) return;
      (Array.isArray(chapters) ? chapters : []).forEach(ch => {
        index.push({
          id: `${subjectId}-${ch.id}`,
          type: "chapter",
          typeLabel: lang === "np" ? "अध्याय" : "Chapter",
          title: ch.title,
          titleNp: ch.titleNp || ch.title,
          display: lang === "np" ? (ch.titleNp || ch.title) : ch.title,
          subjectTitle: lang === "np" ? (subject.nameNp || subject.name) : subject.name,
          keywords: [ch.title, ch.titleNp, ch.summary, ch.summaryNp, subject.name, subject.nameNp].join(" ").toLowerCase(),
          url: `chapter.html?subject=${subjectId}&chapter=${ch.id}&medium=${medium}`,
          icon: subject.icon
        });
      });
    });

    // Add MCQ questions
    (Array.isArray(S2083.sampleMCQs) ? S2083.sampleMCQs : []).forEach(q => {
      index.push({
        id: q.id,
        type: "mcq",
        typeLabel: lang === "np" ? "MCQ" : "MCQ",
        title: q.question,
        titleNp: q.question,
        display: q.question,
        keywords: [q.question, ...q.options].join(" ").toLowerCase(),
        url: `quiz.html`,
        icon: "✅"
      });
    });

    return index;
  }

  function query(term) {
    const fallbackIndex = buildIndex();
    const index = externalIndexLoaded
      ? mergeIndexes(externalIndexCache, fallbackIndex)
      : fallbackIndex;

    return filterResults(index, term);
  }

  async function queryAsync(term) {
    const externalIndex = await loadExternalIndex();
    const index = mergeIndexes(externalIndex, buildIndex());

    return filterResults(index, term);
  }

  return {
    query,
    queryAsync,
    buildIndex,
    loadExternalIndex
  };
})();
