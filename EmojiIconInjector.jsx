// ============================================================
// EmojiIconInjector — butun ilova bo'ylab render bo'lgan DOM ichidagi
// emoji belgilarni FontAwesome SVG ikonkalariga avtomatik almashtiradi.
// MutationObserver orqali ishlaydi, shuning uchun statik JSX matnidagi
// ham, dinamik (chat, statistikalar) matndagi emojilar ham qamrab olinadi.
// ============================================================
import { useEffect } from "react";
import { icon as faIcon } from "@fortawesome/fontawesome-svg-core";
import { faPython } from "@fortawesome/free-brands-svg-icons";
import {
  faCheckCircle, faHourglassHalf, faTriangleExclamation, faChartBar, faBook,
  faXmark, faLock, faTrash, faPlus, faCircleXmark, faRobot, faWandMagicSparkles,
  faPlay, faArrowRight, faSchool, faClipboardList, faUser, faEyeSlash,
  faPenToSquare, faLightbulb, faEye, faFloppyDisk, faShieldHalved, faBullseye,
  faPencil, faKey, faVolumeHigh, faFile, faGraduationCap, faMagnifyingGlass,
  faUsers, faMicrophone, faCloud, faStop, faFlask, faRocket, faFire, faFont,
  faArrowsRotate, faTrophy, faClapperboard, faPenNib, faAtom, faArrowLeft,
  faCalculator, faCircleExclamation, faRulerCombined, faLandmark, faGear,
  faDna, faDoorOpen, faMicroscope, faUpload, faChartLine, faLaptop,
  faDumbbell, faGamepad, faStar, faCircleQuestion, faCheck, faExpand, faBolt,
  faClock, faHandshake, faMobileScreenButton, faBookOpen, faCalendarDays,
  faMedal, faMicrophoneLines, faCircle, faBinoculars, faLink, faTv,
  faThumbtack, faFolderOpen, faThumbsUp, faPalette, faAward, faCakeCandles,
  faGlobe, faFutbol, faCaretDown, faCaretUp, faRotateLeft,
  faUpRightFromSquare, faBrain, faScrewdriverWrench, faBan, faFaceFrown,
  faImage, faDesktop, faGem, faHashtag, faBell, faVolumeXmark, faVideo,
  faCamera, faDownload, faDroplet, faHandPaper, faMusic, faLeaf, faSeedling,
  faTemperatureHalf, faMoon, faArrowDown, faArrowUp, faFlaskVial, faBars,
  faSun, faPause, faStopwatch, faFlag,
} from "@fortawesome/free-solid-svg-icons";

