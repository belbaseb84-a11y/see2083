const http = require("http");
const https = require("https");

const DEFAULT_BASE_URL = "http://127.0.0.1:5500";
const REQUEST_TIMEOUT_MS = 15000;
const MIN_HTML_LENGTH = 200;

const scienceSlugs = [
  "scientific-study",
  "classification-of-living-things",
  "life-cycle-of-honey-bee",
  "heredity",
  "physiological-structure-and-life-process",
  "nature-and-environment",
  "force-and-motion",
  "pressure",
  "heat-energy",
  "wave",
  "electricity-and-magnetism",
  "universe",
  "information-and-communication-technology",
  "classification-of-elements",
  "chemical-reaction",
  "some-gases",
  "metals",
  "hydrocarbons-and-its-compounds",
  "chemicals-used-in-daily-life"
];

const routes = [];
const seenRoutes = new Set();

function addRoute(route, group) {
  const normalizedRoute = route === "/" ? "/" : route.replace(/^\/+/, "");

  if (seenRoutes.has(normalizedRoute)) {
    return;
  }

  seenRoutes.add(normalizedRoute);
  routes.push({ route: normalizedRoute, group: group });
}

function addBasicRoutes() {
  [
    "/",
    "index.html",
    "medium.html",
    "subjects.html?medium=english",
    "subjects.html?medium=nepali",
    "subjects.html?medium=electrical",
    "search.html",
    "bookmarks.html",
    "about.html",
    "result.html"
  ].forEach(function (route) {
    addRoute(route, "basic");
  });
}

function addEnglishScienceRoutes() {
  scienceSlugs.forEach(function (slug) {
    addRoute("chapter.html?subject=science&chapter=" + slug + "&medium=english", "english science chapter");
    addRoute("quiz.html?subject=science&chapter=" + slug + "&medium=english", "english science quiz");
    addRoute("mock-test.html?subject=science&chapter=" + slug + "&medium=english", "english science mock");
    addRoute("resource-viewer.html?subject=science&chapter=" + slug + "&medium=english&type=infographic", "english science infographic");
  });
}

function addOptionalMathRoutes() {
  [
    "chapters.html?subject=optional-math&medium=english",
    "chapter.html?subject=optional-math&chapter=algebra&medium=english",
    "quiz.html?subject=optional-math&chapter=algebra&medium=english",
    "mock-test.html?subject=optional-math&chapter=algebra&medium=english"
  ].forEach(function (route) {
    addRoute(route, "optional math");
  });
}

function addNepaliScienceRoutes() {
  [
    "chapters.html?subject=science&medium=nepali",
    "chapter.html?subject=science&chapter=scientific-study&medium=nepali",
    "quiz.html?subject=science&chapter=scientific-study&medium=nepali",
    "mock-test.html?subject=science&chapter=scientific-study&medium=nepali"
  ].forEach(function (route) {
    addRoute(route, "nepali science");
  });
}

function addElectricalRoutes() {
  [
    "subjects.html?medium=electrical",
    "chapters.html?subject=basic-electronics&medium=electrical",
    "chapters.html?subject=electrical-machine&medium=electrical",
    "chapters.html?subject=industrial-installation-and-maintenance&medium=electrical",
    "chapters.html?subject=utilization-of-electrical-energy&medium=electrical",
    "chapter.html?subject=industrial-installation-and-maintenance&chapter=fire-and-safety-standards&medium=electrical",
    "chapter.html?subject=utilization-of-electrical-energy&chapter=illumination&medium=electrical",
    "quiz.html?subject=industrial-installation-and-maintenance&chapter=fire-and-safety-standards&medium=electrical",
    "mock-test.html?subject=utilization-of-electrical-energy&chapter=illumination&medium=electrical"
  ].forEach(function (route) {
    addRoute(route, "electrical");
  });
}

function addSearchRoutes() {
  [
    "search.html?q=infographic",
    "search.html?q=heat%20infographic",
    "search.html?q=gases%20infographic",
    "search.html?q=hydrocarbon%20infographic",
    "search.html?q=algebra",
    "search.html?q=trigonometry",
    "search.html?q=scientific",
    "search.html?q=metals"
  ].forEach(function (route) {
    addRoute(route, "search");
  });
}

