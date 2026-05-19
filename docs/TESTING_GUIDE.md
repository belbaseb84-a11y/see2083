# SEE 2083 Testing Guide

This project is a static HTML/CSS/JavaScript website. The route smoke test checks important pages through HTTP before publishing.

## Route Smoke Test

Start any local static server from the project root, then run:

```bash
BASE_URL=http://127.0.0.1:5500 node tools/smoke-test-routes.js
```

PowerShell example:

```powershell
$env:BASE_URL="http://127.0.0.1:5500"; node tools\smoke-test-routes.js
```

If `BASE_URL` is not set, the script uses:

```text
http://127.0.0.1:5500
```

The smoke test checks:

- Basic public pages
- English Science chapter, quiz, mock, and infographic routes
- Optional Math draft routes
- Nepali Science draft routes
- Electrical subject and draft routes
- Search query routes
- Resource viewer empty-state routes

The script prints `PASS` or `FAIL` for each route and exits with code `1` if any route fails.

## Limitations

This is not a browser automation test. It does not click buttons or execute page JavaScript. It checks HTTP success, non-blank HTML, visible brand text, and common broken-page text so obvious routing problems are caught quickly.
