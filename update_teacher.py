import re

file_path = "TeacherPanel.jsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update background color
content = content.replace(
    '<div style={{ minHeight: "100vh", background: "#F8FAFC" }}>',
    '<div style={{ minHeight: "100vh", background: "#09090b", color: "#FAFAFA", fontFamily: "\\\'Inter\\\', sans-serif" }}>'
)

# 2. Replace Header
header_pattern = re.compile(r"\{\/\*\s*Header\s*\*\/.*?<div\s+style=\{\{\s*maxWidth:\s*1200,\s*margin:\s*\"0\s+auto\"", re.DOTALL)

new_header = """
      {/* Oliy ta'lim (Professor) Header */}
      <div style={{
        background: "#09090b",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        padding: "0 32px", height: 72,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 50
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 32, height: 32, background: "#EF4444", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold", fontSize: 16 }}>
              EM
            </div>
            <div style={{ color: "white", fontWeight: 700, fontSize: 20, letterSpacing: "-0.5px" }}>EduMind</div>
          </div>
          <div style={{ display: "flex", gap: 24 }}>
            {[
              { id: "students", label: "Dashboard" },
              { id: "results", label: "AI Tekshirish" },
              { id: "stats", label: "Hisobotlar" },
              { id: "classes", label: "Sinflar" },
              { id: "lessons", label: "Dars Rejalari" },
              { id: "add", label: "Talaba qo'shish" },
            ].map(t => (
              <div 
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{ 
                  color: tab === t.id ? "white" : "rgba(255,255,255,0.5)", 
                  fontSize: 14, fontWeight: tab === t.id ? 600 : 500,
                  cursor: "pointer", transition: "color 0.2s",
                  borderBottom: tab === t.id ? "2px solid white" : "2px solid transparent",
                  padding: "24px 0",
                  marginTop: 2 // for perfect centering
                }}
              >
                {t.label}
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ color: "rgba(255,255,255,0.5)", cursor: "pointer" }}>🔍</div>
          <div style={{ color: "rgba(255,255,255,0.5)", cursor: "pointer", position: "relative" }}>
            🔔
            <div style={{ position: "absolute", top: 0, right: 0, width: 8, height: 8, background: "#EF4444", borderRadius: "50%" }}></div>
          </div>
          <div
            onClick={() => setShowProfile(true)}
            style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", marginLeft: 10 }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700, fontSize: 14, color: "white"
            }}>
              {teacher.full_name?.[0]?.toUpperCase() || "P"}
            </div>
          </div>
          <button onClick={onLogout} style={{
            background: "transparent", border: "1px solid rgba(255,255,255,0.2)",
            color: "white", padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 500
          }}>
            Chiqish
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 20px" }}>
"""
content = header_pattern.sub(new_header, content)

# 3. Replace the Statistika + Tablar + TALABALAR block with the new layout.
# We will match from `{/* Statistika */}` up to `{/* NATIJALAR */}`
students_block_pattern = re.compile(r"\{\/\*\s*Statistika\s*\*\/.*?\{\/\*\s*NATIJALAR\s*\*\/\}", re.DOTALL)

