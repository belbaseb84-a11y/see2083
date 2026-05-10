# Content Format Guide

SEE2083 will use a chapter-folder content system in a later phase.

## Basic Rule

One chapter equals one folder.

Example:

```text
content/english/science/scientific-study/
```

That folder can contain chapter information, MCQs, notes, slides, infographics, and extra view links.

## Main Files

- `chapter.json` stores the chapter title, IDs, summary, status, and resource file names.
- `notes.html` is the main website note students read on the site.
- `easy-note.html` is a simpler note version.
- `mcq.json` stores quiz questions for MCQ practice.
- `important-questions.json` stores important question lists.
- `mock-test.json` stores mock test settings and questions.
- `slides.json` stores website slide data.
- `infographics.json` stores infographic items.
- `downloads.json` stores extra view links such as Google Drive DOCX/PDF links.
- `source-log.md` records where the content came from and its review status.

## Important

In Phase 1, the new content folders are not connected to the current website pages yet.
The current website still uses `S2083` from `js/data.js` and `js/data-official-patch.js`.

## Validation Before Publishing

Run the validators before marking content as ready for students.

Validate one full chapter folder:

```text
node tools/validate-chapter-pack.js content/english/science/scientific-study
```

Validate the content index paths:

```text
node tools/validate-content-index.js
```

The chapter folder should pass `validate-chapter-pack.js` before you copy its pattern for more chapters.
The `data/content-index.json` paths should pass `validate-content-index.js` so the website can find the right files later.
