const fs = require("fs");
const path = require("path");
const childProcess = require("child_process");

const projectRoot = path.resolve(__dirname, "..");
const contentIndexPath = path.join(projectRoot, "data", "content-index.json");

let totalErrors = 0;
let totalWarnings = 0;
let contentIndexStatus = "not run";
let searchIndexStatus = "not run";
let chapterPacksChecked = 0;

function parseCount(label, output) {
  const regex = new RegExp(label + ":\\s*(\\d+)", "gi");
  let match;
  let value = 0;

  while ((match = regex.exec(output)) !== null) {
    value = Number(match[1]) || 0;
  }

  return value;
}

function runTool(scriptName, args) {
  const scriptPath = path.join(__dirname, scriptName);
  const result = childProcess.spawnSync(process.execPath, [scriptPath].concat(args || []), {
    cwd: projectRoot,
    encoding: "utf8"
  });

  const output = (result.stdout || "") + (result.stderr || "");

  console.log("");
  console.log("Running: node tools/" + scriptName + (args && args.length ? " " + args.join(" ") : ""));

  if (output.trim()) {
    console.log(output.trim());
  }

  const errors = parseCount("Errors", output);
  const warnings = parseCount("Warnings", output);

  totalErrors += errors;
  totalWarnings += warnings;

  if (result.status !== 0 && errors === 0) {
    totalErrors += 1;
  }

  return result.status === 0;
}

function readContentIndex() {
  if (!fs.existsSync(contentIndexPath)) {
    totalErrors += 1;
    console.log("Missing content index: " + contentIndexPath);
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(contentIndexPath, "utf8"));
  } catch (error) {
    totalErrors += 1;
    console.log("Invalid content index JSON: " + error.message);
    return null;
  }
}

function collectChapterFolders(index) {
  const folders = [];

  if (!index || !index.mediums || typeof index.mediums !== "object") {
    return folders;
  }

  Object.keys(index.mediums).forEach(function (mediumId) {
    const medium = index.mediums[mediumId];
    if (!medium || !medium.subjects || typeof medium.subjects !== "object") {
      return;
    }

    Object.keys(medium.subjects).forEach(function (subjectId) {
      const subject = medium.subjects[subjectId];
      if (!subject || !subject.chapters || typeof subject.chapters !== "object") {
        return;
      }

      Object.keys(subject.chapters).forEach(function (chapterId) {
        const chapter = subject.chapters[chapterId];
        if (chapter && chapter.basePath) {
          folders.push(chapter.basePath.replace(/[\\/]$/, ""));
        }
      });
    });
  });

  return folders;
}

contentIndexStatus = runTool("validate-content-index.js") ? "pass" : "fail";
searchIndexStatus = runTool("validate-search-index.js") ? "pass" : "fail";

const index = readContentIndex();
const chapterFolders = collectChapterFolders(index);

chapterFolders.forEach(function (folder) {
  chapterPacksChecked += 1;
  runTool("validate-chapter-pack.js", [folder]);
});

console.log("");
console.log("SEE2083 Content Validation Summary");
console.log("- content-index: " + contentIndexStatus);
console.log("- search-index: " + searchIndexStatus);
console.log("- chapter packs checked: " + chapterPacksChecked);
console.log("- errors: " + totalErrors);
console.log("- warnings: " + totalWarnings);

if (totalErrors > 0) {
  process.exit(1);
}
