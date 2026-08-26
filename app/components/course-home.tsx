"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { courseDays, type CourseDay } from "@/content/course";
import styles from "../course.module.css";

function localDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function findActiveDay(date: Date): CourseDay {
  const dateKey = localDateKey(date);
  const exact = courseDays.find((day) => day.dateISO === dateKey);
  if (exact) return exact;

  const next = courseDays.find((day) => day.dateISO > dateKey);
  if (next) return next;

  return courseDays[courseDays.length - 1];
}

export function CourseHome() {
  const [activeDay, setActiveDay] = useState<CourseDay>(courseDays[0]);

  useEffect(() => {
    const timer = window.setTimeout(() => setActiveDay(findActiveDay(new Date())), 0);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <>
      <section className={styles.today} aria-labelledby="today-title">
        <div className={styles.sectionIndex}>Today</div>
        <div>
          <h2 id="today-title">Day {String(activeDay.number).padStart(2, "0")}</h2>
          <p>{activeDay.date} · {activeDay.time}</p>
        </div>
        <div className={styles.todayAction}>
          <Link className={styles.primaryLink} href={`/day/${activeDay.number}`}>
            Open today&apos;s page
          </Link>
        </div>
      </section>

      <section className={styles.courseMap} aria-labelledby="course-map-title">
        <div className={styles.sectionTitle}>
          <h2 id="course-map-title">Course overview</h2>
          <p>Eight teaching days</p>
        </div>
        <ol className={styles.overviewList}>
          {courseDays.map((day) => {
            const isActive = day.number === activeDay.number;
            return (
              <li className={isActive ? styles.activeDay : undefined} key={day.number}>
                <span className={styles.dayNumber}>{String(day.number).padStart(2, "0")}</span>
                <div className={styles.dayMeta}>
                  <strong>{day.date}</strong>
                  <span>{day.time}</span>
                </div>
                <p>{day.topics.join(" · ")}</p>
                <Link className={styles.overviewButton} href={`/day/${day.number}`} aria-current={isActive ? "date" : undefined}>
                  Open day
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      <section className={styles.feedback} aria-labelledby="feedback-title">
        <div>
          <p className={styles.eyebrow}>Anonymous feedback</p>
          <h2 id="feedback-title">Constructive feedback is always appreciated.</h2>
        </div>
        <a className={styles.primaryLink} href="https://www.menti.com/al67du6pv352" target="_blank" rel="noreferrer">
          Give feedback ↗
        </a>
      </section>
    </>
  );
}
