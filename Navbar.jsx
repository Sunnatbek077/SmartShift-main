import { useState } from "react";
import { USER_PROFILE } from "./index";
import ThemeToggle from "./ThemeToggle";

const styles = {
  navbar: {
    position: "sticky", top: 0, zIndex: 100,
    backdropFilter: "blur(20px)",
    background: "var(--navbar-bg)",
    borderBottom: "1px solid var(--navbar-border)",
    padding: "0 32px", height: 72,
    display: "flex", alignItems: "center", justifyContent: "space-between",
    transition: "background 0.3s ease, border-color 0.3s ease",
  },
  brand: {
    display: "flex", alignItems: "center", gap: 12,
    cursor: "pointer", border: "none", background: "none", padding: 0,
  },
  brandName: {
    color: "var(--text)", fontWeight: 700, fontSize: 20,
    letterSpacing: "-0.5px", fontFamily: "'Space Grotesk', sans-serif",
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

// Talaba va professor panellari uchun yagona navigation bar.
// `tabs` har bir rol uchun alohida beriladi; `streak` faqat
// talaba uchun uzatilganda ko'rinadi (professor uchun mazmunsiz).
export default function Navbar({
  tabs,
  currentPage,
  onNavigate,
  currentUser,
  onLogout,
  streak,
  onProfileClick,
}) {
  const name = currentUser?.full_name || USER_PROFILE.name;
  const initials = name.split(" ").map(w => w[0] || "").join("").slice(0, 2).toUpperCase() || "AT";
  const [showMenu, setShowMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleProfileItemClick = () => {
    setShowMenu(false);
    if (onProfileClick) onProfileClick();
    else onNavigate?.("profile");
  };

  return (
    <nav style={styles.navbar}>
      {/* LOGO */}
      <button style={styles.brand} onClick={() => onNavigate?.(tabs[0]?.id)}>
        <img src="/logo.png" alt="EduMind" style={{ width: 32, height: 32, borderRadius: 8, objectFit: "cover" }} />
        <span style={styles.brandName}>EduMind</span>
      </button>

      {/* NAV LINKS (DESKTOP) */}
      <div className="nav-links-desktop" style={styles.navLinks}>
        {tabs.map((item) => (
          <button
            key={item.id}
            style={{
              ...styles.navLink,
              ...(currentPage === item.id ? styles.navLinkActive : {}),
            }}
            onClick={() => onNavigate?.(item.id)}
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
            {item.icon ? `${item.icon} ` : ""}{item.label}
          </button>
        ))}
      </div>

      {/* RIGHT SIDE: toggle + profile + hamburger */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
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
            border: "1px solid var(--border)",
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
          <div style={styles.profileBtn} onClick={() => setShowMenu(m => !m)}>
            <div style={styles.avatar}>{initials}</div>
            <div className="nav-links-desktop">
              <div style={styles.userName}>{name}</div>
              {typeof streak === "number" && (
                <div style={styles.userLevel}>🔥 {streak} kunlik streak</div>
              )}
            </div>
            <span style={{ marginLeft: 4, color: "var(--muted)", fontSize: 12 }}>▾</span>
          </div>

          {/* Dropdown */}
          {showMenu && (
            <div style={{
              position: "absolute", top: "calc(100% + 8px)", right: 0,
              background: "var(--dropdown-bg)", borderRadius: 14, minWidth: 180,
              boxShadow: "0 8px 32px var(--shadow)",
              border: "1px solid var(--border)",
              overflow: "hidden", zIndex: 999,
            }}>
              <button
                onClick={handleProfileItemClick}
                style={{ width: "100%", padding: "12px 16px", border: "none", background: "none", cursor: "pointer", textAlign: "left", fontSize: 14, color: "var(--text)", display: "flex", alignItems: "center", gap: 10, fontFamily: "'Outfit'" }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--surface)"}
                onMouseLeave={e => e.currentTarget.style.background = "none"}
              >
                👤 Profil
              </button>
              <div style={{ height: 1, background: "var(--border)" }} />
              <button
                onClick={() => { setShowMenu(false); onLogout?.(); }}
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
          position: "absolute", top: "100%", left: 0, right: 0,
          background: "var(--card)", borderBottom: "1px solid var(--border)",
          padding: "12px 24px", display: "flex", flexDirection: "column",
          gap: 8, boxShadow: "0 8px 32px var(--shadow)", zIndex: 99,
          animation: "fadeInUp 0.2s ease",
        }}>
          {tabs.map((item) => (
            <button
              key={item.id}
              style={{
                ...styles.navLink,
                display: "flex", alignItems: "center", gap: 12,
                width: "100%", padding: "12px 16px", textAlign: "left",
                ...(currentPage === item.id ? styles.navLinkActive : {}),
              }}
              onClick={() => {
                onNavigate?.(item.id);
                setShowMobileMenu(false);
              }}
            >
              {item.icon && <span style={{ fontSize: 18 }}>{item.icon}</span>} {item.label}
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
