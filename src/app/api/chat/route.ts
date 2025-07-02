// src/app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';

type FrontendMessage = {
  role: 'user' | 'assistant'; 
  content: string;
};


type GeminiMessagePart = {
  text: string;
};

type GeminiMessage = {
  role: 'user' | 'model'; 
  parts: GeminiMessagePart[];
};


type GeminiResponse = {
  candidates?: {
    content?: {
      parts?: { text?: string }[];
    };
  }[];
  error?: {
    message: string;
    code: number;
    status: string;
  };
};

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export async function POST(req: NextRequest) {

  const { messages }: { messages: FrontendMessage[] } = await req.json();

 
  const geminiMessages: GeminiMessage[] = [
    {
      role: 'user', 
      parts: [{ text: 'You are an AI that plays a guessing game by asking yes/no/maybe questions to guess a word the user is thinking of.' }],
    },
  
    ...messages.map((msg: FrontendMessage): GeminiMessage => ({
      role: msg.role === 'assistant' ? 'model' : 'user', // Map 'assistant' to 'model'
      parts: [{ text: msg.content }],
    })),
  ];

  try {
    const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: geminiMessages }),
    });

    const data = (await response.json()) as GeminiResponse;

    // Log the full response data for debugging
    console.log('Gemini API Response:', JSON.stringify(data, null, 2));

    // Check for API-level errors first
    if (data.error) {
      console.error('Gemini API Error Response:', data.error.message);
      return NextResponse.json(
        { reply: `Gemini API Error: ${data.error.message}` },
        { status: data.error.code || 500 }
      );
    }

    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I didn’t get that. (No valid candidate found.)';

    return NextResponse.json({ reply });
  } catch (error) {
  
    return NextResponse.json({ reply: 'Error contacting Gemini API.' }, { status: 500 });
  }
}