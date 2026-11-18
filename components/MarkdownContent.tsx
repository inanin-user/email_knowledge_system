"use client";

import { useEffect, useId, useState } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

function MermaidDiagram({ chart }: { chart: string }) {
  const id = useId().replace(/:/g, "");
  const [svg, setSvg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function renderDiagram() {
      try {
        const mermaid = (await import("mermaid")).default;

        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: "default",
        });

        const result = await mermaid.render(`mermaid-${id}`, chart);

        if (!cancelled) {
          setSvg(result.svg);
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Unable to render Mermaid diagram",
          );
        }
      }
    }

    renderDiagram();

    return () => {
      cancelled = true;
    };
  }, [chart, id]);

  if (error) {
    return (
      <div className="my-3 rounded-lg border border-red-200 bg-red-50 p-3">
        <p className="mb-2 text-xs font-semibold text-red-700">
          Mermaid rendering error
        </p>
        <pre className="overflow-x-auto whitespace-pre-wrap text-xs text-red-800">
          {chart}
        </pre>
        <p className="mt-2 text-xs text-red-600">{error}</p>
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="my-3 rounded-lg border border-[#e5e7eb] p-4 text-sm text-[#9298aa]">
        Rendering diagram...
      </div>
    );
  }

  return (
    <div
      className="my-4 overflow-x-auto rounded-lg border border-[#e5e7eb] bg-white p-4"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

const markdownComponents: Components = {
  pre({ children }) {
    // Mermaid fenced code blocks are rendered as diagrams.
    const child = Array.isArray(children) ? children[0] : children;

    if (
      child &&
      typeof child === "object" &&
      "props" in child &&
      typeof child.props === "object" &&
      child.props !== null &&
      "className" in child.props &&
      typeof child.props.className === "string" &&
      child.props.className.includes("language-mermaid")
    ) {
      const chart =
        "children" in child.props && typeof child.props.children === "string"
          ? child.props.children
          : "";

      return <MermaidDiagram chart={chart.trim()} />;
    }

    return (
      <pre className="my-3 overflow-x-auto rounded-lg bg-[#202535] p-4 text-sm text-white">
        {children}
      </pre>
    );
  },
  a({ href, children }) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#71639a] underline hover:text-[#554579]"
      >
        {children}
      </a>
    );
  },
  table({ children }) {
    return (
      <div className="my-3 overflow-x-auto">
        <table className="w-full border-collapse text-sm">{children}</table>
      </div>
    );
  },
  th({ children }) {
    return (
      <th className="border border-[#e5e7eb] bg-[#f5f6fa] px-3 py-2 text-left font-semibold">
        {children}
      </th>
    );
  },
  td({ children }) {
    return (
      <td className="border border-[#e5e7eb] px-3 py-2 align-top">
        {children}
      </td>
    );
  },
};

export default function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="prose prose-sm max-w-none break-words text-[#30354b]">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={markdownComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}