import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 py-10 px-6">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-blue-700 tracking-tight mb-4">
            AI APP Source Document Explorer
          </h1>
          <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto">
            Explore and extract source documents from AI APP API responses using
            beautifully designed tools tailored for multiple response formats.
          </p>
        </header>

        <div className="grid gap-8 sm:grid-cols-2">
          {[
            {
              title: "Sources Explorer",
              description:
                "Robust tool for extracting and formatting source content from AI APP responses. Supports all formats.",
              href: "/sources",
            },
            {
              title: "Extract Sources",
              description:
                "Focuses on agentReasoning and usedTools. Offers clean markdown formatting options for quick insights.",
              href: "/extract-sources",
            },
            {
              title: "Direct Explorer",
              description:
                "Advanced debugging utility that parses API responses directly to locate embedded source content.",
              href: "/direct",
            },
            {
              title: "About This App",
              description:
                "Learn how this tool was crafted using Next.js, TypeScript, and Tailwind to explore AI-generated sources.",
              href: "#",
            },
          ].map((tool, idx) => (
            <div
              key={idx}
              className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300"
            >
              <h2 className="text-2xl font-semibold text-blue-600 mb-3">
                {tool.title}
              </h2>
              <p className="text-gray-600 mb-5">{tool.description}</p>
              {tool.href !== "#" && (
                <Link
                  href={tool.href}
                  className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-600 font-medium transition"
                >
                  Try {tool.title}
                  <ArrowRight size={16} />
                </Link>
              )}
              {tool.href === "#" && (
                <p className="text-sm text-gray-400 mt-4">
                  Built with love using Next.js & Tailwind CSS.
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
