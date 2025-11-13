import React, { useState } from 'react';
import { Twitter, Copy } from 'lucide-react';

const Tweet = () => {
  const [keywords, setKeywords] = useState('');
  const [tweet, setTweet] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateTweet = async () => {
    if (!keywords.trim()) {
      setError('Please enter some keywords.');
      return;
    }

    setLoading(true);
    setError('');
    setTweet('');

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Write a tweet in about 250 characters informing about: ${keywords}. Don't make use of ** in your replies although you can make use of emojis`,
                  },
                ],
              },
            ],
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        const generatedText =
          data.candidates?.[0]?.content?.parts?.[0]?.text || 'No tweet generated.';
        setTweet(generatedText);
      } else {
        setError(data.error?.message || 'An error occurred while generating the tweet.');
      }
    } catch (err) {
      setError('Network error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(tweet)
      .then(() => {
        alert('Tweet copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  };

  const postToTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-12 p-8 bg-white border border-black rounded-lg">
      <h1 className="text-3xl font-bold text-center mb-6 text-black">Gemini Tweet Generator</h1>
      <input
        type="text"
        value={keywords}
        onChange={(e) => setKeywords(e.target.value)}
        placeholder="Enter some keywords..."
        className="w-full p-4 border border-black rounded mb-6 text-black placeholder-black focus:outline-none"
      />
      <button
        onClick={generateTweet}
        disabled={loading}
        className="w-full bg-black text-white py-3 px-4 rounded font-semibold mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Generating...' : 'Generate Tweet'}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-white border border-black rounded">
          <p className="text-black">{error}</p>
        </div>
      )}

      {tweet && (
        <div className="mt-8 bg-white p-6 rounded border border-black">
          <h2 className="text-xl font-semibold text-black mb-4">Generated Tweet:</h2>
          <p className="text-black leading-relaxed mb-6 break-word">{tweet}</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={copyToClipboard}
              className="flex-1 bg-black text-white py-2 px-4 rounded font-medium flex items-center justify-center gap-2"
            >
              <Copy size={16} />
              Copy to Clipboard
            </button>
            <button
              onClick={postToTwitter}
              className="flex-1 bg-black text-white py-2 px-4 rounded font-medium flex items-center justify-center gap-2"
            >
              <Twitter size={16} />
              Post to Twitter
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tweet;