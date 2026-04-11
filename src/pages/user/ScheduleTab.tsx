import { useEffect, useMemo, useState } from "react";
import Calendar, { type CalendarEvent } from "../../components/Calendar";
import { LoadingScreen } from "../../components/LoadingScreen";
import { getMyProgramAccess, type MyProgramAccess } from "../../api/users";

function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Generate weekly milestone events for an enrollment. */
function buildMilestones(enr: MyProgramAccess): CalendarEvent[] {
  const start = enr.startedAt ?? enr.scheduledStartAt;
  if (!start) return [];
  const events: CalendarEvent[] = [];
  const startDate = new Date(start);
  const weeks = enr.durationWeeks || 0;

  // Start date event
  events.push({
    id: `${enr.accessId}-start`,
    date: toDateKey(startDate),
    title: "Program Starts",
    programName: enr.programName,
    expertName: enr.expertName,
    status: enr.status === "Active" ? "active" : "upcoming",
  });

  // Weekly milestones
  for (let w = 1; w <= weeks; w++) {
    const milestoneDate = new Date(startDate.getTime() + w * 7 * 24 * 60 * 60 * 1000);
    const isLast = w === weeks;
    events.push({
      id: `${enr.accessId}-w${w}`,
      date: toDateKey(milestoneDate),
      title: isLast ? "Program Ends" : `Week ${w} Check-in`,
      programName: enr.programName,
      expertName: enr.expertName,
      status: isLast ? "milestone" : "upcoming",
    });
  }

  return events;
}

export default function ScheduleTab() {
  const [enrollments, setEnrollments] = useState<MyProgramAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    getMyProgramAccess()
      .then((data) => {
        const active = data.filter((e) => e.status === "Active" || e.status === "Scheduled" || e.status === "NotStarted");
        setEnrollments(active);
      })
      .catch(() => setError("Failed to load your schedule."))
      .finally(() => setLoading(false));
  }, []);

  const events = useMemo(() => enrollments.flatMap(buildMilestones), [enrollments]);

  const eventsForDay = useMemo(
    () => (selectedDate ? events.filter((e) => e.date === selectedDate) : []),
    [events, selectedDate],
  );

  // Next 5 upcoming events
  const todayStr = toDateKey(new Date());
  const upcoming = useMemo(
    () => events.filter((e) => e.date >= todayStr).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5),
    [events, todayStr],
  );

  if (loading) return <LoadingScreen compact message="Loading your schedule…" />;
  if (error) return <p className="adminPanel__error">{error}</p>;

  return (
    <div className="scheduleTab">
      <h2 className="expertSection__title">My Schedule</h2>

      {enrollments.length === 0 ? (
        <p style={{ color: "var(--muted)", fontSize: 14 }}>
          No active enrollments. Once you enroll in a program, your schedule will appear here.
        </p>
      ) : (
        <div className="scheduleTab__layout">
          <div className="scheduleTab__calendar">
            <Calendar events={events} onDaySelect={setSelectedDate} selectedDate={selectedDate} />
          </div>

          <div className="scheduleTab__sidebar">
            {selectedDate && (
              <div className="scheduleTab__section">
                <h3 className="scheduleTab__sectionTitle">
                  {new Date(selectedDate + "T00:00:00").toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
                </h3>
                {eventsForDay.length === 0 ? (
                  <p className="scheduleTab__empty">No events on this day.</p>
                ) : (
                  <ul className="scheduleTab__list">
                    {eventsForDay.map((ev) => (
                      <li key={ev.id} className={`scheduleTab__event scheduleTab__event--${ev.status}`}>
                        <strong>{ev.title}</strong>
                        <span>{ev.programName}</span>
                        <span className="scheduleTab__expert">with {ev.expertName}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <div className="scheduleTab__section">
              <h3 className="scheduleTab__sectionTitle">Upcoming</h3>
              {upcoming.length === 0 ? (
                <p className="scheduleTab__empty">No upcoming events.</p>
              ) : (
                <ul className="scheduleTab__list">
                  {upcoming.map((ev) => (
                    <li key={ev.id} className={`scheduleTab__event scheduleTab__event--${ev.status}`}>
                      <span className="scheduleTab__eventDate">
                        {new Date(ev.date + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </span>
                      <div>
                        <strong>{ev.title}</strong>
                        <span>{ev.programName}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
