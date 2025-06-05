"use client";

import React, { useState } from "react";
import { query } from "../../services/flowiseService";

interface DocumentSource {
  pageContent: string;
  metadata: Record<string, unknown>;
}

export default function QueryExample() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState<DocumentSource[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setError(null);
    setAnswer("");
    setSources([]);

    try {
      const response = await query({ question });

      setAnswer(response.text || response.answer || "");

      const documents = response.sourceDocuments || [];
      setSources(documents);
    } catch (error) {
      console.error("Error querying AI APP:", error);
      setError("An error occurred while processing your request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">AI APP API Example</h1>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1 p-2 border rounded"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-blue-300"
          >
            {loading ? "Loading..." : "Ask"}
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {answer && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Answer:</h2>
          <div className="p-4 bg-gray-50 rounded border">{answer}</div>
        </div>
      )}

      {sources.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Source Documents:</h2>

          <div className="space-y-4">
            {sources.map((source, index) => (
              <div key={index} className="border rounded p-4 bg-gray-50">
                <h3 className="font-medium mb-2">Source #{index + 1}</h3>

                <div className="mb-3">
                  <div className="text-sm font-medium mb-1">Content:</div>
                  <div className="bg-white p-3 border rounded overflow-auto max-h-60">
                    <pre className="whitespace-pre-wrap text-sm">
                      {source.pageContent}
                    </pre>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium mb-1">Metadata:</div>
                  <div className="bg-white p-3 border rounded overflow-auto max-h-40">
                    <pre className="whitespace-pre-wrap text-sm">
                      {JSON.stringify(source.metadata, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
