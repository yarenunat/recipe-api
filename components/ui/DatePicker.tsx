import * as React from "react"
import { useState, useEffect, useRef } from "react"
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface DatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  className?: string;
}

const MONTHS_TR = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
];

const WEEKDAYS_TR = ["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pz"];

export function DatePicker({ value, onChange, className }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Today's local date details
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0-indexed
  const todayDay = today.getDate();

  // Selected date details
  const getSelectedDateDetails = () => {
    if (!value) return null;
    const parts = value.split('-');
    if (parts.length !== 3) return null;
    return {
      year: parseInt(parts[0]),
      month: parseInt(parts[1]) - 1,
      day: parseInt(parts[2])
    };
  };

  const selectedDetails = getSelectedDateDetails();

  // Close calendar popover on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Format date for displaying on the button in Turkish
  const getDisplayDate = () => {
    if (!value) return "Tarih Seçin";
    const details = selectedDetails;
    if (!details) return value;
    return `${details.day} ${MONTHS_TR[details.month]} ${details.year}`;
  };

  // Generate calendar grid for the current month
  const getDaysGrid = () => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    // getDay() is 0 for Sunday, 1 for Monday...
    const startingDayOfWeek = firstDayOfMonth.getDay();
    // Shift so week starts on Monday (0: Pt, 1: Sa, ..., 6: Pz)
    const startOffset = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;

    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();

    const cells: { day: number | null; isSelectable: boolean; isSelected: boolean; isToday: boolean }[] = [];

    // Empty cells for alignment before the 1st of the month
    for (let i = 0; i < startOffset; i++) {
      cells.push({ day: null, isSelectable: false, isSelected: false, isToday: false });
    }

    // Days of the month
    for (let day = 1; day <= totalDays; day++) {
      const isFuture = day > todayDay;
      const isSelected = selectedDetails !== null && 
        selectedDetails.year === currentYear && 
        selectedDetails.month === currentMonth && 
        selectedDetails.day === day;
      const isToday = day === todayDay;

      cells.push({
        day,
        isSelectable: !isFuture,
        isSelected,
        isToday
      });
    }

    return cells;
  };

  const handleSelectDay = (day: number) => {
    const mm = String(currentMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const dateStr = `${currentYear}-${mm}-${dd}`;
    onChange(dateStr);
    setIsOpen(false);
  };

  const dayCells = getDaysGrid();

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 flex items-center justify-between font-bold text-slate-700 text-sm hover:bg-slate-100 transition-colors shadow-sm select-none cursor-pointer outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
      >
        <div className="flex items-center gap-3">
          <CalendarIcon size={18} className="text-[var(--primary)]" />
          <span>{getDisplayDate()}</span>
        </div>
        <ChevronDown size={16} className={cn("text-slate-400 transition-transform duration-300", isOpen && "rotate-180")} />
      </button>

      {/* Calendar Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-100 rounded-3xl shadow-xl p-5 z-40 animate-[fadeIn_0.2s_ease-out]">
          {/* Calendar Header */}
          <div className="text-center font-black text-slate-700 text-sm mb-4 tracking-tight">
            {MONTHS_TR[currentMonth]} {currentYear}
          </div>

          {/* Weekday Names */}
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2">
            {WEEKDAYS_TR.map((wd) => (
              <div key={wd}>{wd}</div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {dayCells.map((cell, idx) => {
              if (cell.day === null) {
                return <div key={`empty-${idx}`} />;
              }

              return (
                <button
                  type="button"
                  key={`day-${cell.day}`}
                  disabled={!cell.isSelectable}
                  onClick={() => handleSelectDay(cell.day!)}
                  className={cn(
                    "h-9 w-9 rounded-xl flex items-center justify-center font-bold text-xs transition-all relative",
                    cell.isSelectable
                      ? "text-slate-700 hover:bg-[var(--primary)]/10 cursor-pointer"
                      : "text-slate-300 cursor-not-allowed",
                    cell.isSelected && "bg-[var(--primary)] text-white shadow-md shadow-[var(--primary)]/20 hover:bg-[var(--primary)]",
                    cell.isToday && !cell.isSelected && "border border-[var(--primary)] text-[var(--primary)]"
                  )}
                >
                  {cell.day}
                  {cell.isToday && (
                    <span
                      className={cn(
                        "absolute bottom-1 w-1 h-1 rounded-full",
                        cell.isSelected ? "bg-white" : "bg-[var(--primary)]"
                      )}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
