# Folder Rules

Use the current SEE2083 IDs exactly.

## Medium Folders

Use:

- `english`
- `nepali`
- `electrical`

Do not use:

- `english-medium`
- `nepali-medium`
- `electrical-engineering`

## Subject Folders

Use subject IDs from the current `S2083` data.

Examples:

- `science`
- `english`
- `nepali`
- `math`
- `computer`
- `basic-electronics`
- `electrical-machine`

## Chapter Folders

Use chapter slugs from the current `S2083` data.

Example:

```text
content/english/science/scientific-study/
```

## Do Not Randomly Rename Folders

Folder names become part of the content system. Renaming folders later can break:

- chapter links
- quizzes
- bookmarks
- search results
- old URLs

## Do Not Create One File Per MCQ

Keep MCQs together in one `mcq.json` file per chapter.

This is easier to validate, review, and load later.
