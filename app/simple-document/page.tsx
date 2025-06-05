/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useRef } from "react";

export default function SimpleDocumentViewer() {
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const form = document.getElementById("query-form");
    if (form) {
      form.addEventListener("submit", handleSubmit);
    }

    return () => {
      if (form) {
        form.removeEventListener("submit", handleSubmit);
      }
    };
  }, []);

  async function handleSubmit(e: Event) {
    e.preventDefault();

    if (
      !inputRef.current ||
      !resultsRef.current ||
      !loadingRef.current ||
      !errorRef.current
    ) {
      return;
    }

    const question = inputRef.current.value.trim();
    if (!question) return;

    loadingRef.current.style.display = "block";
    resultsRef.current.innerHTML = "";
    errorRef.current.style.display = "none";

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
              sessionId: "simple-document-" + Date.now(),
            },
          }),
        }
      );

      const data = await response.json();

      loadingRef.current.style.display = "none";

      if (data.text) {
        const answerHtml = `
          <div class="mb-6">
            <h2 class="text-lg font-semibold mb-2">Answer:</h2>
            <div class="p-4 bg-gray-50 rounded border">${data.text}</div>
          </div>
        `;
        resultsRef.current.innerHTML = answerHtml;
      }

      if (data.sourceDocuments && data.sourceDocuments.length > 0) {
        const sourceDocsContainer = document.createElement("div");
        sourceDocsContainer.className = "mt-6";
        sourceDocsContainer.innerHTML = `
          <h2 class="text-lg font-semibold mb-3">Source Documents (${data.sourceDocuments.length}):</h2>
          <div class="space-y-4" id="source-docs"></div>
        `;
        resultsRef.current.appendChild(sourceDocsContainer);

        const sourceDocsWrapper = document.getElementById("source-docs");
        if (sourceDocsWrapper) {
          data.sourceDocuments.forEach((doc: any, index: number) => {
            const docElement = document.createElement("div");
            docElement.className =
              "border rounded-lg shadow-sm overflow-hidden";

            const header = document.createElement("div");
            header.className =
              "bg-gray-100 px-4 py-3 border-b flex justify-between items-center";

            let title = `Document ${index + 1}`;
            if (doc.metadata?.pdf?.info?.Title) {
              title = doc.metadata.pdf.info.Title;
            } else if (typeof doc.metadata?.source === "string") {
              title = doc.metadata.source;
            }

            header.innerHTML = `
              <div class="font-medium text-gray-800">${title}</div>
              ${
                doc.metadata?.loc?.pageNumber
                  ? `<span class="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                  Page ${doc.metadata.loc.pageNumber}
                  ${
                    doc.metadata?.pdf?.totalPages
                      ? ` of ${doc.metadata.pdf.totalPages}`
                      : ""
                  }
                </span>`
                  : ""
              }
            `;
            docElement.appendChild(header);

            const contentWrapper = document.createElement("div");
            contentWrapper.className = "px-4 py-3";

            const content = document.createElement("div");
            content.className = "bg-white p-4 rounded-md border overflow-auto";
            content.style.maxHeight = "500px";

            // Determine if this is markdown content
            const hasMarkdown =
              doc.pageContent.includes("#") ||
              doc.pageContent.includes("[Chapter") ||
              doc.pageContent.includes("---") ||
              doc.pageContent.includes("Table of Contents");

            if (hasMarkdown) {
          
              console.log("Document content (Markdown):", doc.pageContent);

              // eslint-disable-next-line prefer-const
              let contentHtml = doc.pageContent
           
                .replace(
                  /# (.*)/g,
                  '<h1 class="text-2xl font-bold my-3 text-orange-700">$1</h1>'
                )
                .replace(
                  /## (.*)/g,
                  '<h2 class="text-xl font-bold my-2 text-orange-700">$1</h2>'
                )
                .replace(
                  /### (.*)/g,
                  '<h3 class="text-lg font-bold my-2 text-orange-600">$1</h3>'
                )
                .replace(/\n/g, "<br>")
                .replace(
                  /\[(Chapter.*?)\]\(#(chapter-\d+)\)/g,
                  '<span class="text-blue-600 hover:underline cursor-pointer">$1</span>'
                );

              content.innerHTML = contentHtml;
            } else {
              console.log("Document content (Plain):", doc.pageContent);

              const pre = document.createElement("pre");
              pre.className = "whitespace-pre-wrap text-sm";

              pre.textContent = doc.pageContent || "No content available";
              content.appendChild(pre);
            }

            contentWrapper.appendChild(content);

            const details = document.createElement("details");
            details.className = "mt-3";
            details.innerHTML = `
              <summary class="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                View Metadata
              </summary>
              <div class="mt-2 p-3 bg-gray-50 border rounded-md overflow-auto text-xs" style="max-height: 200px;">
                <pre>${JSON.stringify(doc.metadata, null, 2)}</pre>
              </div>
            `;
            contentWrapper.appendChild(details);

            docElement.appendChild(contentWrapper);
            sourceDocsWrapper.appendChild(docElement);
          });
        }
      }
    } catch (error) {
      console.error("Error:", error);
      loadingRef.current.style.display = "none";
      errorRef.current.style.display = "block";
      errorRef.current.textContent =
        "An error occurred while fetching results. Please try again.";
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <h1 className="text-2xl font-bold mb-6">Simple Document Explorer</h1>
      <p className="mb-4 text-gray-600">
        This version uses direct DOM manipulation to ensure compatibility.
      </p>

      <form id="query-form" className="mb-6">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            placeholder="Ask a question about Taskmaster..."
            className="flex-1 p-2 border rounded"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Search
          </button>
        </div>
      </form>

      <div
        ref={errorRef}
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
        style={{ display: "none" }}
      ></div>

      <div
        ref={loadingRef}
        className="text-center py-8"
        style={{ display: "none" }}
      >
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
        <p className="mt-2 text-gray-600">Searching documents...</p>
      </div>

      <div ref={resultsRef}></div>
    </div>
  );
}
