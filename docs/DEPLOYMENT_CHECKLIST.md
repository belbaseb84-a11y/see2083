# Deployment Checklist

Use this checklist before publishing SEE2083.

## Before Deployment

- [ ] Run the website with Live Server.
- [ ] Run `node tools/validate-all-content.js`.
- [ ] Run `node tools/check-deploy-readiness.js`.
- [ ] Open the main pages manually.
- [ ] Test notes.
- [ ] Test quiz.
- [ ] Test mock test.
- [ ] Test search.
- [ ] Test bookmarks.
- [ ] Test dark/light mode.
- [ ] Test English/Nepali switch.
- [ ] Test mobile width.
- [ ] Check that the browser console has no errors.
- [ ] Check placeholder Google Drive links are not published.
- [ ] Check README is updated.
- [ ] Create a ZIP backup.
- [ ] Upload or push to GitHub.
- [ ] Connect the project to Cloudflare Pages.

## Manual URLs To Test

```text
index.html
medium.html
subjects.html?medium=english
chapters.html?subject=science&medium=english
chapter.html?subject=science&chapter=scientific-study&medium=english
notes.html?subject=science&chapter=scientific-study&medium=english&type=easy
quiz.html?subject=science&chapter=scientific-study&medium=english
mock-test.html?subject=science&chapter=scientific-study&medium=english
search.html
bookmarks.html
about.html
```
