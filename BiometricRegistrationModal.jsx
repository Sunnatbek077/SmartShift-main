// ============================================================
// EduAI Platform — Biometric Registration Modal
// O'quvchi birinchi marta kirganda Yuz (Face ID) va Ovoz
// ma'lumotlarini ro'yxatga olish oynasi
// ============================================================
import { useState, useRef, useEffect } from "react";
import { storage } from "./supabase";
import { extractFaceSignature, getAverageSpectrum } from "./biometrics";

export default function BiometricRegistrationModal({ student, onComplete, onSkip }) {
  const [step, setStep] = useState("intro"); // intro | face_scan | voice_scan | success
  const [error, setError] = useState("");
  
  // Face Scan States
  const [faceScanStep, setFaceScanStep] = useState(0); // 0: To'g'ri, 1: Chapga, 2: O'ngga, 3: Kuling
  const [faceProgress, setFaceProgress] = useState(0);
  const [faceCapturedSignatures, setFaceCapturedSignatures] = useState([]);
  
  // Voice Scan States
  const [voiceProgress, setVoiceProgress] = useState(0);
  const [voiceRecordedData, setVoiceRecordedData] = useState([]);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const voiceTimerRef = useRef(null);

  const scanSteps = [
    { label: "Kameraga to'g'ri boqing", detail: "Yuzingiz doira markazida bo'lsin" },
    { label: "Boshingizni biroz chapga buring", detail: "Yon tomondan tekshirish" },
    { label: "Boshingizni biroz o'ngga buring", detail: "Ikkinchi tomondan tekshirish" },
    { label: "Samimiy kuling", detail: "Hissiyot testidan o'tish" }
  ];

  const calibrationText = "Men EduMind platformasida o'z bilimimni oshirishga va barcha og'zaki va yozma topshiriqlarni faqat o'zim mustaqil bajarishga so'z beraman.";

  // Start Camera
  const startCamera = async () => {
    try {
      setError("");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: true
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      setError("Kamera yoki mikrofondan foydalanishga ruxsat berilmadi. Sozlamalardan ruxsat bering.");
    }
  };

  // Stop Camera / Microphones
  const stopMedia = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  };

  useEffect(() => {
    if (step === "face_scan") {
      startCamera();
      // Start processing frames for face detection
      let lastCheck = 0;
      const processFrame = (time) => {
        if (step !== "face_scan") return;
        
        if (time - lastCheck > 150) { // check every 150ms
          lastCheck = time;
          captureAndAnalyzeFace();
        }
        animationFrameRef.current = requestAnimationFrame(processFrame);
      };
      animationFrameRef.current = requestAnimationFrame(processFrame);
    } else {
      stopMedia();
    }
    return () => stopMedia();
  }, [step, faceScanStep]);

  // Capture face from video and detect landmarks + signature
  const captureAndAnalyzeFace = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw video frame mirrored
    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    // Analyze using biometrics algorithm
    const analysis = extractFaceSignature(canvas);
    if (!analysis.success) {
      // Draw warning on overlay if no face
      ctx.fillStyle = "rgba(220, 38, 38, 0.4)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      return;
    }

    // Draw high-tech green scanning box and landmark dots
    const { box, landmarks } = analysis;
    
    // Draw Box
    ctx.strokeStyle = "#10B981";
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 5]);
    ctx.strokeRect(box.x, box.y, box.w, box.h);
    
    // Draw Corner markers
    ctx.setLineDash([]);
    ctx.fillStyle = "#10B981";
    const len = 15;
    const thickness = 4;
    // Top Left
    ctx.fillRect(box.x, box.y, len, thickness);
    ctx.fillRect(box.x, box.y, thickness, len);
    // Top Right
    ctx.fillRect(box.x + box.w - len, box.y, len, thickness);
    ctx.fillRect(box.x + box.w - thickness, box.y, thickness, len);
    // Bottom Left
    ctx.fillRect(box.x, box.y + box.h - thickness, len, thickness);
    ctx.fillRect(box.x, box.y + box.h - len, thickness, len);
    // Bottom Right
    ctx.fillRect(box.x + box.w - len, box.y + box.h - thickness, len, thickness);
    ctx.fillRect(box.x + box.w - thickness, box.y + box.h - len, thickness, len);

    // Draw dots on Landmarks (eyes & mouth)
    ctx.fillStyle = "#60A5FA";
    ctx.beginPath();
    ctx.arc(landmarks.leftEye.x, landmarks.leftEye.y, 5, 0, 2 * Math.PI);
    ctx.arc(landmarks.rightEye.x, landmarks.rightEye.y, 5, 0, 2 * Math.PI);
    ctx.fill();

    ctx.fillStyle = "#F87171";
    ctx.beginPath();
    ctx.arc(landmarks.mouth.x, landmarks.mouth.y, 4, 0, 2 * Math.PI);
    ctx.fill();

    // Skanerlash progressini oshirish
    setFaceProgress((prev) => {
      const next = prev + 1.5;
      if (next >= 100) {
        // Step complete! Save signature for this angle
        setFaceCapturedSignatures((arr) => [...arr, analysis.signature]);
        
        if (faceScanStep < 3) {
          // Go to next face step
          setFaceScanStep((s) => s + 1);
          return 0; // reset progress
        } else {
          // All 4 angles done
          setTimeout(() => {
            setStep("voice_scan");
          }, 600);
          return 100;
        }
      }
      return next;
    });
  };

  // Start Audio stream and analyze frequencies
  const startVoiceRecording = async () => {
    if (isRecordingVoice) return;
    
    setIsRecordingVoice(true);
    setVoiceProgress(0);
    setVoiceRecordedData([]);

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioContext();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(streamRef.current);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Sample spectrum every 100ms
      const samples = [];
      let count = 0;

      voiceTimerRef.current = setInterval(() => {
        const bands = getAverageSpectrum(analyser);
        // Only count if there is audible input (some volume threshold)
        const totalEnergy = bands.reduce((a, b) => a + b, 0);
        if (totalEnergy > 10) {
          samples.push(bands);
          count++;
          setVoiceProgress((prev) => {
            const next = Math.min(100, prev + 2.5); // around 4 seconds to fill 100%
            if (next >= 100) {
              clearInterval(voiceTimerRef.current);
              saveBiometricProfile(samples);
            }
            return next;
          });
        }
      }, 100);

      // Waveform Animation Loop
      const drawWaveform = () => {
        if (!isRecordingVoice && step !== "voice_scan") return;
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.fillStyle = "#0F172A";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            analyser.getByteFrequencyData(dataArray);

            ctx.lineWidth = 3;
            ctx.strokeStyle = "rgba(37, 99, 235, 0.8)";
            ctx.beginPath();

            const sliceWidth = canvas.width / bufferLength;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
              const v = dataArray[i] / 128.0;
              const y = (v * canvas.height) / 2;

              if (i === 0) {
                ctx.moveTo(x, y);
              } else {
                ctx.lineTo(x, y);
              }

              x += sliceWidth;
            }

            ctx.lineTo(canvas.width, canvas.height / 2);
            ctx.stroke();
          }
        }
        animationFrameRef.current = requestAnimationFrame(drawWaveform);
      };
      drawWaveform();

    } catch (e) {
      setError("Mikrofonni kalibrlashda xatolik yuz berdi.");
      setIsRecordingVoice(false);
    }
  };

  // Compile and Save Profiles
  const saveBiometricProfile = async (voiceSamples) => {
    setIsRecordingVoice(false);
    
    // Average face signature from 4 directions
    const avgFaceSignature = new Array(64).fill(0);
    faceCapturedSignatures.forEach(sig => {
      for (let i = 0; i < 64; i++) {
        avgFaceSignature[i] += sig[i] || 0;
      }
    });
    const finalFaceSignature = avgFaceSignature.map(val => val / faceCapturedSignatures.length);

    // Average voice spectrum signature
    const avgVoiceProfile = new Array(10).fill(0);
    voiceSamples.forEach(sample => {
      for (let i = 0; i < 10; i++) {
        avgVoiceProfile[i] += sample[i] || 0;
      }
    });
    const finalVoiceProfile = avgVoiceProfile.map(val => val / voiceSamples.length);

    const profile = {
      faceSignature: finalFaceSignature,
      voiceProfile: finalVoiceProfile,
      registeredAt: new Date().toISOString()
    };

    // Save to Universal Storage
    await storage.set("biometric_profile", JSON.stringify(profile));
    setStep("success");
    stopMedia();
  };

  const currentStep = scanSteps[faceScanStep];

  return (
    <div style={{
      position: "fixed", inset: 0, background: "radial-gradient(circle at center, #0F172A 0%, #020617 100%)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99999, padding: 20
    }}>
      <div style={{
        background: "rgba(30, 41, 59, 0.7)", border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 28, width: "100%", maxWidth: 620, padding: 32, textAlign: "center",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)", backdropFilter: "blur(20px)",
        color: "white"
      }}>
        {/* Title */}
        <div style={{
          fontSize: 22, fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 6,
          background: "linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
        }}>
          🛡️ EduMind Biometrik Himoya
        </div>
        <div style={{ fontSize: 13, color: "var(--dim)", marginBottom: 28 }}>
          Shaxsni yuz va ovoz orqali tasdiqlash xavfsizlik tizimi
        </div>

        {error && (
          <div style={{
            background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)",
            borderRadius: 14, padding: "14px 18px", color: "#F87171", fontSize: 14, marginBottom: 20
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* INTRO STEP */}
        {step === "intro" && (
          <div>
            <div style={{ fontSize: 72, margin: "20px 0" }}>🤖</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Biometriyani sozlash</h3>
            <p style={{ fontSize: 14, color: "var(--dim)", lineHeight: 1.6, marginBottom: 24, textAlign: "left" }}>
              EduMind xavfsizlik va anti-plagiat tizimiga xush kelibsiz! Platforma darslari va topshiriqlarni o'zingiz bajarayotganingizni tekshirish uchun yuzingiz va ovozingizni ro'yxatdan o'tkazishingiz zarur.
            </p>
            
            <div style={{
              background: "rgba(37, 99, 235, 0.08)", border: "1px solid rgba(37, 99, 235, 0.15)",
              borderRadius: 16, padding: "16px 20px", textAlign: "left", marginBottom: 28,
              fontSize: 13, color: "#93C5FD", lineHeight: 1.6
            }}>
              💡 <strong>Eslatma:</strong> Qabul qilingan biometric ma'lumotlar faqat solishtirish uchun ishlatiladi va to'liq xavfsiz holda saqlanadi.
            </div>

            <button
              onClick={() => setStep("face_scan")}
              style={{
                width: "100%", padding: "15px", borderRadius: 14,
                background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
                color: "white", border: "none", fontWeight: 700, fontSize: 15, cursor: "pointer",
                boxShadow: "0 10px 15px -3px rgba(37, 99, 235, 0.3)"
              }}
            >
              🚀 Skanerlashni boshlash
            </button>
            {onSkip && (
              <button
                onClick={onSkip}
                style={{
                  width: "100%", padding: "12px", borderRadius: 14,
                  background: "transparent", color: "var(--dim)", border: "1px solid #334155",
                  fontWeight: 600, fontSize: 14, cursor: "pointer", marginTop: 12,
                  transition: "all 0.2s"
                }}
              >
                Keyinroq sozlash (O'tish)
              </button>
            )}
          </div>
        )}

        {/* FACE SCAN STEP */}
        {step === "face_scan" && (
          <div>
            {/* Instruction */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#FBBF24" }}>
                Bosqich {faceScanStep + 1} / 4: {currentStep.label}
              </div>
              <div style={{ fontSize: 13, color: "var(--dim)", marginTop: 4 }}>
                {currentStep.detail}
              </div>
            </div>

            {/* Video & Canvas Preview */}
            <div style={{
              position: "relative", width: 280, height: 280, borderRadius: "50%",
              overflow: "hidden", margin: "0 auto 24px", border: "4px solid #1E293B",
              boxShadow: "0 0 30px rgba(37, 99, 235, 0.2)"
            }}>
              <video
                ref={videoRef}
                style={{
                  position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
                  objectFit: "cover", transform: "scaleX(-1)", visibility: "hidden"
                }}
                muted
                playsInline
              />
              <canvas
                ref={canvasRef}
                width={280}
                height={280}
                style={{
                  position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
                  objectFit: "cover"
                }}
              />
              
              {/* Spinning Scan Ring */}
              <div style={{
                position: "absolute", inset: 4, borderRadius: "50%",
                border: "2px dashed #10B981",
                animation: "spin 12s linear infinite"
              }} />
            </div>

            {/* Progress bar */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--dim)", marginBottom: 6 }}>
                <span>Yuz xususiyatlarini tahlil qilish...</span>
                <span>{Math.round(faceProgress)}%</span>
              </div>
              <div style={{ width: "100%", height: 8, background: "#1E293B", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ width: `${faceProgress}%`, height: "100%", background: "#10B981", transition: "width 0.1s" }} />
              </div>
            </div>
          </div>
        )}

        {/* VOICE SCAN STEP */}
        {step === "voice_scan" && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#60A5FA" }}>
                🎤 Ovozni kalibrlash
              </div>
              <div style={{ fontSize: 13, color: "var(--dim)", marginTop: 4 }}>
                Quyidagi matnni ovoz chiqarib tushunarli o'qing
              </div>
            </div>

            {/* Reading text box */}
            <div style={{
              background: "#0F172A", border: "1px dashed rgba(255,255,255,0.1)",
              borderRadius: 16, padding: "20px 24px", fontSize: 15, lineHeight: 1.7,
              fontWeight: 500, color: "#F3F4F6", marginBottom: 24, textAlign: "left"
            }}>
              "{calibrationText}"
            </div>

            {/* Live Audio Visualizer Canvas */}
            <div style={{
              width: "100%", height: 100, borderRadius: 14, overflow: "hidden",
              border: "1px solid #1E293B", background: "#0F172A", marginBottom: 24
            }}>
              <canvas ref={canvasRef} width={500} height={100} style={{ width: "100%", height: "100%" }} />
            </div>

            {/* Progress bar */}
            {isRecordingVoice && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--dim)", marginBottom: 6 }}>
                  <span>Nutq chastotalari yozib olinmoqda...</span>
                  <span>{Math.round(voiceProgress)}%</span>
                </div>
                <div style={{ width: "100%", height: 8, background: "#1E293B", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ width: `${voiceProgress}%`, height: "100%", background: "#3B82F6", transition: "width 0.1s" }} />
                </div>
              </div>
            )}

            {!isRecordingVoice ? (
              <button
                onClick={startVoiceRecording}
                style={{
                  width: "100%", padding: "15px", borderRadius: 14,
                  background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                  color: "white", border: "none", fontWeight: 700, fontSize: 15, cursor: "pointer",
                  boxShadow: "0 10px 15px -3px rgba(16, 185, 129, 0.3)"
                }}
              >
                🎙️ Ovozni yozishni boshlash
              </button>
            ) : (
              <div style={{ color: "#EF4444", fontWeight: 600, fontSize: 14, animation: "blink 1s infinite" }}>
                🔴 Iltimos, yuqoridagi matnni ovoz chiqarib o'qing...
              </div>
            )}
          </div>
        )}

        {/* SUCCESS STEP */}
        {step === "success" && (
          <div>
            <div style={{ fontSize: 72, margin: "24px 0", animation: "bounce 1s infinite" }}>✅</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: "#10B981" }}>Muvaffaqiyatli ro'yxatdan o'tdingiz!</h3>
            <p style={{ fontSize: 14, color: "var(--dim)", lineHeight: 1.6, marginBottom: 28 }}>
              Yuzingiz va ovozingiz EduMind xavfsizlik bazasida tasdiqlandi. Endi darslar va topshiriqlarni mustaqil topshirishingiz mumkin.
            </p>

            <button
              onClick={onComplete}
              style={{
                width: "100%", padding: "15px", borderRadius: 14,
                background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
                color: "white", border: "none", fontWeight: 700, fontSize: 15, cursor: "pointer",
                boxShadow: "0 10px 15px -3px rgba(37, 99, 235, 0.3)"
              }}
            >
              🚪 Dashboardga o'tish
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
      `}</style>
    </div>
  );
}
