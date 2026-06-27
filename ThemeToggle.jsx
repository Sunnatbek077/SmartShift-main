import { useTheme } from "./ThemeContext";

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      title={isDark ? "Yorug' rejim" : "Qorong'u rejim"}
      style={{
        width: 40, height: 22,
        borderRadius: 11,
        border: "none",
        cursor: "pointer",
        background: isDark ? "#2563EB" : "#CBD5E1",
        position: "relative",
        transition: "background 0.3s ease",
        flexShrink: 0,
      }}
    >
      <span style={{
        position: "absolute",
        top: 2,
        left: isDark ? 20 : 2,
        width: 18, height: 18,
        borderRadius: "50%",
        background: "white",
        transition: "left 0.25s ease",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 10,
        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
      }}>
        {isDark ? "🌙" : "☀️"}
      </span>
    </button>
  );
}
