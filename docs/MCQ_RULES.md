# MCQ Rules

SEE2083's current quiz engine uses a zero-based option index.

## Correct Answer Format

Use `correct` as a number:

- `correct: 0` means the first option is correct.
- `correct: 1` means the second option is correct.
- `correct: 2` means the third option is correct.
- `correct: 3` means the fourth option is correct.

Do not use the answer text as the main answer field.

## Required MCQ Fields

Each MCQ should include:

- `id`
- `subject`
- `chapter`
- `question`
- `options`
- `correct`
- `explanation`
- `difficulty`
- `reviewStatus`

## Option Rules

Each MCQ must have exactly 4 options.

## Explanation Rule

Every MCQ needs a simple explanation.

The explanation helps students learn after they answer.

## Review Status

Use `reviewStatus` before publishing:

- `draft` means raw or AI-generated.
- `checked` means reviewed by a person or teacher.
- `published` means ready for the website.
- `rejected` means not usable.

## Validator Rule

Before publishing an MCQ file, run:

```text
node tools/validate-mcq.js content/english/science/scientific-study/mcq.json
```

`correct` must always be a number from `0` to `3`.
Do not use an answer text field as the main answer.
Every published MCQ must include a non-empty explanation so students can review their answer.
