/* ===================================================
   see2083 — Bookmarks (localStorage)
   =================================================== */

const Bookmarks = (() => {
  const KEY = "s2083_bookmarks";

  function isPlainObject(value) {
    return value && typeof value === "object" && !Array.isArray(value);
  }

  function isUsefulValue(value) {
    return value !== undefined && value !== null && String(value).trim() !== "";
  }

  function isValidUrl(url) {
    const value = String(url || "").trim();

    if (!value || value === "#") return false;
    if (/^file:/i.test(value)) return false;
    if (/^[a-z]:[\\/]/i.test(value)) return false;
    if (value.includes("\\")) return false;

    return true;
  }

  function getTimestamp(item) {
    const addedAt = Number(item && item.addedAt);
    const savedAt = Number(item && item.savedAt);
    const value = addedAt || savedAt;

    return Number.isFinite(value) && value > 0 ? value : Date.now();
  }

  function enrichFromUrl(item) {
    if (!item || !isValidUrl(item.url)) return item;

    try {
      const url = new URL(item.url, window.location.href);
      const subject = url.searchParams.get("subject");
      const chapter = url.searchParams.get("chapter");
      const medium = url.searchParams.get("medium");

      if (!item.subject && subject) item.subject = subject;
      if (!item.chapter && chapter) item.chapter = chapter;
      if (!item.medium && medium) item.medium = medium;
    } catch (error) {
      // Ignore malformed saved URLs; bookmarks-page.js will provide a safe fallback.
    }

    return item;
  }

  function inferType(item) {
    if (item.type) return String(item.type).trim();
    if (String(item.id || "").startsWith("chapter-")) return "chapter";
    if (String(item.id || "").startsWith("mcq-")) return "mcq";
    if (String(item.url || "").includes("quiz.html")) return "mcq";
    if (String(item.url || "").includes("chapter.html")) return "chapter";
    return "item";
  }

  function normalizeItem(item) {
    if (!isPlainObject(item)) return null;

    const normalized = { ...item };
    normalized.type = inferType(normalized);

    if (!isValidUrl(normalized.url)) {
      delete normalized.url;
    }

    enrichFromUrl(normalized);

    if (!isUsefulValue(normalized.id)) {
      if (normalized.type && normalized.url) {
        normalized.id = normalized.type + "-" + normalized.url;
      } else {
        return null;
      }
    }

    if (!isUsefulValue(normalized.title)) {
      normalized.title =
        normalized.titleNp ||
        normalized.chapterTitle ||
        normalized.question ||
        (normalized.type === "chapter" ? "Saved chapter" : "") ||
        (normalized.type === "mcq" ? "Saved question" : "") ||
        "Saved item";
    }

    const timestamp = getTimestamp(normalized);
    normalized.addedAt = timestamp;
    normalized.savedAt = timestamp;

    return normalized;
  }

  function completenessScore(item) {
    if (!item) return 0;

    return [
      item.id,
      item.type,
      item.title,
      item.url,
      item.subject,
      item.chapter,
      item.medium
    ].reduce(function (score, value) {
      return score + (isUsefulValue(value) ? 1 : 0);
    }, 0);
  }

  function mergeBookmark(existing, incoming) {
    if (!existing) return incoming;

    const merged = { ...existing };

    Object.keys(incoming || {}).forEach(function (key) {
      if (isUsefulValue(incoming[key])) {
        merged[key] = incoming[key];
      }
    });

    const existingTime = getTimestamp(existing);
    const incomingTime = getTimestamp(incoming);
    const finalTime = Math.max(existingTime, incomingTime);

    merged.addedAt = finalTime;
    merged.savedAt = finalTime;

    return completenessScore(incoming) >= completenessScore(existing)
      ? { ...merged, ...incoming, addedAt: finalTime, savedAt: finalTime }
      : merged;
  }

  function dedupeList(bookmarks) {
    const byId = new Map();
    const byFallback = new Map();

    (Array.isArray(bookmarks) ? bookmarks : []).forEach(function (item) {
      const normalized = normalizeItem(item);
      if (!normalized) return;

      const id = String(normalized.id);
      const fallbackKey = normalized.type + "::" + (normalized.url || "");

      if (byId.has(id)) {
        byId.set(id, mergeBookmark(byId.get(id), normalized));
        return;
      }

      if (normalized.url && byFallback.has(fallbackKey)) {
        const existingId = byFallback.get(fallbackKey);
        byId.set(existingId, mergeBookmark(byId.get(existingId), normalized));
        return;
      }

      byId.set(id, normalized);
      if (normalized.url) byFallback.set(fallbackKey, id);
    });

    return Array.from(byId.values()).sort(function (a, b) {
      return getTimestamp(b) - getTimestamp(a);
    });
  }

  function getAll() {
    try {
      const parsed = JSON.parse(localStorage.getItem(KEY) || "[]");
      return Array.isArray(parsed) ? dedupeList(parsed) : [];
    } catch (e) {
      return [];
    }
  }

  function save(bookmarks) {
    try {
      localStorage.setItem(KEY, JSON.stringify(dedupeList(bookmarks)));
      return true;
    } catch (e) {
      return false;
    }
  }

  function isBookmarked(id) {
    return getAll().some(b => b.id === id);
  }

  function add(item) {
    // item: { id, type, title, titleNp, subject, subjectNp, chapter, chapterNp, url }
    const normalized = normalizeItem(item);
    if (!normalized) return false;

    const all = getAll();
    const index = all.findIndex(function (bookmark) {
      return bookmark.id === normalized.id;
    });

    if (index >= 0) {
      all[index] = mergeBookmark(all[index], normalized);
    } else {
      all.unshift(normalized);
    }

    return save(all);
  }

  function remove(id) {
    if (!id) return false;

    const next = getAll().filter(function (bookmark) {
      return bookmark.id !== id;
    });

    if (!save(next)) return false;

    return !getAll().some(function (bookmark) {
      return bookmark.id === id;
    });
  }

  function toggle(item) {
    if (isBookmarked(item.id)) {
      remove(item.id);
      return false;
    } else {
      add(item);
      return true;
    }
  }

  function dedupeBookmarks() {
    const clean = getAll();
    save(clean);
    return clean;
  }

  return { getAll, isBookmarked, add, remove, toggle, dedupeBookmarks };
})();

// Toast notification helper
function showToast(message) {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("show"), 2500);
}
