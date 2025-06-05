/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";

interface ApiResponse {
  [key: string]: any;
}

export default function DirectExplorer() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const requestBody = {
        question: input.trim(),
        overrideConfig: {
          sessionId: "direct-explorer-" + Date.now(),
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
      console.log("API response top-level keys:", Object.keys(data));

      if (data.sourceDocuments && Array.isArray(data.sourceDocuments)) {
        console.log(`Found ${data.sourceDocuments.length} source documents`);
        console.log(
          "First source document keys:",
          Object.keys(data.sourceDocuments[0])
        );
        console.log("First source document sample:", data.sourceDocuments[0]);
      }

      if (data.agentReasoning && Array.isArray(data.agentReasoning)) {
        console.log(
          `Found ${data.agentReasoning.length} agent reasoning entries`
        );
        if (data.agentReasoning[0].usedTools) {
          console.log(
            `Found ${data.agentReasoning[0].usedTools.length} used tools`
          );
          console.log(
            "First tool output:",
            data.agentReasoning[0].usedTools[0].toolOutput?.substring(0, 100) +
              "..."
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

  const extractContent = (doc: any) => {
    if (!doc) return null;

    return (
      doc.pageContent || doc.page_content || doc.content || doc.text || null
    );
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Direct API Explorer</h1>
      <p className="mb-4 text-gray-600">
        Direct access to the AI APP API for debugging response structure
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

      {response && (
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Response Structure</h2>
          <div className="bg-gray-50 p-3 border rounded mb-4">
            <p className="font-mono text-sm">
              Top-level keys: {Object.keys(response).join(", ")}
            </p>
          </div>

          {response.text && (
            <div className="mb-6 border p-4 rounded shadow-sm">
              <h2 className="text-lg font-semibold mb-2">Answer:</h2>
              <div className="p-3 bg-gray-50 rounded whitespace-pre-wrap">
                {response.text}
              </div>
            </div>
          )}

          <h2 className="text-lg font-semibold mb-2">Raw API Response</h2>
          <div className="bg-gray-50 border rounded p-4 overflow-auto max-h-[70vh]">
            <pre className="text-xs">{JSON.stringify(response, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
