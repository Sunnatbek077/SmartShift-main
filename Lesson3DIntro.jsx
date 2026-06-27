// ============================================================
// EduAI Platform — 3D FULLSCREEN DARS INTRO
// Dars ochilganda to'liq ekranda 3D vizualizatsiya ko'rsatadi
// Keyin Nigora ovozida ma'ruza boshlanadi
// ============================================================
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

// Fizika mavzulariga mos 3D sahna parametrlari
const TOPIC_THEMES = {
  // Mexanika
  default: { color1: "#2563EB", color2: "#7C3AED", particleColor: "#60A5FA", shape: "sphere" },
  kinematika: { color1: "#059669", color2: "#10B981", particleColor: "#34D399", shape: "arrow" },
  kuch: { color1: "#D97706", color2: "#F59E0B", particleColor: "#FCD34D", shape: "cube" },
  bosim: { color1: "#2563EB", color2: "#3B82F6", particleColor: "#93C5FD", shape: "cylinder" },
  energiya: { color1: "#DC2626", color2: "#F59E0B", particleColor: "#FCA5A5", shape: "torus" },
  issiqlik: { color1: "#DC2626", color2: "#F97316", particleColor: "#FCA5A5", shape: "sphere" },
  elektr: { color1: "#7C3AED", color2: "#A855F7", particleColor: "#C4B5FD", shape: "lightning" },
  optika: { color1: "#F59E0B", color2: "#FBBF24", particleColor: "#FDE68A", shape: "prism" },
  nazorat: { color1: "#64748B", color2: "#94A3B8", particleColor: "#CBD5E1", shape: "cube" },
};

function getTheme(topicName) {
  const n = topicName.toLowerCase();
  if (n.includes("nazorat")) return TOPIC_THEMES.nazorat;
  if (n.includes("elektr") || n.includes("tok") || n.includes("zaryad") || n.includes("om qonun")) return TOPIC_THEMES.elektr;
  if (n.includes("yorug'lik") || n.includes("linza") || n.includes("optika") || n.includes("ko'zgu")) return TOPIC_THEMES.optika;
  if (n.includes("issiqlik") || n.includes("bug'") || n.includes("qaynash") || n.includes("erish")) return TOPIC_THEMES.issiqlik;
  if (n.includes("energiya") || n.includes("ish") || n.includes("quvvat")) return TOPIC_THEMES.energiya;
  if (n.includes("bosim") || n.includes("paskal") || n.includes("atmosfera") || n.includes("suyuqlik")) return TOPIC_THEMES.bosim;
  if (n.includes("kuch") || n.includes("massa") || n.includes("zichlik")) return TOPIC_THEMES.kuch;
  if (n.includes("harakat") || n.includes("tezlik") || n.includes("kinematika")) return TOPIC_THEMES.kinematika;
  return TOPIC_THEMES.default;
}

