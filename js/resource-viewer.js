/* ===================================================
   SEE 2083 - Resource Viewer
   Loads chapter infographic metadata and embeds Drive previews.
   =================================================== */

(function () {
  const subjectId = getParam("subject") || "science";
  const chapterId = getParam("chapter") || "";
  const medium = getParam("medium") || getCurrentMedium() || "english";
  const type = getParam("type") || "infographic";

  if (typeof setMedium === "function") {
    setMedium(medium);
  }

  if (typeof pageInit === "function") {
    pageInit("subjects");
  }

  const labels = {
    home: "Home",
    medium: "Medium",
    subjects: "Subjects",
    resource: "Resource",
    infographic: "Infographic",
    pdfNote: "PDF Note",
    slides: "Slides",
    backToChapter: "Back to Chapter",
    chooseChapter: "Choose Chapter",
    mcqPractice: "MCQ Practice",
    emptyTitle: "Infographic is being added for this chapter.",
    noteEmptyTitle: "PDF note is being added for this chapter.",
    slidesEmptyTitle: "Slides are being added for this chapter.",
    unsupportedTitle: "This resource type is not available yet.",
    previewMissingTitle: "Resource preview is not available for this chapter.",
    emptyText: "Please choose another chapter or return to the chapter page.",
    drivePreview: "Google Drive preview",
    driveFallback: "Open preview",
    viewOnlyNote: "View-only study resource. Please use it for revision.",
    loading: "Loading infographic preview..."
  };

  const els = {
    breadcrumb: document.getElementById("breadcrumb"),
    kicker: document.getElementById("resource-kicker"),
    title: document.getElementById("resource-title"),
    description: document.getElementById("resource-description"),
    frame: document.getElementById("resource-frame"),
    frameWrap: document.getElementById("resource-frame-wrap"),
    loading: document.getElementById("resource-loading"),
    viewerCard: document.getElementById("viewer-card"),
    emptyState: document.getElementById("empty-state"),
    source: document.getElementById("resource-source"),
    driveLink: document.getElementById("open-drive-link"),
    backBtn: document.getElementById("back-chapter-btn"),
    chooseBtn: document.getElementById("choose-chapter-btn"),
    emptyBackBtn: document.getElementById("empty-back-btn"),
    emptyChooseBtn: document.getElementById("empty-choose-btn"),
    emptyTitle: document.getElementById("empty-title"),
    emptyText: document.getElementById("empty-text"),
    mcqBtn: document.getElementById("mcq-practice-btn"),
    nextActions: document.getElementById("next-actions"),
    viewNote: document.getElementById("resource-view-note")
  };

  const resourceConfigs = {
    infographic: {
      key: "infographic",
      label: labels.infographic,
      suffix: "Infographic",
      emptyTitle: labels.emptyTitle,
      previewMissingTitle: "Infographic preview is not available for this chapter."
    },
    note: {
      key: "note",
      group: "note",
      label: labels.pdfNote,
      suffix: "PDF Note",
      emptyTitle: labels.noteEmptyTitle,
      previewMissingTitle: "PDF note preview is not available for this chapter."
    },
    "easy-note": {
      key: "easy-note",
      group: "note",
      label: labels.pdfNote,
      suffix: "PDF Note",
      emptyTitle: labels.noteEmptyTitle,
      previewMissingTitle: "PDF note preview is not available for this chapter."
    },
    "full-note": {
      key: "full-note",
      group: "note",
      label: labels.pdfNote,
      suffix: "PDF Note",
      emptyTitle: labels.noteEmptyTitle,
      previewMissingTitle: "PDF note preview is not available for this chapter."
    },
    slides: {
      key: "slides",
      label: labels.slides,
      suffix: "Slides",
      emptyTitle: labels.slidesEmptyTitle,
      previewMissingTitle: "Slides preview is not available for this chapter."
    }
  };

  const fallbackConfig = {
    key: "resource",
    label: labels.resource,
    suffix: labels.resource,
    emptyTitle: labels.unsupportedTitle,
    previewMissingTitle: labels.previewMissingTitle
  };
  let activePreviewUrl = "";

  function buildQuery(params) {
    return Object.keys(params)
      .map(function (key) {
        return encodeURIComponent(key) + "=" + encodeURIComponent(params[key] || "");
      })
      .join("&");
  }

  function getChapterUrl() {
    return "chapter.html?" + buildQuery({
      subject: subjectId,
      chapter: chapterId,
      medium: medium
    });
  }

  function getChooseChapterUrl() {
    return "chapters.html?" + buildQuery({
      subject: subjectId,
      medium: medium
    });
  }

  function getQuizUrl() {
    return "quiz.html?" + buildQuery({
      subject: subjectId,
      chapter: chapterId,
      medium: medium
    });
  }

  function getSubjectObject() {
    if (!hasS2083Data()) return null;

    if (typeof S2083.getSubject === "function") {
      return S2083.getSubject(subjectId);
    }

    return getSubjectById(subjectId);
  }

  function getChapterObject() {
    if (!hasS2083Data() || !chapterId) return null;

    if (typeof S2083.getChapter === "function") {
      return S2083.getChapter(subjectId, chapterId);
    }

    if (!S2083.chapters || !Array.isArray(S2083.chapters[subjectId])) {
      return null;
    }

    return S2083.chapters[subjectId].find(function (chapter) {
      return chapter.id === chapterId;
    }) || null;
  }

  function getSubjectName(subject) {
    return subject ? subject.name || subjectId : subjectId;
  }

  function getResourceConfig(resourceType) {
    return resourceConfigs[resourceType] || null;
  }

  function getDisplayConfig() {
    return getResourceConfig(type) || fallbackConfig;
  }

  function getChapterTitle(chapter, item) {
    if (chapter && chapter.title) return chapter.title;
    if (item && item.title) return String(item.title).replace(/\s+(Infographic|PDF Note|Slides)$/i, "");
    return chapterId || "Chapter";
  }

  function getResourceTitle(chapter, item, config) {
    const chapterTitle = getChapterTitle(chapter, item);
    return item && item.title ? item.title : chapterTitle + " " + config.suffix;
  }

  function setCommonLinks() {
    const chapterUrl = getChapterUrl();
    const chooseUrl = getChooseChapterUrl();

    [els.backBtn, els.emptyBackBtn].forEach(function (link) {
      if (!link) return;
      link.href = chapterUrl;
      link.textContent = labels.backToChapter;
    });

    [els.chooseBtn, els.emptyChooseBtn].forEach(function (link) {
      if (!link) return;
      link.href = chooseUrl;
      link.textContent = labels.chooseChapter;
    });

    if (els.mcqBtn) {
      els.mcqBtn.href = getQuizUrl();
      els.mcqBtn.textContent = labels.mcqPractice;
    }
  }

  function renderBreadcrumbs(subject, chapter, item, config) {
    if (!els.breadcrumb || typeof renderBreadcrumb !== "function") return;

    const currentConfig = config || getDisplayConfig();
    const subjectName = getSubjectName(subject);
    const chapterTitle = getChapterTitle(chapter, item);

    renderBreadcrumb(els.breadcrumb, [
      { label: labels.home, href: "index.html" },
      { label: labels.medium, href: "subjects.html?medium=" + encodeURIComponent(medium) },
      {
        label: subjectName,
        href:
          "chapters.html?subject=" +
          encodeURIComponent(subjectId) +
          "&medium=" +
          encodeURIComponent(medium)
      },
      { label: chapterTitle, href: getChapterUrl() },
      { label: currentConfig.label }
    ]);
  }

  function getPreviewUrl(item) {
    return String(item && (item.embedUrl || item.previewUrl) ? item.embedUrl || item.previewUrl : "").trim();
  }

  function getItemStatus(item, parentData) {
    return String(
      (item && (item.status || item.reviewStatus)) ||
      (parentData && parentData.status) ||
      "published"
    ).toLowerCase();
  }

  function isSafePreviewUrl(url) {
    if (!url || url === "#") return false;
    if (url.indexOf("PASTE_GOOGLE_DRIVE") !== -1) return false;
    if (/uc\?export=/i.test(url)) return false;
    return true;
  }

  function isUsableDriveItem(item, config, parentData) {
    if (!item || typeof item !== "object") return false;

    const status = getItemStatus(item, parentData);
    const previewUrl = getPreviewUrl(item);

    if (status && status !== "published") return false;
    if (!isSafePreviewUrl(previewUrl)) return false;
    if (config.key === "infographic") return true;

    return matchesResourceType(item, config, parentData);
  }

  function isUsableInfographic(item) {
    return isUsableDriveItem(item, resourceConfigs.infographic, null);
  }

  function normalizeKind(value) {
    return String(value || "").toLowerCase().replace(/_/g, "-").trim();
  }

  function matchesResourceType(item, config, parentData) {
    const parentType = normalizeKind(parentData && parentData.resourceType);
    const itemResourceType = normalizeKind(item.resourceType);
    const itemType = normalizeKind(item.type);
    const noteType = normalizeKind(item.noteType);
    const title = normalizeKind(item.title);

    if (config.group === "note") {
      if (["notes", "note", "pdf-note", "drive-pdf"].indexOf(parentType) !== -1) return true;
      if (["notes", "note", "pdf-note", "drive-pdf"].indexOf(itemResourceType) !== -1) return true;
      if (["note", "easy-note", "full-note", "pdf-note", "drive-pdf"].indexOf(noteType) !== -1) return true;
      if (["note", "easy-note", "full-note", "pdf-note", "drive-pdf"].indexOf(itemType) !== -1) return true;
      return title.indexOf("note") !== -1;
    }

    if (config.key === "slides") {
      if (["slides", "slide", "google-slides", "drive-slides"].indexOf(parentType) !== -1) return true;
      if (["slides", "slide", "google-slides", "drive-slides"].indexOf(itemResourceType) !== -1) return true;
      if (["slides", "slide", "google-slides", "drive-slides"].indexOf(itemType) !== -1) return true;
      return title.indexOf("slide") !== -1;
    }

    return false;
  }

  function getResourceItems(data) {
    if (!data || typeof data !== "object") return [];
    if (Array.isArray(data.items)) return data.items;
    if (Array.isArray(data.slides)) return data.slides;
    if (Array.isArray(data.resources)) return data.resources;
    return [];
  }

  function getFirstResourceItem(data, config) {
    const items = getResourceItems(data);
    return items.find(function (item) {
      return isUsableDriveItem(item, config, data);
    }) || null;
  }

  function getFirstCandidateItem(data) {
    const items = getResourceItems(data);
    return items[0] || null;
  }

  async function loadCandidateJsonFiles(config, fileNames) {
    const loader = window.SEE2083ContentLoader;
    if (!loader || typeof loader.loadJSON !== "function") {
      return {
        item: null,
        reason: "missing"
      };
    }

    for (let i = 0; i < fileNames.length; i += 1) {
      const path =
        "content/" +
        encodeURIComponent(medium) +
        "/" +
        encodeURIComponent(subjectId) +
        "/" +
        encodeURIComponent(chapterId) +
        "/" +
        fileNames[i];
      const data = await loader.loadJSON(path);
      const usableItem = getFirstResourceItem(data, config);

      if (usableItem) {
        return {
          item: usableItem,
          parentData: data,
          reason: "found"
        };
      }

      if (config.key === "infographic" && getFirstCandidateItem(data)) {
        return {
          item: getFirstCandidateItem(data),
          parentData: data,
          reason: "missing-preview"
        };
      }
    }

    return {
      item: null,
      reason: "missing"
    };
  }

  async function loadIndexedJsonResource(resourceKey, config) {
    const loader = window.SEE2083ContentLoader;

    if (
      !loader ||
      typeof loader.getChapterEntry !== "function" ||
      typeof loader.loadJSON !== "function"
    ) {
      return {
        item: null,
        reason: "missing"
      };
    }

    const entry = await loader.getChapterEntry(medium, subjectId, chapterId);
    const path = entry && entry.resources ? entry.resources[resourceKey] : "";

    if (!path || !/\.json$/i.test(path)) {
      return {
        item: null,
        reason: "missing"
      };
    }

    const data = await loader.loadJSON(path);
    const usableItem = getFirstResourceItem(data, config);

    if (usableItem) {
      return {
        item: usableItem,
        parentData: data,
        reason: "found"
      };
    }

    if (config.key === "infographic" && getFirstCandidateItem(data)) {
      return {
        item: getFirstCandidateItem(data),
        parentData: data,
        reason: "missing-preview"
      };
    }

    return {
      item: null,
      reason: "missing"
    };
  }

  async function loadInfographicItem() {
    const loader = window.SEE2083ContentLoader;

    if (loader && typeof loader.loadInfographicsResource === "function") {
      const result = await loader.loadInfographicsResource(medium, subjectId, chapterId);
      if (result && result.found) {
        return {
          item: result.items[0] || null,
          parentData: null,
          reason: "found"
        };
      }
    }

    if (loader && typeof loader.loadNotesResource === "function") {
      const result = await loader.loadNotesResource(medium, subjectId, chapterId, "infographic");
      const data = result && result.data;
      const items = data && Array.isArray(data.items) ? data.items : [];
      const firstItem = items[0] || null;
      const usableItem = items.find(isUsableInfographic) || null;

      if (usableItem) {
        return {
          item: usableItem,
          parentData: data,
          reason: "found"
        };
      }

      if (firstItem) {
        return {
          item: firstItem,
          parentData: data,
          reason: "missing-preview"
        };
      }
    }

    return {
      item: null,
      reason: "missing"
    };
  }

  async function loadSlidesItem(config) {
    const loader = window.SEE2083ContentLoader;

    if (loader && typeof loader.loadNotesResource === "function") {
      const result = await loader.loadNotesResource(medium, subjectId, chapterId, "slides");
      const data = result && result.kind === "json" ? result.data : null;
      const usableItem = getFirstResourceItem(data, config);

      if (usableItem) {
        return {
          item: usableItem,
          parentData: data,
          reason: "found"
        };
      }

      if (config.key === "infographic" && getFirstCandidateItem(data)) {
        return {
          item: getFirstCandidateItem(data),
          parentData: data,
          reason: "missing-preview"
        };
      }
    }

    return loadCandidateJsonFiles(config, ["slides-resources.json", "drive-slides.json"]);
  }

  async function loadNoteItem(config) {
    const loader = window.SEE2083ContentLoader;
    const indexedDownloadsResult = await loadIndexedJsonResource("downloads", config);

    if (indexedDownloadsResult.item) {
      return indexedDownloadsResult;
    }

    if (loader && typeof loader.loadDownloadsResource === "function") {
      const result = await loader.loadDownloadsResource(medium, subjectId, chapterId);
      const usableItem = (result && Array.isArray(result.items) ? result.items : []).find(function (item) {
        return isUsableDriveItem(item, config, { resourceType: "notes", status: "published" });
      }) || null;

      if (usableItem) {
        return {
          item: usableItem,
          parentData: null,
          reason: "found"
        };
      }
    }

    return loadCandidateJsonFiles(config, [
      "notes-resources.json",
      "note-resources.json",
      "pdf-notes.json",
      "drive-notes.json"
    ]);
  }

  async function loadResourceItem(config) {
    if (config.key === "infographic") return loadInfographicItem();
    if (config.key === "slides") return loadSlidesItem(config);
    if (config.group === "note") return loadNoteItem(config);

    return {
      item: null,
      reason: "missing"
    };
  }

  function hasRouteContext() {
    return Boolean(subjectId && chapterId && medium);
  }

  function showEmpty(subject, chapter, title, config) {
    const currentConfig = config || getDisplayConfig();
    document.title = currentConfig.label + " - SEE 2083";
    const emptyTitle = title || currentConfig.emptyTitle;

    activePreviewUrl = "";

    if (els.kicker) els.kicker.textContent = currentConfig.label;
    if (els.title) els.title.textContent = emptyTitle;
    if (els.description) els.description.textContent = labels.emptyText;
    if (els.emptyTitle) els.emptyTitle.textContent = emptyTitle;
    if (els.emptyText) els.emptyText.textContent = labels.emptyText;

    if (els.viewerCard) els.viewerCard.hidden = true;
    if (els.emptyState) els.emptyState.hidden = false;
    if (els.nextActions) els.nextActions.hidden = !hasRouteContext();
    if (els.viewNote) els.viewNote.hidden = true;
    if (els.loading) els.loading.hidden = true;
    if (els.frame) {
      if (typeof els.frame.removeAttribute === "function") {
        els.frame.removeAttribute("src");
      } else {
        els.frame.src = "";
      }
    }

    renderBreadcrumbs(subject, chapter, null, currentConfig);
  }

  function setLoading(isLoading) {
    if (els.loading) {
      els.loading.hidden = !isLoading;
      els.loading.textContent = labels.loading;
    }
  }

  function renderViewer(subject, chapter, item, config) {
    const currentConfig = config || getDisplayConfig();
    const chapterTitle = getChapterTitle(chapter, item);
    const title = getResourceTitle(chapter, item, currentConfig);
    const description = item.description || item.caption || "Visual summary for " + chapterTitle + ".";
    const previewUrl = getPreviewUrl(item);
    const viewUrl = item.viewUrl || "";

    document.title = title + " - SEE 2083";

    if (els.kicker) els.kicker.textContent = currentConfig.label;
    if (els.title) els.title.textContent = title;
    if (els.description) els.description.textContent = description;
    if (els.source) els.source.textContent = labels.drivePreview;
    if (els.viewNote) els.viewNote.textContent = labels.viewOnlyNote;

    if (els.frame) {
      activePreviewUrl = previewUrl;
      setLoading(true);
      els.frame.src = previewUrl;
      els.frame.title = title;
    }

    if (els.driveLink) {
      els.driveLink.href = viewUrl || "#";
      els.driveLink.textContent = labels.driveFallback;
      els.driveLink.hidden = !viewUrl;
    }

    if (els.viewerCard) els.viewerCard.hidden = false;
    if (els.emptyState) els.emptyState.hidden = true;
    if (els.nextActions) els.nextActions.hidden = false;
    if (els.viewNote) els.viewNote.hidden = false;

    renderBreadcrumbs(subject, chapter, item, currentConfig);
  }

  function setupViewOnlyGuards() {
    if (!els.frameWrap || typeof els.frameWrap.addEventListener !== "function") return;

    els.frameWrap.addEventListener("contextmenu", function (event) {
      event.preventDefault();
    });
  }

  function setupIframeLoading() {
    if (!els.frame || typeof els.frame.addEventListener !== "function") return;

    els.frame.addEventListener("load", function () {
      const currentFrameUrl = String(els.frame.getAttribute("src") || "").trim();

      if (!activePreviewUrl || currentFrameUrl !== activePreviewUrl) {
        return;
      }

      setLoading(false);
    });
  }

  async function init() {
    const subject = getSubjectObject();
    const chapter = getChapterObject();

    setCommonLinks();
    setupViewOnlyGuards();
    setupIframeLoading();

    try {
      const config = getResourceConfig(type);

      if (!config) {
        showEmpty(subject, chapter, labels.unsupportedTitle, fallbackConfig);
        return;
      }

      const result = await loadResourceItem(config);
      const item = result && result.item;

      if (!item) {
        showEmpty(subject, chapter, config.emptyTitle, config);
        return;
      }

      if (!isUsableDriveItem(item, config, result.parentData || null)) {
        showEmpty(subject, chapter, config.previewMissingTitle, config);
        return;
      }

      renderViewer(subject, chapter, item, config);
    } catch (error) {
      showEmpty(subject, chapter, getDisplayConfig().emptyTitle, getDisplayConfig());
    }
  }

  init();
})();
