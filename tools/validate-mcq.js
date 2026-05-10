const fs = require("fs");
const path = require("path");

const filePath = process.argv[2];
const allowedReviewStatuses = new Set(["draft", "checked", "published", "rejected"]);
const errors = [];
const warnings = [];

function addError(location, message) {
  errors.push(location + ": " + message);
}

function addWarning(location, message) {
  warnings.push(location + ": " + message);
}

function readJSON(resolvedPath) {
  if (!fs.existsSync(resolvedPath)) {
    addError(resolvedPath, "File does not exist.");
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(resolvedPath, "utf8"));
  } catch (error) {
    addError(resolvedPath, "Invalid JSON: " + error.message);
    return null;
  }
}

function getQuestions(data, location) {
  if (Array.isArray(data)) {
    return data;
  }

  if (!data || typeof data !== "object") {
    addError(location, "MCQ file must be an object with questions array or a raw array.");
    return [];
  }

  if (!Array.isArray(data.questions)) {
    addError(location, "questions must be an array.");
    return [];
  }

  return data.questions;
}

function validateQuestion(question, index, seenIds, location) {
  const label = location + " > question[" + index + "]";

  if (!question || typeof question !== "object" || Array.isArray(question)) {
    addError(label, "Question must be an object.");
    return;
  }

  if (!question.id || typeof question.id !== "string") {
    addError(label, "Missing or invalid id.");
  } else if (seenIds.has(question.id)) {
    addError(label, "Duplicate id: " + question.id + ".");
  } else {
    seenIds.add(question.id);
  }

  if (typeof question.answer === "string" && typeof question.correct !== "number") {
    addError(label, "Answer is stored as text. Use correct as a zero-based option index.");
  }

  if (typeof question.question !== "string" || !question.question.trim()) {
    addError(label, "Question text must not be empty.");
  }

  if (!Array.isArray(question.options)) {
    addError(label, "options must be an array.");
  } else if (question.options.length !== 4) {
    addError(label, "options must contain exactly 4 items.");
  } else {
    question.options.forEach(function (option, optionIndex) {
      if (typeof option !== "string" || !option.trim()) {
        addError(label, "options[" + optionIndex + "] must be a non-empty string.");
      }
    });
  }

  if (!Number.isInteger(question.correct) || question.correct < 0 || question.correct > 3) {
    addError(label, "correct must be a number from 0 to 3.");
  }

  if (typeof question.explanation !== "string" || !question.explanation.trim()) {
    addError(label, "explanation must not be empty.");
  }

  if (question.reviewStatus && !allowedReviewStatuses.has(question.reviewStatus)) {
    addError(label, "Invalid reviewStatus: " + question.reviewStatus + ".");
  }

  if (!question.legacyId) {
    addWarning(label, "legacyId is missing.");
  }

  if (!question.difficulty) {
    addWarning(label, "difficulty is missing.");
  }

  if (!question.type) {
    addWarning(label, "type is missing.");
  }

  if (question.questionNp === undefined || question.questionNp === null) {
    addWarning(label, "questionNp is missing.");
  }
}

function printSummary(resolvedPath, count) {
  console.log("SEE2083 MCQ Validation");
  console.log("File: " + resolvedPath);
  console.log("Questions checked: " + count);

  if (warnings.length) {
    console.log("");
    console.log("Warnings:");
    warnings.forEach(function (warning) {
      console.log("- " + warning);
    });
  }

  if (errors.length) {
    console.log("");
    console.log("Errors:");
    errors.forEach(function (error) {
      console.log("- " + error);
    });
  }

  console.log("");
  console.log("Errors: " + errors.length);
  console.log("Warnings: " + warnings.length);

  if (errors.length) {
    process.exit(1);
  }

  console.log("MCQ validation passed.");
}

if (!filePath) {
  addError("tools/validate-mcq.js", "Usage: node tools/validate-mcq.js path/to/mcq.json");
  printSummary("", 0);
}

const resolvedPath = path.resolve(process.cwd(), filePath);
const data = readJSON(resolvedPath);
const questions = data ? getQuestions(data, resolvedPath) : [];
const seenIds = new Set();

questions.forEach(function (question, index) {
  validateQuestion(question, index, seenIds, resolvedPath);
});

printSummary(resolvedPath, questions.length);
