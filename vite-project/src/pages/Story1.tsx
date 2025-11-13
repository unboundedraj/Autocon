import React, { useState } from "react";
import { getWordMeaning } from "../api/gemini.tsx";
import domtoimage from 'dom-to-image';


interface ParsedData {
  word: string;
  meaningEN: string;
  meaningHI: string;
  sentences: string[];
}

const WordPage: React.FC = () => {
  const [word, setWord] = useState<string>("");
  const [meaning, setMeaning] = useState<string>("");
  const [promptText, setPromptText] = useState<string>("");
  const [editableContent, setEditableContent] = useState<string>("");
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const buildPrompt = (word: string): string => `
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

  const handleFetchMeaning = async (): Promise<void> => {
    setIsLoading(true);
    const prompt = buildPrompt(word);
    setPromptText(prompt);
    const result = await getWordMeaning(word);
    setMeaning(result);
    setIsLoading(false);
  };

  const parseResponseText = (): void => {
    const lines = editableContent.split('\n');
    const data: ParsedData = {
      word: '',
      meaningEN: '',
      meaningHI: '',
      sentences: []
    };

    lines.forEach((line: string) => {
      if (line.startsWith('Word:')) {
        data.word = line.replace('Word:', '').trim();
      } else if (line.startsWith('Meaning (EN):')) {
        data.meaningEN = line.replace('Meaning (EN):', '').trim();
      } else if (line.startsWith('Meaning (HI):')) {
        data.meaningHI = line.replace('Meaning (HI):', '').trim();
      } else if (line.startsWith('Sentence')) {
        const sentence = line.split(':')[1]?.trim();
        if (sentence) data.sentences.push(sentence);
      }
    });

    setParsedData(data);
  };

  const handleDownloadImage = (): void => {
    const node = document.getElementById('story-preview');
    if (!node) return;

    // domtoimage type is any, so we cast it
    (domtoimage as any).toJpeg(node, { quality: 0.95 })
      .then((dataUrl: string) => {
        const link = document.createElement('a');
        link.download = `${parsedData?.word || 'vocab'}-preview.jpg`;
        link.href = dataUrl;
        link.click();
      })
      .catch((error: any) => {
        console.error('Error generating image:', error);
      });
  };

  const highlightWord = (sentence: string, word: string): React.ReactNode[] => {
    const regex = new RegExp(`\\b(${word})\\b`, 'gi');
    const parts = sentence.split(regex);
    return parts.map((part: string, i: number) =>
      part.toLowerCase() === word.toLowerCase() ? (
        <span key={i} className="text-yellow-400 font-bold">{part}</span>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  const [labelColor] = useState<string>(() => {
    const colors = ['text-red-400', 'text-green-400', 'text-blue-400', 'text-pink-400', 'text-purple-400'];
    return colors[Math.floor(Math.random() * colors.length)];
  });

  const handleCopyPrompt = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(promptText);
      // Create a temporary notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse';
      notification.textContent = 'Prompt copied to clipboard!';
      document.body.appendChild(notification);
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleTransferToTextarea = (): void => {
    if (meaning) {
      setEditableContent(meaning);
    } else {
      alert("No response available to transfer.");
    }
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="w-full max-w-3xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Word Meaning Finder</h1>
          <p className="max-w-md mx-auto text-base">Discover meanings, translations, and example sentences for any word</p>
        </div>

        {/* Input Section */}
        <div className="mb-8">
          <div className="p-6 border border-black rounded-lg">
            <div className="mb-6">
              <input
                type="text"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                placeholder="Enter a word to explore..."
                className="w-full border border-black rounded px-4 py-3 text-black placeholder-black focus:outline-none"
              />
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={handleFetchMeaning}
                disabled={!word || isLoading}
                className="bg-black text-white px-6 py-3 rounded font-semibold"
              >
                {isLoading ? 'Searching...' : 'Get Meaning'}
              </button>
              <button
                onClick={handleCopyPrompt}
                className="bg-black text-white px-6 py-3 rounded font-semibold"
              >
                Copy Prompt
              </button>
            </div>
          </div>
        </div>

        {/* Gemini Response */}
        {meaning && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-white rounded-2xl p-6 border border-black">
              <div className="flex items-center mb-4">
                <h2 className="text-xl font-semibold text-black">AI Response</h2>
              </div>
              <pre className="text-black whitespace-pre-line font-mono text-sm leading-relaxed">
                {meaning}
              </pre>
            </div>
          </div>
        )}

        {/* Editable Content */}
        <div className="mb-8">
          <div className="p-6 border border-black rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Edit Content</h3>
            <textarea
              className="w-full h-48 border border-black rounded p-4 text-black placeholder-black focus:outline-none resize-none font-mono text-sm"
              placeholder="Paste or edit the response here..."
              value={editableContent}
              onChange={(e) => setEditableContent(e.target.value)}
            />
            <div className="flex flex-wrap gap-4 mt-4">
              <button
                onClick={handleTransferToTextarea}
                className="bg-black text-white px-6 py-3 rounded font-semibold"
              >
                Transfer Response
              </button>
              <button
                onClick={parseResponseText}
                className="bg-black text-white px-6 py-3 rounded font-semibold"
              >
                Generate Preview
              </button>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        {parsedData && (
          <div className="mb-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold bg-linear-to-r from-pink-400 via-purple-500 to-indigo-500 bg-clip-text text-transparent mb-2">
                Preview Generated
              </h2>
              <p className="text-gray-400">Your word card is ready for download</p>
            </div>
            
            <div className="flex justify-center items-center w-full bg-linear-to-br from-gray-800 to-gray-900 py-10 rounded-2xl shadow-2xl">
              <div
                id="story-preview"
                className="
                  bg-black text-white relative overflow-hidden flex flex-col justify-start
                  px-8 sm:px-24 md:px-8 lg:px-12 xl:px-16
                  pt-16 sm:pt-24 md:pt-32 lg:pt-40
                  pb-8 sm:pb-10 md:pb-12
                  space-y-4 sm:space-y-6 md:space-y-8
                  w-full max-w-[1080px]
                  aspect-9/16
                  font-sans
                "
              >
                {/* Header */}
                <div className="flex items-center justify-between w-full px-2">
                  <div className="
                      text-3xl sm:text-4xl md:text-5xl lg:text-8xl xl:text-7xl
                      italic font-extrabold text-white
                      break-word
                    ">
                    {parsedData.word}
                  </div>
                </div>

                {/* Meanings */}
                <div className="text-yellow-400 space-y-1 sm:space-y-2">
                  <p className="text-xs sm:text-lg md:text-xl lg:text-4xl break-word">
                    Meaning (EN): {parsedData.meaningEN}
                  </p>
                  <p className="text-xs sm:text-lg md:text-xl lg:text-4xl break-word">
                    Meaning (HI): {parsedData.meaningHI}
                  </p>
                </div>

                {/* Sentences */}
                <div className="mt-4 sm:mt-6 md:mt-8 space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6 leading-snug">
                  {parsedData.sentences.map((sentence, i) => (
                    <div key={i}>
                      <span className={`block font-semibold ${labelColor} sm:text-base md:text-lg lg:text-4xl`}>
                        Sentence {i + 1}:
                      </span>
                      <p className="text-white text-xs sm:text-lg md:text-xl lg:text-4xl break-word">
                        {highlightWord(sentence, parsedData.word)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Download Button */}
            <div className="text-center mt-8">
              <button
                onClick={handleDownloadImage}
                className="bg-linear-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center space-x-3 mx-auto transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-pink-500/25"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-4-4m4 4l4-4m-6 4h8"></path>
                </svg>
                <span>Download as Image</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WordPage;