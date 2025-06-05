import React from "react";

interface PdfInfo {
  PDFFormatVersion?: string;
  IsAcroFormPresent?: boolean;
  IsXFAPresent?: boolean;
  Title?: string;
  Creator?: string;
  Producer?: string;
  CreationDate?: string;
  ModDate?: string;
}

interface PdfMetadata {
  version?: string;
  info?: PdfInfo;
  metadata?: unknown;
  totalPages?: number;
}

interface Location {
  pageNumber?: number;
}

interface DocumentMetadata {
  source?: string;
  blobType?: string;
  pdf?: PdfMetadata;
  loc?: Location;
  [key: string]: unknown;
}

interface DocumentSource {
  pageContent: string;
  metadata: DocumentMetadata;
}

interface SourceDocumentsProps {
  sources: DocumentSource[];
  maxContentHeight?: string;
  showMetadata?: boolean;
}

export default function SourceDocuments({
  sources,
  maxContentHeight = "300px",
  showMetadata = true,
}: SourceDocumentsProps) {
  if (!sources || sources.length === 0) {
    return null;
  }

  const getSourceTitle = (source: DocumentSource, index: number): string => {
    if (source.metadata?.pdf?.info?.Title) {
      return String(source.metadata.pdf.info.Title);
    }

    if (typeof source.metadata?.source === "string") {
      return source.metadata.source;
    }

    return `Document #${index + 1}`;
  };

  const getPageInfo = (metadata: DocumentMetadata): string => {
    if (metadata?.loc?.pageNumber && metadata?.pdf?.totalPages) {
      return `Page ${metadata.loc.pageNumber} of ${metadata.pdf.totalPages}`;
    }

    if (metadata?.loc?.pageNumber) {
      return `Page ${metadata.loc.pageNumber}`;
    }

    return "";
  };

  return (
    <div className="mt-4">
      <h3 className="text-lg font-medium mb-2">
        Source Documents ({sources.length})
      </h3>

      <div className="space-y-3">
        {sources.map((source, index) => (
          <div
            key={index}
            className="border rounded-md bg-gray-50 overflow-hidden"
          >
            <div className="border-b bg-gray-100 px-3 py-2 flex justify-between items-center">
              <span className="font-medium">
                {getSourceTitle(source, index)}
              </span>
              <span className="text-xs text-gray-500">
                {getPageInfo(source.metadata)}
              </span>
            </div>

            <div className="p-3">
              <div
                className="bg-white border rounded p-3 overflow-auto"
                style={{ maxHeight: maxContentHeight }}
              >
                <pre className="whitespace-pre-wrap text-sm">
                  {source.pageContent}
                </pre>
              </div>

              {showMetadata && (
                <div className="mt-2">
                  <div className="text-xs font-medium text-gray-500 mb-1">
                    Metadata
                  </div>
                  <div
                    className="bg-white border rounded p-2 overflow-auto text-xs"
                    style={{ maxHeight: "100px" }}
                  >
                    <pre>{JSON.stringify(source.metadata, null, 2)}</pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
