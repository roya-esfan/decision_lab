export const recapQuestionDeadline = "2026-09-24T23:00:00+02:00";
export const recapQuestionDeadlineLabel = "Thursday 24 September at 23:00";
export const recapQuestionMaxLength = 1000;

export function recapQuestionDeadlineHasPassed(now = new Date()) {
  return now.getTime() >= new Date(recapQuestionDeadline).getTime();
}
