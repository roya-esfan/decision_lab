"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { courseDays, timetableUrl, type CourseDay } from "@/content/course";
import styles from "../course.module.css";

type ActiveDay = {
  day: CourseDay;
  state: "today" | "next" | "previous";
};

function localDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function findActiveDay(date: Date): ActiveDay {
  const dateKey = localDateKey(date);
  const exact = courseDays.find((day) => day.dateISO === dateKey);
  if (exact) return { day: exact, state: "today" };

  const next = courseDays.find((day) => day.dateISO > dateKey);
  if (next) return { day: next, state: "next" };

  return { day: courseDays[courseDays.length - 1], state: "previous" };
}

export function CourseHome() {
  const [active, setActive] = useState<ActiveDay>({
    day: courseDays[0],
    state: "next",
  });

  useEffect(() => {
    const timer = window.setTimeout(() => setActive(findActiveDay(new Date())), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const activeLabel =
    active.state === "today"
      ? "Teaching today"
      : active.state === "next"
        ? "Next teaching day"
        : "Most recent teaching day";

  return (
    <>
      <section className={styles.today} aria-labelledby="today-title">
        <div className={styles.sectionIndex}>Today</div>
        <div>
          <p className={styles.eyebrow}>{activeLabel}</p>
          <h2 id="today-title">Day {String(active.day.number).padStart(2, "0")}</h2>
          <p>{active.day.date} · {active.day.time}</p>
        </div>
        <div className={styles.todayAction}>
          <span>{active.day.room}</span>
          <Link className={styles.primaryLink} href={`/day/${active.day.number}`}>
            Open today&apos;s page
          </Link>
        </div>
      </section>

      <section className={styles.schedule} aria-labelledby="schedule-title">
        <div className={styles.sectionTitle}>
          <h2 id="schedule-title">Teaching schedule</h2>
          <a href={timetableUrl} target="_blank" rel="noreferrer">Live room information ↗</a>
        </div>
        <div className={styles.scheduleTable} role="table" aria-label="Teaching dates, times and rooms">
          <div className={styles.scheduleHead} role="row">
            <span role="columnheader">Date</span>
            <span role="columnheader">Time</span>
            <span role="columnheader">Room</span>
          </div>
          {courseDays.map((day) => (
            <div className={styles.scheduleRow} role="row" key={day.number}>
              <span role="cell">{day.date}</span>
              <span role="cell">{day.time}</span>
              <a role="cell" href={timetableUrl} target="_blank" rel="noreferrer">{day.room} ↗</a>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.courseMap} aria-labelledby="course-map-title">
        <div className={styles.sectionTitle}>
          <h2 id="course-map-title">Course overview</h2>
          <p>Eight teaching days</p>
        </div>
        <ol className={styles.overviewList}>
          {courseDays.map((day) => {
            const isActive = day.number === active.day.number;
            return (
              <li className={isActive ? styles.activeDay : undefined} key={day.number}>
                <span className={styles.dayNumber}>{String(day.number).padStart(2, "0")}</span>
                <div className={styles.dayMeta}>
                  <strong>{day.date}</strong>
                  <span>{day.time} · {day.room}</span>
                </div>
                <p>{day.topics.join(" · ")}</p>
                <Link href={`/day/${day.number}`} aria-current={isActive ? "date" : undefined}>
                  Open day
                </Link>
              </li>
            );
          })}
        </ol>
      </section>
    </>
  );
}
