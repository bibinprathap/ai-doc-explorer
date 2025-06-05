/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";

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

export default function ExtractSourcesExplorer() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [extractedSources, setExtractedSources] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [formatMarkdown, setFormatMarkdown] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setError(null);
    setResponse(null);
    setExtractedSources([]);

    try {
      const requestBody = {
        question: input.trim(),
        overrideConfig: {
          sessionId: "extract-sources-" + Date.now(),
        },
      };

      console.log("Sending request:", requestBody);

      const result = await fetch(
        "https://flow.spaceaiapp.com/api/v1/prediction/816d4fe3-239c-4e3c-94fb-a81f9f460112",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        }
      );

      if (!result.ok) {
        throw new Error(`API error: ${result.status}`);
      }

      const data = await result.json();
      setResponse(data);
      console.log("Full API response:", data);

      // Extract sources from the agentReasoning field
      if (data.agentReasoning && Array.isArray(data.agentReasoning)) {
        console.log("Found agentReasoning data");

        const sources: string[] = [];

        // Look for tool outputs which contain the source content
        data.agentReasoning.forEach((agent: any) => {
          if (agent.usedTools && Array.isArray(agent.usedTools)) {
            agent.usedTools.forEach((tool: any) => {
              if (tool.toolOutput) {
                sources.push(tool.toolOutput);
                console.log(
                  "Found source document:",
                  tool.toolOutput.substring(0, 100) + "..."
                );
              }
            });
          }
        });

        if (sources.length > 0) {
          setExtractedSources(sources);
        } else {
          setError("No source content found in agentReasoning");
        }
      } else {
        // Fallback: Try other places to find source content
        if (data.sourceDocuments && Array.isArray(data.sourceDocuments)) {
          console.log("Using sourceDocuments array");
          const sources = data.sourceDocuments
            .map(
              (doc: any) =>
                doc.pageContent || doc.content || JSON.stringify(doc)
            )
            .filter(Boolean);
          setExtractedSources(sources);
        } else {
          console.log("No source documents found");
          setError("No source documents found in the response");
        }
      }
    } catch (err: any) {
      console.error("Error:", err);
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Source Content Extractor</h1>
      <p className="mb-4 text-gray-600">
        Extracts source content from AI APP API responses
      </p>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter your question about Taskmaster..."
            className="flex-1 p-2 border rounded"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-blue-300"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center py-4 mb-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Fetching data...</p>
        </div>
      )}

      {response && response.text && (
        <div className="mb-6 border p-4 rounded shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Answer:</h2>
          <div className="p-3 bg-gray-50 rounded whitespace-pre-wrap">
            {response.text}
          </div>
        </div>
      )}

      {extractedSources.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">
              Extracted Source Documents ({extractedSources.length}):
            </h2>
            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={formatMarkdown}
                onChange={() => setFormatMarkdown(!formatMarkdown)}
                className="mr-2"
              />
              Format as Markdown
            </label>
          </div>

          <div className="space-y-4">
            {extractedSources.map((source, index) => (
              <div
                key={index}
                className="border rounded-lg shadow-sm overflow-hidden"
              >
                <div className="bg-gray-100 px-4 py-3 border-b flex justify-between items-center">
                  <h3 className="font-medium">Source Document {index + 1}</h3>
                  {isMarkdownContent(source) && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Markdown
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <div className="bg-white p-3 border rounded overflow-auto max-h-96">
                    {formatMarkdown && isMarkdownContent(source) ? (
                      <MarkdownContent content={source} />
                    ) : (
                      <pre className="whitespace-pre-wrap text-sm">
                        {source}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {response && (
        <details className="mt-6">
          <summary className="cursor-pointer text-sm font-medium text-gray-600">
            View Raw API Response
          </summary>
          <div className="mt-2 p-3 bg-gray-50 border rounded overflow-auto text-xs max-h-96">
            <pre>{JSON.stringify(response, null, 2)}</pre>
          </div>
        </details>
      )}
    </div>
  );
}
