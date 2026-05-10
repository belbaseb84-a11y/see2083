/* ===================================================
   see2083 - Motivation Quote System
   =================================================== */

(function () {
  var quoteCache = null;
  var quotePromise = null;
  var lastQuoteKey = "s2083_last_quote_id";

  function getFallbackQuotes() {
    return [
      {
        id: "fallback-1",
        en: "One focused hour of learning can beat many hours of scrolling.",
        np: "एक घण्टाको राम्रो अध्ययनले धेरै समयको स्क्रोलिङलाई जित्न सक्छ।",
        type: "focus"
      },
      {
        id: "fallback-2",
        en: "Every wrong answer shows one thing you can improve.",
        np: "हरेक गलत उत्तरले सुधार गर्नुपर्ने एउटा कुरा देखाउँछ।",
        type: "mistake"
      },
      {
        id: "fallback-3",
        en: "Small revision today becomes confidence in the exam hall.",
        np: "आजको सानो पुनरावृत्तिले परीक्षा हलमा आत्मविश्वास दिन्छ।",
        type: "revision"
      },
      {
        id: "fallback-4",
        en: "Practice makes the exam paper feel familiar.",
        np: "अभ्यासले परीक्षा पत्र परिचित जस्तो बनाउँछ।",
        type: "exam"
      },
      {
        id: "fallback-5",
        en: "Keep learning; every page brings you closer.",
        np: "सिकिरहनुहोस्; हरेक पानाले तपाईंलाई नजिक पुर्याउँछ।",
        type: "consistency"
      }
    ];
  }

  async function loadQuotes() {
    if (quoteCache) return quoteCache;

    if (!quotePromise) {
      quotePromise = fetch("data/motivation-quotes.json")
        .then(function (response) {
          if (!response.ok) return [];
          return response.json();
        })
        .then(function (quotes) {
          quoteCache = Array.isArray(quotes) ? quotes : [];
          return quoteCache;
        })
        .catch(function () {
          quoteCache = [];
          return [];
        });
    }

    return quotePromise;
  }

  function getPreferredTypes(context) {
    if (context === "quiz") return ["focus", "revision", "mistake"];
    if (context === "result-low") return ["mistake", "confidence"];
    if (context === "result-medium") return ["revision", "confidence"];
    if (context === "result-high") return ["confidence", "consistency"];
    if (context === "chapter") return ["focus", "discipline"];
    return [];
  }

  function pickQuote(quotes, context) {
    var pool = Array.isArray(quotes) && quotes.length ? quotes : getFallbackQuotes();
    var preferredTypes = getPreferredTypes(context);
    var preferred = preferredTypes.length
      ? pool.filter(function (quote) {
          return preferredTypes.indexOf(quote.type) !== -1;
        })
      : [];
    var candidates = preferred.length ? preferred : pool;
    var lastId = "";

    try {
      lastId = localStorage.getItem(lastQuoteKey) || "";
    } catch (error) {
      lastId = "";
    }

    if (candidates.length > 1) {
      candidates = candidates.filter(function (quote) {
        return quote.id !== lastId;
      });
    }

    var selected = candidates[Math.floor(Math.random() * candidates.length)] || pool[0] || getFallbackQuotes()[0];

    try {
      localStorage.setItem(lastQuoteKey, selected.id);
    } catch (error) {
      return selected;
    }

    return selected;
  }

  async function getRandomQuote(context) {
    try {
      var quotes = await loadQuotes();
      return pickQuote(quotes, context);
    } catch (error) {
      return pickQuote(getFallbackQuotes(), context);
    }
  }

  function getCurrentLang() {
    if (typeof getCurrentLanguage === "function") {
      return getCurrentLanguage();
    }

    try {
      return localStorage.getItem("s2083_lang") || "en";
    } catch (error) {
      return "en";
    }
  }

  function safeText(value) {
    if (typeof escapeHTML === "function") {
      return escapeHTML(value);
    }

    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  async function renderQuote(targetSelector, context) {
    try {
      var target = document.querySelector(targetSelector);
      if (!target) return;

      var quote = await getRandomQuote(context);
      var lang = getCurrentLang();
      var quoteText = lang === "np" ? (quote.np || quote.en) : (quote.en || quote.np);
      var kicker = lang === "np" ? "अध्ययन प्रेरणा" : "Study Boost";

      target.innerHTML =
        '<div class="motivation-card" data-quote-id="' + safeText(quote.id) + '">' +
          '<div class="motivation-kicker">' + safeText(kicker) + '</div>' +
          '<p class="motivation-text">' + safeText(quoteText) + '</p>' +
        '</div>';
    } catch (error) {
      return;
    }
  }

  window.SEE2083Motivation = {
    loadQuotes: loadQuotes,
    getFallbackQuotes: getFallbackQuotes,
    getRandomQuote: getRandomQuote,
    renderQuote: renderQuote
  };
})();
