import React, { useState, useEffect, useRef } from "react";

type ColorItem = { name: string; hex: string };

type Props = {
  label?: string;
  optionalHint?: string;
  palette?: string[];
  selected?: ColorItem[];
  onAddColor?: (color: ColorItem) => void;
  onChangeColors?: (colors: ColorItem[]) => void;
  className?: string;
  fieldWidthClass?: string;
};

const SelectColorField: React.FC<Props> = ({
  label = "Select Color",
  optionalHint = "(Optional)",
  palette,
  selected = [],
  onAddColor,
  onChangeColors,
  className,
  fieldWidthClass = "w-1/2",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [customHex, setCustomHex] = useState("#000000");
  const [selectedColors, setSelectedColors] = useState<ColorItem[]>(selected || []); // ✅ single source of truth
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleAddHex = (hex: string) => {
    if (editingIndex === null) return;
    const newColors = [...selectedColors];
    newColors[editingIndex] = { name: hex, hex };

    setSelectedColors(newColors); // ✅ update state
    onChangeColors?.(newColors);  // notify parent
    onAddColor?.(newColors[editingIndex]); // backward compatibility

    setEditingIndex(null);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setEditingIndex(null);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const DEFAULT_PALETTE = [
    "#000000", "#FFFFFF", "#FF3B30", "#FF9500", "#FFCC00",
    "#34C759", "#5AC8FA", "#007AFF", "#5856D6", "#AF52DE",
    "#FF2D55", "#8E8E93", "#C7C7CC", "#E5E5EA", "#F2F2F7",
    "#C0392B", "#27AE60", "#2980B9", "#8E44AD", "#D35400",
  ];
  const swatches = palette?.length ? palette : DEFAULT_PALETTE;

  return (
    <div className={className}>
      {/* Mobile responsive: smaller label per Figma */}
      <label className="block text-[17px] md:text-[35px] font-semibold text-black mb-2">
        {label}
        {optionalHint && (
          <span className="text-[#B8B8B8] text-[12px] md:text-[20px] ml-2">{optionalHint}</span>
        )}
      </label>

      {/* Mobile responsive: field width controlled by parent via fieldWidthClass; reduce minHeight */}
      <div
        className={`${fieldWidthClass} rounded-[10px] border mt-3 md:mt-6 border-[#E2E0E0] bg-white shadow px-3 md:px-4 py-2 md:py-3 flex items-center`}
        style={{ minHeight: 38 }}
      >
        <div className="flex items-center gap-3">
          {Array.from({ length: 3 }).map((_, i) => {
            const sel = selectedColors[i];
            return (
              <button
                key={`${i}-${sel?.hex || "empty"}`}
                type="button"
                className="relative w-[25px] h-[25px] md:w-[38px] md:h-[38px] flex items-center justify-center"
                onClick={() => {
                  setEditingIndex(i);
                  setIsOpen(true);
                }}
              >
                <span className="absolute w-[25px] h-[25px] md:w-[38px] md:h-[38px] rounded-full border border-[#CECECE] bg-white" />
                <span
                  className="absolute w-[18px] h-[18px] md:w-[28px] md:h-[28px] rounded-full border border-[#CECECE]"
                  style={{ backgroundColor: sel ? sel.hex : "#fff" }}
                />
                {!sel && (
                  <span
                    className="absolute left-1/2 top-1/2 text-[#2ECC71] text-[16px] md:text-[25px] font-medium"
                    style={{ transform: "translate(-50%, -50%)", lineHeight: 0 }}
                  >
                    +
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div className="flex items-center ml-auto text-black/30">
          <svg width="24" height="24" viewBox="0 0 28 28" fill="none" className="flex-shrink-0 md:w-[35px] md:h-[35px]">
            <path d="M7 11L14 18L21 11" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {isOpen && (
        <div ref={dropdownRef} className="absolute left-0 top-full mt-2 md:mt-3 w-[300px] md:w-[444px] rounded-[20px] bg-white border border-[#E2E0E0] shadow z-20">
          <div className="px-5 py-3 border-b text-[20px] font-semibold">
            Select Color
          </div>

          {/* swatches */}
          <div className="px-5 py-4 grid grid-cols-6 gap-2 md:gap-3">
            {swatches.map((hex) => (
              <button
                key={hex}
                type="button"
                onClick={() => handleAddHex(hex)}
                className="relative w-[25px] h-[25px] md:w-[38px] md:h-[38px] flex items-center justify-center hover:scale-105 transition-transform"
              >
                <span className="absolute w-[25px] h-[25px] md:w-[38px] md:h-[38px] rounded-full border border-[#CECECE] bg-white" />
                <span
                  className="absolute w-[18px] h-[18px] md:w-[28px] md:h-[28px] rounded-full border"
                  style={{ backgroundColor: hex, borderColor: "#CECECE" }}
                />
              </button>
            ))}
          </div>

          {/* custom input */}
          <div className="px-5 pb-4 flex items-center gap-2 md:gap-3">
            <input
              type="color"
              value={customHex}
              onChange={(e) => setCustomHex(e.target.value)}
              className="w-8 h-8 md:w-10 md:h-10 border border-[#CECECE] rounded"
            />
            <input
              type="text"
              value={customHex}
              onChange={(e) => setCustomHex(e.target.value)}
              className="flex-1 h-8 md:h-10 px-2 md:px-3 rounded border border-[#E2E0E0] text-xs md:text-sm"
              placeholder="#000000"
            />
            <button
              type="button"
              onClick={() => handleAddHex(customHex)}
              className="px-2 md:px-3 h-8 md:h-10 rounded-[8px] border border-[#E2E0E0] text-xs md:text-sm font-medium hover:bg-gray-50"
            >
              {editingIndex !== null ? "Update" : "Add"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectColorField;

