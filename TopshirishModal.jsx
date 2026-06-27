// ============================================================
// EduAI Platform — MAVZUNI TOPSHIRISH MODALI
// Talaba kameraga qarab mavzuni gapiradi → AI baholaydi
// Ovoz yozib olinadi → profil ovozi bilan taqqoslanadi
// ============================================================
import { useState, useRef, useEffect } from "react";
import { storage } from "./supabase";
import { getCurrentUser, saveResult } from "./auth";
import { extractFaceSignature, compareFaceSignatures, getAverageSpectrum, compareVoiceProfiles } from "./biometrics";

export default function TopshirishModal({ topic, fan, geminiKey, onClose }) {
  const [step, setStep] = useState("intro"); // intro | recording | analyzing | result
  const [countdown, setCountdown] = useState(3);
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [score, setScore] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [cameraOn, setCameraOn] = useState(false);
  const [voiceMatch, setVoiceMatch] = useState(null); // null | true | false
  const [isListening, setIsListening] = useState(false);
  const [faceMatch, setFaceMatch] = useState(null); // null | true | false
  const [faceScore, setFaceScore] = useState(0);
  const [voiceScore, setVoiceScore] = useState(0);
  const [faceCheckCount, setFaceCheckCount] = useState(0);
  const [faceMatchCount, setFaceMatchCount] = useState(0);
  const [biometricProfile, setBiometricProfile] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const transcriptRef = useRef("");
  
  const voiceSamplesRef = useRef([]);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);

  // Kamerani yoqish
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraOn(true);
    } catch (e) {
      setError("Kamera yoki mikrofon ruxsati berilmadi. Brauzer sozlamalaridan ruxsat bering.");
    }
  };

  // Kamerani o'chirish
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraOn(false);
  };

  // Ovoz yozib olish (Web Speech API)
  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Brauzeringiz ovoz tanishni qo'llab-quvvatlamaydi. Chrome ishlatib ko'ring.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "uz-UZ";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (e) => {
      let full = "";
      for (let i = 0; i < e.results.length; i++) {
        full += e.results[i][0].transcript + " ";
      }
      transcriptRef.current = full.trim();
      setTranscript(full.trim());
    };

    recognition.onerror = (e) => {
      if (e.error !== "no-speech") {
        setError(`Ovoz xatosi: ${e.error}`);
      }
    };

    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);

    // Set up real AudioContext for frequency mapping
    voiceSamplesRef.current = [];
    if (streamRef.current) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const audioCtx = new AudioContext();
        audioContextRef.current = audioCtx;
        const source = audioCtx.createMediaStreamSource(streamRef.current);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 128;
        source.connect(analyser);
        analyserRef.current = analyser;
      } catch (e) {
        console.error("Audio analyzer error:", e);
      }
    }

    // Reset face check counters
    setFaceCheckCount(0);
    setFaceMatchCount(0);
    setFaceMatch(null);

    // Background Face ID check helper
    const checkFaceBackground = () => {
      const video = videoRef.current;
      if (video && video.readyState === video.HAVE_ENOUGH_DATA) {
        const canvas = document.createElement("canvas");
        canvas.width = 160;
        canvas.height = 120;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.save();
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          ctx.restore();

          const result = extractFaceSignature(canvas);
          if (result.success && biometricProfile?.faceSignature) {
            const similarity = compareFaceSignatures(result.signature, biometricProfile.faceSignature);
            const isMatch = similarity >= 0.62; // threshold
            
            setFaceCheckCount(c => c + 1);
            if (isMatch) setFaceMatchCount(m => m + 1);
            
            setFaceMatch(isMatch);
            setFaceScore(Math.round(similarity * 100));
          }
        }
      }
    };

    // Vaqt hisoblagich
    let sec = 0;
    timerRef.current = setInterval(() => {
      sec++;
      setRecordingTime(sec);
      
      // Face ID check every 3 seconds
      if (sec % 3 === 0) {
        checkFaceBackground();
      }

      // Voice sample profiling every 500ms
      if (analyserRef.current) {
        const bands = getAverageSpectrum(analyserRef.current);
        const energy = bands.reduce((a, b) => a + b, 0);
        if (energy > 10) {
          voiceSamplesRef.current.push(bands);
        }
      }

      if (sec >= 120) stopRecording(); // Max 2 daqiqa
    }, 1000);
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsListening(false);

    // Stop and evaluate voice profile
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }

    if (voiceSamplesRef.current.length > 0 && biometricProfile?.voiceProfile) {
      const avgVoiceProfile = new Array(10).fill(0);
      voiceSamplesRef.current.forEach(sample => {
        for (let i = 0; i < 10; i++) {
          avgVoiceProfile[i] += sample[i] || 0;
        }
      });
      const finalVoiceProfile = avgVoiceProfile.map(val => val / voiceSamplesRef.current.length);
      const similarity = compareVoiceProfiles(finalVoiceProfile, biometricProfile.voiceProfile);
      const isMatch = similarity >= 0.68; // threshold
      
      setVoiceMatch(isMatch);
      setVoiceScore(Math.round(similarity * 100));
    }
  };

  // Countdown va yozishni boshlash
  const startWithCountdown = () => {
    setStep("countdown");
    let c = 3;
    setCountdown(c);
    const interval = setInterval(() => {
      c--;
      setCountdown(c);
      if (c === 0) {
        clearInterval(interval);
        setStep("recording");
        startRecording();
      }
    }, 1000);
  };

  // AI baholash
  const analyzeWithAI = async () => {
    stopRecording();
    const finalText = transcriptRef.current || transcript;

    if (!finalText || finalText.trim().length < 20) {
      setError("Juda kam gapirildi. Qaytadan urinib ko'ring.");
      setStep("recording");
      return;
    }

    // Evaluate Face ID match percentage
    const finalFaceMatched = faceCheckCount > 0 ? (faceMatchCount / faceCheckCount >= 0.5) : true;
    const finalVoiceMatched = voiceMatch !== null ? voiceMatch : true;

    // Check biometrics for anti-cheating block
    if (biometricProfile && (!finalFaceMatched || !finalVoiceMatched)) {
      setError("⚠️ Anti-Plagiat Himoyasi: Yuz (Face ID) yoki ovoz (Voice Match) biometrikasi mos kelmadi! Topshiriqni boshqa shaxs topshirayotgani aniqlanib, urinish bloklandi.");
      setStep("intro");
      return;
    }

    setStep("analyzing");

    if (!geminiKey) {
      // Gemini yo'q — oddiy baholash
      const wordCount = finalText.split(" ").length;
      const topicWords = topic.name.toLowerCase().split(" ");
      const mentionedTopicWords = topicWords.filter(w => finalText.toLowerCase().includes(w)).length;
      const coverage = Math.round((mentionedTopicWords / Math.max(topicWords.length, 1)) * 100);
      const baseScore = Math.min(100, Math.round((wordCount / 50) * 40 + coverage * 0.6));

      setScore(baseScore);
      setFeedback(`Siz ${wordCount} so'z gapiradingiz. Mavzu kalit so'zlari ${coverage}% qamrab olindi.`);
      setStep("result");
      saveResult_(baseScore, finalText);
      return;
    }

    try {
      const prompt = `Sen tajribali o'zbek tili o'qituvchisisan va talabalarni og'zaki baholaysan.

Mavzu: "${topic.name}"
Fan: "${fan?.name || "Umumiy"}"
${topic.aiIntro ? `Mavzu haqida qisqacha: ${topic.aiIntro.slice(0, 300)}` : ""}

Talabaning og'zaki javobi (ovozdan matn):
"${finalText}"

Quyidagi mezonlar asosida 100 ballik tizimda baholash:
1. Mavzuni tushunish darajasi (0-40 ball)
2. Mazmun to'liqligi (0-30 ball)  
3. Til va nutq aniqligi (0-20 ball)
4. Mantiqiy ketma-ketlik (0-10 ball)

Javobingni FAQAT quyidagi JSON formatda ber (boshqa hech narsa yozma):
{
  "ball": 75,
  "daraja": "Yaxshi",
  "kuchli_tomonlar": "Mavzuning asosiy qismlarini tushuntirdi",
  "zaif_tomonlar": "Misollar yetarli emas edi",
  "tavsiya": "Keyingi safar ko'proq misol keltiring",
  "xulosa": "Talaba mavzuni o'rtacha darajada tushungan"
}`;

      const resp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        }
      );
      const data = await resp.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

      // JSON ni ajratib olish
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        setScore(result.ball);
        setFeedback(result);
        saveResult_(result.ball, finalText, result);
      } else {
        setScore(60);
        setFeedback({ xulosa: text.slice(0, 300), ball: 60 });
        saveResult_(60, finalText);
      }
    } catch (e) {
      setScore(50);
      setFeedback({ xulosa: "AI baholashda xato yuz berdi. Natija taxminiy.", ball: 50 });
      saveResult_(50, finalText);
    }

    setStep("result");
  };

  const saveResult_ = (ball, text, details = null) => {
    const currentUser = getCurrentUser();
    
    // Add biometric info to details
    const bioDetails = {
      ...details,
      biometrics: {
        faceMatch: faceCheckCount > 0 ? (faceMatchCount / faceCheckCount >= 0.5) : true,
        faceScore: faceScore,
        voiceMatch: voiceMatch !== null ? voiceMatch : true,
        voiceScore: voiceScore,
        checkedAt: new Date().toISOString()
      }
    };

    // Supabase ga saqlash (talaba bo'lsa)
    if (currentUser?.role === "student") {
      saveResult({
        studentId: currentUser.id,
        topicId: topic.id,
        topicName: topic.name,
        fanId: fan?.id || "unknown",
        fanName: fan?.name || "Umumiy",
        score: ball,
        transcript: text,
        details: bioDetails,
      });
    }
    // localStorage ga ham saqlash
    const key = `topshirish_${topic.id}`;
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    existing.push({
      date: new Date().toISOString(),
      ball,
      text: text.slice(0, 500),
      details: bioDetails,
      voiceMatch,
      faceMatch
    });
    storage.set(key, JSON.stringify(existing.slice(-5)));
  };

  useEffect(() => {
    const loadProfile = async () => {
      const saved = await storage.get("biometric_profile");
      if (saved) {
        try {
          setBiometricProfile(JSON.parse(saved));
        } catch (e) {}
      }
    };
    loadProfile();
    startCamera();
    return () => {
      stopCamera();
      stopRecording();
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  const scoreColor = score >= 80 ? "#059669" : score >= 60 ? "#D97706" : "#DC2626";
  const scoreEmoji = score >= 80 ? "🏆" : score >= 60 ? "👍" : "💪";
  const scoreLabel = score >= 80 ? "A'lo" : score >= 60 ? "Yaxshi" : "Qayta o'qing";

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(15,23,42,0.85)",
      backdropFilter: "blur(8px)", display: "flex", alignItems: "center",
      justifyContent: "center", zIndex: 20000, padding: 20
    }}>
      <div style={{
        background: "#fff", borderRadius: 24, width: "100%", maxWidth: 700,
        maxHeight: "90vh", overflowY: "auto",
        boxShadow: "0 32px 64px rgba(0,0,0,0.3)"
      }}>
        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg, #1E293B 0%, #2563EB 100%)",
          borderRadius: "24px 24px 0 0", padding: "20px 24px",
          display: "flex", justifyContent: "space-between", alignItems: "center"
        }}>
          <div>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, marginBottom: 4 }}>
              📋 Mavzuni topshirish
            </div>
            <div style={{ color: "white", fontWeight: 700, fontSize: 18 }}>
              {topic.name}
            </div>
          </div>
          <button onClick={onClose} style={{
            background: "rgba(255,255,255,0.15)", border: "none", color: "white",
            width: 36, height: 36, borderRadius: "50%", cursor: "pointer", fontSize: 18
          }}>✕</button>
        </div>

        <div style={{ padding: 24 }}>
          {/* Kamera */}
          <div style={{
            position: "relative", background: "#0F172A", borderRadius: 16,
            overflow: "hidden", marginBottom: 20,
            aspectRatio: "16/9", maxHeight: 280
          }}>
            <video ref={videoRef} style={{
              width: "100%", height: "100%", objectFit: "cover",
              transform: "scaleX(-1)" // Ko'zgu effekti
            }} muted />

            {!cameraOn && (
              <div style={{
                position: "absolute", inset: 0, display: "flex",
                flexDirection: "column", alignItems: "center", justifyContent: "center",
                color: "white"
              }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📷</div>
                <div style={{ fontSize: 16, opacity: 0.7 }}>Kamera yuklanmoqda...</div>
              </div>
            )}

            {/* Countdown overlay */}
            {step === "countdown" && (
              <div style={{
                position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <div style={{
                  fontSize: 120, fontWeight: 900, color: "white",
                  animation: "pulse 1s ease-in-out"
                }}>{countdown}</div>
              </div>
            )}

            {/* Recording indicator */}
            {step === "recording" && (
              <div style={{
                position: "absolute", top: 12, left: 12,
                display: "flex", alignItems: "center", gap: 8,
                background: "rgba(220,38,38,0.9)", padding: "6px 14px",
                borderRadius: 20, color: "white", fontSize: 13, fontWeight: 700
              }}>
                <div style={{
                  width: 10, height: 10, borderRadius: "50%", background: "white",
                  animation: "blink 1s infinite"
                }} />
                {Math.floor(recordingTime / 60)}:{String(recordingTime % 60).padStart(2, "0")}
              </div>
            )}

            {/* Face match indicator */}
            {faceMatch !== null && (
              <div style={{
                position: "absolute", top: 12, right: 12,
                background: faceMatch ? "rgba(5,150,105,0.9)" : "rgba(220,38,38,0.9)",
                padding: "6px 14px", borderRadius: 20, color: "white", fontSize: 12, fontWeight: 700
              }}>
                {faceMatch ? `✅ Face ID tasdiqlandi (${faceScore}%)` : `⚠️ Yuz mos emas (${faceScore}%)`}
              </div>
            )}

            {/* Voice match indicator */}
            {voiceMatch !== null && (
              <div style={{
                position: "absolute", top: 46, right: 12,
                background: voiceMatch ? "rgba(5,150,105,0.9)" : "rgba(220,38,38,0.9)",
                padding: "6px 14px", borderRadius: 20, color: "white", fontSize: 12, fontWeight: 700
              }}>
                {voiceMatch ? `✅ Ovoz tasdiqlandi (${voiceScore}%)` : `⚠️ Ovoz mos emas (${voiceScore}%)`}
              </div>
            )}
          </div>

          {error && (
            <div style={{
              background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.2)",
              borderRadius: 12, padding: "12px 16px", marginBottom: 16,
              color: "#DC2626", fontSize: 14
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* INTRO */}
          {step === "intro" && (
            <div>
              <div style={{
                background: "#F8FAFC", borderRadius: 16, padding: 20, marginBottom: 20,
                border: "1px solid #E2E8F0"
              }}>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 12, color: "var(--text)" }}>
                  📋 Topshirish qoidalari:
                </div>
                <div style={{ fontSize: 14, color: "var(--muted)", lineHeight: 2 }}>
                  1. 🎯 Mavzu: <strong style={{ color: "var(--text)" }}>{topic.name}</strong><br/>
                  2. 📹 Kameraga qarab gapiring — yuzingiz ko'rinib tursin<br/>
                  3. 🎤 Mavzuni o'z so'zlaringiz bilan tushuntiring (1-2 daqiqa)<br/>
                  4. 🤖 AI javobingizni baholaydi va ball beradi<br/>
                  5. 🔒 Ovozingiz profil sifatida saqlanadi (xavfsizlik uchun)
                </div>
              </div>

              {topic.aiIntro && (
                <div style={{
                  background: "rgba(37,99,235,0.04)", border: "1px solid rgba(37,99,235,0.12)",
                  borderRadius: 12, padding: 16, marginBottom: 20, fontSize: 13,
                  color: "#475569", lineHeight: 1.7
                }}>
                  <strong style={{ color: "#2563EB" }}>💡 Eslatma:</strong> {topic.aiIntro.slice(0, 200)}...
                </div>
              )}

              <button
                onClick={startWithCountdown}
                disabled={!cameraOn}
                style={{
                  width: "100%", padding: "16px", borderRadius: 14,
                  background: cameraOn ? "linear-gradient(135deg, #2563EB, #059669)" : "#E2E8F0",
                  color: cameraOn ? "white" : "#94A3B8",
                  border: "none", fontWeight: 700, fontSize: 16, cursor: cameraOn ? "pointer" : "not-allowed",
                  boxShadow: cameraOn ? "0 4px 16px rgba(37,99,235,0.3)" : "none"
                }}
              >
                {cameraOn ? "🎬 Topshirishni boshlash" : "⏳ Kamera yuklanmoqda..."}
              </button>
            </div>
          )}

          {/* RECORDING */}
          {step === "recording" && (
            <div>
              <div style={{
                background: "rgba(220,38,38,0.04)", border: "2px solid rgba(220,38,38,0.2)",
                borderRadius: 16, padding: 20, marginBottom: 20
              }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#DC2626", marginBottom: 12 }}>
                  🎤 Gapiring — mavzuni tushuntiring
                </div>
                <div style={{
                  minHeight: 80, fontSize: 14, lineHeight: 1.7,
                  fontStyle: transcript ? "normal" : "italic",
                  color: transcript ? "#1E293B" : "#94A3B8"
                }}>
                  {transcript || "Ovozingiz shu yerda ko'rinadi..."}
                </div>
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <button
                  onClick={analyzeWithAI}
                  style={{
                    flex: 1, padding: "14px", borderRadius: 12,
                    background: "#2563EB", color: "white",
                    border: "none", fontWeight: 700, fontSize: 15, cursor: "pointer"
                  }}
                >
                  ✅ Tugatish va baholash
                </button>
                <button
                  onClick={() => { stopRecording(); setStep("intro"); setTranscript(""); transcriptRef.current = ""; setRecordingTime(0); }}
                  style={{
                    padding: "14px 20px", borderRadius: 12,
                    background: "#F1F5F9", color: "var(--muted)",
                    border: "1px solid #E2E8F0", fontWeight: 600, cursor: "pointer"
                  }}
                >
                  🔄 Qayta
                </button>
              </div>
            </div>
          )}

          {/* ANALYZING */}
          {step === "analyzing" && (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <div style={{ fontSize: 64, marginBottom: 20 }}>🤖</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>
                AI baholayapti...
              </div>
              <div style={{ fontSize: 14, color: "var(--muted)" }}>
                Javobingiz tahlil qilinmoqda, biroz kuting
              </div>
              <div style={{ marginTop: 24, display: "flex", justifyContent: "center", gap: 8 }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: 12, height: 12, borderRadius: "50%", background: "#2563EB",
                    animation: `bounce 0.6s infinite ${i * 0.2}s`
                  }} />
                ))}
              </div>
            </div>
          )}

          {/* RESULT */}
          {step === "result" && score !== null && (
            <div>
              {/* Ball */}
              <div style={{
                textAlign: "center", padding: "24px 20px",
                background: `linear-gradient(135deg, ${scoreColor}10, ${scoreColor}05)`,
                border: `2px solid ${scoreColor}30`,
                borderRadius: 20, marginBottom: 20
              }}>
                <div style={{ fontSize: 56, marginBottom: 8 }}>{scoreEmoji}</div>
                <div style={{
                  fontSize: 72, fontWeight: 900, color: scoreColor,
                  fontFamily: "'Space Grotesk', sans-serif"
                }}>
                  {score}
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: scoreColor }}>
                  {scoreLabel}
                </div>
                <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 8 }}>
                  100 ballik tizimda
                </div>
              </div>

              {/* Ovoz holati */}
              {voiceMatch !== null && (
                <div style={{
                  padding: "12px 16px", borderRadius: 12, marginBottom: 16,
                  background: voiceMatch ? "rgba(5,150,105,0.06)" : "rgba(220,38,38,0.06)",
                  border: `1px solid ${voiceMatch ? "rgba(5,150,105,0.2)" : "rgba(220,38,38,0.2)"}`,
                  fontSize: 13, color: voiceMatch ? "#059669" : "#DC2626", fontWeight: 600
                }}>
                  {voiceMatch
                    ? "✅ Ovoz profili tasdiqlandi — bu siz ekansiz"
                    : "⚠️ Ovoz profili mos kelmadi — boshqa odam javob bergan bo'lishi mumkin"}
                </div>
              )}

              {/* Batafsil baho */}
              {typeof feedback === "object" && feedback !== null && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {feedback.kuchli_tomonlar && (
                    <div style={{ padding: "12px 16px", borderRadius: 12, background: "rgba(5,150,105,0.06)", border: "1px solid rgba(5,150,105,0.15)", fontSize: 14, color: "#065F46" }}>
                      <strong>✅ Kuchli tomonlar:</strong> {feedback.kuchli_tomonlar}
                    </div>
                  )}
                  {feedback.zaif_tomonlar && (
                    <div style={{ padding: "12px 16px", borderRadius: 12, background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.15)", fontSize: 14, color: "#7F1D1D" }}>
                      <strong>⚠️ Zaif tomonlar:</strong> {feedback.zaif_tomonlar}
                    </div>
                  )}
                  {feedback.tavsiya && (
                    <div style={{ padding: "12px 16px", borderRadius: 12, background: "rgba(37,99,235,0.06)", border: "1px solid rgba(37,99,235,0.15)", fontSize: 14, color: "#1E3A8A" }}>
                      <strong>💡 Tavsiya:</strong> {feedback.tavsiya}
                    </div>
                  )}
                  {feedback.xulosa && (
                    <div style={{ padding: "12px 16px", borderRadius: 12, background: "#F8FAFC", border: "1px solid #E2E8F0", fontSize: 14, color: "#475569" }}>
                      <strong>📝 Xulosa:</strong> {feedback.xulosa}
                    </div>
                  )}
                </div>
              )}

              {typeof feedback === "string" && (
                <div style={{ padding: "12px 16px", borderRadius: 12, background: "#F8FAFC", border: "1px solid #E2E8F0", fontSize: 14, color: "#475569" }}>
                  {feedback}
                </div>
              )}

              <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
                <button
                  onClick={() => { setStep("intro"); setScore(null); setFeedback(""); setTranscript(""); transcriptRef.current = ""; setRecordingTime(0); setVoiceMatch(null); }}
                  style={{
                    flex: 1, padding: "12px", borderRadius: 12,
                    background: "#F1F5F9", color: "var(--text)",
                    border: "1px solid #E2E8F0", fontWeight: 600, cursor: "pointer"
                  }}
                >
                  🔄 Qayta topshirish
                </button>
                <button
                  onClick={onClose}
                  style={{
                    flex: 1, padding: "12px", borderRadius: 12,
                    background: "#2563EB", color: "white",
                    border: "none", fontWeight: 700, cursor: "pointer"
                  }}
                >
                  ✅ Yopish
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }
      `}</style>
    </div>
  );
}
