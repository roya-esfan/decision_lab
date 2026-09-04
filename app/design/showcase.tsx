"use client";

import Link from "next/link";
import { useState } from "react";
import { courseDays } from "@/content/course";
import styles from "./showcase.module.css";

const directions = [
  { id: "guide", label: "Option 1", name: "Course guide", note: "Calm, academic and easy to scan" },
  { id: "brief", label: "Option 2", name: "Daily brief", note: "Puts the relevant teaching day first" },
  { id: "schedule", label: "Option 3", name: "Schedule first", note: "Compact and timetable-led" },
] as const;

type DirectionId = (typeof directions)[number]["id"];
const previewDay = courseDays[0];

function shortDate(date: string) {
  return date.replace(", 2026", "");
}

function CourseTitle() {
  return <h1>Judgement and decision making in organizations</h1>;
}

function FeedbackLink() {
  return (
    <div className={styles.feedbackLine}>
      <span>Constructive feedback is always appreciated.</span>
      <a href="https://www.menti.com/al67du6pv352" target="_blank" rel="noreferrer">
        Give anonymous feedback <span aria-hidden="true">↗</span>
      </a>
    </div>
  );
}

function DayLink({ dayNumber, quiet = false }: { dayNumber: number; quiet?: boolean }) {
  return (
    <Link className={quiet ? styles.quietLink : styles.dayLink} href={`/day/${dayNumber}`}>
      Open day <span aria-hidden="true">→</span>
    </Link>
  );
}

function GuideOption() {
  return (
    <article className={`${styles.sitePreview} ${styles.guide}`} aria-label="Course guide design preview">
      <header className={styles.guideHeader}>
        <span>ØAADM3700</span>
        <span>Autumn 2026</span>
      </header>
      <main>
        <section className={styles.guideIntro}>
          <div><CourseTitle /></div>
        </section>
        <section className={styles.guideUpcoming} aria-labelledby="guide-upcoming-title">
          <div className={styles.guideUpcomingDate}>
            <span>Upcoming class</span><strong>14</strong><span>September</span>
          </div>
          <div className={styles.guideUpcomingContent}>
            <p className={styles.guideLogistics}><span>{previewDay.time}</span><span>{previewDay.room}</span></p>
            <h2 id="guide-upcoming-title">Day 1: {previewDay.title}</h2>
          </div>
          <DayLink dayNumber={1} />
        </section>
        <section className={styles.guideOverview} aria-labelledby="guide-overview-title">
          <div className={styles.sectionHeading}>
            <h2 id="guide-overview-title">Course overview</h2>
          </div>
          <ol className={styles.guideDayList}>
            {courseDays.map((day) => (
              <li key={day.number}>
                <span className={styles.listNumber}>{day.number}</span>
                <div className={styles.listDate}>
                  <strong>{shortDate(day.date)}</strong>
                  <span className={styles.guideLogistics}><span>{day.time}</span><span>{day.room}</span></span>
                </div>
                <p className={styles.guideDayTitle}>Day {day.number}: {day.title}</p>
                <DayLink dayNumber={day.number} quiet />
              </li>
            ))}
          </ol>
        </section>
      </main>
      <FeedbackLink />
    </article>
  );
}

