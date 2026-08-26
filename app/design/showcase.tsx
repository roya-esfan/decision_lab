"use client";

import { useState } from "react";
import styles from "./showcase.module.css";

const themes = [
  { id: "editorial", number: "01", name: "Editorial Lab", note: "Measured, academic, distinctive" },
  { id: "precision", number: "02", name: "Precision Grid", note: "Technical, direct, data-led" },
  { id: "seminar", number: "03", name: "Warm Seminar", note: "Approachable, calm, spacious" },
] as const;

const screens = [
  { id: "hub", label: "Course hub" },
  { id: "activity", label: "Student activity" },
  { id: "results", label: "Live results" },
] as const;

type ThemeId = (typeof themes)[number]["id"];
type ScreenId = (typeof screens)[number]["id"];

const days = [
  { day: "01", topic: "Decision approaches and anatomy", sessions: "14 Sep" },
  { day: "02", topic: "Heuristics, biases and noise", sessions: "15 Sep" },
  { day: "03", topic: "Framing and preferences", sessions: "16 Sep" },
  { day: "04", topic: "Attention, expertise and emotion", sessions: "17 Sep" },
  { day: "05", topic: "Overconfidence and escalation", sessions: "22 Sep" },
  { day: "06", topic: "Fairness and ethics", sessions: "23 Sep" },
  { day: "07", topic: "Improving decisions", sessions: "24 Sep" },
  { day: "08", topic: "Presentations and synthesis", sessions: "28 Sep" },
];

function CourseHeader({ compact = false }: { compact?: boolean }) {
  return (
    <header className={styles.courseHeader}>
      <div className={styles.wordmark} aria-label="Decision Lab">
        <span className={styles.wordmarkIndex}>DL</span>
        <span>Decision Lab</span>
      </div>
      <div className={styles.courseIdentity}>
        <span>ØAADM3700</span>
        {!compact && <span>Autumn 2026</span>}
      </div>
    </header>
  );
}

function HubScreen() {
  return (
    <div className={styles.productPage}>
      <CourseHeader />
      <main>
        <section className={styles.hubIntro}>
          <div>
            <p className={styles.eyebrow}>Course workspace · Autumn 2026</p>
            <h1>Decision-Making Processes<br />in Organizations</h1>
          </div>
          <p className={styles.introCopy}>Eight teaching days from 14 to 28 September 2026.</p>
        </section>

        <section className={styles.nextSession} aria-labelledby="next-session-title">
          <div className={styles.nextMeta}>
            <span>Next in class</span>
            <span>Day 01 · Session 1</span>
          </div>
          <div className={styles.nextContent}>
            <div>
              <p className={styles.kicker}>Opening experiment</p>
              <h2 id="next-session-title">How noisy is our judgment?</h2>
              <p>Make an individual estimate, inspect the class distribution, then discuss what the disagreement means.</p>
            </div>
            <button className={styles.primaryButton} type="button">Open session</button>
          </div>
        </section>

        <section className={styles.courseMap} aria-labelledby="course-map-title">
          <div className={styles.sectionHeading}>
            <h2 id="course-map-title">Course map</h2>
            <p>Eight teaching days</p>
          </div>
          <ol className={styles.dayList}>
            {days.map((item, index) => (
              <li key={item.day}>
                <span className={styles.dayNumber}>{item.day}</span>
                <span className={styles.dayTopic}>{item.topic}</span>
                <span className={styles.daySessions}>{item.sessions}</span>
                <span className={styles.dayStatus}>{index === 0 ? "Next" : "Planned"}</span>
              </li>
            ))}
          </ol>
        </section>
      </main>
      <ProductFooter />
    </div>
  );
}

function ActivityScreen() {
  const [estimate, setEstimate] = useState(62);
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className={styles.productPage}>
      <CourseHeader compact />
      <main className={styles.activityLayout}>
        <aside className={styles.activityAside}>
          <p className={styles.eyebrow}>Day 01 · Live activity</p>
          <p className={styles.activityCount}>01 <span>/ 03</span></p>
          <div className={styles.progressTrack} aria-label="Activity progress: step 1 of 3">
            <span style={{ width: "33.33%" }} />
          </div>
          <p className={styles.privacyNote}>Anonymous response<br />Session P7K3 M2Q9</p>
        </aside>

        <section className={styles.questionArea} aria-labelledby="question-title">
          <p className={styles.kicker}>Noise audit · Individual estimate</p>
          <h1 id="question-title">What is the probability that the project will be completed on schedule?</h1>
          <p className={styles.scenarioText}>
            A cross-functional team is introducing a new planning system. The
            project is halfway through its schedule; two milestones were late,
            staffing is now stable, and the pilot produced mixed results.
          </p>

          <div className={styles.estimateBlock}>
            <div className={styles.estimateReadout} aria-live="polite">
              <span>Your estimate</span>
              <strong>{estimate}%</strong>
            </div>
            <label className={styles.srOnly} htmlFor="estimate">Probability estimate</label>
            <input
              id="estimate"
              className={styles.range}
              type="range"
              min="0"
              max="100"
              value={estimate}
              onChange={(event) => {
                setEstimate(Number(event.target.value));
                setSubmitted(false);
              }}
            />
            <div className={styles.rangeLabels} aria-hidden="true">
              <span>0 · Impossible</span>
              <span>50 · Even chance</span>
              <span>100 · Certain</span>
            </div>
          </div>

          <div className={styles.submitRow}>
            <button className={styles.primaryButton} type="button" onClick={() => setSubmitted(true)}>
              {submitted ? "Response received" : "Submit estimate"}
            </button>
            <p aria-live="polite">{submitted ? "Saved anonymously. Wait for the class discussion." : "You can change your answer until you submit."}</p>
          </div>
        </section>
      </main>
      <ProductFooter />
    </div>
  );
}

