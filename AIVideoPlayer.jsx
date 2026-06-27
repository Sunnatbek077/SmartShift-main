// ============================================================
// EduAI Platform — AI Slideshow Player
// Mavzuga mos slaydlar + Yandex Nigora ovozi
// ============================================================
import { useState, useRef, useEffect, useCallback } from "react";
import { storage } from "./supabase";

const SLIDE_DURATION = 6000; // har bir slayd 6 soniya

export default function AIVideoPlayer({ text, topicName, fanName, lang = "uz-UZ", geminiKey, apiKey, folderId }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const frameRef = useRef(0);
  const slideTimerRef = useRef(null);
  const audioRef = useRef(null);
  const progressRef = useRef(0);
  const isPlayingRef = useRef(false);

  // Default slaydlar (AI yo'q bo'lsa)
  const makeDefaultSlides = (topic, fan, introText) => {
    const sentences = (introText || "").match(/[^.!?]+[.!?]+/g) || [];
    const result = [
      { title: topic, subtitle: fan, text: sentences[0] || "Mavzuni o'rganamiz", emoji: "🎓", bg: ["#1E3A8A", "#2563EB"] },
      { title: "Asosiy tushunchalar", subtitle: topic, text: sentences[1] || "Asosiy qoidalar va ta'riflar", emoji: "📚", bg: ["#065F46", "#059669"] },
      { title: "Misollar", subtitle: topic, text: sentences[2] || "Amaliy misollar", emoji: "💡", bg: ["#7C2D12", "#D97706"] },
      { title: "Qoidalar", subtitle: topic, text: sentences[3] || "Muhim qoidalar", emoji: "📋", bg: ["#4C1D95", "#7C3AED"] },
      { title: "Xulosa", subtitle: topic, text: sentences[4] || "Mavzuni takrorlaymiz", emoji: "✅", bg: ["#1E293B", "#334155"] },
    ];
    return result;
  };

  // Universal Gemini chaqiruvi (Google, Groq, OpenRouter mosligi)
  const callGemini = async (prompt) => {
    const key = geminiKey || localStorage.getItem("gemini_api_key") || "";
    if (!key) throw new Error("Gemini API key not found");

    const isGroq = key.startsWith("gsk_");
    const isOpenRouter = key.startsWith("sk-or-");
    const model = localStorage.getItem("gemini_model") || "gemini-1.5-flash";

    if (isGroq || isOpenRouter) {
      const endpoint = isGroq
        ? "https://api.groq.com/openai/v1/chat/completions"
        : "https://openrouter.ai/api/v1/chat/completions";
      const resp = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await resp.json();
      if (data.error)
        throw new Error(data.error.message || JSON.stringify(data.error));
      if (!data.choices?.[0]?.message?.content)
        throw new Error("AI returned empty response");
      return data.choices[0].message.content;
    }

    // Default Gemini
    const fallbacks = [
      "gemini-1.5-flash-latest",
      "gemini-1.5-flash",
      "gemini-pro",
      "gemini-2.0-flash",
    ];
    const uniqueModels = [...new Set([model, ...fallbacks])];
    let lastErr = "";

    for (const m of uniqueModels) {
      try {
        const resp = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${key}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
          }
        );
        const data = await resp.json();
        if (data.error) {
          lastErr = `Model ${m}: ${data.error.message}`;
          if (
            data.error.message.toLowerCase().includes("quota") ||
            data.error.message.toLowerCase().includes("limit")
          )
            continue;
          throw new Error(data.error.message);
        }
        if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
          lastErr = `Model ${m} returned empty response.`;
          continue;
        }
        return data.candidates[0].content.parts[0].text;
      } catch (e) {
        lastErr = e.message;
        if (
          e.message.toLowerCase().includes("quota") ||
          e.message.toLowerCase().includes("limit")
        )
          continue;
        throw e;
      }
    }
    throw new Error(`All models failed. Last error: ${lastErr}`);
  };

  // AI bilan slaydlar generatsiya
  const generateSlides = async () => {
    setIsGenerating(true);
    try {
      const isEn = lang === "en-US";
      const isRu = lang === "ru-RU";
      const prompt = isEn
        ? `Create exactly 6 educational slides for the topic "${topicName}" (subject: ${fanName}). Return ONLY valid JSON array, no markdown, no explanation. Format: [{"title":"...","subtitle":"...","text":"one clear sentence about this slide","emoji":"relevant emoji","color":"#hexcolor"}]. Make each slide cover a different aspect: 1) Introduction, 2) Definition, 3) Key rules, 4) Examples, 5) Practice, 6) Summary. Write everything in English.`
        : isRu
        ? `Создай ровно 6 образовательных слайдов по теме "${topicName}" (предмет: ${fanName}). Верни ТОЛЬКО валидный JSON массив, без markdown. Формат: [{"title":"...","subtitle":"...","text":"одно чёткое предложение","emoji":"эмодзи","color":"#hexcolor"}]. Пиши на русском.`
        : `"${topicName}" mavzusi (fan: ${fanName}) uchun aynan 6 ta ta'lim slaydini yarat. FAQAT JSON massiv qaytargin, markdown yo'q. Format: [{"title":"...","subtitle":"...","text":"bir aniq jumla","emoji":"mos emoji","color":"#hexcolor"}]. O'zbek tilida yoz.`;

      const raw = await callGemini(prompt);
      const jsonMatch = raw.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const formatted = parsed.map(s => ({
          title: s.title || topicName,
          subtitle: s.subtitle || fanName,
          text: s.text || "",
          emoji: s.emoji || "📚",
          bg: [s.color || "#1E3A8A", "#0F172A"],
        }));
        setSlides(formatted);
        storage.set(`slides_${topicName}`, JSON.stringify(formatted));
        setIsGenerating(false);
        return formatted;
      }
    } catch (e) {
      console.error("Slide generation error:", e);
    }
    const def = makeDefaultSlides(topicName, fanName, text);
    setSlides(def);
    setIsGenerating(false);
    return def;
  };

  // Saqlangan slaydlarni yuklash
  useEffect(() => {
    const loadSlides = async () => {
      const saved = await storage.get(`slides_${topicName}`);
      if (saved) {
        try {
          setSlides(JSON.parse(saved));
          return;
        } catch {}
      }
      setSlides(makeDefaultSlides(topicName, fanName, text));
    };
    loadSlides();
  }, [topicName, fanName, text]);

  // Canvas chizish
  const drawSlide = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width / 2;
    const H = canvas.height / 2;
    frameRef.current++;

    const slide = slides[currentSlide] || slides[0];
    if (!slide) {
      ctx.fillStyle = "#0F172A";
      ctx.fillRect(0, 0, W * 2, H * 2);
      return;
    }

    // Fon gradient
    const bg1 = slide.bg?.[0] || "#1E3A8A";
    const bg2 = slide.bg?.[1] || "#0F172A";
    const grad = ctx.createLinearGradient(0, 0, W * 2, H * 2);
    grad.addColorStop(0, bg1);
    grad.addColorStop(1, bg2);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W * 2, H * 2);

    // Dekorativ doiralar
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(
        W * 2 * (0.1 + i * 0.4),
        H * 2 * (0.1 + i * 0.3),
        80 + i * 40,
        0, Math.PI * 2
      );
      ctx.fillStyle = `rgba(255,255,255,0.03)`;
      ctx.fill();
    }

    // Slayd raqami
    ctx.font = "bold 13px 'Outfit', sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.textAlign = "right";
    ctx.fillText(`${currentSlide + 1} / ${slides.length}`, W * 2 - 20, 30);

    // Emoji
    ctx.font = `${H * 0.35}px serif`;
    ctx.textAlign = "center";
    ctx.fillText(slide.emoji || "📚", W, H * 0.55);

    // Title
    ctx.font = "bold 28px 'Space Grotesk', sans-serif";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.shadowColor = "rgba(0,0,0,0.3)";
    ctx.shadowBlur = 8;
    ctx.fillText(slide.title || "", W, H * 0.78);
    ctx.shadowBlur = 0;

    // Subtitle
    ctx.font = "16px 'Outfit', sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.fillText(slide.subtitle || "", W, H * 0.88);

    // Text (word wrap)
    if (slide.text) {
      ctx.font = "15px 'Outfit', sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      const maxW = W * 2 - 80;
      const words = slide.text.split(" ");
      let line = "";
      let y = H * 1.05;
      for (const word of words) {
        const test = line + word + " ";
        if (ctx.measureText(test).width > maxW && line) {
          ctx.fillText(line.trim(), W, y);
          line = word + " ";
          y += 22;
        } else {
          line = test;
        }
      }
      if (line) ctx.fillText(line.trim(), W, y);
    }

    // Progress bar
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.fillRect(0, H * 2 - 6, W * 2, 6);
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.fillRect(0, H * 2 - 6, W * 2 * progressRef.current, 6);

    // Slayd progress dots
    const dotSpacing = 16;
    const totalDots = slides.length;
    const startX = W - (totalDots * dotSpacing) / 2;
    for (let i = 0; i < totalDots; i++) {
      ctx.beginPath();
      ctx.arc(startX + i * dotSpacing, H * 2 - 20, i === currentSlide ? 5 : 3, 0, Math.PI * 2);
      ctx.fillStyle = i === currentSlide ? "white" : "rgba(255,255,255,0.3)";
      ctx.fill();
    }

    animRef.current = requestAnimationFrame(drawSlide);
  }, [slides, currentSlide]);

  useEffect(() => {
    animRef.current = requestAnimationFrame(drawSlide);
    return () => cancelAnimationFrame(animRef.current);
  }, [drawSlide]);

  // Yandex TTS yoki Brauzer SpeechSynthesis bilan slayd matnini o'qish
  const speakSlide = async (slideIdx, allSlides) => {
    const slide = allSlides[slideIdx];
    if (!slide) return;

    const textToSpeak = `${slide.title}. ${slide.text || ""}`.trim();
    if (!textToSpeak) return;

    // Agar Ingliz tili yoki Rus tili bo'lsa, brauzer SpeechSynthesis API dan foydalanish (bepul va toza o'qish)
    if (lang === "en-US" || lang === "ru-RU") {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(textToSpeak);
        utter.lang = lang;
        utter.rate = 0.85;
        const voices = window.speechSynthesis.getVoices();
        const v =
          voices.find((v) => v.lang === lang && v.localService) ||
          voices.find(
            (v) => v.lang.startsWith(lang.split("-")[0]) && v.localService,
          ) ||
          voices.find((v) => v.lang === lang) ||
          voices.find((v) => v.lang.startsWith(lang.split("-")[0]));
        if (v) utter.voice = v;
        window.speechSynthesis.speak(utter);
      }
      return;
    }

    // Default: O'zbek tili uchun Yandex TTS (Nigora)
    const key = apiKey || localStorage.getItem("yandex_api_key") || "AQVNyhenbfSm1y-yphnpClHRp3Pk-oYMYS2_3WCS";
    const folder = folderId || localStorage.getItem("yandex_folder_id") || "b1g8kv6e0bjll0b1u2f5";
    if (!key) return;

    try {
      const formData = new URLSearchParams();
      formData.append("text", textToSpeak.slice(0, 300));
      formData.append("lang", "uz-UZ");
      formData.append("voice", "nigora");
      formData.append("folderId", folder);
      formData.append("format", "mp3");

      const ttsUrl = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
        ? "/yandex-api/speech/v1/tts:synthesize"
        : "/.netlify/functions/tts";

      const resp = await fetch(ttsUrl, {
        method: "POST",
        headers: { "Authorization": `Api-Key ${key}` },
        body: formData,
      });

      if (!resp.ok) return;
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.play().catch(() => {});
    } catch {}
  };

  // Slaydlarni o'ynash
  const playSlideshow = async (startSlides) => {
    const allSlides = startSlides || slides;
    if (!allSlides.length) return;

    isPlayingRef.current = true;
    setIsPlaying(true);
    setCurrentSlide(0);
    progressRef.current = 0;
    setProgress(0);

    for (let i = 0; i < allSlides.length; i++) {
      if (!isPlayingRef.current) break;
      setCurrentSlide(i);
      progressRef.current = i / allSlides.length;
      setProgress(i / allSlides.length);

      // Ovoz bilan o'qish
      speakSlide(i, allSlides);

      // Slayd davomiyligi
      await new Promise(resolve => {
        slideTimerRef.current = setTimeout(resolve, SLIDE_DURATION);
      });

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    }

    if (isPlayingRef.current) {
      progressRef.current = 1;
      setProgress(1);
      setIsPlaying(false);
      isPlayingRef.current = false;
    }
  };

  const stopSlideshow = () => {
    isPlayingRef.current = false;
    setIsPlaying(false);
    if (slideTimerRef.current) clearTimeout(slideTimerRef.current);
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    progressRef.current = 0;
    setProgress(0);
    setCurrentSlide(0);
  };

  const handlePlay = async () => {
    if (isPlaying) { stopSlideshow(); return; }
    if (slides.length === 0) {
      const newSlides = await generateSlides();
      playSlideshow(newSlides);
    } else {
      playSlideshow(slides);
    }
  };

  const handleGenerate = async () => {
    stopSlideshow();
    const newSlides = await generateSlides();
    playSlideshow(newSlides);
  };

  // Prev/Next
  const prevSlide = () => setCurrentSlide(i => Math.max(0, i - 1));
  const nextSlide = () => setCurrentSlide(i => Math.min(slides.length - 1, i + 1));

  return (
    <div style={{ marginBottom: 24 }}>
      {/* Canvas slayd */}
      <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", background: "#0F172A" }}>
        <canvas
          ref={canvasRef}
          width={1400}
          height={788}
          style={{ width: "100%", display: "block", borderRadius: 16 }}
        />

        {/* Play overlay (faqat to'xtatilganda) */}
        {!isPlaying && !isGenerating && (
          <div
            onClick={handlePlay}
            style={{
              position: "absolute", inset: 0,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              cursor: "pointer",
              background: "rgba(0,0,0,0.25)",
              borderRadius: 16,
            }}
          >
            <div style={{
              width: 72, height: 72, borderRadius: "50%",
              background: "rgba(37,99,235,0.9)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 32, boxShadow: "0 8px 32px rgba(37,99,235,0.5)",
            }}>
              ▶️
            </div>
            <div style={{ color: "white", fontWeight: 700, fontSize: 16, marginTop: 12, textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
              Slayd-darsni boshlash
            </div>
          </div>
        )}

        {/* Generating overlay */}
        {isGenerating && (
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            background: "rgba(0,0,0,0.6)", borderRadius: 16,
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
            <div style={{ color: "white", fontWeight: 700, fontSize: 18 }}>AI slaydlar yaratmoqda...</div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, marginTop: 8 }}>Gemini mavzuga mos slaydlar tayyorlamoqda</div>
          </div>
        )}

        {/* Prev/Next navigatsiya */}
        {slides.length > 1 && (
          <>
            <button onClick={prevSlide} style={{
              position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
              background: "rgba(0,0,0,0.4)", border: "none", color: "white",
              width: 40, height: 40, borderRadius: "50%", cursor: "pointer", fontSize: 18
            }}>‹</button>
            <button onClick={nextSlide} style={{
              position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
              background: "rgba(0,0,0,0.4)", border: "none", color: "white",
              width: 40, height: 40, borderRadius: "50%", cursor: "pointer", fontSize: 18
            }}>›</button>
          </>
        )}
      </div>

      {/* Tugmalar */}
      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <button
          onClick={handlePlay}
          style={{
            flex: 1, padding: "10px", borderRadius: 10, border: "none",
            background: isPlaying ? "#DC2626" : "#2563EB",
            color: "white", fontWeight: 700, cursor: "pointer", fontSize: 14
          }}
        >
          {isPlaying ? "⏹ To'xtatish" : "▶ Slayd-darsni boshlash (Nigora ovozi)"}
        </button>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          style={{
            padding: "10px 16px", borderRadius: 10, border: "none",
            background: isGenerating ? "#E2E8F0" : "linear-gradient(135deg, #7C3AED, #2563EB)",
            color: isGenerating ? "#94A3B8" : "white",
            fontWeight: 700, cursor: isGenerating ? "not-allowed" : "pointer", fontSize: 13
          }}
        >
          {isGenerating ? "⏳..." : "✨ AI slaydlar"}
        </button>
      </div>
    </div>
  );
}
