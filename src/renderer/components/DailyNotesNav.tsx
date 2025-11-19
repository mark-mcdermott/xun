import React, { useState, useEffect } from 'react';

interface DailyNotesNavProps {
  onDateSelect: (date: string) => void;
  currentDate?: string | null;
  existingDates?: string[];
}

export const DailyNotesNav: React.FC<DailyNotesNavProps> = ({
  onDateSelect,
  currentDate,
  existingDates = []
}) => {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const parseDate = (dateStr: string): Date => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const getToday = (): string => {
    return formatDate(new Date());
  };

  const getRelativeDate = (offset: number): string => {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return formatDate(date);
  };

  const goToToday = () => {
    onDateSelect(getToday());
  };

  const goToYesterday = () => {
    onDateSelect(getRelativeDate(-1));
  };

  const goToTomorrow = () => {
    onDateSelect(getRelativeDate(1));
  };

  const previousMonth = () => {
    setSelectedMonth(
      new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setSelectedMonth(
      new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1)
    );
  };

  const getDaysInMonth = (date: Date): Date[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];

    // Add padding days from previous month
    const firstDayOfWeek = firstDay.getDay();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = new Date(year, month, -i);
      days.push(day);
    }

    // Add days of current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    // Add padding days from next month
    const lastDayOfWeek = lastDay.getDay();
    for (let i = 1; i < 7 - lastDayOfWeek; i++) {
      days.push(new Date(year, month + 1, i));
    }

    return days;
  };

  const days = getDaysInMonth(selectedMonth);
  const today = getToday();
  const monthName = selectedMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  const hasNote = (date: Date): boolean => {
    return existingDates.includes(formatDate(date));
  };

  const isCurrentMonth = (date: Date): boolean => {
    return date.getMonth() === selectedMonth.getMonth();
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Quick actions */}
      <div className="p-3 border-b border-gray-200">
        <div className="space-y-2">
          <button
            onClick={goToToday}
            className="w-full px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
          >
            Today
          </button>
          <div className="flex gap-2">
            <button
              onClick={goToYesterday}
              className="flex-1 px-3 py-1.5 text-xs text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            >
              Yesterday
            </button>
            <button
              onClick={goToTomorrow}
              className="flex-1 px-3 py-1.5 text-xs text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            >
              Tomorrow
            </button>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="flex-1 overflow-auto p-3">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={previousMonth}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            ←
          </button>
          <span className="text-sm font-medium text-gray-700">{monthName}</span>
          <button
            onClick={nextMonth}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            →
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <div
              key={i}
              className="text-center text-xs font-medium text-gray-500"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((date, i) => {
            const dateStr = formatDate(date);
            const isToday = dateStr === today;
            const isSelected = dateStr === currentDate;
            const inCurrentMonth = isCurrentMonth(date);
            const noteExists = hasNote(date);

            return (
              <button
                key={i}
                onClick={() => onDateSelect(dateStr)}
                className={`
                  aspect-square p-1 text-xs rounded transition-colors relative
                  ${!inCurrentMonth ? 'text-gray-300' : 'text-gray-700'}
                  ${isToday ? 'font-bold ring-2 ring-blue-500' : ''}
                  ${isSelected ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}
                `}
              >
                {date.getDate()}
                {noteExists && inCurrentMonth && (
                  <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