export default function Lesson3DIntro({ topicName, chorakLabel, onComplete, onClose }) {
  const mountRef = useRef(null);
  const [phase, setPhase] = useState("intro"); // intro -> reading -> done
  const [fadeOut, setFadeOut] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;
    const theme = getTheme(topicName);

    // Three.js setup
    const w = window.innerWidth, h = window.innerHeight;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000);
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Gradient background
    const c1 = new THREE.Color(theme.color1);
    const c2 = new THREE.Color(theme.color2);
    scene.background = c1;

    // Lighting
    const ambLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);
    const pointLight = new THREE.PointLight(new THREE.Color(theme.particleColor), 2, 50);
    pointLight.position.set(-5, 5, 10);
    scene.add(pointLight);

    // Main object
    let mainMesh;
    const mainMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(theme.particleColor),
      metalness: 0.3, roughness: 0.2,
      clearcoat: 1, clearcoatRoughness: 0.1,
      transparent: true, opacity: 0.9,
    });

    switch (theme.shape) {
      case "cube":
        mainMesh = new THREE.Mesh(new THREE.BoxGeometry(5, 5, 5), mainMat);
        break;
      case "torus":
        mainMesh = new THREE.Mesh(new THREE.TorusGeometry(4, 1.5, 16, 100), mainMat);
        break;
      case "cylinder":
        mainMesh = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 6, 32), mainMat);
        break;
      default:
        mainMesh = new THREE.Mesh(new THREE.SphereGeometry(4, 64, 64), mainMat);
    }
    scene.add(mainMesh);

    // Orbiting smaller objects
    const orbiters = [];
    for (let i = 0; i < 8; i++) {
      const size = 0.4 + Math.random() * 0.8;
      const geom = i % 3 === 0 
        ? new THREE.OctahedronGeometry(size) 
        : i % 3 === 1 
        ? new THREE.IcosahedronGeometry(size) 
        : new THREE.TetrahedronGeometry(size);
      const mat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(theme.particleColor),
        metalness: 0.5, roughness: 0.3,
        emissive: new THREE.Color(theme.color1),
        emissiveIntensity: 0.3,
      });
      const mesh = new THREE.Mesh(geom, mat);
      const radius = 8 + Math.random() * 6;
      const speed = 0.3 + Math.random() * 0.5;
      const offset = (i / 8) * Math.PI * 2;
      const yOffset = (Math.random() - 0.5) * 8;
      orbiters.push({ mesh, radius, speed, offset, yOffset });
      scene.add(mesh);
    }

    // Particles
    const particleCount = 200;
    const pGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 80;
    }
    pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const pMat = new THREE.PointsMaterial({
      color: new THREE.Color(theme.particleColor),
      size: 0.15, transparent: true, opacity: 0.6,
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // Ring
    const ringGeo = new THREE.TorusGeometry(12, 0.08, 8, 100);
    const ringMat = new THREE.MeshBasicMaterial({ color: theme.particleColor, transparent: true, opacity: 0.3 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    scene.add(ring);

    // Animation
    let frameId;
    const clock = new THREE.Clock();
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Main object rotation
      mainMesh.rotation.x = t * 0.3;
      mainMesh.rotation.y = t * 0.5;
      mainMesh.scale.setScalar(1 + Math.sin(t * 2) * 0.05);

      // Background gradient animation
      scene.background = c1.clone().lerp(c2, (Math.sin(t * 0.5) + 1) / 2);

      // Orbiters
      orbiters.forEach(o => {
        o.mesh.position.x = Math.cos(t * o.speed + o.offset) * o.radius;
        o.mesh.position.z = Math.sin(t * o.speed + o.offset) * o.radius;
        o.mesh.position.y = o.yOffset + Math.sin(t * o.speed * 2) * 1.5;
        o.mesh.rotation.x = t * o.speed;
        o.mesh.rotation.y = t * o.speed * 0.7;
      });

      // Particles drift
      particles.rotation.y = t * 0.05;
      particles.rotation.x = t * 0.02;

      // Ring pulse
      ring.scale.setScalar(1 + Math.sin(t * 1.5) * 0.1);
      ring.rotation.z = t * 0.1;

      // Camera gentle movement
      camera.position.x = Math.sin(t * 0.3) * 3;
      camera.position.y = Math.cos(t * 0.2) * 2;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const onResize = () => {
      const w2 = window.innerWidth, h2 = window.innerHeight;
      camera.aspect = w2 / h2;
      camera.updateProjectionMatrix();
      renderer.setSize(w2, h2);
    };
    window.addEventListener("resize", onResize);

    // Title animations
    setTimeout(() => setShowTitle(true), 600);
    setTimeout(() => setShowSubtitle(true), 1200);
    setTimeout(() => setShowButton(true), 2000);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", onResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [topicName]);

  const handleStart = () => {
    setFadeOut(true);
    setTimeout(() => onComplete(), 800);
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      zIndex: 10000,
      opacity: fadeOut ? 0 : 1,
      transition: "opacity 0.8s ease",
    }}>
      {/* Three.js Canvas */}
      <div ref={mountRef} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }} />

      {/* Close Button */}
      {onClose && (
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 24,
            right: 24,
            zIndex: 10005,
            padding: "12px 24px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(0,0,0,0.4)",
            color: "#fff",
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
            backdropFilter: "blur(10px)",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={e => {
            e.target.style.background = "rgba(239, 68, 68, 0.2)";
            e.target.style.borderColor = "rgba(239, 68, 68, 0.3)";
          }}
          onMouseLeave={e => {
            e.target.style.background = "rgba(0,0,0,0.4)";
            e.target.style.borderColor = "rgba(255,255,255,0.2)";
          }}
        >
          ✕ Yopish
        </button>
      )}

      {/* Overlay Content */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        pointerEvents: "none",
      }}>
        {/* Chorak Label */}
        {chorakLabel && (
          <div style={{
            position: "absolute", top: 40, left: "50%", transform: "translateX(-50%)",
            fontSize: 14, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase",
            color: "rgba(255,255,255,0.6)", fontFamily: "'Space Grotesk', sans-serif",
            opacity: showTitle ? 1 : 0, transition: "opacity 0.8s ease",
          }}>
            {chorakLabel}
          </div>
        )}

        {/* Topic Name */}
        <h1 style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: "clamp(28px, 5vw, 56px)",
          fontWeight: 800,
          color: "#fff",
          textAlign: "center",
          textShadow: "0 4px 30px rgba(0,0,0,0.4)",
          maxWidth: "80%",
          lineHeight: 1.2,
          marginBottom: 16,
          opacity: showTitle ? 1 : 0,
          transform: showTitle ? "translateY(0)" : "translateY(30px)",
          transition: "all 1s cubic-bezier(0.16, 1, 0.3, 1)",
        }}>
          {topicName}
        </h1>

        {/* Subtitle */}
        <p style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: "clamp(14px, 2vw, 20px)",
          color: "rgba(255,255,255,0.8)",
          textAlign: "center",
          maxWidth: 500,
          lineHeight: 1.6,
          marginBottom: 40,
          opacity: showSubtitle ? 1 : 0,
          transform: showSubtitle ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
        }}>
          ⚛️ EduAI Platform — Interaktiv dars boshlanmoqda...
        </p>

        {/* Start Button */}
        <button
          onClick={handleStart}
          style={{
            pointerEvents: "auto",
            padding: "16px 48px",
            borderRadius: 16,
            border: "2px solid rgba(255,255,255,0.3)",
            background: "rgba(255,255,255,0.15)",
            backdropFilter: "blur(20px)",
            color: "#fff",
            fontSize: 18,
            fontWeight: 700,
            fontFamily: "'Space Grotesk', sans-serif",
            cursor: "pointer",
            letterSpacing: 1,
            opacity: showButton ? 1 : 0,
            transform: showButton ? "translateY(0) scale(1)" : "translateY(20px) scale(0.9)",
            transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          }}
          onMouseEnter={e => {
            e.target.style.background = "rgba(255,255,255,0.25)";
            e.target.style.transform = "translateY(-2px) scale(1.05)";
            e.target.style.boxShadow = "0 12px 40px rgba(0,0,0,0.4)";
          }}
          onMouseLeave={e => {
            e.target.style.background = "rgba(255,255,255,0.15)";
            e.target.style.transform = "translateY(0) scale(1)";
            e.target.style.boxShadow = "0 8px 32px rgba(0,0,0,0.3)";
          }}
        >
          ▶ Darsni boshlash
        </button>
      </div>

      {/* Bottom branding */}
      <div style={{
        position: "absolute", bottom: 30, left: "50%", transform: "translateX(-50%)",
        display: "flex", alignItems: "center", gap: 10,
        opacity: showButton ? 0.5 : 0, transition: "opacity 1s ease",
      }}>
        <span style={{ fontSize: 20 }}>🎓</span>
        <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, fontFamily: "'Outfit'", letterSpacing: 2 }}>
          EDUAI PLATFORM
        </span>
      </div>
    </div>
  );
}
