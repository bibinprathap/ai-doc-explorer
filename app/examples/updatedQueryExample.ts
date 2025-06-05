/**
 * Updated query function to access document sources from AI APP API
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function query(data: { question: string }) {
  const response = await fetch(
    "https://flow.spaceaiapp.com/api/v1/prediction/816d4fe3-239c-4e3c-94fb-a81f9f460112",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    }
  );
  const result = await response.json();
  
  const answerText = result.text || result.answer || null;
  
  const sourceDocuments = result.sourceDocuments || [];
  
  return {
    answerText,
    sourceDocuments
  };
}

