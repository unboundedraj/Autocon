import React, { useState, useRef, useEffect } from 'react';

interface Slide {
  type: 'thumbnail' | 'slide' | 'closing';
  text: string;
  fontFamily: string;
  fontSize: number;
  bgColor: string;
  bgImage: string | null;
  fontColor: string;
  bold: boolean;
  italic: boolean;
  highlightColor: string;
  highlightedWords: string[];
  currentImage: number;
}

const closingImageArray = [
  'https://via.placeholder.com/675x675/1a1a1a/ffffff?text=Logo+1',
  'https://via.placeholder.com/675x675/2a2a2a/ffffff?text=Logo+2',
  'https://via.placeholder.com/675x675/3a3a3a/ffffff?text=Logo+3',
];

function Post2() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const previewRef = useRef<HTMLDivElement | null>(null);

  const addSlide = () => {
    const type = slides.length === 0 ? 'thumbnail' : 'slide';
    const newSlide = createNewSlide(type);
    setSlides([...slides, newSlide]);
    setSelectedIndex(slides.length);
  };

  const addClosingSlide = () => {
    const newSlide = createNewSlide('closing');
    setSlides([...slides, newSlide]);
    setSelectedIndex(slides.length);
  };

  const createNewSlide = (type: 'thumbnail' | 'slide' | 'closing'): Slide => ({
    type,
    text: '',
    fontFamily: 'Times New Roman',
    fontSize: 24,
    bgColor: '#FFFFFF',
    bgImage: null,
    fontColor: '#000000',
    bold: false,
    italic: false,
    highlightColor: '#ff0000',
    highlightedWords: [],
    currentImage: 0,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null || !e.ctrlKey) return;

      const currentSlide = slides[selectedIndex];
      if (!currentSlide) return;

      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          updateSlide(selectedIndex, 'fontSize', Math.min(currentSlide.fontSize + 2, 72));
          break;
        case 'ArrowDown':
          e.preventDefault();
          updateSlide(selectedIndex, 'fontSize', Math.max(currentSlide.fontSize - 2, 12));
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, slides]);

  const updateSlide = (index: number, key: keyof Slide, value: any) => {
    const updated = [...slides];
    updated[index] = { ...updated[index], [key]: value };
    setSlides(updated);
  };

  const updateAllSlides = (key: keyof Slide, value: any) => {
    const updated = slides.map(slide => ({ ...slide, [key]: value }));
    setSlides(updated);
  };

  const toggleHighlight = (index: number, word: string) => {
    const slide = slides[index];
    const updatedWords = slide.highlightedWords.includes(word)
      ? slide.highlightedWords.filter(w => w !== word)
      : [...slide.highlightedWords, word];
    updateSlide(index, 'highlightedWords', updatedWords);
  };

  const changeClosingImage = (index: number, direction: number) => {
    const slide = slides[index];
    const newImageIndex = 
      (slide.currentImage + direction + closingImageArray.length) % closingImageArray.length;
    updateSlide(index, 'currentImage', newImageIndex);
  };

  interface RenderSlideProps {
    slide: Slide;
    index: number;
  }

  const RenderSlide: React.FC<RenderSlideProps> = ({ slide, index }) => {
    const style: React.CSSProperties = {
      fontFamily: slide.fontFamily,
      fontSize: `${slide.fontSize}px`,
      backgroundColor: slide.bgImage ? 'transparent' : slide.bgColor,
      backgroundImage: slide.bgImage ? `url(${slide.bgImage})` : 'none',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      color: slide.fontColor,
      fontWeight: slide.bold ? 'bold' : 'normal',
      fontStyle: slide.italic ? 'italic' : 'normal',
      position: 'relative' as const,
      width: '625px',
      height: '625px',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
    };

    const renderTextWithHighlights = () => {
      return slide.text.split('\n').map((line, lineIndex) => (
        <React.Fragment key={lineIndex}>
          {line.split(/(\s+)/).map((word, wordIndex) => {
            const trimmed = word.trim();
            if (!trimmed) return word;
            const isHighlighted = slide.highlightedWords.includes(trimmed);
            return (
              <span
                key={wordIndex}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleHighlight(index, trimmed);
                }}
                style={{
                  backgroundColor: isHighlighted ? slide.highlightColor : 'transparent',
                  cursor: 'pointer',
                  padding: '0 2px',
                  borderRadius: '4px',
                }}
              >
                {word}
              </span>
            );
          })}
          {lineIndex < slide.text.split('\n').length - 1 && <br />}
        </React.Fragment>
      ));
    };

    return (
      <div
        ref={(el) => {
          slideRefs.current[index] = el;
        }}
        className="m-2 shadow-xl rounded overflow-hidden"
        style={style}
        onClick={() => setSelectedIndex(index)}
      >
        {slide.type === 'closing' ? (
          <>
            <div className="absolute inset-0" style={{
              border: `8px solid ${slide.bgColor}`,
              borderRadius: '0px'
            }}>
              <img
                src={closingImageArray[slide.currentImage]}
                alt="closing"
                className="w-full h-full object-contain rounded"
              />
            </div>
            <div className="absolute bottom-2 w-full text-center text-gray-400 px-2 whitespace-pre-line">
              {slide.text}
            </div>
          </>
        ) : (
          <div className="p-4 z-10 whitespace-pre-line">
            {renderTextWithHighlights()}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center p-4">
      <div className="relative w-full max-w-[720px] overflow-hidden" ref={previewRef}>
        {selectedIndex !== null && slides[selectedIndex] && (
          <div className="relative inline-block">
            <div className="relative">
              <RenderSlide
                slide={slides[selectedIndex]}
                index={selectedIndex}
              />
            </div>
            {/* Top left corner circle */}
            <div 
              className={`absolute w-3 h-3 rounded-full bg-red-500 transition-colors duration-200 cursor-pointer ${
                slides[selectedIndex].bgColor === '#000000' ? 'hover:bg-black' : 'hover:bg-white'
              }`}
              style={{ zIndex: 1000, top: '8px', left: '8px' }}
            ></div>
          </div>
        )}

        {selectedIndex !== null && slides[selectedIndex]?.type === 'closing' && (
          <div className="flex justify-center mt-4 space-x-4">
            <button 
              onClick={() => changeClosingImage(selectedIndex, -1)}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg shadow-md transition-colors"
            >
              Previous Logo
            </button>
            <button 
              onClick={() => changeClosingImage(selectedIndex, 1)}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg shadow-md transition-colors"
            >
              Next Logo
            </button>
          </div>
        )}

        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() =>
              setSelectedIndex((prev) => prev === null ? 0 : (prev - 1 + slides.length) % slides.length)
            }
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition-colors"
            disabled={slides.length <= 1}
          >
            Prev Slide
          </button>

          <div className="flex space-x-2">
            <button
              onClick={() => {
                if (selectedIndex !== null) {
                  const updatedSlides = slides.filter((_, idx) => idx !== selectedIndex);
                  setSlides(updatedSlides);
                  setSelectedIndex((prev) =>
                    updatedSlides.length === 0 ? null : Math.max(0, (prev || 0) - 1)
                  );
                }
              }}
              className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-md transition-colors"
              title="Delete Current Slide"
            >
              🗑️
            </button>
            <button
              onClick={() => {
                setSlides([]);
                setSelectedIndex(null);
              }}
              className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-md transition-colors"
              title="Delete All Slides"
            >
              🧹
            </button>
          </div>

          <button
            onClick={() =>
              setSelectedIndex((prev) => prev === null ? 0 : (prev + 1) % slides.length)
            }
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition-colors"
            disabled={slides.length <= 1}
          >
            Next Slide
          </button>
        </div>

      </div>

      <div className="mt-4 flex space-x-2">
        <button
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-md transition-colors"
          onClick={() => {
            if (previewRef.current) {
              const rect = previewRef.current.getBoundingClientRect();
              const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
              // Account for the m-2 margin (8px) minus 1px to show white background
              const targetPosition = scrollTop + rect.top + 7;
              
              window.scrollTo({ 
                top: targetPosition, 
                behavior: 'smooth'
              });
            }
          }}
        >
          Position for SS
        </button>
        <button
          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-md transition-colors"
          onClick={slides.length === 0 ? addSlide : slides.find(s => s.type === 'closing') ? undefined : addSlide}
          disabled={!!slides.find(s => s.type === 'closing')}
        >
          {slides.length === 0
            ? 'Add Thumbnail'
            : slides.find(s => s.type === 'closing')
            ? 'All Slides Added'
            : 'Add Slide'}
        </button>
        {slides.length > 0 && !slides.find(s => s.type === 'closing') && (
          <button
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-md transition-colors"
            onClick={addClosingSlide}
          >
            Add Closing Slide
          </button>
        )}
      </div>

      {selectedIndex !== null && slides[selectedIndex] && (
        <div className="w-full max-w-4xl p-8 mt-8 rounded-2xl shadow-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-gray-100 border border-slate-700">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-bold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              Slide #{selectedIndex + 1} Controls
            </h2>
            <div className="flex items-center space-x-2 px-3 py-1 bg-slate-700 rounded-full">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-slate-300">Live Preview</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl border border-slate-600/50">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-slate-900 font-bold text-sm">T</span>
                  </div>
                  <label className="text-lg font-semibold text-slate-200">
                    Content
                  </label>
                </div>
                <textarea
                  className="w-full p-4 border-2 border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-700/50 text-white placeholder-slate-400 transition-all duration-200 resize-none shadow-inner"
                  value={slides[selectedIndex].text}
                  onChange={(e) => updateSlide(selectedIndex, 'text', e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      updateSlide(selectedIndex, 'text', slides[selectedIndex].text + '\n');
                    }
                  }}
                  rows={5}
                  placeholder="Enter your slide content here..."
                />
                <div className="mt-2 text-xs text-slate-400 flex items-center">
                  <span className="mr-2">💡</span>
                  <span>Press Enter to add new lines, click words in preview to highlight</span>
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl border border-slate-600/50">
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-violet-400 to-purple-400 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-slate-900 font-bold text-sm">Aa</span>
                  </div>
                  <label className="text-lg font-semibold text-slate-200">
                    Typography
                  </label>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-slate-300">
                      Font Family
                    </label>
                    <div className="relative">
                      <select
                        className="w-full p-3 border-2 border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-slate-700/50 text-white appearance-none cursor-pointer transition-all duration-200"
                        value={slides[selectedIndex].fontFamily}
                        onChange={(e) => updateSlide(selectedIndex, 'fontFamily', e.target.value)}
                      >
                        <option value="Times New Roman">Times New Roman (Default)</option>
                        <option value="sans-serif">Sans-serif </option>
                        <option value="serif">Serif (Classic)</option>
                        <option value="monospace">Monospace (Code)</option>
                        <option value="Arial">Arial</option>
                        <option value="Georgia">Georgia</option>
                        <option value="Courier New">Courier New</option>
                        <option value="Trebuchet MS">Trebuchet MS</option>
                        <option value="Verdana">Verdana</option>
                        <option value="Comic Sans MS">Comic Sans MS</option>
                        <option value="Impact">Impact</option>
                        <option value="Lucida Console">Lucida Console</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-slate-300">
                      Font Size
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        className="w-full p-3 border-2 border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-slate-700/50 text-white transition-all duration-200"
                        value={slides[selectedIndex].fontSize}
                        onChange={(e) => updateSlide(selectedIndex, 'fontSize', +e.target.value)}
                        min="12"
                        max="72"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <span className="text-xs text-slate-400">px</span>
                      </div>
                    </div>
                    <div className="text-xs text-slate-400">
                      Use Ctrl + ↑/↓ for quick adjustment
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-slate-700/30 rounded-lg">
                  <div className="flex flex-wrap gap-4">
                    <label className="inline-flex items-center cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={slides[selectedIndex].bold}
                          onChange={(e) => updateSlide(selectedIndex, 'bold', e.target.checked)}
                        />
                        <div className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                          slides[selectedIndex].bold ? 'bg-blue-500' : 'bg-slate-600'
                        }`}>
                          <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-all duration-200 ${
                            slides[selectedIndex].bold ? 'translate-x-6' : 'translate-x-0.5'
                          } mt-0.5`}></div>
                        </div>
                      </div>
                      <span className="ml-3 text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
                        <strong>Bold</strong>
                      </span>
                    </label>

                    <label className="inline-flex items-center cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={slides[selectedIndex].italic}
                          onChange={(e) => updateSlide(selectedIndex, 'italic', e.target.checked)}
                        />
                        <div className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                          slides[selectedIndex].italic ? 'bg-blue-500' : 'bg-slate-600'
                        }`}>
                          <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-all duration-200 ${
                            slides[selectedIndex].italic ? 'translate-x-6' : 'translate-x-0.5'
                          } mt-0.5`}></div>
                        </div>
                      </div>
                      <span className="ml-3 text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
                        <em>Italic</em>
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl border border-slate-600/50">
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-rose-400 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-slate-900 font-bold text-sm">🎨</span>
                  </div>
                  <label className="text-lg font-semibold text-slate-200">
                    Colors
                  </label>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      Background
                    </label>
                    <div className="flex items-center space-x-3">
                      <button
                        className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                          slides[selectedIndex].bgColor === '#000000'
                            ? 'border-blue-500 bg-slate-700/50 text-white'
                            : 'border-slate-500 bg-slate-600/30 text-slate-300'
                        }`}
                        onClick={() => updateAllSlides('bgColor', '#000000')}
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-4 h-4 bg-black rounded border border-slate-400"></div>
                          <span className="text-sm font-medium">Black</span>
                        </div>
                      </button>
                      <button
                        className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                          slides[selectedIndex].bgColor === '#FFFFFF'
                            ? 'border-blue-500 bg-slate-700/50 text-white'
                            : 'border-slate-500 bg-slate-600/30 text-slate-300'
                        }`}
                        onClick={() => updateAllSlides('bgColor', '#FFFFFF')}
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-4 h-4 bg-white rounded border border-slate-400"></div>
                          <span className="text-sm font-medium">White</span>
                        </div>
                      </button>
                    </div>
                  </div>
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      Background Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            updateSlide(selectedIndex, 'bgImage', ev.target?.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full text-sm text-slate-300"
                    />
                    {slides[selectedIndex].bgImage && (
                      <button
                        className="mt-2 px-3 py-1 bg-red-500 text-white rounded-md"
                        onClick={() => updateSlide(selectedIndex, 'bgImage', null)}
                      >
                        Remove Image
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      Text Color
                    </label>
                    <div className="flex items-center space-x-3 p-3 bg-slate-700/30 rounded-lg">
                      <input
                        type="color"
                        className="w-12 h-12 rounded-xl cursor-pointer border-2 border-slate-500 shadow-inner"
                        value={slides[selectedIndex].fontColor}
                        onChange={(e) => updateSlide(selectedIndex, 'fontColor', e.target.value)}
                      />
                      <div className="flex-1">
                        <div className="text-sm font-mono text-slate-200">{slides[selectedIndex].fontColor}</div>
                        <div className="text-xs text-slate-400">Text color</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      Highlight
                    </label>
                    <div className="flex items-center space-x-3 p-3 bg-slate-700/30 rounded-lg">
                      <input
                        type="color"
                        className="w-12 h-12 rounded-xl cursor-pointer border-2 border-slate-500 shadow-inner"
                        value={slides[selectedIndex].highlightColor}
                        onChange={(e) => updateSlide(selectedIndex, 'highlightColor', e.target.value)}
                      />
                      <div className="flex-1">
                        <div className="text-sm font-mono text-slate-200">{slides[selectedIndex].highlightColor}</div>
                        <div className="text-xs text-slate-400">Highlight color</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl border border-slate-600/50">
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-400 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-slate-900 font-bold text-sm">⬇</span>
                  </div>
                  <label className="text-lg font-semibold text-slate-200">
                    Export
                  </label>
                </div>
                
                <div className="space-y-4">
                  <button 
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-red-500 transition w-full"
                    onClick={() => navigator.clipboard.writeText(`Explain the meaning of the following term or phrase in simple and clear language. Then, identify which of the following domains it is most relevant to (you may list multiple domains if applicable):

Software Development, Hardware Engineering, Artificial Intelligence, Cybersecurity, Cloud Computing, Networking & Communication, Machine Learning,Database Management Systems, Embedded Systems, Internet of Things (IoT), Data Science, Blockchain & Cryptography, Operating Systems, DevOps & Automation, Computer Vision, Quantum Computing, Human-Computer Interaction, Virtual & Augmented Reality (VR/AR), Edge Computing, Natural Language Processing (NLP), Game Development, Healthcare & Medicine, Law & Order, Crime & Forensics, Politics & Governance, Military & Defense, Futuristic & Sci-fi, Real Estate, Education & Learning, Finance & Banking, Business & Management, Marketing & Advertising, Social Media & Communication, Environmental Science, Biotechnology, Automotive & Transportation, Aerospace & Aviation, Robotics, Agriculture & Food Tech, Energy & Utilities, Urban Planning & Smart Cities, E-commerce & Retail, Logistics & Supply Chain, Ethics & Philosophy, Psychology & Human Behavior, Space Exploration, Tourism & Hospitality, Entertainment & Media, Sports & Fitness, Art & Design, History & Anthropology.

Also provide a few real-world examples or scenarios where this term is used. Provide your response in the following format: Domain:....(provide 1-2 out of the above).(copy option)  sub domain:....(provide 2 to 4 not necessarily from the above )(copy option) slide 1:(Tell about the topic in 50 words) (copy option), slide 2:(tell more about the topic in 50 words)(copy option) ...you can increase the no of slides as per your convenience

The term / phrase is: 
`)}
                  >
                    Copy Prompt 1
                  </button>
                  <button 
                    className="px-4 py-2 bg-amber-300 text-white rounded-md hover:bg-cyan-400 transition w-full"
                    onClick={() => navigator.clipboard.writeText(`Hey there, I want you to provide a nice, short(about 60 words) long caption for a post that i am going to be making on instagram, ensure that you add hashtags as well, the post is about:
`)}
                  >
                    Copy Prompt 2
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Post2;