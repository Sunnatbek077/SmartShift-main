import { useState } from "react";
import { COLORS } from "./index";

const qs = {
  progress: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  progressBar: { flex: 1, height: 4, background: "#E2E8F0", borderRadius: 2, margin: "0 16px" },
  question: { fontSize: 18, fontWeight: 600, marginBottom: 20, padding: 16, background: "#F8FAFC", borderRadius: 12, borderLeft: "4px solid #2563EB", lineHeight: 1.5, color: "var(--text)" },
  options: { display: "flex", flexDirection: "column", gap: 10 },
  optBase: { padding: "14px 18px", borderRadius: 12, border: "1px solid #E2E8F0", background: "#fff", cursor: "pointer", fontSize: 15, transition: "all 0.2s", display: "flex", alignItems: "center", gap: 12, fontFamily: "'Outfit'", color: "var(--text)", textAlign: "left", width: "100%" },
  optLetter: { width: 30, height: 30, borderRadius: 8, background: "rgba(37,99,235,0.08)", color: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, flexShrink: 0 },
  result: { marginTop: 20, padding: "16px 20px", borderRadius: 12, fontSize: 15, fontWeight: 500, lineHeight: 1.6 },
  btn: { padding: "10px 24px", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", border: "none", fontFamily: "'Outfit'", background: "#2563EB", color: "white" },
  finalResult: { textAlign: "center", padding: 30, background: "#F8FAFC", borderRadius: 16, border: "1px solid #E2E8F0" },
};

export default function Quiz({ questions = [], onComplete }) {
  const [ci, setCi] = useState(0);
  const [sel, setSel] = useState(null);
  const [ans, setAns] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  if (!questions.length) return <div style={{ color: "var(--muted)", textAlign: "center", padding: 40 }}>Savollar yuklanmagan.</div>;

  const q = questions[ci];
  const ok = sel === q.correct;
  const tot = questions.length;

  const pick = (i) => { if (ans) return; setSel(i); setAns(true); if (i === q.correct) setScore(s => s + 1); };
  const next = () => {
    if (ci < tot - 1) { setCi(i => i + 1); setSel(null); setAns(false); }
    else { setDone(true); if (onComplete) onComplete(score, tot); }
  };
  const reset = () => { setCi(0); setSel(null); setAns(false); setScore(0); setDone(false); };

  if (done) {
    const pct = Math.round((score / tot) * 100);
    const emoji = pct >= 80 ? "🏆" : pct >= 60 ? "👍" : "💪";
    const msg = pct >= 80 ? "Ajoyib natija!" : pct >= 60 ? "Yaxshi! Bir oz mashq qiling." : "Mavzuni qayta ko'ring.";
    return (
      <div style={qs.finalResult}>
        <div style={{ fontSize: 60, marginBottom: 16 }}>{emoji}</div>
        <div style={{ fontFamily: "'Space Grotesk'", fontSize: 36, fontWeight: 700 }}>{score}/{tot}</div>
        <div style={{ fontSize: 18, color: "var(--muted)", margin: "8px 0 20px" }}>{pct}% to'g'ri</div>
        <div style={{ fontSize: 15, color: "var(--muted)", marginBottom: 24 }}>{msg}</div>
        <button style={qs.btn} onClick={reset}>🔄 Qayta urinish</button>
      </div>
    );
  }

  return (
    <div>
      <div style={qs.progress}>
        <span style={{ fontSize: 13, color: "var(--muted)" }}>Savol {ci + 1}/{tot}</span>
        <div style={qs.progressBar}><div style={{ height: "100%", background: "#2563EB", borderRadius: 2, transition: "width 0.3s", width: `${((ci + 1) / tot) * 100}%` }} /></div>
        <span style={{ fontSize: 13, color: "#059669", fontWeight: 600 }}>{score} ball</span>
      </div>
      <div style={qs.question}>{q.q}</div>
      <div style={qs.options}>
        {q.opts.map((opt, i) => {
          let bc = "#E2E8F0", bg = "#fff";
          if (ans) { if (i === q.correct) { bc = "#059669"; bg = "rgba(5,150,105,0.06)"; } else if (i === sel) { bc = "#DC2626"; bg = "rgba(220,38,38,0.06)"; } }
          else if (sel === i) { bc = "#2563EB"; bg = "rgba(37,99,235,0.06)"; }
          return <button key={i} style={{ ...qs.optBase, borderColor: bc, background: bg, cursor: ans ? "default" : "pointer" }} onClick={() => pick(i)}><span style={qs.optLetter}>{String.fromCharCode(65 + i)}</span>{opt}</button>;
        })}
      </div>
      {ans && (
        <div style={{ ...qs.result, background: ok ? "rgba(5,150,105,0.06)" : "rgba(220,38,38,0.06)", border: `1px solid ${ok ? "rgba(5,150,105,0.2)" : "rgba(220,38,38,0.2)"}`, color: ok ? "#059669" : "#DC2626" }}>
          <div>{ok ? "✅ To'g'ri! Ajoyib!" : "❌ Noto'g'ri."}</div>
          <button style={{ ...qs.btn, marginTop: 12 }} onClick={next}>{ci < tot - 1 ? "Keyingi savol →" : "Natijani ko'rish 📊"}</button>
        </div>
      )}
    </div>
  );
}
