# نور الشام للاتصالات — Arabic-first user registry

سجل مستخدمين عربي كامل الواجهة: عرض السجلات، إضافة مستخدم بالاسم واسم المستخدم وكلمة المرور، استيراد وتصدير Excel، والبحث بالاسم.

A feature-based React 18 + Vite 6 app with Zustand persistence, a sky-blue Arabic RTL interface, dependency-free `.xlsx` reading and writing, and an installable, offline-first PWA shell.

## Features

- **Users table** — id, name, username, password, and added date for every record, ordered newest first, with initial avatars.
- **Arabic-aware search** — filters by name regardless of hamza/taa-marbuta/diacritics (`احمد` finds `أحمد`) and letter case.
- **Add/edit user dialog** — the same name, username and password text fields open blank for a new record or pre-filled for an existing one, with inline validation, duplicate-username detection, focus trap, and Escape to close.
- **Delete records** — a delete action on every row opens a confirmation popup showing the record; cancelling or pressing Escape keeps it, confirming removes it from this device immediately.
- **Excel import** — reads `.xlsx` in the browser, recognises Arabic/English headers (`الاسم`, `اسم المستخدم`, `كلمة المرور`, …), skips duplicate usernames and invalid rows, and reports a summary.
- **Real Excel export** — a styled `.xlsx` (frozen header, auto-filter, RTL sheet, sized columns) generated without any dependency. Export reflects the current search results.
- **Name lookup page** — a single name field with live results, match count, and copy-to-clipboard actions for the username and password.
- **Installable PWA** — web app manifest, maskable icons, and a build-generated service worker that precaches the app shell, so the registry opens and works with no network after the first visit. Chrome/Edge/Android show an in-app install button; iOS gets share-sheet guidance. Installed windows cover the notch with safe-area insets.
- **Zustand + localStorage** — records persist under `sijil:users:v1` (key kept from the previous release so existing data survives).
- **Responsive & accessible** — mobile navigation, keyboard focus states, skip link, live regions, reduced-motion support.

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production build
npm run preview
npm run typecheck
```

## Install & offline

The service worker is production-only: `npm run dev` deliberately skips registration so Vite's module graph is never cached. To try the PWA, run `npm run build && npm run preview` and open the preview URL.

- After the first successful visit the shell, icons and hashed chunks are precached; reloading or launching from the home screen then works with the network disabled.
- Add to home screen/desktop from the browser menu, or use the install banner that appears when the browser offers a prompt. Dismissing it hides it for 30 days (`nour:install-dismissed-at`).
- A new build installs immediately and shows an update notice; reload to run it.
- Google Fonts are cached at runtime once they have loaded, so typography survives offline too; otherwise the system Arabic fallbacks are used.

PWA installation and service workers require a secure context: `https://` in production, or `localhost` during development.

`public/manifest.webmanifest` and `public/icons/*` are static. The worker itself is generated into `dist/sw.js` on every build by the plugin in `vite.config.ts`, which fingerprints the emitted files and writes the matching precache list.

## Importing a sheet

The importer expects a header row containing at least name and username columns; a password column is required for a row to be imported. Arabic and English header names are both accepted, and a headerless sheet is read positionally as `name, username, password`.

- Names and usernames need at least two characters; passwords cannot be empty.
- Usernames are compared case-insensitively; rows whose username already exists are skipped and counted.
- Sheets exported by the earlier phone/identity version are still readable: phone becomes username and identity becomes password.

## Project layout

```
src/
├── app/App.tsx                  # Shell + hash-route switch
├── hooks/
│   ├── useHashRoute.ts          # #/users and #/search
│   └── useInstallPrompt.ts      # Install prompt / iOS guidance / dismissal
├── components/
│   ├── layout/                  # AppHeader, PageHeader, AppFooter
│   ├── pwa/                     # InstallPrompt
│   └── ui/                      # Button, Modal, Avatar, Toaster, HighlightedText
├── features/
│   ├── users/
│   │   ├── components/          # UsersToolbar, UsersTable, UserFormDialog, DeleteUserDialog, LedgerStrip
│   │   ├── pages/UsersPage.tsx
│   │   ├── store/useUserStore.ts
│   │   ├── utils/               # searchUsers, exportUsers, importUsers
│   │   ├── types.ts
│   │   └── users.css
│   └── lookup/
│       ├── components/          # NameLookupCard, LookupResult
│       ├── pages/LookupPage.tsx
│       └── lookup.css
├── lib/
│   ├── arabic.ts                # Arabic folding, digit normalization, highlighting
│   ├── pwa.ts                   # Service worker registration, update + network toasts
│   ├── xlsx.ts                  # Minimal OOXML/ZIP workbook writer
│   ├── xlsx-read.ts             # Dependency-free XLSX/ZIP reader
│   ├── date.ts
│   └── cn.ts
├── stores/useToastStore.ts
└── styles/                      # tokens, base, shared components

public/
├── manifest.webmanifest         # PWA metadata + shortcuts
├── icons/                       # 192/512/maskable/Apple touch icons
└── favicon.svg

vite.config.ts                   # Builds dist/sw.js with a fingerprinted precache list
```

Styles are split into design tokens (`tokens.css`), global base, shared components, and feature-local CSS. Arabic display text uses Alexandria with Noto Kufi/Sans fallbacks; Latin numerals use IBM Plex Mono.

## Notes

- Data lives only in the browser. A new device starts with an empty registry; clearing site storage resets it.
- Editing keeps the record's original creation time and position in the newest-first list; changes are saved immediately.
- Deleting a record removes it from this browser immediately; there is no undo, so the confirmation popup shows the name and username before you commit.
- The store migrates older browser data automatically: the v1 demo rows (ids 1–7) are dropped and phone/identity values are carried over as username/password, so records added on an earlier version survive.
- Search normalizes Arabic forms (hamza/taa-marbuta/diacritics) and Latin letter case, so `احمد` finds `أحمد` and `AHMAD` finds `ahmad`.
- Passwords are stored as plain text in this browser profile, because the field is deliberately a visible text input; the registry never sends them anywhere.
- The Excel writer lives in `src/lib/xlsx.ts` and the reader in `src/lib/xlsx-read.ts`; both build/parse the ZIP container and OOXML parts directly, so no spreadsheet dependency is shipped. The reader uses the browser's `DecompressionStream('deflate-raw')` for compressed entries.
- Offline support is self-contained: the worker in `dist/sw.js` is ~100 lines of vanilla JS, with no Workbox or PWA plugin in the dependency tree. `npm run dev` is unaffected because registration is guarded by `import.meta.env.PROD`.
