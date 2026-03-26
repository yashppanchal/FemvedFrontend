import { useState, useMemo } from "react";
import "./Calendar.scss";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface CalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  time?: string; // e.g. "10:00 AM"
  programName: string;
  expertName: string;
  status: "upcoming" | "active" | "completed" | "milestone";
}

interface CalendarProps {
  events: CalendarEvent[];
  onDaySelect?: (date: string) => void;
  selectedDate?: string | null;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAY_HEADERS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function toKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function todayKey(): string {
  return toKey(new Date());
}

/** Build the 6-week grid (42 cells) for the given month. */
function buildGrid(year: number, month: number): Date[] {
  const first = new Date(year, month, 1);
  const startDay = first.getDay(); // 0 = Sun
  const cells: Date[] = [];
  // fill previous month padding
  for (let i = startDay - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    cells.push(d);
  }
  // fill current month + next month padding
  while (cells.length < 42) {
    const d = new Date(year, month, cells.length - startDay + 1);
    cells.push(d);
  }
  return cells;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function Calendar({ events, onDaySelect, selectedDate }: CalendarProps) {
  const today = todayKey();
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());

  const grid = useMemo(() => buildGrid(viewYear, viewMonth), [viewYear, viewMonth]);

  /** Set of YYYY-MM-DD strings that have at least one event. */
  const eventDays = useMemo(() => {
    const s = new Set<string>();
    for (const ev of events) s.add(ev.date);
    return s;
  }, [events]);

  const goToPrev = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goToNext = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const goToToday = () => {
    const now = new Date();
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    onDaySelect?.(todayKey());
  };

  return (
    <div className="cal">
      {/* Header */}
      <div className="cal__header">
        <button type="button" className="cal__navBtn" onClick={goToPrev} aria-label="Previous month">
          &lsaquo;
        </button>
        <button type="button" className="cal__todayBtn" onClick={goToToday}>
          Today
        </button>
        <h3 className="cal__title">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </h3>
        <button type="button" className="cal__navBtn" onClick={goToNext} aria-label="Next month">
          &rsaquo;
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="cal__grid cal__grid--header">
        {DAY_HEADERS.map((d) => (
          <div key={d} className="cal__dayHeader">{d}</div>
        ))}
      </div>

      {/* Date cells */}
      <div className="cal__grid">
        {grid.map((date, i) => {
          const key = toKey(date);
          const isCurrentMonth = date.getMonth() === viewMonth;
          const isToday = key === today;
          const isSelected = key === selectedDate;
          const hasEvent = eventDays.has(key);

          let cls = "cal__cell";
          if (!isCurrentMonth) cls += " cal__cell--outside";
          if (isToday) cls += " cal__cell--today";
          if (isSelected) cls += " cal__cell--selected";
          if (hasEvent) cls += " cal__cell--hasEvent";

          return (
            <button
              key={i}
              type="button"
              className={cls}
              onClick={() => onDaySelect?.(key)}
              aria-label={date.toDateString()}
            >
              <span className="cal__cellDate">{date.getDate()}</span>
              {hasEvent && <span className="cal__dot" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
