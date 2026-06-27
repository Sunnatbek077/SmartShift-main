import re

file_path = "LoginPage.jsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add selectedRole state
if "const [selectedRole, setSelectedRole] = useState(null);" not in content:
    content = content.replace(
        'const [setupMsg, setSetupMsg] = useState("");',
        'const [setupMsg, setSetupMsg] = useState("");\n  const [selectedRole, setSelectedRole] = useState(null);'
    )

# 2. Modify "Aqlli ta'lim platformasi talaba va o'qituvchilar uchun."
content = content.replace("Aqlli ta'lim platformasi talaba va o'qituvchilar uchun.", "O'zbekiston oliy ta'limi uchun AI yordamchi.")
content = content.replace("umumta'lim maktablarining o'quvchilari va o'qituvchilari uchun", "oliy ta'lim muassasalari talabalari va professorlari uchun")

# 3. Create the new RoleSelection component (inline as a block)
role_selection_jsx = """
        {/* YANGI ROLE SELECTION (Demo) */}
        {!selectedRole && !showAboutModal && !setupMode && (
          <div style={{ textAlign: 'center', width: '100%', maxWidth: 500, margin: '0 auto', color: 'white' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
              <div style={{ width: 64, height: 64, background: '#EF4444', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 'bold', color: 'white', marginBottom: 16, boxShadow: '0 8px 32px rgba(239, 68, 68, 0.4)' }}>
                EM
              </div>
              <h1 style={{ fontSize: 36, fontWeight: 800, margin: '0 0 8px 0', fontFamily: "'Space Grotesk', sans-serif" }}>EduMind</h1>
              <p style={{ color: 'rgba(255,255,255,0.6)', margin: 0, fontSize: 16 }}>O'zbekiston oliy ta'limi uchun AI yordamchi</p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <button 
                type="button"
                onClick={() => { setSelectedRole('professor'); setUsername('aziz_karimov'); setPassword('123456'); setShowRegister(false); setShowAdminLogin(false); }} 
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 24, display: 'flex', alignItems: 'center', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s', width: '100%' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }} 
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
              >
                <div style={{ fontSize: 40, marginRight: 20 }}>👨‍🏫</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4, color: 'white' }}>Professor</div>
                  <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.4 }}>Talabalarni boshqaring, AI bilan ishlaringizni tekshiring</div>
                  <div style={{ fontSize: 12, color: '#3B82F6', marginTop: 8, background: 'rgba(59,130,246,0.1)', display: 'inline-block', padding: '4px 10px', borderRadius: 12, fontWeight: 600 }}>Demo: Aziz Karimov</div>
                </div>
                <div style={{ fontSize: 24, color: 'rgba(255,255,255,0.3)' }}>→</div>
              </button>
              
              <button 
                type="button"
                onClick={() => { setSelectedRole('student'); setUsername('bekzod_toshmatov'); setPassword('123456'); setShowRegister(false); setShowAdminLogin(false); }} 
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 24, display: 'flex', alignItems: 'center', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s', width: '100%' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }} 
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
              >
                <div style={{ fontSize: 40, marginRight: 20 }}>🎓</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4, color: 'white' }}>Talaba</div>
                  <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.4 }}>AI yordamchi bilan o'qing, xatolaringizni bilib oling</div>
                  <div style={{ fontSize: 12, color: '#10B981', marginTop: 8, background: 'rgba(16,185,129,0.1)', display: 'inline-block', padding: '4px 10px', borderRadius: 12, fontWeight: 600 }}>Demo: Bekzod Toshmatov</div>
                </div>
                <div style={{ fontSize: 24, color: 'rgba(255,255,255,0.3)' }}>→</div>
              </button>
            </div>
            
            <div style={{ marginTop: 40, color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
              Bu — Milliy AI Xakaton uchun demo versiya - 4-muammo yechimi
            </div>
            
            {/* Eski maxfiy tugmalar (Logo bosilganda admin kabi chiqardi). 
                Ularni ham qo'shamiz, lekin faqat ma'lum joyni bosganda ishlaydigan qilib. */}
            <div style={{ marginTop: 20, opacity: 0.1, cursor: 'pointer' }} onClick={() => setShowAdminLogin(true)}>
              🛡️
            </div>
          </div>
        )}
"""

# Let's replace the existing Logo section and add `roleSelect` wrap around the form.
# Look for the exact block from: `        {/* Logo — 5 marta bosish = maxfiy o'qituvchi ro'yxati, 7 marta = admin */}`
# Up to `        {checking && (`
logo_pattern = re.compile(r"\{\/\*\s*Logo\s*—\s*5\s*marta\s*bosish.*?(?=\{\s*checking\s*&&\s*\()", re.DOTALL)
content = logo_pattern.sub(role_selection_jsx + "\n        ", content)

# Also, wrap the setupMode and regular login inside `{selectedRole && (` (except checking which handles itself).
# Find where checking ends
checking_pattern = re.compile(r"\{\/\*\s*=====\s*BIRINCHI\s*SOZLASH\s*=====\s*\*\/\}")
replacement = r"""
        {/* Orqaga qaytish tugmasi */}
        {selectedRole && !showAboutModal && !checking && !setupMode && (
          <div style={{textAlign: 'left', marginBottom: 20, width: '100%', maxWidth: 480}}>
            <button onClick={() => setSelectedRole(null)} style={{background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 15, display: 'flex', alignItems: 'center', fontWeight: 600}}>
              ← Orqaga
            </button>
          </div>
        )}
        {/* ===== BIRINCHI SOZLASH ===== */}"""
content = checking_pattern.sub(replacement, content)

# But we only want to show the login form if selectedRole is truthy.
# Change `{!checking && !setupMode && (` to `{!checking && !setupMode && selectedRole && (`
content = content.replace("{!checking && !setupMode && (", "{!checking && !setupMode && selectedRole && (")

# One final tweak: Change the background of the main container to match the very dark theme
# From linear-gradient(135deg, #0F172A 0%, #1E3A8A 50%, #0F172A 100%) to a darker #09090b
content = content.replace("linear-gradient(135deg, #0F172A 0%, #1E3A8A 50%, #0F172A 100%)", "#09090b")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Update complete")