const resultBars = [
  { range: "0–20", value: 4 },
  { range: "21–40", value: 12 },
  { range: "41–60", value: 26 },
  { range: "61–80", value: 24 },
  { range: "81–100", value: 10 },
];

function ResultsScreen() {
  const [locked, setLocked] = useState(false);

  return (
    <div className={`${styles.productPage} ${styles.presentationPage}`}>
      <CourseHeader compact />
      <main className={styles.resultsLayout}>
        <section className={styles.resultsTitle}>
          <div>
            <p className={styles.eyebrow}>Noise audit · Live results</p>
            <h1>We read the same case.<br />We reached different judgments.</h1>
          </div>
          <div className={styles.liveCount}>
            <strong>76</strong>
            <span>responses</span>
            <span className={locked ? styles.closedDot : styles.liveDot}>{locked ? "Locked" : "Open"}</span>
          </div>
        </section>

        <section className={styles.chartSection} aria-labelledby="chart-title">
          <div className={styles.chartHeading}>
            <h2 id="chart-title">Estimated probability of on-time completion</h2>
            <span>Share of class · %</span>
          </div>
          <div className={styles.chart} role="img" aria-label="Distribution of 76 estimates. Most responses are between 41 and 80 percent.">
            <div className={styles.yAxis}><span>30</span><span>20</span><span>10</span><span>0</span></div>
            <div className={styles.plot}>
              <span className={styles.gridLine} style={{ bottom: "33.33%" }} />
              <span className={styles.gridLine} style={{ bottom: "66.66%" }} />
              <span className={styles.gridLine} style={{ bottom: "100%" }} />
              {resultBars.map((bar) => (
                <div className={styles.barColumn} key={bar.range}>
                  <span className={styles.barValue}>{bar.value}</span>
                  <span className={styles.bar} style={{ height: `${(bar.value / 30) * 100}%` }} />
                  <span className={styles.barLabel}>{bar.range}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.resultSummary} aria-label="Summary statistics">
          <div><span>Median estimate</span><strong>60%</strong></div>
          <div><span>Middle 50%</span><strong>43–74%</strong></div>
          <div><span>Full range</span><strong>12–96%</strong></div>
          <p>What explains a spread this wide when everyone received the same information?</p>
        </section>

        <div className={styles.presentationControls}>
          <span>Instructor controls</span>
          <button type="button" onClick={() => setLocked((value) => !value)}>{locked ? "Reopen responses" : "Lock responses"}</button>
          <button type="button">Reveal discussion prompt</button>
        </div>
      </main>
    </div>
  );
}

function ProductFooter() {
  return (
    <footer className={styles.productFooter}>
      <span>ØAADM3700</span>
      <span>No account · No personal information</span>
    </footer>
  );
}

export function DesignShowcase() {
  const [theme, setTheme] = useState<ThemeId>("precision");
  const [screen, setScreen] = useState<ScreenId>("hub");
  const selectedTheme = themes.find((item) => item.id === theme) ?? themes[0];

  return (
    <main className={styles.showcase}>
      <header className={styles.reviewHeader}>
        <div>
          <p className={styles.reviewEyebrow}>Decision Lab · Design review 01</p>
          <h1>Choose the character of the course</h1>
          <p>Compare the same content and interactions across three deliberately different directions.</p>
        </div>
        <div className={styles.reviewStatus}>
          <span>First milestone</span>
          <strong>Visual direction</strong>
        </div>
      </header>

      <section className={styles.selectionArea} aria-label="Design preview controls">
        <div className={styles.themePicker} role="group" aria-label="Visual direction">
          {themes.map((item) => (
            <button key={item.id} type="button" aria-pressed={theme === item.id} onClick={() => setTheme(item.id)}>
              <span>{item.number}</span>
              <strong>{item.name}</strong>
              <small>{item.note}</small>
            </button>
          ))}
        </div>

        <div className={styles.screenPicker} role="tablist" aria-label="Preview screen">
          <span>View</span>
          {screens.map((item) => (
            <button key={item.id} type="button" role="tab" aria-selected={screen === item.id} onClick={() => setScreen(item.id)}>
              {item.label}
            </button>
          ))}
        </div>
      </section>

      <div className={styles.previewLabel}>
        <span>{selectedTheme.number}</span>
        <strong>{selectedTheme.name}</strong>
        <span>{screens.find((item) => item.id === screen)?.label}</span>
      </div>

      <section className={`${styles.previewFrame} ${styles[theme]}`} data-theme={theme}>
        {screen === "hub" && <HubScreen />}
        {screen === "activity" && <ActivityScreen />}
        {screen === "results" && <ResultsScreen />}
      </section>

      <footer className={styles.reviewFooter}>
        <p>All content is representative. Activities and dates will be added after the design system is selected.</p>
        <p>ØAADM3700 · Autumn 2026</p>
      </footer>
    </main>
  );
}
