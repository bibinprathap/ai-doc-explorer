import React from "react";

interface DocumentMetadata {
  source?: string;
  blobType?: string;
  pdf?: {
    version?: string;
    totalPages?: number;
    info?: {
      Title?: string;
      Creator?: string;
      Producer?: string;
      PDFFormatVersion?: string;
    };
  };
  loc?: {
    pageNumber?: number;
  };
  [key: string]: unknown;
}

interface DocumentSource {
  pageContent: string;
  metadata: DocumentMetadata;
}

interface FlowiseDocumentViewerProps {
  documents: DocumentSource[];
}

/**
 * A component that displays document sources in a style similar to AI APP
 */
export default function FlowiseDocumentViewer({
  documents,
}: FlowiseDocumentViewerProps) {
  if (!documents || documents.length === 0) {
    return null;
  }

  const getDocumentTitle = (doc: DocumentSource, index: number): string => {
    if (doc.metadata?.pdf?.info?.Title) {
      return String(doc.metadata.pdf.info.Title);
    }

    if (typeof doc.metadata?.source === "string") {
      return doc.metadata.source;
    }

    return `Document ${index + 1}`;
  };

  const formatTableOfContents = (content: string): React.ReactNode => {
    const chapterPattern = /(\d+)\.\s+\[(Chapter \d+:.*?)\]\(#(chapter-\d+)\)/g;
    const matches = [];
    let match;

    while ((match = chapterPattern.exec(content)) !== null) {
      matches.push(match);
    }

    if (matches.length > 0) {
      return (
        <div className="markdown-toc">
          <h2 className="text-xl font-bold mb-3 text-orange-700">
            {content.split("\n")[0].replace("#", "").trim()}
          </h2>

          <div className="grid gap-1">
            {matches.map((match, index) => (
              <div key={index} className="flex items-baseline">
                <span className="mr-2 text-gray-500">{match[1]}.</span>
                <span className="text-blue-600 hover:underline cursor-pointer">
                  {match[2]}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return formatContent(content);
  };

  const isMarkdownContent = (content: string): boolean => {
    // Simple check for common markdown patterns
    return (
      content.includes("#") ||
      content.includes("---") ||
      content.includes("```") ||
      content.includes("|") ||
      content.includes("*") ||
      content.match(/\[.*?\]\(.*?\)/) !== null
    );
  };

  const isTableOfContents = (content: string): boolean => {
    return (
      content.includes("Table of Contents") ||
      (content.includes("Chapter") && content.includes("#chapter-")) ||
      content.match(/\d+\.\s+\[Chapter \d+:.*?\]\(#chapter-\d+\)/) !== null
    );
  };

  const formatContent = (content: string): React.ReactNode => {
    if (isMarkdownContent(content)) {
      if (isTableOfContents(content)) {
        return formatTableOfContents(content);
      }

      const lines = content.split("\n");
      return (
        <div className="markdown-content">
          {lines.map((line, i) => {
            // Handle headings
            if (line.startsWith("# ")) {
              return (
                <h1 key={i} className="text-2xl font-bold my-3 text-orange-700">
                  {line.substring(2)}
                </h1>
              );
            }
            if (line.startsWith("## ")) {
              return (
                <h2 key={i} className="text-xl font-bold my-2 text-orange-700">
                  {line.substring(3)}
                </h2>
              );
            }
            if (line.startsWith("### ")) {
              return (
                <h3 key={i} className="text-lg font-bold my-2 text-orange-600">
                  {line.substring(4)}
                </h3>
              );
            }

            // Handle lists
            if (line.match(/^\s*-\s+/)) {
              return (
                <li key={i} className="ml-4">
                  {line.replace(/^\s*-\s+/, "")}
                </li>
              );
            }

            // Handle chapter references
            if (line.includes("[Chapter") && line.includes("](#chapter-")) {
              return (
                <div
                  key={i}
                  className="text-blue-600 hover:underline cursor-pointer"
                >
                  {line}
                </div>
              );
            }

            // Handle anchor tags
            if (line.includes("<a id='chapter-")) {
              return (
                <div key={i} className="text-xs text-gray-400">
                  {line}
                </div>
              );
            }

            // Handle horizontal rules
            if (line.trim() === "---") {
              return <hr key={i} className="my-3 border-gray-300" />;
            }

            // Handle paragraphs with proper text formatting
            if (line.trim() !== "") {
              return (
                <p key={i} className="my-1.5 leading-relaxed">
                  {line}
                </p>
              );
            }

            // Empty line spacing
            return <div key={i} className="h-2"></div>;
          })}
        </div>
      );
    }

    return <pre className="whitespace-pre-wrap">{content}</pre>;
  };

  return (
    <div className="mt-4">
      <h3 className="text-lg font-medium mb-2">
        Source Documents ({documents.length})
      </h3>

      <div className="space-y-5">
        {documents.map((doc, index) => (
          <div
            key={index}
            className="border rounded-lg shadow-sm overflow-hidden"
          >
            {/* Document Header */}
            <div className="bg-gray-100 px-4 py-3 border-b flex justify-between items-center">
              <div className="font-medium text-gray-800">
                {getDocumentTitle(doc, index)}
              </div>
              {doc.metadata.loc?.pageNumber && (
                <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                  Page {doc.metadata.loc.pageNumber}
                  {doc.metadata.pdf?.totalPages
                    ? ` of ${doc.metadata.pdf.totalPages}`
                    : ""}
                </span>
              )}
            </div>

            {/* Document Content */}
            <div className="px-4 py-3">
              <div
                className="bg-white p-4 rounded-md border overflow-auto"
                style={{ maxHeight: "500px" }}
              >
                {formatContent(doc.pageContent)}
              </div>

              {/* Metadata (collapsed by default) */}
              <details className="mt-3">
                <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                  View Metadata
                </summary>
                <div
                  className="mt-2 p-3 bg-gray-50 border rounded-md overflow-auto text-xs"
                  style={{ maxHeight: "200px" }}
                >
                  <pre>{JSON.stringify(doc.metadata, null, 2)}</pre>
                </div>
              </details>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
