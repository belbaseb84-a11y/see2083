/* ===================================================
   see2083 — Mock Test Page Logic
   Sets up timed mock test page
   =================================================== */

(function () {
  const medium = getParam("medium") || getCurrentMedium() || "english";
  const requestedSubject = getParam("subject") || "";
  const requestedChapter = getParam("chapter") || "";

  if (typeof setMedium === "function") {
    setMedium(medium);
  }

  if (typeof pageInit === "function") {
    pageInit("subjects");
  }

  const lang = getCurrentLanguage();
  const isNp = false;
  const TIME_LIMIT = 15 * 60;
  const MOCK_QUESTION_LIMIT = 25;
  let questions = [];
  let timeLimitSeconds = TIME_LIMIT;

  const labels = {
    home: isNp ? "गृहपृष्ठ" : "Home",
    mockTest: isNp ? "मोक टेस्ट" : "Mock Test",
    timedPractice: isNp ? "समयबद्ध अभ्यास" : "Timed practice",
    title: isNp ? "अध्याय मोक टेस्ट" : "Chapter Mock Test",
    subtitle: isNp
      ? "समय राखेर अभ्यास गर्नुहोस् र बुझाएपछि परिणाम हेर्नुहोस्।"
      : "Practice with a timed test and check your result after submit.",
    browseSubjects: isNp ? "विषयहरू हेर्नुहोस्" : "Browse subjects",
    instructions: isNp ? "निर्देशनहरू" : "Instructions",
    instructionsSub: isNp ? "टेस्ट सुरु गर्नु अघि यो पढ्नुहोस्।" : "Read this before starting the test.",
    startTest: isNp ? "टेस्ट सुरु गर्नुहोस्" : "Start Test",
    summaryTitle: isNp ? "टेस्ट सारांश" : "Test summary",
    questions: isNp ? "प्रश्नहरू" : "Questions",
    timeLimit: isNp ? "समय सीमा" : "Time limit",
    mode: isNp ? "मोड" : "Mode",
    mock: isNp ? "मोक" : "Mock",
    minutes: isNp ? "मिनेट" : "minutes",
    summaryNote: isNp
      ? "सही र गलत उत्तर टेस्ट बुझाएपछि मात्र देखाइनेछ।"
      : "Correct and wrong answers are shown only after you submit.",
    testRunning: isNp ? "टेस्ट चलिरहेको छ" : "Test running",
    liveTitle: isNp ? "मोक टेस्ट" : "Mock Test",
    liveSub: isNp
      ? "समय सकिनु अघि सबै प्रश्नको उत्तर दिनुहोस्।"
      : "Answer all questions before the timer ends.",
    noQuestions: isNp
      ? "यस टेस्टका प्रश्नहरू उपलब्ध छैनन्।"
      : "No questions are available for this test.",
    noQuestionsSub: isNp
      ? "यस खण्डमा सामग्री थपिएको छैन।"
      : "No content added in this section yet.",
    backSubjects: isNp ? "विषयहरूमा फर्कनुहोस्" : "Back to subjects"
  };

  Object.assign(labels, {
    home: "Home",
    mockTest: "Mock Test",
    timedPractice: "Exam Practice",
    title: "Mock Test",
    subtitle: "Practice in exam-style mode with a timer and final review.",
    browseSubjects: "Browse Subjects",
    instructions: "Before you start",
    instructionsSub: "Answer all questions within the time limit, then review your result.",
    startTest: "Start Mock Test",
    summaryTitle: "Exam-style test setup",
    questions: "Total Questions",
    timeLimit: "Time Limit",
    mode: "Mode",
    mock: "Mock Test",
    feedback: "Feedback",
    afterSubmit: "After Submit",
    minutes: "minutes",
    summaryNote: "Feedback is shown after submit, with final score and answer review.",
    testRunning: "Mock Test in Progress",
    liveTitle: "Mock Test",
    liveSub: "Answer all questions within the time limit, then submit for final review.",
    noQuestions: "Mock test for this chapter is being added.",
    noQuestionsSub: "Please check MCQ Practice or choose another chapter for now.",
    backSubjects: "Back to Subjects"
  });

  const startScreen = document.getElementById("start-screen");
  const testScreen = document.getElementById("test-screen");
  const mockKicker = document.getElementById("mock-kicker");
  const mockTitle = document.getElementById("mock-title");
  const mockSubtitle = document.getElementById("mock-subtitle");
  const mockBackLink = document.getElementById("mock-back-link");
  const instructionsTitle = document.getElementById("instructions-title");
  const instructionsSubtitle = document.getElementById("instructions-subtitle");
  const instructionsList = document.getElementById("instructions-list");
  const startBtn = document.getElementById("start-btn");
  const startBtnLabel = document.getElementById("start-btn-label");
  const summaryTitle = document.getElementById("summary-title");
  const qCountLabel = document.getElementById("q-count-label");
  const qCount = document.getElementById("q-count");
  const timeLabel = document.getElementById("time-label");
  const timeLimit = document.getElementById("time-limit");
  const modeLabel = document.getElementById("mode-label");
  const modeValue = document.getElementById("mode-value");
  const feedbackLabel = document.getElementById("feedback-label");
  const feedbackValue = document.getElementById("feedback-value");
  const summaryNote = document.getElementById("summary-note");
  const liveKicker = document.getElementById("live-kicker");
  const liveTitle = document.getElementById("live-title");
  const liveSubtitle = document.getElementById("live-subtitle");
  const mockQuestionArea = document.getElementById("mock-question-area");

  function getMediumLabel() {
    if (!hasS2083Data()) return medium;

    const mediumObj = safeArray(S2083.mediums).find(function (item) {
      return item.id === medium;
    });

    if (!mediumObj) return medium;

    return isNp ? (mediumObj.labelNp || mediumObj.label) : mediumObj.label;
  }

  function getSubjectName() {
    if (!requestedSubject) return "";

    const subject = getSubjectById(requestedSubject);
    if (!subject) return "";

    return isNp ? (subject.nameNp || subject.name) : subject.name;
  }

  function getChapterTitle() {
    if (!requestedSubject || !requestedChapter || !hasS2083Data()) return "";

    let chapter = null;

    if (typeof S2083.getChapter === "function") {
      chapter = S2083.getChapter(requestedSubject, requestedChapter);
    } else if (S2083.chapters && Array.isArray(S2083.chapters[requestedSubject])) {
      chapter = S2083.chapters[requestedSubject].find(function (item) {
        return item.id === requestedChapter;
      }) || null;
    }

    if (!chapter) return "";

    return isNp ? (chapter.titleNp || chapter.title) : chapter.title;
  }

  function getFallbackMockQuestions() {
    if (requestedSubject && requestedChapter) {
      return [];
    }

    if (!hasS2083Data() || !Array.isArray(S2083.mockTestQuestions)) {
      return [];
    }

    let questions = S2083.mockTestQuestions;

    if (requestedSubject) {
      const subjectQuestions = questions.filter(function (question) {
        return question.subject === requestedSubject;
      });

      if (subjectQuestions.length) {
        questions = subjectQuestions;
      }
    }

    if (requestedChapter) {
      const chapterQuestions = questions.filter(function (question) {
        return question.chapter === requestedChapter;
      });

      if (chapterQuestions.length) {
        questions = chapterQuestions;
      }
    }

    return questions.slice(0, 10);
  }

  function shuffleQuestions(sourceQuestions) {
    const copy = safeArray(sourceQuestions).slice();

    for (let index = copy.length - 1; index > 0; index--) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      const temp = copy[index];
      copy[index] = copy[swapIndex];
      copy[swapIndex] = temp;
    }

    return copy;
  }

  function selectMockQuestionSet(sourceQuestions) {
    const shuffled = shuffleQuestions(sourceQuestions);
    const limit = Math.min(MOCK_QUESTION_LIMIT, shuffled.length);
    return shuffled.slice(0, limit);
  }

  function isPlaceholderMockQuestion(question) {
    if (!question) return true;

    const questionText = String(question.question || "").toLowerCase();
    const explanation = String(question.explanation || "").toLowerCase();
    const options = safeArray(question.options).map(function (option) {
      return String(option || "").trim().toLowerCase();
    }).join("|");

    return (
      questionText.indexOf("demo mock question") >= 0 ||
      explanation.indexOf("demo explanation only") >= 0 ||
      options === "option a|option b|option c|option d"
    );
  }

  function isPublishedMockData(data) {
    if (!data || !data.status) return false;
    return String(data.status).toLowerCase() === "published";
  }

  async function getExternalMockQuestionsIfAvailable() {
    if (!requestedSubject || !requestedChapter) return null;
    if (!window.SEE2083ContentLoader) return null;
    if (typeof SEE2083ContentLoader.loadMockTestResource !== "function") return null;
    if (typeof SEE2083ContentLoader.normalizeMockTestData !== "function") return null;

    try {
      const result = await SEE2083ContentLoader.loadMockTestResource(
        medium,
        requestedSubject,
        requestedChapter
      );

      if (!result || !result.found) return null;
      if (!isPublishedMockData(result.data)) return null;

      const normalizedQuestions = SEE2083ContentLoader.normalizeMockTestData(
        result.data,
        requestedSubject,
        requestedChapter
      );

      const realQuestions = normalizedQuestions.filter(function (question) {
        return !isPlaceholderMockQuestion(question);
      });

      if (!realQuestions.length) return null;

      const externalTimeLimit = Number(result.data && result.data.timeLimitSeconds);

      return {
        questions: realQuestions,
        timeLimitSeconds: externalTimeLimit > 0 ? externalTimeLimit : TIME_LIMIT
      };
    } catch (error) {
      console.warn("External mock test load failed; using fallback questions.", error);
      return null;
    }
  }

  async function getChapterMCQPoolIfAvailable() {
    if (!requestedSubject || !requestedChapter) return null;
    if (!window.SEE2083ContentLoader) return null;
    if (typeof SEE2083ContentLoader.loadQuizResource !== "function") return null;
    if (typeof SEE2083ContentLoader.normalizeMCQData !== "function") return null;

    try {
      const result = await SEE2083ContentLoader.loadQuizResource(
        medium,
        requestedSubject,
        requestedChapter
      );

      if (!result || !result.found) return null;

      const normalizedQuestions = SEE2083ContentLoader.normalizeMCQData(
        result.data,
        requestedSubject,
        requestedChapter
      );

      if (!normalizedQuestions.length) return null;

      return {
        questions: selectMockQuestionSet(normalizedQuestions),
        timeLimitSeconds: TIME_LIMIT
      };
    } catch (error) {
      console.warn("Chapter MCQ mock fallback load failed.", error);
      return null;
    }
  }

  async function loadMockSetup() {
    const external = await getExternalMockQuestionsIfAvailable();

    if (external && external.questions.length) {
      questions = external.questions;
      timeLimitSeconds = external.timeLimitSeconds || TIME_LIMIT;
      return;
    }

    if (requestedSubject && requestedChapter) {
      const mcqFallback = await getChapterMCQPoolIfAvailable();

      if (mcqFallback && mcqFallback.questions.length) {
        questions = mcqFallback.questions;
        timeLimitSeconds = mcqFallback.timeLimitSeconds || TIME_LIMIT;
        return;
      }

      questions = [];
      timeLimitSeconds = TIME_LIMIT;
      return;
    }

    questions = getFallbackMockQuestions();
    timeLimitSeconds = TIME_LIMIT;
  }

  function renderBreadcrumbs() {
    renderBreadcrumb(document.getElementById("breadcrumb"), [
      { label: labels.home, href: "index.html" },
      { label: getMediumLabel(), href: "subjects.html?medium=" + encodeURIComponent(medium) },
      { label: labels.mockTest }
    ]);
  }

  function getBackHref() {
    if (requestedSubject && requestedChapter) {
      return "chapter.html?subject=" + encodeURIComponent(requestedSubject) +
        "&chapter=" + encodeURIComponent(requestedChapter) +
        "&medium=" + encodeURIComponent(medium);
    }

    if (requestedSubject) {
      return "chapters.html?subject=" + encodeURIComponent(requestedSubject) +
        "&medium=" + encodeURIComponent(medium);
    }

    return "subjects.html?medium=" + encodeURIComponent(medium);
  }

  function getChooseChapterHref() {
    if (requestedSubject) {
      return "chapters.html?subject=" + encodeURIComponent(requestedSubject) +
        "&medium=" + encodeURIComponent(medium);
    }

    return "subjects.html?medium=" + encodeURIComponent(medium);
  }

  function getBackLabel() {
    if (requestedSubject && requestedChapter) return "Back to Chapter";
    if (requestedSubject) return "Choose Chapter";
    return labels.browseSubjects;

    if (requestedSubject && requestedChapter) {
      return isNp ? "अध्यायमा फर्कनुहोस्" : "Back to Chapter";
    }

    if (requestedSubject) {
      return isNp ? "अध्याय छान्नुहोस्" : "Choose Chapter";
    }

    return labels.browseSubjects;
  }

  function renderInstructions() {
    if (!instructionsList) return;

    const instructions = isNp
      ? [
          "प्रत्येक प्रश्नको लागि एउटा मात्र उत्तर छान्नुहोस्।",
          "टेस्ट सुरु गरेपछि टाइमर चल्न थाल्छ।",
          "सही/गलत उत्तर टेस्ट बुझाएपछि मात्र देखाइनेछ।",
          "जुनसुकै प्रश्नमा जान सक्नुहुन्छ।",
          "समय सकिएपछि टेस्ट स्वतः बुझाइनेछ।"
        ]
      : [
          "Choose only one answer per question.",
          "The timer starts when you begin the test.",
          "Correct and wrong answers are shown only after you submit.",
          "You can navigate to any question at any time.",
          "The test auto-submits when time runs out."
        ];

    const visibleInstructions = [
      "Answer all questions within the time limit.",
      "You can move between questions before submitting.",
      "Feedback and explanations appear only after final submit.",
      "The test auto-submits when time runs out."
    ];

    instructionsList.innerHTML = "";

    visibleInstructions.forEach(function (item) {
      const li = document.createElement("li");
      li.textContent = item;
      instructionsList.appendChild(li);
    });
  }

  function renderNoQuestions() {
    if (!mockQuestionArea) return;

    if (startBtn) {
      startBtn.disabled = true;
      startBtn.classList.add("disabled");
    }

    mockQuestionArea.innerHTML =
      '<div class="empty-state">' +
        '<div class="empty-icon">🎯</div>' +
        '<h3>' + escapeHTML(labels.noQuestions) + '</h3>' +
        '<p>' + escapeHTML(labels.noQuestionsSub) + '</p>' +
        '<a href="subjects.html?medium=' + encodeURIComponent(medium) + '" class="btn btn-primary">' +
          escapeHTML(labels.backSubjects) +
        '</a>' +
      '</div>';

    mockQuestionArea.innerHTML =
      '<div class="empty-state">' +
        '<div class="empty-icon">!</div>' +
        '<h3>' + escapeHTML(labels.noQuestions) + '</h3>' +
        '<p>' + escapeHTML(labels.noQuestionsSub) + '</p>' +
        '<div class="empty-actions">' +
          '<a href="' + escapeHTML(getBackHref()) + '" class="btn btn-primary">' +
            escapeHTML(requestedSubject && requestedChapter ? "Back to Chapter" : labels.backSubjects) +
          '</a>' +
          '<a href="' + escapeHTML(getChooseChapterHref()) + '" class="btn btn-outline">' +
            escapeHTML(requestedSubject ? "Choose Chapter" : labels.browseSubjects) +
          '</a>' +
        '</div>' +
      '</div>';
  }

  function getTimeLimitLabel(seconds) {
    const minutes = Math.max(1, Math.round(Number(seconds || TIME_LIMIT) / 60));
    return minutes + " " + labels.minutes;
  }

  function updateSummary() {
    if (qCount) qCount.textContent = questions.length;
    if (timeLimit) timeLimit.textContent = getTimeLimitLabel(timeLimitSeconds);
  }

  function startTest() {
    if (!questions.length) {
      renderNoQuestions();
      return;
    }

    if (startScreen) startScreen.style.display = "none";
    if (testScreen) testScreen.style.display = "";

    MockTest.init(questions, timeLimitSeconds, lang);
  }

  function initLabels() {
    const subjectName = getSubjectName();
    const chapterTitle = getChapterTitle();

    let subtitle = labels.subtitle;

    if (chapterTitle && subjectName) {
      subtitle = chapterTitle + " · " + subjectName;
    } else if (subjectName) {
      subtitle = subjectName + " · " + labels.subtitle;
    }

    const contextText = chapterTitle && subjectName
      ? chapterTitle + " - " + subjectName
      : subjectName;
    subtitle = labels.subtitle + (contextText ? " " + contextText + "." : "");

    document.title = labels.mockTest + " — see2083";
    document.title = labels.mockTest + " - see2083";

    if (mockKicker) mockKicker.textContent = labels.timedPractice;
    if (mockTitle) mockTitle.textContent = labels.title;
    if (mockSubtitle) mockSubtitle.textContent = subtitle;

    if (mockBackLink) {
      mockBackLink.href = getBackHref();
      mockBackLink.textContent = getBackLabel();
    }

    if (instructionsTitle) instructionsTitle.textContent = labels.instructions;
    if (instructionsSubtitle) instructionsSubtitle.textContent = labels.instructionsSub;
    if (startBtnLabel) startBtnLabel.textContent = labels.startTest;

    if (summaryTitle) summaryTitle.textContent = labels.summaryTitle;
    if (qCountLabel) qCountLabel.textContent = labels.questions;
    if (timeLabel) timeLabel.textContent = labels.timeLimit;
    if (modeLabel) modeLabel.textContent = labels.mode;
    if (modeValue) modeValue.textContent = labels.mock;
    if (feedbackLabel) feedbackLabel.textContent = labels.feedback;
    if (feedbackValue) feedbackValue.textContent = labels.afterSubmit;
    if (summaryNote) summaryNote.textContent = labels.summaryNote;

    if (liveKicker) liveKicker.textContent = labels.testRunning;
    if (liveTitle) liveTitle.textContent = labels.liveTitle;
    if (liveSubtitle) liveSubtitle.textContent = labels.liveSub;

    updateSummary();
  }

  async function initPage() {
    renderBreadcrumbs();
    initLabels();
    renderInstructions();
    await loadMockSetup();
    updateSummary();

    if (startBtn) {
      startBtn.addEventListener("click", startTest);
    }

    if (!questions.length) {
      renderNoQuestions();
    }
  }

  initPage();
})();
