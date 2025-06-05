/* eslint-disable @typescript-eslint/no-explicit-any */
interface FlowiseRequestData {
    question: string;
    history?: Array<{
      role: string;
      content: string;
    }>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    overrideConfig?: Record<string, unknown>;
  }
  
  // Define the PDF metadata structure
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
  
  export interface DocumentSource {
    pageContent: string;
    metadata: DocumentMetadata;
  }
  
  export interface FlowiseResponse {
    text: string;
    answer?: string;
    sourceDocuments?: DocumentSource[];
    [key: string]: unknown;
  }
  
  interface ToolOutput {
    toolName?: string;
    toolOutput?: string;
    [key: string]: unknown;
  }
  
  interface AgentReasoning {
    usedTools?: ToolOutput[];
    [key: string]: unknown;
  }
  
  interface GenericSourceItem {
    pageContent?: string;
    page_content?: string;
    content?: string;
    text?: string;
    [key: string]: unknown;
  }
  
  // Helper function to create properly typed metadata
  function createMetadata(source: string, additionalInfo?: Record<string, unknown>): DocumentMetadata {
    return {
      source,
      ...additionalInfo
    };
  }
  
  /**
   * Makes a query to the AI APP API
   */
  export async function query(data: FlowiseRequestData): Promise<FlowiseResponse> {
    // Add a sessionId to connect all messages as one conversation
    const dataWithSession = {
      ...data,
      overrideConfig: {
        ...(data.overrideConfig || {}),
        sessionId: "document-explorer-" + Date.now() // Use a unique sessionId
      }
    };
  
    console.log("Making API request with data:", JSON.stringify(dataWithSession, null, 2));
  
    const response = await fetch(
      "https://flow.spaceaiapp.com/api/v1/prediction/816d4fe3-239c-4e3c-94fb-a81f9f460112",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(dataWithSession)
      }
    );
  
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log("API response:", JSON.stringify(result, null, 2));
    
    return result as FlowiseResponse;
  }
  
  /**
   * Extracts source documents from a response
   */
  export function extractSourceDocuments(response: FlowiseResponse): DocumentSource[] {
    if (!response.sourceDocuments || response.sourceDocuments.length === 0) {
      console.warn("No source documents found in response");
      return [];
    }
    
    return response.sourceDocuments;
  }
  
  /**
   * Extracts source content from all possible locations in a AI APP response
   */
  export function extractAllSourceContent(response: FlowiseResponse): DocumentSource[] {
    const sources: DocumentSource[] = [];
    
    // Check standard sourceDocuments array
    if (response.sourceDocuments && Array.isArray(response.sourceDocuments)) {
      return response.sourceDocuments; // Return directly if sourceDocuments exist
    }
    
    // Check agentReasoning for tool outputs
    const agentReasoning = response.agentReasoning as AgentReasoning[] | undefined;
    if (agentReasoning && Array.isArray(agentReasoning)) {
      agentReasoning.forEach((agent: AgentReasoning) => {
        if (agent.usedTools && Array.isArray(agent.usedTools)) {
          agent.usedTools.forEach((tool: ToolOutput) => {
            if (tool.toolOutput) {
              sources.push({
                pageContent: tool.toolOutput,
                metadata: createMetadata("Agent Tool Output")
              });
            }
          });
        }
      });
    }
    
    // Check custom fields that might contain source content
    const customSourceFields = ['sources', 'sourceDocs', 'context', 'retrievedDocuments'];
    customSourceFields.forEach(field => {
      const customField = response[field as keyof FlowiseResponse] as GenericSourceItem[] | undefined;
      if (customField && Array.isArray(customField)) {
        customField.forEach((item: GenericSourceItem) => {
          if (typeof item === 'string') {
            sources.push({
              pageContent: item,
              metadata: createMetadata(`Field: ${field}`)
            });
          } else {
            const content = 
              item.pageContent || item.page_content || 
              item.content || item.text || 
              (typeof item === 'object' ? JSON.stringify(item) : null);
            
            if (content) {
              sources.push({
                pageContent: content,
                metadata: (item.metadata as DocumentMetadata) || createMetadata(`Field: ${field}`)
              });
            }
          }
        });
      }
    });
    
    return sources;
  }