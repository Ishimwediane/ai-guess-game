// pages/index.tsx
'use client';

import { useState } from 'react';

export default function Home() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello! Think of a word and I'll try to guess it by asking questions. Ready?" }
  ]);
  const [isStarted, setIsStarted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUserResponse = (response: string) => {
    const newMessages = [...messages, { role: 'user', content: response }];
    setMessages(newMessages);
    sendToAI(newMessages); // Next step: send to backend
  };

  const sendToAI = async (msgs: any) => {
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: msgs })
      });
      const data = await res.json();
      setMessages([...msgs, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow-lg p-6 space-y-4">
        <h1 className="text-2xl font-bold text-center">🤖 AI Guessing Game</h1>

        <div className="space-y-2 max-h-64 overflow-y-auto border p-3 rounded">
          {messages.map((msg, i) => (
            <div key={i} className={`text-sm ${msg.role === 'assistant' ? 'text-blue-600' : 'text-green-700 text-right'}`}>
              {msg.content}
            </div>
          ))}
          {loading && <div className="text-blue-400">AI is thinking...</div>}
        </div>

        {isStarted ? (
          <div className="flex justify-between">
            {['Yes', 'No', 'Maybe'].map((btn) => (
              <button
                key={btn}
                onClick={() => handleUserResponse(btn)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                {btn}
              </button>
            ))}
          </div>
        ) : (
          <button
            onClick={() => setIsStarted(true)}
            className="bg-green-500 text-white w-full py-2 rounded hover:bg-green-600"
          >
            Start Game
          </button>
        )}
      </div>
    </main>
  );
}
