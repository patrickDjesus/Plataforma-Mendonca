import React from 'react';
import { Layers } from 'lucide-react';

interface XRaySliderProps {
  value: number; // 0 to 1
  onChange: (val: number) => void;
}

export const XRaySlider: React.FC<XRaySliderProps> = ({ value, onChange }) => {
  return (
    <div className="flex flex-col gap-2 p-3.5 bg-white rounded-2xl border-2 border-[#E7E2D9] shadow-sm dark:bg-[#18181B] dark:border-[#2C2C30]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-black text-[#1C1917] uppercase tracking-wider dark:text-[#FAF9F5]">
          <Layers className="w-4 h-4 text-[#2D5A46] dark:text-[#52B788]" />
          <span>Visão Raio-X Anatômica</span>
        </div>
        <span className="text-xs font-extrabold text-[#2D5A46] bg-[#EBF3EF] border border-[#CFE1D6] px-2 py-0.5 rounded-full dark:text-[#52B788] dark:bg-[#15221B]/50 dark:border-[#22392D]">
          {Math.round(value * 100)}%
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs font-bold text-[#A8A29E] dark:text-[#78716C]">👕 Pele</span>
        <input
          id="xray-range-input"
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={value}
          onChange={(e) => {
            onChange(parseFloat(e.target.value));
          }}
          className="flex-1 accent-[#2D5A46] h-2 bg-[#E5DFD5] rounded-lg cursor-pointer transition-all dark:bg-[#3B3B40]"
        />
        <span className="text-xs font-bold text-[#A8A29E] dark:text-[#78716C]">🦴 Órgãos & Ossos</span>
      </div>
    </div>
  );
};
