import { Fragment } from 'react';
import { splitHighlight } from '@/lib/arabic';

type HighlightedTextProps = {
  text: string;
  query: string;
};

/** Renders the first Arabic/digit-aware match of a query inside a <mark>. */
export function HighlightedText({ text, query }: HighlightedTextProps) {
  const parts = splitHighlight(text, query);

  return (
    <>
      {parts.map((part, index) =>
        part.match ? (
          <mark key={index}>{part.text}</mark>
        ) : (
          <Fragment key={index}>{part.text}</Fragment>
        ),
      )}
    </>
  );
}
