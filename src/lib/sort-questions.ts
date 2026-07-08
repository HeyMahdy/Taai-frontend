/**
 * Smart question label sorter.
 * Handles labels like: 1(a), 1(b)(i), 2(a)(ii), 3(c), 10, Q1, Q2a, etc.
 *
 * Strategy:
 * 1. Parse each label into segments (numbers and letters/roman numerals)
 * 2. Compare segment by segment
 * 3. Numbers compared numerically, letters alphabetically, roman numerals by value
 */

const ROMAN_MAP: Record<string, number> = {
  i: 1, ii: 2, iii: 3, iv: 4, v: 5, vi: 6, vii: 7, viii: 8, ix: 9, x: 10,
  xi: 11, xii: 12, xiii: 13, xiv: 14, xv: 15,
};

function isRoman(s: string): boolean {
  return /^[ivx]+$/i.test(s) && s.toLowerCase() in ROMAN_MAP;
}

function romanValue(s: string): number {
  return ROMAN_MAP[s.toLowerCase()] ?? 0;
}

type Segment = { type: "number"; value: number } | { type: "alpha"; value: string } | { type: "roman"; value: number };

/**
 * Parse a question label into comparable segments.
 * "3(b)(ii)" → [{ type: "number", value: 3 }, { type: "alpha", value: "b" }, { type: "roman", value: 2 }]
 * "1(a)" → [{ type: "number", value: 1 }, { type: "alpha", value: "a" }]
 * "Q2a" → [{ type: "alpha", value: "q" }, { type: "number", value: 2 }, { type: "alpha", value: "a" }]
 */
function parseLabel(label: string): Segment[] {
  const segments: Segment[] = [];
  // Remove common prefixes and clean up
  const cleaned = label.replace(/^[Qq]\.?\s*/, "").trim();

  // Split into tokens: numbers, parenthesized content, standalone letters
  const tokens = cleaned.match(/\d+|[a-zA-Z]+|\([^)]+\)/g) || [];

  for (const token of tokens) {
    // Parenthesized content — extract inner
    const inner = token.startsWith("(") ? token.slice(1, -1) : token;

    // Pure number
    if (/^\d+$/.test(inner)) {
      segments.push({ type: "number", value: parseInt(inner, 10) });
    }
    // Roman numeral
    else if (isRoman(inner)) {
      segments.push({ type: "roman", value: romanValue(inner) });
    }
    // Alphabetic
    else {
      segments.push({ type: "alpha", value: inner.toLowerCase() });
    }
  }

  return segments;
}

function segmentValue(seg: Segment): number {
  switch (seg.type) {
    case "number": return seg.value;
    case "roman": return seg.value;
    case "alpha": {
      // Convert single letter to number (a=1, b=2, ..., z=26)
      if (seg.value.length === 1) return seg.value.charCodeAt(0) - 96;
      // Multi-char: use char code sum as fallback
      return seg.value.split("").reduce((sum, c) => sum + c.charCodeAt(0), 0);
    }
  }
}

function compareSegments(a: Segment[], b: Segment[]): number {
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) {
    const sa = a[i];
    const sb = b[i];

    // Missing segment = comes first
    if (!sa && sb) return -1;
    if (sa && !sb) return 1;
    if (!sa || !sb) return 0;

    const va = segmentValue(sa);
    const vb = segmentValue(sb);

    if (va !== vb) return va - vb;
  }
  return 0;
}

/**
 * Sort an array of items by their question_label field.
 * Handles complex labels like "1(a)", "2(b)(ii)", "3(c)", "10", etc.
 */
export function sortByQuestionLabel<T extends { question_label: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const parsedA = parseLabel(a.question_label);
    const parsedB = parseLabel(b.question_label);
    return compareSegments(parsedA, parsedB);
  });
}
