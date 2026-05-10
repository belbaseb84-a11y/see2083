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
