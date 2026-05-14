# see2083
SEE2083 static education website

---

## Scalable Content System - Phase 2I

A second demo chapter content pack was added:

```text
content/english/science/classification-of-elements/
```

The external content system now has more than one indexed chapter for testing.

This is still demo placeholder content only. Run the validators before publishing or adding real content:

```text
node tools/validate-all-content.js
node tools/check-deploy-readiness.js
```

---

## Scalable Content System - Phase 2J

Quiz UX fixes were added.

- Chapter-specific quiz routes now try external MCQs first, then exact old chapter MCQs only.
- Exact chapter routes no longer show repeated subject-level fallback MCQs.
- Back to Chapter navigation was added to quiz and result flow.
- Result Try Again can return to the same quiz route.
- Quiz and result pages now show small student motivation messages.
- Quiz result `timeTaken` uses a safe ASCII dash fallback.

---

## Phase 2J.1 Quiz UX Polish

Back/Choose Chapter navigation was made clearer on quiz and result pages.

Result actions now show Back to Chapter or Choose Chapter more visibly beside Try Again and Home.

Motivation copy was improved and repeated low-score wording was removed.

No CSS or runtime content system changes were made.

---

## Phase 2K Motivation System and Chapter Navigation

100 original student motivation quotes were added in `data/motivation-quotes.json`.

`js/motivation.js` loads the quote bank, avoids repeating the same quote twice in a row where possible, and renders visible quote cards on quiz and result pages.

Chapter pages now include Choose Another Chapter navigation back to the chapter list.

No backend, database, external library, or real textbook content was added.

---

## Phase 2K.1 Result Page Polish

The result page was polished without changing data or content packs.

- Fixed 0% score display so zero renders as `0%`.
- Improved result motivation visibility with the existing quote card system.
- Kept result actions clear: Review Answers, Try Again, Back to Chapter or Choose Chapter, and Home.
- Kept mock result and old score-only result compatibility.

---

## Phase 2L Language Scope and About Cleanup

v1 does not translate the whole website.

Medium selection controls the main content language:
- English Medium shows English content.
- Nepali Medium shows Nepali content where available.
- Electrical shows technical stream content.

The global website interface remains mostly English for now.

The top language toggle was changed into a Medium shortcut, and the About page was cleaned to remove garbled text and clarify trust/privacy scope.

No content pack or data system changes were made.

---

## Phase 2M Navigation Audit and Fix

Navigation buttons and generated links were audited across the main static pages.

Broken or weak routes were fixed using normal links or safe generated URLs.

No router, framework, build tool, CSS redesign, or content system change was added.

---

## Phase 2N Mock Test Identity Polish

Mock Test now uses clearer exam-style wording so it feels separate from MCQ Practice.

- The mock start screen shows `Mock Test`, `Exam Practice`, `Start Mock Test`, timer mode, and feedback-after-submit wording.
- Active mock test labels now use exam-style text such as `Question 1 of X`, `Time Left`, and `Submit Test`.
- Mock results keep mock mode metadata so result.html can identify the latest mock attempt correctly.
- External `mock-test.json` loading remains unchanged.

No real content, CSS redesign, router, or framework was added.

---

## Phase 2O Search Cleanup

Search behavior was cleaned before real content entry.

- External `published` search-index results are prioritized.
- Draft, rejected, hidden, private, or invalid external search entries are skipped.
- Duplicate results are reduced using URL, ID, and title/context checks.
- S2083 fallback still provides useful subject and chapter results.
- Old individual `S2083.sampleMCQs` fallback search noise was removed.
- Search page Enter key behavior now updates results without resetting the page.

No router, framework, backend, CSS redesign, or real content was added.

---

## Phase 2P Bookmark Reliability Polish

Bookmark storage was hardened before real content entry.

- Duplicate bookmarks are prevented and existing saved items are updated instead of duplicated.
- Remove now saves immediately and confirms the item is gone from `s2083_bookmarks`.
- Older bookmarks without URLs get safe fallback routes where possible.
- Invalid bookmark URLs fall back safely instead of crashing.
- Invalid or non-array localStorage data now shows an empty bookmarks state.

The localStorage key remains `s2083_bookmarks`.

---

## Phase 2Q Content Availability Polish

Unavailable content states were made clearer before real content entry.

- Chapters without external content packs now show honest content-being-added messaging.
- Note-heavy study option cards show availability helper text instead of looking fully complete.
- External content pack chapters still show connected resource notices and keep existing routes.
- Notes empty states now include Back to Chapter and Choose Another Chapter actions.

External content packs and real content files were not changed.

---

## Phase 2R Mock Test Selection Polish

Mock Test answer selection was made clearer without auto-advance.

- Selected options now have a visible selected state.
- Next Question becomes clearer after selecting an answer.
- Submit Test remains clear on the final question.
- Students can still change answers before moving on.
- MCQ Practice and content packs were not changed.

---

## Phase 3A.1 Easy Note Layout Polish

Unit 1 `easy-note.html` was converted from raw DOCX-style text into structured website note sections.

- Added a note hero, quick revision summary, key term cards, formula box, question-answer blocks, memory tips, exam tips, and final checklist.
- Added small note-specific styling in `css/pages.css`.
- No quiz, mock test, search, JavaScript, or data-index changes were made.
