# SEE 2083
SEE 2083 static education website

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

---

## Phase 3B.1 Quiz Focus Mode and Random Order

Chapter-specific MCQ practice now uses a focused layout.

- Unnecessary sidebar cards are hidden on exact chapter quiz routes.
- Question order is randomized per attempt without repeating questions inside one attempt.
- Result review preserves the attempted question order.
- Next Question and Finish Quiz actions are easier to reach after answering.
- Answer options are not shuffled yet.
- No MCQ data, mock test, search, or content-index changes were made.

---

## Phase 3C.0 Classification of Living Beings Pack

Created the correct Science Unit 2 content pack folder: `content/english/science/classification-living/`.

- The old `classification-of-elements` demo pack was not deleted.
- `data/content-index.json`, `data/search-index.json`, and `data/subject-index.json` now include `classification-living`.
- MCQ/search practice entry is draft until real Unit 2 MCQs are added.
- Real MCQs will be added in Phase 3C.1.

---

## Phase 3C.1 Fix Classification Living MCQ Loading

Fixed Unit 2 Classification of Living Beings MCQ loading.

- Active MCQ file is `content/english/science/classification-living/mcq.json`.
- Extra temporary balanced JSON file was not present in the active folder.
- Updated the `classification-living` MCQ search entry to `published`.
- Confirmed Unit 1 Scientific Study quiz still resolves 50 MCQs.

---

## Phase 3C.1B Unit 2 Slug Mismatch Fix

Fixed the Classification of Living Beings slug mismatch.

- Site routes use `classification-of-living-things`.
- The external content pack now matches the actual route at `content/english/science/classification-of-living-things/`.
- Unit 2 quiz now loads 50 MCQs from `classification-of-living-things/mcq.json`.
- Unit 1 Scientific Study quiz remains working.

---

## Phase 3D.1A Science Unit 3-5 Structure

Created content-pack folders for Science Unit 3, Unit 4, and Unit 5.

- Unit 3: `life-cycle-of-honey-bee`
- Unit 4: `heredity`
- Unit 5: `physiological-structure-and-life-process`
- MCQ files are draft placeholders for manual paste in the next step.
- Unit 1 and Unit 2 content files were not modified.
- Notes, mock test, slides, infographics, and downloads remain draft placeholders.

---

## Phase 3E.1A Science Unit 6-10 Structure

Created content-pack folders for Science Unit 6, Unit 7, Unit 8, Unit 9, and Unit 10.

- Unit 6: `nature-and-environment`
- Unit 7: `force-and-motion`
- Unit 8: `pressure`
- Unit 9: `heat-energy`
- Unit 10: `wave`
- MCQ files are draft placeholders for manual paste in the next step.
- Unit 1-5 content files were not modified.
- Notes, mock test, slides, infographics, and downloads remain draft placeholders.

---

## Phase 3F.1A Science Unit 11-15 Structure

Created or normalized content-pack folders for Science Unit 11, Unit 12, Unit 13, Unit 14, and Unit 15.

- Unit 11: `electricity-and-magnetism`
- Unit 12: `universe`
- Unit 13: `information-and-communication-technology`
- Unit 14: `classification-of-elements`
- Unit 15: `chemical-reaction`
- MCQ files are draft placeholders for manual paste in the next step.
- The existing `classification-of-elements` demo pack was reused safely for Unit 14.
- Unit 1-10 content files were not modified.
- Notes, mock test, slides, infographics, and downloads remain draft placeholders.

## Phase 3G.1A Science Unit 16-19 Structure

Created content-pack folders for Unit 16, Unit 17, Unit 18, and Unit 19 using the active website slugs: some-gases, metals, hydrocarbons-and-its-compounds, and chemicals-used-in-daily-life. MCQ files are draft placeholders for manual paste in the next step. Unit 1-15 were not modified. Notes, mock tests, slides, and infographics remain draft.

## Phase Mock.1 Chapter Mock Tests From MCQ Pool

Mock tests now use `mock-test.json` first when it contains published real mock questions. If `mock-test.json` is empty, draft, missing, or only placeholder-style content, chapter mock tests use the chapter `mcq.json` pool instead. Mock mode selects up to 25 random questions, keeps feedback until after submit, and preserves result review. MCQ Practice was not changed.

## Phase QA.1 Post Science MCQ QA Fixes

Verified Unit 1-19 Science MCQ availability, including the fixed Some Gases chapter. Added an early Finish Practice action for exact chapter MCQ practice, aligned completed Science MCQ search entries to published status, fixed the Medium page active nav state, and rechecked bookmark/mobile/dark-mode behavior. No MCQ content files were changed.

