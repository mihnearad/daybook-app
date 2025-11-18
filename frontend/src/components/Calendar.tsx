import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import './Calendar.css';

interface CalendarProps {
  onDateSelect: (date: Date) => void;
  selectedDate: Date;
  noteDates: Set<string>;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function Calendar({ onDateSelect, selectedDate, noteDates }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      // Use date-fns format to avoid timezone issues with toISOString()
      const dateStr = format(date, 'yyyy-MM-dd');
      const isSelected =
        selectedDate.getFullYear() === date.getFullYear() &&
        selectedDate.getMonth() === date.getMonth() &&
        selectedDate.getDate() === date.getDate();
      const hasNote = noteDates.has(dateStr);
      const isToday =
        new Date().getFullYear() === date.getFullYear() &&
        new Date().getMonth() === date.getMonth() &&
        new Date().getDate() === date.getDate();

      days.push(
        <button
          key={day}
          className={`calendar-day ${isSelected ? 'selected' : ''} ${hasNote ? 'has-note' : ''} ${isToday ? 'today' : ''}`}
          onClick={() => onDateSelect(date)}
        >
          <span className="day-number">{day}</span>
          {hasNote && <span className="note-indicator"></span>}
        </button>
      );
    }

    return days;
  }, [currentMonth, selectedDate, noteDates]);

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button onClick={previousMonth} className="calendar-nav" aria-label="Previous month">
        </button>
        <h3 className="calendar-title">
          {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <button onClick={nextMonth} className="calendar-nav" aria-label="Next month">
        </button>
      </div>

      <div className="calendar-weekdays">
        {DAYS.map(day => (
          <div key={day} className="calendar-weekday">{day}</div>
        ))}
      </div>

      <div className="calendar-grid">
        {calendarDays}
      </div>
    </div>
  );
}
