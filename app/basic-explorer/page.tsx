"use client";

import React, { useState } from "react";

interface Document {
  pageContent?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export default function BasicExplorer() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState("");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setError(null);
    setAnswer("");
    setDocuments([]);

    try {
      const response = await fetch(
        "https://flow.spaceaiapp.com/api/v1/prediction/816d4fe3-239c-4e3c-94fb-a81f9f460112",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question,
            overrideConfig: {
              sessionId: "basic-explorer-" + Date.now(),
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Full API response:", data);

      setAnswer(data.text || data.answer || "");

      console.log("Response structure:", {
        hasText: !!data.text,
        hasAnswer: !!data.answer,
        hasSourceDocuments: !!data.sourceDocuments,
        sourceDocsIsArray: Array.isArray(data.sourceDocuments),
        sourceDocsLength: data.sourceDocuments?.length,
      });

      if (data.sourceDocuments && Array.isArray(data.sourceDocuments)) {
        console.log("First source document:", data.sourceDocuments[0]);

        data.sourceDocuments.forEach((doc: { pageContent: string; }, i: number) => {
          console.log(`Document ${i + 1} has pageContent:`, !!doc.pageContent);
          if (doc.pageContent) {
            console.log(
              `Document ${i + 1} pageContent preview:`,
              doc.pageContent.substring(0, 50) + "..."
            );
          }
        });

        console.log(`Found ${data.sourceDocuments.length} documents`);
        setDocuments(data.sourceDocuments);
      } else {
        setError("No source documents found");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to retrieve documents. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Basic Document Explorer</h1>
      <p className="mb-4 text-gray-600">
        This version uses minimal processing to display pageContent.
      </p>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question..."
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
        <div className="text-center py-6">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Searching...</p>
        </div>
      )}

      {answer && (
        <div className="mb-6 border p-4 rounded shadow-sm bg-white">
          <h2 className="text-lg font-semibold mb-2">Answer:</h2>
          <div className="p-4 bg-gray-50 rounded border">{answer}</div>
        </div>
      )}

      {documents.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-3">
            Source Documents ({documents.length}):
          </h2>
          <div className="space-y-6">
            {documents.map((doc, index) => (
              <div
                key={index}
                className="border rounded-md shadow-sm overflow-hidden bg-white"
              >
                <div className="bg-gray-100 px-4 py-2 border-b">
                  <div className="font-medium">Document {index + 1}</div>
                </div>
                <div className="p-4">
                  <h3 className="font-medium mb-2">Page Content:</h3>
                  <div className="bg-gray-50 p-4 border rounded overflow-auto max-h-80">
                    {doc.pageContent ? (
                      <pre className="whitespace-pre-wrap">
                        {doc.pageContent}
                      </pre>
                    ) : (
                      <p className="text-red-500">No pageContent available</p>
                    )}
                  </div>

                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm text-gray-600">
                      View Metadata
                    </summary>
                    <div className="mt-2 p-3 bg-gray-50 border rounded text-xs overflow-auto max-h-80">
                      <pre>{JSON.stringify(doc.metadata, null, 2)}</pre>
                    </div>
                  </details>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
