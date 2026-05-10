const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");
const indexPath = path.join(projectRoot, "data", "content-index.json");

const allowedMediums = new Set(["english", "nepali", "electrical"]);
const allowedStatuses = new Set(["draft", "checked", "published", "rejected"]);
const recommendedResourceKeys = [
  "chapter",
  "notes",
  "easyNote",
  "mcq",
  "mockTest",
  "slides",
  "infographics",
  "downloads",
  "importantQuestions",
  "shortQuestions",
  "pastQuestions",
  "handwrittenNote"
];

const errors = [];
const warnings = [];

function addError(filePath, message) {
  errors.push(filePath + ": " + message);
}

function addWarning(filePath, message) {
  warnings.push(filePath + ": " + message);
}

function readJSON(filePath) {
  if (!fs.existsSync(filePath)) {
    addError(filePath, "File does not exist.");
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    addError(filePath, "Invalid JSON: " + error.message);
    return null;
  }
}

function isPlainObject(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function resolveProjectPath(resourcePath) {
  return path.resolve(projectRoot, String(resourcePath));
}

function printSummary() {
  console.log("SEE2083 Content Index Validation");

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

  console.log("Content index validation passed.");
}

const index = readJSON(indexPath);

if (!index) {
  printSummary();
}

if (!index.version) {
  addError(indexPath, "Root field missing: version.");
}

if (!isPlainObject(index.mediums)) {
  addError(indexPath, "Root field missing or invalid: mediums.");
  printSummary();
}

const seenChapterIds = new Set();
const seenBasePaths = new Set();

Object.keys(index.mediums).forEach(function (mediumId) {
  const medium = index.mediums[mediumId];
  const mediumPath = "data/content-index.json > mediums." + mediumId;

  if (!allowedMediums.has(mediumId)) {
    addError(mediumPath, "Invalid medium id. Use english, nepali, or electrical.");
  }

  if (!isPlainObject(medium)) {
    addError(mediumPath, "Medium entry must be an object.");
    return;
  }

  if (!isPlainObject(medium.subjects)) {
    addError(mediumPath, "Missing or invalid subjects object.");
    return;
  }

  Object.keys(medium.subjects).forEach(function (subjectId) {
    const subject = medium.subjects[subjectId];
    const subjectPath = mediumPath + ".subjects." + subjectId;

    if (!isPlainObject(subject)) {
      addError(subjectPath, "Subject entry must be an object.");
      return;
    }

    if (!isPlainObject(subject.chapters)) {
      addError(subjectPath, "Subject must contain a chapters object.");
      return;
    }

    Object.keys(subject.chapters).forEach(function (chapterId) {
      const chapter = subject.chapters[chapterId];
      const chapterPath = subjectPath + ".chapters." + chapterId;

      if (!isPlainObject(chapter)) {
        addError(chapterPath, "Chapter entry must be an object.");
        return;
      }

      ["id", "unit", "title", "status", "basePath", "resources"].forEach(function (field) {
        if (chapter[field] === undefined || chapter[field] === null || chapter[field] === "") {
          addError(chapterPath, "Missing required field: " + field + ".");
        }
      });

      if (chapter.status && !allowedStatuses.has(chapter.status)) {
        addError(chapterPath, "Invalid status: " + chapter.status + ".");
      }

      if (chapter.id) {
        if (seenChapterIds.has(chapter.id)) {
          addError(chapterPath, "Duplicate chapter id: " + chapter.id + ".");
        }
        seenChapterIds.add(chapter.id);
      }

      if (chapter.basePath) {
        if (seenBasePaths.has(chapter.basePath)) {
          addError(chapterPath, "Duplicate basePath: " + chapter.basePath + ".");
        }
        seenBasePaths.add(chapter.basePath);

        const baseFullPath = resolveProjectPath(chapter.basePath);
        if (!fs.existsSync(baseFullPath)) {
          addWarning(chapterPath, "basePath folder does not exist: " + chapter.basePath + ".");
        }
      }

      if (!isPlainObject(chapter.resources)) {
        addError(chapterPath, "resources must be an object.");
        return;
      }

      recommendedResourceKeys.forEach(function (key) {
        if (!Object.prototype.hasOwnProperty.call(chapter.resources, key)) {
          addWarning(chapterPath, "Optional resource key missing: " + key + ".");
        }
      });

      Object.keys(chapter.resources).forEach(function (resourceKey) {
        const resourcePath = chapter.resources[resourceKey];

        if (!resourcePath || typeof resourcePath !== "string") {
          addError(chapterPath, "Resource path is missing or invalid for key: " + resourceKey + ".");
          return;
        }

        const fullPath = resolveProjectPath(resourcePath);

        if (!fs.existsSync(fullPath)) {
          addError(chapterPath, "Listed resource file does not exist: " + resourcePath + ".");
        }
      });
    });
  });
});

printSummary();
