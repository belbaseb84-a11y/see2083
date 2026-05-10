/* ===================================================
   see2083 - Medium-aware content language
   v1 keeps global UI mostly English.
   =================================================== */

const Lang = (() => {
  const KEY = "s2083_lang";
  let current = "en";

  function getMediumLanguage() {
    let medium = "";

    try {
      medium = new URLSearchParams(window.location.search).get("medium") || "";
    } catch (error) {
      medium = "";
    }

    return medium === "nepali" ? "np" : "en";
  }

  function apply(lang) {
    current = lang;
    localStorage.setItem(KEY, lang);
    document.documentElement.setAttribute("lang", lang === "np" ? "ne" : "en");
    document.body.classList.toggle("lang-np", lang === "np");

    document.querySelectorAll("[data-lang-toggle]").forEach(btn => {
      btn.textContent = "Medium";
      btn.setAttribute("title", "Choose medium");
      btn.setAttribute("aria-label", "Choose medium");
    });
  }

  function toggle() {
    window.location.href = "medium.html";
  }

  function t(key) {
    const labels = S2083.labels["en"] || {};
    return labels[key] || key;
  }

  // Return display string for an object with name/nameNp
  function display(obj, enKey = "name", npKey = "nameNp") {
    if (current === "np" && obj[npKey]) return obj[npKey];
    return obj[enKey] || obj[npKey] || "";
  }

  function init() {
    apply(getMediumLanguage());
  }

  return { init, toggle, t, display, current: () => current };
})();
