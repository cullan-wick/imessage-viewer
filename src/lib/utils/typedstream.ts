/**
 * Extract plain text from iMessage attributedBody blobs.
 *
 * macOS stores message text in two places:
 *  - message.text  (plain TEXT column – often NULL on newer macOS)
 *  - message.attributedBody  (BLOB – NeXTSTEP "typedstream" archive of NSAttributedString)
 *
 * This module reads the typedstream blob and returns the embedded UTF-8 string.
 */

const NS_STRING_MARKER = Buffer.from('NSString');

/**
 * Read a typedstream length value starting at `offset`.
 * Returns [length, bytesConsumed].
 *
 * Encoding:
 *  - If first byte < 0x80 → single-byte length
 *  - If first byte >= 0x80 → (byte & 0x7F) gives the number of
 *    subsequent bytes that encode the length as a little-endian integer.
 */
function readLength(buf: Buffer, offset: number): [number, number] {
  if (offset >= buf.length) return [0, 0];

  const first = buf[offset];
  if (first < 0x80) {
    return [first, 1];
  }

  const byteCount = first & 0x7f;
  if (byteCount === 0 || offset + 1 + byteCount > buf.length) {
    return [0, 1];
  }

  let length = 0;
  for (let i = 0; i < byteCount; i++) {
    length |= buf[offset + 1 + i] << (8 * i);
  }

  return [length, 1 + byteCount];
}

/**
 * Extract the plain-text content from an `attributedBody` blob.
 * Returns `null` when the blob is missing, empty, or unparseable.
 */
export function extractTextFromAttributedBody(blob: Buffer | null): string | null {
  if (!blob || blob.length === 0) return null;

  try {
    // Locate the NSString class marker
    const markerIndex = blob.indexOf(NS_STRING_MARKER);
    if (markerIndex === -1) return null;

    // After the marker there are 5 archive-framing bytes: 01 94 84 01 2B
    const lengthOffset = markerIndex + NS_STRING_MARKER.length + 5;
    if (lengthOffset >= blob.length) return null;

    const [textLength, consumed] = readLength(blob, lengthOffset);
    if (textLength === 0) return null;

    const textStart = lengthOffset + consumed;
    const textEnd = textStart + textLength;
    if (textEnd > blob.length) return null;

    const text = blob.subarray(textStart, textEnd).toString('utf-8');

    // Trim the Unicode object-replacement character (U+FFFC) that Apple
    // uses as a placeholder for inline attachments.
    return text.replace(/\uFFFC/g, '').trim() || null;
  } catch {
    return null;
  }
}
