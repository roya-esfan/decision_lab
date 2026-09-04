"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { courseDays, type CourseDay } from "@/content/course";
import styles from "../home.module.css";

function localDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

type FeaturedDay = {
  day: CourseDay;
  label: "Today" | "Upcoming class" | "Most recent class";
};

function findFeaturedDay(date: Date): FeaturedDay {
  const dateKey = localDateKey(date);
  const exact = courseDays.find((day) => day.dateISO === dateKey);
  if (exact) return { day: exact, label: "Today" };

  const next = courseDays.find((day) => day.dateISO > dateKey);
  if (next) return { day: next, label: "Upcoming class" };

  return { day: courseDays[courseDays.length - 1], label: "Most recent class" };
}

function dateParts(day: CourseDay) {
  const [, datedPart = day.date] = day.date.split(", ");
  const [dateNumber, month] = datedPart.split(" ");
  return { dateNumber, month };
}

export function CourseHome() {
  const [featured, setFeatured] = useState<FeaturedDay>({
    day: courseDays[0],
    label: "Upcoming class",
  });

  useEffect(() => {
    const timer = window.setTimeout(() => setFeatured(findFeaturedDay(new Date())), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const { day: featuredDay, label } = featured;
  const { dateNumber, month } = dateParts(featuredDay);

  return (
    <>
      <section className={styles.featuredDay} aria-labelledby="featured-day-title">
        <div className={styles.featuredDate}>
          <span>{label}</span>
          <strong>{dateNumber}</strong>
          <span>{month}</span>
        </div>
        <div className={styles.featuredContent}>
          <div className={styles.logistics}>
            <span>{featuredDay.time}</span>
            <span>{featuredDay.room}</span>
          </div>
          <h2 id="featured-day-title">Day {featuredDay.number}: {featuredDay.title}</h2>
        </div>
        <Link className={styles.primaryLink} href={`/day/${featuredDay.number}`}>Open day <span aria-hidden="true">→</span></Link>
      </section>

      <section className={styles.courseMap} aria-labelledby="course-map-title">
        <div className={styles.sectionTitle}>
          <h2 id="course-map-title">Course overview</h2>
        </div>
        <ol className={styles.overviewList}>
          {courseDays.map((day) => (
            <li key={day.number}>
              <span className={styles.dayNumber}>{day.number}</span>
              <div className={styles.dayMeta}>
                <strong>{day.date}</strong>
                <div className={styles.logistics}>
                  <span>{day.time}</span>
                  <span>{day.room}</span>
                </div>
              </div>
              <p>Day {day.number}: {day.title}</p>
              <Link className={styles.overviewButton} href={`/day/${day.number}`}>Open day <span aria-hidden="true">→</span></Link>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.feedback} aria-labelledby="feedback-title">
        <h2 id="feedback-title">Constructive feedback is always appreciated.</h2>
        <a href="https://www.menti.com/al67du6pv352" target="_blank" rel="noreferrer">
          Give anonymous feedback <span aria-hidden="true">↗</span>
        </a>
      </section>
    </>
  );
}
