// src/api/gemini.js
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export const getWordMeaning = async (word: string) => {
  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      // Update the endpoint to use Gemini 2.5 Flash model
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
        {
        method: 'POST',
        body: JSON.stringify({ word }),
        headers: {
          'Content-Type': 'application/json',
          // Add your API key or other headers if needed
        },
      }
      );

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error && errorData.error.code === 429) {
          // Quota exceeded, wait and retry
          const retryAfter = errorData.retryAfter || 30; // Default to 30 seconds if not provided
          await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
          attempt++;
          continue; // Retry the request
        }
        throw new Error(`API error: ${errorData.error.message}`);
      }

      const data = await response.json();
      return data; // Return the fetched data
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error);
      attempt++;
      if (attempt >= maxRetries) {
        throw new Error('Max retries reached. Unable to fetch word meaning.');
      }
    }
  }
};
