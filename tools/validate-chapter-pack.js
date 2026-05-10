const fs = require("fs");
const path = require("path");
const childProcess = require("child_process");

const chapterFolderArg = process.argv[2];
const projectRoot = path.resolve(__dirname, "..");
const errors = [];
const warnings = [];

const allowedStatuses = new Set(["draft", "checked", "published", "rejected"]);
const requiredFiles = [
  "chapter.json",
  "mcq.json",
  "notes.html",
  "easy-note.html",
  "important-questions.json",
  "mock-test.json",
  "slides.json",
  "infographics.json",
  "downloads.json",
  "source-log.md"
];
const requiredFolders = ["images", "downloads"];

function addError(location, message) {
  errors.push(location + ": " + message);
}

function addWarning(location, message) {
  warnings.push(location + ": " + message);
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

function parseCount(label, output) {
  const regex = new RegExp(label + ":\\s*(\\d+)", "gi");
  let match;
  let value = 0;

  while ((match = regex.exec(output)) !== null) {
    value = Number(match[1]) || 0;
  }

  return value;
}

function runValidator(scriptName, targetPath) {
  const scriptPath = path.join(__dirname, scriptName);
  const result = childProcess.spawnSync(process.execPath, [scriptPath, targetPath], {
    cwd: projectRoot,
    encoding: "utf8"
  });

  const output = (result.stdout || "") + (result.stderr || "");

  if (output.trim()) {
    console.log("");
    console.log("Nested validator: " + scriptName);
    console.log(output.trim());
  }

  const childWarnings = parseCount("Warnings", output);

  if (childWarnings) {
    addWarning(targetPath, scriptName + " reported " + childWarnings + " warning(s).");
  }

  if (result.status !== 0) {
    addError(targetPath, scriptName + " failed.");
  }
}

function isPublished(root, item) {
  return root.status === "published" || item.status === "published" || item.reviewStatus === "published";
}

function validateChapterJSON(filePath) {
  const data = readJSON(filePath);

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    addError(filePath, "chapter.json must be an object.");
    return;
  }

  ["id", "medium", "subject", "title", "status", "resources"].forEach(function (field) {
    if (data[field] === undefined || data[field] === null || data[field] === "") {
      addError(filePath, "Missing required field: " + field + ".");
    }
  });

  if (!data.chapter && !data.slug) {
    addError(filePath, "Missing chapter or slug field.");
  }

  if (data.status && !allowedStatuses.has(data.status)) {
    addError(filePath, "Invalid status: " + data.status + ".");
  }

  if (!data.resources || typeof data.resources !== "object" || Array.isArray(data.resources)) {
    addError(filePath, "resources must be an object.");
  }
}

function validateSlides(filePath, folderPath) {
  const data = readJSON(filePath);

  if (!data) {
    return;
  }

  if (!Array.isArray(data.slides)) {
    addError(filePath, "slides must be an array.");
    return;
  }

  data.slides.forEach(function (slide, index) {
    const label = filePath + " > slides[" + index + "]";

    if (!slide || typeof slide !== "object" || Array.isArray(slide)) {
      addError(label, "Slide must be an object.");
      return;
    }

    if (isPublished(data, slide)) {
      ["id", "title", "points"].forEach(function (field) {
        if (slide[field] === undefined || slide[field] === null || slide[field] === "") {
          addError(label, "Published slide is missing field: " + field + ".");
        }
      });

      if (!Array.isArray(slide.points) || !slide.points.length) {
        addError(label, "Published slide must have points array.");
      }
    }

    if (slide.image) {
      const imagePath = path.resolve(folderPath, slide.image);
      if (!fs.existsSync(imagePath)) {
        addWarning(label, "Referenced image does not exist yet: " + slide.image + ".");
      }
    }
  });
}

function validateInfographics(filePath, folderPath) {
  const data = readJSON(filePath);

  if (!data) {
    return;
  }

  if (!Array.isArray(data.items)) {
    addError(filePath, "items must be an array.");
    return;
  }

  data.items.forEach(function (item, index) {
    const label = filePath + " > items[" + index + "]";

    if (!item || typeof item !== "object" || Array.isArray(item)) {
      addError(label, "Infographic item must be an object.");
      return;
    }

    if (isPublished(data, item)) {
      ["id", "title"].forEach(function (field) {
        if (item[field] === undefined || item[field] === null || item[field] === "") {
          addError(label, "Published infographic is missing field: " + field + ".");
        }
      });

      if (!item.image && !item.caption) {
        addError(label, "Published infographic must have image or caption.");
      }
    }

    if (item.image) {
      const imagePath = path.resolve(folderPath, item.image);
      if (!fs.existsSync(imagePath)) {
        addWarning(label, "Referenced image does not exist yet: " + item.image + ".");
      }
    }
  });
}

function validateImportantQuestions(filePath) {
  const data = readJSON(filePath);

  if (!data) {
    return;
  }

  if (!Array.isArray(data.questions)) {
    addError(filePath, "questions must be an array.");
  }
}

function printSummary(folderPath) {
  console.log("");
  console.log("SEE2083 Chapter Pack Validation");
  console.log("Folder: " + folderPath);

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

  console.log("Chapter pack validation passed.");
}

if (!chapterFolderArg) {
  addError("tools/validate-chapter-pack.js", "Usage: node tools/validate-chapter-pack.js content/english/science/scientific-study");
  printSummary("");
}

const folderPath = path.resolve(process.cwd(), chapterFolderArg);

if (!fs.existsSync(folderPath) || !fs.statSync(folderPath).isDirectory()) {
  addError(folderPath, "Chapter folder does not exist or is not a directory.");
  printSummary(folderPath);
}

requiredFiles.forEach(function (fileName) {
  const filePath = path.join(folderPath, fileName);
  if (!fs.existsSync(filePath)) {
    addError(filePath, "Required file is missing.");
  }
});

requiredFolders.forEach(function (folderName) {
  const requiredFolderPath = path.join(folderPath, folderName);
  if (!fs.existsSync(requiredFolderPath) || !fs.statSync(requiredFolderPath).isDirectory()) {
    addError(requiredFolderPath, "Required folder is missing.");
  }
});

if (!errors.length) {
  validateChapterJSON(path.join(folderPath, "chapter.json"));
  validateSlides(path.join(folderPath, "slides.json"), folderPath);
  validateInfographics(path.join(folderPath, "infographics.json"), folderPath);
  validateImportantQuestions(path.join(folderPath, "important-questions.json"));

  runValidator("validate-mcq.js", path.join(chapterFolderArg, "mcq.json"));
  runValidator("validate-mock-test.js", path.join(chapterFolderArg, "mock-test.json"));
  runValidator("validate-downloads.js", path.join(chapterFolderArg, "downloads.json"));
}

printSummary(folderPath);
