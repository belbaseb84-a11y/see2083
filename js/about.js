/* ===================================================
   see2083 - About Page Logic
   v1 keeps this page in clean English.
   =================================================== */

(function () {
  if (typeof pageInit === "function") {
    pageInit("about");
  }

  const labels = {
    home: "Home",
    about: "About",
    kicker: "About see2083",
    title: "About see2083",
    subtitle: "A simple SEE Grade 10 study platform for students and teachers in Nepal.",
    start: "Start Learning",
    subjects: "Browse Subjects",
    purpose: "Study platform",
    purposeTitle: "Built for chapter-wise SEE study",
    purposeSub:
      "see2083 provides subject-wise and chapter-wise study tools for Grade 10 SEE students.",
    mainCopy:
      "Students can choose English Medium, Nepali Medium, or Electrical Engineering, then open subjects, chapters, notes, MCQ practice, mock tests, search, and bookmarks in one clean place.",
    appTitle: "Use our Android app",
    appText: "Class 10 SEE Guide is also available on Android for easier mobile study.",
    appBtn: "Open on Play Store",
    appUrl: "https://play.google.com/store/apps/details?id=com.sushilmarashini.seeguide",
    whatsappBadge: "SEE 2083 WHATSAPP COMMUNITY",
    whatsappTitle: "Don’t prepare alone — join our SEE2083 WhatsApp community",
    whatsappText:
      "Connect with other SEE 2083 students on WhatsApp, ask doubts, get study updates, share useful resources, and stay motivated throughout your exam preparation.",
    whatsappBtn: "Join WhatsApp Community",
    youtubeBadge: "SIMPLE VIDEO LESSONS",
    youtubeTitle: "Watch easy explanation videos",
    youtubeText:
      "Prefer learning by watching? Visit our YouTube channel for simple chapter explanations, MCQ practice, exam tips, and visual lessons made for Class 10 students.",
    youtubeBtn: "Watch on YouTube"
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

  setText("mini-1-title", "Chapter focused");
  setText("mini-1-text", "Study one chapter at a time.");
  setText("mini-2-title", "Practice tools");
  setText("mini-2-text", "MCQs and mock tests for revision.");
  setText("mini-3-title", "Easy to search");
  setText("mini-3-text", "Find subjects and chapters easily.");

  setText("purpose-kicker", labels.purpose);
  setText("purpose-title", labels.purposeTitle);
  setText("purpose-subtitle", labels.purposeSub);

  setText("goal-1-title", "Subject-wise study");
  setText("goal-1-text", "Open the medium, subject, and chapter you want to revise.");
  setText("goal-2-title", "Practice and revision");
  setText("goal-2-text", "Use notes, MCQ practice, mock tests, and past-question sections.");
  setText("goal-3-title", "Simple static website");
  setText("goal-3-text", "No login is required, and no student personal data is collected.");

  setText("for-kicker", "For students and teachers");
  setText("for-title", "Study tools in one place");
  setText("for-text", labels.mainCopy);
  setList("for-list", [
    "English Medium, Nepali Medium, and Electrical Engineering sections",
    "Subject-wise and chapter-wise navigation",
    "Search, bookmarks, MCQ practice, and mock tests",
    "Useful structure for students and teachers"
  ]);

  setText("version-kicker", "Content status");
  setText("version-title", "Content is being added step by step");
  setText(
    "version-text",
    "Some demo content may still be present while full study materials are reviewed and added."
  );
  setText("status-1", "No login required");
  setText("status-2", "No student personal data collected");
  setText("status-3", "Mistakes can be reported later");
  setText("status-4", "Not an official government website");

  setText("app-title", labels.appTitle);
  setText("app-text", labels.appText);
  setText("app-btn", labels.appBtn);
  const appBtn = document.getElementById("app-btn");
  if (appBtn) appBtn.href = labels.appUrl;

  setText("whatsapp-badge", labels.whatsappBadge);
  setText("whatsapp-title", labels.whatsappTitle);
  setText("whatsapp-text", labels.whatsappText);
  setText("whatsapp-btn", labels.whatsappBtn);

  setText("youtube-badge", labels.youtubeBadge);
  setText("youtube-title", labels.youtubeTitle);
  setText("youtube-text", labels.youtubeText);
  setText("youtube-btn", labels.youtubeBtn);
})();
