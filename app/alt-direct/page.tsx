/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";

export default function AltDirectExplorer() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
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
          sessionId: "alt-direct-explorer-" + Date.now(),
          returnSourceDocuments: true,
          includeSources: true,
          includeSourcesInAnswer: true,
        },
      };

      console.log("Sending request:", requestBody);

      // Direct API call
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

      console.log("Full API response for alt approach:", data);
      console.log("Response keys:", Object.keys(data));

      if (data.text) {
        console.log("Found answer text, checking for embedded sources...");
        const text = data.text;

        const sourcesMatch = text.match(/Sources?:([\s\S]*)/i);
        if (sourcesMatch) {
          console.log(
            "Found embedded source information in text:",
            sourcesMatch[1]
          );
        }

        const linksMatch = text.match(/\[(.*?)\]\((.*?)\)/g);
        if (linksMatch) {
          console.log("Found markdown links in response text:", linksMatch);
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
      <h1 className="text-2xl font-bold mb-4">Alternative Document Explorer</h1>
      <p className="mb-4 text-gray-600">
        Uses a different approach to request source documents. Check browser
        console for logs.
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
            {loading ? "Loading..." : "Search"}
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
        <div className="space-y-6">
          {/* Display the answer */}
          {response.text && (
            <div className="p-4 border rounded shadow-sm">
              <h2 className="text-lg font-semibold mb-2">Answer:</h2>
              <div className="p-3 bg-gray-50 rounded whitespace-pre-wrap">
                {response.text}
              </div>
            </div>
          )}

          {/* Display full API response */}
          <div className="mt-6">
            <details open>
              <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                Full API Response (check this for source information)
              </summary>
              <div className="mt-2 p-3 bg-gray-50 border rounded overflow-auto text-xs max-h-96">
                <pre>{JSON.stringify(response, null, 2)}</pre>
              </div>
            </details>
          </div>
        </div>
      )}
    </div>
  );
}
