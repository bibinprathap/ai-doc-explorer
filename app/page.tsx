import React from "react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-blue-700">
          AI APP Source Document Explorer
        </h1>

        <p className="mb-8 text-gray-600 text-lg">
          This application helps you extract and view source documents from
          AI APP API responses. It provides several different tools to handle
          various API response formats.
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <h2 className="text-xl font-semibold mb-3 text-blue-600">
              Sources Explorer
            </h2>
            <p className="text-gray-600 mb-4">
              Our recommended tool that uses a robust source extraction
              approach. Works with all known AI APP API response formats and
              displays formatted source content.
            </p>
            <Link
              href="/sources"
              className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Try Sources Explorer
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <h2 className="text-xl font-semibold mb-3 text-blue-600">
              Extract Sources
            </h2>
            <p className="text-gray-600 mb-4">
              Specialized tool that focuses on extracting source content from
              the agentReasoning and usedTools fields, with markdown formatting
              options.
            </p>
            <Link
              href="/extract-sources"
              className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Try Extract Sources
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <h2 className="text-xl font-semibold mb-3 text-blue-600">
              Direct Explorer
            </h2>
            <p className="text-gray-600 mb-4">
              Advanced debugging tool that directly shows the API response and
              attempts to locate source content in various locations within the
              response.
            </p>
            <Link
              href="/direct"
              className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Try Direct Explorer
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <h2 className="text-xl font-semibold mb-3 text-blue-600">
              About This App
            </h2>
            <p className="text-gray-600 mb-4">
              This application was built to help extract and display source
              documents from AI APP API responses, handling various response
              formats and structures.
            </p>
            <p className="text-sm text-gray-500">
              Built with Next.js, TypeScript, and Tailwind CSS
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
