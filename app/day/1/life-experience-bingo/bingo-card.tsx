"use client";

import { useEffect, useMemo, useState } from "react";
import {
  bingoExperiences,
  generateBingoCard,
  type BingoExperience,
} from "@/content/life-experience-bingo";
import styles from "./life-experience-bingo.module.css";

const storageKey = "oaadm-life-experience-bingo-v2";

const winningLines = [
  [0, 1, 2, 3],
  [4, 5, 6, 7],
  [8, 9, 10, 11],
  [12, 13, 14, 15],
  [0, 4, 8, 12],
  [1, 5, 9, 13],
  [2, 6, 10, 14],
  [3, 7, 11, 15],
  [0, 5, 10, 15],
  [3, 6, 9, 12],
] as const;

type SavedCard = {
  cardIds: number[];
  markedIds: number[];
};

type AllocatedCard = {
  cardIds: number[];
};

function restoreCard(): SavedCard | null {
  try {
    const stored = window.sessionStorage.getItem(storageKey);
    if (!stored) return null;

    const parsed = JSON.parse(stored) as Partial<SavedCard>;
    const validIds = new Set(bingoExperiences.map((item) => item.id));
    const cardIds = parsed.cardIds ?? [];
    const markedIds = parsed.markedIds ?? [];

    if (
      cardIds.length !== 16 ||
      new Set(cardIds).size !== 16 ||
      !cardIds.every((id) => validIds.has(id)) ||
      !markedIds.every((id) => cardIds.includes(id))
    ) {
      return null;
    }

    return { cardIds, markedIds: [...new Set(markedIds)] };
  } catch {
    return null;
  }
}

function saveCard(card: BingoExperience[], markedIds: Set<number>) {
  try {
    const saved: SavedCard = {
      cardIds: card.map((item) => item.id),
      markedIds: [...markedIds],
    };
    window.sessionStorage.setItem(storageKey, JSON.stringify(saved));
  } catch {
    // The card still works when browser storage is unavailable.
  }
}

function cardFromIds(cardIds: number[], experienceById: Map<number, BingoExperience>) {
  const uniqueIds = new Set(cardIds);
  if (cardIds.length !== 16 || uniqueIds.size !== 16) return null;

  const card = cardIds
    .map((id) => experienceById.get(id))
    .filter((item): item is BingoExperience => Boolean(item));
  return card.length === 16 ? card : null;
}

async function requestAllocatedCard() {
  const response = await fetch("/api/bingo-card", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
    cache: "no-store",
  });
  if (!response.ok) throw new Error("BINGO_CARD_ALLOCATION_FAILED");
  return response.json() as Promise<AllocatedCard>;
}

export function BingoCard() {
  const [card, setCard] = useState<BingoExperience[]>([]);
  const [markedIds, setMarkedIds] = useState<Set<number>>(new Set());
  const [ready, setReady] = useState(false);

  const experienceById = useMemo(
    () => new Map(bingoExperiences.map((item) => [item.id, item])),
    [],
  );

  const winningIds = useMemo(() => {
    const ids = new Set<number>();

    for (const line of winningLines) {
      if (line.every((index) => card[index] && markedIds.has(card[index].id))) {
        line.forEach((index) => ids.add(card[index].id));
      }
    }

    return ids;
  }, [card, markedIds]);

  useEffect(() => {
    let cancelled = false;
    const frame = window.requestAnimationFrame(async () => {
      const saved = restoreCard();

      if (saved) {
        const restoredCard = cardFromIds(saved.cardIds, experienceById);
        if (!cancelled && restoredCard) {
          setCard(restoredCard);
          setMarkedIds(new Set(saved.markedIds));
        }
      } else {
        try {
          const allocated = await requestAllocatedCard();
          const allocatedCard = cardFromIds(allocated.cardIds, experienceById);
          if (!allocatedCard) throw new Error("BINGO_CARD_INVALID");
          if (!cancelled) setCard(allocatedCard);
        } catch {
          if (!cancelled) setCard(generateBingoCard());
        }
      }

      if (!cancelled) setReady(true);
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
    };
  }, [experienceById]);

  useEffect(() => {
    if (ready && card.length === 16) saveCard(card, markedIds);
  }, [card, markedIds, ready]);

  function toggleSquare(id: number) {
    setMarkedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (!ready) {
    return <div className={styles.preparing}>Preparing your card…</div>;
  }

  return (
    <>
      <div className={styles.cardMeta}>
        <p>Tap a square to mark or unmark it</p>
        <p aria-live="polite"><strong>{markedIds.size}</strong> of 16 marked</p>
      </div>
      <div className={styles.bingoGrid} aria-label="Your life experience bingo card">
        {card.map((item) => {
          const marked = markedIds.has(item.id);
          const winning = winningIds.has(item.id);

          return (
            <button
              aria-label={`${marked ? "Unmark" : "Mark"}: ${item.experience}`}
              aria-pressed={marked}
              className={[
                marked ? styles.marked : "",
                winning ? styles.winning : "",
              ].filter(Boolean).join(" ")}
              key={item.id}
              onClick={() => toggleSquare(item.id)}
              type="button"
            >
              <span className={styles.cross} aria-hidden="true">×</span>
              <span className={styles.experience}>{item.experience}</span>
            </button>
          );
        })}
      </div>
      <p className={styles.storageNote}>Your card and marks stay on this device for this browser session</p>
    </>
  );
}
