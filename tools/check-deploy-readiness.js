const fs = require("fs");
const path = require("path");
const childProcess = require("child_process");

const projectRoot = path.resolve(__dirname, "..");
const errors = [];
const warnings = [];

const requiredHtmlFiles = [
  "index.html",
  "medium.html",
  "subjects.html",
  "chapters.html",
  "chapter.html",
  "notes.html",
  "quiz.html",
  "mock-test.html",
  "result.html",
  "search.html",
  "bookmarks.html",
  "about.html"
];

const requiredFolders = ["css", "js", "data", "content", "tools", "docs", "assets"];

const requiredDataFiles = [
  "data/content-index.json",
  "data/search-index.json",
  "data/medium-index.json",
  "data/subject-index.json",
  "data/site-config.json"
];

const requiredJsFiles = [
  "js/data.js",
  "js/data-official-patch.js",
  "js/content-loader.js",
  "js/main.js",
  "js/utils.js",
  "js/theme.js",
  "js/language.js",
  "js/bookmarks.js",
  "js/chapter.js",
  "js/notes.js",
  "js/quiz.js",
  "js/quiz-page.js",
  "js/mock-test.js",
  "js/mock-page.js",
  "js/search.js",
  "js/search-page.js",
  "js/result-page.js"
];

const requiredCssFiles = [
  "css/variables.css",
  "css/base.css",
  "css/layout.css",
  "css/components.css",
  "css/pages.css",
  "css/theme.css",
  "css/premium.css"
];

const accidentalFolders = [
  "{css,js,assets",
  "{icons,images,illustrations}}",
  path.join("{css,js,assets", "{icons,images,illustrations}}")
];

const runtimeExtensions = new Set([".html", ".js", ".css", ".json"]);
const imageExtensions = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".ico", ".avif"]);
let contentValidationStatus = "not run";

function addError(location, message) {
  errors.push(location + ": " + message);
}

function addWarning(location, message) {
  warnings.push(location + ": " + message);
}

function projectPath(relativePath) {
  return path.join(projectRoot, relativePath);
}

function existsFile(relativePath) {
  const fullPath = projectPath(relativePath);
  return fs.existsSync(fullPath) && fs.statSync(fullPath).isFile();
}

function existsFolder(relativePath) {
  const fullPath = projectPath(relativePath);
  return fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory();
}

function isExternalUrl(value) {
  return /^(https?:)?\/\//i.test(value) || /^mailto:/i.test(value) || /^tel:/i.test(value) || /^data:/i.test(value);
}

function stripUrlTail(value) {
  return value.split("#")[0].split("?")[0];
}

function walkFiles(startDir, callback) {
  if (!fs.existsSync(startDir)) {
    return;
  }

  fs.readdirSync(startDir, { withFileTypes: true }).forEach(function (entry) {
    const fullPath = path.join(startDir, entry.name);

    if (entry.isDirectory()) {
      walkFiles(fullPath, callback);
      return;
    }

    if (entry.isFile()) {
      callback(fullPath);
    }
  });
}

function getRootHtmlFiles() {
  return fs
    .readdirSync(projectRoot)
    .filter(function (name) {
      return name.toLowerCase().endsWith(".html");
    })
    .sort();
}

function forEachRuntimeFile(callback) {
  const seenFiles = new Set();

  getRootHtmlFiles().forEach(function (file) {
    const fullPath = projectPath(file);
    if (!seenFiles.has(fullPath)) {
      seenFiles.add(fullPath);
      callback(fullPath);
    }
  });

  ["js", "css", "data", "content"].forEach(function (folder) {
    walkFiles(projectPath(folder), function (filePath) {
      const ext = path.extname(filePath).toLowerCase();
      if (!runtimeExtensions.has(ext) || seenFiles.has(filePath)) {
        return;
      }

      seenFiles.add(filePath);
      callback(filePath);
    });
  });
}

function readText(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (error) {
    addWarning(filePath, "Could not read file: " + error.message);
    return "";
  }
}

function checkRequiredPaths() {
  requiredHtmlFiles.forEach(function (file) {
    if (!existsFile(file)) {
      addError(file, "Required root HTML file is missing.");
    }
  });

  requiredFolders.forEach(function (folder) {
    if (!existsFolder(folder)) {
      addError(folder, "Required folder is missing.");
    }
  });

  requiredDataFiles.forEach(function (file) {
    if (!existsFile(file)) {
      addError(file, "Required data file is missing.");
    }
  });

  requiredJsFiles.forEach(function (file) {
    if (!existsFile(file)) {
      addError(file, "Required JavaScript file is missing.");
    }
  });

  requiredCssFiles.forEach(function (file) {
    if (!existsFile(file)) {
      addError(file, "Required CSS file is missing.");
    }
  });
}

