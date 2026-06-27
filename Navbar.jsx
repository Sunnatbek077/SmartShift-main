import { useState } from "react";
import { COLORS, USER_PROFILE } from "./index";
import ThemeToggle from "./ThemeToggle";

const styles = {
  navbar: {
    position: "sticky", top: 0, zIndex: 100,
    backdropFilter: "blur(20px)",
    background: "var(--navbar-bg)",
    borderBottom: "1px solid var(--navbar-border)",
    padding: "0 24px", height: 64,
    display: "flex", alignItems: "center", justifyContent: "space-between",
    transition: "background 0.3s ease, border-color 0.3s ease",
  },
  logo: {
    display: "flex", alignItems: "center", gap: 10,
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 700, fontSize: 22,
    background: "linear-gradient(135deg, #2563EB, #059669)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
    cursor: "pointer", border: "none", backgroundColor: "transparent",
  },
  navLinks: { display: "flex", gap: 4 },
  navLink: {
    padding: "8px 16px", borderRadius: 8,
    fontSize: 14, fontWeight: 500,
    color: "var(--nav-text)", cursor: "pointer",
    transition: "all 0.2s", border: "none", background: "none",
    fontFamily: "'Outfit', sans-serif",
  },
  navLinkActive: {
    color: "var(--nav-text-active)", background: "var(--nav-bg-active)",
    fontWeight: 600,
  },
  profileBtn: {
    display: "flex", alignItems: "center", gap: 10,
    padding: "6px 14px 6px 6px",
    borderRadius: 12, background: "var(--surface)",
    border: "1px solid var(--border)",
    cursor: "pointer", transition: "all 0.2s",
  },
  avatar: {
    width: 34, height: 34, borderRadius: 8,
    background: "linear-gradient(135deg, #2563EB, #059669)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: 700, fontSize: 14, color: "white",
    fontFamily: "'Space Grotesk', sans-serif",
  },
  userName: { fontSize: 13, fontWeight: 600, color: "var(--text)" },
  userLevel: { fontSize: 11, color: "var(--muted)", fontWeight: 500 },
};

const NAV_ITEMS = [
  { id: "dashboard", icon: "📊", name: "Dashboard" },
  { id: "profile", icon: "👤", name: "Profil" },
];

export default function Navbar({ currentPage, onNavigate, currentUser, onLogout }) {
  const name = currentUser?.full_name || USER_PROFILE.name;
  const initials = name.split(" ").map(w => w[0] || "").join("").slice(0, 2).toUpperCase() || "AT";
  const [showMenu, setShowMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <nav style={styles.navbar}>
      {/* LOGO */}
      <button style={styles.logo} onClick={() => onNavigate("dashboard")}>
        <img src="/logo.jpeg" alt="EduMind" style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover', marginRight: 4 }} /> EduMind
      </button>

      {/* NAV LINKS (DESKTOP) */}
      <div className="nav-links-desktop" style={styles.navLinks}>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            style={{
              ...styles.navLink,
              ...(currentPage === item.id ? styles.navLinkActive : {}),
            }}
            onClick={() => onNavigate(item.id)}
            onMouseEnter={(e) => {
              if (currentPage !== item.id) {
                e.target.style.color = "var(--nav-text-active)";
                e.target.style.background = "var(--nav-bg-active)";
              }
            }}
            onMouseLeave={(e) => {
              if (currentPage !== item.id) {
                e.target.style.color = "var(--nav-text)";
                e.target.style.background = "none";
              }
            }}
          >
            {item.icon} {item.name}
          </button>
        ))}
      </div>

      {/* RIGHT SIDE: toggle + profile + hamburger */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* THEME TOGGLE */}
        <ThemeToggle />

        {/* HAMBURGER TOGGLE (MOBILE) */}
        <button
          className="nav-mobile-toggle"
          onClick={() => setShowMobileMenu(m => !m)}
          style={{
            display: "none",
            alignItems: "center",
            justifyContent: "center",
            width: 38,
            height: 38,
            borderRadius: 10,
            border: `1px solid var(--border)`,
            background: "none",
            cursor: "pointer",
            fontSize: 20,
            color: "var(--text)",
            transition: "all 0.2s",
          }}
        >
          {showMobileMenu ? "✕" : "☰"}
        </button>

        {/* PROFILE BUTTON */}
        <div style={{ position: "relative" }}>
          <div
            style={styles.profileBtn}
            onClick={() => setShowMenu(m => !m)}
          >
            <div style={styles.avatar}>{initials}</div>
            <div className="nav-links-desktop">
              <div style={styles.userName}>{name}</div>
              <div style={styles.userLevel}>🔥 {USER_PROFILE.streak} kunlik streak</div>
            </div>
            <span style={{ marginLeft: 4, color: "var(--muted)", fontSize: 12 }}>▾</span>
          </div>

          {/* Dropdown */}
          {showMenu && (
            <div style={{
              position: "absolute", top: "calc(100% + 8px)", right: 0,
              background: "var(--dropdown-bg)", borderRadius: 14, minWidth: 180,
              boxShadow: "0 8px 32px var(--shadow)",
              border: `1px solid var(--border)`,
              overflow: "hidden", zIndex: 999,
            }}>
              <button
                onClick={() => { setShowMenu(false); onNavigate("profile"); }}
                style={{ width: "100%", padding: "12px 16px", border: "none", background: "none", cursor: "pointer", textAlign: "left", fontSize: 14, color: "var(--text)", display: "flex", alignItems: "center", gap: 10, fontFamily: "'Outfit'" }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--surface)"}
                onMouseLeave={e => e.currentTarget.style.background = "none"}
              >
                👤 Profil
              </button>
              <div style={{ height: 1, background: "var(--border)" }} />
              <button
                onClick={() => { setShowMenu(false); onLogout && onLogout(); }}
                style={{ width: "100%", padding: "12px 16px", border: "none", background: "none", cursor: "pointer", textAlign: "left", fontSize: 14, color: "#DC2626", display: "flex", alignItems: "center", gap: 10, fontFamily: "'Outfit'", fontWeight: 600 }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(220,38,38,0.08)"}
                onMouseLeave={e => e.currentTarget.style.background = "none"}
              >
                🚪 Chiqish
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {showMobileMenu && (
        <div style={{
          position: "absolute", top: 64, left: 0, right: 0,
          background: "var(--card)", borderBottom: `1px solid var(--border)`,
          padding: "12px 24px", display: "flex", flexDirection: "column",
          gap: 8, boxShadow: "0 8px 32px var(--shadow)", zIndex: 99,
          animation: "fadeInUp 0.2s ease",
        }}>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              style={{
                ...styles.navLink,
                display: "flex", alignItems: "center", gap: 12,
                width: "100%", padding: "12px 16px", textAlign: "left",
                ...(currentPage === item.id ? styles.navLinkActive : {}),
              }}
              onClick={() => {
                onNavigate(item.id);
                setShowMobileMenu(false);
              }}
            >
              <span style={{ fontSize: 18 }}>{item.icon}</span> {item.name}
            </button>
          ))}
        </div>
      )}

      {/* Dropdown yopish uchun overlay */}
      {(showMenu || showMobileMenu) && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 98 }}
          onClick={() => { setShowMenu(false); setShowMobileMenu(false); }}
        />
      )}
    </nav>
  );
}
