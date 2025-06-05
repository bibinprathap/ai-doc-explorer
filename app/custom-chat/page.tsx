"use client";

import React, { useState, useEffect, useRef } from "react";

interface ChatMessage {
  role: "apiMessage" | "userMessage";
  content: string;
}

const CustomChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [sessionId] = useState<string>(`session-${Date.now()}`); // Create one persistent sessionId
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    setMessages([
      { role: "apiMessage", content: "Hello! How can I help you today?" },
    ]);
  }, []);

  // Direct query function with sessionId
  async function queryFlowise(question: string, history: ChatMessage[]) {
    console.log(`Sending request with sessionId: ${sessionId}`);
    console.log("History:", history);

    const response = await fetch(
      "https://flowise.dentro-innovation.com/api/v1/prediction/954378ec-d580-4b9b-bac9-b7b0685120ea",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: question,
          history: history,
          overrideConfig: {
            sessionId: sessionId, // This is crucial for memory persistence
          },
        }),
      }
    );
    const result = await response.json();
    console.log("Response:", result);
    return result;
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      role: "userMessage",
      content: input,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await queryFlowise(input, messages);

      const assistantMessage: ChatMessage = {
        role: "apiMessage",
        content: response.text || response.answer || "No response content",
      };

      setMessages([...updatedMessages, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages([
        ...updatedMessages,
        {
          role: "apiMessage",
          content: "Sorry, there was an error processing your request.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      { role: "apiMessage", content: "Hello! How can I help you today?" },
    ]);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 flex flex-col h-screen">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Test Memory Chat</h1>
        <div>
          <span className="text-xs text-gray-500 mr-2">
            Session: {sessionId}
          </span>
          <button
            onClick={clearChat}
            className="bg-red-500 text-white px-3 py-1 rounded"
          >
            Reset Chat
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50 rounded p-4 mb-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-4 p-3 rounded ${
              msg.role === "userMessage"
                ? "bg-blue-100 ml-auto max-w-[80%]"
                : "bg-gray-100 max-w-[80%]"
            }`}
          >
            {msg.content}
          </div>
        ))}
        {loading && (
          <div className="bg-gray-100 p-3 rounded max-w-[80%] mb-4">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100" />
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border border-gray-300 rounded p-2"
          placeholder="Type your message..."
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default CustomChat;
