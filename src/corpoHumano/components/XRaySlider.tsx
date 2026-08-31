import React from 'react';
import { Layers } from 'lucide-react';

interface XRaySliderProps {
  value: number; // 0 to 1
  onChange: (val: number) => void;
}

export const XRaySlider: React.FC<XRaySliderProps> = ({ value, onChange }) => {
  return (
    <div className="flex flex-col gap-2 p-3.5 bg-white rounded-2xl border-2 border-blue-100 shadow-sm dark:bg-slate-900 dark:border-slate-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-black text-slate-800 uppercase tracking-wider dark:text-slate-100">
          <Layers className="w-4 h-4 text-blue-600 dark:text-sky-400" />
          <span>Visão Raio-X Anatômica</span>
        </div>
        <span className="text-xs font-extrabold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full dark:text-sky-300 dark:bg-sky-950/50 dark:border-sky-900/50">
          {Math.round(value * 100)}%
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs font-bold text-slate-400 dark:text-slate-500">👕 Pele</span>
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
          className="flex-1 accent-blue-600 h-2 bg-blue-100 rounded-lg cursor-pointer transition-all dark:bg-slate-700"
        />
        <span className="text-xs font-bold text-slate-400 dark:text-slate-500">🦴 Órgãos & Ossos</span>
      </div>
    </div>
  );
};
