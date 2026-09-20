import React, { useState, useRef, useEffect } from 'react';
import { Pill, Sparkles, Check, ChevronRight, Loader2, Search } from 'lucide-react';
import { searchEgyptianMedications, EgyptianMedication } from '../../data/egyptianMedications';
import { AiSafetyService } from '../../services/aiSafetyService';

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
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResults, setAiResults] = useState<EgyptianMedication[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value && value.trim().length >= 1) {
      const results = searchEgyptianMedications(value, 12);
      setSuggestions(results);
      setIsOpen(true);
      setHighlightedIndex(-1);

      // If search query is 2+ chars and results are fewer than 3, auto-trigger live AI lookup with debounce
      const timer = setTimeout(() => {
        if (value.trim().length >= 2 && results.length < 5) {
          handleLiveAiSearch();
        }
      }, 500);

      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
      setAiResults([]);
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

  const handleLiveAiSearch = async () => {
    if (!value || value.trim().length < 2 || aiLoading) return;
    setAiLoading(true);
    try {
      const liveData = await AiSafetyService.lookupMedicationDetails(value.trim());
      if (liveData && liveData.length > 0) {
        const formatted: EgyptianMedication[] = liveData.map((d: any, idx: number) => ({
          id: d.id || `ai_med_${Date.now()}_${idx}`,
          name: d.name || value,
          nameAr: d.nameAr || d.name || '',
          generic: d.generic || '',
          category: d.category || 'general',
          categoryAr: d.categoryAr || 'دواء متداول',
          defaultDosage: d.defaultDosage || 'قرص واحد',
          dosages: [d.defaultDosage || 'قرص واحد'],
          defaultFrequency: d.defaultFrequency || 'مرتين يومياً',
          defaultTiming: (d.defaultTiming || 'after_meal') as any
        }));
        setAiResults(formatted);
      }
    } catch (err) {
      console.warn('[AI Live Search Error]', err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSelect = (med: EgyptianMedication) => {
    onChange(med.name);
    onSelectMedication(med);
    setIsOpen(false);
  };

  const allItems = [...suggestions, ...aiResults];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || allItems.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < allItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : allItems.length - 1));
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && highlightedIndex < allItems.length) {
        e.preventDefault();
        handleSelect(allItems[highlightedIndex]);
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
              const results = searchEgyptianMedications(value, 12);
              setSuggestions(results);
              setIsOpen(true);
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

      {isOpen && (suggestions.length > 0 || aiResults.length > 0 || value.trim().length >= 2) && (
        <div className="absolute z-50 left-0 right-0 top-full mt-1.5 bg-white dark:bg-slate-900 border border-teal-500/30 rounded-2xl shadow-xl overflow-hidden animate-slide-up text-start max-h-72 overflow-y-auto">
          <div className="px-3 py-1.5 bg-teal-50 dark:bg-teal-950/40 border-b border-teal-100 dark:border-teal-900/60 flex items-center justify-between text-[10px] font-bold text-teal-800 dark:text-teal-300">
            <span className="flex items-center gap-1">
              <Pill className="w-3 h-3 text-teal-600" />
              <span>دليل الأدوية المصرية:</span>
            </span>
            <span className="text-[9px] font-normal text-slate-400">اختر للتعبئة التلقائية للجرعة والتوقيت</span>
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

            {aiResults.map((med, index) => {
              const actualIdx = suggestions.length + index;
              const isHighlighted = actualIdx === highlightedIndex;
              return (
                <button
                  key={med.id}
                  type="button"
                  onClick={() => handleSelect(med)}
                  onMouseEnter={() => setHighlightedIndex(actualIdx)}
                  className={`w-full p-2.5 flex items-center justify-between gap-2 text-start transition-colors cursor-pointer bg-teal-500/5 ${
                    isHighlighted
                      ? 'bg-teal-100/60 dark:bg-teal-900/60 text-teal-950 dark:text-white'
                      : 'hover:bg-teal-50/50 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-100'
                  }`}
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">{med.name}</span>
                      <span className="text-xs font-semibold text-teal-700 dark:text-teal-400">({med.nameAr})</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-teal-600/15 text-teal-700 dark:text-teal-300 font-bold">
                        اقتراح ذكي
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

          {/* AI Search Action */}
          <div className="p-2 bg-slate-50 dark:bg-slate-850 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
            <span className="text-[10px] text-slate-400">
              {suggestions.length === 0 ? 'لم يتم العثور على الدواء بالقائمة المباشرة' : 'هل تبحث عن صنف آخر؟'}
            </span>
            <button
              type="button"
              onClick={handleLiveAiSearch}
              disabled={aiLoading}
              className="px-2.5 py-1 rounded-lg bg-teal-600/10 hover:bg-teal-600/20 text-teal-700 dark:text-teal-300 font-bold text-[10px] border border-teal-600/20 flex items-center gap-1 transition-all cursor-pointer"
            >
              {aiLoading ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>جارٍ البحث في قاعدة الأدوية...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3 text-teal-500" />
                  <span>بحث متقدم بالذكاء الاصطناعي</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
