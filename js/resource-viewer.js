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
    infographic: "Infographic",
    backToChapter: "Back to Chapter",
    chooseChapter: "Choose Chapter",
    mcqPractice: "MCQ Practice",
    emptyTitle: "Infographic is being added for this chapter.",
    emptyText: "Please choose another chapter or return to the chapter page.",
    drivePreview: "Google Drive preview",
    driveFallback: "Open in Drive if preview does not load"
  };

  const els = {
    breadcrumb: document.getElementById("breadcrumb"),
    kicker: document.getElementById("resource-kicker"),
    title: document.getElementById("resource-title"),
    description: document.getElementById("resource-description"),
    frame: document.getElementById("resource-frame"),
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
    nextActions: document.getElementById("next-actions")
  };

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

  function getChapterTitle(chapter, item) {
    if (chapter && chapter.title) return chapter.title;
    if (item && item.title) return String(item.title).replace(/\s+Infographic$/i, "");
    return chapterId || "Chapter";
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

  function renderBreadcrumbs(subject, chapter, item) {
    if (!els.breadcrumb || typeof renderBreadcrumb !== "function") return;

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
      { label: labels.infographic }
    ]);
  }

  function isUsableInfographic(item) {
    if (!item || typeof item !== "object") return false;

    const status = String(item.status || item.reviewStatus || "published").toLowerCase();
    const previewUrl = String(item.previewUrl || item.embedUrl || "").trim();

    return status === "published" && Boolean(item.title) && Boolean(previewUrl);
  }

  async function loadInfographicItem() {
    if (type !== "infographic") return null;

    const loader = window.SEE2083ContentLoader;

    if (loader && typeof loader.loadInfographicsResource === "function") {
      const result = await loader.loadInfographicsResource(medium, subjectId, chapterId);
      return result && result.found ? result.items[0] : null;
    }

    if (loader && typeof loader.loadNotesResource === "function") {
      const result = await loader.loadNotesResource(medium, subjectId, chapterId, "infographic");
      const data = result && result.data;
      const items = data && Array.isArray(data.items) ? data.items : [];
      return items.find(isUsableInfographic) || null;
    }

    return null;
  }

  function showEmpty(subject, chapter) {
    document.title = labels.infographic + " - SEE 2083";

    if (els.kicker) els.kicker.textContent = labels.infographic;
    if (els.title) els.title.textContent = labels.emptyTitle;
    if (els.description) els.description.textContent = labels.emptyText;
    if (els.emptyTitle) els.emptyTitle.textContent = labels.emptyTitle;
    if (els.emptyText) els.emptyText.textContent = labels.emptyText;

    if (els.viewerCard) els.viewerCard.hidden = true;
    if (els.emptyState) els.emptyState.hidden = false;
    if (els.nextActions) els.nextActions.hidden = true;

    renderBreadcrumbs(subject, chapter, null);
  }

  function renderViewer(subject, chapter, item) {
    const chapterTitle = getChapterTitle(chapter, item);
    const title = item.title || chapterTitle + " Infographic";
    const description = item.description || item.caption || "Visual summary for " + chapterTitle + ".";
    const previewUrl = item.previewUrl || item.embedUrl;
    const viewUrl = item.viewUrl || previewUrl;

    document.title = title + " - SEE 2083";

    if (els.kicker) els.kicker.textContent = labels.infographic;
    if (els.title) els.title.textContent = title;
    if (els.description) els.description.textContent = description;
    if (els.source) els.source.textContent = labels.drivePreview;

    if (els.frame) {
      els.frame.src = previewUrl;
      els.frame.title = title;
    }

    if (els.driveLink) {
      els.driveLink.href = viewUrl;
      els.driveLink.textContent = labels.driveFallback;
    }

    if (els.viewerCard) els.viewerCard.hidden = false;
    if (els.emptyState) els.emptyState.hidden = true;
    if (els.nextActions) els.nextActions.hidden = false;

    renderBreadcrumbs(subject, chapter, item);
  }

  async function init() {
    const subject = getSubjectObject();
    const chapter = getChapterObject();

    setCommonLinks();

    try {
      const item = await loadInfographicItem();

      if (!item || !isUsableInfographic(item)) {
        showEmpty(subject, chapter);
        return;
      }

      renderViewer(subject, chapter, item);
    } catch (error) {
      showEmpty(subject, chapter);
    }
  }

  init();
})();
