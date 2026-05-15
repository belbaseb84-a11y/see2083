/* ===================================================
   see2083 - MCQ Practice Quiz
   =================================================== */

const Quiz = (() => {
  let questions = [];
  let currentIdx = 0;
  let userAnswers = {};
  let lang = "en";

  function text(en, np) {
    return lang === "np" ? np : en;
  }

  function isExactChapterPractice() {
    const routeContext = getQuizRouteContext();
    return Boolean(routeContext.subject && routeContext.chapter);
  }

  function init(qs, language) {
    questions = Array.isArray(qs) ? qs : [];
    lang = language || "en";
    currentIdx = 0;
    userAnswers = {};
    renderQuestion();
  }

  function getQuestionById(qId) {
    return questions.find(function (q) {
      return q.id === qId;
    }) || null;
  }

  function renderQuestion() {
    const q = questions[currentIdx];
    if (!q) return;

    const container = document.getElementById("quiz-container");
    if (!container) return;

    const total = questions.length;
    const progress = total ? (currentIdx / total) * 100 : 0;
    const answered = userAnswers[currentIdx];
    const hasAnswered = answered !== undefined;
    const letters = ["A", "B", "C", "D"];
    const actionClass = "quiz-nav quiz-action-bar" + (hasAnswered ? " quiz-action-ready" : "");
    const showEarlyFinish = isExactChapterPractice() && currentIdx < total - 1;

    container.classList.toggle("quiz-has-answer", hasAnswered);
    container.classList.toggle("quiz-last-question", currentIdx >= total - 1);

    container.innerHTML = `
      <div class="quiz-header">
        <span class="quiz-q-num">${text("Question", "प्रश्न")} ${currentIdx + 1} ${text("of", "को")} ${total}</span>
        <button class="bookmark-btn" id="q-bookmark-btn" onclick="toggleQuestionBookmark('${q.id}')">
          ${Bookmarks.isBookmarked("mcq-" + q.id) ? text("Saved", "सुरक्षित") : text("Save Question", "प्रश्न सुरक्षित गर्नुहोस्")}
        </button>
      </div>
      <div class="progress-bar" style="margin-bottom:20px">
        <div class="progress-fill" style="width:${progress}%"></div>
      </div>
      <p class="quiz-question">${escapeHTML(q.question || "")}</p>
      <div class="quiz-options">
        ${safeArray(q.options).map((opt, i) => {
          let cls = "mcq-option";
          let disabled = "";
          if (hasAnswered) {
            disabled = "disabled";
            if (i === q.correct) cls += " correct";
            else if (i === answered && i !== q.correct) cls += " selected-wrong";
          }
          return `<button class="${cls}" ${disabled} onclick="Quiz.selectAnswer(${i})" aria-label="Option ${letters[i]}">
            <span class="mcq-letter">${letters[i]}</span>
            <span>${escapeHTML(opt)}</span>
          </button>`;
        }).join("")}
      </div>
      ${hasAnswered ? renderFeedback(q, answered) : ""}
      <div class="${actionClass}">
        <button class="btn btn-ghost btn-sm" onclick="Quiz.prev()" ${currentIdx === 0 ? "disabled" : ""}>
          &larr; ${text("Previous", "अघिल्लो")}
        </button>
        <span class="quiz-answered-count">${Object.keys(userAnswers).length}/${total} ${text("answered", "उत्तर दिइयो")}</span>
        ${currentIdx < total - 1
          ? `<button class="btn btn-primary btn-sm quiz-next-btn" onclick="Quiz.next()">${text("Next Question", "अर्को प्रश्न")} &rarr;</button>
            ${showEarlyFinish ? `<button class="btn btn-outline btn-sm quiz-finish-btn" onclick="Quiz.finish()">${text("Finish Practice", "Finish Practice")}</button>` : ""}`
          : `<button class="btn btn-accent btn-sm quiz-finish-btn" onclick="Quiz.finish()">${text("Finish Quiz", "क्विज समाप्त")}</button>`
        }
      </div>
    `;
  }

  function renderFeedback(q, chosen) {
    const isCorrect = chosen === q.correct;
    return `<div class="mcq-feedback ${isCorrect ? "correct-fb" : "wrong-fb"}">
      <strong>${isCorrect ? "✓ " + text("Correct!", "सही!") : "✕ " + text("Wrong", "गलत")}</strong>
      ${escapeHTML(q.explanation || "")}
    </div>`;
  }

  function selectAnswer(idx) {
    if (userAnswers[currentIdx] !== undefined) return;
    userAnswers[currentIdx] = idx;
    renderQuestion();
  }

  function next() {
    if (currentIdx < questions.length - 1) {
      currentIdx++;
      renderQuestion();
    }
  }

  function prev() {
    if (currentIdx > 0) {
      currentIdx--;
      renderQuestion();
    }
  }

  function getQuizRouteContext() {
    const medium = typeof getParam === "function"
      ? (getParam("medium") || (typeof getMedium === "function" ? getMedium() : "english") || "english")
      : "english";
    const subjectParam = typeof getParam === "function" ? (getParam("subject") || "") : "";
    const chapterParam = typeof getParam === "function" ? (getParam("chapter") || "") : "";
    const subject = subjectParam && subjectParam !== "all" ? subjectParam : "";
    const chapter = chapterParam || "";
    const currentPath = window.location && window.location.pathname
      ? (window.location.pathname.split("/").pop() || "quiz.html")
      : "quiz.html";
    const currentSearch = window.location && window.location.search ? window.location.search : "";
    const quizUrl = currentPath + currentSearch;
    const chapterUrl = subject && chapter
      ? "chapter.html?subject=" + encodeURIComponent(subject) +
        "&chapter=" + encodeURIComponent(chapter) +
        "&medium=" + encodeURIComponent(medium)
      : "";

    return {
      medium,
      subject,
      chapter,
      chapterUrl,
      quizUrl
    };
  }

  function finish() {
    const total = questions.length;
    const unanswered = total - Object.keys(userAnswers).length;

    if (
      unanswered > 0 &&
      typeof window !== "undefined" &&
      typeof window.confirm === "function" &&
      !window.confirm(text("You still have unanswered questions. Finish anyway?", "You still have unanswered questions. Finish anyway?"))
    ) {
      return;
    }

    const correct = Object.entries(userAnswers).filter(([i, a]) => a === questions[i].correct).length;
    const pct = Math.round((correct / total) * 100);
    const routeContext = getQuizRouteContext();
    const result = {
      score: correct,
      total,
      pct,
      timeTaken: "-",
      mode: "practice",
      resultType: "quiz",
      completedAt: Date.now(),
      medium: routeContext.medium,
      subject: routeContext.subject,
      chapter: routeContext.chapter,
      chapterUrl: routeContext.chapterUrl,
      quizUrl: routeContext.quizUrl,
      answers: Object.assign({}, userAnswers),
      questions: questions.map(q => ({
        id: q.id || "",
        legacyId: q.legacyId || "",
        subject: q.subject || "",
        chapter: q.chapter || "",
        question: q.question || "",
        questionNp: q.questionNp || "",
        options: Array.isArray(q.options) ? q.options : [],
        optionsNp: Array.isArray(q.optionsNp) ? q.optionsNp : [],
        correct: q.correct,
        explanation: q.explanation || "",
        explanationNp: q.explanationNp || "",
        difficulty: q.difficulty || "",
        type: q.type || ""
      }))
    };

    sessionStorage.removeItem("s2083_mock_result");
    sessionStorage.setItem("s2083_quiz_result", JSON.stringify(result));

    const container = document.getElementById("quiz-container");
    if (container) {
      container.innerHTML = `
        <div style="text-align:center;padding:var(--sp-8)">
          <div class="result-score-ring" style="margin-bottom:var(--sp-6)">
            <span class="score-num">${pct}%</span>
            <span class="score-label">${text("Score", "अङ्क")}</span>
          </div>
          <h2 style="margin-bottom:var(--sp-2)">${pct >= 60 ? text("Well done!", "शाबास!") : text("Keep practicing!", "फेरि अभ्यास गर्नुहोस्!")}</h2>
          <p style="margin-bottom:var(--sp-6)">${text("Correct", "सही")}: ${correct} / ${total}</p>
          <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
            <button class="btn btn-outline" onclick="location.reload()">${text("Try Again", "फेरि प्रयास")}</button>
            <a href="index.html" class="btn btn-primary">${text("Home", "गृहपृष्ठ")}</a>
          </div>
        </div>
      `;
    }

    if (typeof window !== "undefined" && window.location) {
      window.location.href = "result.html";
    }
  }

  return { init, selectAnswer, next, prev, finish, getQuestionById };
})();

function toggleQuestionBookmark(qId) {
  const currentQuestion = typeof Quiz !== "undefined" && typeof Quiz.getQuestionById === "function"
    ? Quiz.getQuestionById(qId)
    : null;
  const fallbackQuestion = typeof S2083 !== "undefined" && Array.isArray(S2083.sampleMCQs)
    ? S2083.sampleMCQs.find(function (x) { return x.id === qId; })
    : null;
  const q = currentQuestion || fallbackQuestion;

  if (!q) return;

  const medium = typeof getMedium === "function" ? getMedium() : "english";
  const added = Bookmarks.toggle({
    id: "mcq-" + qId,
    type: "mcq",
    title: q.question,
    url: "quiz.html?subject=" + encodeURIComponent(q.subject || "") +
      "&chapter=" + encodeURIComponent(q.chapter || "") +
      "&medium=" + encodeURIComponent(medium)
  });

  showToast(added
    ? (Lang.current() === "np" ? "प्रश्न सुरक्षित भयो" : "Question saved")
    : (Lang.current() === "np" ? "हटाइयो" : "Removed")
  );
}

