import katex from "katex";
import "katex/dist/katex.min.css";

/**
 * Renders text with inline LaTeX math expressions.
 * Supports both $...$ (inline) and $$...$$ (display/block) math.
 * Also handles \(...\) and \[...\] delimiters.
 * Preserves newlines as <br /> tags.
 */
export function MathText({ text, className = "" }: { text: string; className?: string }) {
  const html = renderMathInText(text);
  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function renderMathInText(text: string): string {
  // Split by newlines first, process each line, join with <br>
  const lines = text.split("\n");
  const processedLines = lines.map((line) => processLine(line));
  return processedLines.join("<br />");
}

function processLine(text: string): string {
  // First handle display math: $$...$$ or \[...\]
  let result = text.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
    return renderKatex(math.trim(), true);
  });
  result = result.replace(/\\\[([\s\S]*?)\\\]/g, (_, math) => {
    return renderKatex(math.trim(), true);
  });

  // Then handle inline math: $...$ or \(...\)
  result = result.replace(/(?<!\$)\$(?!\$)(.*?)\$/g, (_, math) => {
    return renderKatex(math.trim(), false);
  });
  result = result.replace(/\\\((.*?)\\\)/g, (_, math) => {
    return renderKatex(math.trim(), false);
  });

  return result;
}

function renderKatex(math: string, displayMode: boolean): string {
  try {
    return katex.renderToString(math, {
      displayMode,
      throwOnError: false,
      trust: true,
      strict: false,
    });
  } catch {
    // If KaTeX fails, return the raw text
    return `<code>${escapeHtml(math)}</code>`;
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
