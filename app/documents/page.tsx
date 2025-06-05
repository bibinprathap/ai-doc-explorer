/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { extractSourceDocuments, query } from "@/services/flowiseService";
import { useState } from "react";

interface Document {
  pageContent: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: Record<string, any>;
}

export default function DocumentSourcesPage() {
  const [question, setQuestion] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await query({ question });

      const sources = extractSourceDocuments(response as any);
      setDocuments(sources);

      if (sources.length === 0) {
        setError("No document sources found in the response.");
      }
    } catch (err) {
      console.error("Error fetching documents:", err);
      setError("Failed to retrieve documents. Please try again.");
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Document Sources Explorer</h1>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter your question to retrieve relevant documents..."
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

      {documents.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Found {documents.length} source document(s):
          </h2>

          <div className="space-y-4">
            {documents.map((doc, index) => (
              <div key={index} className="border rounded p-4 bg-gray-50">
                <h3 className="font-medium mb-2">Document #{index + 1}</h3>

                <div className="mb-3">
                  <h4 className="text-sm font-semibold mb-1">Page Content:</h4>
                  <div className="bg-white p-3 border rounded overflow-auto max-h-60">
                    <pre className="whitespace-pre-wrap text-sm">
                      {doc.pageContent}
                    </pre>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-1">Metadata:</h4>
                  <div className="bg-white p-3 border rounded overflow-auto max-h-40">
                    <pre className="whitespace-pre-wrap text-sm">
                      {JSON.stringify(doc.metadata, null, 2)}
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
