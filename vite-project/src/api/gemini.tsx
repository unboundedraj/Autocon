// src/api/gemini.js
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const genAI = new GoogleGenerativeAI(API_KEY);

export const getWordMeaning = async (word: string) => {
  try {
    const model = genAI.getGenerativeModel({ model: "models/gemini-2.0-flash" });

    const prompt = `
Hey there, I am going to provide you a word now and I want you to reply by filling in the following format:

Word: <Your word here>
Meaning (EN): <Your meaning in English here>
Meaning (HI): <Your meaning in Hindi here>
Sentence 1: <Example sentence 1>
Sentence 2: <Example sentence 2>
Sentence 3: <Example sentence 3>

Note:
- The Hindi meaning must be in Hindi script only.
- Return the result in this layout exactly so I can copy it directly.

The word is: ${word}
    `.trim();

    const result = await model.generateContent([prompt]);
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error fetching detailed meaning.";
  }
};
