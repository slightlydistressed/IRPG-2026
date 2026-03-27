# IRPG-2026

Cleaned starter scaffold for a Vite + React + TypeScript rebuild.

## Deployment (GitHub Pages)

This project deploys to GitHub Pages via a GitHub Actions workflow. The workflow
builds the Vite app and publishes the compiled `dist/` output — **it does not
serve raw source files from the repository**.

### One-time setup

Before the first deployment you must tell GitHub to use the workflow-based
source instead of the default "Deploy from a branch" setting:

1. Open the repository on GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **GitHub Actions**.
4. Save.

Once this is done, every push to `main` will trigger the deploy workflow
(`.github/workflows/deploy.yml`) and publish the latest build automatically.
You can also trigger it manually from the **Actions** tab via
**"Deploy to GitHub Pages" → Run workflow**.

## Development

```bash
npm install      # install dependencies
npm run dev      # start local dev server (http://localhost:5173)
npm run build    # production build → dist/
npm run preview  # preview the production build locally
npm run type-check  # TypeScript type-check without emitting
```

## What was cleaned

- Renamed mangled source filenames like `src__pages__ManualPage.tsx` to `ManualPage.tsx`
- Filled previously blank text/code/config files
- Kept binary placeholders (PDF, PNG icons/images) as placeholders

## Remaining placeholders

These still need real assets copied in:

- `public/pdf/pms461.pdf`
- `public/icons/*.png`
- `public/img/*.png`
- `public/vendor/pdfjs/pdf.mjs`
- `public/vendor/pdfjs/pdf.worker.mjs`

