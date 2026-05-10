/* ===================================================
   see2083 - Quiz Page Logic
   Sets up MCQ practice filters and page labels
   =================================================== */

(function () {
  const medium = getParam("medium") || getCurrentMedium() || "english";
  const requestedSubject = getParam("subject") || "all";
  const requestedChapter = getParam("chapter") || "";

  if (typeof setMedium === "function") {
    setMedium(medium);
  }

  if (typeof pageInit === "function") {
    pageInit("subjects");
  }

  const lang = getCurrentLanguage();
  const isNp = lang === "np";

  let activeSubject = requestedSubject || "all";

  const labels = {
    home: isNp ? "गृहपृष्ठ" : "Home",
    practice: isNp ? "अभ्यास" : "Practice",
    title: isNp ? "MCQ अभ्यास" : "MCQ Practice",
    sub: isNp
      ? "प्रत्येक प्रश्नको उत्तर दिनुहोस्, तत्काल प्रतिक्रिया पाउनुहोस् र व्याख्यासहित सिक्नुहोस्।"
      : "Answer each question, get instant feedback, and learn with explanations.",
    chooseSubject: isNp ? "विषय छान्नुहोस्" : "Choose subject",
    filterSub: isNp ? "विषय अनुसार प्रश्नहरू फिल्टर गर्नुहोस्।" : "Filter questions by subject.",
    browseSubjects: isNp ? "विषयहरू हेर्नुहोस्" : "Browse Subjects",
    practiceInfo: isNp ? "अभ्यास जानकारी" : "Practice info",
    questions: isNp ? "प्रश्नहरू" : "Questions",
    selected: isNp ? "छानिएको" : "Selected",
    mode: isNp ? "मोड" : "Mode",
    instantFeedback: isNp ? "तत्काल प्रतिक्रिया" : "Instant feedback",
    all: isNp ? "सबै" : "All",
    noQuestions: isNp ? "यस खण्डमा सामग्री थपिएको छैन।" : "No content added in this section yet.",
    noQuestionsSub: isNp ? "अर्को विषय वा अध्यायबाट अभ्यास गर्नुहोस्।" : "Choose another subject or chapter to practice.",
    chapterMcqsMissing: isNp ? "यस अध्यायका MCQ अझै थपिएको छैन।" : "MCQs for this chapter are not added yet.",
    backToChapter: isNp ? "अध्यायमा फर्कनुहोस्" : "Back to Chapter",
    chooseChapter: isNp ? "अध्याय छान्नुहोस्" : "Choose Chapter",
    motivation: isNp
      ? "एक घण्टाको राम्रो अध्ययनले तपाईंलाई धेरै अगाडि लैजान सक्छ।"
      : "One focused hour of learning can take you farther than hours of scrolling."
  };

  const titleEl = document.getElementById("quiz-page-title");
  const subEl = document.getElementById("quiz-page-sub");
  const kickerEl = document.getElementById("practice-kicker");
  const selectorLabelEl = document.getElementById("selector-label");
  const selectorSubtitleEl = document.getElementById("selector-subtitle");
  const backLink = document.getElementById("back-link");
  const filterContainer = document.getElementById("subject-filter-btns");
  const quizContainer = document.getElementById("quiz-container");
  const infoTitleEl = document.getElementById("practice-info-title");
  const infoListEl = document.getElementById("practice-info-list");

  function getMediumLabel() {
    if (!hasS2083Data()) return medium;

    const mediumObj = safeArray(S2083.mediums).find(function (item) {
      return item.id === medium;
    });

    if (!mediumObj) return medium;

    return isNp ? (mediumObj.labelNp || mediumObj.label) : mediumObj.label;
  }

  function getSubjectName(subjectId) {
    if (subjectId === "all") return labels.all;

    const subject = getSubjectById(subjectId);

    if (!subject) return subjectId;

    return isNp ? (subject.nameNp || subject.name) : subject.name;
  }

  function getAvailableSubjects() {
    if (!hasS2083Data()) return ["all"];

    const ids = safeArray(S2083.sampleMCQs)
      .map(function (question) {
        return question.subject;
      })
      .filter(Boolean);

    const uniqueIds = Array.from(new Set(ids));
    const subjects = ["all"].concat(uniqueIds);

    if (requestedSubject && requestedSubject !== "all" && !subjects.includes(requestedSubject)) {
      subjects.push(requestedSubject);
    }

    return subjects;
  }

  function getExactChapterFallbackQuestions(subjectId, chapterId) {
    if (!hasS2083Data() || !Array.isArray(S2083.sampleMCQs)) {
      return [];
    }

    return S2083.sampleMCQs.filter(function (question) {
      return question.subject === subjectId && question.chapter === chapterId;
    });
  }

  function getSubjectFallbackQuestions(subjectId) {
    if (!hasS2083Data() || !Array.isArray(S2083.sampleMCQs)) {
      return [];
    }

    return S2083.sampleMCQs.filter(function (question) {
      return question.subject === subjectId;
    });
  }

  function getAllFallbackQuestions() {
    if (!hasS2083Data() || !Array.isArray(S2083.sampleMCQs)) {
      return [];
    }

    return S2083.sampleMCQs;
  }

  function isExactChapterPractice() {
    return Boolean(
      requestedChapter &&
      requestedSubject &&
      requestedSubject !== "all" &&
      activeSubject === requestedSubject
    );
  }

  async function getExternalQuestionsIfAvailable() {
    if (!isExactChapterPractice()) return null;
    if (!window.SEE2083ContentLoader) return null;
    if (typeof window.SEE2083ContentLoader.loadQuizResource !== "function") return null;
    if (typeof window.SEE2083ContentLoader.normalizeMCQData !== "function") return null;

    try {
      const result = await window.SEE2083ContentLoader.loadQuizResource(medium, activeSubject, requestedChapter);

      if (!result || !result.found) return null;

      const questions = window.SEE2083ContentLoader.normalizeMCQData(
        result.data,
        activeSubject,
        requestedChapter
      );

      return questions.length ? questions : null;
    } catch (error) {
      console.warn("External MCQ load failed; using exact chapter fallback.", error);
      return null;
    }
  }

  function updateInfo(questions) {
    if (!infoListEl) return;

    infoListEl.innerHTML =
      '<div>' +
        '<span>' + escapeHTML(labels.questions) + '</span>' +
        '<strong>' + escapeHTML(questions.length) + '</strong>' +
      '</div>' +
      '<div>' +
        '<span>' + escapeHTML(labels.selected) + '</span>' +
        '<strong>' + escapeHTML(getSubjectName(activeSubject)) + '</strong>' +
      '</div>' +
      '<div>' +
        '<span>' + escapeHTML(labels.mode) + '</span>' +
        '<strong>' + escapeHTML(labels.instantFeedback) + '</strong>' +
      '</div>';
  }

  function getBackHref() {
    if (requestedSubject && requestedSubject !== "all" && requestedChapter) {
      return "chapter.html?subject=" + encodeURIComponent(requestedSubject) +
        "&chapter=" + encodeURIComponent(requestedChapter) +
        "&medium=" + encodeURIComponent(medium);
    }

    if (requestedSubject && requestedSubject !== "all") {
      return "chapters.html?subject=" + encodeURIComponent(requestedSubject) +
        "&medium=" + encodeURIComponent(medium);
    }

    return "subjects.html?medium=" + encodeURIComponent(medium);
  }

  function getBackLabel() {
    if (requestedSubject && requestedSubject !== "all" && requestedChapter) {
      return labels.backToChapter;
    }

    if (requestedSubject && requestedSubject !== "all") {
      return labels.chooseChapter;
    }

    return labels.browseSubjects;
  }

  function getChooseChapterHref() {
    if (!requestedSubject || requestedSubject === "all") return "";

    return "chapters.html?subject=" + encodeURIComponent(requestedSubject) +
      "&medium=" + encodeURIComponent(medium);
  }

  function renderSecondaryChapterLink() {
    if (!backLink || !backLink.parentElement) return;

    const oldLink = document.getElementById("choose-chapter-link");
    if (oldLink && oldLink.parentElement) {
      oldLink.parentElement.removeChild(oldLink);
    }

    if (!(requestedSubject && requestedSubject !== "all" && requestedChapter)) return;

    const chooseLink = document.createElement("a");
    chooseLink.id = "choose-chapter-link";
    chooseLink.className = "btn btn-outline btn-sm";
    chooseLink.href = getChooseChapterHref();
    chooseLink.textContent = labels.chooseChapter;
    backLink.parentElement.appendChild(chooseLink);
  }

  function renderMotivation() {
    if (!quizContainer || document.getElementById("quiz-motivation")) return;

    const main = quizContainer.parentElement;
    if (!main) return;

    const notice = document.createElement("div");
    notice.id = "quiz-motivation";
    notice.className = "content-notice";
    notice.textContent = labels.motivation;
    main.insertBefore(notice, quizContainer);
  }

  function renderNoQuestions(customMessage) {
    if (!quizContainer) return;

    const message = customMessage || labels.noQuestions;

    quizContainer.innerHTML =
      '<div class="empty-state">' +
        '<div class="empty-icon">✓</div>' +
        '<h3>' + escapeHTML(message) + '</h3>' +
        '<p>' + escapeHTML(labels.noQuestionsSub) + '</p>' +
        '<a href="subjects.html?medium=' + encodeURIComponent(medium) + '" class="btn btn-primary">' +
          escapeHTML(labels.browseSubjects) +
        '</a>' +
      '</div>';
  }

  async function loadQuiz() {
    let questions = [];

    if (isExactChapterPractice()) {
      const externalQuestions = await getExternalQuestionsIfAvailable();
      questions = externalQuestions || getExactChapterFallbackQuestions(activeSubject, requestedChapter);

      updateInfo(questions);

      if (!questions.length) {
        renderNoQuestions(labels.chapterMcqsMissing);
        return;
      }

      Quiz.init(questions, lang);
      return;
    }

    if (activeSubject && activeSubject !== "all") {
      questions = getSubjectFallbackQuestions(activeSubject);
    } else {
      questions = getAllFallbackQuestions();
    }

    updateInfo(questions);

    if (!questions.length) {
      renderNoQuestions();
      return;
    }

    Quiz.init(questions, lang);
  }

  function renderFilters() {
    if (!filterContainer) return;

    const subjects = getAvailableSubjects();

    if (!subjects.includes(activeSubject)) {
      activeSubject = requestedSubject && requestedSubject !== "all" ? requestedSubject : "all";
    }

    filterContainer.innerHTML = "";

    subjects.forEach(function (subjectId) {
      const button = document.createElement("button");

      button.className = "filter-btn" + (subjectId === activeSubject ? " active" : "");
      button.type = "button";
      button.textContent = getSubjectName(subjectId);

      button.addEventListener("click", function () {
        activeSubject = subjectId;

        document.querySelectorAll("#subject-filter-btns .filter-btn").forEach(function (btn) {
          btn.classList.remove("active");
        });

        button.classList.add("active");
        loadQuiz();
      });

      filterContainer.appendChild(button);
    });
  }

  function renderBreadcrumbs() {
    renderBreadcrumb(document.getElementById("breadcrumb"), [
      { label: labels.home, href: "index.html" },
      { label: getMediumLabel(), href: "subjects.html?medium=" + encodeURIComponent(medium) },
      { label: labels.title }
    ]);
  }

  function initPage() {
    document.title = labels.title + " - see2083";

    if (titleEl) titleEl.textContent = labels.title;
    if (subEl) subEl.textContent = labels.sub;
    if (kickerEl) kickerEl.textContent = labels.practice;
    if (selectorLabelEl) selectorLabelEl.textContent = labels.chooseSubject;
    if (selectorSubtitleEl) selectorSubtitleEl.textContent = labels.filterSub;
    if (infoTitleEl) infoTitleEl.textContent = labels.practiceInfo;

    if (backLink) {
      backLink.href = getBackHref();
      backLink.textContent = getBackLabel();
      renderSecondaryChapterLink();
    }

    renderBreadcrumbs();
    renderFilters();
    renderMotivation();
    loadQuiz();
  }

  initPage();
})();
