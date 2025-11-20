import React from "react";

interface ColorPaletteProps {
  colors: string[];
  selected: string;
  onSelect: (color: string) => void;
}

const ColorPalette: React.FC<ColorPaletteProps> = ({ colors, selected, onSelect }) => (
  <div className="flex gap-2 justify-center my-2">
    {colors.map((color) => (
      <button
        key={color}
        className={`w-6 h-6 rounded-full border-2 ${selected === color ? 'border-black' : 'border-gray-300'}`}
        style={{ background: color }}
        onClick={() => onSelect(color)}
        aria-label={color}
      />
    ))}
  </div>
);

export default ColorPalette;
