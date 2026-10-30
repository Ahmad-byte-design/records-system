# EngineDocs — Content Guide

Everything you can put in a lesson, and exactly how to add a new one.

This app is **JSON-driven**: a lesson is plain typed data, not a markdown file.
There is no parser to fight — if it validates, it renders.

---

## 1. Adding a new lesson

Two edits. Nothing else.

### Step 1 — add the document

Create or open `src/data/docs/<department>.ts` and append an object to its array.

```ts
// src/data/docs/software-engineering.ts
import type { DocDocument } from '@/types/content';

export const softwareEngineeringDocs: DocDocument[] = [
  // … your existing documents
  {
    id: 'caching-strategies',                  // unique within the department
    department: 'software-engineering',        // must match a department id
    order: 4,                                  // position in the sidebar
    category: 'Fundamentals',                  // must match a category name
    title: 'Caching Strategies',
    summary: 'Why a cache in front of your database is the single biggest win.',
    tags: ['caching', 'redis', 'performance'],
    updatedAt: '2026-10-13',
    sections: [ /* see §4 */ ],
    links: [{ label: 'MDN: HTTP caching', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching' }],
  },
];
```

### Step 2 — register it in the sidebar

Open `src/data/departments.ts` and add its `id` under a category:

```ts
{
  department: 'software-engineering',
  categories: [
    { name: 'Fundamentals', documents: ['how-the-internet-works', 'operating-systems-concurrency', 'caching-strategies'] },
    { name: 'System Design', documents: ['distributed-consensus-raft'] },
  ],
},
```

### Step 3 — verify

```bash
npm run typecheck   # catches every schema mistake
npm run dev
```

If a field is wrong the app throws at load with the exact path, e.g.:

```
Invalid content bundle:
  • documents.0.updatedAt: Expected string, received number
```

That error is intentional. A malformed lesson should break the build, not the reader.

### Ordering rules

- `order` sorts the list **inside** the sidebar.
- The array in `departments.ts` sets the **category order** and which group a doc appears in.
- The two must agree — the sidebar is driven by `departments.ts`, while the breadcrumb and search results show the doc's own `category`. A mismatch shows the doc under one name in the sidebar and another in the breadcrumb.

---

## 2. Department fields

`src/data/departments.ts`

There is currently one department — **Software Engineering** (`software-engineering`). Adding
another is a matter of appending to both `departments` and `departmentIndexes` below.

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | URL segment. Used in `#/d/<id>/<docId>`. |
| `name` | string | Shown in the header pill and breadcrumb. |
| `icon` | `code` \| `link` \| `atom` | Anything else falls back to `code`. |
| `description` | string | Currently unused by the UI — safe to fill in. |
| `order` | number | Position in the switcher. |

`icon` presets: `code` (angle brackets) · `link` (chain) · `atom`.

---

## 3. Document fields

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | string | yes | Unique within the department. |
| `department` | string | yes | Must match a department `id`. |
| `order` | number | yes | Sidebar sort position. |
| `category` | string | yes | Must match a category `name`. |
| `title` | string | yes | Rendered as the H1. |
| `summary` | string | yes | Emerald sub-heading under the title. |
| `tags` | string[] | yes | Rendered as `#tag` pills, also searchable. |
| `updatedAt` | string | yes | `YYYY-MM-DD`. Rendered `DD/MM/YYYY`. |
| `sections` | Section[] | yes | The body. |
| `links` | Link[] | no | Optional references row at the end. |

A **Section** is `{ id, heading, blocks }`:

- `id` — becomes the anchor (`#id`) and the "On this page" entry. Keep it short and kebab-case.
- `heading` — the H2.
- `blocks` — an array of the block types below.

---

## 4. Block types

There are **six**. Import the type and let your editor autocomplete the rest.

```ts
import type { DocBlock } from '@/types/content';

const block: DocBlock = { type: 'paragraph', text: '…' };
```

### `paragraph`

Prose. One paragraph per block — for two paragraphs, use two blocks.

```ts
{ type: 'paragraph', text: 'Every component re-renders on state change, but not every render touches the DOM.' }
```

