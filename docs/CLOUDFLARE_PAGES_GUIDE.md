# Cloudflare Pages Guide

SEE2083 is a static website, so it can be hosted directly on Cloudflare Pages.

## Recommended Setup

- Keep the website code in a GitHub repository.
- Use Cloudflare Pages to host the static website.
- Connect the domain through Cloudflare DNS.

## Cloudflare Pages Project Settings

- Framework preset: `None`
- Build command: leave empty
- Build output directory: `/` or root
- Root directory: use `see2083` if the GitHub repository contains a parent folder, otherwise use the repository root.

## Important Notes

- Do not run `npm install`.
- Do not add a build step.
- `index.html` is the entry point.
- Use relative paths for CSS, JS, JSON, and content files.
- Do not upload huge videos directly into the website repository.
- Use Cloudflare R2 later for large files if needed.

## Custom Domain

1. Add the domain in Cloudflare Pages.
2. Make sure DNS is managed by Cloudflare.
3. Enable HTTPS in Cloudflare.

Do not include private account details in the repository.
