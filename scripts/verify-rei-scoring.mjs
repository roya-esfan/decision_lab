import assert from "node:assert/strict";
import { rei10Items } from "../content/course.ts";
import { scoreRei10 } from "../lib/rei-scoring.ts";

function answersForScore(score) {
  return Object.fromEntries(
    rei10Items.map((item) => [item.id, item.reverse ? 6 - score : score]),
  );
}

assert.deepEqual(scoreRei10(answersForScore(5), rei10Items), {
  analytical: 5,
  intuitive: 5,
});

assert.deepEqual(scoreRei10(answersForScore(1), rei10Items), {
  analytical: 1,
  intuitive: 1,
});

assert.deepEqual(scoreRei10(answersForScore(3), rei10Items), {
  analytical: 3,
  intuitive: 3,
});

const almostMaximumIntuition = answersForScore(5);
almostMaximumIntuition["fi-1"] = 4;

assert.deepEqual(scoreRei10(almostMaximumIntuition, rei10Items), {
  analytical: 5,
  intuitive: 4.8,
});

assert.equal(scoreRei10({}, rei10Items), null);

console.log("REI-10 scoring checks passed: maximum, minimum, neutral, near-maximum, and incomplete responses.");
