// ============================================================
// EduAI Platform — Login sahifasi
// O'qituvchi va talaba uchun umumiy kirish
// ============================================================
import { useState, useEffect, useRef } from "react";
import {
  login,
  createTeacher,
  checkTablesExist,
  createTablesWithServiceKey,
  adminLogin,
  isAdminLoggedIn,
  ministryLogin,
} from "./auth";

const loginStyles = `
  .glow-orb { position:fixed; border-radius:50%; filter:blur(60px); opacity:.35; z-index:1; pointer-events:none; animation: float 8s ease-in-out infinite; }
  .orb1{ width:300px;height:300px; background:#ff6a3d; top:-50px; right:5%; animation-delay:0s; }
  .orb2{ width:260px;height:260px; background:#2e8fff; bottom:0; left:0; animation-delay:2s; }
  .orb3{ width:200px;height:200px; background:#ff3d6a; top:40%; right:-60px; animation-delay:4s; }
  @keyframes float { 0%,100% { transform:translateY(0) scale(1); } 50% { transform:translateY(-25px) scale(1.08); } }

  .login-stage { position:relative; z-index:10; width:100%; height:100%; display:flex; align-items:center; justify-content:center; }
  .login-card { width:380px; padding:30px 28px 26px; background:rgba(8,12,24,0.72); border:1px solid rgba(120,160,255,0.25); border-radius:18px; backdrop-filter: blur(14px); box-shadow: 0 0 40px rgba(60,120,255,0.18), 0 0 90px rgba(255,90,60,0.08); text-align:center; opacity:0; transform:translateY(30px) scale(.96); animation: cardIn 1.1s cubic-bezier(.2,.9,.25,1) .3s forwards; }
  @keyframes cardIn { to{ opacity:1; transform:translateY(0) scale(1);} }

  .logo-shield { width:70px; height:74px; margin:0 auto 10px; position:relative; display:flex; align-items:center; justify-content:center; }
  .logo-shield svg { width:100%; height:100%; filter:drop-shadow(0 0 12px rgba(255,60,80,.7)); z-index:2; position:relative; }
  .logo-shield .pulse { position:absolute; inset:-10px; border-radius:50%; background:radial-gradient(circle, rgba(255,70,90,.35), transparent 70%); animation: pulse 2.4s ease-in-out infinite; }
  @keyframes pulse { 0%,100%{ transform:scale(.85); opacity:.5; } 50%{ transform:scale(1.15); opacity:.9; } }

  .login-brand { color:#fff; font-size:24px; font-weight:700; letter-spacing:.5px; margin-bottom:18px; text-shadow:0 0 20px rgba(120,170,255,.4); font-family: 'Segoe UI', Arial, sans-serif; }

  .login-panel { background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:14px; padding:20px 18px; }
  .login-welcome { color:#fff; font-size:19px; font-weight:600; margin-bottom:16px; font-family: 'Segoe UI', Arial, sans-serif; }

  .role-btn { width:100%; display:flex; align-items:center; justify-content:space-between; padding:13px 18px; margin-bottom:12px; border-radius:30px; border:none; cursor:pointer; font-size:14px; font-weight:600; letter-spacing:.5px; color:#fff; transition: transform .2s ease, box-shadow .3s ease; position:relative; overflow:hidden; font-family: 'Segoe UI', Arial, sans-serif; }
  .role-btn:hover { transform:translateY(-2px) scale(1.02); }
  .role-btn .icon { display:flex; align-items:center; gap:10px; }
  .role-btn .arrow { transition: transform .25s ease; font-size:18px; }
  .role-btn:hover .arrow { transform:translateX(4px); }

  .role-prof { background:linear-gradient(135deg, rgba(255,90,90,.25), rgba(255,90,90,.08)); border:1px solid rgba(255,120,120,.35); }
  .role-prof:hover { box-shadow:0 0 25px rgba(255,90,90,.45); }

  .role-stud { background:linear-gradient(135deg, rgba(70,140,255,.3), rgba(70,140,255,.08)); border:1px solid rgba(110,160,255,.4); }
  .role-stud:hover { box-shadow:0 0 25px rgba(80,140,255,.5); }

  .role-ministry { background:linear-gradient(135deg, rgba(255,200,70,.3), rgba(255,200,70,.08)); border:1px solid rgba(255,210,110,.4); }
  .role-ministry:hover { box-shadow:0 0 25px rgba(255,200,70,.5); }

  .login-links { display:flex; justify-content:center; gap:18px; margin-top:14px; font-size:12.5px; font-family: 'Segoe UI', Arial, sans-serif; }
  .login-links span { color:rgba(255,255,255,.55); text-decoration:none; cursor:pointer; transition: color 0.2s; }
  .login-links span:last-child { color:rgba(180,210,255,.9); }
  .login-links span:hover { color:#fff; }
`;

const ParticlesBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 1.5;
        this.vy = (Math.random() - 0.5) * 1.5;
        this.baseRadius = Math.random() * 2 + 1;
        this.radius = this.baseRadius;
        this.color = 'rgba(100, 150, 255, 0.6)';
      }
      
      update() {
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const dx = cx - this.x;
        const dy = cy - this.y;
        const distToCenter = Math.sqrt(dx * dx + dy * dy);
        
        // Mijaga qarab tortish kuchi (miyaga urilganda ta'sir)
        if (distToCenter < 400) {
           this.vx += (dx / distToCenter) * 0.05;
           this.vy += (dy / distToCenter) * 0.05;
        }

        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > 3) {
            this.vx = (this.vx / speed) * 3;
            this.vy = (this.vy / speed) * 3;
        }

        this.x += this.vx;
        this.y += this.vy;
        
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;

        if (distToCenter < 250) {
            this.radius = this.baseRadius * (1 + (250 - distToCenter) / 100);
            const intensity = Math.min(1, (250 - distToCenter) / 150);
            this.color = `rgba(255, ${150 - intensity * 100}, 50, ${0.6 + intensity * 0.4})`;
        } else {
            this.radius = this.baseRadius;
            this.color = 'rgba(100, 150, 255, 0.6)';
        }
      }
      
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = this.radius * 3;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    const initParticles = () => {
      particles = [];
      const numParticles = Math.floor((canvas.width * canvas.height) / 8000);
      for (let i = 0; i < numParticles; i++) {
        particles.push(new Particle());
      }
    };
    
    initParticles();

    const drawBrain = () => {
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // Dark deep space background
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(canvas.width, canvas.height));
      bgGrad.addColorStop(0, '#0f172a');
      bgGrad.addColorStop(1, '#020617');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Glowing brain aura
      const brainGrad = ctx.createRadialGradient(cx, cy, 50, cx, cy, 400);
      brainGrad.addColorStop(0, 'rgba(239, 68, 68, 0.15)');
      brainGrad.addColorStop(0.4, 'rgba(59, 130, 246, 0.08)');
      brainGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.fillStyle = brainGrad;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 350, 250, 0, 0, Math.PI * 2);
      ctx.fill();
      
      const leftGlow = ctx.createRadialGradient(cx - 200, cy, 10, cx - 200, cy, 200);
      leftGlow.addColorStop(0, 'rgba(255, 150, 50, 0.2)');
      leftGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = leftGlow;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const rightGlow = ctx.createRadialGradient(cx + 200, cy, 10, cx + 200, cy, 200);
      rightGlow.addColorStop(0, 'rgba(255, 150, 50, 0.2)');
      rightGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = rightGlow;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      drawBrain();

      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
        
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 150) {
            ctx.beginPath();
            const cx = canvas.width / 2;
            const cy = canvas.height / 2;
            const midX = (particles[i].x + particles[j].x) / 2;
            const midY = (particles[i].y + particles[j].y) / 2;
            const distToCenter = Math.sqrt((cx - midX) ** 2 + (cy - midY) ** 2);
            
            let strokeStyle = `rgba(100, 150, 255, ${0.3 - distance / 500})`;
            if (distToCenter < 250) {
              const intensity = Math.min(1, (250 - distToCenter) / 150);
              strokeStyle = `rgba(255, ${150 - intensity * 100}, 50, ${(0.3 - distance / 500) + intensity * 0.5})`;
            }

            ctx.strokeStyle = strokeStyle;
            ctx.lineWidth = 1;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none'
      }}
    />
  );
};

