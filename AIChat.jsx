import { useState, useRef, useEffect } from "react";
import { COLORS } from "./index";

const cs = {
  container: { display: "flex", flexDirection: "column", height: 460 },
  messages: {
    flex: 1,
    overflowY: "auto",
    padding: "8px 0",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  msgBase: {
    maxWidth: "85%",
    padding: "12px 16px",
    borderRadius: 14,
    fontSize: 14,
    lineHeight: 1.6,
    animation: "fadeInUp 0.3s ease",
    position: "relative",
  },
  msgAi: {
    alignSelf: "flex-start",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderBottomLeftRadius: 4,
    color: "var(--text)",
  },
  msgUser: {
    alignSelf: "flex-end",
    background: "rgba(37,99,235,0.08)",
    border: "1px solid rgba(37,99,235,0.2)",
    borderBottomRightRadius: 4,
    color: "var(--text)",
  },
  labelAi: {
    fontSize: 11,
    fontWeight: 600,
    marginBottom: 4,
    color: "#059669",
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  labelUser: {
    fontSize: 11,
    fontWeight: 600,
    marginBottom: 4,
    color: "#2563EB",
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  inputArea: { display: "flex", gap: 8, marginTop: 12 },
  input: {
    flex: 1,
    padding: "12px 16px",
    borderRadius: 12,
    background: "var(--input-bg)",
    border: "1px solid var(--border)",
    color: "var(--text)",
    fontSize: 14,
    outline: "none",
    fontFamily: "'Outfit'",
  },
  sendBtn: {
    padding: "12px 20px",
    borderRadius: 12,
    border: "none",
    background: "#2563EB",
    color: "white",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "'Outfit'",
    fontSize: 14,
  },
  speakBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 8,
    border: "none",
    background: "#059669",
    color: "white",
    cursor: "pointer",
    fontSize: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s",
  },
};

const buildSystem = (topic, subject) =>
  `Sen EduMind platformasining AI ustozisan. Faqat "${subject}" fanidagi "${topic}" mavzusi bo'yicha savollarga javob ber. Boshqa mavzularga: "Bu mavzu ${subject} darsiga kirmaydi, faqat ${topic} haqida savol bering" de. O'zbek tilida, sodda va aniq javob ber. Misollar bilan tushuntir.`;

const INITIAL = {
  role: "ai",
  text: "Assalomu alaykum! Men sizning AI ustozingizman. 🤖 Tayyor bo'lsangiz, boshlaylik! Savolingizni bering.",
};

const FALLBACKS = [
  "Ajoyib savol! Keling, buni oddiy misol bilan tushuntiraman. Yana savol bormi?",
  "Yaxshi o'ylaysiz! To'g'ri yo'ldasiz. Tushunarlimi?",
  "Zo'r! Siz mavzuni yaxshi tushunayapsiz. Davom etamizmi? 🚀",
];

export default function AIChat({ topic = "Mavzu", subject = "Fan" }) {
  const [messages, setMessages] = useState([INITIAL]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(null); // index of message being spoken
  const [audioPlaying, setAudioPlaying] = useState(false);
  const endRef = useRef(null);
  const fbIdx = useRef(0);
  const audioRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Gemini API chaqiruvi
  const callGemini = async (prompt) => {
    const geminiKey = localStorage.getItem("gemini_api_key") || "";
    if (!geminiKey)
      throw new Error("Gemini API kaliti topilmadi. Sozlamalardan kiriting.");

    const isGroq = geminiKey.startsWith("gsk_");
    const isOpenRouter = geminiKey.startsWith("sk-or-");
    const geminiModel =
      localStorage.getItem("gemini_model") || "gemini-1.5-flash";

    if (isGroq || isOpenRouter) {
      const endpoint = isGroq
        ? "https://api.groq.com/openai/v1/chat/completions"
        : "https://openrouter.ai/api/v1/chat/completions";
      const resp = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${geminiKey}`,
        },
        body: JSON.stringify({
          model: geminiModel,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await resp.json();
      if (data.error)
        throw new Error(data.error.message || JSON.stringify(data.error));
      if (!data.choices?.[0]?.message?.content)
        throw new Error("AI bo'sh javob qaytardi");
      return data.choices[0].message.content;
    }

    // Default Gemini
    const fallbacks = [
      "gemini-1.5-flash-latest",
      "gemini-1.5-flash",
      "gemini-pro",
    ];
    const uniqueModels = [...new Set([geminiModel, ...fallbacks])];
    let lastErr = "";

    for (const m of uniqueModels) {
      try {
        const resp = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
          },
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
          lastErr = `Model ${m} bo'sh javob qaytardi.`;
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
    throw new Error(`Barcha modellar rad etildi. Oxirgi xato: ${lastErr}`);
  };

  // Web Speech API — ingliz va rus tili uchun
  const speakBrowser = (text, lang, msgIndex) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    if (speaking === msgIndex && audioPlaying) {
      setSpeaking(null);
      setAudioPlaying(false);
      return;
    }

    const doSpeak = () => {
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = lang;
      utter.rate = 0.85;
      utter.volume = 1;
      const voices = window.speechSynthesis.getVoices();
      const v =
        voices.find((v) => v.lang === lang && v.localService) ||
        voices.find(
          (v) => v.lang.startsWith(lang.split("-")[0]) && v.localService,
        ) ||
        voices.find((v) => v.lang === lang) ||
        voices.find((v) => v.lang.startsWith(lang.split("-")[0]));
      if (v) utter.voice = v;
      utter.onstart = () => {
        setSpeaking(msgIndex);
        setAudioPlaying(true);
      };
      utter.onend = () => {
        setSpeaking(null);
        setAudioPlaying(false);
      };
      utter.onerror = () => {
        setSpeaking(null);
        setAudioPlaying(false);
      };
      window.speechSynthesis.speak(utter);
      setSpeaking(msgIndex);
      setAudioPlaying(true);
    };

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      doSpeak();
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.onvoiceschanged = null;
        doSpeak();
      };
      setTimeout(doSpeak, 500);
    }
  };

  // Yandex TTS — Nigora o'zbek ovozi
  const playNigora = async (text, msgIndex) => {
    // Agar shu xabar o'qilayotgan bo'lsa — to'xtat
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (speaking === msgIndex && audioPlaying) {
      setSpeaking(null);
      setAudioPlaying(false);
      return;
    }

    const apiKey =
      localStorage.getItem("yandex_api_key") ||
      import.meta.env.VITE_YANDEX_API_KEY ||
      "";
    const folderId =
      localStorage.getItem("yandex_folder_id") ||
      import.meta.env.VITE_YANDEX_FOLDER_ID ||
      "b1g8kv6e0bjll0b1u2f5";
    if (!apiKey) return; // Kalit yo'q — jimgina o'tkazib yubor

    try {
      setSpeaking(msgIndex);
      setAudioPlaying(true);

      // Matnni 200 belgidan oshmaydigan bo'laklarga bo'lish
      const chunks = [];
      const sentences = text.match(/[^.!?]+[.!?]*/g) || [text];
      let cur = "";
      sentences.forEach((s) => {
        if ((cur + s).length < 200) {
          cur += s;
        } else {
          if (cur) chunks.push(cur.trim());
          cur = s;
        }
      });
      if (cur.trim()) chunks.push(cur.trim());

      let idx = 0;
      const playNext = async () => {
        if (idx >= chunks.length) {
          setSpeaking(null);
          setAudioPlaying(false);
          audioRef.current = null;
          return;
        }
        const formData = new URLSearchParams();
        formData.append("text", chunks[idx]);
        formData.append("lang", "uz-UZ");
        formData.append("voice", "nigora");
        formData.append("folderId", folderId);
        formData.append("format", "mp3");

        const ttsUrl =
          window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1"
            ? "/yandex-api/speech/v1/tts:synthesize"
            : "/.netlify/functions/tts";
        const resp = await fetch(ttsUrl, {
          method: "POST",
          headers: { Authorization: `Api-Key ${apiKey}` },
          body: formData,
        });
        if (!resp.ok) {
          setSpeaking(null);
          setAudioPlaying(false);
          return;
        }

        const blob = await resp.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.play().catch(() => {});
        audio.onended = () => {
          idx++;
          playNext();
        };
      };
      playNext();
    } catch {
      setSpeaking(null);
      setAudioPlaying(false);
    }
  };

  const speakText = (text, msgIndex) => {
    // Fan tiliga qarab ovoz tanlash
    const lang = subject?.toLowerCase().includes("ingliz")
      ? "en-US"
      : subject?.toLowerCase().includes("rus")
        ? "ru-RU"
        : "uz-UZ";
    if (lang === "en-US" || lang === "ru-RU") {
      speakBrowser(text, lang, msgIndex);
    } else {
      playNigora(text, msgIndex);
    }
  };

  const send = async () => {
    if (!input.trim() || loading) return;
    const txt = input.trim();
    setMessages((p) => [...p, { role: "user", text: txt }]);
    setInput("");
    setLoading(true);

    try {
      const prompt = `${buildSystem(topic, subject)}\n\nO'quvchi savoli: ${txt}\n\nJavob (o'zbek tilida, faqat "${topic}" mavzusi bo'yicha, aniq va qisqa):`;
      const aiResponse = await callGemini(prompt);
      setMessages((p) => {
        const newMsgs = [...p, { role: "ai", text: aiResponse }];
        // Avtomatik dars tiliga mos ovozda o'qish
        setTimeout(() => speakText(aiResponse, newMsgs.length - 1), 100);
        return newMsgs;
      });
    } catch (e) {
      const fallback = FALLBACKS[fbIdx.current % FALLBACKS.length];
      const errText = fallback + "\n\n⚠️ Xato: " + e.message;
      setMessages((p) => {
        const newMsgs = [...p, { role: "ai", text: errText }];
        setTimeout(() => speakText(fallback, newMsgs.length - 1), 100);
        return newMsgs;
      });
      fbIdx.current++;
    }
    setLoading(false);
  };

  return (
    <div style={cs.container}>
      <div style={cs.messages}>
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              ...cs.msgBase,
              ...(m.role === "ai" ? cs.msgAi : cs.msgUser),
            }}
          >
            <div style={m.role === "ai" ? cs.labelAi : cs.labelUser}>
              {m.role === "ai" ? "🤖 AI Ustoz (Nigora)" : "👤 Siz"}
            </div>
            {m.text}
            {m.role === "ai" && (
              <button
                style={{
                  ...cs.speakBtn,
                  background: speaking === i ? "#DC2626" : "#059669",
                }}
                onClick={() => speakText(m.text, i)}
                title={
                  speaking === i ? "To'xtatish" : "Nigora ovozida tinglash"
                }
              >
                {speaking === i ? "⏹️" : "🔊"}
              </button>
            )}
          </div>
        ))}
        {loading && (
          <div style={{ ...cs.msgBase, ...cs.msgAi }}>
            <div style={cs.labelAi}>🤖 AI Ustoz (Nigora)</div>
            <span style={{ opacity: 0.6 }}>Yozmoqda...</span>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div style={cs.inputArea}>
        <input
          style={cs.input}
          placeholder="Savolingizni yozing..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          onFocus={(e) => (e.target.style.borderColor = "#2563EB")}
          onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
        />
        <button
          style={{
            ...cs.sendBtn,
            opacity: loading || !input.trim() ? 0.5 : 1,
            cursor: loading || !input.trim() ? "not-allowed" : "pointer",
          }}
          onClick={send}
          disabled={loading || !input.trim()}
        >
          Yuborish
        </button>
      </div>
    </div>
  );
}