function addResourceViewerEmptyRoutes() {
  [
    "resource-viewer.html?subject=science&chapter=scientific-study&medium=english&type=note",
    "resource-viewer.html?subject=science&chapter=scientific-study&medium=english&type=slides",
    "resource-viewer.html?subject=science&chapter=fake-chapter&medium=english&type=infographic",
    "resource-viewer.html?subject=science&chapter=scientific-study&medium=english&type=unknown"
  ].forEach(function (route) {
    addRoute(route, "resource viewer empty state");
  });
}

function buildRoutes() {
  addBasicRoutes();
  addEnglishScienceRoutes();
  addOptionalMathRoutes();
  addNepaliScienceRoutes();
  addElectricalRoutes();
  addSearchRoutes();
  addResourceViewerEmptyRoutes();
}

function normalizeBaseUrl(value) {
  return String(value || DEFAULT_BASE_URL).replace(/\/+$/, "") + "/";
}

function toUrl(baseUrl, route) {
  if (route === "/") {
    return baseUrl;
  }

  return baseUrl + route;
}

function fetchText(url, redirectCount) {
  const redirects = redirectCount || 0;

  return new Promise(function (resolve, reject) {
    const parsedUrl = new URL(url);
    const client = parsedUrl.protocol === "https:" ? https : http;

    const request = client.get(parsedUrl, {
      headers: {
        "User-Agent": "SEE2083 route smoke test"
      }
    }, function (response) {
      const statusCode = response.statusCode || 0;
      const location = response.headers.location;

      if (statusCode >= 300 && statusCode < 400 && location && redirects < 5) {
        response.resume();
        resolve(fetchText(new URL(location, parsedUrl).href, redirects + 1));
        return;
      }

      const chunks = [];

      response.on("data", function (chunk) {
        chunks.push(chunk);
      });

      response.on("end", function () {
        resolve({
          statusCode: statusCode,
          body: Buffer.concat(chunks).toString("utf8")
        });
      });
    });

    request.setTimeout(REQUEST_TIMEOUT_MS, function () {
      request.destroy(new Error("request timed out"));
    });

    request.on("error", reject);
  });
}

function findFailure(response) {
  const body = response.body || "";

  if (response.statusCode !== 200) {
    return "HTTP " + response.statusCode;
  }

  if (body.trim().length < MIN_HTML_LENGTH) {
    return "page looks blank or too small";
  }

  if (!/<html[\s>]/i.test(body)) {
    return "response does not look like HTML";
  }

  if (!/SEE 2083/i.test(body)) {
    return "missing SEE 2083 brand text";
  }

  const brokenTextChecks = [
    "Subject not found",
    "Chapter not found",
    "Cannot GET",
    "404"
  ];

  for (const text of brokenTextChecks) {
    if (body.includes(text)) {
      return "contains broken-page text: " + text;
    }
  }

  return "";
}

async function testRoute(baseUrl, item) {
  const url = toUrl(baseUrl, item.route);

  try {
    const response = await fetchText(url);
    const failure = findFailure(response);

    if (failure) {
      return {
        ok: false,
        route: item.route,
        reason: item.group + "; " + failure
      };
    }

    return {
      ok: true,
      route: item.route,
      reason: item.group + "; 200 OK"
    };
  } catch (error) {
    return {
      ok: false,
      route: item.route,
      reason: item.group + "; " + (error && error.message ? error.message : "request failed")
    };
  }
}

async function main() {
  buildRoutes();

  const baseUrl = normalizeBaseUrl(process.env.BASE_URL);
  let passed = 0;
  let failed = 0;

  console.log("SEE 2083 route smoke test");
  console.log("BASE_URL: " + baseUrl);
  console.log("");

  for (const item of routes) {
    const result = await testRoute(baseUrl, item);
    const label = result.ok ? "PASS" : "FAIL";

    if (result.ok) {
      passed += 1;
    } else {
      failed += 1;
    }

    console.log(label + " | " + result.route + " | " + result.reason);
  }

  console.log("");
  console.log("Total routes: " + routes.length);
  console.log("Passed: " + passed);
  console.log("Failed: " + failed);

  if (failed > 0) {
    process.exitCode = 1;
  }
}

main().catch(function (error) {
  console.error("FAIL | smoke-test-routes.js | " + (error && error.message ? error.message : error));
  process.exitCode = 1;
});