function checkRootHtmlForLocalPaths() {
  getRootHtmlFiles().forEach(function (file) {
    const fullPath = projectPath(file);
    const text = readText(fullPath);

    ["C:/", "C:\\", "file://"].forEach(function (needle) {
      if (text.indexOf(needle) !== -1) {
        addError(file, "Contains deployment-unsafe local path text: " + needle);
      }
    });
  });
}

function checkRuntimeDangerText() {
  forEachRuntimeFile(function (filePath) {
    const text = readText(filePath);
    const relative = path.relative(projectRoot, filePath);

    ["localhost", "127.0.0.1"].forEach(function (needle) {
      if (text.indexOf(needle) !== -1) {
        addWarning(relative, "Runtime file contains deployment-check text: " + needle);
      }
    });
  });
}

function checkHtmlReferences() {
  getRootHtmlFiles().forEach(function (file) {
    const fullPath = projectPath(file);
    const text = readText(fullPath);
    const scriptRegex = /<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi;
    const linkRegex = /<link\b[^>]*\bhref=["']([^"']+)["'][^>]*>/gi;
    let match;

    while ((match = scriptRegex.exec(text)) !== null) {
      const src = match[1];
      if (isExternalUrl(src)) {
        continue;
      }

      const localPath = stripUrlTail(src);
      if (localPath && !existsFile(localPath)) {
        addError(file, "Missing local script file: " + src);
      }
    }

    while ((match = linkRegex.exec(text)) !== null) {
      const href = match[1];
      const cleanHref = stripUrlTail(href);

      if (isExternalUrl(href) || !cleanHref.toLowerCase().endsWith(".css")) {
        continue;
      }

      if (!existsFile(cleanHref)) {
        addError(file, "Missing local stylesheet file: " + href);
      }
    }
  });
}

function runContentValidation() {
  const validator = projectPath("tools/validate-all-content.js");

  if (!fs.existsSync(validator)) {
    contentValidationStatus = "missing";
    addWarning("tools/validate-all-content.js", "Content validator is missing, so content validation was not run.");
    return;
  }

  const result = childProcess.spawnSync(process.execPath, [validator], {
    cwd: projectRoot,
    encoding: "utf8"
  });

  if (result.status === 0) {
    contentValidationStatus = "pass";
    return;
  }

  contentValidationStatus = "fail";
  addError("content validation", "validate-all-content.js failed. Run node tools/validate-all-content.js for details.");
}

function checkFileSizes() {
  walkFiles(projectRoot, function (filePath) {
    const stats = fs.statSync(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const relative = path.relative(projectRoot, filePath);
    const inContentOrData =
      relative.startsWith("content" + path.sep) || relative.startsWith("data" + path.sep);

    if (inContentOrData && ext === ".json" && stats.size > 5 * 1024 * 1024) {
      addWarning(relative, "JSON file is over 5 MB.");
    }

    if (imageExtensions.has(ext) && stats.size > 1024 * 1024) {
      addWarning(relative, "Image file is over 1 MB.");
    }

    if (stats.size > 20 * 1024 * 1024) {
      addWarning(relative, "Single file is over 20 MB.");
    }
  });
}

function isFolderEmpty(folderPath) {
  if (!fs.existsSync(folderPath) || !fs.statSync(folderPath).isDirectory()) {
    return false;
  }

  return fs.readdirSync(folderPath).length === 0;
}

function folderReferenced(folderName) {
  let referenced = false;

  forEachRuntimeFile(function (filePath) {
    if (readText(filePath).indexOf(folderName) !== -1) {
      referenced = true;
    }
  });

  return referenced;
}

function checkAccidentalFolders() {
  accidentalFolders.forEach(function (folderName) {
    const folderPath = projectPath(folderName);
    const exists = fs.existsSync(folderPath);
    const empty = exists ? isFolderEmpty(folderPath) : false;
    const referenced = folderReferenced(path.basename(folderName));

    if (!exists) {
      console.log("Accidental folder check: " + folderName + " is not present.");
      return;
    }

    console.log(
      "Accidental folder check: " +
        folderName +
        " exists, empty=" +
        empty +
        ", referenced=" +
        referenced +
        "."
    );

    if (exists && !empty) {
      addWarning(folderName, "Accidental-looking folder exists and is not empty.");
    }

    if (exists && referenced) {
      addWarning(folderName, "Accidental-looking folder name is referenced in runtime files.");
    }
  });
}

function printSummary() {
  console.log("");
  console.log("SEE2083 Deployment Readiness Check");
  console.log("Content validation: " + contentValidationStatus);

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
    console.log("FAIL: Fix deployment errors before publishing.");
    process.exit(1);
  }

  console.log("PASS: Project is ready for GitHub/Cloudflare Pages testing. Review warnings before publishing.");
}

checkRequiredPaths();
checkRootHtmlForLocalPaths();
checkRuntimeDangerText();
checkHtmlReferences();
runContentValidation();
checkFileSizes();
checkAccidentalFolders();
printSummary();
