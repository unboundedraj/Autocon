import React from "react";

interface SlideNavProps {
  current: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  onAdd: () => void;
}

const SlideNav: React.FC<SlideNavProps> = ({ current, total, onPrev, onNext, onAdd }) => (
  <div className="flex items-center justify-center gap-4 my-4">
    <button
      className="px-3 py-1 border border-black rounded bg-white text-black font-semibold disabled:opacity-50"
      onClick={onPrev}
      disabled={current === 0}
    >
      Previous
    </button>
    <span className="font-mono">Slide {current + 1} / {total}</span>
    <button
      className="px-3 py-1 border border-black rounded bg-white text-black font-semibold disabled:opacity-50"
      onClick={onNext}
      disabled={current === total - 1}
    >
      Next
    </button>
    <button
      className="px-3 py-1 border border-black rounded bg-black text-white font-semibold"
      onClick={onAdd}
    >
      + Add Slide
    </button>
  </div>
);

export default SlideNav;
