// ============================================================
// Real streak va faollik kalendari modeli.
// "profile_stats"/"profile_activity" Supabase+localStorage orqali
// saqlanadi, shuning uchun Navbar va ProfilePage bir xil manbadan
// (shu modul) o'qib, sinxron real qiymat ko'rsatadi.
// ============================================================

export async function updateLoginStreak(storage) {
  const today = new Date().toISOString().split("T")[0];

  let stats = {};
  try {
    const saved = await storage.get("profile_stats");
    if (saved) stats = JSON.parse(saved);
  } catch (e) {}

  const lastLogin = stats.last_login ? stats.last_login.split("T")[0] : "";
  if (lastLogin === today) return stats;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  const newStreak = lastLogin === yesterdayStr ? (stats.streak || 0) + 1 : 1;

  const updated = {
    ...stats,
    login_count: (stats.login_count || 0) + 1,
    streak: newStreak,
    best_streak: Math.max(newStreak, stats.best_streak || 0),
    last_login: new Date().toISOString(),
  };
  await storage.set("profile_stats", JSON.stringify(updated));

  let activity = {};
  try {
    const savedActivity = await storage.get("profile_activity");
    if (savedActivity) activity = JSON.parse(savedActivity);
  } catch (e) {}
  activity[today] = (activity[today] || 0) + 1;
  await storage.set("profile_activity", JSON.stringify(activity));

  return updated;
}

export function buildActivityHeatmap(loginActivityMap, progressObj, dbResults) {
  const heatmap = { ...(loginActivityMap || {}) };

  Object.values(progressObj || {}).forEach((item) => {
    if (item?.date) {
      const key = String(item.date).split("T")[0];
      heatmap[key] = (heatmap[key] || 0) + 1;
    }
  });

  (dbResults || []).forEach((r) => {
    const dateStr = r.created_at || r.date;
    if (dateStr) {
      const key = String(dateStr).split("T")[0];
      heatmap[key] = (heatmap[key] || 0) + 1;
    }
  });

  return heatmap;
}
