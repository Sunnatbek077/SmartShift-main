// ============================================================
// EduAI Platform - DARS SAHIFASI (YORUG' TEMA)
// TTS: Brauzer SpeechSynthesis API (Yandex o'rniga)
// YouTube: Har bir mavzu uchun YouTube qidiruv
// ============================================================

import { useState, useEffect, useRef } from "react";
import {
  COLORS,
  TOPICS_MAP,
  TOPICS_MAP_7,
  TOPICS_MAP_1KURS,
  LESSON_STEPS,
  getYouTubeSearchUrl,
} from "./index";
import NewtonSimulation from "./NewtonSimulation";
import OnatiliSimulation from "./OnatiliSimulation";
import AIChat from "./AIChat";
import Quiz from "./Quiz";
import TopshirishModal from "./TopshirishModal";
import { storage } from "./supabase";
import { getLabLibraryForFan } from "./labLibrary";
import Lesson3DIntro from "./Lesson3DIntro";
import mammoth from "mammoth";
import localforage from "localforage";

const getGradeKey = (className) => {
  const match = String(className || "").match(/^\d+/);
  return match ? match[0] : String(className || "").toLowerCase().trim();
};

const injectBridgeScript = (html) => {
  if (!html) return "";
  const bridgeScript = `
    <!-- EduAI Bridge API -->
    <style>
      @keyframes eduaiPulse {
        0% { box-shadow: 0 0 0 0 rgba(217, 119, 6, 0.7); transform: scale(1); }
        70% { box-shadow: 0 0 0 15px rgba(217, 119, 6, 0); transform: scale(1.05); }
        100% { box-shadow: 0 0 0 0 rgba(217, 119, 6, 0); transform: scale(1); }
      }
      .eduai-highlighted {
        outline: 3px solid #D97706 !important;
        outline-offset: 4px;
        animation: eduaiPulse 1.5s infinite !important;
        border-radius: 4px;
        transition: all 0.3s ease;
      }
    </style>
    <script>
      (function() {
        console.log("EduAI Bridge API loaded inside iframe!");
        window.addEventListener("message", function(event) {
          const data = event.data;
          if (!data || data.type !== "AI_COMMAND") return;
          console.log("AI Command received inside iframe:", data);
          const { cmd, target } = data;
          if (!target) return;

          const elements = document.getElementsByTagName("*");
          let foundElement = null;
          
          for (let i = 0; i < elements.length; i++) {
            const el = elements[i];
            if (el.children.length === 0 || el.tagName === "BUTTON" || el.classList.contains("clickable") || el.tagName === "A") {
              const text = el.textContent || el.innerText || "";
              if (text.toLowerCase().includes(target.toLowerCase())) {
                foundElement = el;
                break;
              }
            }
          }

          if (!foundElement) {
            for (let i = 0; i < elements.length; i++) {
              const el = elements[i];
              const text = el.textContent || el.innerText || "";
              if (text.toLowerCase().includes(target.toLowerCase())) {
                if (!foundElement || el.textContent.length < foundElement.textContent.length) {
                  foundElement = el;
                }
              }
            }
          }

          if (foundElement) {
            console.log("Element found & highlighted:", foundElement);
            foundElement.scrollIntoView({ behavior: "smooth", block: "center" });
            
            document.querySelectorAll(".eduai-highlighted").forEach(el => {
              el.classList.remove("eduai-highlighted");
            });

            foundElement.classList.add("eduai-highlighted");
            
            if (cmd === "CLICK") {
              setTimeout(() => {
                foundElement.click();
                const clickEvent = new MouseEvent("click", {
                  view: window,
                  bubbles: true,
                  cancelable: true
                });
                foundElement.dispatchEvent(clickEvent);
              }, 500);
            }

            setTimeout(() => {
              foundElement.classList.remove("eduai-highlighted");
            }, 4000);
          } else {
            console.warn("Element not found for target:", target);
          }
        });
      })();
    </script>
  `;

  if (html.includes("</body>")) {
    return html.replace("</body>", bridgeScript + "</body>");
  }
  return html + bridgeScript;
};

