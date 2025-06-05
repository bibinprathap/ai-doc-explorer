"use client";

import React, { useState } from "react";
import {
  query,
  FlowiseResponse,
  DocumentSource,
} from "@/services/flowiseService";

interface AgentTool {
  toolOutput?: string;
  toolName?: string;
  [key: string]: unknown;
}

interface AgentReasoning {
  usedTools?: AgentTool[];
  [key: string]: unknown;
}

export default function SourcesPage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<FlowiseResponse | null>(null);
  const [sourceDocuments, setSourceDocuments] = useState<DocumentSource[]>([]);
  const [error, setError] = useState<string | null>(null);
 
 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setError(null);
    setResponse(null);
    setSourceDocuments([]);

    try {
      const data = await query({
        question: input.trim(),
        overrideConfig: {
          sessionId: "sources-page-" + Date.now(),
        },
      });

      setResponse(data);
      console.log("API response:", data);

      // Extract sources from the response
      if (data.sourceDocuments && Array.isArray(data.sourceDocuments)) {
        setSourceDocuments(data.sourceDocuments);
        console.log("Found source documents:", data.sourceDocuments.length);
      } else if (data.agentReasoning && Array.isArray(data.agentReasoning)) {
        // Try to extract from agentReasoning
        const sources: DocumentSource[] = [];
        data.agentReasoning.forEach((agent: AgentReasoning) => {
          if (agent.usedTools && Array.isArray(agent.usedTools)) {
            agent.usedTools.forEach((tool: AgentTool) => {
              if (tool.toolOutput) {
                sources.push({
                  pageContent: tool.toolOutput,
                  metadata: { source: "Agent Tool Output" },
                });
              }
            });
          }
        });

        if (sources.length > 0) {
          setSourceDocuments(sources);
          console.log(
            "Found source documents in agentReasoning:",
            sources.length
          );
        }
      }
    } catch (err: unknown) {
      console.error("Error:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

 
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Document Sources Explorer</h1>
      <p className="mb-4 text-gray-600">
        Ask a question and view the source documents used to answer it
      </p>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter your question..."
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

      {sourceDocuments.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">
            Source Documents ({sourceDocuments.length}):
          </h2>
          <div className="space-y-4">
            {sourceDocuments.map((source, index) => (
              <div
                key={index}
                className="border rounded-lg shadow-sm overflow-hidden"
              >
                <div className="bg-gray-100 px-4 py-3 border-b flex justify-between items-center">
                  <h3 className="font-medium">
                    {source.metadata?.pdf?.info?.Title ||
                      source.metadata?.source ||
                      `Document ${index + 1}`}
                  </h3>
                  {source.metadata?.loc?.pageNumber && (
                    <span className="text-xs text-gray-500">
                      Page {source.metadata.loc.pageNumber}
                      {source.metadata.pdf?.totalPages &&
                        ` of ${source.metadata.pdf.totalPages}`}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <div className="bg-white p-3 border rounded overflow-auto max-h-96">
                    <pre className="whitespace-pre-wrap text-sm">
                      {source.pageContent}
                    </pre>
                  </div>
                  <div className="mt-2">
                    <details>
                      <summary className="text-xs font-medium text-gray-500 cursor-pointer">
                        View Metadata
                      </summary>
                      <div className="mt-1 bg-white border rounded p-2 overflow-auto text-xs max-h-40">
                        <pre>{JSON.stringify(source.metadata, null, 2)}</pre>
                      </div>
                    </details>
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
