// Example of how to access document sources from AI APP API

interface DocumentSource {
  pageContent: string;
  metadata: Record<string, unknown>;
}

async function queryWithSources(question: string) {
  try {
    const response = await fetch(
      "https://flow.spaceaiapp.com/api/v1/prediction/816d4fe3-239c-4e3c-94fb-a81f9f460112",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          question,
          overrideConfig: {
            sessionId: "sources-session-" + Date.now() // Optional: use a consistent ID for conversation memory
          }
        })
      }
    );
    
    const result = await response.json();
    
    console.log("Full response:", result);
    
    const answerText = result.text || result.answer || "No answer available";
    console.log("Answer:", answerText);
    
    const sourceDocuments: DocumentSource[] = result.sourceDocuments || [];
    
    if (sourceDocuments.length > 0) {
      console.log(`Found ${sourceDocuments.length} source documents:`);
      
      sourceDocuments.forEach((doc, index) => {
        console.log(`\nDocument #${index + 1}:`);
        console.log(`Page Content: ${doc.pageContent.substring(0, 100)}...`); // Show first 100 chars
        console.log("Metadata:", doc.metadata);
      });
      
      return {
        answer: answerText,
        sources: sourceDocuments
      };
    } else {
      console.log("No source documents were returned.");
      return {
        answer: answerText,
        sources: []
      };
    }
  } catch (error) {
    console.error("Error querying AI APP API:", error);
    throw error;
  }
}



export { queryWithSources }; 