const EMOJI_ICON_MAP = {
  "✅": faCheckCircle, "⏳": faHourglassHalf, "⚠": faTriangleExclamation,
  "📊": faChartBar, "📚": faBook, "✕": faXmark, "🔒": faLock, "🗑": faTrash,
  "➕": faPlus, "❌": faCircleXmark, "🤖": faRobot, "✨": faWandMagicSparkles,
  "▶": faPlay, "→": faArrowRight, "🏫": faSchool, "📋": faClipboardList,
  "👤": faUser, "🙈": faEyeSlash, "📝": faPenToSquare, "💡": faLightbulb,
  "👁": faEye, "💾": faFloppyDisk, "🛡": faShieldHalved, "🎯": faBullseye,
  "✏": faPencil, "🔑": faKey, "🔊": faVolumeHigh, "📄": faFile,
  "🎓": faGraduationCap, "🔍": faMagnifyingGlass, "👨": faUser, "👥": faUsers,
  "🎤": faMicrophone, "☁": faCloud, "⏹": faStop, "🧪": faFlask,
  "🚀": faRocket, "🔥": faFire, "🔤": faFont, "🔄": faArrowsRotate,
  "🏆": faTrophy, "🎬": faClapperboard, "✍": faPenNib, "⚛": faAtom,
  "←": faArrowLeft, "🧮": faCalculator, "🚨": faCircleExclamation,
  "📐": faRulerCombined, "🏛": faLandmark, "⚙": faGear, "🧬": faDna,
  "🚪": faDoorOpen, "🔬": faMicroscope, "📤": faUpload, "📈": faChartLine,
  "💻": faLaptop, "💪": faDumbbell, "🎮": faGamepad, "🌟": faStar,
  "⭐": faStar, "❓": faCircleQuestion, "✓": faCheck, "⛶": faExpand,
  "⚡": faBolt, "⏰": faClock, "🤝": faHandshake, "📱": faMobileScreenButton,
  "📖": faBookOpen, "📅": faCalendarDays, "🏅": faMedal,
  "🎙": faMicrophoneLines, "🟡": faCircle, "🔭": faBinoculars, "🔗": faLink,
  "🔐": faLock, "📺": faTv, "📌": faThumbtack, "📂": faFolderOpen,
  "👍": faThumbsUp, "🎨": faPalette, "🎉": faAward, "🎂": faCakeCandles,
  "🌐": faGlobe, "🌍": faGlobe, "🇬🇧": faFlag, "🇷🇺": faFlag,
  "⚽": faFutbol, "▼": faCaretDown, "▲": faCaretUp, "▾": faCaretDown,
  "↺": faRotateLeft, "↗": faUpRightFromSquare, "🪖": faShieldHalved,
  "🧫": faFlask, "🧠": faBrain, "🧑": faUser, "🥇": faMedal, "🥈": faMedal,
  "🥉": faMedal, "🛠": faScrewdriverWrench, "🚫": faBan, "😓": faFaceFrown,
  "🖼": faImage, "🖥": faDesktop, "🔷": faGem, "🔵": faCircle,
  "🔴": faCircle, "🔢": faHashtag, "🔔": faBell, "🔇": faVolumeXmark,
  "📹": faVideo, "📷": faCamera, "📥": faDownload, "💧": faDroplet,
  "💎": faGem, "👋": faHandPaper, "🐍": faPython, "🎵": faMusic,
  "🌿": faLeaf, "🌱": faSeedling, "🌡": faTemperatureHalf, "🌙": faMoon,
  "⬇": faArrowDown, "⬆": faArrowUp, "➤": faArrowRight, "➡": faArrowRight,
  "⚗": faFlaskVial, "☰": faBars, "☀": faSun, "⏸": faPause,
  "⏱": faStopwatch, "↑": faArrowUp,
};

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const EMOJI_KEYS = Object.keys(EMOJI_ICON_MAP).sort((a, b) => b.length - a.length);
const EMOJI_PATTERN = new RegExp(`(${EMOJI_KEYS.map(escapeRegExp).join("|")})`, "gu");
const SKIP_PARENT_TAGS = new Set(["SCRIPT", "STYLE", "TEXTAREA", "TITLE", "IFRAME"]);

const svgCache = {};
function getIconSvg(def) {
  if (!svgCache[def.iconName]) {
    svgCache[def.iconName] = faIcon(def, {
      styles: { "vertical-align": "-0.125em", margin: "0 2px", height: "1em" },
    }).html[0];
  }
  return svgCache[def.iconName];
}

function replaceEmojisInNode(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      if (SKIP_PARENT_TAGS.has(parent.tagName)) return NodeFilter.FILTER_REJECT;
      if (parent.closest("svg, [data-emoji-icon]")) return NodeFilter.FILTER_REJECT;
      EMOJI_PATTERN.lastIndex = 0;
      return EMOJI_PATTERN.test(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    },
  });

  const targets = [];
  let n;
  while ((n = walker.nextNode())) targets.push(n);

  targets.forEach((textNode) => {
    const text = textNode.nodeValue;
    const frag = document.createDocumentFragment();
    let lastIndex = 0;
    let m;
    EMOJI_PATTERN.lastIndex = 0;
    while ((m = EMOJI_PATTERN.exec(text))) {
      if (m.index > lastIndex) frag.appendChild(document.createTextNode(text.slice(lastIndex, m.index)));
      const def = EMOJI_ICON_MAP[m[0]];
      const span = document.createElement("span");
      span.setAttribute("data-emoji-icon", "1");
      span.innerHTML = getIconSvg(def);
      frag.appendChild(span);
      lastIndex = m.index + m[0].length;
    }
    if (lastIndex < text.length) frag.appendChild(document.createTextNode(text.slice(lastIndex)));
    textNode.parentNode.replaceChild(frag, textNode);
  });
}

export function useEmojiIcons() {
  useEffect(() => {
    replaceEmojisInNode(document.body);

    let scheduled = false;
    const observer = new MutationObserver(() => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        replaceEmojisInNode(document.body);
      });
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });

    return () => observer.disconnect();
  }, []);
}
