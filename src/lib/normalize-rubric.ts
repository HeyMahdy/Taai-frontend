import type { RubricDescription, RubricCriteria, RubricPenalty } from "@/lib/api";

/**
 * Normalize rubric_description from various AI output formats into the standard format:
 * { criteria: [{points, description}], penalties: [{deduction, condition}], fatal_flaw: string|null }
 *
 * Known non-standard formats from AI:
 * - { criteria: [{mark, for}], marks_total } — uses "mark" instead of "points", "for" instead of "description"
 * - { criteria: [{points, description}], penalties: [...], fatal_flaw } — already standard
 * - Could be a plain string or other unexpected shape
 */
export function normalizeRubricDescription(raw: unknown): RubricDescription {
  const fallback: RubricDescription = { criteria: [], penalties: [], fatal_flaw: null };

  if (!raw || typeof raw !== "object") return fallback;

  const obj = raw as Record<string, unknown>;

  // Normalize criteria
  let criteria: RubricCriteria[] = [];
  if (Array.isArray(obj.criteria)) {
    criteria = obj.criteria.map((item: Record<string, unknown>) => {
      // Standard format: { points, description }
      if ("points" in item && "description" in item) {
        return { points: Number(item.points) || 0, description: String(item.description || "") };
      }
      // Non-standard: { mark, for }
      if ("mark" in item && "for" in item) {
        return { points: Number(item.mark) || 0, description: String(item.for || "") };
      }
      // Non-standard: { marks, description }
      if ("marks" in item && "description" in item) {
        return { points: Number(item.marks) || 0, description: String(item.description || "") };
      }
      // Non-standard: { score, text }
      if ("score" in item && "text" in item) {
        return { points: Number(item.score) || 0, description: String(item.text || "") };
      }
      // Fallback: try to extract any number and string
      const numKey = Object.keys(item).find((k) => typeof item[k] === "number");
      const strKey = Object.keys(item).find((k) => typeof item[k] === "string" && k !== numKey);
      return {
        points: numKey ? Number(item[numKey]) : 0,
        description: strKey ? String(item[strKey]) : JSON.stringify(item),
      };
    });
  }

  // Normalize penalties
  let penalties: RubricPenalty[] = [];
  if (Array.isArray(obj.penalties)) {
    penalties = obj.penalties.map((item: Record<string, unknown>) => {
      // Standard: { deduction, condition }
      if ("deduction" in item && "condition" in item) {
        return { deduction: Number(item.deduction) || 0, condition: String(item.condition || "") };
      }
      // Non-standard: { marks, for }
      if ("marks" in item && "for" in item) {
        return { deduction: Number(item.marks) || 0, condition: String(item.for || "") };
      }
      // Fallback
      const numKey = Object.keys(item).find((k) => typeof item[k] === "number");
      const strKey = Object.keys(item).find((k) => typeof item[k] === "string" && k !== numKey);
      return {
        deduction: numKey ? Number(item[numKey]) : 0,
        condition: strKey ? String(item[strKey]) : JSON.stringify(item),
      };
    });
  }

  // Normalize fatal_flaw
  let fatal_flaw: string | null = null;
  if (typeof obj.fatal_flaw === "string" && obj.fatal_flaw.trim()) {
    fatal_flaw = obj.fatal_flaw;
  }

  return { criteria, penalties, fatal_flaw };
}
