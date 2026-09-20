import React, { useState, useRef, useEffect } from 'react';
import { Pill, Sparkles, Check, ChevronRight } from 'lucide-react';
import { searchEgyptianMedications, EgyptianMedication } from '../../data/egyptianMedications';

interface EgyptianMedicationInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelectMedication: (med: EgyptianMedication) => void;
  placeholder?: string;
  className?: string;
}

export const EgyptianMedicationInput: React.FC<EgyptianMedicationInputProps> = ({
  value,
  onChange,
  onSelectMedication,
  placeholder = 'اسم الدواء (مثل: أوجمنتين، بنادول، كونكور...)',
  className = ''
}) => {
  const [suggestions, setSuggestions] = useState<EgyptianMedication[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value && value.trim().length >= 1) {
      const results = searchEgyptianMedications(value, 6);
      setSuggestions(results);
      setIsOpen(results.length > 0);
      setHighlightedIndex(-1);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (med: EgyptianMedication) => {
    onChange(med.name);
    onSelectMedication(med);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        e.preventDefault();
        handleSelect(suggestions[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <input
          type="text"
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => {
            if (value && value.trim().length >= 1) {
              const results = searchEgyptianMedications(value, 6);
              setSuggestions(results);
              setIsOpen(results.length > 0);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all ${className}`}
        />
        {value && (
          <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-teal-600 dark:text-teal-400 pointer-events-none">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          </div>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 left-0 right-0 top-full mt-1.5 bg-white dark:bg-slate-900 border border-teal-500/30 rounded-2xl shadow-xl overflow-hidden animate-slide-up text-start max-h-64 overflow-y-auto">
          <div className="px-3 py-1.5 bg-teal-50 dark:bg-teal-950/40 border-b border-teal-100 dark:border-teal-900/60 flex items-center justify-between text-[10px] font-bold text-teal-800 dark:text-teal-300">
            <span className="flex items-center gap-1">
              <Pill className="w-3 h-3 text-teal-600" />
              <span>اقتراحات الأدوية المصرية الذكية:</span>
            </span>
            <span className="text-[9px] font-normal text-slate-400">اختر للتعبئة التلقائية للجرعة والتركيز</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {suggestions.map((med, index) => {
              const isHighlighted = index === highlightedIndex;
              return (
                <button
                  key={med.id}
                  type="button"
                  onClick={() => handleSelect(med)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`w-full p-2.5 flex items-center justify-between gap-2 text-start transition-colors cursor-pointer ${
                    isHighlighted
                      ? 'bg-teal-50/80 dark:bg-teal-950/60 text-teal-950 dark:text-white'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-100'
                  }`}
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">{med.name}</span>
                      <span className="text-xs font-semibold text-teal-700 dark:text-teal-400">({med.nameAr})</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                        {med.categoryAr}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {med.generic} • <span className="text-teal-600 dark:text-teal-400 font-semibold">{med.defaultDosage}</span>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-1 text-[10px] font-bold text-teal-600 bg-teal-50 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-800/60 px-2 py-1 rounded-lg">
                    <span>اختيار</span>
                    <ChevronRight className="w-3 h-3 rtl:rotate-180" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
