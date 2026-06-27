// ============================================================
// Dars progressini hisoblash modeli
// Har bir mavzu (dars) LESSON_STEPS bo'yicha 8 bosqichdan iborat:
// Kirish, Video, Lab, AI Ustoz, Quiz, Mashq, Vazifa, O'yin.
// Progress foizi shu bosqichlarning og'irligiga qarab hisoblanadi —
// Quiz bosqichi esa ko'rilgan-ko'rilmaganidan emas, real test ballidan olinadi.
// ============================================================

export const STEP_WEIGHTS = [5, 15, 15, 10, 30, 10, 10, 5];
export const QUIZ_STEP_INDEX = 4;

export function computeTopicProgress(visitedSteps, quizScorePercent) {
  const visited = new Set(visitedSteps || []);
  let total = 0;
  STEP_WEIGHTS.forEach((weight, stepIndex) => {
    if (stepIndex === QUIZ_STEP_INDEX) {
      if (typeof quizScorePercent === "number") {
        total += (Math.max(0, Math.min(100, quizScorePercent)) / 100) * weight;
      }
    } else if (visited.has(stepIndex)) {
      total += weight;
    }
  });
  return Math.min(100, Math.round(total));
}

export async function loadVisitedStepsMap(storage, fanId, topicIds) {
  const map = {};
  await Promise.all(topicIds.map(async (topicId) => {
    try {
      const saved = await storage.get(`lesson_steps_${fanId}_${topicId}`);
      if (saved) map[topicId] = JSON.parse(saved);
    } catch (e) {}
  }));
  return map;
}

export function getTopicQuizScorePercent(fanId, topicId, topicName, progressObj, dbResults) {
  const quizKey = `${fanId}_${topicId}`;
  const quizEntry = progressObj?.[quizKey];
  const quizPercent = typeof quizEntry?.percentage === "number" ? quizEntry.percentage : undefined;

  const oralScore = (dbResults || [])
    .filter(r => String(r.topic_id) === String(topicId) || (r.topic_name === topicName && r.fan_id === fanId))
    .reduce((max, r) => Math.max(max, r.score || 0), 0) || undefined;

  if (quizPercent === undefined && oralScore === undefined) return undefined;
  return Math.max(quizPercent || 0, oralScore || 0);
}
