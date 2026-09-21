import type { Metadata } from "next";
import Link from "next/link";
import { CourseShell } from "../../../components/course-shell";
import { BinaryChoiceActivity } from "../../2/binary-choice-activity";
import styles from "../../2/day-two-activities.module.css";

export const metadata: Metadata = {
  title: "Which stock would you sell? — Decision-Making Processes in Organizations",
  description: "Choose which of two stocks you are more likely to sell.",
};

export default function StockSalePage() {
  return (
    <CourseShell>
      <main>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">Course home</Link><span>/</span>
          <Link href="/day/5">Day 5</Link><span>/</span><span>Activity 2</span>
        </nav>

        <header className={styles.activityHeader}>
          <p className={styles.eyebrow}>Day 5 · Activity 2</p>
          <h1>Which stock would you sell?</h1>
        </header>

        <div className={styles.binaryDescription}>
          <p>
            You need money to cover the costs of your daughter’s wedding and will have to sell some stock.
            You remember the price at which you bought each stock and can identify it as a “winner,” currently
            worth more than you paid for it, or as a loser.
          </p>
          <p>
            Among the stocks you own, Blueberry Tiles is a winner; if you sell it today you will have achieved
            a gain of $5,000. You hold an equal investment in Tiffany Motors, which is currently worth $5,000
            less than you paid for it. The value of both stocks has been stable in recent weeks.
          </p>
        </div>

        <BinaryChoiceActivity
          activityKey="stock-sale"
          promptKey="stock-sale-choice"
          question="Which are you more likely to sell?"
          options={[
            { letter: "A", value: "Blueberry Tiles" },
            { letter: "B", value: "Tiffany Motors" },
          ]}
        />
      </main>
    </CourseShell>
  );
}