export default function LoginPage({ onLogin, onAdminLogin, onMinistryLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showRegister, setShowRegister] = useState(false);
  const [setupMode, setSetupMode] = useState(false);
  const [setupStep, setSetupStep] = useState(1);
  const [serviceKey, setServiceKey] = useState("");
  const [setupLoading, setSetupLoading] = useState(false);
  const [setupMsg, setSetupMsg] = useState("");
  const [selectedRole, setSelectedRole] = useState(null);
  const [checking, setChecking] = useState(true);
  // Admin kirish
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPass, setAdminPass] = useState("");
  const [adminPassShow, setAdminPassShow] = useState(false);
  const [adminErr, setAdminErr] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);
  // Vazirlik kirish
  const [showMinistryLogin, setShowMinistryLogin] = useState(false);
  const [ministryPass, setMinistryPass] = useState("");
  const [ministryPassShow, setMinistryPassShow] = useState(false);
  const [ministryErr, setMinistryErr] = useState("");
  const [ministryLoading, setMinistryLoading] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  // Logo click counter
  const [logoClicks, setLogoClicks] = useState(0);

  // Mualliflar ma'lumotlari statelari
  const [authors, setAuthors] = useState(() => {
    const saved = localStorage.getItem("eduai_authors");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: 1,
        name: "Akramxon Orifov",
        role: "G'oya muallifi va loyiha rahbari",
        desc: "Loyiha konsepsiyasi, pedagogik metodologiyalar, sun'iy intellekt tushuntirish stsenariylari va davlat ta'lim standartlarining dasturiy tizimga adaptatsiyasi tashabbuskori.",
        type: "emoji",
        avatar: "💡",
      },
      {
        id: 2,
        name: "Mamasoliyev Ro'zimurod",
        role: "Dasturchi va tizim me'mori",
        desc: "Platformaning to'liq dasturiy arxitekturasi, front-end va back-end tizimlari, 3D Three.js vizual darslari, simulyatsiyalar, Supabase ma'lumotlar ombori xavfsizligi hamda AI modellar integratsiyasini amalga oshirgan muhandis-dasturchi.",
        type: "emoji",
        avatar: "👨‍💻",
      },
      {
        id: 3,
        name: "Loyiha hamkori",
        role: "Mutaxassis",
        desc: "Loyiha rivoji, darsliklar tahlili va platforma tarkibini boyitish bo'yicha maslahatchi hamkor.",
        type: "emoji",
        avatar: "🤝",
      },
      {
        id: 4,
        name: "Loyiha hamkori",
        role: "Dizayner",
        desc: "Platformaning brending dizayni va ta'limiy materiallar vizual grafikasi ustida ishlagan ijodkor.",
        type: "emoji",
        avatar: "🎨",
      }
    ];
  });
  const [isEditingAuthors, setIsEditingAuthors] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [editPassword, setEditPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleUpdateAuthor = (id, field, value) => {
    setAuthors(prev => {
      const updated = prev.map(a => a.id === id ? { ...a, [field]: value } : a);
      localStorage.setItem("eduai_authors", JSON.stringify(updated));
      return updated;
    });
  };
  const compressImage = (file, callback) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 250;
        const MAX_HEIGHT = 250;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.75);
        callback(dataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Jadval mavjudligini tekshirish
  useEffect(() => {
    const check = async () => {
      const exists = await checkTablesExist();
      if (!exists) setSetupMode(true);
      setChecking(false);
    };
    check();
  }, []);

  // SQL ko'rsatish uchun
  const SQL_TEXT = `CREATE TABLE IF NOT EXISTS users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name text NOT NULL,
  username text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  role text NOT NULL DEFAULT 'student',
  class_name text,
  teacher_id uuid,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_users" ON users FOR ALL USING (true);

CREATE TABLE IF NOT EXISTS results (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid NOT NULL,
  topic_id integer,
  topic_name text,
  fan_id text,
  fan_name text,
  score integer,
  transcript text,
  details text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_results" ON results FOR ALL USING (true);`;

  const handleSetupWithKey = async () => {
    if (!serviceKey.trim()) {
      setSetupMsg("Service key kiriting");
      return;
    }
    setSetupLoading(true);
    setSetupMsg("Jadvallar yaratilmoqda...");
    const ok = await createTablesWithServiceKey(serviceKey.trim());
    setSetupLoading(false);
    if (ok) {
      setSetupMsg("✅ Jadvallar yaratildi!");
      setTimeout(() => {
        setSetupStep(2);
        setSetupMsg("");
      }, 1000);
    } else {
      setSetupMsg("❌ Xato. SQL Editor da qo'lda yarating.");
    }
  };

  const handleManualDone = async () => {
    setSetupLoading(true);
    const exists = await checkTablesExist();
    setSetupLoading(false);
    if (exists) {
      setSetupStep(2);
    } else {
      setSetupMsg("❌ Jadval hali yaratilmagan. SQL ni ishga tushiring.");
    }
  };

  // O'qituvchi ro'yxatdan o'tish — FAQAT ADMIN (maxfiy kod bilan)
  const [regName, setRegName] = useState("");
  const [regUser, setRegUser] = useState("");
  const [regPass, setRegPass] = useState("");
  const [regPass2, setRegPass2] = useState("");
  const [regCode, setRegCode] = useState("");
  const TEACHER_CODE = "mr134679";
  // Ko'z tugmalari
  const [showRegPass, setShowRegPass] = useState(false);
  const [showRegPass2, setShowRegPass2] = useState(false);
  const [showAdminCode, setShowAdminCode] = useState(false);
  const [showLoginPass, setShowLoginPass] = useState(false);

  const handleAdminLogin = async () => {
    if (!adminPass.trim()) {
      setAdminErr("Parolni kiriting");
      return;
    }
    setAdminLoading(true);
    setAdminErr("");
    const result = await adminLogin(adminPass.trim());
    setAdminLoading(false);
    if (result.success) {
      onAdminLogin();
    } else {
      setAdminErr(result.error);
    }
  };

  const handleMinistryLogin = async () => {
    if (!ministryPass.trim()) {
      setMinistryErr("Parolni kiriting");
      return;
    }
    setMinistryLoading(true);
    setMinistryErr("");
    const result = await ministryLogin(ministryPass.trim());
    setMinistryLoading(false);
    if (result.success) {
      onMinistryLogin();
    } else {
      setMinistryErr(result.error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Login va parolni kiriting");
      return;
    }
    setLoading(true);
    setError("");
    const result = await login(username, password);
    setLoading(false);
    if (result.success) {
      // Rolni tekshirish: Professor faqat teacher, Student faqat student
      const userRole = result.user.role;
      if (selectedRole === 'professor' && userRole !== 'teacher') {
        setError("Bu login talabaga tegishli. Iltimos, STUDENT bo'limidan kiring.");
        return;
      }
      if (selectedRole === 'student' && userRole !== 'student') {
        setError("Bu login professorga tegishli. Iltimos, PROFESSOR bo'limidan kiring.");
        return;
      }
      onLogin(result.user);
    } else {
      setError(result.error);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regName || !regUser || !regPass || !regPass2) {
      setError("Barcha maydonlarni to'ldiring");
      return;
    }
    if (regPass !== regPass2) {
      setError("Parollar mos kelmaydi");
      return;
    }
    if (regCode !== TEACHER_CODE) {
      setError("O'qituvchi kodi noto'g'ri");
      return;
    }
    setLoading(true);
    setError("");
    const result = await createTeacher({
      fullName: regName,
      username: regUser,
      password: regPass,
    });
    setLoading(false);
    if (result.success) {
      onLogin(result.user);
    } else {
      setError(result.error);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "#09090b",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      {/* ===== ADMIN MODAL (FLOATING — har qanday holatda ko'rinadi) ===== */}
      {showAdminLogin && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{
            background: "#18181b", border: "1px solid rgba(124,58,237,0.4)",
            borderRadius: 24, padding: 40, width: 420, boxShadow: "0 32px 80px rgba(0,0,0,0.6)"
          }}>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🛡️</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "white", marginBottom: 6 }}>Admin Panel</div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>Faqat ruxsat etilgan shaxs uchun</div>
            </div>

            {adminErr && (
              <div style={{
                background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: 10, padding: "10px 14px", marginBottom: 16,
                color: "#EF4444", fontSize: 14
              }}>
                ⚠️ {adminErr}
              </div>
            )}

            <div style={{ marginBottom: 20 }}>
              <label style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 600, display: "block", marginBottom: 8 }}>
                🔒 Admin paroli
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={adminPassShow ? "text" : "password"}
                  value={adminPass}
                  onChange={(e) => { setAdminPass(e.target.value); setAdminErr(""); }}
                  placeholder="Admin parolini kiriting..."
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()}
                  style={{
                    width: "100%", padding: "14px 50px 14px 16px",
                    borderRadius: 12, border: "1px solid rgba(255,255,255,0.15)",
                    background: "rgba(255,255,255,0.05)", color: "white",
                    fontSize: 15, outline: "none", boxSizing: "border-box"
                  }}
                />
                <button
                  type="button"
                  onClick={() => setAdminPassShow(p => !p)}
                  style={{
                    position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 18
                  }}
                >
                  {adminPassShow ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <button
              onClick={handleAdminLogin}
              disabled={adminLoading}
              style={{
                width: "100%", padding: "14px", borderRadius: 12, border: "none",
                background: adminLoading ? "rgba(255,255,255,0.08)" : "linear-gradient(135deg, #7C3AED, #4F46E5)",
                color: adminLoading ? "rgba(255,255,255,0.3)" : "white",
                fontWeight: 700, fontSize: 15, cursor: adminLoading ? "not-allowed" : "pointer",
                marginBottom: 12, boxShadow: "0 4px 20px rgba(124,58,237,0.4)"
              }}
            >
              {adminLoading ? "⏳ Tekshirilmoqda..." : "🛡️ Kirish"}
            </button>

            <button
              onClick={() => { setShowAdminLogin(false); setAdminPass(""); setAdminErr(""); }}
              style={{
                width: "100%", padding: "12px", borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.1)", background: "transparent",
                color: "rgba(255,255,255,0.5)", fontWeight: 600, fontSize: 14, cursor: "pointer"
              }}
            >
              Bekor qilish
            </button>
          </div>
        </div>
      )}

      {/* ===== VAZIRLIK MODAL (FLOATING — hisobotlarni ko'rish uchun kirish) ===== */}
      {showMinistryLogin && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{
            background: "#18181b", border: "1px solid rgba(255,200,70,0.4)",
            borderRadius: 24, padding: 40, width: 420, boxShadow: "0 32px 80px rgba(0,0,0,0.6)"
          }}>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🏛️</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "white", marginBottom: 6 }}>Vazirlik kirishi</div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>Hisobotlarni ko'rish uchun kirish</div>
            </div>

            {ministryErr && (
              <div style={{
                background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: 10, padding: "10px 14px", marginBottom: 16,
                color: "#EF4444", fontSize: 14
              }}>
                ⚠️ {ministryErr}
              </div>
            )}

            <div style={{ marginBottom: 20 }}>
              <label style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 600, display: "block", marginBottom: 8 }}>
                🔒 Vazirlik paroli
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={ministryPassShow ? "text" : "password"}
                  value={ministryPass}
                  onChange={(e) => { setMinistryPass(e.target.value); setMinistryErr(""); }}
                  placeholder="Vazirlik parolini kiriting..."
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && handleMinistryLogin()}
                  style={{
                    width: "100%", padding: "14px 50px 14px 16px",
                    borderRadius: 12, border: "1px solid rgba(255,255,255,0.15)",
                    background: "rgba(255,255,255,0.05)", color: "white",
                    fontSize: 15, outline: "none", boxSizing: "border-box"
                  }}
                />
                <button
                  type="button"
                  onClick={() => setMinistryPassShow(p => !p)}
                  style={{
                    position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 18
                  }}
                >
                  {ministryPassShow ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <button
              onClick={handleMinistryLogin}
              disabled={ministryLoading}
              style={{
                width: "100%", padding: "14px", borderRadius: 12, border: "none",
                background: ministryLoading ? "rgba(255,255,255,0.08)" : "linear-gradient(135deg, #F59E0B, #D97706)",
                color: ministryLoading ? "rgba(255,255,255,0.3)" : "white",
                fontWeight: 700, fontSize: 15, cursor: ministryLoading ? "not-allowed" : "pointer",
                marginBottom: 12, boxShadow: "0 4px 20px rgba(245,158,11,0.4)"
              }}
            >
              {ministryLoading ? "⏳ Tekshirilmoqda..." : "🏛️ Kirish"}
            </button>

            <button
              onClick={() => { setShowMinistryLogin(false); setMinistryPass(""); setMinistryErr(""); }}
              style={{
                width: "100%", padding: "12px", borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.1)", background: "transparent",
                color: "rgba(255,255,255,0.5)", fontWeight: 600, fontSize: 14, cursor: "pointer"
              }}
            >
              Bekor qilish
            </button>
          </div>
        </div>
      )}

      {/* Fon animatsiya */}
      <style>{loginStyles}</style>
      <ParticlesBackground />
      <div className="glow-orb orb1"></div>
      <div className="glow-orb orb2"></div>
      <div className="glow-orb orb3"></div>

      <div
        style={{
          width: "100%",
          maxWidth: 480,
          position: "relative",
          zIndex: 1,
        }}
      >
        {showAboutModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.65)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 50,
              padding: 20,
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: 680,
                maxHeight: "90vh",
                borderRadius: 28,
                background: "rgba(15,23,42,0.98)",
                border: "1px solid rgba(255,255,255,0.08)",
                padding: "24px 30px",
                boxShadow: "0 40px 120px rgba(0,0,0,0.4)",
                color: "white",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              <button
                onClick={() => setShowAboutModal(false)}
                style={{
                  position: "absolute",
                  top: 18,
                  right: 18,
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "50%",
                  width: 38,
                  height: 38,
                  color: "white",
                  cursor: "pointer",
                  fontSize: 18,
                }}
              >
                ✕
              </button>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 18,
                    background: "rgba(59,130,246,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 28,
                  }}
                >
                  🎓
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 26,
                      fontWeight: 800,
                      letterSpacing: "-0.04em",
                      marginBottom: 6,
                    }}
                  >
                    EduMind haqida
                  </div>
                  <div
                    style={{ color: "rgba(255,255,255,0.65)", fontSize: 14 }}
                  >
                    O'zbekiston oliy ta'limi uchun AI yordamchi.
                  </div>
                </div>
              </div>
              {/* Scrollable content container */}
              <div style={{ flex: 1, overflowY: "auto", paddingRight: 8, marginBottom: 20 }}>
                <div style={{ display: "grid", gap: 18, marginBottom: 24 }}>
                <div
                  style={{
                    borderRadius: 18,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    padding: 18,
                  }}
                >
                  <div
                    style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}
                  >
                    📌 Dastur haqida qisqacha
                  </div>
                  <p
                    style={{
                      color: "rgba(255,255,255,0.75)",
                      lineHeight: 1.7,
                      fontSize: 14,
                      marginBottom: 16,
                      textAlign: "justify"
                    }}
                  >
                    <strong>EduMind</strong> — sun'iy intellekt texnologiyalariga asoslangan, oliy ta'lim muassasalari talabalari va professorlari uchun mo'ljallangan ilg'or va interaktiv raqamli ta'lim platformasidir. Loyihaning asosiy maqsadi — ta'lim tizimini raqamlashtirish, dars jarayonlarini vizual simulyatsiyalar, 3D modellar va sun'iy intellektual ustoz yordamida talabalar uchun yanada qiziqarli, tushunarli va samarali qilishdan iborat.
                  </p>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <div
                      style={{
                        padding: "8px 16px",
                        borderRadius: 999,
                        border: "1px solid rgba(255,255,255,0.18)",
                        background: "rgba(56,189,248,0.12)",
                        color: "#A5F3FC",
                        fontWeight: 700,
                        fontSize: 12,
                      }}
                    >
                      Loyiha konsepsiyasi
                    </div>
                    <div
                      style={{
                        padding: "8px 16px",
                        borderRadius: 999,
                        border: "1px solid rgba(255,255,255,0.18)",
                        background: "rgba(34,197,94,0.12)",
                        color: "#BBF7D0",
                        fontWeight: 700,
                        fontSize: 12,
                      }}
                    >
                      Dasturiy arxitektura
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    borderRadius: 18,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    padding: 18,
                  }}
                >
                  <div
                    style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}
                  >
                    👥 Loyiha mualliflari
                  </div>

                  {/* Password prompt for editing */}
                  {showPasswordPrompt && (
                    <div
                      style={{
                        background: "rgba(56, 189, 248, 0.1)",
                        border: "1px solid rgba(56, 189, 248, 0.2)",
                        padding: 12,
                        borderRadius: 14,
                        marginBottom: 16,
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <input
                        type="password"
                        placeholder="Tahrirlash parolini kiriting"
                        value={editPassword}
                        onChange={(e) => setEditPassword(e.target.value)}
                        style={{
                          flex: 1,
                          padding: "8px 12px",
                          borderRadius: 8,
                          border: "1px solid rgba(255,255,255,0.15)",
                          background: "rgba(255,255,255,0.05)",
                          color: "white",
                          fontSize: 13,
                          outline: "none",
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            if (editPassword === "mr134679") {
                              setIsEditingAuthors(true);
                              setShowPasswordPrompt(false);
                              setPasswordError("");
                              setEditPassword("");
                            } else {
                              setPasswordError("Noto'g'ri parol!");
                            }
                          }
                        }}
                      />
                      <button
                        onClick={() => {
                          if (editPassword === "mr134679") {
                            setIsEditingAuthors(true);
                            setShowPasswordPrompt(false);
                            setPasswordError("");
                            setEditPassword("");
                          } else {
                            setPasswordError("Noto'g'ri parol!");
                          }
                        }}
                        style={{
                          padding: "8px 14px",
                          borderRadius: 8,
                          background: "#38BDF8",
                          border: "none",
                          color: "white",
                          fontWeight: 700,
                          fontSize: 13,
                          cursor: "pointer",
                        }}
                      >
                        Tasdiqlash
                      </button>
                      <button
                        onClick={() => {
                          setShowPasswordPrompt(false);
                          setPasswordError("");
                          setEditPassword("");
                        }}
                        style={{
                          padding: "8px 12px",
                          borderRadius: 8,
                          background: "rgba(255,255,255,0.1)",
                          border: "none",
                          color: "white",
                          fontSize: 13,
                          cursor: "pointer",
                        }}
                      >
                        Bekor
                      </button>
                    </div>
                  )}

                  {passwordError && (
                    <div style={{ color: "#EF4444", fontSize: 13, marginBottom: 16, textAlign: "center", fontWeight: 600 }}>
                      ⚠️ {passwordError}
                    </div>
                  )}

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                      gap: 16,
                    }}
                  >
                    {authors.map((author) => (
                      <div
                        key={author.id}
                        style={{
                          padding: 16,
                          borderRadius: 18,
                          background: "rgba(255,255,255,0.08)",
                          border: isEditingAuthors ? "1px dashed rgba(56, 189, 248, 0.5)" : "1px solid rgba(255,255,255,0.1)",
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                        }}
                      >
                        {isEditingAuthors ? (
                          // Tahrirlash rejasi (inputs)
                          <>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div
                                style={{
                                  width: 42,
                                  height: 42,
                                  borderRadius: "50%",
                                  background: "rgba(255,255,255,0.1)",
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  fontSize: author.type === "emoji" ? 20 : 14,
                                  overflow: "hidden",
                                  flexShrink: 0,
                                }}
                              >
                                {author.type === "emoji" ? (
                                  author.avatar
                                ) : (
                                  <img
                                    src={author.avatar}
                                    alt="Avatar"
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                  />
                                )}
                              </div>
                              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                                <input
                                  type="text"
                                  placeholder="Emoji (💡)"
                                  value={author.type === "emoji" ? author.avatar : ""}
                                  onChange={(e) => {
                                    handleUpdateAuthor(author.id, "avatar", e.target.value);
                                    handleUpdateAuthor(author.id, "type", "emoji");
                                  }}
                                  style={{
                                    width: "100%",
                                    padding: "4px 8px",
                                    borderRadius: 6,
                                    border: "1px solid rgba(255,255,255,0.15)",
                                    background: "rgba(255,255,255,0.05)",
                                    color: "white",
                                    fontSize: 11,
                                    outline: "none",
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => document.getElementById(`file-input-${author.id}`).click()}
                                  style={{
                                    padding: "6px 10px",
                                    borderRadius: 6,
                                    border: "1px solid rgba(56, 189, 248, 0.3)",
                                    background: "rgba(56, 189, 248, 0.1)",
                                    color: "#38BDF8",
                                    fontSize: 11,
                                    cursor: "pointer",
                                    fontWeight: 600,
                                    textAlign: "center",
                                    width: "100%",
                                    marginTop: 4,
                                    transition: "all 0.2s",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.target.style.background = "rgba(56, 189, 248, 0.2)";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.target.style.background = "rgba(56, 189, 248, 0.1)";
                                  }}
                                >
                                  🖼️ Rasm yuklash
                                </button>
                                <input
                                  type="file"
                                  accept="image/*"
                                  id={`file-input-${author.id}`}
                                  style={{ display: "none" }}
                                  onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                      compressImage(file, (compressedBase64) => {
                                        handleUpdateAuthor(author.id, "avatar", compressedBase64);
                                        handleUpdateAuthor(author.id, "type", "image");
                                      });
                                    }
                                  }}
                                />
                              </div>
                            </div>
                            <input
                              type="text"
                              placeholder="Ism-sharif"
                              value={author.name}
                              onChange={(e) => handleUpdateAuthor(author.id, "name", e.target.value)}
                              style={{
                                width: "100%",
                                padding: "6px 10px",
                                borderRadius: 8,
                                border: "1px solid rgba(255,255,255,0.15)",
                                background: "rgba(255,255,255,0.05)",
                                color: "white",
                                fontSize: 12,
                                fontWeight: 700,
                                outline: "none",
                              }}
                            />
                            <input
                              type="text"
                              placeholder="Lavozimi / Roli"
                              value={author.role}
                              onChange={(e) => handleUpdateAuthor(author.id, "role", e.target.value)}
                              style={{
                                width: "100%",
                                padding: "6px 10px",
                                borderRadius: 8,
                                border: "1px solid rgba(255,255,255,0.15)",
                                background: "rgba(255,255,255,0.05)",
                                color: "white",
                                fontSize: 11,
                                outline: "none",
                              }}
                            />
                            <textarea
                              placeholder="Batafsil ma'lumot"
                              value={author.desc}
                              onChange={(e) => handleUpdateAuthor(author.id, "desc", e.target.value)}
                              style={{
                                width: "100%",
                                height: 70,
                                padding: "6px 10px",
                                borderRadius: 8,
                                border: "1px solid rgba(255,255,255,0.15)",
                                background: "rgba(255,255,255,0.05)",
                                color: "white",
                                fontSize: 11,
                                outline: "none",
                                resize: "none",
                              }}
                            />
                          </>
                        ) : (
                          // Oddiy ko'rish rejimi
                          <>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                              }}
                            >
                              <div
                                style={{
                                  width: 42,
                                  height: 42,
                                  borderRadius: "50%",
                                  background: "rgba(255,255,255,0.1)",
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  fontSize: author.type === "emoji" ? 20 : 14,
                                  overflow: "hidden",
                                  flexShrink: 0,
                                }}
                              >
                                {author.type === "emoji" ? (
                                  author.avatar
                                ) : (
                                  <img
                                    src={author.avatar}
                                    alt={author.name}
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                  />
                                )}
                              </div>
                              <div>
                                <div
                                  style={{
                                    fontWeight: 800,
                                    fontSize: 14,
                                    color: "white",
                                  }}
                                >
                                  {author.name}
                                </div>
                                <div
                                  style={{
                                    fontSize: 12,
                                    color: "rgba(255,255,255,0.6)",
                                  }}
                                >
                                  {author.role}
                                </div>
                              </div>
                            </div>
                            <p
                              style={{
                                color: "rgba(255,255,255,0.7)",
                                fontSize: 13,
                                lineHeight: 1.6,
                                margin: 0,
                                textAlign: "justify"
                              }}
                            >
                              {author.desc}
                            </p>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div
                  style={{
                    borderRadius: 18,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    padding: 18,
                  }}
                >
                  <div
                    style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}
                  >
                    🛡️ Tashkilotlar va Ekspertlar uchun ma'lumot
                  </div>
                  <p
                    style={{
                      color: "rgba(255,255,255,0.75)",
                      lineHeight: 1.7,
                      fontSize: 14,
                      margin: 0,
                      textAlign: "justify"
                    }}
                  >
                    EduMind platformasi zamonaviy ta'lim standartlari va maktab o'quv dasturlariga to'liq mos ravishda loyihalashtirilgan. Tizim pedagogik jarayonlarni avtomatlashtirish, talabalar progressini tahlil qilish, har bir talaba uchun shaxsiy sun'iy intellektual ustoz tavsiyalarini berish va dars samaradorligini monitoring qilish imkonini beradi. Platforma miqyoslanuvchan (scalable) va har qanday ta'lim muassasasida oson integratsiya qilinadigan arxitekturaga ega.
                  </p>
                </div>
              </div>
              </div> {/* Close scrollable content container */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 12,
                  alignItems: "center",
                  flexShrink: 0,
                  paddingTop: 14,
                  borderTop: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {isEditingAuthors ? (
                  <button
                    onClick={() => setIsEditingAuthors(false)}
                    style={{
                      padding: "12px 24px",
                      borderRadius: 12,
                      border: "none",
                      background: "#10B981",
                      color: "white",
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: "pointer",
                      boxShadow: "0 4px 12px rgba(16,185,129,0.2)",
                    }}
                  >
                    💾 Saqlash
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setShowPasswordPrompt(true);
                      setPasswordError("");
                      setEditPassword("");
                    }}
                    style={{
                      padding: "12px 18px",
                      borderRadius: 12,
                      border: "1px solid rgba(56, 189, 248, 0.3)",
                      background: "rgba(56, 189, 248, 0.1)",
                      color: "#38BDF8",
                      fontSize: 14,
                      cursor: "pointer",
                      marginRight: "auto",
                      fontWeight: 600,
                    }}
                  >
                    📝 Tahrirlash
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowAboutModal(false);
                    setIsEditingAuthors(false);
                    setShowPasswordPrompt(false);
                  }}
                  style={{
                    padding: "12px 18px",
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(255,255,255,0.06)",
                    color: "white",
                    fontSize: 14,
                    cursor: "pointer",
                  }}
                >
                  Yopish
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Login form container */}
        
        {/* YANGI ROLE SELECTION (Demo) */}
        {!selectedRole && !showAboutModal && !checking && !setupMode && (
          <div className="login-stage">
            <div className="login-card">
              <div 
                className="logo-shield" 
                onClick={() => { setLogoClicks(c => c + 1); if (logoClicks === 4) { setShowAdminLogin(true); setLogoClicks(0); } }}
                style={{ cursor: 'pointer' }}
              >
                <div className="pulse"></div>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'white' }}>
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <div className="login-brand">EduMind</div>
              <div className="login-panel">
                <div className="login-welcome">Welcome to EduMind</div>
                
                <button 
                  type="button"
                  className="role-btn role-prof"
                  onClick={() => { setSelectedRole('professor'); setUsername('aziz_karimov'); setPassword('123456'); setShowRegister(false); setShowAdminLogin(false); }} 
                >
                  <div className="icon">
                     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg> 
                     PROFESSOR
                  </div>
                  <div className="arrow">→</div>
                </button>
                
                <button 
                  type="button"
                  className="role-btn role-stud"
                  onClick={() => { setSelectedRole('student'); setUsername('bekzod_toshmatov'); setPassword('123456'); setShowRegister(false); setShowAdminLogin(false); }} 
                >
                  <div className="icon">
                     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg> 
                     STUDENT
                  </div>
                  <div className="arrow">→</div>
                </button>

                <button
                  type="button"
                  className="role-btn role-ministry"
                  onClick={() => setShowMinistryLogin(true)}
                >
                  <div className="icon">
                     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18" /><path d="M5 21V7l7-4 7 4v14" /><path d="M9 21V11h6v10" /></svg>
                     VAZIRLIK
                  </div>
                  <div className="arrow">→</div>
                </button>

                <div className="login-links">
                  <span onClick={() => setShowAboutModal(true)}>Need Help?</span>
                  <span>Create Account</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {checking && (
          <div
            style={{
              textAlign: "center",
              color: "rgba(255,255,255,0.5)",
              padding: 40,
            }}
          >
            ⏳ Tekshirilmoqda...
          </div>
        )}

        
        {/* Orqaga qaytish tugmasi */}
        {selectedRole && !showAboutModal && !checking && !setupMode && (
          <div style={{textAlign: 'left', marginBottom: 20, width: '100%', maxWidth: 480}}>
            <button onClick={() => setSelectedRole(null)} style={{background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 15, display: 'flex', alignItems: 'center', fontWeight: 600}}>
              ← Orqaga
            </button>
          </div>
        )}
        {/* ===== BIRINCHI SOZLASH ===== */}
        {!checking && setupMode && (
          <div
            style={{
              background: "rgba(255,255,255,0.05)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 24,
              padding: 28,
              boxShadow: "0 32px 64px rgba(0,0,0,0.4)",
            }}
          >
            <div
              style={{
                color: "white",
                fontWeight: 800,
                fontSize: 20,
                marginBottom: 6,
              }}
            >
              ⚙️ Birinchi sozlash
            </div>
            <div
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: 13,
                marginBottom: 20,
              }}
            >
              Supabase da jadvallar yaratilishi kerak
            </div>

            {setupStep === 1 && (
              <div>
                {/* Variant 1: SQL Editor */}
                <div
                  style={{
                    background: "rgba(0,0,0,0.3)",
                    borderRadius: 14,
                    padding: 16,
                    marginBottom: 16,
                  }}
                >
                  <div
                    style={{
                      color: "#60A5FA",
                      fontWeight: 700,
                      fontSize: 14,
                      marginBottom: 10,
                    }}
                  >
                    📋 1-variant: SQL Editor da qo'lda (tavsiya)
                  </div>
                  <div
                    style={{
                      color: "rgba(255,255,255,0.6)",
                      fontSize: 12,
                      marginBottom: 10,
                      lineHeight: 1.6,
                    }}
                  >
                    1.{" "}
                    <a
                      href="https://supabase.com/dashboard/project/hmdyvzrjlznqvobbmdbx/sql/new"
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: "#60A5FA" }}
                    >
                      SQL Editor
                    </a>{" "}
                    ga kiring
                    <br />
                    2. Quyidagi kodni nusxalab joylashtiring
                    <br />
                    3. "Run" tugmasini bosing
                    <br />
                    4. Quyidagi "Tayyor" tugmasini bosing
                  </div>
                  <div style={{ position: "relative" }}>
                    <pre
                      style={{
                        background: "#0F172A",
                        color: "#86EFAC",
                        padding: 12,
                        borderRadius: 10,
                        fontSize: 10,
                        overflowX: "auto",
                        maxHeight: 160,
                        overflowY: "auto",
                        margin: 0,
                        lineHeight: 1.5,
                      }}
                    >
                      {SQL_TEXT}
                    </pre>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(SQL_TEXT);
                        setSetupMsg("✅ Nusxalandi!");
                        setTimeout(() => setSetupMsg(""), 2000);
                      }}
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        background: "rgba(96,165,250,0.2)",
                        border: "1px solid rgba(96,165,250,0.3)",
                        color: "#60A5FA",
                        padding: "4px 10px",
                        borderRadius: 6,
                        cursor: "pointer",
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      📋 Nusxa
                    </button>
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    <a
                      href="https://supabase.com/dashboard/project/hmdyvzrjlznqvobbmdbx/sql/new"
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        flex: 1,
                        padding: "10px",
                        borderRadius: 10,
                        textAlign: "center",
                        background: "rgba(96,165,250,0.15)",
                        border: "1px solid rgba(96,165,250,0.3)",
                        color: "#60A5FA",
                        fontWeight: 700,
                        fontSize: 13,
                        textDecoration: "none",
                      }}
                    >
                      🔗 SQL Editor ochish
                    </a>
                    <button
                      onClick={handleManualDone}
                      disabled={setupLoading}
                      style={{
                        flex: 1,
                        padding: "10px",
                        borderRadius: 10,
                        border: "none",
                        background: "rgba(52,211,153,0.15)",
                        color: "#34D399",
                        fontWeight: 700,
                        fontSize: 13,
                        cursor: "pointer",
                      }}
                    >
                      {setupLoading ? "⏳..." : "✅ Tayyor, tekshir"}
                    </button>
                  </div>
                </div>

                {setupMsg && (
                  <div
                    style={{
                      color: setupMsg.includes("✅") ? "#34D399" : "#FCA5A5",
                      fontSize: 13,
                      textAlign: "center",
                      marginBottom: 10,
                    }}
                  >
                    {setupMsg}
                  </div>
                )}
              </div>
            )}

            {setupStep === 2 && (
              <div>
                <div
                  style={{
                    color: "#34D399",
                    fontWeight: 700,
                    fontSize: 15,
                    marginBottom: 16,
                    textAlign: "center",
                  }}
                >
                  ✅ Jadvallar tayyor! Endi o'qituvchi akkaunt yarating
                </div>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const fd = new FormData(e.target);
                    setSetupLoading(true);
                    setSetupMsg("");
                    const result = await createTeacher({
                      fullName: fd.get("name"),
                      username: fd.get("user"),
                      password: fd.get("pass"),
                    });
                    setSetupLoading(false);
                    if (result.success) {
                      onLogin(result.user);
                    } else {
                      setSetupMsg(result.error);
                    }
                  }}
                >
                  {[
                    {
                      label: "👤 To'liq ism",
                      name: "name",
                      ph: "Ism Familiya",
                    },
                    { label: "🔤 Username", name: "user", ph: "teacher_ali" },
                    {
                      label: "🔒 Parol",
                      name: "pass",
                      ph: "Kuchli parol",
                      type: "password",
                    },
                  ].map((f, i) => (
                    <div key={i} style={{ marginBottom: 14 }}>
                      <label
                        style={{
                          color: "rgba(255,255,255,0.7)",
                          fontSize: 13,
                          fontWeight: 600,
                          display: "block",
                          marginBottom: 6,
                        }}
                      >
                        {f.label}
                      </label>
                      <input
                        name={f.name}
                        type={f.type || "text"}
                        placeholder={f.ph}
                        required
                        style={{
                          width: "100%",
                          padding: "11px 14px",
                          borderRadius: 10,
                          background: "rgba(255,255,255,0.08)",
                          border: "1px solid rgba(255,255,255,0.15)",
                          color: "white",
                          fontSize: 14,
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                  ))}
                  {setupMsg && (
                    <div
                      style={{
                        color: "#FCA5A5",
                        fontSize: 13,
                        marginBottom: 10,
                      }}
                    >
                      {setupMsg}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={setupLoading}
                    style={{
                      width: "100%",
                      padding: "13px",
                      borderRadius: 12,
                      border: "none",
                      background: "linear-gradient(135deg, #7C3AED, #2563EB)",
                      color: "white",
                      fontWeight: 700,
                      fontSize: 15,
                      cursor: "pointer",
                    }}
                  >
                    {setupLoading
                      ? "⏳ Yaratilmoqda..."
                      : "🚀 O'qituvchi akkaunt yaratish"}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ===== ODDIY LOGIN ===== */}
        {!checking && !setupMode && selectedRole && (
          <div
            style={{
              background: "rgba(255,255,255,0.05)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 24,
              padding: 32,
              boxShadow: "0 32px 64px rgba(0,0,0,0.4)",
            }}
          >
            {/* Tab — faqat Kirish ko'rinadi */}
            <div style={{ marginBottom: 28 }}>
              <div
                style={{
                  padding: "12px",
                  borderRadius: 12,
                  textAlign: "center",
                  background: "rgba(255,255,255,0.08)",
                  color: "white",
                  fontWeight: 700,
                  fontSize: 15,
                }}
              >
                {showAdminLogin ? "🛡️ Admin kirish" : "🔑 Tizimga kirish"}
              </div>
            </div>

            {error && (
              <div
                style={{
                  background: "rgba(220,38,38,0.15)",
                  border: "1px solid rgba(220,38,38,0.3)",
                  borderRadius: 10,
                  padding: "10px 14px",
                  marginBottom: 16,
                  color: "#FCA5A5",
                  fontSize: 14,
                }}
              >
                ⚠️ {error}
              </div>
            )}

            {/* ADMIN LOGIN */}
            {showAdminLogin && (
              <div>
                <div
                  style={{
                    background: "rgba(124,58,237,0.1)",
                    border: "1px solid rgba(124,58,237,0.3)",
                    borderRadius: 10,
                    padding: "10px 14px",
                    marginBottom: 16,
                    color: "#C4B5FD",
                    fontSize: 13,
                  }}
                >
                  🛡️ Admin paneli — faqat ruxsat etilgan shaxs
                </div>
                {adminErr && (
                  <div
                    style={{ color: "#FCA5A5", fontSize: 13, marginBottom: 12 }}
                  >
                    ⚠️ {adminErr}
                  </div>
                )}
                <div style={{ marginBottom: 16 }}>
                  <label
                    style={{
                      color: "rgba(255,255,255,0.7)",
                      fontSize: 13,
                      fontWeight: 600,
                      display: "block",
                      marginBottom: 8,
                    }}
                  >
                    🔒 Admin paroli
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={adminPassShow ? "text" : "password"}
                      value={adminPass}
                      onChange={(e) => setAdminPass(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()}
                      placeholder="Admin paroli"
                      style={{
                        width: "100%",
                        padding: "12px 44px 12px 16px",
                        borderRadius: 12,
                        background: "rgba(255,255,255,0.08)",
                        border: "1px solid rgba(255,255,255,0.15)",
                        color: "white",
                        fontSize: 15,
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setAdminPassShow((p) => !p)}
                      style={{
                        position: "absolute",
                        right: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "rgba(255,255,255,0.1)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        borderRadius: 8,
                        cursor: "pointer",
                        fontSize: 16,
                        color: adminPassShow
                          ? "#818CF8"
                          : "rgba(255,255,255,0.7)",
                        padding: "4px 8px",
                      }}
                    >
                      {adminPassShow ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleAdminLogin}
                  disabled={adminLoading}
                  style={{
                    width: "100%",
                    padding: "14px",
                    borderRadius: 12,
                    border: "none",
                    background: adminLoading
                      ? "rgba(124,58,237,0.4)"
                      : "linear-gradient(135deg, #7C3AED, #4F46E5)",
                    color: "white",
                    fontWeight: 700,
                    fontSize: 16,
                    cursor: adminLoading ? "not-allowed" : "pointer",
                    marginBottom: 10,
                  }}
                >
                  {adminLoading
                    ? "⏳ Tekshirilmoqda..."
                    : "🛡️ Admin sifatida kirish"}
                </button>
                <button
                  onClick={() => {
                    setShowAdminLogin(false);
                    setAdminPass("");
                    setAdminErr("");
                  }}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: 12,
                    border: "none",
                    background: "transparent",
                    color: "rgba(255,255,255,0.4)",
                    cursor: "pointer",
                    fontSize: 13,
                  }}
                >
                  ← Orqaga
                </button>
              </div>
            )}

            {/* LOGIN FORMA */}
            {!showRegister && !showAdminLogin && (
              <form onSubmit={handleLogin}>
                <div style={{ marginBottom: 16 }}>
                  <label
                    style={{
                      color: "rgba(255,255,255,0.7)",
                      fontSize: 13,
                      fontWeight: 600,
                      display: "block",
                      marginBottom: 8,
                    }}
                  >
                    👤 Login (username)
                  </label>
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="username kiriting"
                    autoComplete="username"
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      borderRadius: 12,
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "white",
                      fontSize: 15,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                <div style={{ marginBottom: 24 }}>
                  <label
                    style={{
                      color: "rgba(255,255,255,0.7)",
                      fontSize: 13,
                      fontWeight: 600,
                      display: "block",
                      marginBottom: 8,
                    }}
                  >
                    🔒 Parol
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showLoginPass ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="parol kiriting"
                      autoComplete="current-password"
                      style={{
                        width: "100%",
                        padding: "12px 44px 12px 16px",
                        borderRadius: 12,
                        background: "rgba(255,255,255,0.08)",
                        border: "1px solid rgba(255,255,255,0.15)",
                        color: "white",
                        fontSize: 15,
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPass((p) => !p)}
                      style={{
                        position: "absolute",
                        right: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "rgba(255,255,255,0.1)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        borderRadius: 8,
                        cursor: "pointer",
                        fontSize: 16,
                        color: showLoginPass
                          ? "#60A5FA"
                          : "rgba(255,255,255,0.7)",
                        padding: "4px 8px",
                        lineHeight: 1,
                        transition: "all 0.2s",
                      }}
                    >
                      {showLoginPass ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "14px",
                    borderRadius: 12,
                    border: "none",
                    background: loading
                      ? "rgba(37,99,235,0.5)"
                      : "linear-gradient(135deg, #2563EB, #059669)",
                    color: "white",
                    fontWeight: 700,
                    fontSize: 16,
                    cursor: loading ? "not-allowed" : "pointer",
                    boxShadow: "0 4px 16px rgba(37,99,235,0.4)",
                  }}
                >
                  {loading ? "⏳ Tekshirilmoqda..." : "🚀 Kirish"}
                </button>

                <div
                  style={{
                    textAlign: "center",
                    marginTop: 16,
                    color: "rgba(255,255,255,0.4)",
                    fontSize: 13,
                  }}
                >
                  Talabalar — o'qituvchidan login/parol oling
                </div>

              </form>
            )}

            {/* RO'YXATDAN O'TISH FORMA — MAXFIY (faqat logo 5x bosish bilan ochiladi) */}
            {showRegister && (
              <form onSubmit={handleRegister}>
                <div
                  style={{
                    background: "rgba(124,58,237,0.15)",
                    border: "1px solid rgba(124,58,237,0.3)",
                    borderRadius: 10,
                    padding: "10px 14px",
                    marginBottom: 16,
                    color: "#C4B5FD",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  🔐 O'qituvchi akkaunt yaratish (maxfiy)
                </div>

                {/* TO'LIQ ISM — username avtomatik */}
                <div style={{ marginBottom: 14 }}>
                  <label
                    style={{
                      color: "rgba(255,255,255,0.7)",
                      fontSize: 13,
                      fontWeight: 600,
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    👤 To'liq ism
                  </label>
                  <input
                    value={regName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setRegName(val);
                      // Avtomatik username: "Dilnoza Orolova" → "dilnoza_orolova"
                      const auto = val
                        .trim()
                        .toLowerCase()
                        .replace(/\s+/g, "_")
                        .replace(/[^a-z0-9_]/g, "");
                      setRegUser(auto);
                    }}
                    placeholder="Ism Familiya"
                    style={{
                      width: "100%",
                      padding: "11px 14px",
                      borderRadius: 10,
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "white",
                      fontSize: 14,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                {/* USERNAME — avtomatik to'ldiriladi, o'zgartirish mumkin */}
                <div style={{ marginBottom: 14 }}>
                  <label
                    style={{
                      color: "rgba(255,255,255,0.7)",
                      fontSize: 13,
                      fontWeight: 600,
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    🔤 Username{" "}
                    <span
                      style={{
                        color: "rgba(255,255,255,0.3)",
                        fontWeight: 400,
                      }}
                    >
                      (avtomatik)
                    </span>
                  </label>
                  <input
                    value={regUser}
                    onChange={(e) =>
                      setRegUser(
                        e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""),
                      )
                    }
                    placeholder="avtomatik_todiriladi"
                    style={{
                      width: "100%",
                      padding: "11px 14px",
                      borderRadius: 10,
                      background: "rgba(52,211,153,0.08)",
                      border: "1px solid rgba(52,211,153,0.25)",
                      color: "#34D399",
                      fontSize: 14,
                      outline: "none",
                      boxSizing: "border-box",
                      fontWeight: 600,
                    }}
                  />
                </div>

                {/* PAROL — ko'z tugmasi bilan */}
                <div style={{ marginBottom: 14 }}>
                  <label
                    style={{
                      color: "rgba(255,255,255,0.7)",
                      fontSize: 13,
                      fontWeight: 600,
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    🔒 Parol
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showRegPass ? "text" : "password"}
                      value={regPass}
                      onChange={(e) => setRegPass(e.target.value)}
                      placeholder="Kuchli parol"
                      style={{
                        width: "100%",
                        padding: "11px 44px 11px 14px",
                        borderRadius: 10,
                        background: "rgba(255,255,255,0.08)",
                        border: "1px solid rgba(255,255,255,0.15)",
                        color: "white",
                        fontSize: 14,
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPass((p) => !p)}
                      style={{
                        position: "absolute",
                        right: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: 18,
                        color: "rgba(255,255,255,0.5)",
                        padding: 0,
                        lineHeight: 1,
                      }}
                    >
                      {showRegPass ? "🙈" : "👁"}
                    </button>
                  </div>
                </div>

                {/* PAROL TASDIQLASH — ko'z tugmasi bilan */}
                <div style={{ marginBottom: 14 }}>
                  <label
                    style={{
                      color: "rgba(255,255,255,0.7)",
                      fontSize: 13,
                      fontWeight: 600,
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    🔒 Parolni tasdiqlang
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showRegPass2 ? "text" : "password"}
                      value={regPass2}
                      onChange={(e) => setRegPass2(e.target.value)}
                      placeholder="Parolni qayta kiriting"
                      style={{
                        width: "100%",
                        padding: "11px 44px 11px 14px",
                        borderRadius: 10,
                        background: "rgba(255,255,255,0.08)",
                        border: `1px solid ${regPass2 && regPass === regPass2 ? "rgba(52,211,153,0.4)" : regPass2 ? "rgba(220,38,38,0.4)" : "rgba(255,255,255,0.15)"}`,
                        color: "white",
                        fontSize: 14,
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPass2((p) => !p)}
                      style={{
                        position: "absolute",
                        right: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: 18,
                        color: "rgba(255,255,255,0.5)",
                        padding: 0,
                        lineHeight: 1,
                      }}
                    >
                      {showRegPass2 ? "🙈" : "👁"}
                    </button>
                    {regPass2 && (
                      <div
                        style={{
                          position: "absolute",
                          right: 44,
                          top: "50%",
                          transform: "translateY(-50%)",
                          fontSize: 16,
                        }}
                      >
                        {regPass === regPass2 ? "✅" : "❌"}
                      </div>
                    )}
                  </div>
                </div>

                {/* ADMIN KODI */}
                <div style={{ marginBottom: 20 }}>
                  <label
                    style={{
                      color: "rgba(255,255,255,0.7)",
                      fontSize: 13,
                      fontWeight: 600,
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    🔑 Admin kodi (maxfiy)
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showAdminCode ? "text" : "password"}
                      value={regCode}
                      onChange={(e) => setRegCode(e.target.value)}
                      placeholder="Maxfiy kod"
                      style={{
                        width: "100%",
                        padding: "11px 44px 11px 14px",
                        borderRadius: 10,
                        background: "rgba(255,255,255,0.08)",
                        border: "1px solid rgba(255,255,255,0.15)",
                        color: "white",
                        fontSize: 14,
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminCode((p) => !p)}
                      style={{
                        position: "absolute",
                        right: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: 18,
                        color: "rgba(255,255,255,0.5)",
                        padding: 0,
                        lineHeight: 1,
                      }}
                    >
                      {showAdminCode ? "🙈" : "👁"}
                    </button>
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "rgba(255,255,255,0.2)",
                      marginTop: 4,
                    }}
                  >
                    Faqat admin biladi
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "14px",
                    borderRadius: 12,
                    border: "none",
                    background: loading
                      ? "rgba(124,58,237,0.5)"
                      : "linear-gradient(135deg, #7C3AED, #2563EB)",
                    color: "white",
                    fontWeight: 700,
                    fontSize: 16,
                    cursor: loading ? "not-allowed" : "pointer",
                  }}
                >
                  {loading
                    ? "⏳ Yaratilmoqda..."
                    : "✅ O'qituvchi akkaunt yaratish"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowRegister(false);
                    setError("");
                  }}
                  style={{
                    width: "100%",
                    marginTop: 8,
                    padding: "10px",
                    borderRadius: 12,
                    border: "none",
                    background: "transparent",
                    color: "rgba(255,255,255,0.4)",
                    cursor: "pointer",
                    fontSize: 13,
                  }}
                >
                  ← Orqaga
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes float {
          from { transform: translateY(0) rotate(0deg); }
          to { transform: translateY(-30px) rotate(5deg); }
        }
        input::placeholder { color: rgba(255,255,255,0.3); }
        input:focus { border-color: rgba(37,99,235,0.6) !important; }
      `}</style>
    </div>
  );
}
