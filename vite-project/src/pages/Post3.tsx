import React, { useMemo, useRef, useState } from 'react';
import { toPng } from 'html-to-image';

type SlideType = 'thumbnail' | 'slide' | 'closing';
type BgFit = 'width' | 'height';

interface Slide {
  type: SlideType;
  text: string;
  fontFamily: string;
  fontSize: number;
  bgColor: string;
  bgImage: string | null;
  bgFit: BgFit;
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

const prompt1Text = `Explain the meaning of the following term or phrase in simple and clear language. Then, identify which of the following domains it is most relevant to (you may list multiple domains if applicable):

Software Development, Hardware Engineering, Artificial Intelligence, Cybersecurity, Cloud Computing, Networking & Communication, Machine Learning,Database Management Systems, Embedded Systems, Internet of Things (IoT), Data Science, Blockchain & Cryptography, Operating Systems, DevOps & Automation, Computer Vision, Quantum Computing, Human-Computer Interaction, Virtual & Augmented Reality (VR/AR), Edge Computing, Natural Language Processing (NLP), Game Development, Healthcare & Medicine, Law & Order, Crime & Forensics, Politics & Governance, Military & Defense, Futuristic & Sci-fi, Real Estate, Education & Learning, Finance & Banking, Business & Management, Marketing & Advertising, Social Media & Communication, Environmental Science, Biotechnology, Automotive & Transportation, Aerospace & Aviation, Robotics, Agriculture & Food Tech, Energy & Utilities, Urban Planning & Smart Cities, E-commerce & Retail, Logistics & Supply Chain, Ethics & Philosophy, Psychology & Human Behavior, Space Exploration, Tourism & Hospitality, Entertainment & Media, Sports & Fitness, Art & Design, History & Anthropology.

Also provide a few real-world examples or scenarios where this term is used. Provide your response in the following format: Domain:....(provide 1-2 out of the above).(copy option)  sub domain:....(provide 2 to 4 not necessarily from the above )(copy option) slide 1:(Tell about the topic in 50 words) (copy option), slide 2:(tell more about the topic in 50 words)(copy option) ...you can increase the no of slides as per your convenience. 

The term / phrase is: 
`;

const prompt2Text = `Hey there, I want you to provide a nice, short(about 60 words) long caption for a post that i am going to be making on instagram, ensure that you add hashtags as well but don't mention my name anywhere and don't put it inside any types of quotes since i will directly copy and past it(if possible then also add the link to the documentation related to it), the post is about:
`;

const createNewSlide = (type: SlideType): Slide => ({
  type,
  text: '',
  fontFamily: 'Times New Roman',
  fontSize: 24,
  bgColor: '#FFFFFF',
  bgImage: null,
  bgFit: 'width',
  fontColor: '#000000',
  bold: false,
  italic: false,
  highlightColor: '#ff0000',
  highlightedWords: [],
  currentImage: 0,
});

interface SlideCardProps {
  slide: Slide;
  index: number;
  onToggleHighlight?: (index: number, word: string) => void;
  onSelect?: (index: number) => void;
  setCardRef?: (index: number, node: HTMLDivElement | null) => void;
}

const SlideCard: React.FC<SlideCardProps> = ({
  slide,
  index,
  onToggleHighlight,
  onSelect,
  setCardRef,
}) => {
  const lines = slide.text.split('\n');

  const style: React.CSSProperties = {
    fontFamily: slide.fontFamily,
    fontSize: `${slide.fontSize}px`,
    backgroundColor: slide.bgColor,
    backgroundImage: slide.bgImage ? `url("${slide.bgImage}")` : 'none',
    backgroundSize: slide.bgImage
      ? slide.bgFit === 'height'
        ? 'auto 100%'
        : '100% auto'
      : 'cover',
    backgroundPosition: 'center center',
    backgroundRepeat: 'no-repeat',
    color: slide.fontColor,
    fontWeight: slide.bold ? 'bold' : 'normal',
    fontStyle: slide.italic ? 'italic' : 'normal',
    width: '625px',
    height: '625px',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    position: 'relative',
  };

  return (
    <div
      ref={(node) => setCardRef?.(index, node)}
      style={style}
      className="rounded shadow-md overflow-hidden"
      onClick={() => onSelect?.(index)}
    >
      {slide.type === 'closing' ? (
        <>
          <div className="absolute inset-0" style={{ backgroundColor: slide.bgColor }}>
            <img
              src={closingImageArray[slide.currentImage]}
              alt="closing"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="absolute bottom-2 w-full px-3 text-center text-gray-400 whitespace-pre-line">
            {slide.text}
          </div>
        </>
      ) : (
        <div className="p-4 whitespace-pre-line">
          {lines.map((line, lineIdx) => (
            <React.Fragment key={lineIdx}>
              {line.split(/(\s+)/).map((word, wordIdx) => {
                const trimmed = word.trim();
                if (!trimmed) return word;
                const isHighlighted = slide.highlightedWords.includes(trimmed);
                return (
                  <span
                    key={wordIdx}
                    onClick={(event) => {
                      event.stopPropagation();
                      onToggleHighlight?.(index, trimmed);
                    }}
                    style={{
                      backgroundColor: isHighlighted ? slide.highlightColor : 'transparent',
                      borderRadius: '4px',
                      padding: '0 2px',
                      cursor: onToggleHighlight ? 'pointer' : 'default',
                    }}
                  >
                    {word}
                  </span>
                );
              })}
              {lineIdx < lines.length - 1 && <br />}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};

export default function Post3() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [copyToast, setCopyToast] = useState<string | null>(null);
  const exportRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isDownloadingRef = useRef(false);

  const selectedSlide = selectedIndex !== null ? slides[selectedIndex] : null;
  const hasClosingSlide = useMemo(
    () => slides.some((slide) => slide.type === 'closing'),
    [slides],
  );

  const updateSlide = <K extends keyof Slide>(index: number, key: K, value: Slide[K]) => {
    setSlides((previousSlides) => {
      const updatedSlides = [...previousSlides];
      updatedSlides[index] = { ...updatedSlides[index], [key]: value };
      return updatedSlides;
    });
  };

  const updateAllSlides = <K extends keyof Slide>(key: K, value: Slide[K]) => {
    setSlides((previousSlides) => previousSlides.map((slide) => ({ ...slide, [key]: value })));
  };

  const addSlide = () => {
    setSlides((previousSlides) => {
      const type: SlideType = previousSlides.length === 0 ? 'thumbnail' : 'slide';
      const updated = [...previousSlides, createNewSlide(type)];
      setSelectedIndex(updated.length - 1);
      return updated;
    });
  };

  const addClosingSlide = () => {
    setSlides((previousSlides) => {
      const updated = [...previousSlides, createNewSlide('closing')];
      setSelectedIndex(updated.length - 1);
      return updated;
    });
  };

  const toggleHighlight = (index: number, word: string) => {
    const slide = slides[index];
    if (!slide) return;
    const updatedWords = slide.highlightedWords.includes(word)
      ? slide.highlightedWords.filter((storedWord) => storedWord !== word)
      : [...slide.highlightedWords, word];
    updateSlide(index, 'highlightedWords', updatedWords);
  };

  const deleteCurrent = () => {
    if (selectedIndex === null) return;
    const updatedSlides = slides.filter((_, index) => index !== selectedIndex);
    setSlides(updatedSlides);
    setSelectedIndex(updatedSlides.length === 0 ? null : Math.max(0, selectedIndex - 1));
  };

  const downloadAllSlides = async () => {
    if (!slides.length || isDownloadingRef.current) return;
    isDownloadingRef.current = true;

    try {
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }

      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));

      for (let index = 0; index < slides.length; index += 1) {
        const node = exportRefs.current[index];
        if (!node) continue;

        const dataUrl = await toPng(node, {
          cacheBust: true,
          pixelRatio: Math.max(2, window.devicePixelRatio * 2),
          skipAutoScale: true,
        });

        const link = document.createElement('a');
        link.download = `post3-slide-${index + 1}.png`;
        link.href = dataUrl;
        link.click();
      }
    } catch (error) {
      console.error('Download failed', error);
      alert('Could not export slides. Please check images/fonts and try again.');
    } finally {
      isDownloadingRef.current = false;
    }
  };

  const showCopyToast = (message: string) => {
    setCopyToast(message);
    window.setTimeout(() => setCopyToast(null), 1500);
  };

  return (
    <div className="p-6 flex flex-col items-center gap-5">
      <h1 className="text-2xl font-bold">Post 3</h1>

      {selectedSlide && selectedIndex !== null && (
        <SlideCard
          slide={selectedSlide}
          index={selectedIndex}
          onSelect={setSelectedIndex}
          onToggleHighlight={toggleHighlight}
        />
      )}

      {selectedSlide?.type === 'closing' && selectedIndex !== null && (
        <div className="flex gap-3">
          <button
            className="px-3 py-2 rounded bg-gray-200"
            onClick={() => {
              const next =
                (selectedSlide.currentImage - 1 + closingImageArray.length) % closingImageArray.length;
              updateSlide(selectedIndex, 'currentImage', next);
            }}
          >
            Previous Logo
          </button>
          <button
            className="px-3 py-2 rounded bg-gray-200"
            onClick={() => {
              const next = (selectedSlide.currentImage + 1) % closingImageArray.length;
              updateSlide(selectedIndex, 'currentImage', next);
            }}
          >
            Next Logo
          </button>
        </div>
      )}

      <div className="flex gap-2 flex-wrap justify-center">
        <button
          className="px-3 py-2 rounded bg-blue-600 text-white"
          onClick={() =>
            setSelectedIndex((previous) => {
              if (!slides.length) return null;
              if (previous === null) return 0;
              return (previous - 1 + slides.length) % slides.length;
            })
          }
          disabled={slides.length <= 1}
        >
          Prev Slide
        </button>

        <button className="px-3 py-2 rounded bg-red-600 text-white" onClick={deleteCurrent}>
          Delete Current
        </button>
        <button
          className="px-3 py-2 rounded bg-red-600 text-white"
          onClick={() => {
            setSlides([]);
            setSelectedIndex(null);
          }}
        >
          Delete All
        </button>

        <button
          className="px-3 py-2 rounded bg-blue-600 text-white"
          onClick={() =>
            setSelectedIndex((previous) => {
              if (!slides.length) return null;
              if (previous === null) return 0;
              return (previous + 1) % slides.length;
            })
          }
          disabled={slides.length <= 1}
        >
          Next Slide
        </button>
      </div>

      <div className="flex gap-2 flex-wrap justify-center">
        <button
          className="px-3 py-2 rounded bg-green-600 text-white"
          onClick={slides.length === 0 || !hasClosingSlide ? addSlide : undefined}
          disabled={hasClosingSlide}
        >
          {slides.length === 0 ? 'Add Thumbnail' : hasClosingSlide ? 'All Slides Added' : 'Add Slide'}
        </button>

        {slides.length > 0 && !hasClosingSlide && (
          <button className="px-3 py-2 rounded bg-purple-600 text-white" onClick={addClosingSlide}>
            Add Closing Slide
          </button>
        )}

        <button
          className="px-3 py-2 rounded bg-black text-white"
          onClick={downloadAllSlides}
          disabled={!slides.length}
        >
          Download All (HQ)
        </button>
      </div>

      <div className="flex gap-2 flex-wrap justify-center w-full max-w-4xl">
        <button
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-red-500 transition"
          onClick={async () => {
            await navigator.clipboard.writeText(prompt1Text);
            showCopyToast('Prompt 1 copied');
          }}
        >
          Copy Prompt 1
        </button>
        <button
          className="px-4 py-2 bg-amber-300 text-white rounded-md hover:bg-cyan-400 transition"
          onClick={async () => {
            await navigator.clipboard.writeText(prompt2Text);
            showCopyToast('Prompt 2 copied');
          }}
        >
          Copy Prompt 2
        </button>
      </div>

      {copyToast && (
        <div className="fixed top-4 right-4 bg-black text-white px-4 py-2 rounded-md shadow-lg z-50">
          {copyToast}
        </div>
      )}

      {selectedSlide && selectedIndex !== null && (
        <div className="w-full max-w-4xl rounded border p-4 space-y-4">
          <textarea
            className="w-full min-h-[120px] border rounded p-3"
            value={selectedSlide.text}
            onChange={(event) => updateSlide(selectedIndex, 'text', event.target.value)}
            placeholder="Type your slide text..."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="text-sm">
              Font Family
              <select
                className="w-full border rounded p-2 mt-1"
                value={selectedSlide.fontFamily}
                onChange={(event) => updateSlide(selectedIndex, 'fontFamily', event.target.value)}
              >
                <option value="Times New Roman">Times New Roman</option>
                <option value="sans-serif">Sans-serif</option>
                <option value="serif">Serif</option>
                <option value="monospace">Monospace</option>
                <option value="Arial">Arial</option>
                <option value="Georgia">Georgia</option>
                <option value="Verdana">Verdana</option>
              </select>
            </label>

            <label className="text-sm">
              Font Size
              <input
                type="number"
                min={12}
                max={72}
                className="w-full border rounded p-2 mt-1"
                value={selectedSlide.fontSize}
                onChange={(event) => updateSlide(selectedIndex, 'fontSize', Number(event.target.value))}
              />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <label className="text-sm">
              Text Color
              <input
                type="color"
                className="block mt-1"
                value={selectedSlide.fontColor}
                onChange={(event) => updateSlide(selectedIndex, 'fontColor', event.target.value)}
              />
            </label>
            <label className="text-sm">
              Highlight Color
              <input
                type="color"
                className="block mt-1"
                value={selectedSlide.highlightColor}
                onChange={(event) => updateSlide(selectedIndex, 'highlightColor', event.target.value)}
              />
            </label>
            <button className="px-3 py-2 rounded border" onClick={() => updateAllSlides('bgColor', '#000000')}>
              All BG Black
            </button>
            <button className="px-3 py-2 rounded border" onClick={() => updateAllSlides('bgColor', '#FFFFFF')}>
              All BG White
            </button>
          </div>

          <div className="flex gap-3 flex-wrap items-center">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedSlide.bold}
                onChange={(event) => updateSlide(selectedIndex, 'bold', event.target.checked)}
              />
              Bold
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedSlide.italic}
                onChange={(event) => updateSlide(selectedIndex, 'italic', event.target.checked)}
              />
              Italic
            </label>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm">Background Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file || selectedIndex === null) return;
                const reader = new FileReader();
                reader.onload = (loadEvent) => {
                  const dataUrl = loadEvent.target?.result as string;
                  updateSlide(selectedIndex, 'bgImage', dataUrl);
                };
                reader.readAsDataURL(file);
              }}
            />

            {selectedSlide.bgImage && (
              <div className="flex gap-2 flex-wrap">
                <button className="px-3 py-1 rounded border" onClick={() => updateSlide(selectedIndex, 'bgFit', 'width')}>
                  Fit Width
                </button>
                <button className="px-3 py-1 rounded border" onClick={() => updateSlide(selectedIndex, 'bgFit', 'height')}>
                  Fit Height
                </button>
                <button className="px-3 py-1 rounded border" onClick={() => updateSlide(selectedIndex, 'bgImage', null)}>
                  Remove Image
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div
        aria-hidden
        style={{
          position: 'fixed',
          left: '-10000px',
          top: 0,
          opacity: 1,
          pointerEvents: 'none',
          zIndex: -1,
        }}
      >
        {slides.map((slide, index) => (
          <div key={`export-${index}`} className="mb-2">
            <SlideCard
              slide={slide}
              index={index}
              setCardRef={(cardIndex, node) => {
                exportRefs.current[cardIndex] = node;
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
