# Repository Setup Requirements

This file provides prerequisites and quick, repeatable steps so anyone can set up and run the project locally with minimal friction.

## Prerequisites

- Node.js `>=20` (LTS recommended)
- Git `>=2.39`
- Package manager: `pnpm` (recommended) or `npm`
  - Install pnpm globally: `npm install -g pnpm`

## Environment Variables

Create a `.env` file at the repo root. You can start from the provided example:

- `VITE_CLERK_PUBLISHABLE_KEY` — Clerk publishable key used for auth-related UI. If you don’t use Clerk locally, you can leave it empty and most pages will still run. Get a key from your Clerk dashboard if needed.

Windows PowerShell:

```
copy .env.example .env
```

macOS/Linux:

```
cp .env.example .env
```

## Quick Start (Windows PowerShell)

1. Clone the repository
   - `git clone <your-repo-url>`
   - `cd <repo-folder>`
2. Prepare environment
   - `copy .env.example .env`
   - Edit `.env` and set `VITE_CLERK_PUBLISHABLE_KEY` if available
3. Install dependencies
   - `pnpm install` (recommended) or `npm install`
4. Start the dev server
   - `pnpm dev` or `npm run dev`
   - The dev server runs on a Vite port (commonly `http://localhost:5173/`; it may choose another if busy).

## Common Commands

- Development: `pnpm dev` or `npm run dev`
- Build: `pnpm build` or `npm run build`
- Preview production build: `pnpm preview` or `npm run preview`
- Lint: `pnpm lint` or `npm run lint`
- Format (write): `pnpm format` or `npm run format`
- Format (check): `pnpm format:check` or `npm run format:check`

## Notes & Troubleshooting

- Ensure Node.js is `>=20`. Older versions can cause Vite/Tailwind issues.
- If the dev server complains about a busy port, it will auto-pick another port; check terminal output for the actual URL.
- If auth UI complains about missing Clerk keys, set `VITE_CLERK_PUBLISHABLE_KEY` in `.env` or leave it blank to proceed without Clerk.
- On fresh Windows setups, if `pnpm install` fails due to path length, enable long paths: `git config --system core.longpaths true`.

## Optional Tools

- Editor: VS Code with the following extensions is helpful:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense

## Project Stack Reference

- Vite + React + TypeScript
- Tailwind CSS (Radix UI via shadcn components)
- Scripts available in `package.json` (see Common Commands)

