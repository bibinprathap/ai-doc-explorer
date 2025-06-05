"use client";

import { useState } from "react";

export default function BasicExample() {
  const [text, setText] = useState("");

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Basic Example</h1>

      <div className="mb-4">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="p-2 border rounded w-full"
          placeholder="Type something here..."
        />
      </div>

      {text && (
        <div className="p-4 bg-gray-100 rounded">
          <h2 className="text-lg font-semibold mb-2">You typed:</h2>
          <p>{text}</p>
        </div>
      )}
    </div>
  );
}
