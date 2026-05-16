/* ===================================================
   see2083 - Future Content Loader
   Phase 2A: notes.html external content only
   =================================================== */

(function () {
  var indexCache = null;
  var indexPromise = null;

  async function loadJSON(path) {
    try {
      var response = await fetch(path);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      return null;
    }
  }

  async function loadText(path) {
    try {
      var response = await fetch(path);
      if (!response.ok) return null;
      return await response.text();
    } catch (error) {
      return null;
    }
  }

  async function loadContentIndex() {
    if (indexCache) return indexCache;

    if (!indexPromise) {
      indexPromise = loadJSON("data/content-index.json")
        .then(function (index) {
          indexCache = index || null;
          return indexCache;
        })
        .catch(function () {
          indexCache = null;
          return null;
        });
    }

    return indexPromise;
  }

  async function getChapterEntry(medium, subjectId, chapterId) {
    try {
      var index = await loadContentIndex();
      if (!index || !index.mediums) return null;

      var mediumEntry = index.mediums[medium];
      if (!mediumEntry || !mediumEntry.subjects) return null;

      var subjectEntry = mediumEntry.subjects[subjectId];
      if (!subjectEntry || !subjectEntry.chapters) return null;

      return subjectEntry.chapters[chapterId] || null;
    } catch (error) {
      return null;
    }
  }

  function getResourcePath(entry, type) {
    if (!entry || !entry.resources) return null;

    var resources = entry.resources;

    if (type === "easy") return resources.easyNote || null;
    if (type === "overview") return resources.notes || null;
    if (type === "theory") return resources.notes || null;
    if (type === "practical") return resources.notes || null;
    if (type === "handwritten") return resources.handwrittenNote || null;
    if (type === "infographic") return resources.infographics || null;
    if (type === "slides") return resources.slides || null;
    if (type === "short") return resources.shortQuestions || null;
    if (type === "important") return resources.importantQuestions || null;
    if (type === "past") return resources.pastQuestions || null;

    return resources.notes || null;
  }

  async function loadNotesResource(medium, subjectId, chapterId, type) {
    try {
      var entry = await getChapterEntry(medium, subjectId, chapterId);
      var path = getResourcePath(entry, type);

      if (!entry || !path) {
        return {
          found: false,
          kind: "missing",
          path: path || "",
          data: null
        };
      }

      if (/\.html?$/i.test(path)) {
        var html = await loadText(path);
        return {
          found: Boolean(html),
          kind: html ? "html" : "missing",
          path: path,
          data: html
        };
      }

      if (/\.json$/i.test(path)) {
        var json = await loadJSON(path);
        return {
          found: Boolean(json),
          kind: json ? "json" : "missing",
          path: path,
          data: json
        };
      }

      return {
        found: false,
        kind: "missing",
        path: path,
        data: null
      };
    } catch (error) {
      return {
        found: false,
        kind: "missing",
        path: "",
        data: null
      };
    }
  }

  async function loadQuizResource(medium, subjectId, chapterId) {
    try {
      var entry = await getChapterEntry(medium, subjectId, chapterId);
      var path = entry && entry.resources ? entry.resources.mcq : null;

      if (!entry || !path) {
        return {
          found: false,
          kind: "missing",
          path: null,
          data: null
        };
      }

      var json = await loadJSON(path);

      if (!json || !Array.isArray(json.questions)) {
        return {
          found: false,
          kind: "missing",
          path: null,
          data: null
        };
      }

      return {
        found: true,
        kind: "json",
        path: path,
        data: json
      };
    } catch (error) {
      return {
        found: false,
        kind: "missing",
        path: null,
        data: null
      };
    }
  }

  function normalizeMCQData(data, fallbackSubject, fallbackChapter) {
    var rawQuestions = Array.isArray(data)
      ? data
      : data && Array.isArray(data.questions)
        ? data.questions
        : [];

    return rawQuestions
      .filter(function (question) {
        var reviewStatus = question && question.reviewStatus;

        if (!question || !question.id) return false;
        if (reviewStatus && String(reviewStatus).toLowerCase() !== "published") return false;
        if (!question.question || !String(question.question).trim()) return false;
        if (!Array.isArray(question.options) || question.options.length !== 4) return false;
        if (typeof question.correct !== "number") return false;
        if (question.correct < 0 || question.correct > 3 || question.correct % 1 !== 0) return false;

        return true;
      })
      .map(function (question) {
        var normalized = {
          id: question.id,
          subject: question.subject || fallbackSubject || "",
          chapter: question.chapter || fallbackChapter || "",
          question: String(question.question),
          options: question.options.map(function (option) {
            return option == null ? "" : String(option);
          }),
          correct: question.correct,
          explanation: question.explanation ? String(question.explanation) : ""
        };

        if (question.legacyId) normalized.legacyId = question.legacyId;
        if (question.questionNp) normalized.questionNp = question.questionNp;
        if (Array.isArray(question.optionsNp)) normalized.optionsNp = question.optionsNp;
        if (question.explanationNp) normalized.explanationNp = question.explanationNp;

        return normalized;
      });
  }

  async function loadMockTestResource(medium, subjectId, chapterId) {
    try {
      var entry = await getChapterEntry(medium, subjectId, chapterId);
      var path = entry && entry.resources ? entry.resources.mockTest : null;

      if (!entry || !path) {
        return {
          found: false,
          kind: "missing",
          path: null,
          data: null
        };
      }

      var json = await loadJSON(path);

      if (!json || !Array.isArray(json.questions)) {
        return {
          found: false,
          kind: "missing",
          path: null,
          data: null
        };
      }

      return {
        found: true,
        kind: "json",
        path: path,
        data: json
      };
    } catch (error) {
      return {
        found: false,
        kind: "missing",
        path: null,
        data: null
      };
    }
  }

  function normalizeMockTestData(data, fallbackSubject, fallbackChapter) {
    var rawQuestions = Array.isArray(data)
      ? data
      : data && Array.isArray(data.questions)
        ? data.questions
        : [];

    return rawQuestions
      .filter(function (question) {
        var reviewStatus = question && question.reviewStatus;

        if (!question || !question.id) return false;
        if (reviewStatus && String(reviewStatus).toLowerCase() !== "published") return false;
        if (!question.question || !String(question.question).trim()) return false;
        if (!Array.isArray(question.options) || question.options.length !== 4) return false;
        if (typeof question.correct !== "number") return false;
        if (question.correct < 0 || question.correct > 3 || question.correct % 1 !== 0) return false;

        return true;
      })
      .map(function (question) {
        var normalized = {
          id: question.id,
          subject: question.subject || fallbackSubject || "",
          chapter: question.chapter || fallbackChapter || "",
          question: String(question.question),
          options: question.options.map(function (option) {
            return option == null ? "" : String(option);
          }),
          correct: question.correct,
          explanation: question.explanation ? String(question.explanation) : ""
        };

        if (question.questionNp) normalized.questionNp = question.questionNp;
        if (Array.isArray(question.optionsNp)) normalized.optionsNp = question.optionsNp;
        if (question.explanationNp) normalized.explanationNp = question.explanationNp;
        if (question.difficulty) normalized.difficulty = question.difficulty;

        return normalized;
      });
  }

  async function loadChapterResourceBundle(medium, subjectId, chapterId) {
    try {
      var entry = await getChapterEntry(medium, subjectId, chapterId);

      if (!entry) {
        return {
          found: false,
          entry: null,
          resources: {},
          availableTypes: []
        };
      }

      var resources = entry.resources || {};
      var knownTypes = [
        "chapter",
        "notes",
        "easyNote",
        "mcq",
        "mockTest",
        "slides",
        "infographics",
        "downloads",
        "importantQuestions",
        "shortQuestions",
        "pastQuestions",
        "handwrittenNote"
      ];
      var availableTypes = knownTypes.filter(function (type) {
        return Boolean(resources[type]);
      });

      return {
        found: true,
        entry: entry,
        resources: resources,
        availableTypes: availableTypes
      };
    } catch (error) {
      return {
        found: false,
        entry: null,
        resources: {},
        availableTypes: []
      };
    }
  }

  async function loadInfographicsResource(medium, subjectId, chapterId) {
    try {
      var entry = await getChapterEntry(medium, subjectId, chapterId);
      var path = entry && entry.resources ? entry.resources.infographics : null;

      if (!entry || !path) {
        return {
          found: false,
          items: [],
          path: path || null
        };
      }

      var json = await loadJSON(path);
      var items = json && Array.isArray(json.items) ? json.items : [];
      var validItems = items.filter(function (item) {
        var status = item && (item.status || item.reviewStatus || json.status);
        var normalizedStatus = status ? String(status).toLowerCase() : "";
        var previewUrl = item && (item.previewUrl || item.embedUrl) ? String(item.previewUrl || item.embedUrl).trim() : "";

        if (!item) return false;
        if (normalizedStatus && normalizedStatus !== "published") return false;
        if (!item.title || !previewUrl) return false;
        if (previewUrl === "#") return false;
        if (previewUrl.indexOf("PASTE_GOOGLE_DRIVE") !== -1) return false;

        return true;
      });

      return {
        found: validItems.length > 0,
        items: validItems,
        path: path
      };
    } catch (error) {
      return {
        found: false,
        items: [],
        path: null
      };
    }
  }

  async function loadDownloadsResource(medium, subjectId, chapterId) {
    try {
      var entry = await getChapterEntry(medium, subjectId, chapterId);
      var path = entry && entry.resources ? entry.resources.downloads : null;

      if (!entry || !path) {
        return {
          found: false,
          items: [],
          path: path || null
        };
      }

      var json = await loadJSON(path);
      var items = json && Array.isArray(json.items) ? json.items : [];
      var validItems = items.filter(function (item) {
        var viewUrl = item && item.viewUrl ? String(item.viewUrl).trim() : "";

        if (!item) return false;
        if (item.status && item.status !== "published") return false;
        if (!item.title || !item.type || !item.mode || !viewUrl) return false;
        if (viewUrl === "#") return false;
        if (viewUrl.indexOf("PASTE_GOOGLE_DRIVE") !== -1) return false;

        return true;
      });

      return {
        found: validItems.length > 0,
        items: validItems,
        path: path
      };
    } catch (error) {
      return {
        found: false,
        items: [],
        path: null
      };
    }
  }

  window.SEE2083ContentLoader = {
    loadContentIndex: loadContentIndex,
    getChapterEntry: getChapterEntry,
    loadText: loadText,
    loadJSON: loadJSON,
    getResourcePath: getResourcePath,
    loadNotesResource: loadNotesResource,
    loadQuizResource: loadQuizResource,
    normalizeMCQData: normalizeMCQData,
    loadMockTestResource: loadMockTestResource,
    normalizeMockTestData: normalizeMockTestData,
    loadChapterResourceBundle: loadChapterResourceBundle,
    loadInfographicsResource: loadInfographicsResource,
    loadDownloadsResource: loadDownloadsResource
  };
})();
