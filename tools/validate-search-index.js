const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");
const indexPath = path.join(projectRoot, "data", "search-index.json");
const allowedStatuses = new Set(["draft", "checked", "published", "rejected"]);
const preferredTypes = new Set(["subject", "chapter", "mcq", "material", "note", "mock"]);
const errors = [];
const warnings = [];

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

function hasValidUrl(url) {
  return typeof url === "string" && !!url.trim() && !url.startsWith("C:/") && url.indexOf("\\") === -1;
}

function printSummary(count) {
  console.log("SEE2083 Search Index Validation");
  console.log("File: " + indexPath);
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

  console.log("Search index validation passed.");
}

const data = readJSON(indexPath);
let items = [];

if (data) {
  if (!Array.isArray(data)) {
    addError(indexPath, "Root must be an array.");
  } else {
    items = data;
  }
}

const seenIds = new Set();
const seenUrls = new Set();

items.forEach(function (item, index) {
  const label = "data/search-index.json > item[" + index + "]";

  if (!item || typeof item !== "object" || Array.isArray(item)) {
    addError(label, "Item must be an object.");
    return;
  }

  ["id", "type", "title", "url"].forEach(function (field) {
    if (item[field] === undefined || item[field] === null || item[field] === "") {
      addError(label, "Missing required field: " + field + ".");
    }
  });

  if (item.id) {
    if (seenIds.has(item.id)) {
      addError(label, "Duplicate id: " + item.id + ".");
    }
    seenIds.add(item.id);
  }

  if (item.status && !allowedStatuses.has(item.status)) {
    addError(label, "Invalid status: " + item.status + ".");
  }

  if (item.type && !preferredTypes.has(item.type)) {
    addWarning(label, "Unrecognized type: " + item.type + ".");
  }

  if (item.url) {
    if (!hasValidUrl(item.url)) {
      addError(label, "Invalid url: " + item.url + ".");
    }

    if (seenUrls.has(item.url)) {
      addWarning(label, "Duplicate url: " + item.url + ".");
    }
    seenUrls.add(item.url);
  }

  if (item.status === "published" && !hasValidUrl(item.url)) {
    addError(label, "Published entry must have a valid url.");
  }

  if (!(Array.isArray(item.keywords) || typeof item.keywords === "string")) {
    addWarning(label, "keywords should be an array or string.");
  }
});

printSummary(items.length);
