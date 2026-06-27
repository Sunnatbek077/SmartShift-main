// ============================================================
// EduAI Platform — VAZIRLIK HISOBOT PANELI
// Faqat o'qish uchun: barcha o'qituvchi/talaba statistikasi
// ============================================================
import { useState, useEffect } from "react";
import { getMinistryReport, ministryLogout } from "./auth";
import ThemeToggle from "./ThemeToggle";

export default function MinistryPanel({ onLogout }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQ, setSearchQ] = useState("");

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    setLoading(true);
    const data = await getMinistryReport();
    setReport(data);
    setLoading(false);
  };

  const filteredTeachers = (report?.teacherReports || []).filter((t) => {
    const q = searchQ.toLowerCase();
    return !q || t.fullName?.toLowerCase().includes(q) || t.username?.toLowerCase().includes(q);
  });

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #0F172A, #D97706)",
          padding: "0 24px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(245,158,11,0.3)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src="/logo.png" alt="EduMind" style={{ width: 32, height: 32, borderRadius: 8, objectFit: "cover" }} />
          <div>
            <div style={{ color: "white", fontWeight: 800, fontSize: 18, fontFamily: "'Space Grotesk'" }}>
              EduMind Vazirlik Hisoboti
            </div>
            <div style={{ color: "var(--muted)", fontSize: 11 }}>Faqat ko'rish uchun — barcha muassasalar bo'yicha statistika</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <ThemeToggle />
          <button
            onClick={() => {
              ministryLogout();
              onLogout();
            }}
            style={{
              background: "rgba(220,38,38,0.2)",
              border: "1px solid rgba(220,38,38,0.3)",
              color: "#FCA5A5",
              padding: "8px 16px",
              borderRadius: 10,
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            🚪 Chiqish
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 20px" }}>
        {loading && <div style={{ textAlign: "center", padding: 60, color: "var(--dim)" }}>⏳ Hisobot tayyorlanmoqda...</div>}

        {!loading && report && (
          <>
            {/* Umumiy statistika */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14, marginBottom: 24 }}>
              {[
                { icon: "👨‍🏫", val: report.totalTeachers, label: "O'qituvchilar", color: "#818CF8" },
                { icon: "👥", val: report.totalStudents, label: "Jami talabalar", color: "#60A5FA" },
                { icon: "📊", val: report.totalResults, label: "Topshirishlar", color: "#FBBF24" },
                { icon: "🎯", val: `${report.overallAvgScore}%`, label: "O'rtacha ball", color: "#34D399" },
                { icon: "⚠️", val: report.atRiskTeachers, label: "Diqqat talab guruhlar", color: "#F87171" },
              ].map((s, i) => (
                <div key={i} style={{ background: "var(--surface)", borderRadius: 16, padding: 18, border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: 26, marginBottom: 8 }}>{s.icon}</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: s.color, fontFamily: "'Space Grotesk'" }}>{s.val}</div>
                  <div style={{ fontSize: 12, color: "var(--dim)", marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>

            <input
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder="🔍 O'qituvchi ismi yoki username bo'yicha qidirish..."
              style={{
                width: "100%",
                padding: "11px 16px",
                borderRadius: 10,
                background: "var(--input-bg)",
                color: "var(--text)",
                fontSize: 14,
                outline: "none",
                marginBottom: 16,
                boxSizing: "border-box",
                border: "1px solid var(--border)",
              }}
            />

            {filteredTeachers.length === 0 ? (
              <div style={{ textAlign: "center", padding: 60, color: "var(--dim)" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📄</div>
                <div>Ma'lumot topilmadi</div>
              </div>
            ) : (
              <div style={{ background: "var(--surface)", borderRadius: 16, border: "1px solid var(--border)", overflow: "hidden" }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 110px 110px 110px 100px",
                    padding: "12px 20px",
                    background: "rgba(245,158,11,0.08)",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "var(--dim)",
                    textTransform: "uppercase",
                    letterSpacing: ".04em",
                  }}
                >
                  <div>O'qituvchi</div>
                  <div>Talabalar</div>
                  <div>Topshirish</div>
                  <div>O'rtacha</div>
                  <div>Holat</div>
                </div>
                {filteredTeachers.map((t) => (
                  <div
                    key={t.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 110px 110px 110px 100px",
                      padding: "14px 20px",
                      borderTop: "1px solid var(--border)",
                      alignItems: "center",
                      fontSize: 14,
                      color: "var(--text)",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700 }}>{t.fullName}</div>
                      <div style={{ fontSize: 12, color: "var(--dim)" }}>@{t.username}</div>
                    </div>
                    <div>{t.studentCount}</div>
                    <div>{t.resultCount}</div>
                    <div
                      style={{
                        fontWeight: 700,
                        color: t.resultCount === 0 ? "var(--dim)" : t.avgScore < 60 ? "#F87171" : "#34D399",
                      }}
                    >
                      {t.resultCount === 0 ? "—" : `${t.avgScore}%`}
                    </div>
                    <div>
                      <span
                        style={{
                          padding: "3px 10px",
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 700,
                          background: t.isActive ? "rgba(52,211,153,0.12)" : "rgba(220,38,38,0.12)",
                          color: t.isActive ? "#34D399" : "#F87171",
                        }}
                      >
                        {t.isActive ? "Faol" : "Bloklangan"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