const ls = {
  container: { gap: 20 },
  sidebar: {
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: 16,
    padding: 16,
    height: "fit-content",
    position: "sticky",
    top: 80,
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  topicBtn: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    borderRadius: 10,
    marginBottom: 4,
    cursor: "pointer",
    transition: "all 0.2s",
    fontSize: 13,
    border: "none",
    background: "none",
    color: "var(--text)",
    width: "100%",
    textAlign: "left",
    fontFamily: "'Outfit'",
  },
  topicStatus: {
    width: 24,
    height: 24,
    borderRadius: 6,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    flexShrink: 0,
  },
  header: {
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stepsNav: { display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" },
  stepBtn: {
    padding: "10px 16px",
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s",
    border: "1px solid var(--border)",
    background: "var(--card)",
    color: "var(--muted)",
    fontFamily: "'Outfit'",
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  stepBtnActive: {
    background: "rgba(37,99,235,0.1)",
    borderColor: "var(--primary)",
    color: "var(--primary)",
  },
  stepContent: {
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: 16,
    padding: 24,
    minHeight: 400,
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  stepTitle: {
    fontFamily: "'Space Grotesk'",
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 16,
    display: "flex",
    alignItems: "center",
    gap: 10,
    color: "var(--text)",
  },
  videoContainer: {
    background: "#000",
    borderRadius: 12,
    overflow: "hidden",
    aspectRatio: "16/9",
    marginBottom: 16,
  },
  infoBox: {
    background: "rgba(37,99,235,0.04)",
    border: "1px solid rgba(37,99,235,0.12)",
    borderRadius: 10,
    padding: "14px 18px",
    marginTop: 16,
    fontSize: 14,
    color: "var(--muted)",
    lineHeight: 1.6,
  },
  hwItem: {
    padding: 16,
    background: "var(--bg)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    marginBottom: 10,
    display: "flex",
    alignItems: "flex-start",
    gap: 14,
  },
  hwNum: {
    width: 32,
    height: 32,
    borderRadius: 8,
    background: "rgba(37,99,235,0.08)",
    color: "#2563EB",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 14,
    flexShrink: 0,
  },
  btn: {
    padding: "10px 24px",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    border: "none",
    fontFamily: "'Outfit'",
    transition: "all 0.2s",
  },
};

export default function DarsPage({ fan, onBack }) {
  const fanId = fan?.id || "fizika";
  const allTopics = { ...TOPICS_MAP, ...TOPICS_MAP_7, ...TOPICS_MAP_1KURS };
  const defaultTopics = allTopics[fanId] || [];
  
  const [topics, setTopics] = useState(defaultTopics);

  useEffect(() => {
    const loadTopicsList = async () => {
      const session = localStorage.getItem("eduai_session");
      if (session) {
        try {
          const user = JSON.parse(session);
          const className = user.class_name || "";
          if (className) {
            const saved = await storage.get(`custom_topics_${getGradeKey(className)}_${fanId}`);
            if (saved) {
              setTopics(JSON.parse(saved));
              return;
            }
          }
        } catch (e) {
          console.error("loadTopicsList error:", e);
        }
      }
      setTopics(fanId.startsWith("custom_") ? [] : defaultTopics);
    };
    loadTopicsList();
  }, [fanId]);

  // Til aniqlash
  const isEnglish = fanId === "ingliz";
  const isRussian = fanId === "rus";

  // UI matnlari — fan tiliga qarab
  const ui = {
    back: isEnglish ? "← Back" : isRussian ? "← Назад" : "← Ortga",
    listenLecture: isEnglish
      ? "Listen to Professional Lecture"
      : isRussian
        ? "Слушать профессиональную лекцию"
        : "Professional ma'ruzani tinglash",
    voiceLabel: isEnglish
      ? "ENGLISH VOICE"
      : isRussian
        ? "РУССКИЙ ГОЛОС"
        : "NIGORA (Eng barqaror)",
    preparing: isEnglish
      ? "Preparing audio..."
      : isRussian
        ? "Подготовка аудио..."
        : "Yandex tayyorlanmoqda...",
    playing: isEnglish
      ? "Lesson in progress..."
      : isRussian
        ? "Урок идёт..."
        : "Dars o'tmoqda...",
    noLesson: isEnglish
      ? "No full lesson for this topic"
      : isRussian
        ? "Нет полного урока по этой теме"
        : "Ushbu mavzu haqida to'liq dars yo'q",
    aiWrite: isEnglish
      ? "✨ Write full lesson with AI"
      : isRussian
        ? "✨ Написать урок с AI"
        : "✨ AI orqali to'liq dars yozish",
    writing: isEnglish
      ? "⏳ Writing lesson (please wait)..."
      : isRussian
        ? "⏳ Пишу урок (подождите)..."
        : "⏳ Dars yozilmoqda (kutib turing)...",
    editBtn: isEnglish
      ? "✏️ Edit"
      : isRussian
        ? "✏️ Редактировать"
        : "✏️ Tahrirlash",
    writeBtn: isEnglish
      ? "✏️ Write manually"
      : isRussian
        ? "✏️ Написать вручную"
        : "✏️ Qo'lda yozish",
    deleteBtn: isEnglish
      ? "🗑 Delete"
      : isRussian
        ? "🗑 Удалить"
        : "🗑 O'chirish",
    submit: isEnglish ? "🎤 Submit" : isRussian ? "🎤 Сдать" : "🎤 Topshirish",
    aiSettings: isEnglish
      ? "✨ AI Settings"
      : isRussian
        ? "✨ Настройки AI"
        : "✨ AI Sozlamalari",
    steps: isEnglish
      ? ["Intro", "Video", "Lab", "AI Tutor", "Quiz", "Practice", "Homework"]
      : isRussian
        ? [
            "Введение",
            "Видео",
            "Лаб",
            "AI Учитель",
            "Тест",
            "Практика",
            "Домашнее задание",
          ]
        : ["Kirish", "Video", "Lab", "AI Ustoz", "Quiz", "Mashq", "Vazifa"],
    stepIcons: ["🎯", "🎬", "🔬", "🤖", "❓", "✍️", "📋"],
  };

  const [selectedTopicId, setSelectedTopicId] = useState(topics[0]?.id || 3);
  const [lessonStep, setLessonStep] = useState(0);

  const currentTopic = topics.find((t) => t.id === selectedTopicId);

  // Mavzu bo'yicha qaysi qadamlar (Kirish/Video/Lab/...) ko'rilganini saqlash —
  // lesson progress foizi shu real "ko'rilgan qadamlar" asosida hisoblanadi
  useEffect(() => {
    if (!fanId || !selectedTopicId) return;
    const key = `lesson_steps_${fanId}_${selectedTopicId}`;
    let visited = [];
    try {
      visited = JSON.parse(localStorage.getItem(key) || "[]");
    } catch (e) {}
    if (!visited.includes(lessonStep)) {
      visited = [...visited, lessonStep];
      storage.set(key, JSON.stringify(visited));
    }
  }, [fanId, selectedTopicId, lessonStep]);

  useEffect(() => {
    if (topics.length > 0) {
      setSelectedTopicId(topics[0].id);
      setLessonStep(0);
    }
  }, [fanId]);

  // ===== CLOUD SYNC — sahifa ochilganda API kalitlarni bulutdan yuklab olish =====
  useEffect(() => {
    const loadFromCloud = async () => {
      if (!storage.isConnected()) return;
      const [gKey, gModel, yKey, yFolder] = await Promise.all([
        storage.get("gemini_api_key"),
        storage.get("gemini_model"),
        storage.get("yandex_api_key"),
        storage.get("yandex_folder_id"),
      ]);
      if (gKey) setGeminiKey(gKey);
      if (gModel && gModel !== "gemini-2.5-flash") setGeminiModel(gModel);
      if (yKey) setApiKey(yKey);
      if (yFolder) setFolderId(yFolder);

      // Bulutdan barcha ma'lumotlarni (ma'ruzalar va sozlamalar) yuklab olish
      await storage.syncFromCloud();

      setVideoUpdate((v) => v + 1);
    };
    loadFromCloud();
  }, []);

  // ===== YANDEX SPEECHKIT TTS =====
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [audio, setAudio] = useState(null);

  // === Video Fon State ===
  const bgVideoRef = useRef(null);
  const [bgVideoUrl, setBgVideoUrl] = useState(null);
  const [isBgVideoMuted, setIsBgVideoMuted] = useState(true);

  // Mavzu o'zgarganda videoni localforage dan yuklash
  useEffect(() => {
    if (!currentTopic) return;
    localforage
      .getItem(`bgVideo_${fanId}_${currentTopic.id}`)
      .then((blob) => {
        if (blob) {
          setBgVideoUrl(URL.createObjectURL(blob));
        } else {
          setBgVideoUrl(null);
        }
      })
      .catch((err) => console.error("Video load error:", err));
  }, [currentTopic?.id]);

  // TTS bilan videoni sinxronizatsiya qilish
  useEffect(() => {
    if (bgVideoRef.current) {
      if (isPlaying && !isPaused) {
        bgVideoRef.current
          .play()
          .catch((e) => console.error("Video o'ynatishda xato:", e));
      } else {
        bgVideoRef.current.pause();
      }
    }
  }, [isPlaying, isPaused]);
  const [voice, setVoice] = useState("nigora");
  const [apiKey, setApiKey] = useState(
    localStorage.getItem("yandex_api_key") ||
      import.meta.env.VITE_YANDEX_API_KEY ||
      "AQVNyhenbfSm1y-yphnpClHRp3Pk-oYMYS2_3WCS",
  );
  const [folderId, setFolderId] = useState(
    localStorage.getItem("yandex_folder_id") ||
      import.meta.env.VITE_YANDEX_FOLDER_ID ||
      "b1g8kv6e0bjll0b1u2f5",
  );
  const [showSettings, setShowSettings] = useState(false);
  const [tempKey, setTempKey] = useState("");
  const [tempFolder, setTempFolder] = useState("");
  const [debugLogs, setDebugLogs] = useState([]);
  const [videoUpdate, setVideoUpdate] = useState(0);

  const [geminiKey, setGeminiKey] = useState(
    localStorage.getItem("gemini_api_key") || "",
  );
  const [showGeminiModal, setShowGeminiModal] = useState(false);
  const [tempGeminiKey, setTempGeminiKey] = useState("");
  // Avval saqlangan xato modelni (2.5) tozalash
  const savedModel = localStorage.getItem("gemini_model");
  const validModel =
    !savedModel || savedModel === "gemini-2.5-flash"
      ? "gemini-1.5-flash"
      : savedModel;
  const [geminiModel, setGeminiModel] = useState(validModel);
  const [isGeneratingText, setIsGeneratingText] = useState(false);
  const [isGeneratingLab, setIsGeneratingLab] = useState(false);

  // ===== QO'LDA QO'SHISH STATE'LARI =====
  const [showQuizEditor, setShowQuizEditor] = useState(false);
  const [newQ, setNewQ] = useState({
    q: "",
    opts: ["", "", "", ""],
    correct: 0,
  });
  const [quizVariants, setQuizVariants] = useState([]);
  const [selectedQuizVariantId, setSelectedQuizVariantId] = useState("default");
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [quizPrompt, setQuizPrompt] = useState("");
  const [quizCount, setQuizCount] = useState(5);
  const [showPracticeEditor, setShowPracticeEditor] = useState(false);
  const [newPractice, setNewPractice] = useState({
    level: "Oson",
    text: "",
    answer: "",
  });
  const [showHwEditor, setShowHwEditor] = useState(false);
  const [newHw, setNewHw] = useState({ text: "", deadline: "2 kun" });

  useEffect(() => {
    if (!currentTopic) return;
    const savedVariants =
      JSON.parse(
        localStorage.getItem(`quiz_variants_${fanId}_${currentTopic.id}`) || "null",
      ) || [];
    setQuizVariants(savedVariants);
    setSelectedQuizVariantId("default");
    setQuizPrompt("");
  }, [currentTopic?.id]);

  // ===== TO'LIQ EKRAN LAB MODAL =====
  const [labFullscreen, setLabFullscreen] = useState(false);
  const [showTopshirish, setShowTopshirish] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [introData, setIntroData] = useState({
    name: "",
    chorak: "",
    labHtml: null,
  });

  const addLog = (msg) =>
    setDebugLogs((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()} - ${msg}`,
    ]);

  const saveSettings = () => {
    if (tempKey) {
      storage.set("yandex_api_key", tempKey);
      setApiKey(tempKey);
    }
    if (tempFolder) {
      storage.set("yandex_folder_id", tempFolder);
      setFolderId(tempFolder);
    }
    setShowSettings(false);
  };

  const saveGeminiSettings = () => {
    if (tempGeminiKey) {
      storage.set("gemini_api_key", tempGeminiKey);
      setGeminiKey(tempGeminiKey);
    }
    storage.set("gemini_model", geminiModel);
    setShowGeminiModal(false);
  };

  // Universal Gemini chaqiruvi (agar tanlangan model ishlamasa, boshqasini sinab ko'radi)
  const callGeminiWithFallback = async (prompt) => {
    const modelToTry = geminiModel.trim();
    const isGroq = geminiKey.trim().startsWith("gsk_");
    const isOpenRouter = geminiKey.trim().startsWith("sk-or-");

    if (isGroq || isOpenRouter) {
      const endpoint = isGroq
        ? "https://api.groq.com/openai/v1/chat/completions"
        : "https://openrouter.ai/api/v1/chat/completions";
      try {
        const resp = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${geminiKey.trim()}`,
          },
          body: JSON.stringify({
            model: modelToTry,
            messages: [{ role: "user", content: prompt }],
          }),
        });
        const data = await resp.json();
        if (data.error) {
          const errMsg = data.error.message || JSON.stringify(data.error);
          throw new Error(errMsg);
        }
        if (!data.choices?.[0]?.message?.content) {
          throw new Error("AI bo'sh javob qaytardi");
        }
        return data.choices[0].message.content;
      } catch (e) {
        throw new Error(`AI Xatosi: ${e.message}`);
      }
    }

    // Default Gemini fallback logic
    const fallbacks = [
      "gemini-1.5-flash-latest",
      "gemini-1.5-flash",
      "gemini-pro",
      "gemini-2.0-flash",
    ];

    // Tanlangan modelni birinchi o'ringa qo'yish
    const uniqueModels = [...new Set([modelToTry, ...fallbacks])];
    let lastErr = "";

    for (const m of uniqueModels) {
      try {
        const resp = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${geminiKey.trim()}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
          },
        );
        const data = await resp.json();

        if (data.error) {
          const errMsg = data.error.message.toLowerCase();
          lastErr = `Model ${m} xatosi: ${data.error.message}`;

          if (
            errMsg.includes("quota") ||
            errMsg.includes("limit") ||
            errMsg.includes("not found") ||
            errMsg.includes("not supported")
          )
            continue;

          const maskedKey = geminiKey
            ? geminiKey.substring(0, 5) + "..."
            : "yo'q";
          throw new Error(
            `API kalit xatosi (Kalit: ${maskedKey}). Asl xato: ${data.error.message}`,
          );
        }

        if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
          lastErr = `Model ${m} bo'sh javob qaytardi.`;
          continue;
        }

        return data.candidates[0].content.parts[0].text;
      } catch (e) {
        lastErr = e.message;
        const errMsg = e.message.toLowerCase();
        if (
          errMsg.includes("quota") ||
          errMsg.includes("limit") ||
          errMsg.includes("not found") ||
          errMsg.includes("not supported") ||
          errMsg.includes("fetch")
        )
          continue;
        throw e;
      }
    }
    const maskedKey = geminiKey ? geminiKey.substring(0, 5) + "..." : "yo'q";
    throw new Error(
      `Barcha modellar rad etildi (Limit tugagan bo'lishi mumkin). Kalit: ${maskedKey}. Oxirgi xato: ${lastErr}`,
    );
  };

  const generateGeminiLecture = async () => {
    if (!geminiKey) {
      setShowGeminiModal(true);
      setTempGeminiKey(geminiKey);
      return;
    }
    try {
      setIsGeneratingText(true);
      addLog(`Gemini orqali ma'ruza yozilmoqda (avtomatik model tanlash)...`);

      const systemPrompt = isEnglish
        ? "You are an experienced and engaging English language teacher. Explain topics clearly and with examples."
        : isRussian
          ? "Вы опытный и интересный учитель. Объясняйте темы понятно и с примерами на русском языке."
          : "Sen O'zbekistondagi eng tajribali va qiziqarli maktab o'qituvchisisan. Fanni o'quvchilarga judayam tushunarli tilda tushuntirib berasan.";
      const prompt = isEnglish
        ? `${systemPrompt}\n\nTask: Topic: "${currentTopic.name}". Subject: "${fan?.name || "English"}". Write a detailed 10-minute lesson (800-1000 words) so students can fully understand this topic from scratch. Include rules, real-life examples, and clear conclusions. Write in clean English. Do not use markdown (* or #).`
        : isRussian
          ? `${systemPrompt}\n\nЗадание: Тема: "${currentTopic.name}". Предмет: "${fan?.name || "Русский"}". Напишите подробный 10-минутный урок (800-1000 слов), чтобы ученики полностью поняли эту тему с нуля. Включите правила, примеры из жизни и чёткие выводы. Пишите на чистом русском языке. Не используйте markdown (* или #).`
          : `${systemPrompt}\n\nTopshiriq: Mavzu: "${currentTopic.name}". Fan: "${fan?.name || "Umumiy"}". O'quvchilar ushbu mavzuni noldan boshlab to'liq tushunib olishlari uchun, batafsil 10 daqiqalik o'quv ma'ruzasi yozib ber (taxminan 800-1000 so'z). Matnda qoidalar, hayotiy misollar va aniq xulosalar bo'lsin. Matn toza va xatosiz o'zbek tilida yozilsin. Hech qanday markdown (* yoki #) ishlatma, matn oddiy va tushunarli bo'lsin.`;

      const generatedText = await callGeminiWithFallback(prompt);
      storage.set(`lecture_${fanId}_${currentTopic.id}`, generatedText);
      setVideoUpdate((v) => v + 1);
      addLog("Ma'ruza tayyor!");
    } catch (e) {
      addLog("Gemini XATOSI: " + e.message);
      alert("Xatolik: " + e.message);
    } finally {
      setIsGeneratingText(false);
    }
  };

  const generateGeminiLab = async () => {
    if (!geminiKey) {
      setShowGeminiModal(true);
      setTempGeminiKey(geminiKey);
      return;
    }
    try {
      setIsGeneratingLab(true);
      addLog(`Gemini orqali laboratoriya tushuntirishi va harakatlari yozilmoqda...`);

      const systemPrompt =
        "Sen O'zbekistondagi eng tajribali va qiziqarli maktab o'qituvchisisan.";
      const prompt = `${systemPrompt}

Topshiriq: Mavzu: "${currentTopic.name}". Fan: "${fan?.name || "Umumiy"}".
Ushbu mavzudagi vizual laboratoriya ishida o'quvchi nima qilishi kerakligini tushuntiruvchi dars yozing.
Javobni faqat va faqat quyidagi JSON formatida qaytaring (hech qanday markdown, \`\`\`json bloklari va izohlarsiz, faqat toza JSON matni):
{
  "explanation": "Nigora ovozida o'qiladigan 3-5 jumlali toza o'zbek tilidagi tushuntirish matni.",
  "actions": [
    { "time": 2.0, "cmd": "HIGHLIGHT", "target": "Kuzatish" },
    { "time": 5.0, "cmd": "CLICK", "target": "Tajriba" }
  ]
}
Izoh: 'actions' massividagi 'time' (sekundda) ovozning tegishli qismiga mos bo'lsin. 'target' esa ekrandagi qaysi kalit so'zni/tugmani ta'kidlash (HIGHLIGHT) yoki bosish (CLICK) kerakligini belgilaydi.`;

      const generatedText = await callGeminiWithFallback(prompt);
      
      let finalData = "";
      try {
        const cleaned = generatedText.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleaned);
        if (parsed.explanation) {
          finalData = JSON.stringify({
            explanation: parsed.explanation,
            actions: parsed.actions || []
          });
        } else {
          finalData = JSON.stringify({ explanation: generatedText, actions: [] });
        }
      } catch (err) {
        finalData = JSON.stringify({ explanation: generatedText, actions: [] });
      }

      storage.set(`lab_${fanId}_${currentTopic.id}`, finalData);
      setVideoUpdate((v) => v + 1);
    } catch (e) {
      addLog("Gemini Lab XATOSI: " + e.message);
      alert("Xatolik: " + e.message);
    } finally {
      setIsGeneratingLab(false);
    }
  };

  const splitText = (text) => {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const chunks = [];
    let cur = "";
    sentences.forEach((s) => {
      if (s.length > 200) {
        const words = s.split(" ");
        let sub = "";
        words.forEach((w) => {
          if ((sub + w).length < 180) {
            sub += " " + w;
          } else {
            chunks.push(sub.trim());
            sub = w;
          }
        });
        if (sub) cur = sub;
      } else if ((cur + s).length < 220) {
        cur += " " + s;
      } else {
        if (cur) chunks.push(cur.trim());
        cur = s;
      }
    });
    if (cur) chunks.push(cur.trim());
    return chunks.filter((c) => c.length > 1);
  };

  const parseAIQuizResponse = (text) => {
    const normalize = (item) => {
      if (!item || typeof item !== "object") return null;
      const question = (
        item.q ||
        item.question ||
        item.savol ||
        item.text ||
        ""
      )
        .toString()
        .trim();
      const opts = Array.isArray(item.opts)
        ? item.opts
        : Array.isArray(item.options)
          ? item.options
          : [];
      const correctRaw =
        item.correct ?? item.answer ?? item.correct_answer ?? item.true ?? null;
      const correctIndex = Number.isInteger(correctRaw)
        ? correctRaw
        : typeof correctRaw === "string"
          ? correctRaw.trim().toUpperCase().charCodeAt(0) - 65
          : null;
      if (
        !question ||
        !Array.isArray(opts) ||
        opts.length < 2 ||
        correctIndex === null ||
        correctIndex < 0 ||
        correctIndex >= opts.length
      )
        return null;
      return {
        q: question,
        opts: opts.map((o) => o?.toString?.() ?? ""),
        correct: correctIndex,
      };
    };

    const tryParse = (raw) => {
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    };

    let parsed = null;
    const arrayMatch = text.match(/\[[\s\S]*\]/m);
    if (arrayMatch) parsed = tryParse(arrayMatch[0]);
    if (!parsed) {
      const objectMatch = text.match(/\{[\s\S]*\}/m);
      parsed = objectMatch ? tryParse(objectMatch[0]) : null;
    }
    if (!parsed) parsed = tryParse(text);
    if (!Array.isArray(parsed) && parsed?.questions) parsed = parsed.questions;
    if (!Array.isArray(parsed)) return [];

    return parsed.map(normalize).filter(Boolean);
  };

  const addQuizVariant = (name, questions) => {
    if (!currentTopic) return;
    const variant = {
      id: `variant_${Date.now()}`,
      name,
      questions,
      createdAt: new Date().toISOString(),
    };
    const updated = [variant, ...quizVariants];
    setQuizVariants(updated);
    storage.set(
      `quiz_variants_${fanId}_${currentTopic.id}`,
      JSON.stringify(updated),
    );
    setSelectedQuizVariantId(variant.id);
  };

  const generateGeminiQuiz = async () => {
    if (!geminiKey) {
      setShowGeminiModal(true);
      setTempGeminiKey(geminiKey);
      return;
    }
    try {
      setIsGeneratingQuiz(true);
      addLog("AI test yaratilmoqda...");
      const prompt = isEnglish
        ? `You are an experienced English teacher. Create 5 multiple-choice quiz questions for the topic \"${currentTopic?.name}\" and subject \"${fan?.name || "English"}\". Return only JSON array with items {\"q\": string, \"opts\": [string,string,string,string], \"correct\": index}. Do not add any extra text.`
        : isRussian
          ? `Вы опытный преподаватель. Создайте 5 вариантов с выбором ответа по теме \"${currentTopic?.name}\" и предмету \"${fan?.name || "Русский"}\". Верните только JSON-массив с полями {\"q\": string, \"opts\": [string,string,string,string], \"correct\": index}. Никакого лишнего текста.`
          : `Sen o'qituvchisan. "${currentTopic?.name}" mavzusi uchun 5 ta 4 variantli test savolini yarating. Faqat quyidagi JSON massividagina javob bering: [{"q":"...", "opts":["...","...","...","..."], "correct":0}]. Hech qanday izoh yozma.`;
      let finalPrompt = (prompt || "").replace(
        /Create\s+\d+\s+multiple-choice/i,
        `Create ${quizCount} multiple-choice`,
      );
      finalPrompt = finalPrompt.replace(
        /Создайте\s+\d+\s+вариант/i,
        `Создайте ${quizCount} вариантов`,
      );
      finalPrompt = finalPrompt.replace(
        /\d+\s+ta\s+4\s+variantli/i,
        `${quizCount} ta 4 variantli`,
      );
      const response = await callGeminiWithFallback(finalPrompt);
      const questions = parseAIQuizResponse(response);
      if (!questions.length)
        throw new Error(
          "AI testlarni yuklay olmadi. Iltimos, so'rovni tekshiring.",
        );
      addQuizVariant(`AI variant ${quizVariants.length + 1}`, questions);
      addLog(`AI variant yaratildi: ${questions.length} savol.`);
      alert(`AI test yaratilidi. Variantlar ro'yxatida ko'rishingiz mumkin.`);
    } catch (e) {
      addLog("AI quiz xatosi: " + e.message);
      alert("Xatolik: " + e.message);
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  // Fan tiliga qarab ovoz tanlash
  const getFanLang = () => {
    if (fanId === "ingliz") return "en-US";
    if (fanId === "rus") return "ru-RU";
    return "uz-UZ";
  };

  // Web Speech API — ingliz va rus tili uchun (bepul, brauzerda)
  const speakWithBrowser = (text, lang) => {
    if (!window.speechSynthesis) return false;
    window.speechSynthesis.cancel();
    if (isPlaying) {
      setIsPlaying(false);
      return true;
    }

    const doSpeak = () => {
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = lang;
      utter.rate = 0.85;
      utter.pitch = 1;
      utter.volume = 1;

      // Eng yaxshi ovozni tanlash
      const voices = window.speechSynthesis.getVoices();
      const preferred =
        voices.find((v) => v.lang === lang && v.localService) ||
        voices.find(
          (v) => v.lang.startsWith(lang.split("-")[0]) && v.localService,
        ) ||
        voices.find((v) => v.lang === lang) ||
        voices.find((v) => v.lang.startsWith(lang.split("-")[0]));
      if (preferred) utter.voice = preferred;

      utter.onstart = () => setIsPlaying(true);
      utter.onend = () => setIsPlaying(false);
      utter.onerror = (e) => {
        console.log("Speech error:", e);
        setIsPlaying(false);
      };

      window.speechSynthesis.speak(utter);
      setIsPlaying(true);
    };

    // Ovozlar yuklanishini kutish
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      doSpeak();
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.onvoiceschanged = null;
        doSpeak();
      };
      // Fallback: 500ms dan keyin baribir gapir
      setTimeout(doSpeak, 500);
    }
    return true;
  };

  const handlePauseResume = () => {
    if (!isPlaying) return;
    const detectedLang = getFanLang();
    if (detectedLang === "en-US" || detectedLang === "ru-RU") {
      if (window.speechSynthesis) {
        if (isPaused) {
          window.speechSynthesis.resume();
          setIsPaused(false);
        } else {
          window.speechSynthesis.pause();
          setIsPaused(true);
        }
      }
    } else {
      if (audio) {
        if (audio.paused) {
          audio.play().catch((e) => console.error("Audio resume error:", e));
          setIsPaused(false);
        } else {
          audio.pause();
          setIsPaused(true);
        }
      }
    }
  };

  // Probel (Space) orqali pauza/davom etish
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        e.code === "Space" &&
        e.target.tagName !== "INPUT" &&
        e.target.tagName !== "TEXTAREA" &&
        isPlaying
      ) {
        e.preventDefault();
        handlePauseResume();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, isPaused, audio]);

  const toggleYandexSpeech = async (
    fullText,
    voiceOverride = "nigora",
    langOverride = null,
  ) => {
    const detectedLang = langOverride || getFanLang();

    // Ingliz yoki Rus tili uchun — Web Speech API (bepul)
    if (detectedLang === "en-US" || detectedLang === "ru-RU") {
      if (isPlaying) {
        window.speechSynthesis?.cancel();
        setIsPlaying(false);
        setIsPaused(false);
        return;
      }
      speakWithBrowser(fullText, detectedLang);
      return;
    }

    // O'zbek tili uchun — Yandex TTS
    if (isPlaying && audio) {
      audio.pause();
      setIsPlaying(false);
      setIsPaused(false);
      return;
    }
    if (!fullText) return;
    if (!apiKey) {
      setShowSettings(true);
      setTempKey("");
      setTempFolder(folderId);
      return;
    }

    const chunks = splitText(fullText);
    let index = 0;

    const playNext = async () => {
      if (index >= chunks.length) {
        setIsPlaying(false);
        setIsGenerating(false);
        return;
      }
      try {
        setIsGenerating(true);
        addLog(`Requesting chunk ${index + 1}...`);
        const formData = new URLSearchParams();
        formData.append("text", chunks[index]);
        formData.append("lang", langOverride);
        formData.append("voice", voiceOverride);
        formData.append("folderId", folderId);
        formData.append("format", "mp3");

        addLog(`Yandex v1 API ga so'rov yuborilmoqda (${voiceOverride})...`);
        const ttsUrl =
          window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1"
            ? "/yandex-api/speech/v1/tts:synthesize"
            : "/.netlify/functions/tts";
        const r = await fetch(ttsUrl, {
          method: "POST",
          headers: { Authorization: `Api-Key ${apiKey}` },
          body: formData,
        });

        if (!r.ok) {
          const errText = await r.text();
          console.error("Yandex API Xatosi (RAW):", errText);
          // if (r.status === 401 || r.status === 403) { setShowSettings(true); setTempKey(apiKey); setTempFolder(folderId); }
          throw new Error(`API xato: ${r.status}\nSabab: ${errText}`);
        }

        const blob = await r.blob();
        if (!blob.type.includes("audio") && !blob.type.includes("octet")) {
          const errBlob = await blob.text();
          console.error("Yandex API Xatosi (Blob format emas):", errBlob);
          // setShowSettings(true); setTempKey(apiKey); setTempFolder(folderId);
          setIsPlaying(false);
          setIsGenerating(false);
          return;
        }

        const url = URL.createObjectURL(blob);
        const newAudio = new Audio(url);
        setAudio(newAudio);
        addLog(`Playing chunk ${index + 1}...`);

        let sentActions = new Set();
        newAudio.ontimeupdate = () => {
          const currentTime = newAudio.currentTime;
          
          let actionsToRun = [];
          const isPractice = lessonStep === 5;
          const topicId = labFullscreen ? selectedTopicId : currentTopic?.id;
          
          if (!isPractice && topicId) {
            const rawLab = localStorage.getItem(`lab_${fanId}_${topicId}`);
            if (rawLab) {
              try {
                const parsed = JSON.parse(rawLab);
                if (parsed && typeof parsed === "object" && parsed.actions) {
                  actionsToRun = parsed.actions;
                }
              } catch (e) {
                // Ignore parsing errors
              }
            }
          }

          if (actionsToRun && actionsToRun.length > 0) {
            actionsToRun.forEach((act) => {
              if (currentTime >= act.time && !sentActions.has(act.time + "_" + act.target)) {
                sentActions.add(act.time + "_" + act.target);
                const iframeElement = labFullscreen
                  ? document.getElementById("fullscreen-lab-container")?.querySelector("iframe")
                  : document.querySelector("iframe[title='Lab Preview']");
                if (iframeElement && iframeElement.contentWindow) {
                  console.log("React sending AI command to iframe:", act);
                  iframeElement.contentWindow.postMessage({
                    type: "AI_COMMAND",
                    cmd: act.cmd,
                    target: act.target
                  }, "*");
                }
              }
            });
          }
        };

        newAudio.play().catch((e) => addLog(`Play blocklangan: ${e.message}`));
        setIsPlaying(true);
        setIsGenerating(false);
        setIsPaused(false);
        newAudio.onended = () => {
          index++;
          playNext();
        };
      } catch (e) {
        addLog(`XATOLIK: ${e.message}`);
        setIsPlaying(false);
        setIsGenerating(false);
      }
    };
    playNext();
  };

  useEffect(() => {
    return () => {
      if (audio) audio.pause();
    };
  }, [audio]);

  // ===== AVTOMATIK NIGORA OVOZI — Dars ochilganda ma'ruzani o'qib beradi =====
  const [autoPlayDone, setAutoPlayDone] = useState(new Set());

  // Mavzu o'zgarganda 3D Intro ko'rsatish
  useEffect(() => {
    if (!currentTopic) return;

    // Intro ma'lumotlarini tayyorlash
    const chorak =
      currentTopic.id >= 70053
        ? "IV CHORAK"
        : currentTopic.id >= 70033
          ? "III CHORAK"
          : currentTopic.id >= 70019
            ? "II CHORAK"
            : "I CHORAK";

    // Maxsus HTML lab borligini tekshirish
    const labHtml = localStorage.getItem(`lab_html_${fanId}_${currentTopic.id}`);

    setIntroData({ name: currentTopic.name, chorak, labHtml });
    // setShowIntro(true); // Avtomatik ochilish o'chirildi (foydalanuvchi so'roviga binoan)

    // Ovozni to'xtatish (agar oldingisi o'qiyotgan bo'lsa)
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (audio) audio.pause();
    setIsPlaying(false);
  }, [selectedTopicId]);

  const startLecture = () => {
    setShowIntro(false);
    const lecture =
      localStorage.getItem(`lecture_${fanId}_${currentTopic.id}`) ||
      currentTopic.lectureText ||
      currentTopic.aiIntro;
    if (lecture && !isPlaying && !isGenerating) {
      setAutoPlayDone((prev) => new Set(prev).add(currentTopic.id));
      toggleYandexSpeech(lecture);
      addLog("3D Intro tugadi — Nigora darsni boshladi...");
    }
  };

  const renderStepContent = () => {
    if (!currentTopic) return <div>Mavzu topilmadi.</div>;

    switch (lessonStep) {
      case 0: // KIRISH
        // Avval localStorage dan tekshiramiz (u yerga syncFromCloud orqali tushgan bo'ladi)
        const currentLecture = localStorage.getItem(
          `lecture_${fanId}_${currentTopic.id}`,
        );
        const displayIntro = currentLecture || currentTopic.lectureText || currentTopic.aiIntro;

        return (
          <div style={{ animation: "fadeInUp 0.4s ease" }}>
            <div
              style={{
                background: isPlaying
                  ? "linear-gradient(135deg, #EFF6FF 0%, #F0FDF4 100%)"
                  : "var(--bg)",
                borderRadius: 20,
                padding: 24,
                marginBottom: 24,
                display: "flex",
                alignItems: "center",
                gap: 24,
                border: isPlaying ? "2px solid #2563EB" : "1px solid #E2E8F0",
                boxShadow: isPlaying
                  ? "0 0 20px rgba(37,99,235,0.1)"
                  : "0 1px 3px rgba(0,0,0,0.04)",
                position: "relative",
              }}
            >
              {/* Ovoz tanlash */}
              <div
                style={{
                  position: "absolute",
                  top: 12,
                  right: 20,
                  display: "flex",
                  gap: 8,
                }}
              >
                <select
                  value="nigora"
                  disabled
                  style={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    color: "#2563EB",
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "4px 8px",
                    borderRadius: 6,
                    cursor: "not-allowed",
                  }}
                >
                  <option value="nigora">{ui.voiceLabel}</option>
                </select>
              </div>

              <button
                onClick={() => {
                  const container = document.getElementById(
                    "video-fullscreen-container",
                  );
                  if (!isPlaying && container) {
                    if (container.requestFullscreen) {
                      container
                        .requestFullscreen()
                        .catch((e) => console.log(e));
                    }
                  } else if (isPlaying && document.fullscreenElement) {
                    if (document.exitFullscreen) {
                      document.exitFullscreen().catch((e) => console.log(e));
                    }
                  }
                  toggleYandexSpeech(displayIntro);
                }}
                disabled={isGenerating || isGeneratingText}
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 20,
                  background: isPlaying ? "#DC2626" : "#2563EB",
                  color: "white",
                  border: "none",
                  cursor: isGenerating ? "wait" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                  transition: "all 0.3s",
                  flexShrink: 0,
                  boxShadow: "0 4px 12px rgba(37,99,235,0.25)",
                }}
              >
                {isGenerating ? "⏳" : isPlaying ? "⏹️" : "▶️"}
              </button>

              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "var(--text)",
                    marginBottom: 8,
                  }}
                >
                  {isGenerating
                    ? ui.preparing
                    : isPlaying
                      ? ui.playing
                      : ui.listenLecture}
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 4,
                    height: 20,
                    alignItems: "flex-end",
                  }}
                >
                  {[...Array(20)].map((_, i) => (
                    <div
                      key={i}
                      style={{
                        width: 4,
                        background: "#2563EB",
                        borderRadius: 2,
                        height: isPlaying
                          ? `${20 + Math.random() * 80}%`
                          : "15%",
                        transition: "height 0.15s",
                        opacity: isPlaying ? 0.8 : 0.2,
                        animation: isPlaying
                          ? `soundWave 0.6s infinite alternate ${i * 0.05}s`
                          : "none",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* FON VIDEOSI */}
            {bgVideoUrl && (
              <div
                id="video-fullscreen-container"
                style={
                  isPlaying
                    ? {
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        width: "100vw",
                        height: "100vh",
                        zIndex: 9999,
                        background: "#000",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }
                    : {
                        position: "relative",
                        width: "100%",
                        marginBottom: 24,
                        borderRadius: 20,
                        overflow: "hidden",
                        background: "#000",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                      }
                }
              >
                <video
                  ref={bgVideoRef}
                  src={bgVideoUrl}
                  style={
                    isPlaying
                      ? {
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }
                      : {
                          width: "100%",
                          maxHeight: "500px",
                          objectFit: "cover",
                          display: "block",
                        }
                  }
                  muted={isBgVideoMuted}
                  loop
                  playsInline
                />

                {/* To'liq ekranda o'qishni to'xtatish va pauza tugmalari */}
                {isPlaying && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePauseResume();
                      }}
                      style={{
                        position: "absolute",
                        top: 40,
                        right: 130,
                        width: 70,
                        height: 70,
                        borderRadius: 35,
                        background: "rgba(37,99,235,0.8)",
                        color: "white",
                        border: "2px solid rgba(255,255,255,0.4)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 32,
                        cursor: "pointer",
                        zIndex: 10000,
                        backdropFilter: "blur(10px)",
                        transition: "all 0.2s",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.transform = "scale(1.1)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.transform = "scale(1)")
                      }
                      title="Pauza / Davom etish (Space)"
                    >
                      {isPaused ? "▶️" : "⏸️"}
                    </button>

                    <button
                      onClick={() => {
                        if (
                          document.fullscreenElement &&
                          document.exitFullscreen
                        ) {
                          document
                            .exitFullscreen()
                            .catch((e) => console.log(e));
                        }
                        toggleYandexSpeech(displayIntro);
                      }}
                      style={{
                        position: "absolute",
                        top: 40,
                        right: 40,
                        width: 70,
                        height: 70,
                        borderRadius: 35,
                        background: "rgba(220,38,38,0.8)",
                        color: "white",
                        border: "2px solid rgba(255,255,255,0.4)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 32,
                        cursor: "pointer",
                        zIndex: 10000,
                        backdropFilter: "blur(10px)",
                        transition: "all 0.2s",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.transform = "scale(1.1)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.transform = "scale(1)")
                      }
                      title="O'qishni to'xtatish"
                    >
                      ⏹️
                    </button>
                  </>
                )}
                <button
                  onClick={() => setIsBgVideoMuted(!isBgVideoMuted)}
                  style={{
                    position: "absolute",
                    bottom: 16,
                    right: 16,
                    background: "rgba(0,0,0,0.6)",
                    color: "white",
                    border: "1px solid rgba(255,255,255,0.2)",
                    padding: "8px 12px",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontWeight: 600,
                    backdropFilter: "blur(4px)",
                    transition: "all 0.2s",
                  }}
                >
                  {isBgVideoMuted ? "🔇 Ovozni yoqish" : "🔊 Ovozni o'chirish"}
                </button>
                <button
                  onClick={() => {
                    localforage.removeItem(`bgVideo_${fanId}_${currentTopic.id}`);
                    setBgVideoUrl(null);
                  }}
                  style={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    background: "rgba(239,68,68,0.8)",
                    color: "white",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  🗑 Videoni o'chirish
                </button>
              </div>
            )}

            {/* MATN */}
            <div
              style={{
                background: "var(--card)",
                padding: 32,
                borderRadius: 20,
                border: "1px solid var(--border)",
                maxHeight: 550,
                overflowY: "auto",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              {/* Qo'lda yozish / tahrirlash tugmasi */}
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  marginBottom: 16,
                  justifyContent: "flex-end",
                  flexWrap: "wrap",
                }}
              >
                {currentLecture && (
                  <button
                    onClick={() => {
                      storage.remove(`lecture_${fanId}_${currentTopic.id}`);
                      setVideoUpdate((v) => v + 1);
                    }}
                    style={{
                      fontSize: 12,
                      color: "#EF4444",
                      background: "rgba(239,68,68,0.08)",
                      border: "none",
                      padding: "4px 10px",
                      borderRadius: 6,
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    🗑 O'chirish
                  </button>
                )}
                {/* Fon video yuklash */}
                <input
                  type="file"
                  id={`bgVideoUpload_${currentTopic.id}`}
                  accept="video/*"
                  style={{ display: "none" }}
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    try {
                      await localforage.setItem(
                        `bgVideo_${fanId}_${currentTopic.id}`,
                        file,
                      );
                      setBgVideoUrl(URL.createObjectURL(file));
                      addLog(`Video fon yuklandi: ${file.name}`);
                    } catch (err) {
                      console.error("Video yuklash xatosi:", err);
                      alert("Videoni saqlashda xatolik: " + err.message);
                    }
                    e.target.value = "";
                  }}
                />
                <button
                  onClick={() =>
                    document
                      .getElementById(`bgVideoUpload_${currentTopic.id}`)
                      .click()
                  }
                  style={{
                    fontSize: 12,
                    color: "#9333EA",
                    background: "rgba(147,51,234,0.08)",
                    border: "none",
                    padding: "4px 10px",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  🎬 Video yuklash
                </button>
                {/* Word fayl yuklash */}
                <input
                  type="file"
                  id={`wordUpload_${currentTopic.id}`}
                  accept=".docx,.doc"
                  style={{ display: "none" }}
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    try {
                      const arrayBuffer = await file.arrayBuffer();
                      const result = await mammoth.extractRawText({
                        arrayBuffer,
                      });
                      const text = result.value.trim();
                      if (text) {
                        storage.set(`lecture_${fanId}_${currentTopic.id}`, text);
                        setVideoUpdate((v) => v + 1);
                        addLog(`Word fayldan ma'ruza yuklandi: ${file.name}`);
                      } else {
                        alert("Word faylda matn topilmadi!");
                      }
                    } catch (err) {
                      console.error("Word o'qish xatosi:", err);
                      alert("Word faylni o'qishda xatolik: " + err.message);
                    }
                    e.target.value = "";
                  }}
                />
                <button
                  onClick={() =>
                    document
                      .getElementById(`wordUpload_${currentTopic.id}`)
                      .click()
                  }
                  style={{
                    fontSize: 12,
                    color: "#2563EB",
                    background: "rgba(37,99,235,0.08)",
                    border: "none",
                    padding: "4px 10px",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  📄 Word yuklash
                </button>
                <button
                  onClick={() => {
                    const text = prompt(
                      isEnglish
                        ? "Enter lecture text:"
                        : isRussian
                          ? "Введите текст лекции:"
                          : "Ma'ruza matnini kiriting:",
                      currentLecture || currentTopic.lectureText || currentTopic.aiIntro || "",
                    );
                    if (text !== null && text.trim()) {
                      storage.set(`lecture_${fanId}_${currentTopic.id}`, text.trim());
                      setVideoUpdate((v) => v + 1);
                    }
                  }}
                  style={{
                    fontSize: 12,
                    color: "#2563EB",
                    background: "rgba(37,99,235,0.08)",
                    border: "none",
                    padding: "4px 10px",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  {currentLecture ? ui.editBtn : ui.writeBtn}
                </button>
              </div>

              {!currentLecture && (
                <div
                  style={{
                    textAlign: "center",
                    marginBottom: 32,
                    padding: 24,
                    background:
                      "linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%)",
                    borderRadius: 16,
                    border: "2px dashed #34D399",
                  }}
                >
                  <div style={{ fontSize: 24, marginBottom: 12 }}>🧠</div>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 800,
                      color: "#065F46",
                      marginBottom: 8,
                    }}
                  >
                    {ui.noLesson}
                  </div>
                  <div
                    style={{
                      fontSize: 15,
                      color: "#047857",
                      marginBottom: 20,
                      maxWidth: 450,
                      margin: "0 auto 20px auto",
                      lineHeight: 1.5,
                    }}
                  >
                    {isEnglish
                      ? "Use AI (Groq or Gemini) to write a full 10-minute lesson (1000 words) for this topic."
                      : isRussian
                        ? "Используйте AI (Groq или Gemini) для написания полного 10-минутного урока (1000 слов)."
                        : "Sun'iy intellekt (Groq yoki Gemini) orqali ushbu mavzuni bolalar tushunadigan qilib 10 daqiqalik dars (1000 so'z) qilib yozdirishingiz mumkin."}
                  </div>
                  <button
                    onClick={generateGeminiLecture}
                    disabled={isGeneratingText}
                    style={{
                      background: "#10B981",
                      color: "white",
                      border: "none",
                      padding: "12px 28px",
                      borderRadius: 12,
                      fontWeight: 700,
                      fontSize: 15,
                      cursor: isGeneratingText ? "wait" : "pointer",
                      boxShadow: "0 4px 12px rgba(16,185,129,0.2)",
                    }}
                  >
                    {isGeneratingText ? ui.writing : ui.aiWrite}
                  </button>
                </div>
              )}

              {currentTopic.hook && (
                <div
                  style={{
                    ...ls.infoBox,
                    marginBottom: 24,
                    fontSize: 18,
                    fontWeight: 600,
                    fontStyle: "italic",
                    borderLeftWidth: 4,
                    borderLeftStyle: "solid",
                    borderLeftColor: "#2563EB",
                  }}
                >
                  "{currentTopic.hook}"
                </div>
              )}

              <div
                style={{
                  fontSize: 16,
                  color: "#334155",
                  lineHeight: 1.9,
                  fontFamily: "'Outfit'",
                  textAlign: "justify",
                  whiteSpace: "pre-line",
                }}
              >
                {displayIntro}
              </div>
            </div>
          </div>
        );

      case 1: // VIDEO — YouTube qidiruv
        const localVideoUrl = localStorage.getItem(`video_${fanId}_${currentTopic.id}`);
        const defaultVideoUrl = currentTopic.videoUrl;

        const getEmbedUrl = (input) => {
          if (!input) return null;
          if (input.includes("youtube.com") || input.includes("youtu.be")) {
            let videoId = "";
            if (input.includes("youtu.be/"))
              videoId = input.split("youtu.be/")[1]?.split("?")[0];
            else if (input.includes("v="))
              videoId = input.split("v=")[1]?.split("&")[0];
            else if (input.includes("embed/"))
              videoId = input.split("embed/")[1]?.split("?")[0];
            if (videoId) {
              return `https://www.youtube.com/embed/${videoId}`;
            }
          }
          return null;
        };

        const teacherEmbedUrl = getEmbedUrl(currentTopic.videoQuery);
        const searchWord = currentTopic.videoQuery && !currentTopic.videoQuery.startsWith("http")
          ? currentTopic.videoQuery
          : currentTopic.name;

        // Bloklangan (ishlamaydigan) videolarni aniqlash
        const isBlocked = (url) =>
          !url ||
          [
            "jZ_y9N5Y9Uo",
            "nv366V6S7zI",
            "_O_Zay0vQk0",
            "5U9uP6on7X8",
            "By-ggTfv6_8",
            "mvK0UzFNw1Q",
            "58S28j5y4q8",
            "JGO_zDWmkvk",
          ].some((id) => url.includes(id));

        const activeVideoUrl =
          localVideoUrl ||
          teacherEmbedUrl ||
          (!isBlocked(defaultVideoUrl) ? defaultVideoUrl : null);

        const handleSaveVideo = (e) => {
          e.preventDefault();
          const input = e.target.elements.videoLink.value;
          if (!input) return;

          // YouTube linkdan ID ni ajratib olish
          let videoId = "";
          if (input.includes("youtu.be/"))
            videoId = input.split("youtu.be/")[1]?.split("?")[0];
          else if (input.includes("v="))
            videoId = input.split("v=")[1]?.split("&")[0];
          else if (input.includes("embed/"))
            videoId = input.split("embed/")[1]?.split("?")[0];
          else videoId = input; // Agar faqat ID kiritilsa

          if (videoId) {
            const embedUrl = `https://www.youtube.com/embed/${videoId}`;
            storage.set(`video_${fanId}_${currentTopic.id}`, embedUrl);
            setVideoUpdate((v) => v + 1); // Sahifani yangilash
          }
        };

        const handleRemoveVideo = () => {
          storage.remove(`video_${fanId}_${currentTopic.id}`);
          setVideoUpdate((v) => v + 1);
        };

        return (
          <div>
            <div
              style={{
                ...ls.stepTitle,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>🎬 Video Dars — {currentTopic.name}</span>
              {activeVideoUrl && (
                <button
                  onClick={handleRemoveVideo}
                  style={{
                    fontSize: 12,
                    color: "#EF4444",
                    background: "rgba(239,68,68,0.1)",
                    border: "none",
                    padding: "4px 8px",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Videoni o'chirish
                </button>
              )}
            </div>

            {activeVideoUrl ? (
              <div style={ls.videoContainer}>
                <iframe
                  src={activeVideoUrl}
                  title={currentTopic.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                    borderRadius: 16,
                  }}
                  allowFullScreen
                />
              </div>
            ) : (
              <div
                style={{
                  background: "var(--bg)",
                  borderRadius: 16,
                  padding: 32,
                  textAlign: "center",
                  border: "1px dashed #CBD5E1",
                  marginBottom: 16,
                }}
              >
                <div style={{ fontSize: 40, marginBottom: 12 }}>📺</div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "var(--text)",
                    marginBottom: 8,
                  }}
                >
                  To'g'ridan-to'g'ri ko'rish uchun video qo'shing
                </div>
                <div
                  style={{ fontSize: 14, color: "var(--muted)", marginBottom: 20 }}
                >
                  Ushbu mavzu uchun YouTube'dan video toping va havolasini
                  (linkini) shu yerga joylang.
                </div>

                <form
                  onSubmit={handleSaveVideo}
                  style={{
                    display: "flex",
                    gap: 8,
                    maxWidth: 500,
                    margin: "0 auto",
                  }}
                >
                  <input
                    name="videoLink"
                    placeholder="https://youtu.be/..."
                    style={{
                      flex: 1,
                      padding: "10px 16px",
                      borderRadius: 10,
                      border: "1px solid var(--border-light)",
                      outline: "none",
                      fontSize: 14,
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      background: "#2563EB",
                      color: "white",
                      border: "none",
                      padding: "10px 20px",
                      borderRadius: 10,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Joylash
                  </button>
                </form>
              </div>
            )}

            {/* YOUTUBE QIDIRUV TUGMALARI */}
            <div
              style={{
                background: "var(--card)",
                borderRadius: 16,
                padding: 20,
                border: "1px solid var(--border)",
              }}
            >
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  marginBottom: 16,
                  color: "var(--text)",
                }}
              >
                🔍 YouTube'dan kerakli videoni topish
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <a
                  href={getYouTubeSearchUrl(searchWord, fan?.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "12px 20px",
                    borderRadius: 12,
                    background: "#DC2626",
                    color: "white",
                    fontWeight: 600,
                    fontSize: 14,
                    textDecoration: "none",
                    fontFamily: "'Outfit'",
                    transition: "all 0.2s",
                    boxShadow: "0 2px 8px rgba(220,38,38,0.2)",
                  }}
                >
                  ▶ YouTube'da qidirish
                </a>

                <a
                  href={getYouTubeSearchUrl(searchWord, "Khan Academy")}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "12px 20px",
                    borderRadius: 12,
                    background: "#059669",
                    color: "white",
                    fontWeight: 600,
                    fontSize: 14,
                    textDecoration: "none",
                    fontFamily: "'Outfit'",
                  }}
                >
                  🎓 Khan Academy
                </a>

                <a
                  href={getYouTubeSearchUrl(
                    searchWord,
                    "dars tushuntirish",
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "12px 20px",
                    borderRadius: 12,
                    background: "#2563EB",
                    color: "white",
                    fontWeight: 600,
                    fontSize: 14,
                    textDecoration: "none",
                    fontFamily: "'Outfit'",
                  }}
                >
                  📚 Tushuntirish videolari
                </a>
              </div>

              <div style={{ ...ls.infoBox, marginTop: 16 }}>
                💡 <strong>Maslahat:</strong> YouTube qidiruvida "
                {currentTopic.name} o'zbek tilida dars" deb qidirsangiz, eng
                yaxshi natijalarni topasiz.
              </div>
            </div>
          </div>
        );

      case 2: // LAB
        const rawLabExplanation = localStorage.getItem(`lab_${fanId}_${currentTopic.id}`);
        let currentLabExplanation = "";
        let currentLabActions = [];
        if (rawLabExplanation) {
          try {
            const parsed = JSON.parse(rawLabExplanation);
            if (parsed && typeof parsed === "object" && parsed.explanation) {
              currentLabExplanation = parsed.explanation;
              currentLabActions = parsed.actions || [];
            } else {
              currentLabExplanation = rawLabExplanation;
            }
          } catch (e) {
            currentLabExplanation = rawLabExplanation;
          }
        }
        const customLabHtml = localStorage.getItem(
          `lab_html_${fanId}_${currentTopic.id}`
        ) || currentTopic.labHtml;

        const applyLabHtmlContent = async (content) => {
            storage.set(`lab_html_${fanId}_${currentTopic.id}`, content);
            setVideoUpdate((v) => v + 1);
            setLabFullscreen(true); // To'liq ekranda ochish

            // HTML kodini o'qib Gemini orqali tushuntirish yozish
            if (geminiKey) {
              try {
                setIsGeneratingLab(true);
                addLog("HTML kodi o'qilmoqda, Gemini tushuntirish yozmoqda...");

                // HTML dan faqat matn va muhim qismlarni ajratib olish (token tejash)
                const stripped = content
                  .replace(/<script[\s\S]*?<\/script>/gi, "")
                  .replace(/<style[\s\S]*?<\/style>/gi, "")
                  .replace(/<[^>]+>/g, " ")
                  .replace(/\s+/g, " ")
                  .trim()
                  .slice(0, 2000);

                const prompt = `Sen O'zbekistondagi tajribali fizika/kimyo/biologiya o'qituvchisisan. 
Quyida o'quvchi uchun tayyorlangan vizual laboratoriya muhitining HTML kodi (matn qismi) berilgan:

"${stripped}"

Mavzu: "${currentTopic.name}"
Fan: "${fan?.name || "Umumiy"}"

Ushbu laboratoriya muhitida o'quvchi nima ko'rishi va qanday amallar bajarishi kerakligini tushuntir.
Javobni faqat va faqat quyidagi JSON formatida qaytaring (hech qanday markdown, \`\`\`json bloklari va izohlarsiz, faqat toza JSON matni):
{
  "explanation": "Nigora ovozida o'qiladigan 3-5 jumlali toza o'zbek tilidagi tushuntirish matni.",
  "actions": [
    { "time": 2.0, "cmd": "HIGHLIGHT", "target": "Kuzatish" },
    { "time": 5.0, "cmd": "CLICK", "target": "Tajriba" }
  ]
}
Izoh: 'actions' massividagi 'time' (sekundda) ovozning tegishli qismiga mos bo'lsin. 'target' esa ekrandagi qaysi kalit so'zni/tugmani ta'kidlash (HIGHLIGHT) yoki bosish (CLICK) kerakligini belgilaydi.`;

                const resp = await fetch(
                  `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      contents: [{ parts: [{ text: prompt }] }],
                    }),
                  },
                );
                const data = await resp.json();
                const explanationRaw =
                  data.candidates?.[0]?.content?.parts?.[0]?.text || "";

                if (explanationRaw) {
                  let finalData = "";
                  let cleanText = "";
                  try {
                    const cleaned = explanationRaw.replace(/```json/g, "").replace(/```/g, "").trim();
                    const parsed = JSON.parse(cleaned);
                    if (parsed.explanation) {
                      cleanText = parsed.explanation;
                      finalData = JSON.stringify({
                        explanation: parsed.explanation,
                        actions: parsed.actions || []
                      });
                    } else {
                      cleanText = explanationRaw;
                      finalData = JSON.stringify({ explanation: explanationRaw, actions: [] });
                    }
                  } catch (err) {
                    cleanText = explanationRaw;
                    finalData = JSON.stringify({ explanation: explanationRaw, actions: [] });
                  }

                  storage.set(`lab_${fanId}_${currentTopic.id}`, finalData);
                  setVideoUpdate((v) => v + 1);
                  addLog("Tushuntirish tayyor! Nigora ovozida o'qilmoqda...");

                  await toggleYandexSpeech(cleanText, "nigora", "uz-UZ");
                }
              } catch (err) {
                addLog("Gemini Lab xatosi: " + err.message);
              } finally {
                setIsGeneratingLab(false);
              }
            }
        };

        const handleFileUpload = async (e) => {
          const file = e.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (evt) => applyLabHtmlContent(evt.target.result);
          reader.readAsText(file);
        };

        const handleSelectLibraryLab = async (e) => {
          const path = e.target.value;
          if (!path) return;
          try {
            setIsGeneratingLab(true);
            addLog("Tayyor dars yuklanmoqda...");
            const resp = await fetch(path);
            const content = await resp.text();
            await applyLabHtmlContent(content);
          } catch (err) {
            addLog("Tayyor darsni yuklashda xato: " + err.message);
          } finally {
            setIsGeneratingLab(false);
          }
          e.target.value = "";
        };

        const handleRemoveHtml = () => {
          storage.remove(`lab_html_${fanId}_${currentTopic.id}`);
          setVideoUpdate((v) => v + 1);
        };

        return (
          <div style={{ animation: "fadeInUp 0.4s ease" }}>
            <div style={ls.stepTitle}>🔬 Vizual Laboratoriya</div>

            {/* AI LAB TUSHUNTIRISH BLOKI */}
            <div
              style={{
                background: isPlaying
                  ? "linear-gradient(135deg, #FFF7ED 0%, #FEF3C7 100%)"
                  : "var(--bg)",
                borderRadius: 20,
                padding: 24,
                marginBottom: 24,
                display: "flex",
                alignItems: "center",
                gap: 24,
                border: isPlaying ? "2px solid #D97706" : "1px solid #E2E8F0",
                boxShadow: isPlaying
                  ? "0 0 20px rgba(217,119,6,0.15)"
                  : "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              <button
                onClick={() => {
                  if (!currentLabExplanation) generateGeminiLab();
                  else
                    toggleYandexSpeech(
                      currentLabExplanation,
                      "nigora",
                      "uz-UZ",
                    );
                }}
                disabled={isGenerating || isGeneratingLab}
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 20,
                  background: isPlaying
                    ? "#DC2626"
                    : currentLabExplanation
                      ? "#D97706"
                      : "#10B981",
                  color: "white",
                  border: "none",
                  cursor: isGenerating || isGeneratingLab ? "wait" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                  transition: "all 0.3s",
                  flexShrink: 0,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                }}
              >
                {isGeneratingLab || isGenerating
                  ? "⏳"
                  : isPlaying
                    ? "⏹️"
                    : currentLabExplanation
                      ? "▶️"
                      : "✨"}
              </button>

              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "var(--text)",
                    marginBottom: 4,
                  }}
                >
                  {isGeneratingLab
                    ? "🤖 Gemini HTML ni tahlil qilmoqda..."
                    : isGenerating
                      ? "🔊 Nigora ovozi tayyorlanmoqda..."
                      : isPlaying
                        ? "🔊 Nigora laboratoriyani tushuntirmoqda..."
                        : currentLabExplanation
                          ? "▶️ Nigora ovozida tinglash"
                          : "✨ AI orqali tushuntirish olish"}
                </div>
                <div
                  style={{ fontSize: 12, color: "#92400E", marginBottom: 8 }}
                >
                  {customLabHtml
                    ? "HTML fayl yuklangan — AI kodni o'qib tushuntiradi, Nigora ovozida aytib beradi"
                    : "HTML fayl yuklab, AI tushuntirishini oling"}
                </div>
                {currentLabExplanation && (
                  <div
                    style={{
                      display: "flex",
                      gap: 4,
                      height: 20,
                      alignItems: "flex-end",
                    }}
                  >
                    {[...Array(20)].map((_, i) => (
                      <div
                        key={i}
                        style={{
                          width: 4,
                          background: "#D97706",
                          borderRadius: 2,
                          height: isPlaying
                            ? `${20 + Math.random() * 80}%`
                            : "15%",
                          transition: "height 0.15s",
                          opacity: isPlaying ? 0.8 : 0.2,
                          animation: isPlaying
                            ? `soundWave 0.6s infinite alternate ${i * 0.05}s`
                            : "none",
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Lab matnini qo'lda yozish */}
            <div
              style={{
                display: "flex",
                gap: 8,
                marginBottom: 12,
                justifyContent: "flex-end",
              }}
            >
              {currentLabExplanation && (
                <button
                  onClick={() => {
                    storage.remove(`lab_${fanId}_${currentTopic.id}`);
                    setVideoUpdate((v) => v + 1);
                  }}
                  style={{
                    fontSize: 12,
                    color: "#EF4444",
                    background: "rgba(239,68,68,0.08)",
                    border: "none",
                    padding: "4px 10px",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  🗑 O'chirish
                </button>
              )}
              <button
                onClick={() => {
                  const text = prompt(
                    "Laboratoriya tushuntirishini kiriting:",
                    currentLabExplanation || "",
                  );
                  if (text !== null && text.trim()) {
                    storage.set(`lab_${fanId}_${currentTopic.id}`, text.trim());
                    setVideoUpdate((v) => v + 1);
                  }
                }}
                style={{
                  fontSize: 12,
                  color: "#E11D48",
                  background: "rgba(225,29,72,0.08)",
                  border: "none",
                  padding: "4px 10px",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                ✏️ {currentLabExplanation ? "Tahrirlash" : "Qo'lda yozish"}
              </button>
            </div>

            {currentLabExplanation && (
              <div
                style={{
                  background: "var(--card)",
                  padding: 24,
                  borderRadius: 16,
                  border: "1px solid var(--border)",
                  marginBottom: 24,
                  fontSize: 15,
                  color: "#334155",
                  lineHeight: 1.8,
                  textAlign: "justify",
                }}
              >
                {currentLabExplanation}
              </div>
            )}

            {currentTopic.labType === "physics_newton" && <NewtonSimulation />}

            {fanId === "onatili" && <OnatiliSimulation />}

            {customLabHtml ? (
              <div style={{ marginTop: 16 }}>
                {/* Nigora ovozi paneli */}
                <div
                  style={{
                    background:
                      "linear-gradient(135deg, #FFF7ED 0%, #FFFBEB 100%)",
                    border: "2px solid #FDE68A",
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                  }}
                >
                  <button
                    onClick={() =>
                      toggleYandexSpeech(
                        currentLabExplanation ||
                          `${currentTopic.name} mavzusidagi vizual laboratoriya. O'quvchi interaktiv simulyatsiyani kuzatib mavzuni amalda o'rganadi.`,
                        "nigora",
                        "uz-UZ",
                      )
                    }
                    disabled={isGenerating || isGeneratingLab}
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 14,
                      flexShrink: 0,
                      background: isPlaying ? "#DC2626" : "#D97706",
                      color: "white",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 22,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 4px 12px rgba(217,119,6,0.3)",
                      transition: "all 0.2s",
                    }}
                  >
                    {isGenerating ? "⏳" : isPlaying ? "⏹️" : "🔊"}
                  </button>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 14,
                        color: "#92400E",
                        marginBottom: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      🎙️ Nigora ovozi — Laboratoriya tushuntirishi
                      {isPlaying && (
                        <span
                          style={{
                            fontSize: 11,
                            background: "#D97706",
                            color: "white",
                            padding: "2px 8px",
                            borderRadius: 10,
                          }}
                        >
                          ▶ JONLI
                        </span>
                      )}
                      {isGeneratingLab && (
                        <span
                          style={{
                            fontSize: 11,
                            background: "#059669",
                            color: "white",
                            padding: "2px 8px",
                            borderRadius: 10,
                          }}
                        >
                          ⏳ Tayyorlanmoqda
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: "#B45309" }}>
                      {currentLabExplanation
                        ? currentLabExplanation.slice(0, 100) + "..."
                        : "▶ tugmasini bosing — Nigora laboratoriyani tushuntiradi"}
                    </div>
                  </div>
                  <button
                    onClick={() => setLabFullscreen(true)}
                    style={{
                      background: "#2563EB",
                      color: "white",
                      border: "none",
                      padding: "10px 18px",
                      borderRadius: 10,
                      cursor: "pointer",
                      fontWeight: 700,
                      fontSize: 14,
                      whiteSpace: "nowrap",
                      boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
                    }}
                  >
                    ⛶ To'liq ekran
                  </button>
                  <button
                    onClick={handleRemoveHtml}
                    style={{
                      background: "#EF4444",
                      color: "white",
                      border: "none",
                      padding: "10px 12px",
                      borderRadius: 10,
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    🗑️
                  </button>
                </div>

                {/* Preview (kichik) */}
                <div
                  style={{
                    position: "relative",
                    borderRadius: 16,
                    overflow: "hidden",
                    border: "2px solid #E2E8F0",
                    cursor: "pointer",
                  }}
                  onClick={() => setLabFullscreen(true)}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      zIndex: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "rgba(0,0,0,0.35)",
                      backdropFilter: "blur(2px)",
                    }}
                  >
                    <div style={{ textAlign: "center", color: "white" }}>
                      <div style={{ fontSize: 48, marginBottom: 8 }}>⛶</div>
                      <div style={{ fontSize: 18, fontWeight: 700 }}>
                        To'liq ekranda ochish
                      </div>
                      <div style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>
                        Bosing yoki yuqoridagi tugmani ishlating
                      </div>
                    </div>
                  </div>
                  <iframe
                    srcDoc={injectBridgeScript(customLabHtml)}
                    style={{
                      width: "100%",
                      height: 320,
                      border: "none",
                      display: "block",
                      pointerEvents: "none",
                    }}
                    title="Lab Preview"
                    sandbox="allow-scripts allow-same-origin"
                  />
                </div>
              </div>
            ) : (
              <div
                style={{
                  padding: 40,
                  textAlign: "center",
                  background: "var(--bg)",
                  borderRadius: 12,
                  border: "1px dashed #E2E8F0",
                  marginTop: currentTopic.labType ? 24 : 0,
                }}
              >
                <div style={{ fontSize: 40, marginBottom: 16 }}>🛠️</div>
                <div
                  style={{
                    color: "var(--muted)",
                    marginBottom: 8,
                    fontSize: 15,
                    fontWeight: 600,
                  }}
                >
                  {currentTopic.labType
                    ? "Qo'shimcha laboratoriya faylini (HTML) yuklashingiz mumkin."
                    : "Bu mavzu uchun laboratoriya faylini (HTML) yuklang."}
                </div>
                <div
                  style={{
                    color: "var(--dim)",
                    fontSize: 13,
                    marginBottom: 20,
                    lineHeight: 1.6,
                  }}
                >
                  HTML fayl yuklanganida AI avtomatik kodni tahlil qilib,
                  <br />
                  <strong style={{ color: "#D97706" }}>
                    Nigora ovozida
                  </strong>{" "}
                  laboratoriyani tushuntiradi 🔊
                </div>

                {getLabLibraryForFan(fanId).length > 0 && (
                  <div style={{ marginBottom: 18, maxWidth: 360, marginLeft: "auto", marginRight: "auto" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 8, textAlign: "left" }}>
                      📚 Tayyor darslardan tanlash
                    </div>
                    <select
                      defaultValue=""
                      onChange={handleSelectLibraryLab}
                      disabled={isGeneratingLab}
                      style={{
                        width: "100%",
                        padding: "11px 14px",
                        borderRadius: 12,
                        border: "1px solid var(--border)",
                        background: "var(--input-bg)",
                        color: "var(--text)",
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: isGeneratingLab ? "wait" : "pointer",
                      }}
                    >
                      <option value="">— Tayyor dars tanlang —</option>
                      {getLabLibraryForFan(fanId).map((lab) => (
                        <option key={lab.id} value={lab.path}>{lab.name}</option>
                      ))}
                    </select>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "16px 0" }}>
                      <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
                      <span style={{ fontSize: 12, color: "var(--dim)", fontWeight: 600 }}>YOKI</span>
                      <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
                    </div>
                  </div>
                )}

                <label
                  style={{
                    display: "inline-block",
                    background: "#2563EB",
                    color: "white",
                    padding: "12px 24px",
                    borderRadius: 12,
                    cursor: "pointer",
                    fontWeight: 700,
                    fontSize: 15,
                    boxShadow: "0 4px 12px rgba(37,99,235,0.25)",
                  }}
                >
                  <input
                    type="file"
                    accept=".html"
                    style={{ display: "none" }}
                    onChange={handleFileUpload}
                  />
                  📂 HTML faylni tanlash
                </label>
                {isGeneratingLab && (
                  <div
                    style={{
                      marginTop: 16,
                      color: "#D97706",
                      fontWeight: 600,
                      fontSize: 14,
                    }}
                  >
                    ⏳ AI HTML ni tahlil qilmoqda, Nigora tushuntirish
                    tayyorlamoqda...
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 3: // AI
        return (
          <div>
            <div style={ls.stepTitle}>🤖 AI Ustoz bilan suhbat</div>
            <AIChat topic={currentTopic.name} subject={fan?.name} />
          </div>
        );

      case 4: // QUIZ
        const savedQuiz = JSON.parse(
          localStorage.getItem(`quiz_${fanId}_${currentTopic.id}`) || "null",
        );
        let defaultQuestions = savedQuiz || currentTopic.quiz || [];
        if (!savedQuiz && currentTopic.quizQuestions && currentTopic.quizQuestions.length > 0) {
          const letterToIndex = { a: 0, b: 1, c: 2, d: 3 };
          defaultQuestions = currentTopic.quizQuestions.map(q => ({
            q: q.q,
            opts: [q.a || "", q.b || "", q.c || "", q.d || ""],
            correct: letterToIndex[q.ok] !== undefined ? letterToIndex[q.ok] : 0
          }));
        }
        const selectedVariant =
          quizVariants.find((v) => v.id === selectedQuizVariantId) || null;
        const activeQuestions = selectedVariant
          ? selectedVariant.questions
          : defaultQuestions;

        const saveNewQuestion = () => {
          if (!newQ.q.trim() || newQ.opts.some((o) => !o.trim())) return;
          const updated = [...defaultQuestions, { ...newQ }];
          storage.set(`quiz_${fanId}_${currentTopic.id}`, JSON.stringify(updated));
          setNewQ({ q: "", opts: ["", "", "", ""], correct: 0 });
          setVideoUpdate((v) => v + 1);
        };
        const deleteQuestion = (idx) => {
          const updated = defaultQuestions.filter((_, i) => i !== idx);
          storage.set(`quiz_${fanId}_${currentTopic.id}`, JSON.stringify(updated));
          setVideoUpdate((v) => v + 1);
        };
        const resetQuiz = () => {
          storage.remove(`quiz_${fanId}_${currentTopic.id}`);
          setVideoUpdate((v) => v + 1);
        };
        const setVariant = (id) => {
          setSelectedQuizVariantId(id);
          setVideoUpdate((v) => v + 1);
        };

        return (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <div style={ls.stepTitle}>❓ Bilimni tekshirish</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  onClick={() => setShowQuizEditor(!showQuizEditor)}
                  style={{
                    ...ls.btn,
                    background: showQuizEditor ? "#F1F5F9" : "#2563EB",
                    color: showQuizEditor ? "#1E293B" : "white",
                    border: "1px solid var(--border)",
                    padding: "8px 16px",
                    fontSize: 13,
                  }}
                >
                  {showQuizEditor ? "✕ Yopish" : "➕ Savol qo'shish"}
                </button>
                <label
                  style={{ display: "flex", alignItems: "center", gap: 8 }}
                >
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={quizCount}
                    onChange={(e) =>
                      setQuizCount(Math.max(1, Number(e.target.value) || 1))
                    }
                    style={{
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: "1px solid var(--border-light)",
                      fontSize: 13,
                      width: 90,
                      background: "var(--card)",
                    }}
                  />
                </label>
                <button
                  onClick={generateGeminiQuiz}
                  disabled={isGeneratingQuiz}
                  style={{
                    ...ls.btn,
                    background: "#10B981",
                    color: "white",
                    border: "1px solid rgba(16,185,129,0.2)",
                    padding: "8px 16px",
                    fontSize: 13,
                  }}
                >
                  {isGeneratingQuiz
                    ? "⏳ AI test yaratilmoqda..."
                    : `✨ AI variant yaratish (${quizCount})`}
                </button>
                {defaultQuestions.length > 0 && (
                  <button
                    onClick={resetQuiz}
                    style={{
                      ...ls.btn,
                      background: "rgba(239,68,68,0.1)",
                      color: "#EF4444",
                      border: "none",
                      padding: "8px 12px",
                      fontSize: 12,
                    }}
                  >
                    ↺ Aslini tiklash
                  </button>
                )}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  fontSize: 13,
                  color: "var(--muted)",
                }}
              >
                Variant:
                <select
                  value={selectedQuizVariantId}
                  onChange={(e) => setVariant(e.target.value)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "1px solid var(--border-light)",
                    fontSize: 13,
                    outline: "none",
                    background: "var(--card)",
                  }}
                >
                  <option value="default">Default testlar</option>
                  {quizVariants.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </label>
              {selectedVariant && (
                <span style={{ fontSize: 13, color: "var(--muted)" }}>
                  AI variant: {selectedVariant.name} (
                  {selectedVariant.questions.length} savol)
                </span>
              )}
            </div>

            {showQuizEditor && (
              <div
                style={{
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  borderRadius: 16,
                  padding: 20,
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 15,
                    marginBottom: 12,
                    color: "var(--text)",
                  }}
                >
                  ➕ Yangi savol qo'shish
                </div>
                <input
                  value={newQ.q}
                  onChange={(e) => setNewQ({ ...newQ, q: e.target.value })}
                  placeholder="Savol matni..."
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "1px solid var(--border-light)",
                    fontSize: 14,
                    marginBottom: 10,
                    boxSizing: "border-box",
                    outline: "none",
                  }}
                />
                {newQ.opts.map((opt, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      gap: 8,
                      marginBottom: 8,
                      alignItems: "center",
                    }}
                  >
                    <input
                      type="radio"
                      name="correct"
                      checked={newQ.correct === i}
                      onChange={() => setNewQ({ ...newQ, correct: i })}
                    />
                    <input
                      value={opt}
                      onChange={(e) => {
                        const o = [...newQ.opts];
                        o[i] = e.target.value;
                        setNewQ({ ...newQ, opts: o });
                      }}
                      placeholder={`${String.fromCharCode(65 + i)} variant`}
                      style={{
                        flex: 1,
                        padding: "8px 12px",
                        borderRadius: 8,
                        border: `1px solid ${newQ.correct === i ? "#059669" : "#CBD5E1"}`,
                        fontSize: 13,
                        outline: "none",
                      }}
                    />
                    {newQ.correct === i && (
                      <span
                        style={{
                          color: "#059669",
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        ✓ To'g'ri
                      </span>
                    )}
                  </div>
                ))}
                <button
                  onClick={saveNewQuestion}
                  style={{
                    ...ls.btn,
                    background: "#059669",
                    color: "white",
                    marginTop: 8,
                  }}
                >
                  💾 Savolni saqlash
                </button>

                {defaultQuestions.length > 0 && (
                  <div
                    style={{
                      marginTop: 16,
                      borderTop: "1px solid #E2E8F0",
                      paddingTop: 16,
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: 13,
                        color: "var(--muted)",
                        marginBottom: 10,
                      }}
                    >
                      Mavjud savollar ({defaultQuestions.length} ta):
                    </div>
                    {defaultQuestions.map((q, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "8px 12px",
                          background: "var(--card)",
                          borderRadius: 8,
                          border: "1px solid var(--border)",
                          marginBottom: 6,
                        }}
                      >
                        <span style={{ fontSize: 13, color: "var(--text)" }}>
                          {i + 1}. {q.q}
                        </span>
                        <button
                          onClick={() => deleteQuestion(i)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#EF4444",
                            cursor: "pointer",
                            fontSize: 16,
                          }}
                        >
                          🗑
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <Quiz
              questions={activeQuestions}
              onComplete={(score, total) => {
                const pct = Math.round((score / total) * 100);
                const pd = JSON.parse(
                  localStorage.getItem("eduai_progress") || "{}",
                );
                pd[`${fanId}_${selectedTopicId}`] = {
                  score,
                  total,
                  percentage: pct,
                  date: new Date().toISOString(),
                };
                storage.set("eduai_progress", JSON.stringify(pd));
              }}
            />
          </div>
        );

      case 5: // MASHQ
        const savedPractice = JSON.parse(
          localStorage.getItem(`practice_${currentTopic.id}`) || "null",
        );
        const allPractice = savedPractice || currentTopic.practice || [];

        const saveNewPractice = () => {
          if (!newPractice.text.trim()) return;
          const updated = [
            ...allPractice,
            { n: allPractice.length + 1, ...newPractice },
          ];
          storage.set(`practice_${currentTopic.id}`, JSON.stringify(updated));
          setNewPractice({ level: "Oson", text: "", answer: "" });
          setVideoUpdate((v) => v + 1);
        };
        const deletePractice = (idx) => {
          const updated = allPractice
            .filter((_, i) => i !== idx)
            .map((m, i) => ({ ...m, n: i + 1 }));
          storage.set(`practice_${currentTopic.id}`, JSON.stringify(updated));
          setVideoUpdate((v) => v + 1);
        };

        const handlePracticeHtmlUpload = async (e) => {
          const file = e.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = async (evt) => {
            const content = evt.target.result;
            storage.set(`practice_html_${currentTopic.id}`, content);
            setVideoUpdate((v) => v + 1);
            setLabFullscreen(true); // Yuklangan zahoti to'liq ekranda ochish
          };
          reader.readAsText(file);
        };

        const customPracticeHtml = localStorage.getItem(
          `practice_html_${currentTopic.id}`
        ) || currentTopic.practiceHtml;

        return (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <div style={ls.stepTitle}>✍️ Amaliy mashqlar</div>
              <div style={{ display: "flex", gap: 10 }}>
                {/* HTML Mashq yuklash tugmasi */}
                <label
                  style={{
                    ...ls.btn,
                    background: "#F59E0B",
                    color: "white",
                    padding: "8px 16px",
                    fontSize: 13,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="file"
                    accept=".html"
                    style={{ display: "none" }}
                    onChange={handlePracticeHtmlUpload}
                  />
                  📂 HTML Mashq
                </label>

                <button
                  onClick={() => setShowPracticeEditor(!showPracticeEditor)}
                  style={{
                    ...ls.btn,
                    background: showPracticeEditor ? "#F1F5F9" : "#2563EB",
                    color: showPracticeEditor ? "#1E293B" : "white",
                    border: "1px solid var(--border)",
                    padding: "8px 16px",
                    fontSize: 13,
                  }}
                >
                  {showPracticeEditor ? "✕ Yopish" : "➕ Mashq qo'shish"}
                </button>
              </div>
            </div>

            {/* Yuklangan HTML Mashqni ko'rsatish */}
            {customPracticeHtml && (
              <div style={{ marginBottom: 24 }}>
                <div
                  style={{
                    background: "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)",
                    border: "1px solid #BFDBFE",
                    borderRadius: 16,
                    padding: 16,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 16,
                    marginBottom: 12,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ fontSize: 24 }}>🎮</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: "#1E3A8A" }}>
                        Interaktiv vizual mashq yuklangan
                      </div>
                      <div style={{ fontSize: 12, color: "#2563EB" }}>
                        HTML formatidagi vizual amaliy topshiriq
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => setLabFullscreen(true)}
                      style={{
                        ...ls.btn,
                        background: "#2563EB",
                        color: "white",
                        padding: "8px 16px",
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    >
                      ⛶ Boshlash (To'liq ekranda)
                    </button>
                    <button
                      onClick={() => {
                        storage.remove(`practice_html_${currentTopic.id}`);
                        setVideoUpdate((v) => v + 1);
                      }}
                      style={{
                        ...ls.btn,
                        background: "#EF4444",
                        color: "white",
                        padding: "8px 16px",
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    >
                      🗑 O'chirish
                    </button>
                  </div>
                </div>

                <div
                  style={{
                    position: "relative",
                    borderRadius: 12,
                    overflow: "hidden",
                    border: "2px solid #E2E8F0",
                    cursor: "pointer",
                    marginBottom: 16,
                  }}
                  onClick={() => setLabFullscreen(true)}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      zIndex: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "rgba(0,0,0,0.3)",
                      backdropFilter: "blur(1px)",
                    }}
                  >
                    <div style={{ textAlign: "center", color: "white" }}>
                      <div style={{ fontSize: 32, marginBottom: 4 }}>⛶</div>
                      <div style={{ fontSize: 16, fontWeight: 700 }}>
                        Mashqni to'liq ekranda ishlash
                      </div>
                    </div>
                  </div>
                  <iframe
                    srcDoc={injectBridgeScript(customPracticeHtml)}
                    style={{
                      width: "100%",
                      height: 240,
                      border: "none",
                      display: "block",
                      pointerEvents: "none",
                    }}
                    title="Practice Preview"
                    sandbox="allow-scripts allow-same-origin"
                  />
                </div>
              </div>
            )}

            {showPracticeEditor && (
              <div
                style={{
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  borderRadius: 16,
                  padding: 20,
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 15,
                    marginBottom: 12,
                    color: "var(--text)",
                  }}
                >
                  ➕ Yangi mashq qo'shish
                </div>
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  {["Oson", "O'rta", "Qiyin"].map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() =>
                        setNewPractice({ ...newPractice, level: lvl })
                      }
                      style={{
                        padding: "6px 14px",
                        borderRadius: 8,
                        border: "none",
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: 13,
                        background:
                          newPractice.level === lvl ? "#2563EB" : "var(--border)",
                        color: newPractice.level === lvl ? "white" : "#64748B",
                      }}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
                <textarea
                  value={newPractice.text}
                  onChange={(e) =>
                    setNewPractice({ ...newPractice, text: e.target.value })
                  }
                  placeholder="Mashq topshirig'i..."
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "1px solid var(--border-light)",
                    fontSize: 14,
                    marginBottom: 10,
                    boxSizing: "border-box",
                    outline: "none",
                    resize: "vertical",
                  }}
                />
                <input
                  value={newPractice.answer}
                  onChange={(e) =>
                    setNewPractice({ ...newPractice, answer: e.target.value })
                  }
                  placeholder="To'g'ri javob..."
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "1px solid var(--border-light)",
                    fontSize: 14,
                    marginBottom: 10,
                    boxSizing: "border-box",
                    outline: "none",
                  }}
                />
                <button
                  onClick={saveNewPractice}
                  style={{ ...ls.btn, background: "#059669", color: "white" }}
                >
                  💾 Saqlash
                </button>
              </div>
            )}

            {allPractice.length > 0 ? (
              allPractice.map((m, i) => (
                <div key={i} style={{ ...ls.hwItem, position: "relative" }}>
                  <div style={ls.hwNum}>{m.n}</div>
                  <div style={{ fontSize: 14, color: "var(--muted)", flex: 1 }}>
                    <strong style={{ color: "var(--text)" }}>[{m.level}]</strong>{" "}
                    {m.text}
                    <div
                      style={{
                        marginTop: 8,
                        color: "#059669",
                        fontWeight: 700,
                      }}
                    >
                      Javob: {m.answer}
                    </div>
                  </div>
                  <button
                    onClick={() => deletePractice(i)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#CBD5E1",
                      cursor: "pointer",
                      fontSize: 16,
                      position: "absolute",
                      top: 8,
                      right: 8,
                    }}
                  >
                    🗑
                  </button>
                </div>
              ))
            ) : (
              <div
                style={{ color: "var(--dim)", textAlign: "center", padding: 40 }}
              >
                Hozircha mashqlar qo'shilmagan. "➕ Mashq qo'shish" tugmasini
                bosing.
              </div>
            )}
          </div>
        );

      case 6: // VAZIFA
        const savedHomework = JSON.parse(
          localStorage.getItem(`homework_${currentTopic.id}`) || "null",
        );
        let allHomework = savedHomework || currentTopic.homework || [];
        if (!savedHomework && currentTopic.homeworkText) {
          allHomework = [{ n: 1, text: currentTopic.homeworkText, deadline: "2 kun" }];
        }

        const saveNewHw = () => {
          if (!newHw.text.trim()) return;
          const updated = [
            ...allHomework,
            { n: allHomework.length + 1, ...newHw },
          ];
          storage.set(`homework_${currentTopic.id}`, JSON.stringify(updated));
          setNewHw({ text: "", deadline: "2 kun" });
          setVideoUpdate((v) => v + 1);
        };
        const deleteHw = (idx) => {
          const updated = allHomework
            .filter((_, i) => i !== idx)
            .map((h, i) => ({ ...h, n: i + 1 }));
          storage.set(`homework_${currentTopic.id}`, JSON.stringify(updated));
          setVideoUpdate((v) => v + 1);
        };

        return (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <div style={ls.stepTitle}>📋 Uyga vazifa</div>
              <button
                onClick={() => setShowHwEditor(!showHwEditor)}
                style={{
                  ...ls.btn,
                  background: showHwEditor ? "#F1F5F9" : "#2563EB",
                  color: showHwEditor ? "#1E293B" : "white",
                  border: "1px solid var(--border)",
                  padding: "8px 16px",
                  fontSize: 13,
                }}
              >
                {showHwEditor ? "✕ Yopish" : "➕ Vazifa qo'shish"}
              </button>
            </div>

            {showHwEditor && (
              <div
                style={{
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  borderRadius: 16,
                  padding: 20,
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 15,
                    marginBottom: 12,
                    color: "var(--text)",
                  }}
                >
                  ➕ Yangi vazifa qo'shish
                </div>
                <textarea
                  value={newHw.text}
                  onChange={(e) => setNewHw({ ...newHw, text: e.target.value })}
                  placeholder="Vazifa matni..."
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "1px solid var(--border-light)",
                    fontSize: 14,
                    marginBottom: 10,
                    boxSizing: "border-box",
                    outline: "none",
                    resize: "vertical",
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    marginBottom: 10,
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      color: "var(--muted)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    ⏰ Deadline:
                  </span>
                  <input
                    value={newHw.deadline}
                    onChange={(e) =>
                      setNewHw({ ...newHw, deadline: e.target.value })
                    }
                    placeholder="masalan: 2 kun"
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: "1px solid var(--border-light)",
                      fontSize: 13,
                      outline: "none",
                    }}
                  />
                </div>
                <button
                  onClick={saveNewHw}
                  style={{ ...ls.btn, background: "#059669", color: "white" }}
                >
                  💾 Saqlash
                </button>
              </div>
            )}

            {allHomework.length > 0 ? (
              allHomework.map((hw, i) => (
                <div key={i} style={{ ...ls.hwItem, position: "relative" }}>
                  <div style={ls.hwNum}>{hw.n}</div>
                  <div
                    style={{ fontSize: 14, color: "var(--muted)", width: "100%" }}
                  >
                    <div
                      style={{
                        color: "var(--text)",
                        fontWeight: 600,
                        marginBottom: 4,
                      }}
                    >
                      Topshiriq:
                    </div>
                    {hw.text}
                    <div
                      style={{
                        marginTop: 8,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          color: "#D97706",
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        ⏰ Deadline: {hw.deadline}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          background: "rgba(37,99,235,0.08)",
                          color: "#2563EB",
                          padding: "2px 8px",
                          borderRadius: 4,
                        }}
                      >
                        Ball: 10
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteHw(i)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#CBD5E1",
                      cursor: "pointer",
                      fontSize: 16,
                      position: "absolute",
                      top: 8,
                      right: 8,
                    }}
                  >
                    🗑
                  </button>
                </div>
              ))
            ) : (
              <div
                style={{ color: "var(--dim)", textAlign: "center", padding: 40 }}
              >
                Vazifalar hozircha mavjud emas. "➕ Vazifa qo'shish" tugmasini
                bosing.
              </div>
            )}

            {allHomework.length > 0 && (
              <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
                <button
                  style={{
                    ...ls.btn,
                    background: "#2563EB",
                    color: "white",
                    flex: 1,
                  }}
                >
                  📤 Vazifani topshirish
                </button>
                <button
                  style={{
                    ...ls.btn,
                    background: "var(--surface)",
                    color: "var(--text)",
                    border: "1px solid var(--border)",
                  }}
                >
                  Qoralamaga saqlash
                </button>
              </div>
            )}
          </div>
        );

      case 7: // O'YIN
        const customGameHtml = localStorage.getItem(`game_html_${selectedTopicId}`) || "";

        const handleGameHtmlUpload = async (e) => {
          const file = e.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = async (evt) => {
            const content = evt.target.result;
            storage.set(`game_html_${selectedTopicId}`, content);
            setVideoUpdate((v) => v + 1);
          };
          reader.readAsText(file);
        };

        return (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <div style={ls.stepTitle}>🎮 Qiziqarli O'yin</div>
              <label
                style={{
                  ...ls.btn,
                  background: "#10B981",
                  color: "white",
                  padding: "8px 16px",
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                HTML O'yin yuklash
                <input
                  type="file"
                  accept=".html"
                  style={{ display: "none" }}
                  onChange={handleGameHtmlUpload}
                />
              </label>
            </div>

            {customGameHtml ? (
              <div style={{ background: "var(--card)", padding: 16, borderRadius: 16, border: "1px solid var(--border)", minHeight: 600 }}>
                <iframe
                  srcDoc={customGameHtml}
                  style={{ width: "100%", height: "600px", border: "none", borderRadius: 12, background: "#000" }}
                  title="Game Simulation"
                  sandbox="allow-scripts allow-same-origin"
                />
              </div>
            ) : (
              <div style={{ background: "rgba(16, 185, 129, 0.05)", border: "1px dashed #10B981", borderRadius: 16, padding: 40, textAlign: "center" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🎮</div>
                <h3 style={{ margin: 0, color: "#065F46" }}>Ushbu mavzu uchun o'yin yuklanmagan</h3>
                <p style={{ color: "#047857", fontSize: 14, marginTop: 8 }}>
                  Tashqi muhitda yozilgan HTML kod (o'yin) orqali mavzuni yanada qiziqarli qilish uchun yuqoridagi tugmadan HTML fayl yuklang.
                </p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="lesson-container" style={{ background: "var(--bg)", minHeight: "100vh", padding: 20 }}>
      <div className="lesson-sidebar" style={ls.sidebar}>
        <div
          style={{
            fontSize: 13,
            color: "#2563EB",
            marginBottom: 6,
            cursor: "pointer",
            fontWeight: 500,
          }}
          onClick={onBack}
        >
          {ui.back}
        </div>
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            marginBottom: 16,
            color: "var(--text)",
          }}
        >
          {fan?.icon} {fan?.name}
        </div>
        {topics.map((t) => {
          const isActive = selectedTopicId === t.id;
          return (
            <button
              key={t.id}
              style={{
                ...ls.topicBtn,
                ...(isActive
                  ? {
                      background: "rgba(37,99,235,0.08)",
                      color: "#2563EB",
                      fontWeight: 600,
                    }
                  : {}),
              }}
              onClick={() => setSelectedTopicId(t.id)}
            >
              <span
                style={{
                  ...ls.topicStatus,
                  background:
                    t.status === "completed"
                      ? "rgba(5,150,105,0.1)"
                      : "rgba(37,99,235,0.1)",
                  color: t.status === "completed" ? "#059669" : "#2563EB",
                }}
              >
                {t.status === "completed" ? "✓" : "▶"}
              </span>
              <span>{t.name}</span>
            </button>
          );
        })}
      </div>
      <div>
        <div style={ls.header}>
          <div
            style={{
              fontFamily: "'Space Grotesk'",
              fontSize: 24,
              fontWeight: 700,
              color: "var(--text)",
            }}
          >
            {currentTopic?.name}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setShowTopshirish(true)}
              style={{
                background: "linear-gradient(135deg, #7C3AED, #2563EB)",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: 10,
                cursor: "pointer",
                fontWeight: 700,
                fontSize: 13,
                display: "flex",
                alignItems: "center",
                gap: 6,
                boxShadow: "0 2px 8px rgba(124,58,237,0.3)",
              }}
            >
              {ui.submit}
            </button>

            <button
              onClick={() => setShowGeminiModal(true)}
              style={{
                background: "rgba(16,185,129,0.1)",
                color: "#10B981",
                border: "1px solid rgba(16,185,129,0.2)",
                padding: "8px 16px",
                borderRadius: 10,
                cursor: "pointer",
                fontWeight: 700,
                fontSize: 13,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span>✨</span>{" "}
              {isEnglish
                ? "AI Settings"
                : isRussian
                  ? "Настройки AI"
                  : "AI Sozlamalari"}
            </button>
          </div>
        </div>
        <div style={ls.stepsNav}>
          {LESSON_STEPS.map((s, i) => {
            // Reorder: Kirish(0), Lab(2), Quiz(4), Mashq(5), Vazifa(6), Video(1), AI Ustoz(3), O'yin(7)
            const reorder = [0, 2, 4, 5, 6, 1, 3, 7];
            const newIndex = reorder[i];
            const step = LESSON_STEPS[newIndex];
            return (
              <button
                key={newIndex}
                style={{
                  ...ls.stepBtn,
                  ...(lessonStep === newIndex ? ls.stepBtnActive : {}),
                }}
                onClick={() => setLessonStep(newIndex)}
              >
                {ui.stepIcons[newIndex]} {ui.steps[newIndex]}
              </button>
            );
          })}
        </div>
        <div
          style={{
            ...ls.stepContent,
            ...(lessonStep === 2 &&
            (localStorage.getItem(`lab_html_${fanId}_${selectedTopicId}`) || currentTopic?.labHtml)
              ? {
                  padding: 16,
                  minHeight: "calc(100vh - 200px)",
                }
              : {}),
          }}
        >
          {renderStepContent()}
        </div>
      </div>

      {/* NATIVE FULLSCREEN MODAL FOR HTML LABS AND HTML PRACTICES */}
      {labFullscreen &&
        (() => {
          const isPractice = lessonStep === 5;
          const labHtml = localStorage.getItem(
            isPractice ? `practice_html_${selectedTopicId}` : `lab_html_${fanId}_${selectedTopicId}`
          ) || (isPractice ? currentTopic?.practiceHtml : currentTopic?.labHtml);
          const rawLabText = isPractice
            ? ""
            : localStorage.getItem(`lab_${fanId}_${selectedTopicId}`);
          let labText = "";
          let labActions = [];
          if (isPractice) {
            labText = `${currentTopic?.name} mavzusi bo'yicha interaktiv amaliy mashq. Ekrandagi vizual topshiriqni bajaring va bilimlaringizni sinab ko'ring.`;
          } else if (rawLabText) {
            try {
              const parsed = JSON.parse(rawLabText);
              if (parsed && typeof parsed === "object" && parsed.explanation) {
                labText = parsed.explanation;
                labActions = parsed.actions || [];
              } else {
                labText = rawLabText;
              }
            } catch (e) {
              labText = rawLabText;
            }
          }

          // Native Fullscreen API ishlatish
          const handleEnterFullscreen = () => {
            const elem = document.getElementById("fullscreen-lab-container");
            if (elem && elem.requestFullscreen) {
              elem.requestFullscreen().catch((e) => console.log(e));
            }
          };

          return (
            <div
              id="fullscreen-lab-container"
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "#0F172A",
                zIndex: 10001,
                display: "flex",
                flexDirection: "column",
                animation: "fadeIn 0.3s ease",
              }}
            >
              {/* Yuqori panel */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 16px",
                  background: "rgba(255,255,255,0.05)",
                  borderBottom: "1px solid rgba(255,255,255,0.1)",
                  flexShrink: 0,
                }}
              >
                {/* Nigora tugmasi */}
                <button
                  onClick={() =>
                    toggleYandexSpeech(
                      labText ||
                        `${currentTopic?.name} mavzusidagi vizual laboratoriya. Ekrandagi interaktiv simulyatsiyani kuzating va mavzuni amalda o'rganing.`,
                      "nigora",
                      "uz-UZ",
                    )
                  }
                  disabled={isGenerating || isGeneratingLab}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    flexShrink: 0,
                    background: isPlaying ? "#DC2626" : "#D97706",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 20,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 12px rgba(217,119,6,0.4)",
                  }}
                >
                  {isGenerating ? "⏳" : isPlaying ? "⏹️" : "🔊"}
                </button>

                {/* Tushuntirish matni */}
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#FDE68A",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    🎙️ Nigora — {isPractice ? "Amaliy mashq" : "Laboratoriya"} ({currentTopic?.name})
                    {isPlaying && (
                      <span
                        style={{
                          fontSize: 11,
                          background: "#D97706",
                          color: "white",
                          padding: "2px 8px",
                          borderRadius: 10,
                        }}
                      >
                        ▶ JONLI
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "rgba(255,255,255,0.5)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {labText
                      ? labText.slice(0, 120) + "..."
                      : "🔊 tugmasini bosing — Nigora tushuntiradi"}
                  </div>
                </div>

                {/* Fullscreen va Yopish tugmasi */}
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={handleEnterFullscreen}
                    style={{
                      background: "rgba(255,255,255,0.1)",
                      color: "#fff",
                      border: "1px solid rgba(255,255,255,0.2)",
                      padding: "8px 12px",
                      borderRadius: 10,
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: 13,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    📺 To'liq ekran
                  </button>
                  <button
                    onClick={() => {
                      if (document.fullscreenElement)
                        document.exitFullscreen().catch((e) => console.log(e));
                      setLabFullscreen(false);
                      if (audio) {
                        audio.pause();
                        setIsPlaying(false);
                      }
                    }}
                    style={{
                      background: "rgba(239,68,68,0.2)",
                      color: "#FCA5A5",
                      border: "1px solid rgba(239,68,68,0.3)",
                      padding: "8px 16px",
                      borderRadius: 10,
                      cursor: "pointer",
                      fontWeight: 700,
                      fontSize: 14,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    ✕ Yopish
                  </button>
                </div>
              </div>

              {/* To'liq ekran iframe wrapper */}
              <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column" }}>
                <iframe
                  srcDoc={injectBridgeScript(labHtml)}
                  style={{
                    flex: 1,
                    width: "100%",
                    border: "none",
                    display: "block",
                  }}
                  title="Lab Fullscreen"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock"
                />

                {/* Floating absolute Exit Button */}
                <button
                  onClick={() => {
                    if (document.fullscreenElement) {
                      document.exitFullscreen().catch((e) => console.log(e));
                    }
                    setLabFullscreen(false);
                    if (audio) {
                      audio.pause();
                      setIsPlaying(false);
                    }
                  }}
                  style={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    zIndex: 20000,
                    background: "rgba(239, 68, 68, 0.9)",
                    color: "white",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    padding: "10px 16px",
                    borderRadius: 12,
                    cursor: "pointer",
                    fontWeight: 700,
                    fontSize: 14,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    boxShadow: "0 8px 20px rgba(220, 38, 38, 0.3)",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "#DC2626";
                    e.target.style.transform = "scale(1.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "rgba(239, 68, 68, 0.9)";
                    e.target.style.transform = "scale(1)";
                  }}
                >
                  ✕ Chiqish
                </button>
              </div>
            </div>
          );
        })()}

      {/* TOPSHIRISH MODAL */}
      {showTopshirish && currentTopic && (
        <TopshirishModal
          topic={currentTopic}
          fan={fan}
          geminiKey={geminiKey}
          onClose={() => setShowTopshirish(false)}
        />
      )}

      {/* API KEY SOZLAMALARI (MODAL) */}
      {showSettings && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15,23,42,0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "var(--card)",
              width: 400,
              borderRadius: 20,
              padding: 24,
              boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
              animation: "fadeInUp 0.3s ease",
            }}
          >
            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                marginBottom: 16,
                color: "var(--text)",
              }}
            >
              ⚙️ Yandex API Sozlamalari
            </div>

            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  color: "var(--muted)",
                  marginBottom: 6,
                  fontWeight: 600,
                }}
              >
                API Kalit (API-Key yoki IAM Token)
              </label>
              <input
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                placeholder="AQVN..."
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1px solid var(--border)",
                  outline: "none",
                  fontSize: 14,
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  color: "var(--muted)",
                  marginBottom: 6,
                  fontWeight: 600,
                }}
              >
                Folder ID
              </label>
              <input
                value={tempFolder}
                onChange={(e) => setTempFolder(e.target.value)}
                placeholder="b1g..."
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1px solid var(--border)",
                  outline: "none",
                  fontSize: 14,
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={saveSettings}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "#2563EB",
                  color: "white",
                  border: "none",
                  borderRadius: 10,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                💾 Saqlash
              </button>
              <button
                onClick={() => setShowSettings(false)}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "var(--surface)",
                  color: "var(--text)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Bekor qilish
              </button>
            </div>

            {/* DEBUG TERMINAL INSIDE SETTINGS */}
            {debugLogs.length > 0 && (
              <div
                style={{
                  marginTop: 20,
                  borderTop: "1px solid #E2E8F0",
                  paddingTop: 16,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8,
                    fontSize: 12,
                    fontWeight: 700,
                    color: "var(--muted)",
                  }}
                >
                  <span>🖥️ DEBUG LOGS</span>
                  <button
                    onClick={() => setDebugLogs([])}
                    style={{
                      background: "transparent",
                      color: "#F43F5E",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 11,
                    }}
                  >
                    Tozalash
                  </button>
                </div>
                <div
                  style={{
                    maxHeight: 180,
                    overflowY: "auto",
                    background: "#0F172A",
                    color: "#38BDF8",
                    padding: 12,
                    borderRadius: 8,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 11,
                    textAlign: "left",
                  }}
                >
                  {debugLogs.map((log, i) => (
                    <div
                      key={i}
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                        paddingBottom: 4,
                        marginBottom: 4,
                        wordBreak: "break-all",
                      }}
                    >
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DEBUG TERMINAL REMOVED FROM MAIN PAGE AS REQUESTED */}

      {/* GEMINI API KEY SOZLAMALARI (MODAL) */}
      {showGeminiModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15,23,42,0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "var(--card)",
              width: 450,
              borderRadius: 24,
              padding: 32,
              boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
            }}
          >
            <div
              style={{ fontSize: 40, marginBottom: 16, textAlign: "center" }}
            >
              ✨
            </div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: "var(--text)",
                marginBottom: 12,
                textAlign: "center",
              }}
            >
              AI API Sozlamalari
            </div>
            <div
              style={{
                fontSize: 15,
                color: "var(--muted)",
                marginBottom: 24,
                textAlign: "center",
                lineHeight: 1.5,
              }}
            >
              Ma'ruzalarni yozdirish uchun <b>Gemini</b> yoki{" "}
              <b>Groq (gsk_...)</b> API kalitini kiriting. Groq butunlay bepul
              va juda tez!
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
                marginBottom: 32,
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 6,
                  }}
                >
                  <label
                    style={{
                      display: "block",
                      fontSize: 13,
                      fontWeight: 700,
                      color: "var(--muted)",
                    }}
                  >
                    API Kalit (AIza... yoki gsk_...)
                  </label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <a
                      href="https://console.groq.com/keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: 12,
                        color: "#F97316",
                        textDecoration: "none",
                        fontWeight: 600,
                      }}
                    >
                      Groq ↗
                    </a>
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: 12,
                        color: "#2563EB",
                        textDecoration: "none",
                        fontWeight: 600,
                      }}
                    >
                      Gemini ↗
                    </a>
                  </div>
                </div>
                <input
                  type="password"
                  value={tempGeminiKey}
                  onChange={(e) => setTempGeminiKey(e.target.value)}
                  placeholder="AIza... yoki gsk_..."
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    outline: "none",
                    fontSize: 15,
                    background: "var(--bg)",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--muted)",
                    marginBottom: 6,
                  }}
                >
                  AI Modelini tanlang
                </label>
                <select
                  value={geminiModel}
                  onChange={(e) => setGeminiModel(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    outline: "none",
                    fontSize: 15,
                    background: "var(--bg)",
                    cursor: "pointer",
                  }}
                >
                  <optgroup label="Groq (Tez va Bepul)">
                    <option value="llama-3.3-70b-versatile">
                      Llama 3.3 70B (Eng aqlli)
                    </option>
                    <option value="mixtral-8x7b-32768">
                      Mixtral 8x7B (Tezkor)
                    </option>
                    <option value="gemma2-9b-it">Gemma 2 9B</option>
                  </optgroup>
                  <optgroup label="Google Gemini">
                    <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                    <option value="gemini-1.5-flash-latest">
                      Gemini 1.5 Flash Latest
                    </option>
                    <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                    <option value="gemini-1.5-pro-latest">
                      Gemini 1.5 Pro
                    </option>
                    <option value="gemini-pro">Gemini Pro</option>
                  </optgroup>
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => setShowGeminiModal(false)}
                style={{
                  flex: 1,
                  padding: 14,
                  borderRadius: 12,
                  border: "1px solid var(--border)",
                  background: "var(--card)",
                  color: "var(--muted)",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Bekor qilish
              </button>
              <button
                onClick={saveGeminiSettings}
                style={{
                  flex: 1,
                  padding: 14,
                  borderRadius: 12,
                  border: "none",
                  background: "#22C55E",
                  color: "white",
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(34,197,94,0.2)",
                }}
              >
                💾 Saqlash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3D FULLSCREEN INTRO OVERLAY */}
      {showIntro &&
        (introData.labHtml ? (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 10000,
              background: "#000",
              animation: "fadeIn 0.5s ease",
            }}
          >
            <iframe
              srcDoc={injectBridgeScript(introData.labHtml)}
              style={{ width: "100%", height: "100%", border: "none" }}
              title="Vizual Lab"
            />
            {/* Overlay Header */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                padding: "20px 40px",
                background:
                  "linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                pointerEvents: "none",
              }}
            >
              <div>
                <div
                  style={{
                    color: "rgba(255,255,255,0.6)",
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: 2,
                  }}
                >
                  {introData.chorak}
                </div>
                <div
                  style={{
                    color: "#fff",
                    fontSize: 24,
                    fontWeight: 800,
                    fontFamily: "'Space Grotesk'",
                  }}
                >
                  {introData.name}
                </div>
              </div>
              <div style={{ display: "flex", gap: 12, pointerEvents: "auto" }}>
                <button
                  onClick={() => setShowIntro(false)}
                  style={{
                    padding: "12px 24px",
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.2)",
                    background: "rgba(0,0,0,0.4)",
                    color: "#fff",
                    fontWeight: 700,
                    cursor: "pointer",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  ✕ Yopish
                </button>
                <button
                  onClick={startLecture}
                  style={{
                    padding: "12px 24px",
                    borderRadius: 12,
                    border: "none",
                    background: "#22C55E",
                    color: "#fff",
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 4px 15px rgba(34,197,94,0.3)",
                  }}
                >
                  ▶ Darsni davom ettirish
                </button>
              </div>
            </div>
            {/* Floating Hint */}
            <div
              style={{
                position: "absolute",
                bottom: 40,
                left: "50%",
                transform: "translateX(-50%)",
                background: "rgba(0,0,0,0.5)",
                color: "#fff",
                padding: "8px 20px",
                borderRadius: 20,
                fontSize: 13,
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              💡 Vizual muhit bilan tanishib chiqing va darsni boshlang
            </div>
          </div>
        ) : (
          <Lesson3DIntro
            topicName={introData.name}
            chorakLabel={introData.chorak}
            onComplete={startLecture}
            onClose={() => setShowIntro(false)}
          />
        ))}
    </div>
  );
}
