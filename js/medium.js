/* ===================================================
   see2083 - Medium Page Logic
   Renders medium selection cards
   =================================================== */

(function () {
  if (typeof pageInit === "function") {
    pageInit("medium");
  }

  const titleEl = document.getElementById("medium-page-title");
  const subtitleEl = document.getElementById("medium-page-subtitle");
  const noteTextEl = document.getElementById("medium-page-note-text");
  const grid = document.getElementById("medium-grid");

  if (titleEl) {
    titleEl.textContent = "Choose your medium";
  }

  if (subtitleEl) {
    subtitleEl.textContent = "Select the stream that matches your school. You can switch anytime.";
  }

  if (noteTextEl) {
    noteTextEl.textContent = "Common subjects are shared between English, Nepali, and technical streams.";
  }

  function getMediumDescription(id) {
    if (id === "english") return "Read SEE subjects in English.";
    if (id === "nepali") return "Read SEE subjects in Nepali.";
    if (id === "electrical") return "Open Grade 10 technical subjects.";
    return "";
  }

  function renderMediumCards() {
    if (!grid) return;

    grid.innerHTML = "";

    if (!hasS2083Data() || !Array.isArray(S2083.mediums)) {
      grid.innerHTML =
        '<div class="card">' +
          '<h3>No content added in this section yet.</h3>' +
          '<p>Chapter-wise study sections, search, bookmarks, MCQ practice, and mock tests are organized in one place.</p>' +
        '</div>';
      return;
    }

    S2083.mediums.forEach(function (item) {
      const card = document.createElement("a");

      card.href = "subjects.html?medium=" + encodeURIComponent(item.id);
      card.className = "medium-card" + (item.id === "english" ? " featured" : "");

      card.addEventListener("click", function () {
        if (typeof setMedium === "function") {
          setMedium(item.id);
        }
      });

      card.innerHTML =
        '<div class="medium-card-icon">' + escapeHTML(item.icon) + '</div>' +
        '<div class="medium-card-title">' + escapeHTML(item.label) + '</div>' +
        '<p class="medium-card-desc">' + escapeHTML(getMediumDescription(item.id)) + '</p>' +
        '<div class="medium-card-footer">' +
          '<span class="btn btn-primary btn-sm" style="pointer-events:none">Select &rarr;</span>' +
        '</div>';

      grid.appendChild(card);
    });
  }

  renderMediumCards();
})();
