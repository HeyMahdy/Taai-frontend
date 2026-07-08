import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import katex from "katex";
import "katex/dist/katex.min.css";

/**
 * Renders markdown content with LaTeX math support.
 * Handles both $...$ inline math and $$...$$ display math within markdown.
 */
export function MarkdownRender({ content, className = "" }: { content: string; className?: string }) {
  // Pre-process: convert LaTeX delimiters to placeholders that won't be eaten by markdown
  const processed = preprocessMath(content);

  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h1 className="text-lg font-bold mt-4 mb-2">{children}</h1>,
          h2: ({ children }) => <h2 className="text-base font-bold mt-4 mb-2">{children}</h2>,
          h3: ({ children }) => <h3 className="text-sm font-bold mt-3 mb-1.5">{children}</h3>,
          h4: ({ children }) => <h4 className="text-sm font-semibold mt-2 mb-1">{children}</h4>,
          p: ({ children }) => <p className="mb-2 leading-relaxed">{children}</p>,
          ul: ({ children }) => <ul className="mb-2 ml-4 space-y-1 list-disc">{children}</ul>,
          ol: ({ children }) => <ol className="mb-2 ml-4 space-y-1 list-decimal">{children}</ol>,
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          code: ({ children, className: codeClass }) => {
            const isBlock = codeClass?.includes("language-");
            if (isBlock) {
              return <pre className="my-2 p-3 rounded-md bg-muted/50 border border-border overflow-x-auto text-xs"><code>{children}</code></pre>;
            }
            // Check if it's a math placeholder
            const text = String(children);
            if (text.startsWith("MATH_INLINE:")) {
              const math = text.replace("MATH_INLINE:", "");
              return <span dangerouslySetInnerHTML={{ __html: renderKatex(math, false) }} />;
            }
            if (text.startsWith("MATH_DISPLAY:")) {
              const math = text.replace("MATH_DISPLAY:", "");
              return <div dangerouslySetInnerHTML={{ __html: renderKatex(math, true) }} />;
            }
            return <code className="px-1 py-0.5 rounded bg-muted text-xs font-mono">{children}</code>;
          },
          blockquote: ({ children }) => <blockquote className="border-l-2 border-primary/30 pl-3 my-2 text-muted-foreground italic">{children}</blockquote>,
          hr: () => <hr className="my-3 border-border" />,
          a: ({ href, children }) => <a href={href} className="text-primary underline" target="_blank" rel="noopener noreferrer">{children}</a>,
          table: ({ children }) => (
            <div className="my-3 overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-xs border-collapse">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-muted/50 border-b border-border">{children}</thead>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-muted/30 transition-colors last:border-b-0">{children}</tr>
          ),
          th: ({ children }) => (
            <th className="px-3 py-2 text-left font-semibold text-muted-foreground align-middle">{children}</th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 border-b border-border align-middle last:border-b-0">{children}</td>
          ),
        }}
      >
        {processed}
      </ReactMarkdown>
    </div>
  );
}

function preprocessMath(text: string): string {
  if (!text) return "";

  let result = text;

  // 1. Replace block math: \[ ... \] or \\[ ... \\]
  result = result.replace(/(?:\\\[|\\\\\[)([\s\S]*?)(?:\\\]|\\\\\])/g, (_, math) => {
    return `\`MATH_DISPLAY:${math.trim()}\``;
  });

  // Replace $$...$$ with code blocks that we'll render as math
  result = result.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
    return `\`MATH_DISPLAY:${math.trim()}\``;
  });

  // 2. Replace inline math: \( ... \) or \\( ... \\)
  result = result.replace(/(?:\\\(|\\\\\()([\s\S]*?)(?:\\\)|\\\\\))/g, (_, math) => {
    return `\`MATH_INLINE:${math.trim()}\``;
  });

  // Replace $...$ with inline code that we'll render as math (avoiding currency like $5)
  result = result.replace(/(?<!\$)\$(?!\$)([^$\n]+?)\$/g, (_, math) => {
    return `\`MATH_INLINE:${math.trim()}\``;
  });

  // 3. Fallback: Parse literal "( ... )" where the content inside has LaTeX commands starting with a backslash
  result = result.replace(/(?<!\\)\(([^)\n]*\\[a-zA-Z]+[^)\n]*)\)/g, (_, math) => {
    return `\`MATH_INLINE:${math.trim()}\``;
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
    return `<code>${math}</code>`;
  }
}
