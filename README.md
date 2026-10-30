# نور الشام للاتصالات — Arabic-first user registry

سجل مستخدمين عربي كامل الواجهة: عرض السجلات، إضافة مستخدم، استيراد وتصدير Excel، وبحث عربي/رقمي.

A feature-based React 18 + Vite 6 app with Zustand persistence, a sky-blue Arabic RTL interface, dependency-free `.xlsx` reading and writing, and an installable, offline-first PWA shell.

## Features

- **Users table** — id, name, phone, identity, and added date for every record, with initial avatars.
- **Arabic-aware search** — matches names regardless of hamza/taa-marbuta/diacritics (`احمد` finds `أحمد`), and matches phone/identity fragments typed in Arabic-Indic or Latin digits.
- **Add user dialog** — inline validation, duplicate phone/identity detection, focus trap, Escape to close, and Arabic-Indic digit normalization.
- **Excel import** — reads `.xlsx` in the browser, recognises Arabic/English headers (`الاسم`, `رقم الهاتف`, `رقم الهوية`, …), normalizes digits, skips duplicates and invalid rows, and reports a summary.
- **Real Excel export** — a styled `.xlsx` (frozen header, auto-filter, RTL sheet, sized columns) generated without any dependency. Export reflects the current search results.
- **Phone lookup page** — a single phone field with live results, match count, and copy-to-clipboard actions.
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

The importer expects a header row containing at least a name column and a phone column; an identity column is optional. Arabic and English header names are both accepted, and a headerless sheet is read positionally as `name, phone, identity`.

- Arabic-Indic and Persian digits are converted to ASCII.
- Phone numbers must contain 7–15 digits; identity numbers, when present, 6–20 digits.
- Rows whose phone or identity already exists are skipped and counted.

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
│   │   ├── components/          # UsersToolbar, UsersTable, AddUserDialog, LedgerStrip
│   │   ├── pages/UsersPage.tsx
│   │   ├── store/useUserStore.ts
│   │   ├── utils/               # searchUsers, exportUsers, importUsers
│   │   ├── types.ts
│   │   └── users.css
│   └── lookup/
│       ├── components/          # PhoneLookupCard, LookupResult
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

- Data lives only in the browser. Clearing site storage resets the seeded records.
- Search normalizes Arabic forms and digits in both directions, so phone numbers are stored as Latin digits while accepting Arabic-Indic input.
- The Excel writer lives in `src/lib/xlsx.ts` and the reader in `src/lib/xlsx-read.ts`; both build/parse the ZIP container and OOXML parts directly, so no spreadsheet dependency is shipped. The reader uses the browser's `DecompressionStream('deflate-raw')` for compressed entries.
- Offline support is self-contained: the worker in `dist/sw.js` is ~100 lines of vanilla JS, with no Workbox or PWA plugin in the dependency tree. `npm run dev` is unaffected because registration is guarded by `import.meta.env.PROD`.
