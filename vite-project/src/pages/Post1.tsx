

import React, { useState, useRef } from "react";
import domtoimage from "dom-to-image";
import PreviewArea from "../components/PreviewArea";
import ColorPalette from "../components/ColorPalette";
import SlideNav from "../components/SlideNav";

const prompts = [
  "Prompt 1 will be provided later...",
  "Prompt 2 will be provided later...",
  "Prompt 3 will be provided later..."
];

type Slide = {
  text: string;
  fontSize: number;
  previewBg: "white" | "black";
  highlightColor: string;
  highlightedWord: string | null;
};

export default function Post1() {
  const [slides, setSlides] = useState<Slide[]>([{
    text: "",
    fontSize: 32,
    previewBg: "white",
    highlightColor: "yellow",
    highlightedWord: null
  }]);
  const [current, setCurrent] = useState(0);
  const [isBold, setIsBold] = useState(false);
  const previewRefs = useRef<(HTMLDivElement | null)[]>([]);

  const currentSlide = slides[current];

  const paletteColors = [
    "yellow", "#ffb300", "#ff5252", "#40c4ff", "#69f0ae", "#ffd600", "#d500f9", "#ff4081", "#212121"
  ];

  function copyPrompt(index: number) {
    navigator.clipboard.writeText(prompts[index]);
  }

  // Download all slides as images
  const handleDownloadAll = async () => {
    for (let i = 0; i < slides.length; i++) {
      const node = previewRefs.current[i];
      if (!node) continue;
      try {
        const dataUrl = await (domtoimage as any).toJpeg(node, { quality: 0.95 });
        const link = document.createElement('a');
        link.download = `slide-${i + 1}.jpg`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        alert(`Failed to download slide ${i + 1}`);
      }
    }
  };

  // Handle font size change with Ctrl+Up/Down
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
      e.preventDefault();
      setSlides((prev) => prev.map((slide, idx) =>
        idx === current
          ? {
              ...slide,
              fontSize:
                e.key === "ArrowUp"
                  ? Math.min(slide.fontSize + 2, 120)
                  : Math.max(slide.fontSize - 2, 8)
            }
          : slide
      ));
    }
  };

  // Slide navigation handlers
  const handlePrev = () => setCurrent((c) => Math.max(0, c - 1));
  const handleNext = () => setCurrent((c) => Math.min(slides.length - 1, c + 1));
  const handleAdd = () => {
    setSlides((prev) => [
      ...prev,
      {
        text: "",
        fontSize: 32,
        previewBg: "white",
        highlightColor: "yellow",
        highlightedWord: null
      }
    ]);
    setCurrent(slides.length);
  };

  return (
    <div className="p-8 text-center">
      {/* Prompt Copy Buttons */}
      <div className="flex justify-center gap-4 mb-6">
        {[1, 2, 3].map((num, idx) => (
          <button
            key={num}
            className="px-4 py-2 border border-black rounded text-black bg-white hover:bg-black hover:text-white transition-colors font-semibold"
            onClick={() => copyPrompt(idx)}
          >
            {num}
          </button>
        ))}
      </div>

      {/* Slide Navigation */}
      <SlideNav
        current={current}
        total={slides.length}
        onPrev={handlePrev}
        onNext={handleNext}
        onAdd={handleAdd}
      />


      {/* Preview Area with Toggle */}
      <div className="flex flex-col items-center mb-6">
        <div className="mb-2 flex gap-2">
          <button
            className={`px-4 py-2 border rounded font-semibold ${currentSlide.previewBg === "white" ? "bg-black text-white" : "bg-white text-black"}`}
            onClick={() => setSlides(slides.map((slide, idx) => idx === current ? { ...slide, previewBg: slide.previewBg === "white" ? "black" : "white" } : slide))}
          >
            Toggle {currentSlide.previewBg === "white" ? "Black" : "White"} Background
          </button>
          <button
            className={`px-4 py-2 border rounded font-semibold ${isBold ? "bg-black text-white" : "bg-white text-black"}`}
            onClick={() => setIsBold(b => !b)}
          >
            {isBold ? "Unbold" : "Bold"}
          </button>
        </div>
        <PreviewArea background={currentSlide.previewBg}>
          <div
            ref={el => { previewRefs.current[current] = el; }}
            style={{
              fontFamily: 'Times New Roman, Times, serif',
              fontSize: currentSlide.fontSize,
              color: currentSlide.previewBg === "white" ? "black" : "white",
              width: "100%",
              wordBreak: "break-word",
              textAlign: "center",
              cursor: "pointer",
              fontWeight: isBold ? "bold" : "normal",
              paddingLeft: 32,
              paddingRight: 32,
              boxSizing: "border-box"
            }}
          >
            {currentSlide.text
              ? currentSlide.text.split(/(\s+)/).map((word, idx) => {
                  if (/^\s+$/.test(word)) return word;
                  const isHighlighted = word === currentSlide.highlightedWord;
                  return (
                    <span
                      key={idx}
                      onClick={() => setSlides(slides.map((slide, sidx) => sidx === current ? { ...slide, highlightedWord: word === slide.highlightedWord ? null : word } : slide))}
                      style={isHighlighted ? { background: currentSlide.highlightColor, borderRadius: 4, padding: '0 2px', fontWeight: isBold ? "bold" : "normal" } : { fontWeight: isBold ? "bold" : "normal" }}
                    >
                      {word}
                    </span>
                  );
                })
              : <span style={{ opacity: 0.4, fontWeight: isBold ? "bold" : "normal" }}>[Your text will appear here]</span>
            }
          </div>
        </PreviewArea>
        {/* Hidden previews for download */}
        <div style={{ position: "absolute", left: -9999, top: 0, height: 0, overflow: "hidden" }}>
          {slides.map((slide, idx) => (
            <PreviewArea key={idx} background={slide.previewBg}>
              <div
                ref={el => { previewRefs.current[idx] = el; }}
                style={{
                  fontFamily: 'Times New Roman, Times, serif',
                  fontSize: slide.fontSize,
                  color: slide.previewBg === "white" ? "black" : "white",
                  width: "100%",
                  wordBreak: "break-word",
                  textAlign: "center",
                  cursor: "pointer",
                  fontWeight: isBold ? "bold" : "normal",
                  paddingLeft: 32,
                  paddingRight: 32,
                  boxSizing: "border-box"
                }}
              >
                {slide.text
                  ? slide.text.split(/(\s+)/).map((word, widx) => {
                      if (/^\s+$/.test(word)) return word;
                      const isHighlighted = word === slide.highlightedWord;
                      return (
                        <span
                          key={widx}
                          style={isHighlighted ? { background: slide.highlightColor, borderRadius: 4, padding: '0 2px', fontWeight: isBold ? "bold" : "normal" } : { fontWeight: isBold ? "bold" : "normal" }}
                        >
                          {word}
                        </span>
                      );
                    })
                  : <span style={{ opacity: 0.4, fontWeight: isBold ? "bold" : "normal" }}>[Your text will appear here]</span>
                }
              </div>
            </PreviewArea>
          ))}
        </div>
        {/* Color Palette for highlight */}
        <ColorPalette
          colors={paletteColors}
          selected={currentSlide.highlightColor}
          onSelect={color => setSlides(slides.map((slide, idx) => idx === current ? { ...slide, highlightColor: color } : slide))}
        />
        <button
          className="mt-4 px-6 py-2 bg-black text-white rounded font-semibold border border-black hover:bg-white hover:text-black transition-colors"
          onClick={handleDownloadAll}
        >
          Download All Slides
        </button>
      </div>

      {/* Text Input Area */}
      <div className="flex flex-col items-center mb-6">
        <textarea
          className="w-full max-w-xl border border-black rounded p-3 text-black font-serif mb-2"
          style={{ fontFamily: 'Times New Roman, Times, serif', fontSize: currentSlide.fontSize }}
          rows={3}
          placeholder="Enter your text here..."
          value={currentSlide.text}
          onChange={e => setSlides(slides.map((slide, idx) => idx === current ? { ...slide, text: e.target.value } : slide))}
          onKeyDown={handleKeyDown}
        />
        <div className="text-sm text-gray-500">Font size: {currentSlide.fontSize}px (Ctrl+↑/↓ to adjust)</div>
      </div>

    </div>
  );
}
