/**
 * Minimal, dependency-free `.xlsx` reader.
 *
 * Reads the first worksheet of an Office Open XML workbook: it walks the ZIP
 * central directory, inflates entries with `DecompressionStream('deflate-raw')`
 * (stored entries are read directly), then parses the workbook, shared strings
 * and worksheet XML with `DOMParser`. Only cell values are returned as strings;
 * formatting, formulas and styling are ignored.
 */

export type XlsxSheetData = {
  /** Name of the first worksheet, when available. */
  sheetName: string;
  /** Rows with cell values aligned to their column index. */
  rows: string[][];
};

type ZipEntry = {
  name: string;
  method: number;
  compressedSize: number;
  localOffset: number;
};

const decoder = new TextDecoder('utf-8');
const REL_NS = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
const EOCD_SIGNATURE = 0x06054b50;
const CENTRAL_SIGNATURE = 0x02014b50;
const LOCAL_SIGNATURE = 0x04034b50;

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(copy).set(bytes);
  return copy;
}

async function inflateRaw(bytes: Uint8Array): Promise<Uint8Array> {
  if (typeof DecompressionStream === 'undefined') {
    throw new Error('DECOMPRESSION_UNSUPPORTED');
  }
  const stream = new Blob([toArrayBuffer(bytes)])
    .stream()
    .pipeThrough(new DecompressionStream('deflate-raw'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

function readZipEntries(buffer: ArrayBuffer): ZipEntry[] {
  const view = new DataView(buffer);
  const length = buffer.byteLength;

  let eocd = -1;
  const stop = Math.max(0, length - 22 - 0xffff);
  for (let offset = length - 22; offset >= stop; offset -= 1) {
    if (view.getUint32(offset, true) === EOCD_SIGNATURE) {
      eocd = offset;
      break;
    }
  }
  if (eocd < 0) throw new Error('ZIP_END_NOT_FOUND');

  const count = view.getUint16(eocd + 10, true);
  let pointer = view.getUint32(eocd + 16, true);
  const entries: ZipEntry[] = [];

  for (let index = 0; index < count; index += 1) {
    if (pointer + 46 > length || view.getUint32(pointer, true) !== CENTRAL_SIGNATURE) break;

    const nameLength = view.getUint16(pointer + 28, true);
    const extraLength = view.getUint16(pointer + 30, true);
    const commentLength = view.getUint16(pointer + 32, true);

    entries.push({
      name: decoder.decode(new Uint8Array(buffer, pointer + 46, nameLength)),
      method: view.getUint16(pointer + 10, true),
      compressedSize: view.getUint32(pointer + 20, true),
      localOffset: view.getUint32(pointer + 42, true),
    });

    pointer += 46 + nameLength + extraLength + commentLength;
  }

  return entries;
}

async function extractEntry(buffer: ArrayBuffer, entry: ZipEntry): Promise<Uint8Array> {
  const view = new DataView(buffer);
  if (entry.localOffset + 30 > buffer.byteLength) throw new Error('ZIP_ENTRY_INVALID');
  if (view.getUint32(entry.localOffset, true) !== LOCAL_SIGNATURE) {
    throw new Error('ZIP_ENTRY_INVALID');
  }

  const nameLength = view.getUint16(entry.localOffset + 26, true);
  const extraLength = view.getUint16(entry.localOffset + 28, true);
  const start = entry.localOffset + 30 + nameLength + extraLength;
  if (start + entry.compressedSize > buffer.byteLength) throw new Error('ZIP_ENTRY_INVALID');

  const raw = new Uint8Array(buffer, start, entry.compressedSize);
  if (entry.method === 0) return raw;
  if (entry.method === 8) return inflateRaw(raw);
  throw new Error('ZIP_METHOD_UNSUPPORTED');
}

function parseXml(text: string): Document {
  const doc = new DOMParser().parseFromString(text, 'application/xml');
  if (doc.getElementsByTagName('parsererror').length > 0) throw new Error('XML_INVALID');
  return doc;
}

function collectRichText(element: Element): string {
  let text = '';
  for (const child of Array.from(element.children)) {
    if (child.localName === 't') {
      text += child.textContent ?? '';
    } else if (child.localName === 'r') {
      for (const runChild of Array.from(child.children)) {
        if (runChild.localName === 't') text += runChild.textContent ?? '';
      }
    }
  }
  return text;
}

function parseSharedStrings(xml: string | null): string[] {
  if (!xml) return [];
  const doc = parseXml(xml);
  return Array.from(doc.getElementsByTagName('si')).map(collectRichText);
}

function resolveTarget(target: string): string {
  if (target.startsWith('/')) return target.slice(1);
  return target.startsWith('xl/') ? target : `xl/${target}`;
}

function columnIndex(reference: string): number {
  let index = 0;
  for (const char of reference) {
    const code = char.toUpperCase().charCodeAt(0);
    if (code < 65 || code > 90) continue;
    index = index * 26 + (code - 64);
  }
  return index - 1;
}

function parseSheet(doc: Document, shared: string[]): string[][] {
  const rows: string[][] = [];

  for (const row of Array.from(doc.getElementsByTagName('row'))) {
    const values: string[] = [];
    let nextColumn = 0;

    for (const cell of Array.from(row.getElementsByTagName('c'))) {
      const reference = cell.getAttribute('r');
      const column = reference ? columnIndex(reference) : nextColumn;
      nextColumn = column + 1;
      const type = cell.getAttribute('t');
      let value = '';

      if (type === 'inlineStr') {
        const inline = cell.getElementsByTagName('is')[0];
        value = inline ? collectRichText(inline) : '';
      } else {
        const raw = cell.getElementsByTagName('v')[0]?.textContent ?? '';
        if (type === 's') value = shared[Number(raw)] ?? '';
        else if (type === 'b') value = raw === '1' ? 'TRUE' : 'FALSE';
        else if (type === 'e') value = '';
        else value = raw;
      }

      if (column >= 0) values[column] = value;
    }

    let end = values.length;
    while (end > 0 && !values[end - 1]) end -= 1;
    if (end > 0) rows.push(values.slice(0, end));
  }

  return rows;
}

/** Reads the first worksheet of an `.xlsx` file. */
export async function readXlsx(buffer: ArrayBuffer): Promise<XlsxSheetData> {
  const entries = readZipEntries(buffer);
  const byName = new Map(entries.map((entry) => [entry.name, entry]));

  const read = async (name: string): Promise<string | null> => {
    const entry = byName.get(name);
    if (!entry) return null;
    return decoder.decode(await extractEntry(buffer, entry));
  };

  let sheetName = 'Sheet1';
  let sheetPath = 'xl/worksheets/sheet1.xml';

  const workbookXml = await read('xl/workbook.xml');
  if (workbookXml) {
    const workbook = parseXml(workbookXml);
    const sheet = workbook.getElementsByTagName('sheet')[0];
    if (sheet) {
      sheetName = sheet.getAttribute('name') ?? sheetName;
      const relationId = sheet.getAttribute('r:id') ?? sheet.getAttributeNS(REL_NS, 'id');
      if (relationId) {
        const relsXml = await read('xl/_rels/workbook.xml.rels');
        if (relsXml) {
          const rels = parseXml(relsXml);
          const relation = Array.from(rels.getElementsByTagName('Relationship')).find(
            (item) => item.getAttribute('Id') === relationId,
          );
          const target = relation?.getAttribute('Target');
          if (target) sheetPath = resolveTarget(target);
        }
      }
    }
  }

  if (!byName.has(sheetPath)) {
    const fallback = [...byName.keys()]
      .filter((name) => /^xl\/worksheets\/[^/]+\.xml$/.test(name))
      .sort()[0];
    if (!fallback) throw new Error('XLSX_SHEET_NOT_FOUND');
    sheetPath = fallback;
  }

  const shared = parseSharedStrings(await read('xl/sharedStrings.xml'));
  const sheetXml = await read(sheetPath);
  if (!sheetXml) throw new Error('XLSX_SHEET_NOT_FOUND');

  return { sheetName, rows: parseSheet(parseXml(sheetXml), shared) };
}
