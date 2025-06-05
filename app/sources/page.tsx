"use client";

import React, { useState,useEffect } from "react";
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
  const [chatFlows, setChatFlows] = useState([]);
 

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


//   useEffect(() => {
//     const fetchChatFlows = async () => {
//       try {
//         const response = await fetch("https://flow.spaceaiapp.com/api/v1/chatflows?type=CHATFLOW", {
//   "headers": {
//     "accept": "application/json, text/plain, */*",
//     "accept-language": "en-US,en;q=0.9",
//     "if-none-match": "W/\"2927c-L3zMIR7TOBPUmbZeWxeuzNB5ezM\"",
//     "sec-ch-ua": "\"Chromium\";v=\"136\", \"Google Chrome\";v=\"136\", \"Not.A/Brand\";v=\"99\"",
//     "sec-ch-ua-mobile": "?0",
//     "sec-ch-ua-platform": "\"Windows\"",
//     "sec-fetch-dest": "empty",
//     "sec-fetch-mode": "cors",
//     "sec-fetch-site": "same-origin",
//     "x-request-from": "internal",
//     "cookie": "ajs_user_id=TNgszr1taAs4G5GPDwUAA; ajs_anonymous_id=7c3bfe7f-770d-4860-8446-8ba76d514181; ph_phc_7F92HoXJPeGnTKmYv0eOw62FurPMRW9Aqr0TPrDzvHh_posthog=%7B%22distinct_id%22%3A%22TNgszr1taAs4G5GPDwUAA%22%2C%22%24sesid%22%3A%5B1748874464438%2C%220197310a-8c98-743d-86fc-44fde49a976d%22%2C1748874464408%5D%2C%22%24epp%22%3Atrue%2C%22%24initial_person_info%22%3A%7B%22r%22%3A%22%24direct%22%2C%22u%22%3A%22https%3A%2F%2Faiagent.spaceaiapp.com%2Fprojects%2FwQZEZ2SwG7pIFZZPhs2h0%2Fflows%22%7D%7D; refreshToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjRjODA5MGRhLTA1YTgtNDFiMS05NzYyLThjNzZkM2YxN2FhNyIsInVzZXJuYW1lIjoic2lqbyIsIm1ldGEiOiIwNzFmZDUwNjFlMTMyNzc2Zjk3MzJlNzI4NTBiYjIxMDo3MWNlNzJjZmEzMGQzZDE4MGJjYzY5YjFiNTFmODBkMTNmN2ExNzVlODFiNmY5ZDFkZmY5OWZiMmVmNzA4OWIxNzc2ZGRjNmNlYWEzMzliYjk4YzVlZGJhNTc4ZDU5OWM0ZmIxMTkxZjlhYWMzODRkNGUwNWViYWVlODgxN2EzOWNjNzFkZWZlYzMxZmYyMzdjMjM0Y2E1ZDdjNDlmYjE2IiwiaWF0IjoxNzQ5MDkyNjU3LCJuYmYiOjE3NDkwOTI2NTcsImV4cCI6MTc1Njg2ODY1NywiYXVkIjoiQVVESUVOQ0UiLCJpc3MiOiJJU1NVRVIifQ.DIW1CSckICnyF8tEHyFrgLAoz3iWQm_N3BqDCrGmJ64; connect.sid=s%3AD7Yo5jWJ_ZYDipRsyOL2hyTyKFp4gYzI.mT8%2B%2FmsWoD2mem6hzphmB1rZtMbaMW9xfpzq7y6im%2FE; mp_acd87c5a50b56df91a795e999812a3a4_mixpanel=%7B%22distinct_id%22%3A%20%22%408A7DD0B35FF72036504BC059133F43BA%22%2C%22%24device_id%22%3A%20%221972b5a747227428-000b37a6b3ac9a8-26011f51-1704a0-1972b5a747227428%22%2C%22server_id%22%3A%20%22F15CD1FA4E12B9EB53AE87DE985E683E%22%2C%22hostApp%22%3A%20%22web-2%22%2C%22speckleVersion%22%3A%20%22custom%22%2C%22%24initial_referrer%22%3A%20%22%24direct%22%2C%22%24initial_referring_domain%22%3A%20%22%24direct%22%2C%22__mps%22%3A%20%7B%7D%2C%22__mpso%22%3A%20%7B%7D%2C%22__mpus%22%3A%20%7B%7D%2C%22__mpa%22%3A%20%7B%7D%2C%22__mpu%22%3A%20%7B%7D%2C%22__mpr%22%3A%20%5B%5D%2C%22__mpap%22%3A%20%5B%5D%2C%22%24user_id%22%3A%20%22%408A7DD0B35FF72036504BC059133F43BA%22%7D; token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjRjODA5MGRhLTA1YTgtNDFiMS05NzYyLThjNzZkM2YxN2FhNyIsInVzZXJuYW1lIjoic2lqbyIsIm1ldGEiOiJkZWMwY2I0ZGZkMGNhMzJkNWI1YTczODczOWIxODI1ZjoxZGMyYzI4ZDM5MzAzYzljZTJkN2QzNGE3ZTYwOGE2NjBmYTcyMWQ2MDRiODAyYmRmMGFkYWVmOWE5NWQxN2FhMmQ0MzIyMTJjMWE3OGExNDAyYmNkODI1NWMxNmZlMTYwYTI0ZDJkZjYyMTk1MjFkYmI5ODhhMGNhYWNhNWVhNjg2ZTg5NGJmZmY5ZDY1ZTI4NjY1ZDE3YzQ3M2M4YzFlIiwiaWF0IjoxNzQ5MTA2ODE2LCJuYmYiOjE3NDkxMDY4MTYsImV4cCI6MTc0OTExMDQxNiwiYXVkIjoiQVVESUVOQ0UiLCJpc3MiOiJJU1NVRVIifQ.q3Bej-PZ8z0qRsmhPAgCatngwCmH_tA_YnX0ks1hMtI",
//     "Referer": "https://flow.spaceaiapp.com/chatflows",
//     "Referrer-Policy": "strict-origin-when-cross-origin"
//   },
//   "body": null,
//   "method": "GET"
// });

//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }

//         const data = await response.json();
//         setChatFlows(data);
//       } catch (err) {
//         setError(err.message);
//         console.error("Error fetching chat flows:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchChatFlows();
//   }, []); // Empty dependency array means this runs once on mount

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
