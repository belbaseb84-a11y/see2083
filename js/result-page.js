/* ===================================================
   see2083 - Result Page Logic
   Shows mock / quiz result and answer review
   =================================================== */

(function () {
  if (typeof pageInit === "function") {
    pageInit("subjects");
  }

  const lang = getCurrentLanguage();
  const isNp = lang === "np";

  const labels = {
    home: isNp ? "गृहपृष्ठ" : "Home",
    result: isNp ? "नतिजा" : "Result",
    noResult: isNp ? "कुनै परिणाम भेटिएन" : "No result found",
    noResultSub: isNp ? "पहिले मोक टेस्ट वा MCQ अभ्यास दिनुहोस्।" : "Please take a mock test or MCQ practice first.",
    takeTest: isNp ? "मोक टेस्ट दिनुहोस्" : "Take Test",
    practiceMcq: isNp ? "MCQ अभ्यास" : "Practice MCQs",
    homeBtn: isNp ? "गृहपृष्ठ" : "Home",
    yourResult: isNp ? "तपाईंको परिणाम" : "Your Result",
    excellent: isNp ? "उत्कृष्ट!" : "Excellent!",
    good: isNp ? "राम्रो काम!" : "Good job!",
    practiceMore: isNp ? "अझ अभ्यास गर्नुहोस्!" : "Keep practicing!",
    dontGiveUp: isNp ? "हार नमान्नुहोस्!" : "Do not give up!",
    score: isNp ? "अङ्क" : "Score",
    correct: isNp ? "सही" : "Correct",
    wrong: isNp ? "गलत" : "Wrong",
    total: isNp ? "जम्मा" : "Total",
    timeTaken: isNp ? "लिएको समय" : "Time taken",
    timeUp: isNp ? "समय समाप्त" : "Time is up",
    reviewAnswers: isNp ? "उत्तर समीक्षा" : "Review Answers",
    tryAgain: isNp ? "फेरि प्रयास" : "Try Again",
    backToChapter: isNp ? "अध्यायमा फर्कनुहोस्" : "Back to Chapter",
    chooseChapter: isNp ? "अध्याय छान्नुहोस्" : "Choose Chapter",
    answerReview: isNp ? "उत्तर समीक्षा" : "Answer Review",
    reviewUnavailable: isNp ? "समीक्षा उपलब्ध छैन।" : "Review is not available for this result.",
    question: isNp ? "प्रश्न" : "Question",
    yourAnswer: isNp ? "तपाईंको उत्तर" : "Your answer",
    correctAnswer: isNp ? "सही उत्तर" : "Correct answer",
    notAnswered: isNp ? "उत्तर दिइएन" : "Not answered",
    unanswered: isNp ? "उत्तर नदिएको" : "Unanswered",
    explanation: isNp ? "व्याख्या" : "Explanation",
    all: isNp ? "सबै" : "All",
    wrongOnly: isNp ? "गलत मात्र" : "Wrong only",
    noQuestionsInFilter: isNp ? "यो फिल्टरमा कुनै प्रश्न छैन।" : "No questions in this filter.",
    showExplanation: isNp ? "व्याख्या देखाउनुहोस्" : "Show explanation",
    hideExplanation: isNp ? "व्याख्या लुकाउनुहोस्" : "Hide explanation",
    mode: isNp ? "मोड" : "Mode",
    mock: isNp ? "मोक टेस्ट" : "Mock test",
    practice: isNp ? "MCQ अभ्यास" : "MCQ practice",
    motivationHigh: isNp ? "राम्रो काम। अब नियमित पुनरावृत्ति गर्दै जानुहोस्।" : "Great work. Keep revising to stay sharp.",
    motivationMid: isNp ? "राम्रो प्रयास। गलत उत्तरहरू समीक्षा गरेर फेरि प्रयास गर्नुहोस्।" : "Good effort. Review the wrong answers and try again.",
    motivationLow: isNp ? "हरेक गलत उत्तरले सुधार गर्ने ठाउँ देखाउँछ। समीक्षा गरेर फेरि प्रयास गर्नुहोस्।" : "Every wrong answer shows what to improve. Review and try again."
  };

  const resultArea = document.getElementById("result-area");
  const reviewArea = document.getElementById("review-area");

  function parseStoredResult(key) {
    try {
      const value = sessionStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      return null;
    }
  }

  function getCompletedAt(resultData) {
    const completedAt = resultData ? Number(resultData.completedAt) : NaN;
    return Number.isFinite(completedAt) && completedAt > 0 ? completedAt : null;
  }

  function getStoredResult() {
    const mockResult = parseStoredResult("s2083_mock_result");
    const quizResult = parseStoredResult("s2083_quiz_result");

    if (mockResult && quizResult) {
      const mockCompletedAt = getCompletedAt(mockResult);
      const quizCompletedAt = getCompletedAt(quizResult);

      if (mockCompletedAt && quizCompletedAt) {
        return quizCompletedAt >= mockCompletedAt ? quizResult : mockResult;
      }

      if (quizCompletedAt && !mockCompletedAt) {
        return quizResult;
      }

      return mockResult;
    }

    return mockResult || quizResult || null;
  }

  const result = getStoredResult();
  let activeReviewFilter = "all";

  function getGradeData(pct) {
    if (pct >= 80) {
      return { icon: "🏆", message: labels.excellent, className: "excellent" };
    }

    if (pct >= 50) {
      return { icon: "👍", message: labels.good, className: "good" };
    }

    return { icon: "💪", message: labels.practiceMore, className: "low" };
  }

  function getMotivation(pct) {
    if (pct >= 80) return labels.motivationHigh;
    if (pct >= 50) return labels.motivationMid;
    return labels.motivationLow;
  }

  function getScoreGuidance(pct) {
    if (pct >= 80) {
      return isNp ? "नियमित पुनरावृत्ति गरेर आफ्नो तयारी बलियो राख्नुहोस्।" : "Keep revising to stay sharp.";
    }

    if (pct >= 50) {
      return isNp ? "गलत उत्तरहरू समीक्षा गरेर फेरि प्रयास गर्नुहोस्।" : "Review the wrong answers, then try again.";
    }

    return isNp ? "व्याख्या समीक्षा गरेर फेरि प्रयास गर्नुहोस्।" : "Review the explanations, then try again.";
  }

  function getMotivationContext(pct) {
    if (pct >= 80) return "result-high";
    if (pct >= 50) return "result-medium";
    return "result-low";
  }

  function renderResultMotivation(pct) {
    if (
      window.SEE2083Motivation &&
      typeof SEE2083Motivation.renderQuote === "function"
    ) {
      SEE2083Motivation.renderQuote("#result-motivation", getMotivationContext(pct));
    }
  }

  function getResultMode(resultData) {
    if (!resultData || !resultData.mode) return labels.mock;
    return resultData.mode === "practice" ? labels.practice : labels.mock;
  }

  function hasDetailedReview(resultData) {
    return Boolean(
      resultData &&
      Array.isArray(resultData.questions) &&
      resultData.questions.length
    );
  }

  function getAnswers(resultData) {
    if (!resultData) return {};

    if (resultData.answers && typeof resultData.answers === "object") {
      return resultData.answers;
    }

    if (resultData.selectedAnswers && typeof resultData.selectedAnswers === "object") {
      return resultData.selectedAnswers;
    }

    return {};
  }

  function getAnswerForQuestion(answers, question, index) {
    if (!answers || typeof answers !== "object") return undefined;
    if (answers[index] !== undefined) return answers[index];
    if (String(index) in answers) return answers[String(index)];
    if (question && question.id && answers[question.id] !== undefined) return answers[question.id];
    return undefined;
  }

  function getLocalizedQuestionText(question) {
    if (!question) return "";
    return isNp && question.questionNp ? question.questionNp : question.question || "";
  }

  function getLocalizedOptions(question) {
    if (!question) return [];
    if (isNp && Array.isArray(question.optionsNp) && question.optionsNp.length) {
      return question.optionsNp;
    }

    return safeArray(question.options);
  }

  function getLocalizedExplanation(question) {
    if (!question) return "";
    return isNp && question.explanationNp ? question.explanationNp : question.explanation || "";
  }

  function buildReviewItems(resultData) {
    const questions = Array.isArray(resultData && resultData.questions) ? resultData.questions : [];
    const answers = getAnswers(resultData);

    return questions.map(function (question, index) {
      const options = getLocalizedOptions(question);
      const correct = Number(question && question.correct);
      const chosenRaw = getAnswerForQuestion(answers, question, index);
      const chosen = chosenRaw === undefined || chosenRaw === null || chosenRaw === "" ? -1 : Number(chosenRaw);
      const hasValidCorrect = Number.isFinite(correct) && correct >= 0 && correct < options.length;
      const isAnswered = Number.isFinite(chosen) && chosen >= 0 && chosen < options.length;
      const isCorrect = isAnswered && hasValidCorrect && chosen === correct;
      const status = !isAnswered ? "unanswered" : isCorrect ? "correct" : "wrong";

      return {
        question: question || {},
        index: index,
        options: options,
        correct: correct,
        chosen: chosen,
        isAnswered: isAnswered,
        isCorrect: isCorrect,
        status: status,
        questionText: getLocalizedQuestionText(question),
        chosenText: isAnswered ? options[chosen] : labels.notAnswered,
        correctText: hasValidCorrect ? options[correct] : "",
        explanation: getLocalizedExplanation(question)
      };
    });
  }

  function getFilteredReviewItems(items) {
    if (activeReviewFilter === "wrong") {
      return items.filter(function (item) {
        return item.status === "wrong";
      });
    }

    if (activeReviewFilter === "unanswered") {
      return items.filter(function (item) {
        return item.status === "unanswered";
      });
    }

    return items;
  }

  function getResultCounts(resultData) {
    const reviewItems = buildReviewItems(resultData);
    const reviewTotal = reviewItems.length;
    const total = Math.max(0, toSafeNumber(
      (resultData && (resultData.totalQuestions || resultData.total)) || reviewTotal
    ));
    const reviewCorrect = reviewItems.filter(function (item) { return item.status === "correct"; }).length;
    const reviewWrong = reviewItems.filter(function (item) { return item.status === "wrong"; }).length;
    const reviewUnanswered = reviewItems.filter(function (item) { return item.status === "unanswered"; }).length;
    const correct = Math.max(0, toSafeNumber(
      resultData && (resultData.correctAnswers !== undefined ? resultData.correctAnswers : resultData.score)
    ) || reviewCorrect);
    const unanswered = Math.max(0, toSafeNumber(
      resultData && resultData.unansweredAnswers !== undefined ? resultData.unansweredAnswers : reviewUnanswered
    ));
    const wrongFromResult = resultData && resultData.wrongAnswers !== undefined
      ? toSafeNumber(resultData.wrongAnswers)
      : reviewItems.length
        ? reviewWrong
        : Math.max(total - correct - unanswered, 0);

    return {
      score: correct,
      correct: correct,
      wrong: Math.max(0, wrongFromResult),
      unanswered: unanswered,
      total: total
    };
  }

  function normalizeTimeTaken(value) {
    if (!value) return "-";

    const textValue = String(value);

    if (textValue === "—" || textValue.indexOf("â") !== -1 || textValue.indexOf("Ã") !== -1) {
      return "-";
    }

    return textValue;
  }

  function toSafeNumber(value) {
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : 0;
  }

  function getResultPercent(resultData, score, total) {
    const pctValue = Number(resultData && resultData.pct);

    if (Number.isFinite(pctValue)) {
      return Math.max(0, Math.min(100, Math.round(pctValue)));
    }

    if (total > 0) {
      return Math.max(0, Math.min(100, Math.round((score / total) * 100)));
    }

    return 0;
  }

  function getTryAgainUrl(resultData) {
    if (resultData && resultData.quizUrl) {
      return resultData.quizUrl;
    }

    if (resultData && resultData.mockUrl) {
      return resultData.mockUrl;
    }

    return resultData && resultData.mode === "practice" ? "quiz.html" : "mock-test.html";
  }

  function getChapterUrl(resultData) {
    if (!resultData) return "";
    if (resultData.chapterUrl) return resultData.chapterUrl;

    if (resultData.subject && resultData.chapter) {
      const medium = resultData.medium || "english";
      return "chapter.html?subject=" + encodeURIComponent(resultData.subject) +
        "&chapter=" + encodeURIComponent(resultData.chapter) +
        "&medium=" + encodeURIComponent(medium);
    }

    return "";
  }

  function getChapterAction(resultData) {
    const chapterUrl = getChapterUrl(resultData);

    if (chapterUrl) {
      return {
        href: chapterUrl,
        label: labels.backToChapter
      };
    }

    if (resultData && resultData.subject) {
      return {
        href: "chapters.html?subject=" + encodeURIComponent(resultData.subject) +
          "&medium=" + encodeURIComponent(resultData.medium || "english"),
        label: labels.chooseChapter
      };
    }

    return null;
  }

  function renderBreadcrumbs() {
    renderBreadcrumb(document.getElementById("breadcrumb"), [
      { label: labels.home, href: "index.html" },
      { label: labels.result }
    ]);
  }

  function renderNoResult() {
    if (!resultArea) return;

    document.title = labels.noResult + " - SEE 2083";

    resultArea.innerHTML =
      '<div class="result-empty-card">' +
        '<div class="empty-state">' +
          '<div class="empty-icon">✓</div>' +
          '<h2>' + escapeHTML(labels.noResult) + '</h2>' +
          '<p>' + escapeHTML(labels.noResultSub) + '</p>' +
          '<div class="result-action-row center">' +
            '<a href="mock-test.html" class="btn btn-primary">' +
              escapeHTML(labels.takeTest) +
            '</a>' +
            '<a href="quiz.html" class="btn btn-outline">' +
              escapeHTML(labels.practiceMcq) +
            '</a>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  function renderReviewUnavailable() {
    if (!reviewArea) return;

    reviewArea.style.display = "block";
    reviewArea.innerHTML =
      '<div class="result-review-head">' +
        '<h2>' + escapeHTML(labels.answerReview) + '</h2>' +
        '<p>' + escapeHTML(labels.reviewUnavailable) + '</p>' +
      '</div>';
  }

  function renderResultSummary(resultData) {
    if (!resultArea) return;

    const counts = getResultCounts(resultData);
    const score = counts.score;
    const total = counts.total;
    const pct = getResultPercent(resultData, score, total);
    const wrong = counts.wrong;
    const unanswered = counts.unanswered;
    const timeTaken = normalizeTimeTaken(resultData.timeTaken);
    const timeUp = Boolean(resultData.timeUp);
    const grade = getGradeData(pct);
    const hasReview = hasDetailedReview(resultData);
    const tryAgainUrl = getTryAgainUrl(resultData);
    const chapterAction = getChapterAction(resultData);

    document.title = labels.yourResult + " - SEE 2083";

    resultArea.innerHTML =
      '<div class="result-hero-card result-' + escapeHTML(grade.className) + '">' +
        '<div class="result-hero-main">' +
          '<div class="result-icon">' + escapeHTML(grade.icon) + '</div>' +
          '<div>' +
            '<div class="result-kicker">' + escapeHTML(getResultMode(resultData)) + '</div>' +
            '<h1>' + escapeHTML(labels.yourResult) + '</h1>' +
            '<p>' + escapeHTML(grade.message) + '</p>' +
          '</div>' +
        '</div>' +

        '<div class="result-score-box">' +
          '<div class="result-score-ring">' +
            '<span class="score-num">' + escapeHTML(String(pct)) + '%</span>' +
            '<span class="score-label">' + escapeHTML(labels.score) + '</span>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<div id="result-motivation">' +
        '<div class="content-notice">' + escapeHTML(getMotivation(pct)) + '</div>' +
      '</div>' +
      '<div class="content-notice">' + escapeHTML(getScoreGuidance(pct)) + '</div>' +

      (timeUp
        ? '<div class="result-alert">' + escapeHTML(labels.timeUp) + '</div>'
        : '') +

      '<div class="result-stats-grid">' +
        '<div class="result-stat">' +
          '<span>' + escapeHTML(labels.correct) + '</span>' +
          '<strong class="success">' + escapeHTML(String(score)) + '</strong>' +
        '</div>' +

        '<div class="result-stat">' +
          '<span>' + escapeHTML(labels.wrong) + '</span>' +
          '<strong class="error">' + escapeHTML(String(wrong)) + '</strong>' +
        '</div>' +

        '<div class="result-stat">' +
          '<span>' + escapeHTML(labels.unanswered) + '</span>' +
          '<strong class="neutral">' + escapeHTML(String(unanswered)) + '</strong>' +
        '</div>' +

        '<div class="result-stat">' +
          '<span>' + escapeHTML(labels.total) + '</span>' +
          '<strong>' + escapeHTML(String(total)) + '</strong>' +
        '</div>' +

        '<div class="result-stat">' +
          '<span>' + escapeHTML(labels.timeTaken) + '</span>' +
          '<strong>' + escapeHTML(timeTaken) + '</strong>' +
        '</div>' +
      '</div>' +

      '<div class="result-action-row">' +
        (hasReview
          ? '<button class="btn btn-primary" type="button" id="review-btn">' +
              escapeHTML(labels.reviewAnswers) +
            '</button>'
          : '') +
        '<a href="' + escapeHTML(tryAgainUrl) + '" class="btn btn-outline">' +
          escapeHTML(labels.tryAgain) +
        '</a>' +
        (chapterAction
          ? '<a href="' + escapeHTML(chapterAction.href) + '" class="btn btn-outline">' +
              escapeHTML(chapterAction.label) +
            '</a>'
          : '') +
        '<a href="index.html" class="btn btn-ghost">' +
          escapeHTML(labels.homeBtn) +
        '</a>' +
      '</div>';

    const reviewBtn = document.getElementById("review-btn");
    if (reviewBtn) {
      reviewBtn.addEventListener("click", function () {
        renderReview(resultData, true);
      });
    }

    renderResultMotivation(pct);

    if (hasReview) {
      renderReview(resultData, false);
    } else {
      renderReviewUnavailable();
    }
  }

  function renderReview(resultData, shouldScroll) {
    if (!reviewArea) return;

    const reviewItems = buildReviewItems(resultData);
    const filteredItems = getFilteredReviewItems(reviewItems);
    const letters = ["A", "B", "C", "D"];

    reviewArea.style.display = "block";

    if (!reviewItems.length) {
      reviewArea.innerHTML =
        '<div class="result-review-head">' +
          '<h2>' + escapeHTML(labels.answerReview) + '</h2>' +
          '<p>' + escapeHTML(labels.reviewUnavailable) + '</p>' +
        '</div>';
      return;
    }

    reviewArea.innerHTML =
      '<div class="result-review-head">' +
        '<div class="result-kicker">' + escapeHTML(labels.reviewAnswers) + '</div>' +
        '<h2>' + escapeHTML(labels.answerReview) + '</h2>' +
        '<p>' + escapeHTML(String(filteredItems.length)) + ' / ' +
          escapeHTML(String(reviewItems.length)) + ' ' + escapeHTML(labels.question) + '</p>' +
      '</div>' +

      '<div class="result-review-toolbar">' +
        '<div class="result-review-filters" role="group" aria-label="' + escapeHTML(labels.answerReview) + '">' +
          renderReviewFilterButton("all", labels.all, reviewItems.length) +
          renderReviewFilterButton("wrong", labels.wrongOnly, reviewItems.filter(function (item) { return item.status === "wrong"; }).length) +
          renderReviewFilterButton("unanswered", labels.unanswered, reviewItems.filter(function (item) { return item.status === "unanswered"; }).length) +
        '</div>' +
      '</div>' +

      '<div class="result-review-list">' +
        (filteredItems.length
          ? filteredItems.map(function (item) {
              return renderReviewCard(item, letters);
            }).join("")
          : '<div class="result-review-empty">' +
              '<p>' + escapeHTML(labels.noQuestionsInFilter) + '</p>' +
            '</div>') +
      '</div>';

    bindReviewControls(resultData);

    if (shouldScroll !== false) {
      reviewArea.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function renderReviewFilterButton(filter, label, count) {
    return (
      '<button class="result-review-filter' + (activeReviewFilter === filter ? " active" : "") + '"' +
        ' type="button"' +
        ' data-review-filter="' + escapeHTML(filter) + '"' +
        ' aria-pressed="' + (activeReviewFilter === filter ? "true" : "false") + '">' +
        '<span>' + escapeHTML(label) + '</span>' +
        '<strong>' + escapeHTML(String(count)) + '</strong>' +
      '</button>'
    );
  }

  function getStatusLabel(status) {
    if (status === "correct") return labels.correct;
    if (status === "wrong") return labels.wrong;
    return labels.unanswered;
  }

  function getStatusBadgeClass(status) {
    if (status === "correct") return "badge-green";
    if (status === "wrong") return "badge-red";
    return "badge-gray";
  }

  function renderReviewCard(item, letters) {
    const explanationId = "result-explanation-" + item.index;
    const answerClass = item.status === "correct" ? "success" : item.status === "wrong" ? "error" : "neutral";

    return (
      '<article class="result-review-card result-review-' + escapeHTML(item.status) + '">' +
        '<div class="result-review-card-head">' +
          '<span class="badge ' + getStatusBadgeClass(item.status) + '">' +
            escapeHTML(getStatusLabel(item.status)) +
          '</span>' +
          '<span>' + escapeHTML(labels.question) + ' ' + escapeHTML(String(item.index + 1)) + '</span>' +
        '</div>' +

        '<h3>' + escapeHTML(item.questionText) + '</h3>' +

        '<div class="result-answer-summary">' +
          '<div>' +
            '<span>' + escapeHTML(labels.yourAnswer) + '</span>' +
            '<strong class="' + answerClass + '">' +
              escapeHTML(item.chosenText) +
            '</strong>' +
          '</div>' +
          '<div>' +
            '<span>' + escapeHTML(labels.correctAnswer) + '</span>' +
            '<strong class="success">' + escapeHTML(item.correctText) + '</strong>' +
          '</div>' +
        '</div>' +

        '<div class="result-option-list">' +
          item.options.map(function (option, optionIndex) {
            let optionClass = "";

            if (optionIndex === item.correct) {
              optionClass = " correct";
            } else if (optionIndex === item.chosen && item.status === "wrong") {
              optionClass = " wrong";
            }

            return (
              '<div class="result-option' + optionClass + '">' +
                '<span>' + escapeHTML(letters[optionIndex] || "") + '</span>' +
                '<p>' + escapeHTML(option) + '</p>' +
              '</div>'
            );
          }).join("") +
        '</div>' +

        (item.explanation
          ? '<div class="result-explanation-block">' +
              '<button class="result-explanation-toggle" type="button"' +
                ' data-explanation-toggle="' + escapeHTML(String(item.index)) + '"' +
                ' aria-expanded="false"' +
                ' aria-controls="' + escapeHTML(explanationId) + '">' +
                escapeHTML(labels.showExplanation) +
              '</button>' +
              '<div class="result-explanation" id="' + escapeHTML(explanationId) + '" hidden>' +
                '<strong>' + escapeHTML(labels.explanation) + ':</strong> ' +
                escapeHTML(item.explanation) +
              '</div>' +
            '</div>'
          : '') +
      '</article>'
    );
  }

  function bindReviewControls(resultData) {
    reviewArea.querySelectorAll("[data-review-filter]").forEach(function (button) {
      button.addEventListener("click", function () {
        activeReviewFilter = button.getAttribute("data-review-filter") || "all";
        renderReview(resultData, false);
      });
    });

    reviewArea.querySelectorAll("[data-explanation-toggle]").forEach(function (button) {
      button.addEventListener("click", function () {
        const targetId = button.getAttribute("aria-controls");
        const target = targetId ? document.getElementById(targetId) : null;
        if (!target) return;

        const isHidden = target.hasAttribute("hidden");

        if (isHidden) {
          target.removeAttribute("hidden");
          button.setAttribute("aria-expanded", "true");
          button.textContent = labels.hideExplanation;
        } else {
          target.setAttribute("hidden", "");
          button.setAttribute("aria-expanded", "false");
          button.textContent = labels.showExplanation;
        }
      });
    });
  }

  function initPage() {
    renderBreadcrumbs();

    if (!result) {
      renderNoResult();
      return;
    }

    renderResultSummary(result);
  }

  initPage();
})();
