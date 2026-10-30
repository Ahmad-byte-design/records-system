const DATE_FORMATTER = new Intl.DateTimeFormat('ar-u-nu-latn', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

/** Formats an ISO date for the Arabic UI, using Latin numerals. */
export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return DATE_FORMATTER.format(date);
}

/** Local ISO day (YYYY-MM-DD) used in export file names. */
export function isoDay(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
