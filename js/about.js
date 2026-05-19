/* ===================================================
   SEE 2083 - About Page
   =================================================== */

(function () {
  if (typeof pageInit === "function") {
    pageInit("about");
  }

  document.title = "About SEE 2083";

  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute(
      "content",
      "SEE 2083 is an independent Grade 10 study platform for students in Nepal, with chapter-wise notes, practice questions, mock tests, visual resources, search, and bookmarks."
    );
  }

  if (typeof renderBreadcrumb === "function") {
    renderBreadcrumb(document.getElementById("breadcrumb"), [
      { label: "Home", href: "index.html" },
      { label: "About" }
    ]);
  }

  const links = {
    whatsapp: "",
    youtube: "",
    report: "",
    app: "https://play.google.com/store/apps/details?id=com.sushilmarashini.seeguide"
  };

  function isExternalUrl(url) {
    return /^https?:\/\//i.test(url);
  }

  function isMailUrl(url) {
    return /^mailto:/i.test(url);
  }

  function markComingSoon(el) {
    el.removeAttribute("href");
    el.setAttribute("aria-disabled", "true");
    el.classList.add("is-disabled");

    const label = document.createElement("span");
    label.className = "about-coming-label";
    label.textContent = "Coming soon";
    el.appendChild(label);

    el.addEventListener("click", function (event) {
      event.preventDefault();
    });
  }

  function wireLink(id, url) {
    const el = document.getElementById(id);
    const safeUrl = String(url || "").trim();

    if (!el) return;

    if (isExternalUrl(safeUrl)) {
      el.href = safeUrl;
      el.target = "_blank";
      el.rel = "noopener noreferrer";
      return;
    }

    if (isMailUrl(safeUrl)) {
      el.href = safeUrl;
      return;
    }

    markComingSoon(el);
  }

  wireLink("whatsapp-btn", links.whatsapp);
  wireLink("youtube-btn", links.youtube);
  wireLink("report-btn", links.report);
  wireLink("app-btn", links.app);
})();
