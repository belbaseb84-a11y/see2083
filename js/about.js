/* ===================================================
   see2083 - About Page Logic
   Initializes shared layout and breadcrumb
   =================================================== */

(function () {
  if (typeof pageInit === "function") {
    pageInit("about");
  }

  const lang = getCurrentLanguage();
  const isNp = lang === "np";

  const labels = {
    home: isNp ? "à¤—à¥ƒà¤¹à¤ªà¥ƒà¤·à¥à¤ " : "Home",
    about: isNp ? "à¤¬à¤¾à¤°à¥‡à¤®à¤¾" : "About",
    kicker: isNp ? "see2083 à¤¬à¤¾à¤°à¥‡à¤®à¤¾" : "About see2083",
    title: isNp
      ? "see2083 बारेमा"
      : "About see2083",
    subtitle: isNp
      ? "नेपालका विद्यार्थी र शिक्षकका लागि सरल SEE Grade 10 अध्ययन प्लेटफर्म।"
      : "A simple SEE Grade 10 study platform for students and teachers in Nepal.",
    start: isNp ? "à¤ªà¤¢à¥à¤¨ à¤¸à¥à¤°à¥ à¤—à¤°à¥à¤¨à¥à¤¹à¥‹à¤¸à¥" : "Start Learning",
    subjects: isNp ? "à¤µà¤¿à¤·à¤¯à¤¹à¤°à¥‚ à¤¹à¥‡à¤°à¥à¤¨à¥à¤¹à¥‹à¤¸à¥" : "Browse Subjects",
    purpose: isNp ? "à¤…à¤§à¥à¤¯à¤¯à¤¨ à¤²à¤•à¥à¤·à¥à¤¯" : "Study goal",
    purposeTitle: isNp ? "Why see2083?" : "Why see2083?",
    purposeSub: isNp
      ? "Simple tools for chapter-wise SEE revision."
      : "Simple tools for chapter-wise SEE revision.",
    mainCopy: isNp
      ? "see2083 helps students study chapter by chapter. Choose your medium, open subjects, revise notes, practice MCQs, take mock tests, and save useful chapters for later."
      : "see2083 helps students study chapter by chapter. Choose your medium, open subjects, revise notes, practice MCQs, take mock tests, and save useful chapters for later.",
    appTitle: isNp ? "Android app प्रयोग गर्नुहोस्" : "Use our Android app",
    appText: isNp
      ? "Class 10 SEE Guide सजिलो mobile अध्ययनका लागि Android मा पनि उपलब्ध छ।"
      : "Class 10 SEE Guide is also available on Android for easier mobile study.",
    appBtn: isNp ? "Play Store मा खोल्नुहोस्" : "Open on Play Store",
    appUrl: "https://play.google.com/store/apps/details?id=com.sushilmarashini.seeguide",
    status4: isNp ? "Search and bookmarks" : "Search and bookmarks",
    checklist: [
      "Chapter-wise learning",
      "Easy revision flow",
      "MCQ and mock test practice",
      "Search and bookmarks"
    ],
    final: isNp ? "à¤ªà¤¢à¥à¤¨ à¤¸à¥à¤°à¥ à¤—à¤°à¥à¤¨à¥à¤¹à¥‹à¤¸à¥" : "Start Learning"
  };

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function setList(id, items) {
    const el = document.getElementById(id);
    if (!el) return;

    el.innerHTML = items.map(function (item) {
      return "<li>" + item + "</li>";
    }).join("");
  }

  document.title = labels.about + " - see2083";

  renderBreadcrumb(document.getElementById("breadcrumb"), [
    { label: labels.home, href: "index.html" },
    { label: labels.about }
  ]);

  setText("about-kicker", labels.kicker);
  setText("about-title", labels.title);
  setText("about-subtitle", labels.subtitle);
  setText("start-btn", labels.start);
  setText("subjects-btn", labels.subjects);
  setText("purpose-kicker", labels.purpose);
  setText("purpose-title", labels.purposeTitle);
  setText("purpose-subtitle", labels.purposeSub);
  setText("goal-1-title", "Chapter-wise learning");
  setText("goal-1-text", "Study one chapter at a time.");
  setText("goal-2-title", "Easy revision flow");
  setText("goal-2-text", "Move from notes to practice quickly.");
  setText("goal-3-title", "Search and bookmarks");
  setText("goal-3-text", "Find and save useful chapters.");
  setText("for-title", "Why see2083?");
  setText("for-text", labels.mainCopy);
  setText("version-title", "Study smarter. Aim higher.");
  setText("version-text", "Use see2083 to revise clearly, practice regularly, and prepare with confidence for SEE exams.");
  setText("status-1", "Chapter-wise learning");
  setText("status-2", "Easy revision flow");
  setText("status-3", "MCQ and mock test practice");
  setText("status-4", labels.status4);
  setText("app-title", labels.appTitle);
  setText("app-text", labels.appText);
  setText("app-btn", labels.appBtn);
  setList("for-list", labels.checklist);
  const appBtn = document.getElementById("app-btn");
  if (appBtn) appBtn.href = labels.appUrl;
  setText("final-btn", labels.final);
  const scopeCard = document.getElementById("scope-kicker");
  if (scopeCard && scopeCard.closest) {
    scopeCard.closest(".about-note-card").style.display = "none";
  }
})();


