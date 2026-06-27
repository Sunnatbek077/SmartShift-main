import { useState, useEffect, useRef, useCallback } from "react";

const ss = {
  container: { background: "#F8FAFC", borderRadius: 12, border: "1px solid #E2E8F0", padding: 20, marginBottom: 16 },
  canvas: { width: "100%", height: 320, borderRadius: 8, background: "linear-gradient(180deg, #EFF6FF 0%, #DBEAFE 100%)", display: "block" },
  controls: { display: "flex", gap: 16, marginTop: 16, flexWrap: "wrap", alignItems: "center" },
  sliderGroup: { flex: 1, minWidth: 200 },
  sliderLabel: { fontSize: 13, color: "#64748B", marginBottom: 6, display: "flex", justifyContent: "space-between" },
  sliderValue: { color: "#2563EB", fontWeight: 600, fontFamily: "'JetBrains Mono'" },
  btn: { padding: "10px 24px", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", border: "none", fontFamily: "'Outfit'", transition: "all 0.2s" },
  infoBox: { background: "rgba(37,99,235,0.05)", border: "1px solid rgba(37,99,235,0.15)", borderRadius: 10, padding: "14px 18px", marginTop: 12, fontSize: 14, color: "#64748B", lineHeight: 1.6 },
};

export default function NewtonSimulation() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const [friction, setFriction] = useState(0.02);
  const [initVelocity, setInitVelocity] = useState(5);
  const [running, setRunning] = useState(false);
  const stateRef = useRef({ x: 60, v: 0, running: false, friction: 0.02 });

  useEffect(() => { stateRef.current.friction = friction; }, [friction]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width / 2, H = canvas.height / 2;
    const s = stateRef.current;
    ctx.save(); ctx.clearRect(0, 0, W * 2, H * 2);

    // Sky and ground
    const grd = ctx.createLinearGradient(0, 0, 0, H);
    grd.addColorStop(0, "#EFF6FF"); grd.addColorStop(1, "#DBEAFE");
    ctx.fillStyle = grd; ctx.fillRect(0, 0, W, H);
    const groundY = H - 60;
    ctx.fillStyle = "#94A3B8"; ctx.fillRect(0, groundY, W, 60);
    ctx.fillStyle = "#CBD5E1";
    for (let i = 0; i < W; i += 50) { ctx.fillRect(i, groundY, 1, 60); }

    if (s.friction > 0.01) {
      ctx.fillStyle = `rgba(217,119,6,${Math.min(s.friction * 3, 0.4)})`;
      for (let i = 0; i < W; i += 8) ctx.fillRect(i, groundY, 3, 2);
    }

    // Ball
    const ballR = 22, ballY = groundY - ballR;
    const grad = ctx.createRadialGradient(s.x - 4, ballY - 6, 2, s.x, ballY, ballR);
    grad.addColorStop(0, "#60A5FA"); grad.addColorStop(1, "#2563EB");
    ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(s.x, ballY, ballR, 0, Math.PI * 2); ctx.fill();

    // Velocity arrow
    if (Math.abs(s.v) > 0.1) {
      ctx.strokeStyle = "#059669"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(s.x, ballY - ballR - 14); ctx.lineTo(s.x + s.v * 12, ballY - ballR - 14); ctx.stroke();
    }

    // Info panel
    ctx.fillStyle = "rgba(255,255,255,0.9)"; ctx.fillRect(W - 200, 12, 185, 85);
    ctx.strokeStyle = "#E2E8F0"; ctx.lineWidth = 1; ctx.strokeRect(W - 200, 12, 185, 85);
    ctx.fillStyle = "#1E293B"; ctx.font = "13px Outfit";
    ctx.fillText(`Tezlik: ${Math.abs(s.v).toFixed(2)} m/s`, W - 188, 36);
    ctx.fillStyle = "#D97706"; ctx.fillText(`Ishqalanish: ${s.friction.toFixed(3)}`, W - 188, 56);

    // Physics
    if (s.running && Math.abs(s.v) > 0.05) {
      s.v -= s.friction * Math.sign(s.v) * 0.5;
      if (Math.abs(s.v) < 0.05) s.v = 0;
      s.x += s.v * 2;
      if (s.x > W - ballR) { s.x = W - ballR; s.v = -s.v * 0.7; }
      if (s.x < ballR) { s.x = ballR; s.v = -s.v * 0.7; }
    }
    ctx.restore();
    animRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth * 2;
      canvas.height = canvas.offsetHeight * 2;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(2, 2);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    animRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", handleResize);
    };
  }, [draw]);

  return (
    <div>
      <div style={ss.container}>
        <canvas ref={canvasRef} style={ss.canvas} />
        <div style={ss.controls}>
          <div style={ss.sliderGroup}>
            <div style={ss.sliderLabel}>Ishqalanish: <span style={ss.sliderValue}>{friction.toFixed(3)}</span></div>
            <input type="range" style={{ width: "100%" }} min="0" max="0.1" step="0.001" value={friction} onChange={e => setFriction(+e.target.value)} />
          </div>
          <div style={ss.sliderGroup}>
            <div style={ss.sliderLabel}>Tezlik: <span style={ss.sliderValue}>{initVelocity} m/s</span></div>
            <input type="range" style={{ width: "100%" }} min="1" max="15" step="0.5" value={initVelocity} onChange={e => setInitVelocity(+e.target.value)} />
          </div>
          <button style={{ ...ss.btn, background: "#2563EB", color: "white" }} onClick={() => { stateRef.current = { ...stateRef.current, x: 60, v: initVelocity, running: true }; setRunning(true); }}>▶ Boshlash</button>
          <button style={{ ...ss.btn, background: "#E2E8F0", color: "#1E293B" }} onClick={() => { stateRef.current = { ...stateRef.current, x: 60, v: 0, running: false }; setRunning(false); }}>↺ Qayta</button>
        </div>
      </div>
      <div style={ss.infoBox}>
        <strong style={{ color: "#2563EB" }}>Nyuton 1-qonuni:</strong> Tashqi kuch ta'sir qilmasa, jism holatini saqlaydi.
        <br /><br />
        <strong style={{ color: "#059669" }}>Sinab ko'ring:</strong> Ishqalanishni 0 ga qo'ying — jism cheksiz harakatlanadi!
      </div>
    </div>
  );
}