## Phase 4A Optional Math and Nepali Science Structure

Created English Optional Mathematics chapter-pack structure and Nepali Medium Science chapter-pack structure. No real MCQs, notes, mock questions, slides, infographics, or Drive links were added. Existing English Science content was not modified. Optional Math units should be verified against the official CDC source before real content entry.

## Phase 4C Runtime Connection for Optional Math and Nepali Science

Optional Math 8 chapters are now visible in the runtime chapter listing, and Nepali Science 19 chapters are available through the existing Science chapter routes for Nepali Medium. Draft quiz routes do not fall back to wrong English/sample MCQs, while English Science MCQ and mock routes remain working. No real Optional Math or Nepali Science content was added.

## Phase Viewer.1 Science Infographic Drive Viewer

Added `resource-viewer.html` and `js/resource-viewer.js` for in-site Google Drive infographic previews. Added 19 English Science Drive infographic links, corrected source slugs to active website slugs, and connected chapter infographic buttons to the viewer. MCQ and mock test routes were not changed.

## Drive infographic protection note

The website uses Google Drive preview iframe links for infographics and does not expose `directImageUrl` in infographic metadata. The viewer does not show download buttons for infographics. The Drive owner should manually disable download, print, and copy for viewers in Google Drive sharing settings. This does not prevent screenshots or screen recording.

## Phase Viewer.1B Infographic Viewer QA Fixes

Fixed the fallback message appearing under loaded infographics by separating success and empty viewer states. Added a Drive iframe loading state, polished mobile button wrapping, and corrected the Unit 2 infographic title wording. MCQ and mock systems were not changed.

## Phase NotesViewer.1 Resource Viewer Note Support Preparation

`resource-viewer.html` now understands future `note`, `easy-note`, `full-note`, and `slides` resource types while keeping the infographic viewer working. Note and slides routes show friendly empty states until Drive links are added. Download hardening remains in place with preview/embed URLs only, no direct image URL, and no download action. No real note or slides links were added in this phase.

## Phase UX.1 Dark Mode and Mobile Polish

Improved dark mode contrast, mobile tap targets/layout, quiz/mock/resource viewer button spacing, and placeholder/tag readability. No content or quiz logic changed.

## Phase UX.2 Resource Availability Badges

Added Available / Coming soon badges on chapter study options. English Science MCQ, Mock, and Infographic show available where real resources exist. Optional Math and Nepali Science draft resources show coming soon. No content or quiz logic was changed.

## Phase Electrical.1 Missing Electrical Subject Structures

Added Industrial Installation and Maintenance structure with 6 official units and Utilization of Electrical Energy structure with 6 official units. Created draft placeholder packs only, with no real MCQs, notes, slides, infographics, or downloads added. Existing Science, Optional Math, Nepali Science, Basic Electronics, and Electrical Machine systems were not changed.

## Phase QA-Fix.1 Functional Bug Fixes

Fixed mock early-submit same-tab behavior and changed empty draft mock tests so they show a clear empty state instead of an active 15-minute setup. Verified Unit 5 uses its actual 49-question count, dark mode persistence, bookmark add/remove/dedupe behavior, and infographic loading-state logic. No content or MCQ JSON files were changed.

## Phase SEARCH.1 Resource Search Polish

Added English Science infographic search results, with clearer resource category labels and resource-viewer routes. Search now recognizes infographic, visual, summary, and diagram queries while preserving existing chapter, MCQ, and mock search behavior. No content or MCQ JSON files were changed.

## Phase RESULT.1 Result Review Polish

Added review filters for All, Wrong only, and Unanswered questions, plus collapsible explanations to reduce long review scrolling. Improved result review spacing for mobile while preserving quiz and mock result compatibility. No MCQ content or quiz/mock loading logic was changed.

## Route Smoke Testing

Run `BASE_URL=http://127.0.0.1:5500 node tools/smoke-test-routes.js` after starting a local static server. The script checks key pages, English Science quiz/mock/infographic routes, Optional Math, Nepali Science, Electrical draft routes, search routes, and resource viewer routes. It prints PASS/FAIL per route and exits with a failure code if any route fails.

## Phase ABOUT.FINAL Publish-Ready About Page

Reworked the About page into a public, future-ready overview for SEE 2083. The page now explains the platform purpose, study flow, organization by medium and subject, content growth policy, trust/disclaimer, privacy, community/report links, and Android app access. Progress-style Science counts and beta-report language were removed.