function BriefOption() {
  return (
    <article className={`${styles.sitePreview} ${styles.brief}`} aria-label="Daily brief design preview">
      <header className={styles.briefHeader}>
        <div><span className={styles.briefCode}>ØAADM3700</span><span>Autumn 2026</span></div>
        <a href="https://www.menti.com/al67du6pv352" target="_blank" rel="noreferrer">Anonymous feedback</a>
      </header>
      <main>
        <section className={styles.briefIntro}>
          <div><CourseTitle /></div>
          <p>Everything you need for each teaching day, in one place.</p>
        </section>
        <section className={styles.briefCurrent} aria-labelledby="brief-current-title">
          <div className={styles.briefLabel}>Upcoming class</div>
          <div className={styles.briefDate}><strong>Monday</strong><span>14 September</span><span>{previewDay.time}</span></div>
          <div className={styles.briefDetails}>
            <h2 id="brief-current-title">Day 1</h2>
            <ul>{previewDay.topics.slice(0, 3).map((topic) => <li key={topic}>{topic}</li>)}</ul>
          </div>
          <DayLink dayNumber={1} />
        </section>
        <section className={styles.briefOverview} aria-labelledby="brief-overview-title">
          <div className={styles.sectionHeading}>
            <h2 id="brief-overview-title">All teaching days</h2><span>14–28 September</span>
          </div>
          <ol className={styles.briefDayList}>
            {courseDays.map((day) => (
              <li key={day.number}>
                <div className={styles.briefDayDate}><span>Day {day.number}</span><strong>{shortDate(day.date)}</strong></div>
                <div className={styles.briefDayTopic}><strong>{day.topics[0]}</strong><span>{day.time}</span></div>
                <DayLink dayNumber={day.number} quiet />
              </li>
            ))}
          </ol>
        </section>
      </main>
      <FeedbackLink />
    </article>
  );
}

function ScheduleOption() {
  return (
    <article className={`${styles.sitePreview} ${styles.schedule}`} aria-label="Schedule-first design preview">
      <header className={styles.scheduleHeader}>
        <div><p className={styles.courseCode}>ØAADM3700</p><CourseTitle /></div>
        <div><strong>Autumn 2026</strong><span>14–28 September</span></div>
      </header>
      <main>
        <section className={styles.scheduleNext} aria-labelledby="schedule-next-title">
          <span>Upcoming</span>
          <div><strong id="schedule-next-title">Monday, 14 September</strong><span>{previewDay.time}</span></div>
          <p>{previewDay.topics[0]}</p>
          <DayLink dayNumber={1} />
        </section>
        <section className={styles.scheduleOverview} aria-labelledby="schedule-overview-title">
          <div className={styles.sectionHeading}>
            <h2 id="schedule-overview-title">Course overview</h2><span>Select a day for sessions, readings and assignments</span>
          </div>
          <div className={styles.scheduleTable} role="table" aria-label="Teaching days">
            <div className={styles.tableHeader} role="row">
              <span role="columnheader">Day</span><span role="columnheader">Date and time</span>
              <span role="columnheader">Topics</span><span role="columnheader" className={styles.srOnly}>Open page</span>
            </div>
            {courseDays.map((day) => (
              <div className={styles.tableRow} role="row" key={day.number}>
                <strong role="cell">{String(day.number).padStart(2, "0")}</strong>
                <div role="cell"><strong>{shortDate(day.date)}</strong><span>{day.time}</span></div>
                <p role="cell">{day.topics.slice(0, 2).join("; ")}</p>
                <div role="cell"><DayLink dayNumber={day.number} quiet /></div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <FeedbackLink />
    </article>
  );
}

export function DesignShowcase() {
  const [direction, setDirection] = useState<DirectionId>("guide");
  return (
    <div className={styles.reviewPage}>
      <header className={styles.reviewHeader}>
        <div><h1>Homepage directions</h1><p>Three information-first approaches for the student course page.</p></div>
        <Link href="/">View current homepage</Link>
      </header>
      <nav className={styles.directionPicker} aria-label="Choose a homepage direction">
        {directions.map((item) => (
          <button type="button" key={item.id} aria-pressed={direction === item.id} onClick={() => setDirection(item.id)}>
            <span>{item.label}</span><strong>{item.name}</strong><small>{item.note}</small>
          </button>
        ))}
      </nav>
      <div className={styles.previewFrame}>
        {direction === "guide" && <GuideOption />}
        {direction === "brief" && <BriefOption />}
        {direction === "schedule" && <ScheduleOption />}
      </div>
      <p className={styles.reviewNote}>These are structural directions, not three different color themes. Choose the one that makes the course easiest to understand.</p>
    </div>
  );
}
