import React, { useState } from "react";
import {
  extractAllSourceContent,
  FlowiseResponse,
  DocumentSource,
} from "@/services/flowiseService";

const isMarkdownContent = (content: string): boolean => {
  return (
    content.includes("#") ||
    content.includes("---") ||
    content.includes("[Chapter") ||
    content.includes("Table of Contents") ||
    content.match(/\[.*?\]\(.*?\)/) !== null
  );
};

const MarkdownContent = ({ content }: { content: string }) => {
  const lines = content.split("\n");

  return (
    <div className="markdown-content">
      {lines.map((line, i) => {
        // Handle headings
        if (line.startsWith("# ")) {
          return (
            <h1 key={i} className="text-xl font-bold my-2 text-orange-700">
              {line.substring(2)}
            </h1>
          );
        }
        if (line.startsWith("## ")) {
          return (
            <h2 key={i} className="text-lg font-bold my-2 text-orange-600">
              {line.substring(3)}
            </h2>
          );
        }
        if (line.startsWith("### ")) {
          return (
            <h3 key={i} className="text-base font-bold my-1.5 text-orange-500">
              {line.substring(4)}
            </h3>
          );
        }

        // Handle horizontal rules
        if (line.trim() === "---") {
          return <hr key={i} className="my-3 border-gray-300" />;
        }

        // Handle chapter references (like in Taskmaster)
        if (line.match(/\[\s*Chapter\s+\d+.*?\]\(#chapter-\d+\)/)) {
          return (
            <div key={i} className="text-blue-600 font-medium my-1">
              {line}
            </div>
          );
        }

        // Handle chapter anchors
        if (
          line.includes("<a id='chapter-") ||
          line.includes('<a id="chapter-')
        ) {
          return (
            <div key={i} className="text-xs text-gray-400 my-1">
              {line}
            </div>
          );
        }

        // Empty lines
        if (line.trim() === "") {
          return <div key={i} className="h-3"></div>;
        }

        // Default paragraph
        return (
          <p key={i} className="my-1.5">
            {line}
          </p>
        );
      })}
    </div>
  );
};

interface SourceContentExtractorProps {
  response: FlowiseResponse;
  showFormatToggle?: boolean;
  maxHeight?: string;
  initiallyFormatted?: boolean;
  emptyStateMessage?: string;
  showMetadata?: boolean;
}

export default function SourceContentExtractor({
  response,
  showFormatToggle = true,
  maxHeight = "400px",
  initiallyFormatted = true,
  emptyStateMessage = "No source content found in the response",
  showMetadata = true,
}: SourceContentExtractorProps) {
  const [formatMarkdown, setFormatMarkdown] = useState(initiallyFormatted);

  if (!response) {
    return null;
  }

  // extract sources from the response
  const sourceDocuments: DocumentSource[] = extractAllSourceContent(response);

  if (sourceDocuments.length === 0) {
    return (
      <div className="p-4 bg-gray-50 border rounded text-gray-500 text-center">
        {emptyStateMessage}
      </div>
    );
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

  const getPageInfo = (doc: DocumentSource): string => {
    if (doc.metadata?.loc?.pageNumber && doc.metadata?.pdf?.totalPages) {
      return `Page ${doc.metadata.loc.pageNumber} of ${doc.metadata.pdf.totalPages}`;
    }

    if (doc.metadata?.loc?.pageNumber) {
      return `Page ${doc.metadata.loc.pageNumber}`;
    }

    return "";
  };

  return (
    <div className="source-content-extractor">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">
          Source Documents ({sourceDocuments.length}):
        </h2>
        {showFormatToggle && (
          <label className="flex items-center text-sm">
            <input
              type="checkbox"
              checked={formatMarkdown}
              onChange={() => setFormatMarkdown(!formatMarkdown)}
              className="mr-2"
            />
            Format as Markdown
          </label>
        )}
      </div>

      <div className="space-y-4">
        {sourceDocuments.map((source, index) => (
          <div
            key={index}
            className="border rounded-lg shadow-sm overflow-hidden"
          >
            <div className="bg-gray-100 px-4 py-3 border-b flex justify-between items-center">
              <h3 className="font-medium">{getDocumentTitle(source, index)}</h3>
              <span className="text-xs text-gray-500">
                {getPageInfo(source)}
              </span>
            </div>
            <div className="p-4">
              <div
                className="bg-white p-3 border rounded overflow-auto"
                style={{ maxHeight }}
              >
                {formatMarkdown && isMarkdownContent(source.pageContent) ? (
                  <MarkdownContent content={source.pageContent} />
                ) : (
                  <pre className="whitespace-pre-wrap text-sm">
                    {source.pageContent}
                  </pre>
                )}
              </div>

              {showMetadata && (
                <div className="mt-2">
                  <div className="text-xs font-medium text-gray-500 mb-1">
                    Metadata
                  </div>
                  <div
                    className="bg-white border rounded p-2 overflow-auto text-xs"
                    style={{ maxHeight: "100px" }}
                  >
                    <pre>{JSON.stringify(source.metadata, null, 2)}</pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