**Inline formatting works inside paragraphs, list items and callouts:**

| Syntax | Result |
| --- | --- |
| `` `useMemo` `` | inline code chip |
| `**important**` | bold |

Inline `code` turns the text dark green on light, bright green on dark.

### `list`

```ts
{ type: 'list', ordered: false, items: ['First item', 'Second item'] }
{ type: 'list', ordered: true,  items: ['Step one', 'Step two'] }
```

- `ordered: true` renders numbered markers in emerald monospace.
- `ordered: false` renders **without bullets** — a deliberate choice in this design, matching the Stitch layout. If you want bullets, use a separate `ordered` callout style or add `list-disc` in `BlockRenderer.tsx`.

### `callout`

Four variants, each with its own colour, icon and meaning.

| Variant | Colour | Icon | Use for |
| --- | --- | --- | --- |
| `info` | emerald | lightbulb | Principles, key takeaways |
| `tip` | sky | check-circle | Practical advice, "do this instead" |
| `warning` | amber | triangle | Misconfiguration, footguns |
| `danger` | rose | octagon | Data loss, irreversible outcomes |

```ts
{
  type: 'callout',
  variant: 'warning',
  title: 'Congestion control warning',   // optional
  text: 'Misconfigured BBR can trigger bufferbloat in high-traffic reverse proxies.',
}
```

The `title` renders uppercase and letter-spaced. **Use it as a short label, not a sentence** — "Key architecture principle", not "This is a key principle that…".

No `title` = a plain note box with just the body.

### `code`

```ts
{
  type: 'code',
  language: 'ts',
  filename: 'quic-client-socket.ts',   // optional
  highlight: [2, 6],                   // optional — 1-based line numbers
  code: [
    "import { createQuicSocket } from 'node:net';",
    '',
    'const client = createQuicSocket();',
  ].join('\n'),
}
```

- `highlight` paints those lines with an emerald wash and a left bar. Use it for **the two or three lines that matter**, not the whole snippet.
- Writing the array with `.join('\n')` keeps long lines readable in source. A plain template literal also works.
- The `Copy` button copies the raw `code` string.
- Long lines scroll horizontally inside the block rather than wrapping.

**Supported `language` values** — these decide comment highlighting:

| C-style (`//`) | Hash-style (`#`) | Aliases |
| --- | --- | --- |
| `ts`, `tsx`, `js`, `jsx`, `go` | `python`, `bash` | `rs` → `rust`, `py` → `python`, `sh` → `bash` |

Any other value still renders — keywords, strings, numbers and call sites are highlighted — but comment lines may not be detected. To add a language, add a key to `COMMENT_MARKERS` in `src/lib/highlight.ts`.

### `table`

```ts
{
  type: 'table',
  caption: 'Scheduler families and their tradeoffs',   // optional
  columns: ['Policy', 'Runs until', 'Best for'],
  rows: [
    ['Round Robin', 'Quantum expires', 'Fairness and predictability'],
    ['Priority', 'Task blocks or preempts', 'Latency-critical workloads'],
  ],
}
```

- `rows` is an array of arrays. **Keep every row the same length as `columns`** — nothing validates this, and a short row just renders fewer cells.
- The first column is emphasised; the rest are muted.
- Wide tables scroll horizontally.

### `image`

```ts
{ type: 'image', src: '/diagrams/packet-flow.png', alt: 'A TCP handshake spanning three hosts', caption: 'The three-way handshake.' }
```

- `src` — put files in `public/` and use a root-relative path (`/diagrams/x.png`).
- `alt` is **required**. Write it for someone who cannot see the image; it is read by screen readers.
- Images fill the content width and load lazily.

---

## 5. Document-level links

```ts
links: [
  { label: 'MDN: HTTP Protocol Guide', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP' },
  { label: 'RFC 9000: QUIC Multiplexed Transport', url: 'https://www.rfc-editor.org/rfc/rfc9000' },
]
```

