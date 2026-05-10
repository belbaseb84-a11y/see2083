# Google Drive DOCX Rules

SEE2083 may later use Google Drive view links for DOCX and PDF files.

## Main Website Note

`notes.html` should remain the main website note for reading.

DOCX and PDF links are extra resources only.

## View Links

Use Google Drive view links in `downloads.json`.

Example item:

```json
{
  "type": "docx",
  "mode": "google-drive-view",
  "viewUrl": "PASTE_GOOGLE_DRIVE_VIEW_LINK_HERE",
  "downloadAllowed": false
}
```

## Download Rule

If `downloadAllowed` is `false`, the website should show a View action, not a Download action.

## Protection Warning

Google Drive view-only is not perfect protection.

Students may still take screenshots, copy visible text, or save content using browser tools.

## Publishing Rule

Placeholder links are not rendered as real download/view cards.

Do not mark a download item as `published` while `viewUrl` still contains:

```text
PASTE_GOOGLE_DRIVE
```

Before a download item is published, `viewUrl` must be a real view link.
Draft items may keep placeholder links while content is being prepared.
