import React, { useRef, useCallback, useEffect, useState } from 'react';
import { Eye } from 'lucide-react';

interface SplitSliderProps {
  splitRatio: number;
  setSplitRatio: (ratio: number) => void;
  containerId: string;
}

export const SplitSlider: React.FC<SplitSliderProps> = ({
  splitRatio,
  setSplitRatio,
  containerId,
}) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleMove = useCallback(
    (clientX: number) => {
      const container = document.getElementById(containerId);
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const x = clientX - rect.left;
      const ratio = Math.max(0.01, Math.min(0.99, x / rect.width));
      setSplitRatio(ratio);
    },
    [containerId, setSplitRatio]
  );

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleTouchStart = () => {
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      handleMove(e.clientX);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX);
      }
    };

    if (isDragging) {
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('touchend', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
    }

    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isDragging, handleMove]);

  return (
    <div
      ref={sliderRef}
      style={{ left: `${splitRatio * 100}%` }}
      className="absolute top-0 bottom-0 w-1 -ml-0.5 bg-sky-500 z-10 cursor-col-resize flex items-center justify-center group"
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* Visual handle pill */}
      <div className="absolute w-8 h-12 bg-slate-900 border-2 border-sky-500 rounded-full flex flex-col items-center justify-center shadow-lg transition-transform group-hover:scale-110 active:scale-95 text-sky-400">
        <Eye className="w-4 h-4" />
        <div className="flex gap-0.5 mt-0.5">
          <span className="w-0.5 h-1.5 bg-sky-400/50 rounded-full" />
          <span className="w-0.5 h-1.5 bg-sky-400/50 rounded-full" />
        </div>
      </div>

      {/* "Before" label overlay */}
      <div className="absolute right-6 top-4 bg-slate-900/80 backdrop-blur px-2.5 py-1 rounded text-[10px] font-mono tracking-widest text-slate-400 border border-slate-700 pointer-events-none uppercase">
        Original Presets
      </div>

      {/* "After" label overlay */}
      <div className="absolute left-6 top-4 bg-slate-900/80 backdrop-blur px-2.5 py-1 rounded text-[10px] font-mono tracking-widest text-sky-400 border border-slate-700 pointer-events-none uppercase">
        Active Design
      </div>
    </div>
  );
};
