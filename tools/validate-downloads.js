const fs = require("fs");
const path = require("path");

const filePath = process.argv[2];
const allowedStatuses = new Set(["draft", "checked", "published", "rejected"]);
const preferredTypes = new Set(["docx", "pdf", "pptx", "image", "link"]);
const preferredModes = new Set(["google-drive-view", "external-link", "local-download"]);
const errors = [];
const warnings = [];

function addError(location, message) {
  errors.push(location + ": " + message);
}

function addWarning(location, message) {
  warnings.push(location + ": " + message);
}

function isPlaceholderUrl(value) {
  if (typeof value !== "string") {
    return true;
  }

  const trimmed = value.trim();
  return !trimmed || trimmed === "#" || trimmed.indexOf("PASTE_GOOGLE_DRIVE") !== -1;
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

function printSummary(resolvedPath, count) {
  console.log("SEE2083 Downloads Validation");
  console.log("File: " + resolvedPath);
  console.log("Items checked: " + count);

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

  console.log("Downloads validation passed.");
}

if (!filePath) {
  addError("tools/validate-downloads.js", "Usage: node tools/validate-downloads.js path/to/downloads.json");
  printSummary("", 0);
}

const resolvedPath = path.resolve(process.cwd(), filePath);
const data = readJSON(resolvedPath);
let items = [];

if (data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    addError(resolvedPath, "downloads.json must be an object.");
  } else if (!Array.isArray(data.items)) {
    addError(resolvedPath, "items must be an array.");
  } else {
    items = data.items;
  }
}

const seenIds = new Set();

items.forEach(function (item, index) {
  const label = resolvedPath + " > item[" + index + "]";

  if (!item || typeof item !== "object" || Array.isArray(item)) {
    addError(label, "Item must be an object.");
    return;
  }

  if (!item.id || typeof item.id !== "string") {
    addError(label, "Missing or invalid id.");
  } else if (seenIds.has(item.id)) {
    addError(label, "Duplicate id: " + item.id + ".");
  } else {
    seenIds.add(item.id);
  }

  ["title", "type", "mode", "viewUrl", "status"].forEach(function (field) {
    if (item[field] === undefined || item[field] === null || item[field] === "") {
      addWarning(label, "Field should be present: " + field + ".");
    }
  });

  if (item.status && !allowedStatuses.has(item.status)) {
    addError(label, "Invalid status: " + item.status + ".");
  }

  if (item.type && !preferredTypes.has(item.type)) {
    addWarning(label, "Unrecognized type: " + item.type + ".");
  }

  if (item.mode && !preferredModes.has(item.mode)) {
    addWarning(label, "Unrecognized mode: " + item.mode + ".");
  }

  if (item.downloadAllowed !== undefined && typeof item.downloadAllowed !== "boolean") {
    addError(label, "downloadAllowed must be boolean when present.");
  }

  const isPublished = item.status === "published";
  const hasPlaceholder = isPlaceholderUrl(item.viewUrl);

  if (isPublished) {
    if (!item.title || typeof item.title !== "string" || !item.title.trim()) {
      addError(label, "Published item must have a title.");
    }

    if (hasPlaceholder) {
      addError(label, "Published item must have a real viewUrl, not a placeholder.");
    }
  } else if (hasPlaceholder) {
    addWarning(label, "Draft or unpublished item has a placeholder viewUrl.");
  }
});

printSummary(resolvedPath, items.length);