Rendered as outlined cards that open in a new tab. `url` must be a **valid absolute URL** — Zod rejects relative paths. `links` is optional and belongs to the document, not to a section.

---

## 6. Reference — every block field at a glance

```ts
{ type: 'paragraph', text: string }
{ type: 'list', ordered: boolean, items: string[] }
{ type: 'callout', variant: 'info'|'tip'|'warning'|'danger', title?: string, text: string }
{ type: 'code', language: string, filename?: string, highlight?: number[], code: string }
{ type: 'table', caption?: string, columns: string[], rows: string[][] }
{ type: 'image', src: string, alt: string, caption?: string }
```

---

## 7. Search

Lessons are indexed automatically at load. The index covers:

- `title` — highest weight (exact = 120, prefix = 60, contains = 40)
- `summary`, `tags`, `category` — lower weight
- **section headings** — a lesson is findable by a topic you only mention in a subheading

Practical consequence: if you want a lesson to surface for "quic", put `quic` in `tags`, not only in the body.

---

## 8. House style

Consistency is what makes a docs platform feel intentional.

- **Titles** — sentence case. "How the Internet Works & HTTP/3 Architecture", not "How The Internet Works…"
- **Summaries** — one sentence, plain language, no marketing. Say what the reader will learn.
- **Tags** — lowercase, hyphenated, no `#`.
- **Section headings** — short and specific. "Packet Flow & Layer Isolation", not "Some More Information".
- **Line length** — the reader caps at roughly 68 characters. Break long explanations across blocks rather than widening the column.
- **Callout titles** — 2–4 words.

---

## 9. Arabic and right-to-left content

You can write lessons in Arabic (or any mix of Arabic and English) with no extra configuration.

- **Direction is automatic.** Paragraphs, list items, callouts, headings and table cells carry
  `dir="auto"`, so each one picks its own direction from its first strong character. A paragraph
  starting with an English term stays left-to-right; one starting with Arabic flows right-to-left.
- **Tables pick their own direction.** A `<table>` cannot use `dir="auto"` — it holds no text of
  its own, only child elements, so the browser would always fall back to LTR. Instead the first
  column header (or the caption) decides. An Arabic-headed table reads right-to-left; a table
  headed in English stays left-to-right.
- **Fonts.** Inter covers Latin and Noto Sans Arabic covers Arabic. Bilingual lines mix both
  within a single paragraph and switch fonts automatically.
- **Letter-spaced labels are neutralised in RTL.** Arabic is a connected script with no letter
  case, so `text-transform: uppercase` and `letter-spacing` would break the joins. Callout
  titles, table headers and sidebar categories drop both automatically inside RTL content.

### Reading order

Columns and list numbers follow the resolved direction. In an RTL table the **first** column in
your source renders on the **right**, which is what an Arabic reader expects. Nothing in the
content needs reversing — write it in logical order and let the renderer place it.

## 10. Common mistakes

| Symptom | Cause |
| --- | --- |
| `Invalid content bundle` at load | A field is missing, misspelled or the wrong type. The message names the exact path. |
| Lesson missing from the sidebar | Its `id` is not listed under a category in `departments.ts`. |
| Doc shows a different name in the sidebar and breadcrumb | `category` on the document does not match the category it is filed under. |
| Ordered list has no numbers | `ordered` must be the boolean `true`, not the string `"true"`. |
| Code block comment colours look wrong | `language` is misspelled. See the table in §4. |
| Link card does not render | `url` is relative. It must start with `https://`. |
| Lesson appears at the wrong position | Another document in the same department has the same `order`. |

---

## 11. Where things live

| Path | Purpose |
| --- | --- |
| `src/types/content.ts` | Zod schemas — the source of truth |
| `src/data/departments.ts` | Departments, sidebar categories and order |
| `src/data/docs/*.ts` | The lessons themselves |
| `src/data/index.ts` | Assembles and validates the bundle |
| `src/lib/highlight.ts` | Code tokeniser + language table |
| `src/lib/rtl.ts` | Direction detection for mixed-script content |
| `src/components/blocks/BlockRenderer.tsx` | Renders all six block types |