import { useState, useEffect, useRef, useCallback } from "react";

// ============================================================
// ONA TILI — Matn Yaratish 3D Laboratoriyasi
// Harflar uchib kelib so'z, so'zlar birikib gap hosil qiladi
// ============================================================

const WORDS = [
  { word: "KITOB", color: "#2563EB", emoji: "📚" },
  { word: "MAKTAB", color: "#059669", emoji: "🏫" },
  { word: "O'QUVCHI", color: "#D97706", emoji: "👨‍🎓" },
  { word: "DARS", color: "#7C3AED", emoji: "📖" },
  { word: "BILIM", color: "#DC2626", emoji: "💡" },
];

const SENTENCES = [
  "O'quvchi kitob o'qiydi.",
  "Bilim — kuch.",
  "Maktab — ilm maskani.",
];

const ss = {
  wrap: { background: "#F8FAFC", borderRadius: 16, border: "1px solid #E2E8F0", padding: 20, marginBottom: 16 },
  canvas: { width: "100%", height: 340, borderRadius: 12, display: "block", cursor: "pointer" },
  controls: { display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap", alignItems: "center" },
  btn: { padding: "10px 20px", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", border: "none", fontFamily: "'Outfit'", transition: "all 0.2s" },
  modeBtn: { padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", border: "2px solid transparent", fontFamily: "'Outfit'", transition: "all 0.2s" },
  infoBox: { background: "rgba(37,99,235,0.05)", border: "1px solid rgba(37,99,235,0.15)", borderRadius: 10, padding: "14px 18px", marginTop: 12, fontSize: 14, color: "#64748B", lineHeight: 1.6 },
  wordBtns: { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 },
  wordBtn: { padding: "8px 16px", borderRadius: 20, fontSize: 14, fontWeight: 700, cursor: "pointer", border: "none", fontFamily: "'Outfit'", transition: "all 0.2s", color: "white" },
};

// ---- Particle (harf zarrachasi) ----
class LetterParticle {
  constructor(letter, targetX, targetY, color, W, H) {
    this.letter = letter;
    this.targetX = targetX;
    this.targetY = targetY;
    this.color = color;
    // Boshlang'ich pozitsiya — ekranning chetidan uchib keladi
    const side = Math.floor(Math.random() * 4);
    if (side === 0) { this.x = Math.random() * W; this.y = -40; }
    else if (side === 1) { this.x = W + 40; this.y = Math.random() * H; }
    else if (side === 2) { this.x = Math.random() * W; this.y = H + 40; }
    else { this.x = -40; this.y = Math.random() * H; }
    this.vx = 0; this.vy = 0;
    this.arrived = false;
    this.scale = 0.2 + Math.random() * 0.5;
    this.rotation = (Math.random() - 0.5) * Math.PI * 2;
    this.rotSpeed = (Math.random() - 0.5) * 0.15;
    this.alpha = 0;
    this.bounce = 0;
    this.delay = Math.random() * 30; // frame delay
    this.delayCount = 0;
    this.glowPhase = Math.random() * Math.PI * 2;
  }

  update() {
    if (this.delayCount < this.delay) { this.delayCount++; return; }
    this.alpha = Math.min(1, this.alpha + 0.06);
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 3) {
      this.arrived = true;
      this.x = this.targetX;
      this.y = this.targetY;
      this.scale = 1;
      this.rotation = 0;
      this.bounce = Math.max(0, this.bounce - 0.05);
    } else {
      this.arrived = false;
      const speed = 0.12;
      this.vx += dx * speed;
      this.vy += dy * speed;
      this.vx *= 0.75;
      this.vy *= 0.75;
      this.x += this.vx;
      this.y += this.vy;
      this.scale += (1 - this.scale) * 0.08;
      this.rotation += this.rotSpeed;
      this.rotSpeed *= 0.92;
    }
    this.glowPhase += 0.05;
  }

  draw(ctx) {
    if (this.alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.scale(this.scale, this.scale);

    // 3D shadow effect
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 8 + Math.sin(this.glowPhase) * 4;

    // Harf foni (3D pill)
    const pad = 10;
    const w = 28, h = 32;
    const grad = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
    grad.addColorStop(0, this.color + "EE");
    grad.addColorStop(1, this.color + "99");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(-w / 2, -h / 2, w, h, 8);
    ctx.fill();

    // Yuqori yorug'lik (3D effekt)
    const shine = ctx.createLinearGradient(-w / 2, -h / 2, -w / 2, 0);
    shine.addColorStop(0, "rgba(255,255,255,0.35)");
    shine.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = shine;
    ctx.beginPath();
    ctx.roundRect(-w / 2, -h / 2, w, h / 2, [8, 8, 0, 0]);
    ctx.fill();

    // Harf
    ctx.shadowBlur = 0;
    ctx.fillStyle = "white";
    ctx.font = "bold 20px 'Outfit', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.letter, 0, 1);

    ctx.restore();
  }
}

// ---- Floating word (so'z suzib yuradi) ----
class FloatingWord {
  constructor(word, color, emoji, W, H) {
    this.word = word;
    this.color = color;
    this.emoji = emoji;
    this.x = 80 + Math.random() * (W - 160);
    this.y = 60 + Math.random() * (H - 120);
    this.vx = (Math.random() - 0.5) * 1.2;
    this.vy = (Math.random() - 0.5) * 1.2;
    this.phase = Math.random() * Math.PI * 2;
    this.scale = 1;
    this.hovered = false;
    this.W = W; this.H = H;
  }

  update() {
    this.phase += 0.025;
    this.x += this.vx;
    this.y += this.vy + Math.sin(this.phase) * 0.3;
    if (this.x < 60 || this.x > this.W - 60) this.vx *= -1;
    if (this.y < 40 || this.y > this.H - 40) this.vy *= -1;
    this.scale += (1 - this.scale) * 0.1;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(this.scale, this.scale);

    const textW = this.word.length * 14 + 40;
    const h = 44;

    // Shadow
    ctx.shadowColor = this.color + "66";
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 4;

    // Background pill
    const grad = ctx.createLinearGradient(-textW / 2, -h / 2, textW / 2, h / 2);
    grad.addColorStop(0, this.color + "FF");
    grad.addColorStop(1, this.color + "BB");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(-textW / 2, -h / 2, textW, h, 22);
    ctx.fill();

    // Shine
    const shine = ctx.createLinearGradient(-textW / 2, -h / 2, -textW / 2, 0);
    shine.addColorStop(0, "rgba(255,255,255,0.3)");
    shine.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = shine;
    ctx.beginPath();
    ctx.roundRect(-textW / 2, -h / 2, textW, h / 2, [22, 22, 0, 0]);
    ctx.fill();

    ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
    ctx.fillStyle = "white";
    ctx.font = "bold 16px 'Outfit', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.emoji + " " + this.word, 0, 1);

    ctx.restore();
  }

  contains(mx, my) {
    const textW = this.word.length * 14 + 40;
    return Math.abs(mx - this.x) < textW / 2 && Math.abs(my - this.y) < 22;
  }
}

// ---- Gap qurilishi animatsiyasi ----
class SentenceBuilder {
  constructor(sentence, W, H) {
    this.sentence = sentence;
    this.words = sentence.split(" ");
    this.W = W; this.H = H;
    this.particles = [];
    this.done = false;
    this._build();
  }

  _build() {
    const colors = ["#2563EB", "#059669", "#D97706", "#7C3AED", "#DC2626", "#0891B2"];
    const totalW = this.words.reduce((s, w) => s + w.length * 18 + 20, 0);
    let startX = (this.W - totalW) / 2;
    const baseY = this.H / 2;

    this.words.forEach((word, wi) => {
      const wordColor = colors[wi % colors.length];
      [...word].forEach((letter, li) => {
        const tx = startX + li * 18 + 9;
        const ty = baseY;
        this.particles.push(new LetterParticle(letter, tx, ty, wordColor, this.W, this.H));
      });
      startX += word.length * 18 + 20;
    });
  }

  update() {
    this.particles.forEach(p => p.update());
    this.done = this.particles.every(p => p.arrived);
  }

  draw(ctx) {
    this.particles.forEach(p => p.draw(ctx));
  }
}

export default function OnatiliSimulation() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const stateRef = useRef({
    mode: "words", // "words" | "sentence" | "build"
    floatingWords: [],
    sentenceBuilder: null,
    currentSentenceIdx: 0,
    currentWordIdx: 0,
    particles: [],
    frame: 0,
    W: 700, H: 340,
  });

  const [mode, setMode] = useState("words");
  const [selectedWord, setSelectedWord] = useState(null);
  const [sentenceIdx, setSentenceIdx] = useState(0);
  const [info, setInfo] = useState("So'zni bosing — harflar uchib kelib so'z hosil qiladi!");

  const initWords = useCallback((W, H) => {
    stateRef.current.floatingWords = WORDS.map(
      (w) => new FloatingWord(w.word, w.color, w.emoji, W, H)
    );
  }, []);

  const buildWord = useCallback((wordObj) => {
    const { W, H } = stateRef.current;
    const letters = [...wordObj.word];
    const totalW = letters.length * 46;
    const startX = (W - totalW) / 2 + 23;
    const baseY = H / 2;

    stateRef.current.particles = letters.map((letter, i) =>
      new LetterParticle(letter, startX + i * 46, baseY, wordObj.color, W, H)
    );
    stateRef.current.mode = "build";
    setInfo(`"${wordObj.word}" so'zi ${letters.length} ta harfdan iborat. Harflar uchib kelyapti!`);
  }, []);

  const buildSentence = useCallback((idx) => {
    const { W, H } = stateRef.current;
    stateRef.current.sentenceBuilder = new SentenceBuilder(SENTENCES[idx], W, H);
    stateRef.current.mode = "sentence";
    setInfo(`Gap: "${SENTENCES[idx]}" — so'zlar birikib gap hosil qilmoqda!`);
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const s = stateRef.current;
    const W = s.W, H = s.H;
    s.frame++;

    ctx.save();
    ctx.clearRect(0, 0, W, H);

    // Background gradient
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, "#EFF6FF");
    bg.addColorStop(0.5, "#F0FDF4");
    bg.addColorStop(1, "#FFF7ED");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Floating dots (background decoration)
    for (let i = 0; i < 12; i++) {
      const x = ((i * 137 + s.frame * 0.3) % W);
      const y = 30 + ((i * 89 + s.frame * 0.2) % (H - 60));
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(37,99,235,${0.04 + Math.sin(s.frame * 0.02 + i) * 0.02})`;
      ctx.fill();
    }

    if (s.mode === "words") {
      // Title
      ctx.fillStyle = "#1E293B";
      ctx.font = "bold 18px 'Outfit', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("📝 So'zlarni bosing — harflarni ko'ring!", W / 2, 30);

      s.floatingWords.forEach(fw => { fw.update(); fw.draw(ctx); });

    } else if (s.mode === "build") {
      // Title
      ctx.fillStyle = "#1E293B";
      ctx.font = "bold 18px 'Outfit', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("✨ Harflar uchib kelyapti...", W / 2, 30);

      s.particles.forEach(p => { p.update(); p.draw(ctx); });

      // Check if all arrived
      if (s.particles.length > 0 && s.particles.every(p => p.arrived)) {
        ctx.fillStyle = "#059669";
        ctx.font = "bold 16px 'Outfit', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("✅ So'z to'liq hosil bo'ldi!", W / 2, H - 30);
      }

    } else if (s.mode === "sentence") {
      // Title
      ctx.fillStyle = "#1E293B";
      ctx.font = "bold 18px 'Outfit', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("🔤 Gap qurilmoqda...", W / 2, 30);

      if (s.sentenceBuilder) {
        s.sentenceBuilder.update();
        s.sentenceBuilder.draw(ctx);

        if (s.sentenceBuilder.done) {
          ctx.fillStyle = "#7C3AED";
          ctx.font = "bold 16px 'Outfit', sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("🎉 Gap to'liq qurildi!", W / 2, H - 30);
        }
      }
    }

    ctx.restore();
    animRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const W = rect.width || 700;
      const H = 340;
      canvas.width = W * 2;
      canvas.height = H * 2;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(2, 2);
      stateRef.current.W = W;
      stateRef.current.H = H;
      if (stateRef.current.mode === "words") {
        initWords(W, H);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    animRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", handleResize);
    };
  }, [draw, initWords]);

  // Canvas click — so'zni bosish
  const handleCanvasClick = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left);
    const my = (e.clientY - rect.top);
    const s = stateRef.current;

    if (s.mode === "words") {
      const clicked = s.floatingWords.find(fw => fw.contains(mx, my));
      if (clicked) {
        const wordObj = WORDS.find(w => w.word === clicked.word);
        if (wordObj) {
          setSelectedWord(wordObj.word);
          buildWord(wordObj);
        }
      }
    }
  }, [buildWord]);

  const handleModeWords = () => {
    const { W, H } = stateRef.current;
    stateRef.current.mode = "words";
    stateRef.current.particles = [];
    initWords(W, H);
    setSelectedWord(null);
    setInfo("So'zni bosing — harflar uchib kelib so'z hosil qiladi!");
  };

  const handleModeSentence = (idx) => {
    setSentenceIdx(idx);
    buildSentence(idx);
  };

  return (
    <div>
      {/* Mode tugmalari */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <button
          style={{ ...ss.modeBtn, background: mode === "words" ? "#2563EB" : "#F1F5F9", color: mode === "words" ? "white" : "#64748B", borderColor: mode === "words" ? "#2563EB" : "#E2E8F0" }}
          onClick={() => { setMode("words"); handleModeWords(); }}
        >📝 So'z Laboratoriyasi</button>
        <button
          style={{ ...ss.modeBtn, background: mode === "sentence" ? "#7C3AED" : "#F1F5F9", color: mode === "sentence" ? "white" : "#64748B", borderColor: mode === "sentence" ? "#7C3AED" : "#E2E8F0" }}
          onClick={() => { setMode("sentence"); handleModeSentence(sentenceIdx); }}
        >🔤 Gap Qurilishi</button>
      </div>

      {/* Canvas */}
      <div style={ss.wrap}>
        <canvas ref={canvasRef} style={ss.canvas} onClick={handleCanvasClick} />

        {/* So'z tanlash tugmalari */}
        {mode === "words" && (
          <div style={ss.wordBtns}>
            {WORDS.map((w) => (
              <button
                key={w.word}
                style={{ ...ss.wordBtn, background: w.color, opacity: selectedWord === w.word ? 1 : 0.75, transform: selectedWord === w.word ? "scale(1.08)" : "scale(1)", boxShadow: selectedWord === w.word ? `0 4px 16px ${w.color}55` : "none" }}
                onClick={() => { setSelectedWord(w.word); buildWord(w); }}
              >
                {w.emoji} {w.word}
              </button>
            ))}
            <button style={{ ...ss.wordBtn, background: "#64748B" }} onClick={handleModeWords}>
              🔄 Qayta
            </button>
          </div>
        )}

        {/* Gap tanlash */}
        {mode === "sentence" && (
          <div style={ss.wordBtns}>
            {SENTENCES.map((s, i) => (
              <button
                key={i}
                style={{ ...ss.wordBtn, background: sentenceIdx === i ? "#7C3AED" : "#94A3B8", fontSize: 13 }}
                onClick={() => handleModeSentence(i)}
              >
                {i + 1}. {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Info box */}
      <div style={ss.infoBox}>
        <strong style={{ color: "#2563EB" }}>💡 Laboratoriya:</strong> {info}
        <br /><br />
        <strong style={{ color: "#059669" }}>Sinab ko'ring:</strong> Har bir so'zni bosing va harflarning 3D animatsiyada uchib kelishini kuzating. "Gap Qurilishi" rejimida so'zlar birikib to'liq gap hosil qiladi!
      </div>
    </div>
  );
}
