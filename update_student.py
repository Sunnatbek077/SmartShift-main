import re

file_path = "Dashboard.jsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add chatOpen state
if "const [chatOpen, setChatOpen] = useState(false);" not in content:
    content = content.replace(
        "const [loadingStats, setLoadingStats] = useState(true);",
        "const [loadingStats, setLoadingStats] = useState(true);\n  const [chatOpen, setChatOpen] = useState(false);"
    )

# 2. Replace return block
return_pattern = re.compile(r"return\s*\(\s*<>\s*\{\/\*\s*SALOM.*", re.DOTALL)

new_return = """return (
    <div style={{ paddingBottom: 80, minHeight: "100vh", background: "#09090b", color: "white", padding: 32 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, margin: "0 0 8px 0" }}>
          Salom, {displayName.split(" ")[0]}! 🧑‍💻
        </h1>
        <p style={{ color: "rgba(255,255,255,0.5)", margin: 0, fontSize: 15 }}>
          Bugun 1 ta vazifangiz bor — <span style={{ color: "#F59E0B" }}>Lab 3 bugun soat 23:59 gacha topshirilishi kerak</span>
        </p>
      </div>

      {/* Warning banner */}
      <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: 16, padding: "16px 24px", display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
        <span style={{ fontSize: 28 }}>⚠️</span>
        <div style={{ flex: 1 }}>
          <div style={{ color: "#EF4444", fontWeight: 600, fontSize: 16, marginBottom: 4 }}>Dasturlash asoslari: Lab 3 ishi hali tekshirilmagan</div>
          <div style={{ color: "rgba(239, 68, 68, 0.8)", fontSize: 14 }}>AI feedbackni ko'ring va xatolarni to'g'irlang</div>
        </div>
        <button style={{ background: "#EF4444", color: "white", border: "none", padding: "10px 20px", borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: "pointer" }}>Ko'rish →</button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 40 }}>
        <div style={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 24 }}>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, marginBottom: 8 }}>Fanlar</div>
          <div style={{ fontSize: 36, fontWeight: 800 }}>{subjectsWithProgress.length}</div>
          <div style={{ color: "#3B82F6", fontSize: 14, marginTop: 4 }}>O'qiyotgan fanlar</div>
        </div>
        <div style={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 24 }}>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, marginBottom: 8 }}>O'rtacha ball</div>
          <div style={{ fontSize: 36, fontWeight: 800 }}>{statsData.totalScore || 71}</div>
          <div style={{ color: "#10B981", fontSize: 14, marginTop: 4 }}>Yaxshi natija</div>
        </div>
        <div style={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 24 }}>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, marginBottom: 8 }}>Deadline</div>
          <div style={{ fontSize: 36, fontWeight: 800 }}>1</div>
          <div style={{ color: "#F59E0B", fontSize: 14, marginTop: 4 }}>Bugun topshirish kerak</div>
        </div>
      </div>

      {/* Fanlar va Progress */}
      <div style={{ display: "grid", gridTemplateColumns: "60% 40%", gap: 32 }}>
        {/* Fanlar Listi */}
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, color: "white" }}>Fanlarim</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {subjectsWithProgress.map((fan, idx) => {
              const profs = ["Prof. Karimov", "Prof. Rahimov", "Prof. Saidova", "Prof. Aliyev"];
              const prof = profs[idx % profs.length];
              return (
                <div key={fan.id} onClick={() => onFanSelect(fan)} style={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 20, display: "flex", alignItems: "center", gap: 20, cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.borderColor = fan.color || "#3B82F6"} onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"}>
                  <div style={{ width: 56, height: 56, background: "rgba(255,255,255,0.05)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>{fan.icon || "📚"}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4, color: "white" }}>{fan.name}</div>
                    <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>{prof}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: fan.color || "#3B82F6" }}>{fan.progress || Math.floor(Math.random()*40 + 40)}%</div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>O'zlashtirish</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Progress Chart Placeholder */}
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, color: "white" }}>Haftalik progress</h2>
          <div style={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 32, height: 320, display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
             {[40, 60, 45, 80, 50, 90, 70].map((h, i) => (
               <div key={i} style={{ flex: 1, background: i === 5 ? "linear-gradient(180deg, #3B82F6 0%, rgba(59, 130, 246, 0.2) 100%)" : "rgba(255,255,255,0.05)", height: `${h}%`, borderRadius: "12px 12px 0 0", position: "relative" }}>
                 <div style={{ position: "absolute", bottom: -28, left: "50%", transform: "translateX(-50%)", fontSize: 12, color: i === 5 ? "white" : "rgba(255,255,255,0.5)", fontWeight: i === 5 ? 600 : 400 }}>{['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'][i]}</div>
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* Floating AI Chatbot */}
      <div style={{ position: "fixed", bottom: 32, right: 32, zIndex: 9999 }}>
        {chatOpen && (
          <div style={{ width: 380, background: "#18181b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24, overflow: "hidden", boxShadow: "0 12px 48px rgba(0,0,0,0.6)", marginBottom: 20, display: "flex", flexDirection: "column" }}>
            <div style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ fontSize: 28 }}>🤖</div>
                <div>
                  <div style={{ color: "white", fontWeight: 700, fontSize: 16 }}>EduMind AI</div>
                  <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>Har doim tayyor</div>
                </div>
              </div>
              <button onClick={() => setChatOpen(false)} style={{ background: "rgba(0,0,0,0.2)", border: "none", color: "white", width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 18 }}>×</button>
            </div>
            
            <div style={{ padding: 24, height: 320, overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ alignSelf: "center", color: "rgba(255,255,255,0.3)", fontSize: 12, marginBottom: 8 }}>Bugun</div>
              
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ width: 32, height: 32, background: "rgba(59, 130, 246, 0.2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>🤖</div>
                <div style={{ background: "rgba(255,255,255,0.05)", padding: 14, borderRadius: "2px 16px 16px 16px", color: "rgba(255,255,255,0.9)", fontSize: 14, lineHeight: 1.6 }}>
                  Salom {displayName.split(" ")[0]}! Siz <strong>Dasturlash asoslari</strong> fanidan Lab 3 ni hali topshirmadingiz. Dastur kodida xatolik borligini aniqladim. Uni birgalikda to'g'irlaymizmi?
                </div>
              </div>
              
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ width: 32, height: 32, background: "rgba(59, 130, 246, 0.2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>🤖</div>
                <div style={{ background: "rgba(255,255,255,0.05)", padding: 14, borderRadius: "2px 16px 16px 16px", color: "rgba(255,255,255,0.9)", fontSize: 14, lineHeight: 1.6 }}>
                  Bundan tashqari, Matematika fanidan o'zlashtirishingiz <span style={{ color: "#EF4444", fontWeight: 600 }}>58% ga tushib qoldi</span>. O'zlashtirishda qanday muammolar bo'lyapti? Sizga qo'shimcha materiallar beraymi?
                </div>
              </div>
            </div>
            
            <div style={{ padding: 20, borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", gap: 12, background: "rgba(0,0,0,0.2)" }}>
              <input placeholder="Xabar yozing..." style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "12px 16px", color: "white", fontSize: 14, outline: "none" }} />
              <button style={{ background: "#2563EB", border: "none", color: "white", width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 16 }}>➤</button>
            </div>
          </div>
        )}
        
        <button 
          onClick={() => setChatOpen(!chatOpen)}
          style={{ 
            width: 72, height: 72, borderRadius: "50%", 
            background: chatOpen ? "rgba(255,255,255,0.1)" : "linear-gradient(135deg, #2563EB, #7C3AED)", 
            border: chatOpen ? "1px solid rgba(255,255,255,0.2)" : "none", 
            color: "white", fontSize: 32, display: "flex", alignItems: "center", justifyContent: "center", 
            cursor: "pointer", boxShadow: chatOpen ? "none" : "0 8px 32px rgba(37,99,235,0.5)", 
            float: "right", transition: "all 0.3s"
          }}
        >
          {chatOpen ? "✕" : "🤖"}
        </button>
      </div>
    </div>
  );
}
"""

content = return_pattern.sub(new_return, content)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Dashboard.jsx updated successfully!")
