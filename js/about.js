/* ===================================================
   SEE 2083 — About Page Logic
   Premium trust-focused about page
   =================================================== */

(function () {
  if (typeof pageInit === "function") {
    pageInit("about");
  }

  document.title = "About - SEE 2083";

  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute(
      "content",
      "Learn about SEE 2083, an independent Grade 10 SEE study platform with chapter-wise MCQ practice, mock tests, infographics, search, and bookmarks."
    );
  }

  if (typeof renderBreadcrumb === "function") {
    renderBreadcrumb(document.getElementById("breadcrumb"), [
      { label: "Home", href: "index.html" },
      { label: "About" }
    ]);
  }

  const links = {
    app: "https://play.google.com/store/apps/details?id=com.sushilmarashini.seeguide",

    /*
      Replace these when you have real links.

      Example:
      whatsapp: "https://chat.whatsapp.com/XXXX",
      youtube: "https://www.youtube.com/@YOURCHANNEL",
      report: "mailto:your-email@gmail.com"
    */
    whatsapp: "",
    youtube: "",
    report: ""
  };

  function wireLink(id, url, fallbackText) {
    const el = document.getElementById(id);
    if (!el) return;

    if (url && /^https?:\/\//i.test(url)) {
      el.href = url;
      el.target = "_blank";
      el.rel = "noopener noreferrer";
      return;
    }

    if (url && url.startsWith("mailto:")) {
      el.href = url;
      return;
    }

    el.href = "#";
    el.setAttribute("aria-disabled", "true");
    el.classList.add("is-disabled");

    if (fallbackText) {
      el.textContent = fallbackText;
    }

    el.addEventListener("click", function (event) {
      event.preventDefault();
    });
  }

  wireLink("app-btn", links.app);
  wireLink("whatsapp-btn", links.whatsapp, "WhatsApp link coming soon");
  wireLink("youtube-btn", links.youtube, "YouTube link coming soon");
  wireLink("report-btn", links.report, "Report link coming soon");
})();