new_students_block = """
        {loading && (
          <div style={{ textAlign: "center", padding: 60, color: "rgba(255,255,255,0.5)" }}>
            ⏳ Yuklanmoqda...
          </div>
        )}

        {/* YANGI DASHBOARD DIZAYNI */}
        {!loading && tab === "students" && (
          <div>
            {/* O'qituvchi Salomlashish qismi */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32 }}>
              <div>
                <h1 style={{ fontSize: 32, fontWeight: 700, margin: "0 0 8px 0", color: "white" }}>
                  Salom, {teacher.full_name?.split(" ")[0]} 👋
                </h1>
                <p style={{ color: "rgba(255,255,255,0.5)", margin: 0, fontSize: 15 }}>
                  Bugun 3 ta yangilik bor — <span style={{ color: "#EF4444" }}>AI 7 ta xavfli talabani aniqladi</span>
                </p>
              </div>
              <button style={{ 
                background: "white", color: "black", border: "none", 
                padding: "10px 20px", borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: "pointer" 
              }}>
                Hisobot yaratish
              </button>
            </div>

            {/* Statistika Kartalari */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
              <div style={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 24 }}>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, marginBottom: 12 }}>Jami talabalar</div>
                <div style={{ fontSize: 32, fontWeight: 700, color: "white" }}>{totalStudents}</div>
                <div style={{ color: "#10B981", fontSize: 13, marginTop: 8 }}>+2 yangi</div>
              </div>
              <div style={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 24 }}>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, marginBottom: 12 }}>O'rtacha ball</div>
                <div style={{ fontSize: 32, fontWeight: 700, color: "white" }}>{avgScore}%</div>
                <div style={{ color: "#10B981", fontSize: 13, marginTop: 8 }}>↑ 3.2 ball</div>
              </div>
              <div style={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 24 }}>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, marginBottom: 12 }}>Tekshirilmagan</div>
                <div style={{ fontSize: 32, fontWeight: 700, color: "white" }}>23</div>
                <div style={{ color: "#F59E0B", fontSize: 13, marginTop: 8 }}>Bugun deadline</div>
              </div>
              <div style={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 24 }}>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, marginBottom: 12 }}>Xavfli talabalar</div>
                <div style={{ fontSize: 32, fontWeight: 700, color: "white" }}>7</div>
                <div style={{ color: "#EF4444", fontSize: 13, marginTop: 8 }}>AI aniqladi</div>
              </div>
            </div>

            {/* Asosiy Content: Jadval va Vazifalar */}
            <div style={{ display: "grid", gridTemplateColumns: "70% 30%", gap: 24 }}>
              {/* Chap taraf: Jadval */}
              <div style={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0, color: "white" }}>Talabalar holati</h2>
                  <div style={{ display: "flex", gap: 12, background: "rgba(255,255,255,0.05)", padding: 4, borderRadius: 8 }}>
                    {['Barchasi', 'Xavfli', "O'rta"].map(t => (
                      <div key={t} style={{ 
                        padding: "4px 12px", fontSize: 13, borderRadius: 6, cursor: "pointer",
                        background: t === 'Barchasi' ? "rgba(255,255,255,0.1)" : "transparent",
                        color: t === 'Barchasi' ? "white" : "rgba(255,255,255,0.5)"
                      }}>
                        {t}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Custom table design */}
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 14 }}>
                  <thead>
                    <tr style={{ color: "rgba(255,255,255,0.4)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                      <th style={{ padding: "12px 0", fontWeight: 500 }}>TALABA</th>
                      <th style={{ padding: "12px 0", fontWeight: 500 }}>FAN</th>
                      <th style={{ padding: "12px 0", fontWeight: 500 }}>QATNASHUV</th>
                      <th style={{ padding: "12px 0", fontWeight: 500 }}>SO'NGGI BALL</th>
                      <th style={{ padding: "12px 0", fontWeight: 500 }}>HOLAT</th>
                      <th style={{ padding: "12px 0", fontWeight: 500, textAlign: "right" }}>AMAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.slice(0, 5).map((student, i) => {
                      const avg = getStudentAvg(student.id) || 75;
                      const isDanger = avg < 60;
                      const isWarn = avg >= 60 && avg < 80;
                      return (
                        <tr key={student.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                          <td style={{ padding: "16px 0", display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>
                              {student.full_name?.[0]?.toUpperCase()}
                            </div>
                            <div>
                              <div style={{ color: "white", fontWeight: 500 }}>{student.full_name}</div>
                              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>#{student.username}</div>
                            </div>
                          </td>
                          <td style={{ padding: "16px 0", color: "rgba(255,255,255,0.7)" }}>Dasturlash asoslari</td>
                          <td style={{ padding: "16px 0", color: "rgba(255,255,255,0.7)" }}>{90 - i * 2}%</td>
                          <td style={{ padding: "16px 0", color: "rgba(255,255,255,0.7)" }}>{avg} ball</td>
                          <td style={{ padding: "16px 0" }}>
                            <span style={{ 
                              background: isDanger ? "rgba(239, 68, 68, 0.1)" : isWarn ? "rgba(245, 158, 11, 0.1)" : "rgba(16, 185, 129, 0.1)", 
                              color: isDanger ? "#EF4444" : isWarn ? "#F59E0B" : "#10B981", 
                              padding: "4px 10px", borderRadius: 12, fontSize: 12, fontWeight: 500 
                            }}>
                              {isDanger ? "Xavfli" : isWarn ? "O'rta" : "Yaxshi"}
                            </span>
                          </td>
                          <td style={{ padding: "16px 0", textAlign: "right" }}>
                            <button style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: 13, textDecoration: "underline" }}>
                              Tekshirish →
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* O'ng taraf: Vazifalar */}
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <div style={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 24 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 600, margin: "0 0 16px 0", color: "white" }}>Bugungi vazifalar</h2>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 8, height: 8, background: "#3B82F6", borderRadius: "50%" }}></div>
                    <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 14 }}>23 ta laboratoriya tekshirish</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 8, height: 8, background: "#F59E0B", borderRadius: "50%" }}></div>
                    <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 14 }}>2 ta oraliq nazorat</div>
                  </div>
                </div>

                <div style={{ background: "rgba(239, 68, 68, 0.05)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: 16, padding: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, color: "#EF4444" }}>
                    <span style={{ fontSize: 18 }}>⚠️</span>
                    <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>AI Insight - bugun</h2>
                  </div>
                  <p style={{ color: "rgba(255,255,255,0.7)", margin: 0, fontSize: 14, lineHeight: 1.5 }}>
                    <strong style={{ color: "white" }}>Bekzod Toshmatov (ID: 4567)</strong> Dasturlash asoslaridan oxirgi 3 ta darsni qoldirdi va ballari 45% ga tushib ketdi. Zudlik bilan aloqaga chiqish tavsiya etiladi.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* NATIJALAR */}
"""
content = students_block_pattern.sub(new_students_block, content)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("TeacherPanel.jsx updated successfully!")
