/* ===================================================
   see2083 — Chapter Page Logic
   Renders chapter dashboard + study options
   =================================================== */

(function () {
  const requestedMedium = getParam("medium");
  const requestedSubject = getParam("subject");
  const requestedChapter = getParam("chapter");
  const medium = requestedMedium || getCurrentMedium() || "english";
  const subjectId = requestedSubject || "science";
  const chapterId = requestedChapter || "scientific-study";

  if (typeof setMedium === "function") {
    setMedium(medium);
  }

  if (typeof pageInit === "function") {
    pageInit("subjects");
  }

  const lang = getCurrentLanguage();
  const isNp = lang === "np";
  const isNepaliMedium = medium === "nepali";

  const labels = {
    home: isNp ? "गृहपृष्ठ" : "Home",
    medium: isNp ? "माध्यम" : "Medium",
    subjects: isNp ? "विषयहरू" : "Subjects",
    chapter: isNp ? "अध्याय" : "Chapter",
    save: isNp ? "अध्याय सुरक्षित गर्नुहोस्" : "Save Chapter",
    saved: isNp ? "सुरक्षित भयो" : "Saved",
    viewOptions: isNp ? "अध्ययन विकल्प हेर्नुहोस् ↓" : "View Study Options ↓",
    studyOptions: isNp ? "अध्ययन विकल्पहरू" : "Study Options",
    studyOptionsSub: isNp
      ? "यो अध्यायमा के अध्ययन गर्ने छान्नुहोस्।"
      : "Choose what you want to do in this chapter.",
    pathTitle: isNp ? "सुझाव गरिएको अध्ययन क्रम" : "Recommended study path",
    pathSub: isNp
      ? "राम्रो revision का लागि यो क्रम पालना गर्नुहोस्।"
      : "Follow this order for better revision.",
    chapterInfo: isNp ? "अध्याय जानकारी" : "Chapter info",
    contentNotice: isNp
      ? "यस खण्डमा सामग्री थपिएको छैन।"
      : "No content added in this section yet.",
    open: isNp ? "खोल्नुहोस्" : "Open",
    startPractice: isNp ? "अभ्यास सुरु गर्नुहोस्" : "Start Practice",
    takeTest: isNp ? "टेस्ट दिनुहोस्" : "Take Test",
    soon: "",
    notFound: isNp ? "अध्याय भेटिएन" : "Chapter not found",
    notFoundSub: isNp
      ? "यो अध्याय भेटिएन। कृपया विषय पृष्ठमा फर्कनुहोस्।"
      : "This chapter was not found. Please go back to the subject page.",
    backToSubject: isNp ? "विषयमा फर्कनुहोस्" : "Back to subject",
    chooseAnotherChapter: isNp ? "← अर्को अध्याय छान्नुहोस्" : "← Choose Another Chapter"
  };

  Object.assign(labels, {
    contentNotice: isNepaliMedium
      ? "यो अध्यायको सामग्री थपिँदैछ। केही अध्ययन सामग्री अझै उपलब्ध नहुन सक्छ।"
      : "Content for this chapter is being added. Some study tools may not be available yet.",
    contentBeingAdded: isNepaliMedium ? "थपिँदैछ" : "Content being added",
    comingSoon: isNepaliMedium ? "चाँडै" : "Coming soon"
  });

  labels.comingSoon = "Coming soon";
  labels.available = "Available";

  const subjectIconEl = document.getElementById("chapter-subject-icon");
  const metaEl = document.getElementById("chapter-meta");
  const titleEl = document.getElementById("chapter-title");
  const summaryEl = document.getElementById("chapter-summary");
  const bookmarkBtn = document.getElementById("bookmark-btn");
  const bmLabel = document.getElementById("bm-label");
  const viewOptionsBtn = document.getElementById("view-options-btn");
  const contentNotice = document.getElementById("content-notice");
  const pathTitle = document.getElementById("path-title");
  const pathSubtitle = document.getElementById("path-subtitle");
  const pathList = document.getElementById("study-path-list");
  const chapterInfoTitle = document.getElementById("chapter-info-title");
  const chapterInfoList = document.getElementById("chapter-info-list");
  const optionsTitle = document.getElementById("study-options-title");
  const optionsSubtitle = document.getElementById("study-options-subtitle");
  const optionsGrid = document.getElementById("study-options-grid");

  function getMediumObject() {
    if (!hasS2083Data()) return null;

    return safeArray(S2083.mediums).find(function (item) {
      return item.id === medium;
    }) || null;
  }

  function getMediumLabel() {
    const mediumObj = getMediumObject();

    if (!mediumObj) return medium;

    return isNp ? (mediumObj.labelNp || mediumObj.label) : mediumObj.label;
  }

  function getSubjectObject() {
    if (!hasS2083Data()) return null;

    if (typeof S2083.getSubject === "function") {
      return S2083.getSubject(subjectId);
    }

    return getSubjectById(subjectId);
  }

  function getChapterObject() {
    if (!hasS2083Data()) return null;

    if (typeof S2083.getChapter === "function") {
      return S2083.getChapter(subjectId, chapterId);
    }

    if (!S2083.chapters || !Array.isArray(S2083.chapters[subjectId])) {
      return null;
    }

    return S2083.chapters[subjectId].find(function (item) {
      return item.id === chapterId;
    }) || null;
  }

  function getSubjectName(subject) {
    return isNp ? (subject.nameNp || subject.name) : subject.name;
  }

  function getChapterTitle(chapter) {
    return isNp ? (chapter.titleNp || chapter.title) : chapter.title;
  }

  function getChapterSummary(chapter) {
    return isNp
      ? (chapter.summaryNp || chapter.summary || "")
      : (chapter.summary || "");
  }

  function getOptionUrl(optionId) {
    const base =
      "subject=" + encodeURIComponent(subjectId) +
      "&chapter=" + encodeURIComponent(chapterId) +
      "&medium=" + encodeURIComponent(medium);

    const links = {
      "mcq-practice": "quiz.html?" + base,
      "mock-test": "mock-test.html?" + base,
      "handwritten-note": "notes.html?" + base + "&type=handwritten",
      "easy-note": "notes.html?" + base + "&type=easy",
      "infographic": "resource-viewer.html?" + base + "&type=infographic",
      "infographics": "resource-viewer.html?" + base + "&type=infographic",
      "slides": "notes.html?" + base + "&type=slides",
      "slide": "notes.html?" + base + "&type=slides",
      "short-questions": "notes.html?" + base + "&type=short",
      "important-questions": "notes.html?" + base + "&type=important",
      "past-questions": "notes.html?" + base + "&type=past",
      "overview": "notes.html?" + base + "&type=overview",
      "theory": "notes.html?" + base + "&type=theory",
      "practical": "notes.html?" + base + "&type=practical",
      "past": "notes.html?" + base + "&type=past"
    };

    return links[optionId] || "notes.html?" + base + "&type=easy";
  }

  function getOptionActionLabel(optionId) {
    if (optionId === "mcq-practice") return labels.startPractice;
    if (optionId === "mock-test") return labels.takeTest;
    if (optionId === "infographic" || optionId === "infographics") return isNp ? "Infographic हेर्नुहोस्" : "View Infographic";
    return labels.open;
  }

  function getStandardOptions() {
    if (hasS2083Data() && Array.isArray(S2083.studyOptions)) {
      return S2083.studyOptions;
    }

    return [
      {
        id: "easy-note",
        icon: "📝",
        title: "Easy Note",
        titleNp: "सजिलो नोट",
        desc: "Read simplified notes for this chapter.",
        descNp: "यो अध्यायका सजिला नोट पढ्नुहोस्।"
      },
      {
        id: "mcq-practice",
        icon: "✅",
        title: "MCQ Practice",
        titleNp: "MCQ अभ्यास",
        desc: "Practice objective questions.",
        descNp: "वस्तुगत प्रश्न अभ्यास गर्नुहोस्।"
      },
      {
        id: "mock-test",
        icon: "🎯",
        title: "Chapter Mock Test",
        titleNp: "मोक टेस्ट",
        desc: "Take a timed practice test.",
        descNp: "समय मिलाएर अभ्यास टेस्ट दिनुहोस्।"
      }
    ];
  }

  function getElectricalOptions() {
    return [
      {
        id: "overview",
        icon: "📘",
        title: "Overview",
        titleNp: "अवलोकन",
        desc: "Understand the main idea and scope of this chapter.",
        descNp: "यो अध्यायको मुख्य विचार र क्षेत्र बुझ्नुहोस्।"
      },
      {
        id: "theory",
        icon: "📖",
        title: "Theory",
        titleNp: "सिद्धान्त",
        desc: "Study core theory, formulas, and definitions.",
        descNp: "मुख्य सिद्धान्त, सूत्र र परिभाषा अध्ययन गर्नुहोस्।"
      },
      {
        id: "practical",
        icon: "🛠️",
        title: "Practical",
        titleNp: "व्यावहारिक",
        desc: "Review practical tasks, tools, and safety points.",
        descNp: "व्यावहारिक काम, उपकरण र सुरक्षा बुँदा हेर्नुहोस्।"
      },
      {
        id: "past",
        icon: "📋",
        title: "Past Questions",
        titleNp: "पुराना प्रश्नहरू",
        desc: "Practice previous exam-style questions.",
        descNp: "पुराना परीक्षा शैलीका प्रश्न अभ्यास गर्नुहोस्।"
      },
      {
        id: "mcq-practice",
        icon: "✅",
        title: "MCQ Practice",
        titleNp: "MCQ अभ्यास",
        desc: "Practice objective questions.",
        descNp: "वस्तुगत प्रश्न अभ्यास गर्नुहोस्।"
      },
      {
        id: "mock-test",
        icon: "🎯",
        title: "Chapter Mock Test",
        titleNp: "मोक टेस्ट",
        desc: "Take a timed practice test.",
        descNp: "समय मिलाएर अभ्यास टेस्ट दिनुहोस्।"
      }
    ];
  }

  function getOptions(subject) {
    if (subject && subject.mediumGroup === "electrical") {
      return getElectricalOptions();
    }

    return getStandardOptions();
  }

  function getOptionName(option) {
    if (!isNp && option.id === "mock-test") return "Mock Test";
    return isNp ? (option.titleNp || option.title) : option.title;
  }

  function getOptionDescription(optionId, isAvailable, fallback) {
    const availableDescriptions = {
      "easy-note": "Read the simple revision note for this chapter.",
      "handwritten-note": "Open the handwritten note for visual revision.",
      infographic: "View a visual summary inside SEE 2083.",
      slides: "View chapter slides for quick revision.",
      slide: "View chapter slides for quick revision.",
      "mcq-practice": "Practice questions with instant feedback.",
      "mock-test": "Try exam-style questions with timer.",
      "short-questions": "Practice short answer questions.",
      "important-questions": "Review important questions for exam practice.",
      "past-questions": "Review past exam-style questions.",
      overview: "Read the chapter overview.",
      theory: "Study the core theory for this chapter.",
      practical: "Review practical tasks and safety points.",
      past: "Review past exam-style questions."
    };
    const comingSoonDescriptions = {
      "easy-note": "Simple PDF note will be added soon.",
      "handwritten-note": "Handwritten note will be added soon.",
      infographic: "Visual summary will be added soon.",
      slides: "Chapter slides will be added soon.",
      slide: "Chapter slides will be added soon.",
      "mcq-practice": "MCQ practice will be added soon.",
      "mock-test": "Mock test will be added soon.",
      "short-questions": "Short questions will be added soon.",
      "important-questions": "Important questions will be added soon.",
      "past-questions": "Past questions will be added soon.",
      overview: "Overview content will be added soon.",
      theory: "Theory content will be added soon.",
      practical: "Practical content will be added soon.",
      past: "Past questions will be added soon."
    };
    const descriptions = isAvailable ? availableDescriptions : comingSoonDescriptions;

    return descriptions[optionId] || fallback || "";
  }

  function getOptionDesc(option, isAvailable) {
    const fallback = isNp ? (option.descNp || option.desc || "") : (option.desc || "");

    return getOptionDescription(option.id, Boolean(isAvailable), fallback);
  }

  function getOptionStatusLabel(isAvailable) {
    return isAvailable ? labels.available : labels.comingSoon;
  }

  function getOptionStatusClass(isAvailable) {
    return isAvailable ? "option-status-available" : "option-status-coming-soon";
  }

  function isPrimaryOption(optionId) {
    return optionId === "mcq-practice" || optionId === "mock-test";
  }

  function getOptionResourceKey(optionId) {
    const map = {
      "easy-note": "easyNote",
      "handwritten-note": "handwrittenNote",
      infographic: "infographics",
      infographics: "infographics",
      slides: "slides",
      slide: "slides",
      "short-questions": "shortQuestions",
      "important-questions": "importantQuestions",
      "past-questions": "pastQuestions",
      overview: "notes",
      theory: "notes",
      practical: "notes",
      past: "pastQuestions",
      "mcq-practice": "mcq",
      "mock-test": "mockTest"
    };

    return map[optionId] || "";
  }

  function isResourceHeavyOption(optionId) {
    return [
      "easy-note",
      "handwritten-note",
      "infographic",
      "slides",
      "slide",
      "short-questions",
      "important-questions",
      "past-questions",
      "overview",
      "theory",
      "practical",
      "past"
    ].includes(optionId);
  }

  function normalizeStatus(value) {
    return value ? String(value).toLowerCase() : "";
  }

  function isPublishedResource(data) {
    return normalizeStatus(data && data.status) === "published";
  }

  function getStringSnapshot(value) {
    try {
      return JSON.stringify(value || {});
    } catch (error) {
      return "";
    }
  }

  function isPlaceholderText(value) {
    const text = String(value || "").toLowerCase();

    return [
      "content is being added",
      "easy note is being added",
      "being prepared",
      "will be added later",
      "will be pasted manually",
      "placeholder",
      "demo ",
      "demo-",
      "structure testing",
      "तयार हुँदैछ",
      "थपिँदैछ"
    ].some(function (phrase) {
      return text.indexOf(phrase) !== -1;
    });
  }

  function stripHTML(value) {
    return String(value || "")
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function hasRealHTMLContent(html) {
    const text = stripHTML(html);

    if (!text || text.length < 160) return false;
    if (isPlaceholderText(text)) return false;

    return true;
  }

  function getResourceItems(data, keys) {
    if (!data) return [];

    return keys.reduce(function (items, key) {
      return Array.isArray(data[key]) ? items.concat(data[key]) : items;
    }, []);
  }

  function hasUsefulJSONItems(data, keys) {
    const items = getResourceItems(data, keys);

    if (!isPublishedResource(data)) return false;
    if (!items.length) return false;
    if (isPlaceholderText(getStringSnapshot(items))) return false;

    return true;
  }

  function hasUsableQuestionSet(resource, normalizer) {
    if (!resource || !resource.data || !isPublishedResource(resource.data)) return false;
    if (typeof normalizer !== "function") return false;

    const questions = normalizer(resource.data, subjectId, chapterId);

    if (!questions.length) return false;
    if (isPlaceholderText(getStringSnapshot(resource.data.questions))) return false;

    return true;
  }

  async function loadJSONResource(loader, bundle, resourceKey) {
    const path = bundle && bundle.resources ? bundle.resources[resourceKey] : "";

    if (!path || !loader || typeof loader.loadJSON !== "function") return null;

    return loader.loadJSON(path);
  }

  async function resolveResourceAvailability(loader, bundle, downloads) {
    const availability = {
      notes: false,
      easyNote: false,
      handwrittenNote: false,
      mcq: false,
      mockTest: false,
      slides: false,
      infographics: false,
      importantQuestions: false,
      shortQuestions: false,
      pastQuestions: false,
      downloads: Boolean(downloads && downloads.found)
    };

    if (!loader || !bundle || !bundle.found) return availability;

    const quiz = typeof loader.loadQuizResource === "function"
      ? await loader.loadQuizResource(medium, subjectId, chapterId)
      : null;
    const mock = typeof loader.loadMockTestResource === "function"
      ? await loader.loadMockTestResource(medium, subjectId, chapterId)
      : null;
    const infographics = typeof loader.loadInfographicsResource === "function"
      ? await loader.loadInfographicsResource(medium, subjectId, chapterId)
      : null;
    const notes = typeof loader.loadNotesResource === "function"
      ? await loader.loadNotesResource(medium, subjectId, chapterId, "overview")
      : null;
    const easyNote = typeof loader.loadNotesResource === "function"
      ? await loader.loadNotesResource(medium, subjectId, chapterId, "easy")
      : null;
    const handwrittenNote = typeof loader.loadNotesResource === "function"
      ? await loader.loadNotesResource(medium, subjectId, chapterId, "handwritten")
      : null;
    const slides = await loadJSONResource(loader, bundle, "slides");
    const importantQuestions = await loadJSONResource(loader, bundle, "importantQuestions");
    const shortQuestions = await loadJSONResource(loader, bundle, "shortQuestions");
    const pastQuestions = await loadJSONResource(loader, bundle, "pastQuestions");
    const mcqAvailable = hasUsableQuestionSet(quiz, loader.normalizeMCQData);
    const mockAvailable = hasUsableQuestionSet(mock, loader.normalizeMockTestData);

    availability.mcq = mcqAvailable;
    availability.mockTest = mockAvailable || mcqAvailable;
    availability.infographics = Boolean(infographics && infographics.found);
    availability.notes = Boolean(notes && notes.kind === "html" && hasRealHTMLContent(notes.data));
    availability.easyNote = Boolean(easyNote && easyNote.kind === "html" && hasRealHTMLContent(easyNote.data));
    availability.handwrittenNote = Boolean(handwrittenNote && handwrittenNote.kind === "html" && hasRealHTMLContent(handwrittenNote.data));
    availability.slides = hasUsefulJSONItems(slides, ["slides", "items"]);
    availability.importantQuestions = hasUsefulJSONItems(importantQuestions, ["items", "questions"]);
    availability.shortQuestions = hasUsefulJSONItems(shortQuestions, ["items", "questions"]);
    availability.pastQuestions = hasUsefulJSONItems(pastQuestions, ["items", "questions"]);

    return availability;
  }

  function getAvailableTypesFromAvailability(availability) {
    if (!availability) return [];

    return [
      "notes",
      "easyNote",
      "handwrittenNote",
      "mcq",
      "mockTest",
      "slides",
      "infographics",
      "importantQuestions",
      "shortQuestions",
      "pastQuestions",
      "downloads"
    ].filter(function (type) {
      return Boolean(availability[type]);
    });
  }

  function setOptionAvailability(optionId, isAvailable) {
    const statusEl = optionsGrid && optionsGrid.querySelector(
      '.option-status[data-option-id="' + optionId + '"]'
    );
    const descEl = optionsGrid && optionsGrid.querySelector(
      '.study-option-desc[data-option-id="' + optionId + '"]'
    );
    const cardEl = statusEl ? statusEl.closest(".study-option-card") : null;

    if (statusEl) {
      statusEl.textContent = getOptionStatusLabel(isAvailable);
      statusEl.className = "option-status " + getOptionStatusClass(isAvailable);
      statusEl.setAttribute("data-status", isAvailable ? "available" : "coming-soon");
    }

    if (descEl) {
      descEl.textContent = getOptionDescription(optionId, isAvailable, descEl.textContent);
    }

    if (cardEl) {
      cardEl.classList.toggle("is-resource-available", Boolean(isAvailable));
      cardEl.classList.toggle("is-resource-coming-soon", !isAvailable);
    }
  }

  function renderBreadcrumbs(subject, chapter) {
    const mediumLabel = getMediumLabel();
    const subjectName = subject ? getSubjectName(subject) : labels.subjects;
    const chapterTitle = chapter ? getChapterTitle(chapter) : labels.notFound;

    renderBreadcrumb(document.getElementById("breadcrumb"), [
      { label: labels.home, href: "index.html" },
      { label: mediumLabel, href: "subjects.html?medium=" + encodeURIComponent(medium) },
      {
        label: subjectName,
        href:
          "chapters.html?subject=" +
          encodeURIComponent(subjectId) +
          "&medium=" +
          encodeURIComponent(medium)
      },
      { label: chapterTitle }
    ]);
  }

  function renderStudyPath(subject) {
    if (!pathList) return;

    const path = subject && subject.mediumGroup === "electrical"
      ? [
          { icon: "📘", title: isNp ? "अवलोकन" : "Overview", url: getOptionUrl("overview") },
          { icon: "📖", title: isNp ? "सिद्धान्त" : "Theory", url: getOptionUrl("theory") },
          { icon: "🛠️", title: isNp ? "व्यावहारिक" : "Practical", url: getOptionUrl("practical") },
          { icon: "🎯", title: isNp ? "मोक टेस्ट" : "Chapter Mock Test", url: getOptionUrl("mock-test") }
        ]
      : [
          { icon: "📝", title: isNp ? "सजिलो नोट" : "Easy Note", url: getOptionUrl("easy-note") },
          { icon: "✅", title: isNp ? "MCQ अभ्यास" : "MCQ Practice", url: getOptionUrl("mcq-practice") },
          { icon: "⭐", title: isNp ? "महत्त्वपूर्ण प्रश्न" : "Important Questions", url: getOptionUrl("important-questions") },
          { icon: "🎯", title: isNp ? "मोक टेस्ट" : "Chapter Mock Test", url: getOptionUrl("mock-test") }
        ];

    pathList.innerHTML = "";

    path.forEach(function (item, index) {
      const link = document.createElement("a");
      link.className = "study-path-item";
      link.href = item.url;

      link.innerHTML =
        '<span class="study-path-step">' + (index + 1) + '</span>' +
        '<span class="study-path-icon">' + escapeHTML(item.icon) + '</span>' +
        '<strong>' + escapeHTML(item.title) + '</strong>';

      pathList.appendChild(link);
    });
  }

  function renderChapterInfo(subject, chapter) {
    if (!chapterInfoList) return;

    const subjectName = getSubjectName(subject);

    chapterInfoList.innerHTML =
      '<div>' +
        '<span>' + (isNp ? "विषय" : "Subject") + '</span>' +
        '<strong>' + escapeHTML(subjectName) + '</strong>' +
      '</div>' +
      '<div>' +
        '<span>' + labels.chapter + '</span>' +
        '<strong>' + escapeHTML(chapter.number || "—") + '</strong>' +
      '</div>' +
      '<div>' +
        '<span>' + (isNp ? "माध्यम" : "Medium") + '</span>' +
        '<strong>' + escapeHTML(getMediumLabel()) + '</strong>' +
      '</div>';
  }

  function renderStudyOptions(subject) {
    if (!optionsGrid) return;

    const options = getOptions(subject);

    optionsGrid.innerHTML = "";

    options.forEach(function (option) {
      const card = document.createElement("a");

      const title = getOptionName(option);
      const desc = getOptionDesc(option, false);
      const primary = isPrimaryOption(option.id);

      card.href = getOptionUrl(option.id);
      card.className = "study-option-card chapter-option-card is-resource-coming-soon";

      card.innerHTML =
        '<div class="chapter-option-main">' +
          '<div class="study-option-icon">' + escapeHTML(option.icon) + '</div>' +
          '<div class="study-option-info">' +
            '<div class="study-option-title-row">' +
              '<div class="study-option-title">' + escapeHTML(title) + '</div>' +
              '<span class="option-status option-status-coming-soon" data-status="coming-soon" data-option-id="' + escapeHTML(option.id) + '">' + escapeHTML(getOptionStatusLabel(false)) + '</span>' +
            '</div>' +
            '<div class="study-option-desc" data-option-id="' + escapeHTML(option.id) + '">' + escapeHTML(desc) + '</div>' +
          '</div>' +
        '</div>' +
        '<span class="btn btn-sm ' + (primary ? "btn-primary" : "btn-ghost") + '" style="pointer-events:none;flex-shrink:0">' +
          escapeHTML(getOptionActionLabel(option.id)) +
        ' →</span>';

      optionsGrid.appendChild(card);
    });
  }

  function getExternalResourceLabel(type) {
    const labelsByType = {
      easyNote: "Easy Note",
      mcq: "MCQ",
      mockTest: "Mock Test",
      slides: "Slides",
      infographics: "Infographics",
      downloads: "Downloads"
    };

    return labelsByType[type] || "";
  }

  function renderExternalNotice(bundle, hasDownloads) {
    if (!contentNotice || !bundle || !bundle.found) return;

    const resourceLabels = safeArray(bundle.availableTypes)
      .filter(function (type) {
        if (type === "downloads" && !hasDownloads) return false;
        return ["easyNote", "mcq", "mockTest", "slides", "infographics", "downloads"].includes(type);
      })
      .map(getExternalResourceLabel)
      .filter(Boolean);

    const prefix = isNp
      ? "यस अध्यायका लागि external content pack जोडिएको छ।"
      : "External content pack connected for this chapter.";
    const suffix = resourceLabels.length
      ? (isNp ? " उपलब्ध: " : " Available: ") + resourceLabels.join(", ") + "."
      : "";

    contentNotice.textContent = prefix + suffix;
  }

  function updateOptionAvailability(availability) {
    if (!optionsGrid) return;

    optionsGrid.querySelectorAll(".option-status[data-option-id]").forEach(function (statusEl) {
      const optionId = statusEl.getAttribute("data-option-id");
      const resourceKey = getOptionResourceKey(optionId);

      if (!resourceKey) {
        return;
      }

      setOptionAvailability(optionId, Boolean(availability && availability[resourceKey]));
    });
  }

  function renderDownloadCards(items) {
    if (!optionsGrid || !items || !items.length) return;

    items.forEach(function (item) {
      const card = document.createElement("a");
      const type = String(item.type || "").toLowerCase();
      const icon = type === "pdf" ? "📕" : "📄";
      const buttonText = item.downloadAllowed === true
        ? (isNp ? "Download" : "Download")
        : (isNp ? "View" : "View");
      const desc = item.mode === "google-drive-view"
        ? "Google Drive " + (item.downloadAllowed === true ? "file" : "view")
        : item.mode;

      card.href = item.viewUrl;
      card.target = "_blank";
      card.rel = "noopener noreferrer";
      card.className = "study-option-card chapter-option-card";

      card.innerHTML =
        '<div class="chapter-option-main">' +
          '<div class="study-option-icon">' + escapeHTML(icon) + '</div>' +
          '<div class="study-option-info">' +
            '<div class="study-option-title-row">' +
              '<div class="study-option-title">' + escapeHTML(item.title) + '</div>' +
            '</div>' +
            '<div class="study-option-desc">' + escapeHTML(desc) + '</div>' +
          '</div>' +
        '</div>' +
        '<span class="btn btn-outline btn-sm" style="pointer-events:none;flex-shrink:0">' +
          escapeHTML(buttonText) +
        '</span>';

      optionsGrid.appendChild(card);
    });
  }

  function getChooseAnotherChapterUrl() {
    if (!requestedMedium) {
      return "medium.html";
    }

    if (!requestedSubject) {
      return "subjects.html?medium=" + encodeURIComponent(medium);
    }

    return "chapters.html?subject=" +
      encodeURIComponent(subjectId) +
      "&medium=" +
      encodeURIComponent(medium);
  }

  function renderChooseAnotherChapterButton() {
    if (!viewOptionsBtn || !viewOptionsBtn.parentElement) return;
    if (document.getElementById("choose-another-chapter-btn")) return;

    const link = document.createElement("a");
    link.id = "choose-another-chapter-btn";
    link.className = "btn btn-outline btn-sm";
    link.href = getChooseAnotherChapterUrl();
    link.textContent = labels.chooseAnotherChapter;

    viewOptionsBtn.parentElement.appendChild(link);
  }

  async function enhanceExternalContentPack() {
    if (!window.SEE2083ContentLoader) return;
    const loader = window.SEE2083ContentLoader;
    if (typeof loader.loadChapterResourceBundle !== "function") return;

    try {
      const bundle = await loader.loadChapterResourceBundle(medium, subjectId, chapterId);

      if (!bundle || !bundle.found) {
        if (contentNotice) {
          contentNotice.textContent = labels.contentNotice;
        }
        updateOptionAvailability(null);
        return;
      }

      let downloads = {
        found: false,
        items: []
      };

      if (typeof loader.loadDownloadsResource === "function") {
        downloads = await loader.loadDownloadsResource(medium, subjectId, chapterId);
      }

      const availability = await resolveResourceAvailability(loader, bundle, downloads);
      const effectiveBundle = Object.assign({}, bundle, {
        availableTypes: getAvailableTypesFromAvailability(availability)
      });

      renderExternalNotice(effectiveBundle, Boolean(downloads && downloads.found));
      updateOptionAvailability(availability);

      if (downloads && downloads.found) {
        renderDownloadCards(downloads.items);
      }
    } catch (error) {
      if (contentNotice) {
        contentNotice.textContent = labels.contentNotice;
      }
      updateOptionAvailability(null);
      return;
    }
  }

  function setupBookmark(subject, chapter) {
    if (!bookmarkBtn || !bmLabel) return;

    const subjectName = getSubjectName(subject);
    const chapterTitle = getChapterTitle(chapter);
    const bmKey = "chapter-" + subjectId + "-" + chapterId;

    function updateButton() {
      const saved = Bookmarks.isBookmarked(bmKey);

      bmLabel.textContent = saved ? labels.saved : labels.save;
      bookmarkBtn.classList.toggle("bookmarked", saved);
    }

    bookmarkBtn.addEventListener("click", function () {
      const added = Bookmarks.toggle({
        id: bmKey,
        type: "chapter",
        title: chapterTitle,
        subjectTitle: subjectName,
        url:
          "chapter.html?subject=" +
          encodeURIComponent(subjectId) +
          "&chapter=" +
          encodeURIComponent(chapterId) +
          "&medium=" +
          encodeURIComponent(medium)
      });

      updateButton();

      if (typeof showToast === "function") {
        showToast(
          added
            ? (isNp ? "अध्याय सुरक्षित भयो" : "Chapter saved")
            : (isNp ? "हटाइयो" : "Removed")
        );
      }
    });

    updateButton();
  }

  function renderNotFound() {
    document.title = labels.notFound + " — SEE 2083";

    if (subjectIconEl) subjectIconEl.textContent = "📚";
    if (metaEl) metaEl.innerHTML = '<span class="badge badge-gray">' + labels.notFound + '</span>';
    if (titleEl) titleEl.textContent = labels.notFound;
    if (summaryEl) summaryEl.textContent = labels.notFoundSub;
    if (contentNotice) contentNotice.textContent = labels.notFoundSub;
    if (pathTitle) pathTitle.textContent = labels.pathTitle;
    if (pathSubtitle) pathSubtitle.textContent = labels.pathSub;
    if (chapterInfoTitle) chapterInfoTitle.textContent = labels.chapterInfo;
    if (optionsTitle) optionsTitle.textContent = labels.studyOptions;
    if (optionsSubtitle) optionsSubtitle.textContent = labels.studyOptionsSub;
    if (pathList) pathList.innerHTML = "";
    if (chapterInfoList) chapterInfoList.innerHTML = "";
    if (optionsGrid) {
      optionsGrid.innerHTML =
        '<div class="empty-state">' +
          '<div class="empty-icon">📚</div>' +
          '<h3>' + labels.notFound + '</h3>' +
          '<p>' + labels.notFoundSub + '</p>' +
          '<a class="btn btn-primary" href="subjects.html?medium=' + encodeURIComponent(medium) + '">' +
            labels.backToSubject +
          '</a>' +
        '</div>';
    }

    renderBreadcrumbs(null, null);
  }

  function renderPage() {
    const subject = getSubjectObject();
    const chapter = getChapterObject();

    if (!subject || !chapter) {
      renderNotFound();
      return;
    }

    const subjectName = getSubjectName(subject);
    const chapterTitle = getChapterTitle(chapter);
    const summary = getChapterSummary(chapter);

    document.title = chapterTitle + " — SEE 2083";

    if (subjectIconEl) subjectIconEl.textContent = subject.icon || "📚";

    if (metaEl) {
      metaEl.innerHTML =
        '<span class="badge badge-blue">' +
          escapeHTML(subject.icon || "📚") + " " + escapeHTML(subjectName) +
        '</span>' +
        '<span class="badge badge-gray">' +
          escapeHTML(labels.chapter) + " " + escapeHTML(chapter.number || "") +
        '</span>';
    }

    if (titleEl) titleEl.textContent = chapterTitle;
    if (summaryEl) summaryEl.textContent = summary;

    if (bookmarkBtn) {
      bookmarkBtn.setAttribute("type", "button");
    }

    if (viewOptionsBtn) {
      viewOptionsBtn.textContent = labels.viewOptions;
      renderChooseAnotherChapterButton();
    }

    if (contentNotice) contentNotice.textContent = labels.contentNotice;
    if (pathTitle) pathTitle.textContent = labels.pathTitle;
    if (pathSubtitle) pathSubtitle.textContent = labels.pathSub;
    if (chapterInfoTitle) chapterInfoTitle.textContent = labels.chapterInfo;
    if (optionsTitle) optionsTitle.textContent = labels.studyOptions;
    if (optionsSubtitle) optionsSubtitle.textContent = labels.studyOptionsSub;

    renderBreadcrumbs(subject, chapter);
    renderStudyPath(subject);
    renderChapterInfo(subject, chapter);
    renderStudyOptions(subject);
    setupBookmark(subject, chapter);
    enhanceExternalContentPack();
  }

  renderPage();
})();
