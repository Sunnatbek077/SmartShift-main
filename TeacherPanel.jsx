// ============================================================
// EduAI Platform — O'qituvchi boshqaruv paneli
// Talabalar qo'shish, natijalarni ko'rish, parol berish
// ============================================================
import { useState, useEffect } from "react";
import { getStudents, addStudent, toggleStudentActive, deleteStudent, changeStudentPassword, getAllStudentResults, getStudentsBiometrics, resetStudentBiometrics } from "./auth";
import { FANS, FANS_7, FANS_1KURS, TOPICS_MAP, TOPICS_MAP_7, TOPICS_MAP_1KURS } from "./index";
import { storage } from "./supabase";
import ThemeToggle from "./ThemeToggle";
import * as XLSX from "xlsx";
import mammoth from "mammoth";
const COLORS_MAP = {
  A: "#059669", B: "#2563EB", C: "#D97706", D: "#DC2626", F: "#64748B"
};

const getGradeKey = (className) => {
  const match = String(className || "").match(/^\d+/);
  return match ? match[0] : String(className || "").toLowerCase().trim();
};


function getGrade(score) {
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  if (score >= 45) return "D";
  return "F";
}

export default function TeacherPanel({ teacher, onLogout }) {
  const [tab, setTab] = useState("students");
  const [students, setStudents] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQ, setSearchQ] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [showProfile, setShowProfile] = useState(false); // Profil modal
  const [studentsBiometrics, setStudentsBiometrics] = useState([]);

  // Statistika bo'limi statelari
  const [statsFilterClass, setStatsFilterClass] = useState("");
  const [statsFilterCategory, setStatsFilterCategory] = useState("all");
  const [statsSearchQ, setStatsSearchQ] = useState("");
  const [statsSelectedStudent, setStatsSelectedStudent] = useState(null);
  const [statsExpandedResult, setStatsExpandedResult] = useState(null); // Collapsible result details in modal

  // Guruhlar bo'limi statelari
  const [classTabSelectedClass, setClassTabSelectedClass] = useState("");

  // Talaba batafsil modalida fanlar statelari
  const [statsSelectedStudentSubjects, setStatsSelectedStudentSubjects] = useState([]);
  const [statsSelectedSubjectId, setStatsSelectedSubjectId] = useState(null); // Accordion or collapsed subject details




  // Dars rejasi statelari
  const [selectedClass, setSelectedClass] = useState("");
  const [customSubjects, setCustomSubjects] = useState([]);
  const [subjectsList, setSubjectsList] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [customTopics, setCustomTopics] = useState([]);

  // Fan qo'shish formalari statelari
  const [newSubName, setNewSubName] = useState("");
  const [newSubIcon, setNewSubIcon] = useState("📚");
  const [newSubDesc, setNewSubDesc] = useState("");
  const [newSubColor, setNewSubColor] = useState("#2563EB");

  // Mavzu qo'shish formalari statelari
  const [newTopName, setNewTopName] = useState("");
  const [newTopChorak, setNewTopChorak] = useState(1);
  const [newTopLecture, setNewTopLecture] = useState("");
  const [newTopVideoQuery, setNewTopVideoQuery] = useState("");
  const [newTopLabType, setNewTopLabType] = useState("none");
  const [newTopPracticeHtml, setNewTopPracticeHtml] = useState("");
  const [newTopHomework, setNewTopHomework] = useState("");
  const [importStatus, setImportStatus] = useState("");
  
  const [quizQuestions, setQuizQuestions] = useState([
    { q: "1-savol?", a: "To'g'ri javob", b: "Noto'g'ri javob 1", c: "Noto'g'ri javob 2", d: "Noto'g'ri javob 3", ok: "a" }
  ]);

  // Topic tahrirlash modal statelari
  const [editingTopic, setEditingTopic] = useState(null);
  const [editTopName, setEditTopName] = useState("");
  const [editTopLecture, setEditTopLecture] = useState("");
  const [editTopVideoQuery, setEditTopVideoQuery] = useState("");
  const [editTopLabType, setEditTopLabType] = useState("none");
  const [editTopLabHtml, setEditTopLabHtml] = useState("");
  const [editTopPracticeHtml, setEditTopPracticeHtml] = useState("");
  const [editTopHomework, setEditTopHomework] = useState("");
  const [editTopQuiz, setEditTopQuiz] = useState([]);
  const [activeEditTab, setActiveEditTab] = useState("kirish");
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [apiLoading, setApiLoading] = useState(false);

  // Guruh o'zgarganda fanlarni yuklash
  useEffect(() => {
    if (selectedClass) {
      loadAllSubjects();
    } else {
      setSubjectsList([]);
    }
  }, [selectedClass]);

  // Fan o'zgarganda custom mavzularni yuklash
  useEffect(() => {
    if (selectedClass && selectedSubject) {
      loadCustomTopics();
    }
  }, [selectedClass, selectedSubject]);

  const loadCustomSubjects = async () => {
    try {
      const saved = await storage.get(`custom_subjects_${getGradeKey(selectedClass)}`);
      if (saved) {
        setCustomSubjects(JSON.parse(saved));
      } else {
        setCustomSubjects([]);
      }
    } catch (e) {
      setCustomSubjects([]);
    }
  };

  const loadAllSubjects = async () => {
    if (!selectedClass) return;
    try {
      const is7Guruh = selectedClass.toString().trim().startsWith("7");
      const is1Kurs = selectedClass.toString().trim().startsWith("1");
      const defaultFans = is1Kurs ? FANS_1KURS : (is7Guruh ? FANS_7 : FANS);
      
      let customSubs = [];
      const saved = await storage.get(`custom_subjects_${getGradeKey(selectedClass)}`);
      if (saved) {
        customSubs = JSON.parse(saved);
        setCustomSubjects(customSubs);
      } else {
        setCustomSubjects([]);
      }
      
      const allSubs = [...defaultFans, ...customSubs];
      
      // Load topics counts from storage
      const allTopics = { ...TOPICS_MAP, ...TOPICS_MAP_7, ...TOPICS_MAP_1KURS };
      const subsWithCounts = await Promise.all(
        allSubs.map(async (sub) => {
          const savedTopics = await storage.get(`custom_topics_${getGradeKey(selectedClass)}_${sub.id}`);
          let count = 0;
          if (savedTopics) {
            try {
              count = JSON.parse(savedTopics).length;
            } catch (e) {}
          } else {
            count = (allTopics[sub.id] || []).length;
          }
          return { ...sub, topics: count };
        })
      );
      
      setSubjectsList(subsWithCounts);
    } catch (e) {
      console.error("loadAllSubjects error:", e);
    }
  };

  const loadCustomTopics = async () => {
    if (!selectedSubject) return;
    try {
      const saved = await storage.get(`custom_topics_${getGradeKey(selectedClass)}_${selectedSubject.id}`);
      if (saved) {
        setCustomTopics(JSON.parse(saved));
      } else {
        const allTopics = { ...TOPICS_MAP, ...TOPICS_MAP_7 };
        const defaultTopics = allTopics[selectedSubject.id] || [];
        setCustomTopics(defaultTopics);
      }
    } catch (e) {
      setCustomTopics([]);
    }
  };

  const handleAddSubject = async (e) => {
    e.preventDefault();
    if (!newSubName.trim() || !selectedClass) return;

    const newSub = {
      id: `custom_${Date.now()}`,
      name: newSubName.trim(),
      icon: newSubIcon.trim() || "📚",
      description: newSubDesc.trim(),
      color: newSubColor,
      progress: 0,
      topics: 0
    };

    const saved = await storage.get(`custom_subjects_${getGradeKey(selectedClass)}`);
    let currentCustom = [];
    if (saved) {
      currentCustom = JSON.parse(saved);
    }
    const updated = [...currentCustom, newSub];
    setCustomSubjects(updated);
    await storage.set(`custom_subjects_${getGradeKey(selectedClass)}`, JSON.stringify(updated));
    setNewSubName("");
    setNewSubDesc("");
    setNewSubIcon("📚");
    
    await loadAllSubjects();
  };

  const handleDeleteSubject = async (subId) => {
    if (!confirm("Ushbu fanni va uning barcha mavzularini o'chirishni tasdiqlaysizmi?")) return;
    const saved = await storage.get(`custom_subjects_${getGradeKey(selectedClass)}`);
    let currentCustom = [];
    if (saved) {
      currentCustom = JSON.parse(saved);
    }
    const updated = currentCustom.filter(s => s.id !== subId);
    setCustomSubjects(updated);
    await storage.set(`custom_subjects_${getGradeKey(selectedClass)}`, JSON.stringify(updated));
    
    // Mavzularni ham o'chiramiz
    await storage.remove(`custom_topics_${getGradeKey(selectedClass)}_${subId}`);
    if (selectedSubject?.id === subId) {
      setSelectedSubject(null);
      setCustomTopics([]);
    }
    
    await loadAllSubjects();
  };

  const defaultTopicsLength = () => {
    if (!selectedSubject) return 0;
    const allTopics = { ...TOPICS_MAP, ...TOPICS_MAP_7 };
    return (allTopics[selectedSubject.id] || []).length;
  };

  const handleAddTopic = async (e) => {
    e.preventDefault();
    if (!newTopName.trim() || !selectedClass || !selectedSubject) return;

    const newTopic = {
      id: defaultTopicsLength() + customTopics.length + 1,
      name: newTopName.trim(),
      chorak: 1,
      lectureText: "Ushbu mavzu uchun ma'ruza yozilmagan.",
      videoQuery: `${newTopName.trim()} dars o'zbek tilida`,
      labType: "none",
      labHtml: "",
      practiceHtml: "<h3>Mavzuga doir amaliy topshiriq</h3>",
      homeworkText: "Ushbu mavzuga tegishli uy vazifasi.",
      quizQuestions: []
    };

    const updated = [...customTopics, newTopic];
    setCustomTopics(updated);
    await storage.set(`custom_topics_${getGradeKey(selectedClass)}_${selectedSubject.id}`, JSON.stringify(updated));
    
    // Fanning umumiy mavzular sonini yangilash
    if (selectedSubject.id.startsWith("custom_")) {
      const updatedSubs = customSubjects.map(s => {
        if (s.id === selectedSubject.id) {
          return { ...s, topics: updated.length };
        }
        return s;
      });
      setCustomSubjects(updatedSubs);
      await storage.set(`custom_subjects_${getGradeKey(selectedClass)}`, JSON.stringify(updatedSubs));
    }

    setNewTopName("");
    await loadAllSubjects();
  };

  // ============ NAMUNA HUJJAT YUKLAB OLISH ============
  const downloadWordTemplate = () => {
    const fanName = selectedSubject?.name || "Fan";
    const guruhName = selectedClass || "Guruh";
    const lines = [
      `${fanName} — Mavzular ro'yxati (${guruhName} guruh)`,
      "",
      "Quyidagi ro'yxatga mavzu nomlarini ketma-ket yozing.",
      "Har bir satrga bitta mavzu nomi yozing.",
      "Tartib raqam yozish shart emas.",
      "",
      "--- MAVZULAR ---",
      "1. Nyuton qonunlari",
      "2. Erkin tushish",
      "3. Jism og'irligi va massasi",
      "4. Ishqalanish kuchi",
      "5. Elastiklik kuchi",
      "",
      "(Yuqoridagi namuna mavzularni o'chirib, o'z mavzularingizni yozing)"
    ];
    const content = lines.join("\r\n");
    const blob = new Blob(["\uFEFF" + content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fanName}_mavzular_namuna.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadExcelTemplate = () => {
    const fanName = selectedSubject?.name || "Fan";
    const guruhName = selectedClass || "Guruh";
    const wsData = [
      ["№", "Mavzu nomi"],
      [1, "Nyuton qonunlari"],
      [2, "Erkin tushish"],
      [3, "Jism og'irligi va massasi"],
      [4, "Ishqalanish kuchi"],
      [5, "Elastiklik kuchi"],
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws["!cols"] = [{ wch: 5 }, { wch: 40 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Mavzular");
    XLSX.writeFile(wb, `${fanName}_mavzular_namuna.xlsx`);
  };

  // ============ FAYLDAN MAVZULARNI IMPORT QILISH ============
  const saveImportedTopics = async (topicNames) => {
    if (!topicNames.length || !selectedClass || !selectedSubject) return;
    
    const baseId = defaultTopicsLength() + customTopics.length;
    const newTopics = topicNames.map((name, idx) => ({
      id: baseId + idx + 1,
      name: name,
      chorak: 1,
      lectureText: "Ushbu mavzu uchun ma'ruza yozilmagan.",
      videoQuery: `${name} dars o'zbek tilida`,
      labType: "none",
      labHtml: "",
      practiceHtml: "<h3>Mavzuga doir amaliy topshiriq</h3>",
      homeworkText: "Ushbu mavzuga tegishli uy vazifasi.",
      quizQuestions: []
    }));

    const updated = [...customTopics, ...newTopics];
    setCustomTopics(updated);
    await storage.set(`custom_topics_${getGradeKey(selectedClass)}_${selectedSubject.id}`, JSON.stringify(updated));
    
    if (selectedSubject.id.startsWith("custom_")) {
      const updatedSubs = customSubjects.map(s => {
        if (s.id === selectedSubject.id) return { ...s, topics: updated.length };
        return s;
      });
      setCustomSubjects(updatedSubs);
      await storage.set(`custom_subjects_${getGradeKey(selectedClass)}`, JSON.stringify(updatedSubs));
    }

    setImportStatus(`✅ ${newTopics.length} ta mavzu muvaffaqiyatli import qilindi!`);
    await loadAllSubjects();
    setTimeout(() => setImportStatus(""), 4000);
  };

  const parseTopicLines = (text) => {
    return text
      .split("\n")
      .map(line => line.replace(/^\s*\d+[\.\)\-\s]+/, "").trim())
      .filter(line => line.length > 1 && !line.startsWith("---") && !line.startsWith("(") && !line.toLowerCase().includes("mavzu nomi") && !line.toLowerCase().includes("ro'yxat") && !line.toLowerCase().includes("quyidagi") && !line.toLowerCase().includes("namuna") && !line.toLowerCase().includes("har bir") && !line.toLowerCase().includes("tartib"));
  };

  const importFromWord = async (file) => {
    try {
      setImportStatus("⏳ Word fayldan o'qilmoqda...");
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      const text = result.value.trim();
      if (!text) {
        setImportStatus("❌ Word faylda matn topilmadi!");
        setTimeout(() => setImportStatus(""), 3000);
        return;
      }
      const topicNames = parseTopicLines(text);
      if (!topicNames.length) {
        setImportStatus("❌ Mavzu nomlari topilmadi!");
        setTimeout(() => setImportStatus(""), 3000);
        return;
      }
      await saveImportedTopics(topicNames);
    } catch (err) {
      console.error("Word import xatosi:", err);
      setImportStatus("❌ Word faylni o'qishda xatolik: " + err.message);
      setTimeout(() => setImportStatus(""), 4000);
    }
  };

  const importFromExcel = async (file) => {
    try {
      setImportStatus("⏳ Excel fayldan o'qilmoqda...");
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
      
      const topicNames = [];
      jsonData.forEach((row, rowIdx) => {
        // Header qatorni o'tkazib yuborish
        if (rowIdx === 0) {
          const firstCell = String(row[0] || "").toLowerCase().trim();
          const secondCell = String(row[1] || "").toLowerCase().trim();
          if (firstCell === "№" || firstCell === "#" || secondCell.includes("mavzu")) return;
        }
        // Ikkinchi ustun (Mavzu nomi) bo'lsa ishlatish, bo'lmasa birinchi ustunni
        let name = "";
        if (row.length >= 2 && row[1]) {
          name = String(row[1]).trim();
        } else if (row[0]) {
          name = String(row[0]).replace(/^\s*\d+[\.\)\-\s]+/, "").trim();
        }
        if (name.length > 1 && !name.toLowerCase().includes("mavzu nomi")) {
          topicNames.push(name);
        }
      });

      if (!topicNames.length) {
        setImportStatus("❌ Excel faylda mavzu nomlari topilmadi!");
        setTimeout(() => setImportStatus(""), 3000);
        return;
      }
      await saveImportedTopics(topicNames);
    } catch (err) {
      console.error("Excel import xatosi:", err);
      setImportStatus("❌ Excel faylni o'qishda xatolik: " + err.message);
      setTimeout(() => setImportStatus(""), 4000);
    }
  };

  const handleDeleteTopic = async (topicId) => {
    if (!confirm("Ushbu mavzuni o'chirishni tasdiqlaysizmi?")) return;
    const updated = customTopics.filter(t => t.id !== topicId);
    
    // Mavzu ID larini qayta tartiblash
    const reindexed = updated.map((t, idx) => ({ ...t, id: defaultTopicsLength() + idx + 1 }));
    setCustomTopics(reindexed);
    await storage.set(`custom_topics_${getGradeKey(selectedClass)}_${selectedSubject.id}`, JSON.stringify(reindexed));

    if (selectedSubject.id.startsWith("custom_")) {
      const updatedSubs = customSubjects.map(s => {
        if (s.id === selectedSubject.id) {
          return { ...s, topics: reindexed.length };
        }
        return s;
      });
      setCustomSubjects(updatedSubs);
      await storage.set(`custom_subjects_${getGradeKey(selectedClass)}`, JSON.stringify(updatedSubs));
    }
    await loadAllSubjects();
  };

  const handleStartEditTopic = (topic) => {
    setEditingTopic(topic);
    setEditTopName(topic.name || "");
    setEditTopLecture(topic.lectureText || "");
    setEditTopVideoQuery(topic.videoQuery || "");
    setEditTopLabType(topic.labType || "none");
    setEditTopLabHtml(topic.labHtml || "");
    setEditTopPracticeHtml(topic.practiceHtml || "");
    setEditTopHomework(topic.homeworkText || "");
    setEditTopQuiz(topic.quizQuestions || []);
    setActiveEditTab("kirish");
    setIsAdminUnlocked(false);
    setAdminPasswordInput("");
    setPasswordError("");
  };

  const handleSaveEditedTopic = async () => {
    if (!editingTopic || !selectedClass || !selectedSubject) return;

    const updatedTopic = {
      ...editingTopic,
      name: editTopName.trim(),
      lectureText: editTopLecture,
      videoQuery: editTopVideoQuery.trim(),
      labType: editTopLabType,
      labHtml: editTopLabHtml,
      practiceHtml: editTopPracticeHtml,
      homeworkText: editTopHomework,
      quizQuestions: editTopQuiz
    };

    const updated = customTopics.map(t => t.id === editingTopic.id ? updatedTopic : t);
    setCustomTopics(updated);
    await storage.set(`custom_topics_${getGradeKey(selectedClass)}_${selectedSubject.id}`, JSON.stringify(updated));

    setEditingTopic(null); // Modalni yopish
    await loadAllSubjects(); // Mavzular sonini qayta hisoblash
  };

  const handleUnlockAdmin = () => {
    if (adminPasswordInput === "Mr/*-+456852") {
      setIsAdminUnlocked(true);
      setPasswordError("");
    } else {
      setPasswordError("❌ Parol noto'g'ri! Qayta urinib ko'ring.");
    }
  };

  const handlePasswordKeyDown = (e) => {
    if (e.key === "Enter") {
      handleUnlockAdmin();
    }
  };

  const handleUploadWordToLecture = async (file) => {
    try {
      setApiLoading(true);
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      const text = result.value.trim();
      if (text) {
        setEditTopLecture(text);
        alert("Word hujjati muvaffaqiyatli yuklandi!");
      } else {
        alert("Fayl bo'sh yoki o'qib bo'lmadi.");
      }
    } catch (e) {
      alert("Word faylni o'qishda xato: " + e.message);
    } finally {
      setApiLoading(false);
    }
  };

  const handleGenerateLectureAI = async () => {
    const key = await storage.get("gemini_api_key");
    if (!key) {
      alert("AI xizmatidan foydalanish uchun brauzerda (sozlamalarda) API kalit saqlangan bo'lishi kerak. Iltimos talaba panelidagi AI Sozlamalaridan kalit kiriting.");
      return;
    }
    
    setApiLoading(true);
    try {
      const model = (await storage.get("gemini_model")) || "gemini-1.5-flash-latest";
      const isGroq = key.trim().startsWith("gsk_");
      const isOpenRouter = key.trim().startsWith("sk-or-");
      
      const prompt = `Siz tajribali o'qituvchisiz. "${editTopName}" mavzusi bo'yicha batafsil, tushunarli va qiziqarli dars ma'ruzasi matnini yozib bering. Matn o'zbek tilida, kamida 600 ta so'zdan iborat bo'lsin. Mavzudagi asosiy qoidalar va formulalarni alohida ko'rsating.`;
      
      let lectureResult = "";
      if (isGroq || isOpenRouter) {
        const endpoint = isGroq ? "https://api.groq.com/openai/v1/chat/completions" : "https://openrouter.ai/api/v1/chat/completions";
        const resp = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${key.trim()}`,
          },
          body: JSON.stringify({
            model: model,
            messages: [{ role: "user", content: prompt }],
          }),
        });
        const data = await resp.json();
        lectureResult = data.choices[0].message.content;
      } else {
        // Gemini API
        const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key.trim()}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        });
        const data = await resp.json();
        lectureResult = data.candidates[0].content.parts[0].text;
      }
      
      if (lectureResult) {
        setEditTopLecture(lectureResult);
      }
    } catch (e) {
      console.error(e);
      alert("AI orqali matn yaratishda xatolik yuz berdi: " + e.message);
    } finally {
      setApiLoading(false);
    }
  };

  const handleAddQuestionToEdit = () => {
    setEditTopQuiz([
      ...editTopQuiz,
      { q: "Yangi savol?", a: "To'g'ri javob", b: "Noto'g'ri javob 1", c: "Noto'g'ri javob 2", d: "Noto'g'ri javob 3", ok: "a" }
    ]);
  };

  const handleUpdateQuestionInEdit = (index, field, value) => {
    const updated = editTopQuiz.map((q, idx) => idx === index ? { ...q, [field]: value } : q);
    setEditTopQuiz(updated);
  };

  const handleDeleteQuestionInEdit = (index) => {
    const updated = editTopQuiz.filter((_, idx) => idx !== index);
    setEditTopQuiz(updated);
  };


  // Profil tahrirlash
  const [editName, setEditName] = useState(teacher.full_name || "");
  const [editPhone, setEditPhone] = useState(teacher.phone || "");
  const [editSchool, setEditSchool] = useState(teacher.school || "");
  const [editSubject, setEditSubject] = useState(teacher.subject || "");
  const [editExp, setEditExp] = useState(teacher.experience || "");
  const [editAbout, setEditAbout] = useState(teacher.about || "");
  const [editPass, setEditPass] = useState("");
  const [editPass2, setEditPass2] = useState("");
  const [showEditPass, setShowEditPass] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Yangi talaba qo'shish
  const [newName, setNewName] = useState("");
  const [newUser, setNewUser] = useState("");
  const [newPass, setNewPass] = useState("");
  const [newClass, setNewClass] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [addMsg, setAddMsg] = useState(null);

  // Parol o'zgartirish
  const [changingPassFor, setChangingPassFor] = useState(null);
  const [newPassVal, setNewPassVal] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (statsSelectedStudent) {
      loadStudentClassSubjects();
    } else {
      setStatsSelectedStudentSubjects([]);
      setStatsSelectedSubjectId(null);
    }
  }, [statsSelectedStudent]);

  const loadStudentClassSubjects = async () => {
    if (!statsSelectedStudent?.class_name) return;
    try {
      const saved = await storage.get(`custom_subjects_${getGradeKey(statsSelectedStudent.class_name)}`);
      if (saved) {
        setStatsSelectedStudentSubjects(JSON.parse(saved));
      } else {
        setStatsSelectedStudentSubjects([]);
      }
    } catch (e) {
      setStatsSelectedStudentSubjects([]);
    }
  };


  const loadData = async () => {
    setLoading(true);
    const [s, r] = await Promise.all([
      getStudents(teacher.id),
      getAllStudentResults(teacher.id),
    ]);
    
    // Fetch biometric profiles status in parallel
    const studentIds = s.map(student => student.id);
    let bioStatus = [];
    if (studentIds.length > 0) {
      try {
        bioStatus = await getStudentsBiometrics(studentIds);
      } catch (e) {}
    }
    
    setStudents(s);
    setResults(r);
    setStudentsBiometrics(bioStatus);
    setLoading(false);
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!newName || !newUser || !newPass || !newClass) {
      setAddMsg({ type: "error", text: "Barcha maydonlarni to'ldiring" });
      return;
    }
    setAddLoading(true);
    const result = await addStudent({
      fullName: newName, username: newUser,
      password: newPass, className: newClass,
      teacherId: teacher.id,
    });
    setAddLoading(false);
    if (result.success) {
      setAddMsg({ type: "success", text: `✅ ${newName} muvaffaqiyatli qo'shildi!` });
      setNewName(""); setNewUser(""); setNewPass(""); setNewClass("");
      loadData();
    } else {
      setAddMsg({ type: "error", text: result.error });
    }
  };

  const handleToggle = async (student) => {
    await toggleStudentActive(student.id, !student.is_active);
    loadData();
  };

  const handleDelete = async (student) => {
    if (!confirm(`${student.full_name} ni o'chirishni tasdiqlaysizmi?`)) return;
    await deleteStudent(student.id);
    loadData();
  };

  const handleChangePass = async (studentId) => {
    if (!newPassVal.trim()) return;
    await changeStudentPassword(studentId, newPassVal);
    setChangingPassFor(null);
    setNewPassVal("");
    alert("Parol o'zgartirildi!");
  };

  const handleResetBiometrics = async (studentId) => {
    if (window.confirm("Haqiqatan ham ushbu talabaning biometrik ma'lumotlarini (Face ID va Ovoz) o'chirib yubormoqchimisiz?")) {
      const ok = await resetStudentBiometrics(studentId);
      if (ok) {
        // Skip flagini ham o'chiramiz — talaba qayta ro'yxatdan o'tishi kerak
        localStorage.removeItem(`biometric_skipped_${studentId}`);
        alert("Biometrik ma'lumotlar o'chirildi!");
        loadData();
      } else {
        alert("Xatolik yuz berdi");
      }
    }
  };

  // O'qituvchi profilini saqlash
  const saveProfile = async () => {
    if (editPass && editPass !== editPass2) {
      setProfileMsg({ type: "error", text: "Parollar mos kelmaydi" });
      return;
    }
    setProfileLoading(true);
    try {
      const SB_URL = "https://hmdyvzrjlznqvobbmdbx.supabase.co";
      const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtZHl2enJqbHpucXZvYmJtZGJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwMzk0NTUsImV4cCI6MjA5MzYxNTQ1NX0.E3yendkcCaMEbzlOpu-xNP0IGpsgVmVzzzH06MyM9OQ";

      const updateData = {
        full_name: editName.trim(),
        phone: editPhone.trim(),
        school: editSchool.trim(),
        subject: editSubject.trim(),
        experience: editExp.trim(),
        about: editAbout.trim(),
      };

      // Parol o'zgartirish
      if (editPass.trim()) {
        await changeStudentPassword(teacher.id, editPass.trim());
      }

      const resp = await fetch(`${SB_URL}/rest/v1/users?id=eq.${teacher.id}`, {
        method: "PATCH",
        headers: {
          "apikey": SB_KEY, "Authorization": `Bearer ${SB_KEY}`,
          "Content-Type": "application/json", "Prefer": "return=representation"
        },
        body: JSON.stringify(updateData)
      });

      if (resp.ok) {
        // Sessiyani yangilash
        const session = JSON.parse(localStorage.getItem("eduai_session") || "{}");
        Object.assign(session, updateData);
        localStorage.setItem("eduai_session", JSON.stringify(session));
        setProfileMsg({ type: "success", text: "✅ Profil saqlandi!" });
        setTimeout(() => setProfileMsg(null), 3000);
      } else {
        setProfileMsg({ type: "error", text: "Xato yuz berdi" });
      }
    } catch (e) {
      setProfileMsg({ type: "error", text: e.message });
    }
    setProfileLoading(false);
  };

  // Filtrlash
  const filteredStudents = students.filter(s => {
    const q = searchQ.toLowerCase();
    const matchQ = !q || s.full_name?.toLowerCase().includes(q) || s.username?.toLowerCase().includes(q);
    const matchClass = !filterClass || s.class_name === filterClass;
    return matchQ && matchClass;
  });

  const classes = [...new Set(students.map(s => s.class_name).filter(Boolean))];

  // Talaba uchun o'rtacha ball
  const getStudentAvg = (studentId) => {
    const sr = results.filter(r => r.student_id === studentId);
    if (!sr.length) return null;
    return Math.round(sr.reduce((a, b) => a + b.score, 0) / sr.length);
  };

  // Statistika bo'limi uchun talabalarni batafsil tahlil qilish
  const computedStudents = students.map(student => {
    const studentResults = results.filter(r => r.student_id === student.id);
    const totalSubmissions = studentResults.length;
    const avgScore = totalSubmissions
      ? Math.round(studentResults.reduce((sum, r) => sum + r.score, 0) / totalSubmissions)
      : null;
    const maxScore = totalSubmissions ? Math.max(...studentResults.map(r => r.score)) : null;
    const minScore = totalSubmissions ? Math.min(...studentResults.map(r => r.score)) : null;

    let category = "boshlamagan"; // Hali boshlamagan
    if (totalSubmissions > 0) {
      if (avgScore >= 86) category = "alo";
      else if (avgScore >= 71) category = "yaxshi";
      else if (avgScore >= 55) category = "qoniqarli";
      else category = "past";
    }

    return {
      ...student,
      totalSubmissions,
      avgScore,
      maxScore,
      minScore,
      category,
      results: studentResults
    };
  });

  // Statistika filtrlash (guruh, qidiruv va daraja bo'yicha)
  const filteredStatsStudents = computedStudents.filter(s => {
    const q = statsSearchQ.toLowerCase();
    const matchQ = !q || s.full_name?.toLowerCase().includes(q) || s.username?.toLowerCase().includes(q);
    const matchClass = !statsFilterClass || s.class_name === statsFilterClass;
    const matchCategory = statsFilterCategory === "all" || s.category === statsFilterCategory;
    return matchQ && matchClass && matchCategory;
  });

  // Statistika hisob-kitoblari (tanlangan guruh bo'yicha)
  const statsClassFilteredStudents = computedStudents.filter(s => {
    return !statsFilterClass || s.class_name === statsFilterClass;
  });

  const statsCounts = {
    all: statsClassFilteredStudents.length,
    alo: statsClassFilteredStudents.filter(s => s.category === "alo").length,
    yaxshi: statsClassFilteredStudents.filter(s => s.category === "yaxshi").length,
    qoniqarli: statsClassFilteredStudents.filter(s => s.category === "qoniqarli").length,
    past: statsClassFilteredStudents.filter(s => s.category === "past").length,
    boshlamagan: statsClassFilteredStudents.filter(s => s.category === "boshlamagan").length,
  };

  // Guruhlar bo'yicha o'rtacha ball (Chart uchun)
  const classStats = classes.map(cls => {
    const clsStudents = computedStudents.filter(s => s.class_name === cls && s.avgScore !== null);
    if (!clsStudents.length) return { className: cls, avg: 0, count: 0 };
    const avg = Math.round(clsStudents.reduce((sum, s) => sum + s.avgScore, 0) / clsStudents.length);
    return { className: cls, avg, count: clsStudents.length };
  });

  // Top 3 talabalar (Baholari bo'yicha, o'rtacha ball kamida 1ta topshiriq)
  const topStudents = [...statsClassFilteredStudents]
    .filter(s => s.avgScore !== null)
    .sort((a, b) => b.avgScore - a.avgScore)
    .slice(0, 3);

  // Eng faol 3 talabalar (Topshiriqlar soni bo'yicha)
  const activeTopStudents = [...statsClassFilteredStudents]
    .filter(s => s.totalSubmissions > 0)
    .sort((a, b) => b.totalSubmissions - a.totalSubmissions)
    .slice(0, 3);

  // Mavzular bo'yicha tahlil (Qiyin va oson mavzular)
  const topicMap = {};
  results.forEach(r => {
    // Agar guruh tanlangan bo'lsa, faqat shu guruh talabalarining natijalarini olamiz
    const studentObj = students.find(s => s.id === r.student_id);
    if (statsFilterClass && studentObj?.class_name !== statsFilterClass) return;

    const key = `${r.fan_name} ||| ${r.topic_name}`;
    if (!topicMap[key]) {
      topicMap[key] = { fan: r.fan_name, topic: r.topic_name, scores: [] };
    }
    topicMap[key].scores.push(r.score);
  });

  const computedTopics = Object.entries(topicMap).map(([key, data]) => {
    const avg = Math.round(data.scores.reduce((sum, s) => sum + s, 0) / data.scores.length);
    return { fan: data.fan, topic: data.topic, avg, count: data.scores.length };
  });

  const hardestTopics = [...computedTopics]
    .sort((a, b) => a.avg - b.avg)
    .slice(0, 3);

  const easiestTopics = [...computedTopics]
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 3);

  // Statistika
  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.is_active).length;
  const totalResults = results.length;
  const avgScore = results.length
    ? Math.round(results.reduce((a, b) => a + b.score, 0) / results.length)
    : 0;


  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", fontFamily: "'Inter', sans-serif" }}>

      {/* Oliy ta'lim (Professor) Header */}
      <div style={{
        background: "var(--navbar-bg)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--navbar-border)",
        padding: "0 32px", height: 72,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 50
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 32, height: 32, background: "#EF4444", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold", fontSize: 16 }}>
              EM
            </div>
            <div style={{ color: "var(--text)", fontWeight: 700, fontSize: 20, letterSpacing: "-0.5px" }}>EduMind</div>
          </div>
          <div style={{ display: "flex", gap: 24 }}>
            {[
              { id: "students", label: "Dashboard" },
              { id: "results", label: "AI Tekshirish" },
              { id: "stats", label: "Hisobotlar" },
              { id: "classes", label: "Guruhlar" },
              { id: "lessons", label: "Dars Rejalari" },
              { id: "add", label: "Talaba qo'shish" },
            ].map(t => (
              <div
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  color: tab === t.id ? "var(--text)" : "var(--muted)",
                  fontSize: 14, fontWeight: tab === t.id ? 600 : 500,
                  cursor: "pointer", transition: "color 0.2s",
                  borderBottom: tab === t.id ? "2px solid var(--primary)" : "2px solid transparent",
                  padding: "24px 0",
                  marginTop: 2
                }}
              >
                {t.label}
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <ThemeToggle />
          <div style={{ color: "var(--muted)", cursor: "pointer" }}>🔍</div>
          <div style={{ color: "var(--muted)", cursor: "pointer", position: "relative" }}>
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
            background: "transparent", border: "1px solid var(--border)",
            color: "var(--text)", padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 500
          }}>
            Chiqish
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 20px" }}>

        {loading && (
          <div style={{ textAlign: "center", padding: 60, color: "var(--muted)" }}>
            ⏳ Yuklanmoqda...
          </div>
        )}

        {/* YANGI DASHBOARD DIZAYNI */}
        {!loading && tab === "students" && (
          <div>
            {/* O'qituvchi Salomlashish qismi */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32 }}>
              <div>
                <h1 style={{ fontSize: 32, fontWeight: 700, margin: "0 0 8px 0", color: "var(--text)" }}>
                  Salom, {teacher.full_name?.split(" ")[0]} 👋
                </h1>
                <p style={{ color: "var(--muted)", margin: 0, fontSize: 15 }}>
                  Bugun 3 ta yangilik bor — <span style={{ color: "#EF4444" }}>AI 7 ta xavfli talabani aniqladi</span>
                </p>
              </div>
              <button style={{ 
                background: "var(--card)", color: "var(--text)", border: "none", 
                padding: "10px 20px", borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: "pointer" 
              }}>
                Hisobot yaratish
              </button>
            </div>

            {/* Statistika Kartalari */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
              <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 24 }}>
                <div style={{ color: "var(--muted)", fontSize: 14, marginBottom: 12 }}>Jami talabalar</div>
                <div style={{ fontSize: 32, fontWeight: 700, color: "var(--text)" }}>{totalStudents}</div>
                <div style={{ color: "#10B981", fontSize: 13, marginTop: 8 }}>+2 yangi</div>
              </div>
              <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 24 }}>
                <div style={{ color: "var(--muted)", fontSize: 14, marginBottom: 12 }}>O'rtacha ball</div>
                <div style={{ fontSize: 32, fontWeight: 700, color: "var(--text)" }}>{avgScore}%</div>
                <div style={{ color: "#10B981", fontSize: 13, marginTop: 8 }}>↑ 3.2 ball</div>
              </div>
              <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 24 }}>
                <div style={{ color: "var(--muted)", fontSize: 14, marginBottom: 12 }}>Tekshirilmagan</div>
                <div style={{ fontSize: 32, fontWeight: 700, color: "var(--text)" }}>23</div>
                <div style={{ color: "#F59E0B", fontSize: 13, marginTop: 8 }}>Bugun deadline</div>
              </div>
              <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 24 }}>
                <div style={{ color: "var(--muted)", fontSize: 14, marginBottom: 12 }}>Xavfli talabalar</div>
                <div style={{ fontSize: 32, fontWeight: 700, color: "var(--text)" }}>7</div>
                <div style={{ color: "#EF4444", fontSize: 13, marginTop: 8 }}>AI aniqladi</div>
              </div>
            </div>

            {/* Asosiy Content: Jadval va Vazifalar */}
            <div style={{ display: "grid", gridTemplateColumns: "70% 30%", gap: 24 }}>
              {/* Chap taraf: Jadval */}
              <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0, color: "var(--text)" }}>Talabalar holati</h2>
                  <div style={{ display: "flex", gap: 12, background: "var(--surface)", padding: 4, borderRadius: 8 }}>
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
                    <tr style={{ color: "rgba(255,255,255,0.4)", borderBottom: "1px solid var(--border)" }}>
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
                        <tr key={student.id} style={{ borderBottom: "1px solid var(--border)" }}>
                          <td style={{ padding: "16px 0", display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>
                              {student.full_name?.[0]?.toUpperCase()}
                            </div>
                            <div>
                              <div style={{ color: "var(--text)", fontWeight: 500 }}>{student.full_name}</div>
                              <div style={{ color: "var(--dim)", fontSize: 12 }}>#{student.username}</div>
                            </div>
                          </td>
                          <td style={{ padding: "16px 0", color: "var(--muted)" }}>Dasturlash asoslari</td>
                          <td style={{ padding: "16px 0", color: "var(--muted)" }}>{90 - i * 2}%</td>
                          <td style={{ padding: "16px 0", color: "var(--muted)" }}>{avg} ball</td>
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
                <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 24 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 600, margin: "0 0 16px 0", color: "var(--text)" }}>Bugungi vazifalar</h2>
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
                  <p style={{ color: "var(--muted)", margin: 0, fontSize: 14, lineHeight: 1.5 }}>
                    <strong style={{ color: "var(--text)" }}>Bekzod Toshmatov (ID: 4567)</strong> Dasturlash asoslaridan oxirgi 3 ta darsni qoldirdi va ballari 45% ga tushib ketdi. Zudlik bilan aloqaga chiqish tavsiya etiladi.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* NATIJALAR */}

        {!loading && tab === "results" && (
          <div>
            {results.length === 0 ? (
              <div style={{ textAlign: "center", padding: 60, color: "var(--dim)" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
                <div style={{ fontSize: 18, fontWeight: 600 }}>Hali natijalar yo'q</div>
                <div style={{ fontSize: 14, marginTop: 8 }}>Talabalar mavzularni topshirgandan keyin bu yerda ko'rinadi</div>
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: 16, fontSize: 14, color: "var(--muted)" }}>
                  Jami {results.length} ta topshirish natijasi
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {results.map((r, i) => {
                    const grade = getGrade(r.score);
                    const student = students.find(s => s.id === r.student_id);
                    return (
                      <div key={i} style={{
                        background: "var(--card)", borderRadius: 14, padding: "14px 18px",
                        border: "1px solid #E2E8F0", display: "flex",
                        alignItems: "center", gap: 14,
                        boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
                      }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: 10,
                          background: `${COLORS_MAP[grade]}15`,
                          border: `2px solid ${COLORS_MAP[grade]}40`,
                          display: "flex", flexDirection: "column",
                          alignItems: "center", justifyContent: "center", flexShrink: 0
                        }}>
                          <div style={{ fontSize: 14, fontWeight: 900, color: COLORS_MAP[grade] }}>{grade}</div>
                          <div style={{ fontSize: 9, color: COLORS_MAP[grade] }}>{r.score}%</div>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>
                            {student?.full_name || r.student_id}
                          </div>
                          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
                            <span>{r.fan_name} → {r.topic_name}</span>
                            {(() => {
                              let biometrics = null;
                              if (r.details) {
                                try {
                                  const parsedDetails = typeof r.details === "string" ? JSON.parse(r.details) : r.details;
                                  biometrics = parsedDetails?.biometrics;
                                } catch (e) {}
                              }
                              if (!biometrics) return null;
                              const isAllOk = biometrics.faceMatch && biometrics.voiceMatch;
                              return (
                                <span style={{
                                  padding: "2px 8px",
                                  borderRadius: 12,
                                  fontSize: 10,
                                  fontWeight: 600,
                                  background: isAllOk ? "rgba(16, 185, 129, 0.08)" : "rgba(239, 68, 68, 0.08)",
                                  color: isAllOk ? "#10B981" : "#EF4444"
                                }}>
                                  {isAllOk
                                    ? `🛡️ Tasdiqlandi (Yuz: ${biometrics.faceScore || 0}%, Ovoz: ${biometrics.voiceScore || 0}%)`
                                    : `⚠️ Mismatch! (Yuz: ${biometrics.faceMatch ? 'Mos' : 'XAVF'}, Ovoz: ${biometrics.voiceMatch ? 'Mos' : 'XAVF'})`
                                  }
                                </span>
                              );
                            })()}
                          </div>
                        </div>
                        <div style={{ fontSize: 12, color: "var(--dim)", flexShrink: 0 }}>
                          {new Date(r.created_at).toLocaleDateString("uz-UZ")}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== STATISTIKA ===== */}
        {!loading && tab === "stats" && (
          <div>
            {/* Filtrlar */}
            <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center", background: "var(--card)", padding: 16, borderRadius: 16, border: "1px solid #E2E8F0" }}>
              <div style={{ flex: 1, position: "relative" }}>
                <input
                  value={statsSearchQ}
                  onChange={e => setStatsSearchQ(e.target.value)}
                  placeholder="🔍 Talaba ismi yoki logini bo'yicha qidirish..."
                  style={{ width: "100%", padding: "10px 16px", borderRadius: 10, border: "1px solid #E2E8F0", fontSize: 14, outline: "none", boxSizing: "border-box" }}
                />
              </div>
              <select
                value={statsFilterClass}
                onChange={e => { setStatsFilterClass(e.target.value); setStatsFilterCategory("all"); }}
                style={{ padding: "10px 16px", borderRadius: 10, border: "1px solid #E2E8F0", fontSize: 14, outline: "none", background: "var(--card)", minWidth: 160 }}
              >
                <option value="">Barcha guruhlar</option>
                {classes.map(c => <option key={c} value={c}>{c}-kurs</option>)}
              </select>
              
              {(statsSearchQ || statsFilterClass || statsFilterCategory !== "all") && (
                <button
                  onClick={() => { setStatsSearchQ(""); setStatsFilterClass(""); setStatsFilterCategory("all"); }}
                  style={{ background: "var(--surface)", border: "none", color: "var(--muted)", padding: "10px 16px", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 600 }}
                >
                  Filtrlarni tozalash
                </button>
              )}
            </div>

            {/* Kategoriyalar kartochkalari gridi */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 24 }}>
              {[
                { id: "all", label: "Umumiy", count: statsCounts.all, color: "#2563EB", bg: "linear-gradient(135deg, #3B82F6, #1D4ED8)", desc: "Jami talabalar", icon: "👥" },
                { id: "alo", label: "A'lochi", count: statsCounts.alo, color: "#10B981", bg: "linear-gradient(135deg, #34D399, #059669)", desc: "Ball: 86 - 100%", icon: "🌟" },
                { id: "yaxshi", label: "Yaxshi", count: statsCounts.yaxshi, color: "#3B82F6", bg: "linear-gradient(135deg, #60A5FA, #2563EB)", desc: "Ball: 71 - 85%", icon: "📈" },
                { id: "qoniqarli", label: "Qoniqarli", count: statsCounts.qoniqarli, color: "#F59E0B", bg: "linear-gradient(135deg, #FCD34D, #D97706)", desc: "Ball: 55 - 70%", icon: "⚠️" },
                { id: "past", label: "Qiynalayotgan", count: statsCounts.past, color: "#EF4444", bg: "linear-gradient(135deg, #FCA5A5, #DC2626)", desc: "Ball: <55%", icon: "🚨" },
                { id: "boshlamagan", label: "Boshlamagan", count: statsCounts.boshlamagan, color: "var(--muted)", bg: "linear-gradient(135deg, #94A3B8, #475569)", desc: "Hali topshirmagan", icon: "⏳" }
              ].map(card => {
                const isActive = statsFilterCategory === card.id;
                return (
                  <div
                    key={card.id}
                    onClick={() => setStatsFilterCategory(card.id)}
                    style={{
                      background: "var(--card)",
                      borderRadius: 16,
                      padding: 16,
                      border: `2px solid ${isActive ? card.color : "#E2E8F0"}`,
                      boxShadow: isActive ? "0 10px 15px -3px rgba(0, 0, 0, 0.1)" : "0 1px 3px rgba(0,0,0,0.04)",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      transform: isActive ? "translateY(-4px)" : "none",
                      position: "relative",
                      overflow: "hidden"
                    }}
                    onMouseEnter={e => {
                      if (!isActive) e.currentTarget.style.borderColor = card.color;
                    }}
                    onMouseLeave={e => {
                      if (!isActive) e.currentTarget.style.borderColor = "#E2E8F0";
                    }}
                  >
                    {/* Background decor */}
                    <div style={{ position: "absolute", right: -10, bottom: -10, fontSize: 56, opacity: 0.08, pointerEvents: "none" }}>{card.icon}</div>
                    
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)" }}>{card.label}</span>
                      <span style={{ fontSize: 18 }}>{card.icon}</span>
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: card.color, fontFamily: "'Space Grotesk'" }}>
                      {card.count} <span style={{ fontSize: 12, fontWeight: 500, color: "var(--dim)" }}>nafar</span>
                    </div>
                    <div style={{ fontSize: 11, color: "var(--dim)", marginTop: 4 }}>{card.desc}</div>
                  </div>
                );
              })}
            </div>

            {/* Grafiklarlar va Tahlillar section */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: 20, marginBottom: 24 }}>
              {/* Tahliliy grafiklar */}
              <div style={{ background: "var(--card)", borderRadius: 20, padding: 20, border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                  📊 O'zlashtirish taqsimoti
                </h3>
                
                {/* Ta'qsimot satrlari */}
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {[
                    { label: "A'lochi (86-100%)", count: statsCounts.alo, color: "#10B981", icon: "🌟" },
                    { label: "Yaxshi (71-85%)", count: statsCounts.yaxshi, color: "#3B82F6", icon: "📈" },
                    { label: "Qoniqarli (55-70%)", count: statsCounts.qoniqarli, color: "#F59E0B", icon: "⚠️" },
                    { label: "Qiynalayotgan (<55%)", count: statsCounts.past, color: "#EF4444", icon: "🚨" },
                    { label: "Boshlamagan", count: statsCounts.boshlamagan, color: "var(--muted)", icon: "⏳" }
                  ].map((row, i) => {
                    const total = statsCounts.all || 1;
                    const percent = Math.round((row.count / total) * 100);
                    return (
                      <div key={i}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 600, color: "var(--muted)", marginBottom: 4 }}>
                          <span>{row.icon} {row.label}</span>
                          <span>{row.count} ta ({percent}%)</span>
                        </div>
                        <div style={{ height: 10, background: "var(--surface)", borderRadius: 5, overflow: "hidden", display: "flex" }}>
                          <div style={{ width: `${percent}%`, background: row.color, borderRadius: 5, transition: "width 0.5s ease" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Guruhlar o'rtacha ballari */}
                <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", marginTop: 24, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                  🏫 Guruhlar kesimida o'rtacha o'zlashtirish
                </h3>
                {classStats.length === 0 ? (
                  <div style={{ fontSize: 13, color: "var(--dim)", textAlign: "center", padding: 12 }}>Guruhlar ro'yxati topilmadi</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {classStats.map((cs, i) => (
                      <div key={i}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 600, color: "var(--muted)", marginBottom: 4 }}>
                          <span>{cs.className}-kurs ({cs.count} ta talaba)</span>
                          <span style={{ color: cs.avg >= 85 ? "#059669" : cs.avg >= 70 ? "#2563EB" : cs.avg >= 55 ? "#D97706" : "#DC2626" }}>{cs.avg}% o'rtacha ball</span>
                        </div>
                        <div style={{ height: 8, background: "var(--surface)", borderRadius: 4, overflow: "hidden" }}>
                          <div style={{
                            width: `${cs.avg}%`,
                            background: cs.avg >= 85 ? "#10B981" : cs.avg >= 70 ? "#3B82F6" : cs.avg >= 55 ? "#F59E0B" : "#EF4444",
                            borderRadius: 4,
                            transition: "width 0.5s ease"
                          }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tahlillar (Mavzular va Top talabalar) */}
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {/* Qiyin mavzular */}
                <div style={{ background: "var(--card)", borderRadius: 20, padding: 20, border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", flex: 1 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                    ⚠️ Qiynalayotgan mavzular (Eng past ballilar)
                  </h3>
                  {hardestTopics.length === 0 ? (
                    <div style={{ fontSize: 13, color: "var(--dim)", textAlign: "center", padding: 20 }}>Hali vaqtliroq, natijalar mavjud emas</div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {hardestTopics.map((topic, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "#FFF5F5", borderRadius: 12, border: "1px solid #FED7D7" }}>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: "#C53030" }}>{topic.topic}</div>
                            <div style={{ fontSize: 11, color: "#E53E3E", marginTop: 2 }}>{topic.fan}</div>
                          </div>
                          <div style={{ fontSize: 16, fontWeight: 800, color: "#C53030" }}>{topic.avg}%</div>
                        </div>
                      ))}
                    </div>
                  )}

                  <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", marginTop: 20, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                    ✅ Eng yaxshi o'zlashtirilgan mavzular
                  </h3>
                  {easiestTopics.length === 0 ? (
                    <div style={{ fontSize: 13, color: "var(--dim)", textAlign: "center", padding: 20 }}>Hali vaqtliroq, natijalar mavjud emas</div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {easiestTopics.map((topic, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "#F0FDF4", borderRadius: 12, border: "1px solid #DCFCE7" }}>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: "#166534" }}>{topic.topic}</div>
                            <div style={{ fontSize: 11, color: "#15803D", marginTop: 2 }}>{topic.fan}</div>
                          </div>
                          <div style={{ fontSize: 16, fontWeight: 800, color: "#166534" }}>{topic.avg}%</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Top talabalar */}
                <div style={{ background: "var(--card)", borderRadius: 20, padding: 20, border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--text)", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                    🏆 Top natijadorlar (Eng yuqori ballilar)
                  </h3>
                  {topStudents.length === 0 ? (
                    <div style={{ fontSize: 13, color: "var(--dim)", textAlign: "center", padding: 10 }}>Ma'lumotlar yo'q</div>
                  ) : (
                    <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                      {topStudents.map((stud, idx) => (
                        <div key={stud.id} style={{
                          flex: 1, background: "linear-gradient(135deg, #FFFDF5, #FFFBEB)", borderRadius: 12, padding: 12, border: "1px solid #FDE68A",
                          display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center"
                        }}>
                          <div style={{ fontSize: 20, marginBottom: 4 }}>{idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉"}</div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: "#92400E", overflow: "hidden", textOverflow: "ellipsis", width: "100%", whiteSpace: "nowrap" }}>{stud.full_name}</div>
                          <div style={{ fontSize: 10, color: "#B45309" }}>{stud.class_name}</div>
                          <div style={{ fontSize: 15, fontWeight: 800, color: "#D97706", marginTop: 6 }}>{stud.avgScore}%</div>
                        </div>
                      ))}
                    </div>
                  )}

                  <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--text)", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                    ⚡ Eng faol talabalar (Ko'p test topshirganlar)
                  </h3>
                  {activeTopStudents.length === 0 ? (
                    <div style={{ fontSize: 13, color: "var(--dim)", textAlign: "center", padding: 10 }}>Ma'lumotlar yo'q</div>
                  ) : (
                    <div style={{ display: "flex", gap: 10 }}>
                      {activeTopStudents.map((stud, idx) => (
                        <div key={stud.id} style={{
                          flex: 1, background: "linear-gradient(135deg, #F0F9FF, #E0F2FE)", borderRadius: 12, padding: 12, border: "1px solid #BAE6FD",
                          display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center"
                        }}>
                          <div style={{ fontSize: 18, marginBottom: 4 }}>⚡</div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: "#075985", overflow: "hidden", textOverflow: "ellipsis", width: "100%", whiteSpace: "nowrap" }}>{stud.full_name}</div>
                          <div style={{ fontSize: 10, color: "#0369A1" }}>{stud.class_name}</div>
                          <div style={{ fontSize: 14, fontWeight: 800, color: "#0284C7", marginTop: 6 }}>{stud.totalSubmissions} marta</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Talabalar jadvali */}
            <div style={{ background: "var(--card)", borderRadius: 20, border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden" }}>
              <div style={{ padding: "18px 24px", borderBottom: "1px solid #F1F5F9", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--text)" }}>
                    📋 Talabalar reytingi va natijalari
                  </h3>
                  <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                    Kategoriyalar va guruh filtrlari qo'llangan ro'yxat: {filteredStatsStudents.length} ta talaba
                  </p>
                </div>
              </div>

              {filteredStatsStudents.length === 0 ? (
                <div style={{ padding: 60, textAlign: "center", color: "var(--dim)" }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
                  <div style={{ fontWeight: 600 }}>Hech qanday talaba topilmadi</div>
                  <div style={{ fontSize: 13, marginTop: 4 }}>Qidiruv parametrlarini o'zgartirib ko'ring</div>
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead>
                      <tr style={{ background: "var(--bg)", borderBottom: "1px solid #E2E8F0" }}>
                        <th style={{ padding: "14px 20px", fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Talaba</th>
                        <th style={{ padding: "14px 20px", fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Guruh</th>
                        <th style={{ padding: "14px 20px", fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Faollik</th>
                        <th style={{ padding: "14px 20px", fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", textAlign: "center" }}>O'rtacha Ball</th>
                        <th style={{ padding: "14px 20px", fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Daraja</th>
                        <th style={{ padding: "14px 20px", fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", textAlign: "center" }}>Amal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStatsStudents.map((stud, idx) => {
                        const catColors = {
                          alo: { text: "#047857", bg: "#D1FAE5", label: "A'lo", dot: "#10B981" },
                          yaxshi: { text: "#1D4ED8", bg: "#DBEAFE", label: "Yaxshi", dot: "#3B82F6" },
                          qoniqarli: { text: "#B45309", bg: "#FEF3C7", label: "Qoniqarli", dot: "#F59E0B" },
                          past: { text: "#B91C1C", bg: "#FEE2E2", label: "Qiynalayotgan", dot: "#EF4444" },
                          boshlamagan: { text: "#475569", bg: "#F1F5F9", label: "Hali topshirmagan", dot: "#94A3B8" }
                        };
                        const config = catColors[stud.category] || catColors.boshlamagan;
                        return (
                          <tr key={stud.id} style={{ borderBottom: "1px solid #F1F5F9", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "#F8FAFC"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                            <td style={{ padding: "14px 20px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <div style={{
                                  width: 38, height: 38, borderRadius: 10,
                                  background: `linear-gradient(135deg, ${config.dot}, ${config.dot}CC)`,
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  color: "white", fontWeight: 700, fontSize: 14
                                }}>
                                  {stud.full_name?.[0]?.toUpperCase() || "?"}
                                </div>
                                <div>
                                  <div style={{ fontWeight: 700, color: "var(--text)", fontSize: 14 }}>{stud.full_name}</div>
                                  <div style={{ fontSize: 11, color: "var(--dim)" }}>@{stud.username}</div>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: "14px 20px", fontWeight: 600, color: "var(--muted)", fontSize: 14 }}>
                              {stud.class_name || "Mavjud emas"}
                            </td>
                            <td style={{ padding: "14px 20px" }}>
                              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)" }}>{stud.totalSubmissions} ta topshiriq</div>
                              {stud.totalSubmissions > 0 && (
                                <div style={{ fontSize: 11, color: "var(--dim)", marginTop: 2 }}>
                                  Eng yuqori: {stud.maxScore}% • Eng past: {stud.minScore}%
                                </div>
                              )}
                            </td>
                            <td style={{ padding: "14px 20px", textAlign: "center" }}>
                              {stud.avgScore !== null ? (
                                <div>
                                  <span style={{
                                    fontSize: 15, fontWeight: 900,
                                    color: stud.avgScore >= 86 ? "#059669" : stud.avgScore >= 71 ? "#2563EB" : stud.avgScore >= 55 ? "#D97706" : "#DC2626"
                                  }}>{stud.avgScore}%</span>
                                  
                                  {/* Mini visual progress bar under score */}
                                  <div style={{ width: 60, height: 4, background: "var(--surface)", borderRadius: 2, margin: "4px auto 0 auto", overflow: "hidden" }}>
                                    <div style={{ width: `${stud.avgScore}%`, height: "100%", background: config.dot, borderRadius: 2 }} />
                                  </div>
                                </div>
                              ) : (
                                <span style={{ color: "var(--dim)", fontSize: 13 }}>-</span>
                              )}
                            </td>
                            <td style={{ padding: "14px 20px" }}>
                              <span style={{
                                display: "inline-flex", alignItems: "center", gap: 6,
                                padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                                color: config.text, background: config.bg
                              }}>
                                <span style={{ width: 6, height: 6, borderRadius: "50%", background: config.dot }} />
                                {config.label}
                              </span>
                            </td>
                            <td style={{ padding: "14px 20px", textAlign: "center" }}>
                              <button
                                onClick={() => { setStatsSelectedStudent(stud); setStatsExpandedResult(null); }}
                                style={{
                                  background: "rgba(37,99,235,0.08)", color: "#2563EB", border: "none",
                                  padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 700,
                                  transition: "all 0.2s"
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = "#2563EB"; e.currentTarget.style.color = "white"; }}
                                onMouseLeave={e => { e.currentTarget.style.background = "rgba(37,99,235,0.08)"; e.currentTarget.style.color = "#2563EB"; }}
                              >
                                🔍 Batafsil
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== GURUHLAR TAHLILI TAB ===== */}
        {!loading && tab === "classes" && (
          <div>
            {/* Guruhni tanlash bo'limi */}
            <div style={{ background: "var(--card)", borderRadius: 20, padding: 24, border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", marginBottom: 24 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text)", marginBottom: 6 }}>🏫 Guruhlar bo'yicha tahlil</div>
              <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16 }}>Tahlil qilish uchun quyidagi guruhlardan birini tanlang:</div>
              
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {classes.length === 0 ? (
                  <div style={{ color: "var(--dim)", fontSize: 13 }}>Tizimda hali talabalar qo'shilmagan.</div>
                ) : (
                  classes.map(cls => (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => setClassTabSelectedClass(cls)}
                      style={{
                        padding: "10px 20px", borderRadius: 12, border: "2px solid",
                        borderColor: classTabSelectedClass === cls ? "#2563EB" : "#E2E8F0",
                        background: classTabSelectedClass === cls ? "rgba(37,99,235,0.06)" : "white",
                        color: classTabSelectedClass === cls ? "#2563EB" : "#475569",
                        fontWeight: 700, fontSize: 14, cursor: "pointer", transition: "all 0.2s"
                      }}
                    >
                      🏫 {cls}-kurs
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Guruh tanlangan bo'lsa */}
            {classTabSelectedClass ? (() => {
              const classStudents = computedStudents.filter(s => s.class_name === classTabSelectedClass);
              
              const bestClassStudents = classStudents.filter(s => s.avgScore !== null && s.avgScore >= 75)
                .sort((a, b) => b.avgScore - a.avgScore);
                
              const midClassStudents = classStudents.filter(s => s.avgScore !== null && s.avgScore >= 50 && s.avgScore < 75)
                .sort((a, b) => b.avgScore - a.avgScore);
                
              const worstClassStudents = classStudents.filter(s => s.avgScore !== null && s.avgScore < 50)
                .sort((a, b) => a.avgScore - b.avgScore); // eng yomonlari birinchi
                
              const idleClassStudents = classStudents.filter(s => s.avgScore === null);

              return (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--text)" }}>
                      🏫 {classTabSelectedClass}-kurs talabalari (Jami: {classStudents.length} nafar)
                    </h2>
                  </div>

                  {classStudents.length === 0 ? (
                    <div style={{ padding: 40, textAlign: "center", background: "var(--card)", borderRadius: 16, border: "1px solid #E2E8F0" }}>
                      <div style={{ fontSize: 36, marginBottom: 8 }}>👥</div>
                      <div style={{ color: "var(--muted)", fontWeight: 600 }}>Ushbu guruhda talabalar mavjud emas.</div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                      
                      {/* Birinchi qator: Eng Yaxshi va Eng Yomon o'qiydiganlar */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
                        
                        {/* 🌟 ENG YAXSHI O'QIYDIGANLAR */}
                        <div style={{ background: "var(--card)", borderRadius: 20, border: "1px solid #E2E8F0", padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, borderBottom: "1px solid #F1F5F9", paddingBottom: 10 }}>
                            <span style={{ fontSize: 16, fontWeight: 800, color: "#065F46", display: "flex", alignItems: "center", gap: 6 }}>
                              🌟 Eng yaxshi o'qiydiganlar ({bestClassStudents.length})
                            </span>
                            <span style={{ background: "#D1FAE5", color: "#065F46", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 10 }}>&ge; 75%</span>
                          </div>

                          {bestClassStudents.length === 0 ? (
                            <div style={{ padding: 30, textAlign: "center", color: "var(--dim)", fontSize: 13, fontStyle: "italic" }}>
                              Hali a'lo baholi talabalar yo'q.
                            </div>
                          ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                              {bestClassStudents.map(stud => (
                                <div key={stud.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 12, background: "#F0FDF4", borderRadius: 12, border: "1px solid #DCFCE7" }}>
                                  <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10 }}>
                                    <div style={{ width: 32, height: 32, borderRadius: 8, background: "#34D399", color: "white", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                      {stud.full_name?.[0]?.toUpperCase()}
                                    </div>
                                    <div>
                                      <div style={{ fontSize: 14, fontWeight: 700, color: "#065F46" }}>{stud.full_name}</div>
                                      <div style={{ fontSize: 11, color: "#047857" }}>{stud.totalSubmissions} ta topshiriq</div>
                                    </div>
                                  </div>
                                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <div style={{ fontSize: 15, fontWeight: 900, color: "#059669", marginRight: 8 }}>{stud.avgScore}%</div>
                                    <button
                                      type="button"
                                      onClick={() => { setStatsSelectedStudent(stud); setStatsExpandedResult(null); }}
                                      style={{ background: "#059669", color: "white", border: "none", padding: "6px 10px", borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: "pointer" }}
                                    >
                                      Batafsil
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* 🚨 ENG YOMON/PAST O'QIYDIGANLAR */}
                        <div style={{ background: "var(--card)", borderRadius: 20, border: "1px solid #E2E8F0", padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, borderBottom: "1px solid #F1F5F9", paddingBottom: 10 }}>
                            <span style={{ fontSize: 16, fontWeight: 800, color: "#991B1B", display: "flex", alignItems: "center", gap: 6 }}>
                              🚨 Qiynalayotgan / Past o'qiydiganlar ({worstClassStudents.length})
                            </span>
                            <span style={{ background: "#FEE2E2", color: "#991B1B", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 10 }}>&lt;50%</span>
                          </div>

                          {worstClassStudents.length === 0 ? (
                            <div style={{ padding: 30, textAlign: "center", color: "var(--dim)", fontSize: 13, fontStyle: "italic" }}>
                              Ushbu guruhda 50% dan past baholi talabalar yo'q.
                            </div>
                          ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                              {worstClassStudents.map(stud => (
                                <div key={stud.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 12, background: "#FEF2F2", borderRadius: 12, border: "1px solid #FEE2E2" }}>
                                  <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10 }}>
                                    <div style={{ width: 32, height: 32, borderRadius: 8, background: "#F87171", color: "white", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                      {stud.full_name?.[0]?.toUpperCase()}
                                    </div>
                                    <div>
                                      <div style={{ fontSize: 14, fontWeight: 700, color: "#991B1B" }}>{stud.full_name}</div>
                                      <div style={{ fontSize: 11, color: "#B91C1C" }}>{stud.totalSubmissions} ta topshiriq</div>
                                    </div>
                                  </div>
                                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <div style={{ fontSize: 15, fontWeight: 900, color: "#DC2626", marginRight: 8 }}>{stud.avgScore}%</div>
                                    <button
                                      type="button"
                                      onClick={() => { setStatsSelectedStudent(stud); setStatsExpandedResult(null); }}
                                      style={{ background: "#DC2626", color: "white", border: "none", padding: "6px 10px", borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: "pointer" }}
                                    >
                                      Batafsil
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                      </div>

                      {/* Ikkinchi qator: O'rtacha o'zlashtirayotganlar va Boshlamaganlar */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
                        
                        {/* ⚠️ O'RTACHA O'QIYDIGANLAR */}
                        <div style={{ background: "var(--card)", borderRadius: 20, border: "1px solid #E2E8F0", padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, borderBottom: "1px solid #F1F5F9", paddingBottom: 10 }}>
                            <span style={{ fontSize: 15, fontWeight: 800, color: "#92400E", display: "flex", alignItems: "center", gap: 6 }}>
                              ⚠️ O'rtacha o'zlashtirayotganlar ({midClassStudents.length})
                            </span>
                            <span style={{ background: "#FEF3C7", color: "#92400E", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 10 }}>50% - 74%</span>
                          </div>

                          {midClassStudents.length === 0 ? (
                            <div style={{ padding: 24, textAlign: "center", color: "var(--dim)", fontSize: 13, fontStyle: "italic" }}>
                              O'rtacha baholi talabalar yo'q.
                            </div>
                          ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                              {midClassStudents.map(stud => (
                                <div key={stud.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 10, background: "#FFFBEB", borderRadius: 10, border: "1px solid #FEF3C7" }}>
                                  <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
                                    <div style={{ width: 28, height: 28, borderRadius: 6, background: "#F59E0B", color: "white", fontWeight: 700, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                      {stud.full_name?.[0]?.toUpperCase()}
                                    </div>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: "#92400E" }}>{stud.full_name}</div>
                                  </div>
                                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <div style={{ fontSize: 13, fontWeight: 800, color: "#D97706", marginRight: 6 }}>{stud.avgScore}%</div>
                                    <button
                                      type="button"
                                      onClick={() => { setStatsSelectedStudent(stud); setStatsExpandedResult(null); }}
                                      style={{ background: "#D97706", color: "white", border: "none", padding: "4px 8px", borderRadius: 6, fontSize: 10, fontWeight: 600, cursor: "pointer" }}
                                    >
                                      Batafsil
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* ⏳ HALI BOSHLAMAGANLAR */}
                        <div style={{ background: "var(--card)", borderRadius: 20, border: "1px solid #E2E8F0", padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, borderBottom: "1px solid #F1F5F9", paddingBottom: 10 }}>
                            <span style={{ fontSize: 15, fontWeight: 800, color: "var(--text)", display: "flex", alignItems: "center", gap: 6 }}>
                              ⏳ Topshiriq topshirmaganlar ({idleClassStudents.length})
                            </span>
                            <span style={{ background: "var(--surface)", color: "var(--text)", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 10 }}>0 ta topshiriq</span>
                          </div>

                          {idleClassStudents.length === 0 ? (
                            <div style={{ padding: 24, textAlign: "center", color: "var(--dim)", fontSize: 13, fontStyle: "italic" }}>
                              Hamma talabalar topshiriq topshirgan.
                            </div>
                          ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                              {idleClassStudents.map(stud => (
                                <div key={stud.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 10, background: "var(--bg)", borderRadius: 10, border: "1px solid #E2E8F0" }}>
                                  <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
                                    <div style={{ width: 28, height: 28, borderRadius: 6, background: "#94A3B8", color: "white", fontWeight: 700, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                      {stud.full_name?.[0]?.toUpperCase()}
                                    </div>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)" }}>{stud.full_name}</div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => { setStatsSelectedStudent(stud); setStatsExpandedResult(null); }}
                                    style={{ background: "#64748B", color: "white", border: "none", padding: "4px 8px", borderRadius: 6, fontSize: 10, fontWeight: 600, cursor: "pointer" }}
                                  >
                                    Batafsil
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                      </div>

                    </div>
                  )}
                </div>
              );
            })() : (
              <div style={{ padding: 60, textAlign: "center", background: "var(--card)", borderRadius: 20, border: "1px solid #E2E8F0" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🏫</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text)" }}>Guruh tanlanmagan</div>
                <div style={{ fontSize: 14, color: "var(--muted)", marginTop: 6 }}>Tahlillarni ko'rish uchun yuqoridagi ro'yxatdan birorta guruhni tanlang.</div>
              </div>
            )}
          </div>
        )}

        {/* TALABA QO'SHISH */}
        {tab === "add" && (
          <div style={{ maxWidth: 560 }}>
            <div style={{
              background: "var(--card)", borderRadius: 20, padding: 32,
              border: "1px solid var(--border)"
            }}>
              <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 6, color: "var(--text)" }}>
                ➕ Yangi talaba qo'shish
              </div>
              <div style={{ fontSize: 14, color: "var(--muted)", marginBottom: 28 }}>
                Talabaga login va parol bering — u shu ma'lumotlar bilan kiradi
              </div>

              {addMsg && (
                <div style={{
                  padding: "12px 16px", borderRadius: 10, marginBottom: 20, fontSize: 14,
                  background: addMsg.type === "success" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                  border: `1px solid ${addMsg.type === "success" ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
                  color: addMsg.type === "success" ? "#10B981" : "#EF4444",
                }}>
                  {addMsg.text}
                </div>
              )}

              <form onSubmit={handleAddStudent}>
                {[
                  { label: "👤 To'liq ism", val: newName, set: setNewName, ph: "Aziz Toshmatov" },
                  { label: "🔤 Username (login)", val: newUser, set: setNewUser, ph: "aziz_toshmatov" },
                  { label: "🔒 Parol", val: newPass, set: setNewPass, ph: "Kuchli parol kiriting", type: "password" },
                ].map((f, i) => (
                  <div key={i} style={{ marginBottom: 18 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)", display: "block", marginBottom: 8 }}>
                      {f.label}
                    </label>
                    <input
                      type={f.type || "text"}
                      value={f.val} onChange={e => f.set(e.target.value)}
                      placeholder={f.ph}
                      style={{
                        width: "100%", padding: "12px 16px", borderRadius: 10,
                        border: "1px solid rgba(255,255,255,0.15)",
                        background: "var(--surface)",
                        color: "var(--text)", fontSize: 14, outline: "none", boxSizing: "border-box"
                      }}
                    />
                  </div>
                ))}

                {/* Guruh tanlash */}
                <div style={{ marginBottom: 24 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)", display: "block", marginBottom: 10 }}>
                    🎓 Guruh / Kurs
                  </label>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {["1-kurs", "2-kurs", "3-kurs", "4-kurs", "Magistratura"].map(cls => (
                      <button
                        key={cls}
                        type="button"
                        onClick={() => setNewClass(cls)}
                        style={{
                          padding: "9px 16px", borderRadius: 8, border: "1.5px solid",
                          borderColor: newClass === cls ? "#3B82F6" : "rgba(255,255,255,0.15)",
                          background: newClass === cls ? "rgba(59,130,246,0.15)" : "transparent",
                          color: newClass === cls ? "#3B82F6" : "rgba(255,255,255,0.6)",
                          fontWeight: newClass === cls ? 700 : 500,
                          cursor: "pointer", fontSize: 13, transition: "all 0.2s"
                        }}
                      >
                        {cls}
                      </button>
                    ))}
                  </div>
                  {newClass && (
                    <div style={{ marginTop: 10, fontSize: 13, color: "#10B981", fontWeight: 500 }}>
                      ✅ Tanlangan: <strong>{newClass}</strong>
                    </div>
                  )}
                </div>

                <button type="submit" disabled={addLoading}
                  style={{
                    width: "100%", padding: "14px", borderRadius: 12, border: "none",
                    background: addLoading ? "rgba(255,255,255,0.08)" : "linear-gradient(135deg, #2563EB, #7C3AED)",
                    color: addLoading ? "rgba(255,255,255,0.4)" : "white",
                    fontWeight: 700, fontSize: 15, cursor: addLoading ? "not-allowed" : "pointer",
                    boxShadow: addLoading ? "none" : "0 4px 20px rgba(37,99,235,0.3)"
                  }}>
                  {addLoading ? "⏳ Qo'shilmoqda..." : "✅ Talabani qo'shish"}
                </button>
              </form>


            </div>
          </div>
        )}


        {/* ===== DARS REJALARI TAB ===== */}
        {tab === "lessons" && (
          <div>
            <div style={{ background: "var(--card)", borderRadius: 20, padding: 28, border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", marginBottom: 20 }}>
              <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 6, color: "var(--text)" }}>📚 Dars Rejalari va Fanlar Boshqaruvi</div>
              <div style={{ fontSize: 14, color: "var(--muted)", marginBottom: 20 }}>Guruhlarni tanlang, fanlar va mavzularni qo'lda kiriting. Talabalar bu fanlar va mavzularni Dashboard-da ko'radi.</div>

              {/* Guruh tanlash */}
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>🏫 Guruhni tanlang</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
                {["1-kurs", "2-kurs", "3-kurs", "4-kurs", "Magistratura"].map(cls => (
                  <button key={cls} onClick={() => { setSelectedClass(cls); setSelectedSubject(null); setCustomTopics([]); }}
                    style={{
                      padding: "10px 18px", borderRadius: 10, border: "2px solid",
                      borderColor: selectedClass === cls ? "#2563EB" : "#E2E8F0",
                      background: selectedClass === cls ? "rgba(37,99,235,0.08)" : "white",
                      color: selectedClass === cls ? "#2563EB" : "#64748B",
                      fontWeight: selectedClass === cls ? 700 : 500, cursor: "pointer", fontSize: 14
                    }}>
                    {cls}
                  </button>
                ))}
              </div>

              {selectedClass && (
                <>
                  {/* ========= FANLAR ========= */}
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>
                    📖 {selectedClass} guruh fanlari ({subjectsList.length} ta)
                  </div>

                  {subjectsList.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
                      {subjectsList.map(sub => {
                        const isDefault = !sub.id.toString().startsWith("custom_");
                        return (
                          <div key={sub.id}
                            onClick={() => setSelectedSubject(sub)}
                            style={{
                              padding: "12px 18px", borderRadius: 14, cursor: "pointer",
                              border: `2px solid ${selectedSubject?.id === sub.id ? sub.color : "#E2E8F0"}`,
                              background: selectedSubject?.id === sub.id ? `${sub.color}12` : "white",
                              display: "flex", alignItems: "center", gap: 10, transition: "all 0.2s",
                              position: "relative"
                            }}>
                            <span style={{ fontSize: 22 }}>{sub.icon}</span>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>{sub.name}</div>
                              <div style={{ fontSize: 11, color: "var(--dim)" }}>
                                {sub.topics || 0} mavzu • {isDefault ? "Tizim fani" : "Qo'shimcha fan"}
                              </div>
                            </div>
                            {!isDefault && (
                              <button onClick={(e) => { e.stopPropagation(); handleDeleteSubject(sub.id); }}
                                style={{ position: "absolute", top: -6, right: -6, width: 22, height: 22, borderRadius: "50%", background: "#FEE2E2", border: "1px solid #FECACA", color: "#DC2626", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Fan qo'shish formasi */}
                  <form onSubmit={handleAddSubject} style={{ background: "var(--bg)", borderRadius: 14, padding: 20, border: "1px solid #E2E8F0", marginBottom: 24 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 14 }}>➕ Yangi fan qo'shish</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", display: "block", marginBottom: 4 }}>Emoji</label>
                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                          <input value={newSubIcon} onChange={e => setNewSubIcon(e.target.value)} placeholder="📚"
                            style={{ width: 44, padding: "10px 4px", borderRadius: 10, border: "1px solid #E2E8F0", fontSize: 20, textAlign: "center", outline: "none" }} />
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, maxWidth: 300, background: "var(--card)", padding: 6, borderRadius: 10, border: "1px solid #E2E8F0" }}>
                            {["📚", "⚛️", "🧮", "📐", "🧪", "🧬", "🏛️", "🌍", "💻", "✍️", "📖", "🎨", "🎵", "⚽", "🇬🇧", "🇷🇺", "🤝"].map(emoji => (
                              <button key={emoji} type="button" onClick={() => setNewSubIcon(emoji)}
                                style={{
                                  width: 28, height: 28, borderRadius: 6, border: newSubIcon === emoji ? "2px solid #2563EB" : "1px solid #E2E8F0",
                                  background: newSubIcon === emoji ? "#EFF6FF" : "white", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s"
                                }}>
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", display: "block", marginBottom: 4 }}>Fan nomi *</label>
                        <input value={newSubName} onChange={e => setNewSubName(e.target.value)} placeholder="Masalan: Fizika"
                          style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #E2E8F0", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                      </div>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", display: "block", marginBottom: 4 }}>Tavsif</label>
                        <input value={newSubDesc} onChange={e => setNewSubDesc(e.target.value)} placeholder="Qisqacha tavsif"
                          style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #E2E8F0", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", display: "block", marginBottom: 4 }}>Rang</label>
                        <input type="color" value={newSubColor} onChange={e => setNewSubColor(e.target.value)}
                          style={{ width: 44, height: 36, borderRadius: 8, border: "1px solid #E2E8F0", cursor: "pointer" }} />
                      </div>
                      <button type="submit" disabled={!newSubName.trim()}
                        style={{
                          marginTop: 16, padding: "10px 24px", borderRadius: 10, border: "none",
                          background: newSubName.trim() ? "linear-gradient(135deg, #2563EB, #059669)" : "#E2E8F0",
                          color: newSubName.trim() ? "white" : "#94A3B8",
                          fontWeight: 700, fontSize: 14, cursor: newSubName.trim() ? "pointer" : "not-allowed"
                        }}>
                        ✅ Fan qo'shish
                      </button>
                    </div>
                  </form>

                  {/* ========= MAVZULAR ========= */}
                  {selectedSubject && (
                    <div style={{ background: "var(--bg)", borderRadius: 16, padding: 20, border: "1px solid #E2E8F0" }}>
                      <div style={{ fontSize: 17, fontWeight: 800, color: "var(--text)", marginBottom: 4 }}>
                        {selectedSubject.icon} {selectedSubject.name} — Mavzular
                      </div>
                      <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16 }}>
                        {selectedClass} guruh uchun mavzularni qo'lda kiriting va boshqaring
                      </div>

                      {/* Mavjud mavzular ro'yxati */}
                      {customTopics.length > 0 && (
                        <div style={{ marginBottom: 20 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)", marginBottom: 8 }}>
                            Mavjud mavzular ({customTopics.length} ta)
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            {customTopics.map((topic, idx) => (
                              <div key={topic.id} style={{
                                display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
                                background: "var(--card)", borderRadius: 10, border: "1px solid #E2E8F0"
                              }}>
                                <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(37,99,235,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#2563EB", flexShrink: 0 }}>
                                  {idx + 1}
                                </div>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text)" }}>{topic.name}</div>
                                  <div style={{ fontSize: 11, color: "var(--dim)" }}>{topic.chorak}-chorak</div>
                                </div>
                                <div style={{ display: "flex", gap: 8 }}>
                                  <button type="button" onClick={() => handleStartEditTopic(topic)}
                                    style={{ background: "rgba(37,99,235,0.08)", color: "#2563EB", border: "none", padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                                    ✏️ Tahrirlash
                                  </button>
                                  <button type="button" onClick={() => handleDeleteTopic(topic.id)}
                                    style={{ background: "rgba(220,38,38,0.08)", color: "#DC2626", border: "none", padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                                    🗑 O'chirish
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Mavzu qo'shish formasi */}
                      <form onSubmit={handleAddTopic} style={{ background: "var(--card)", borderRadius: 14, padding: 20, border: "1px solid #E2E8F0" }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 14 }}>➕ Yangi mavzu qo'shish</div>
                        
                        {/* Mavzu nomi */}
                        <div style={{ marginBottom: 14 }}>
                          <label style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", display: "block", marginBottom: 4 }}>Mavzu nomi *</label>
                          <div style={{ display: "flex", gap: 10 }}>
                            <input value={newTopName} onChange={e => setNewTopName(e.target.value)} placeholder="Masalan: Nyuton qonunlari"
                              style={{ flex: 1, padding: "10px 12px", borderRadius: 10, border: "1px solid #E2E8F0", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                            <button type="submit" disabled={!newTopName.trim()}
                              style={{
                                padding: "10px 20px", borderRadius: 10, border: "none", whiteSpace: "nowrap",
                                background: newTopName.trim() ? "linear-gradient(135deg, #2563EB, #059669)" : "#E2E8F0",
                                color: newTopName.trim() ? "white" : "#94A3B8",
                                fontWeight: 700, fontSize: 13, cursor: newTopName.trim() ? "pointer" : "not-allowed"
                              }}>
                              ✅ Qo'shish
                            </button>
                          </div>
                        </div>

                        {/* Ajratish chizig'i */}
                        <div style={{ borderTop: "1px dashed #E2E8F0", margin: "16px 0", position: "relative" }}>
                          <span style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", background: "var(--card)", padding: "0 12px", fontSize: 11, color: "var(--dim)", fontWeight: 600 }}>yoki fayldan yuklang</span>
                        </div>

                        {/* Namuna hujjat va import */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                          {/* Namuna hujjat yuklab olish */}
                          <div style={{ background: "rgba(37,99,235,0.04)", border: "1px solid rgba(37,99,235,0.12)", borderRadius: 10, padding: "12px 14px" }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "#2563EB", marginBottom: 8 }}>📥 Namuna hujjat yuklab olish</div>
                            <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 10, lineHeight: 1.6 }}>
                              Namuna faylni yuklab oling, mavzu nomlarini ketma-ket yozing va dasturga qayta yuklang.
                            </div>
                            <div style={{ display: "flex", gap: 8 }}>
                              <button type="button" onClick={downloadWordTemplate}
                                style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid rgba(37,99,235,0.2)", background: "var(--card)", color: "#2563EB", fontWeight: 600, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                                📄 Word namuna (.txt)
                              </button>
                              <button type="button" onClick={downloadExcelTemplate}
                                style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid rgba(5,150,105,0.2)", background: "var(--card)", color: "#059669", fontWeight: 600, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                                📊 Excel namuna (.xlsx)
                              </button>
                            </div>
                          </div>

                          {/* Fayldan import */}
                          <div style={{ background: "rgba(5,150,105,0.04)", border: "1px solid rgba(5,150,105,0.12)", borderRadius: 10, padding: "12px 14px" }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "#059669", marginBottom: 8 }}>📤 Mavzularni fayldan yuklash</div>
                            <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 10, lineHeight: 1.6 }}>
                              To'ldirilgan faylni tanlang — mavzular avtomatik import qilinadi.
                            </div>
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                              {/* Word import */}
                              <input type="file" id="importWordTopics" accept=".docx,.doc,.txt" style={{ display: "none" }}
                                onChange={async (e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    if (file.name.endsWith(".txt")) {
                                      const text = await file.text();
                                      const topicNames = parseTopicLines(text);
                                      if (topicNames.length) await saveImportedTopics(topicNames);
                                      else { setImportStatus("❌ Mavzu nomlari topilmadi!"); setTimeout(() => setImportStatus(""), 3000); }
                                    } else {
                                      await importFromWord(file);
                                    }
                                  }
                                  e.target.value = "";
                                }} />
                              <button type="button" onClick={() => document.getElementById("importWordTopics").click()}
                                style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid rgba(37,99,235,0.2)", background: "var(--card)", color: "#2563EB", fontWeight: 600, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                                📄 Word / TXT fayldan yuklash
                              </button>

                              {/* Excel import */}
                              <input type="file" id="importExcelTopics" accept=".xlsx,.xls,.csv" style={{ display: "none" }}
                                onChange={async (e) => {
                                  const file = e.target.files[0];
                                  if (file) await importFromExcel(file);
                                  e.target.value = "";
                                }} />
                              <button type="button" onClick={() => document.getElementById("importExcelTopics").click()}
                                style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid rgba(5,150,105,0.2)", background: "var(--card)", color: "#059669", fontWeight: 600, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                                📊 Excel fayldan yuklash
                              </button>
                            </div>
                          </div>

                          {/* Import status */}
                          {importStatus && (
                            <div style={{
                              padding: "10px 14px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                              background: importStatus.startsWith("✅") ? "rgba(5,150,105,0.08)" : importStatus.startsWith("⏳") ? "rgba(37,99,235,0.08)" : "rgba(220,38,38,0.08)",
                              color: importStatus.startsWith("✅") ? "#059669" : importStatus.startsWith("⏳") ? "#2563EB" : "#DC2626",
                              border: `1px solid ${importStatus.startsWith("✅") ? "rgba(5,150,105,0.2)" : importStatus.startsWith("⏳") ? "rgba(37,99,235,0.2)" : "rgba(220,38,38,0.2)"}`
                            }}>
                              {importStatus}
                            </div>
                          )}
                        </div>
                      </form>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ===== PROFIL MODAL ===== */}
      {showProfile && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(15,23,42,0.7)",
          backdropFilter: "blur(6px)", display: "flex", alignItems: "center",
          justifyContent: "center", zIndex: 10000, padding: 20
        }}>
          <div style={{
            background: "var(--card)", borderRadius: 24, width: "100%", maxWidth: 560,
            maxHeight: "90vh", overflowY: "auto",
            boxShadow: "0 32px 64px rgba(0,0,0,0.25)"
          }}>
            {/* Header */}
            <div style={{
              background: "linear-gradient(135deg, #1E293B, #2563EB)",
              borderRadius: "24px 24px 0 0", padding: "24px 28px",
              display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 16,
                  background: "linear-gradient(135deg, #60A5FA, #34D399)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 900, fontSize: 24, color: "white"
                }}>
                  {teacher.full_name?.[0]?.toUpperCase() || "T"}
                </div>
                <div>
                  <div style={{ color: "white", fontWeight: 800, fontSize: 18 }}>{editName || teacher.full_name}</div>
                  <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>👨‍🏫 O'qituvchi • @{teacher.username}</div>
                </div>
              </div>
              <button onClick={() => setShowProfile(false)} style={{
                background: "rgba(255,255,255,0.15)", border: "none", color: "white",
                width: 36, height: 36, borderRadius: "50%", cursor: "pointer", fontSize: 18
              }}>✕</button>
            </div>

            <div style={{ padding: 28 }}>
              {profileMsg && (
                <div style={{
                  padding: "12px 16px", borderRadius: 10, marginBottom: 16, fontSize: 14,
                  background: profileMsg.type === "success" ? "rgba(5,150,105,0.08)" : "rgba(220,38,38,0.08)",
                  border: `1px solid ${profileMsg.type === "success" ? "rgba(5,150,105,0.2)" : "rgba(220,38,38,0.2)"}`,
                  color: profileMsg.type === "success" ? "#059669" : "#DC2626",
                }}>
                  {profileMsg.text}
                </div>
              )}

              {/* Asosiy ma'lumotlar */}
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>
                Shaxsiy ma'lumotlar
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
                {[
                  { label: "👤 To'liq ism", val: editName, set: setEditName, ph: "Ism Familiya", full: true },
                  { label: "📱 Telefon raqam", val: editPhone, set: setEditPhone, ph: "+998 90 123 45 67" },
                  { label: "🏫 Maktab/Muassasa", val: editSchool, set: setEditSchool, ph: "1-sonli maktab" },
                  { label: "📚 O'qitiladigan fan", val: editSubject, set: setEditSubject, ph: "Matematika" },
                  { label: "⏳ Ish tajribasi", val: editExp, set: setEditExp, ph: "5 yil" },
                ].map((f, i) => (
                  <div key={i} style={{ gridColumn: f.full ? "1 / -1" : "auto" }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", display: "block", marginBottom: 5 }}>{f.label}</label>
                    <input value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #E2E8F0", fontSize: 14, outline: "none", boxSizing: "border-box", background: "var(--bg)" }} />
                  </div>
                ))}
              </div>

              {/* Haqida */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", display: "block", marginBottom: 5 }}>📝 O'zingiz haqingizda</label>
                <textarea value={editAbout} onChange={e => setEditAbout(e.target.value)}
                  placeholder="Qisqacha o'zingiz haqingizda yozing..."
                  rows={3}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #E2E8F0", fontSize: 14, outline: "none", boxSizing: "border-box", background: "var(--bg)", resize: "vertical" }} />
              </div>

              {/* Parol o'zgartirish */}
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>
                Parolni o'zgartirish (ixtiyoriy)
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
                {[
                  { label: "🔒 Yangi parol", val: editPass, set: setEditPass, ph: "Yangi parol" },
                  { label: "🔒 Tasdiqlash", val: editPass2, set: setEditPass2, ph: "Qayta kiriting" },
                ].map((f, i) => (
                  <div key={i}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", display: "block", marginBottom: 5 }}>{f.label}</label>
                    <div style={{ position: "relative" }}>
                      <input type={showEditPass ? "text" : "password"} value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph}
                        style={{ width: "100%", padding: "10px 36px 10px 12px", borderRadius: 10, border: `1px solid ${f.val && editPass !== editPass2 && i === 1 ? "#FCA5A5" : "#E2E8F0"}`, fontSize: 14, outline: "none", boxSizing: "border-box", background: "var(--bg)" }} />
                      {i === 0 && (
                        <button type="button" onClick={() => setShowEditPass(p => !p)}
                          style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "var(--dim)" }}>
                          {showEditPass ? "🙈" : "👁"}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Statistika */}
              <div style={{ background: "var(--bg)", borderRadius: 14, padding: 16, marginBottom: 20, border: "1px solid #E2E8F0" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>
                  📊 Statistika
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                  {[
                    { icon: "👥", val: students.length, label: "Talabalar" },
                    { icon: "📊", val: results.length, label: "Topshirishlar" },
                    { icon: "⭐", val: results.length ? Math.round(results.reduce((a, b) => a + b.score, 0) / results.length) + "%" : "0%", label: "O'rtacha ball" },
                  ].map((s, i) => (
                    <div key={i} style={{ textAlign: "center", padding: "12px 8px", background: "var(--card)", borderRadius: 10, border: "1px solid #E2E8F0" }}>
                      <div style={{ fontSize: 22 }}>{s.icon}</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text)", fontFamily: "'Space Grotesk'" }}>{s.val}</div>
                      <div style={{ fontSize: 11, color: "var(--muted)" }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tugmalar */}
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={saveProfile} disabled={profileLoading}
                  style={{
                    flex: 1, padding: "13px", borderRadius: 12, border: "none",
                    background: profileLoading ? "#E2E8F0" : "linear-gradient(135deg, #2563EB, #059669)",
                    color: profileLoading ? "#94A3B8" : "white",
                    fontWeight: 700, fontSize: 15, cursor: profileLoading ? "not-allowed" : "pointer",
                    boxShadow: profileLoading ? "none" : "0 4px 12px rgba(37,99,235,0.25)"
                  }}>
                  {profileLoading ? "⏳ Saqlanmoqda..." : "💾 Saqlash"}
                </button>
                <button onClick={() => setShowProfile(false)}
                  style={{ padding: "13px 20px", borderRadius: 12, border: "1px solid #E2E8F0", background: "var(--bg)", color: "var(--muted)", fontWeight: 600, cursor: "pointer" }}>
                  Yopish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== TALABA DETALLARI MODALI ===== */}
      {statsSelectedStudent && (() => {
        const catConfig = {
          alo: { title: "A'lochi talaba", color: "#10B981", bg: "linear-gradient(135deg, #34D399, #059669)" },
          yaxshi: { title: "Yaxshi talaba", color: "#3B82F6", bg: "linear-gradient(135deg, #60A5FA, #2563EB)" },
          qoniqarli: { title: "Qoniqarli talaba", color: "#F59E0B", bg: "linear-gradient(135deg, #FCD34D, #D97706)" },
          past: { title: "Yordam kerak", color: "#EF4444", bg: "linear-gradient(135deg, #FCA5A5, #DC2626)" },
          boshlamagan: { title: "Hali dars boshlamagan", color: "var(--muted)", bg: "linear-gradient(135deg, #94A3B8, #475569)" }
        };
        const config = catConfig[statsSelectedStudent.category] || catConfig.boshlamagan;

        // Grouping student results by subject
        const studentClass = statsSelectedStudent.class_name || "";
        const defaultClassFans = studentClass.startsWith("1") ? FANS_1KURS : (studentClass.startsWith("7") ? FANS_7 : FANS);
        const allClassSubjects = [...defaultClassFans, ...statsSelectedStudentSubjects];

        const subjectsData = allClassSubjects.map(sub => {
          const subResults = statsSelectedStudent.results.filter(r => {
            const matchesId = r.fan_id === sub.id;
            const matchesName = r.fan_name?.toLowerCase().trim() === sub.name?.toLowerCase().trim();
            return matchesId || matchesName;
          });

          const count = subResults.length;
          const avg = count ? Math.round(subResults.reduce((sum, r) => sum + r.score, 0) / count) : null;
          
          return {
            ...sub,
            results: subResults,
            count,
            avg
          };
        });

        // Collect any results that didn't match any subject in allClassSubjects
        const matchedResultIds = new Set();
        subjectsData.forEach(sd => sd.results.forEach(r => matchedResultIds.add(r.id || `${r.topic_id}_${r.created_at}`)));
        
        const unmatchedResults = statsSelectedStudent.results.filter(r => {
          const id = r.id || `${r.topic_id}_${r.created_at}`;
          return !matchedResultIds.has(id);
        });

        if (unmatchedResults.length > 0) {
          const count = unmatchedResults.length;
          const avg = Math.round(unmatchedResults.reduce((sum, r) => sum + r.score, 0) / count);
          subjectsData.push({
            id: "other",
            name: "Boshqa fanlar",
            icon: "📚",
            color: "var(--muted)",
            results: unmatchedResults,
            count,
            avg
          });
        }

        
        return (
          <div style={{
            position: "fixed", inset: 0, background: "rgba(15,23,42,0.7)",
            backdropFilter: "blur(6px)", display: "flex", alignItems: "center",
            justifyContent: "center", zIndex: 10000, padding: 20
          }}>
            <div style={{
              background: "var(--card)", borderRadius: 24, width: "100%", maxWidth: 650,
              maxHeight: "90vh", overflowY: "auto",
              boxShadow: "0 32px 64px rgba(0,0,0,0.25)"
            }}>
              {/* Header */}
              <div style={{
                background: config.bg,
                borderRadius: "24px 24px 0 0", padding: "24px 28px",
                display: "flex", justifyContent: "space-between", alignItems: "center",
                position: "relative"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: 16,
                    background: "rgba(255,255,255,0.2)",
                    border: "2px solid rgba(255,255,255,0.4)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 900, fontSize: 24, color: "white"
                  }}>
                    {statsSelectedStudent.full_name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <div style={{ color: "white", fontWeight: 800, fontSize: 18 }}>{statsSelectedStudent.full_name}</div>
                    <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                      <span>@{statsSelectedStudent.username}</span>
                      <span>•</span>
                      <span>{statsSelectedStudent.class_name}-kurs</span>
                      <span>•</span>
                      <span style={{ background: "rgba(255,255,255,0.2)", padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 700 }}>{config.title}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setStatsSelectedStudent(null)} style={{
                  background: "rgba(255,255,255,0.15)", border: "none", color: "white",
                  width: 36, height: 36, borderRadius: "50%", cursor: "pointer", fontSize: 18,
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>✕</button>
              </div>

              <div style={{ padding: 28 }}>
                {/* Stats cards grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
                  {[
                    { label: "O'rtacha Ball", val: statsSelectedStudent.avgScore !== null ? `${statsSelectedStudent.avgScore}%` : "-", color: config.color },
                    { label: "Topshirishlar", val: `${statsSelectedStudent.totalSubmissions} ta`, color: "var(--muted)" },
                    { label: "Eng yuqori ball", val: statsSelectedStudent.maxScore !== null ? `${statsSelectedStudent.maxScore}%` : "-", color: "#10B981" },
                    { label: "Eng past ball", val: statsSelectedStudent.minScore !== null ? `${statsSelectedStudent.minScore}%` : "-", color: "#EF4444" }
                  ].map((metric, i) => (
                    <div key={i} style={{ background: "var(--bg)", border: "1px solid #E2E8F0", padding: 12, borderRadius: 12, textAlign: "center" }}>
                      <div style={{ fontSize: 11, color: "var(--dim)", fontWeight: 600, marginBottom: 4 }}>{metric.label}</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: metric.color }}>{metric.val}</div>
                    </div>
                  ))}
                </div>

                {/* Fanlar kesimida o'zlashtirish tahlili (Accordion ko'rinishida) */}
                <div style={{ marginBottom: 20 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 800, color: "var(--text)", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>
                    📚 Fanlar kesimida o'zlashtirish tahlili
                  </h3>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 350, overflowY: "auto", paddingRight: 4 }}>
                    {subjectsData.map((sub, sIdx) => {
                      const isExpanded = statsSelectedSubjectId === sub.id;
                      const hasSubmissions = sub.count > 0;
                      
                      // Progress bar rangini o'rtacha ballga ko'ra belgilash
                      const barColor = sub.avg !== null
                        ? (sub.avg >= 86 ? "#10B981" : sub.avg >= 71 ? "#3B82F6" : sub.avg >= 55 ? "#F59E0B" : "#EF4444")
                        : "#94A3B8";

                      return (
                        <div key={sub.id} style={{
                          background: "var(--card)", borderRadius: 14, border: `1px solid ${isExpanded ? sub.color : "#E2E8F0"}`,
                          boxShadow: isExpanded ? "0 4px 12px rgba(0,0,0,0.05)" : "none",
                          transition: "all 0.2s", overflow: "hidden"
                        }}>
                          {/* Accordion Sarlavhasi */}
                          <div
                            onClick={() => setStatsSelectedSubjectId(isExpanded ? null : sub.id)}
                            style={{
                              padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between",
                              cursor: "pointer", background: isExpanded ? `${sub.color}08` : "white",
                              userSelect: "none"
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              <span style={{ fontSize: 22 }}>{sub.icon}</span>
                              <div>
                                <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>{sub.name}</div>
                                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                                  {hasSubmissions ? `${sub.count} ta topshiriq topshirilgan` : "Topshiriq topshirilmagan"}
                                </div>
                              </div>
                            </div>
                            
                            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                              <div style={{ textAlign: "right" }}>
                                <div style={{
                                  fontSize: 15, fontWeight: 900,
                                  color: sub.avg !== null ? barColor : "#94A3B8"
                                }}>
                                  {sub.avg !== null ? `${sub.avg}%` : "-"}
                                </div>
                                {sub.avg !== null && (
                                  <div style={{ width: 50, height: 4, background: "var(--surface)", borderRadius: 2, marginTop: 4, overflow: "hidden" }}>
                                    <div style={{ width: `${sub.avg}%`, height: "100%", background: barColor, borderRadius: 2 }} />
                                  </div>
                                )}
                              </div>
                              <span style={{ fontSize: 12, color: "var(--dim)" }}>{isExpanded ? "▲" : "▼"}</span>
                            </div>
                          </div>

                          {/* Accordion Content (Fanga oid topshirilgan mavzular) */}
                          {isExpanded && (
                            <div style={{ padding: "12px 18px", background: "var(--surface)", borderTop: "1px solid #E2E8F0" }}>
                              {!hasSubmissions ? (
                                <div style={{ padding: 12, textAlign: "center", color: "var(--dim)", fontSize: 12, fontStyle: "italic" }}>
                                  Talaba ushbu fandan hali birorta ham dars yoki test topshirmagan.
                                </div>
                              ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                  {sub.results.map((r, rIdx) => {
                                    const resultKey = `${r.topic_id}_${r.created_at}_${rIdx}`;
                                    const isResultExpanded = statsExpandedResult === resultKey;
                                    const scoreColor = r.score >= 86 ? "#10B981" : r.score >= 71 ? "#3B82F6" : r.score >= 55 ? "#F59E0B" : "#EF4444";
                                    
                                    return (
                                      <div key={resultKey} style={{ background: "var(--card)", borderRadius: 10, border: "1px solid #E2E8F0", overflow: "hidden" }}>
                                        {/* Mavzu qatori */}
                                        <div
                                          onClick={() => setStatsExpandedResult(isResultExpanded ? null : resultKey)}
                                          style={{
                                            padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between",
                                            cursor: "pointer", background: isResultExpanded ? "#F8FAFC" : "white"
                                          }}
                                        >
                                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                            <div style={{ fontSize: 14 }}>📝</div>
                                            <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text)" }}>{r.topic_name}</div>
                                          </div>
                                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                            <span style={{ padding: "2px 8px", borderRadius: 6, background: `${scoreColor}15`, color: scoreColor, fontWeight: 700, fontSize: 12 }}>
                                              {r.score}%
                                            </span>
                                            <span style={{ fontSize: 10, color: "var(--dim)" }}>
                                              {new Date(r.created_at).toLocaleDateString("uz-UZ")}
                                            </span>
                                            <span style={{ fontSize: 10, color: "var(--dim)" }}>{isResultExpanded ? "▲" : "▼"}</span>
                                          </div>
                                        </div>

                                        {/* Collapsible details for topic */}
                                        {isResultExpanded && (
                                          <div style={{ padding: 12, borderTop: "1px solid #E2E8F0", background: "var(--surface)" }}>
                                            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", marginBottom: 6, textTransform: "uppercase" }}>
                                              📋 Javoblar va topshiriq tafsilotlari
                                            </div>
                                            {r.transcript ? (
                                              <div style={{
                                                background: "var(--surface)", padding: 10, borderRadius: 6,
                                                fontSize: 12, color: "var(--text)", fontFamily: "monospace",
                                                maxHeight: 150, overflowY: "auto", whiteSpace: "pre-wrap"
                                              }}>
                                                {r.transcript}
                                              </div>
                                            ) : (
                                              <div style={{ fontSize: 11, color: "var(--dim)", fontStyle: "italic" }}>
                                                Batafsil topshiriq tafsilotlari mavjud emas.
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>


                {/* Footer Buttons */}
                <div style={{ display: "flex", gap: 10, marginTop: 28 }}>
                  <button
                    onClick={() => {
                      setStatsSelectedStudent(null);
                      // Tizimdagi "Talabalar" tabiga o'tkazib parolni o'zgartirish oson bo'lishi uchun
                      setTab("students");
                      setSearchQ(statsSelectedStudent.full_name);
                    }}
                    style={{
                      flex: 1, padding: "12px", borderRadius: 12, border: "1px solid #CBD5E1",
                      background: "var(--card)", color: "var(--muted)", fontWeight: 700, fontSize: 14, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8
                    }}
                  >
                    🔑 Parolni o'zgartirish
                  </button>
                  <button onClick={() => setStatsSelectedStudent(null)} style={{
                    padding: "12px 24px", borderRadius: 12, border: "none",
                    background: "linear-gradient(135deg, #1E293B, #475569)", color: "white",
                    fontWeight: 700, fontSize: 14, cursor: "pointer"
                  }}>
                    Yopish
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
      {/* ===== MAVZUNi TAHRIRLASH MODALI ===== */}
      {editingTopic && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(15,23,42,0.6)", backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
          padding: 20
        }}>
          <div style={{
            background: "var(--card)", borderRadius: 24, width: "100%", maxWidth: 900,
            maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden",
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)"
          }}>
            {/* Modal Sarlavhasi */}
            <div style={{
              padding: "20px 24px", borderBottom: "1px solid #E2E8F0",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: "linear-gradient(135deg, #1E293B, #0F172A)", color: "white"
            }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.8, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  {selectedSubject?.icon} {selectedSubject?.name} — DARS TAHRIRLASH
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, marginTop: 2 }}>{editTopName || "Mavzu nomi yozilmagan"}</div>
              </div>
              <button onClick={() => setEditingTopic(null)}
                style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "white", width: 32, height: 32, borderRadius: "50%", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>
                ✕
              </button>
            </div>

            {/* Tab Bar */}
            <div style={{ display: "flex", background: "var(--surface)", padding: "6px 12px", borderBottom: "1px solid #E2E8F0", gap: 6 }}>
              {[
                { id: "kirish", label: "🎯 Kirish (Ma'ruza)" },
                { id: "lab", label: "🧪 Lab (Laboratoriya)" },
                { id: "mashq", label: "✍️ Mashq (Amaliyot)" },
                { id: "quiz", label: "❓ Test (Quiz)" },
                { id: "vazifa", label: "📋 Uy vazifasi" },
                { id: "video", label: "🎬 Video" }
              ].map(tab => (
                <button key={tab.id}
                  onClick={() => setActiveEditTab(tab.id)}
                  style={{
                    padding: "8px 16px", borderRadius: 10, border: "none",
                    background: activeEditTab === tab.id ? "white" : "transparent",
                    color: activeEditTab === tab.id ? "#2563EB" : "#475569",
                    fontWeight: 700, fontSize: 13, cursor: "pointer",
                    boxShadow: activeEditTab === tab.id ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                    transition: "all 0.15s"
                  }}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Kontenti */}
            <div style={{ padding: 24, overflowY: "auto", flex: 1, background: "var(--bg)" }}>
              {activeEditTab === "kirish" && (
                <div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 6 }}>Mavzu nomi</label>
                    <input value={editTopName} onChange={e => setEditTopName(e.target.value)}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 6 }}>Ma'ruza matni</label>
                    <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                      {/* Word Upload */}
                      <input type="file" id="wordUploadLecture" accept=".docx,.doc" style={{ display: "none" }}
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) handleUploadWordToLecture(file);
                          e.target.value = "";
                        }} />
                      <button type="button" onClick={() => document.getElementById("wordUploadLecture").click()}
                        style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #CBD5E1", background: "var(--card)", color: "var(--muted)", fontWeight: 600, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                        📄 Word hujjatdan o'qish
                      </button>

                      {/* AI Writer */}
                      <button type="button" onClick={handleGenerateLectureAI} disabled={apiLoading}
                        style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #7C3AED, #2563EB)", color: "white", fontWeight: 600, fontSize: 12, cursor: apiLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                        {apiLoading ? "⏳ Generatsiya qilinmoqda..." : "✨ AI orqali yozdirish"}
                      </button>
                    </div>
                    
                    <textarea value={editTopLecture} onChange={e => setEditTopLecture(e.target.value)} rows={12}
                      placeholder="Mavzu bo'yicha nazariy ma'lumotlarni yozing..."
                      style={{ width: "100%", padding: "12px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 14, outline: "none", boxSizing: "border-box", resize: "vertical", background: "var(--card)", lineHeight: 1.6 }} />
                  </div>
                </div>
              )}

              {activeEditTab === "lab" && (
                <div>
                  {/* Lab turi - O'qituvchi bemalol o'zgartira oladi */}
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 6 }}>Lab turi</label>
                    <select value={editTopLabType} onChange={e => setEditTopLabType(e.target.value)}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 14, outline: "none", background: "var(--card)" }}>
                      <option value="none">Yo'q</option>
                      <option value="3d">3D laboratoriya</option>
                      <option value="simulation">Simulyatsiya</option>
                      <option value="html">Custom HTML amaliyot (Fayldan yuklash)</option>
                    </select>
                  </div>

                  {/* Custom HTML practice file upload & code editor - FAQAT SHU QISMI ADMIN PAROL BILAN HIMOYA QILINGAN */}
                  {editTopLabType === "html" && (
                    <div>
                      {!isAdminUnlocked ? (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "30px 20px", textAlign: "center", background: "var(--surface)", borderRadius: 12, border: "1px solid #E2E8F0" }}>
                          <span style={{ fontSize: 36, marginBottom: 10 }}>🔒</span>
                          <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text)", marginBottom: 4 }}>Taqiqlangan bo'lim</div>
                          <div style={{ fontSize: 12, color: "var(--muted)", maxWidth: 400, marginBottom: 16, lineHeight: 1.6 }}>
                            HTML laboratoriya fayllarini yuklash va tahrirlash uchun admin parolini kiriting.
                          </div>
                          <div style={{ display: "flex", gap: 8, maxWidth: 300, width: "100%" }}>
                            <input type="password" value={adminPasswordInput} onChange={e => setAdminPasswordInput(e.target.value)}
                              onKeyDown={handlePasswordKeyDown} placeholder="Parolni kiriting..."
                              style={{ flex: 1, padding: "8px 12px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 13, outline: "none" }} />
                            <button type="button" onClick={handleUnlockAdmin}
                              style={{ padding: "8px 16px", borderRadius: 10, border: "none", background: "#2563EB", color: "white", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                              Kirish
                            </button>
                          </div>
                          {passwordError && (
                            <div style={{ color: "#DC2626", fontSize: 12, fontWeight: 600, marginTop: 10 }}>{passwordError}</div>
                          )}
                        </div>
                      ) : (
                        <div style={{ background: "rgba(5,150,105,0.04)", border: "1px solid rgba(5,150,105,0.12)", borderRadius: 12, padding: 16, animation: "fadeIn 0.3s ease-in-out" }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#059669", marginBottom: 6 }}>📤 HTML Lab faylini yuklash</div>
                          <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 12 }}>
                            Dars laboratoriyasi uchun tayyorlagan `.html` interaktiv darsingizni yuklang.
                          </div>
                          
                          <input type="file" id="uploadLabHtml" accept=".html,.htm" style={{ display: "none" }}
                            onChange={async (e) => {
                              const file = e.target.files[0];
                              if (file) {
                                try {
                                  const text = await file.text();
                                  setEditTopLabHtml(text);
                                  alert("HTML Lab fayli muvaffaqiyatli yuklandi!");
                                } catch (err) {
                                  alert("Faylni o'qishda xato: " + err.message);
                                }
                              }
                              e.target.value = "";
                            }} />
                          <button type="button" onClick={() => document.getElementById("uploadLabHtml").click()}
                            style={{
                              padding: "9px 18px", borderRadius: 8, border: "none",
                              background: "linear-gradient(135deg, #059669, #10B981)", color: "white",
                              fontWeight: 700, fontSize: 12, cursor: "pointer", marginBottom: 16
                            }}>
                            📄 HTML Lab faylini tanlash
                          </button>

                          <div>
                            <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 6 }}>HTML Kod (Lab)</label>
                            <textarea value={editTopLabHtml} onChange={e => setEditTopLabHtml(e.target.value)} rows={10}
                              placeholder="<html>...</html>"
                              style={{ width: "100%", padding: "12px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 13, fontFamily: "monospace", outline: "none", boxSizing: "border-box", resize: "vertical", background: "#1E293B", color: "#F8FAFC" }} />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeEditTab === "mashq" && (
                <div>
                  {!isAdminUnlocked ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "30px 20px", textAlign: "center", background: "var(--surface)", borderRadius: 12, border: "1px solid #E2E8F0" }}>
                      <span style={{ fontSize: 36, marginBottom: 10 }}>🔒</span>
                      <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text)", marginBottom: 4 }}>Taqiqlangan bo'lim</div>
                      <div style={{ fontSize: 12, color: "var(--muted)", maxWidth: 400, marginBottom: 16, lineHeight: 1.6 }}>
                        Amaliy mashq HTML fayllarini yuklash va tahrirlash uchun admin parolini kiriting.
                      </div>
                      <div style={{ display: "flex", gap: 8, maxWidth: 300, width: "100%" }}>
                        <input type="password" value={adminPasswordInput} onChange={e => setAdminPasswordInput(e.target.value)}
                          onKeyDown={handlePasswordKeyDown} placeholder="Parolni kiriting..."
                          style={{ flex: 1, padding: "8px 12px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 13, outline: "none" }} />
                        <button type="button" onClick={handleUnlockAdmin}
                          style={{ padding: "8px 16px", borderRadius: 10, border: "none", background: "#2563EB", color: "white", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                          Kirish
                        </button>
                      </div>
                      {passwordError && (
                        <div style={{ color: "#DC2626", fontSize: 12, fontWeight: 600, marginTop: 10 }}>{passwordError}</div>
                      )}
                    </div>
                  ) : (
                    <div style={{ background: "rgba(217,119,6,0.04)", border: "1px solid rgba(217,119,6,0.12)", borderRadius: 12, padding: 16, animation: "fadeIn 0.3s ease-in-out" }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#D97706", marginBottom: 6 }}>📤 HTML Mashq faylini yuklash</div>
                      <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 12 }}>
                        Dars amaliyoti (Mashq) uchun tayyorlagan `.html` interaktiv o'yiningizni yuklang.
                      </div>
                      
                      <input type="file" id="uploadPracticeHtml" accept=".html,.htm" style={{ display: "none" }}
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (file) {
                            try {
                              const text = await file.text();
                              setEditTopPracticeHtml(text);
                              alert("HTML Mashq fayli muvaffaqiyatli yuklandi!");
                            } catch (err) {
                              alert("Faylni o'qishda xato: " + err.message);
                            }
                          }
                          e.target.value = "";
                        }} />
                      <button type="button" onClick={() => document.getElementById("uploadPracticeHtml").click()}
                        style={{
                          padding: "9px 18px", borderRadius: 8, border: "none",
                          background: "linear-gradient(135deg, #D97706, #F59E0B)", color: "white",
                          fontWeight: 700, fontSize: 12, cursor: "pointer", marginBottom: 16
                        }}>
                        📄 HTML Mashq faylini tanlash
                      </button>

                      <div>
                        <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 6 }}>HTML Kod (Mashq)</label>
                        <textarea value={editTopPracticeHtml} onChange={e => setEditTopPracticeHtml(e.target.value)} rows={10}
                          placeholder="<html>...</html>"
                          style={{ width: "100%", padding: "12px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 13, fontFamily: "monospace", outline: "none", boxSizing: "border-box", resize: "vertical", background: "#1E293B", color: "#F8FAFC" }} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeEditTab === "quiz" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--muted)" }}>Test savollari ({editTopQuiz.length} ta)</div>
                    <button type="button" onClick={handleAddQuestionToEdit}
                      style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "#2563EB", color: "white", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                      ➕ Yangi savol qo'shish
                    </button>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {editTopQuiz.map((q, index) => (
                      <div key={index} style={{ background: "var(--card)", borderRadius: 14, padding: 16, border: "1px solid #E2E8F0", position: "relative" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                          <span style={{ fontSize: 13, fontWeight: 800, color: "#2563EB" }}>Savol #{index + 1}</span>
                          <button type="button" onClick={() => handleDeleteQuestionInEdit(index)}
                            style={{ background: "transparent", border: "none", color: "#DC2626", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                            🗑 O'chirish
                          </button>
                        </div>
                        
                        <div style={{ marginBottom: 10 }}>
                          <label style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", display: "block", marginBottom: 4 }}>Savol matni</label>
                          <input value={q.q} onChange={e => handleUpdateQuestionInEdit(index, "q", e.target.value)}
                            style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 13 }} />
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                          <div>
                            <label style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", display: "block", marginBottom: 4 }}>Variant A (To'g'ri javob)</label>
                            <input value={q.a} onChange={e => handleUpdateQuestionInEdit(index, "a", e.target.value)}
                              style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 13 }} />
                          </div>
                          <div>
                            <label style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", display: "block", marginBottom: 4 }}>Variant B</label>
                            <input value={q.b} onChange={e => handleUpdateQuestionInEdit(index, "b", e.target.value)}
                              style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 13 }} />
                          </div>
                          <div>
                            <label style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", display: "block", marginBottom: 4 }}>Variant C</label>
                            <input value={q.c} onChange={e => handleUpdateQuestionInEdit(index, "c", e.target.value)}
                              style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 13 }} />
                          </div>
                          <div>
                            <label style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", display: "block", marginBottom: 4 }}>Variant D</label>
                            <input value={q.d} onChange={e => handleUpdateQuestionInEdit(index, "d", e.target.value)}
                              style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 13 }} />
                          </div>
                        </div>

                        <div>
                          <label style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", display: "block", marginBottom: 4 }}>To'g'ri javob varianti</label>
                          <select value={q.ok || "a"} onChange={e => handleUpdateQuestionInEdit(index, "ok", e.target.value)}
                            style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 13, background: "var(--card)" }}>
                            <option value="a">Variant A</option>
                            <option value="b">Variant B</option>
                            <option value="c">Variant C</option>
                            <option value="d">Variant D</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeEditTab === "vazifa" && (
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 6 }}>Uy vazifasi topshirig'i matni</label>
                  <textarea value={editTopHomework} onChange={e => setEditTopHomework(e.target.value)} rows={8}
                    placeholder="Talabalar bajarishi kerak bo'lgan uy vazifasini yozing..."
                    style={{ width: "100%", padding: "12px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 14, outline: "none", boxSizing: "border-box", resize: "vertical", background: "var(--card)", lineHeight: 1.6 }} />
                </div>
              )}

              {activeEditTab === "video" && (
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 6 }}>Mavzuga oid video so'rov yoki link</label>
                  <input value={editTopVideoQuery} onChange={e => setEditTopVideoQuery(e.target.value)}
                    placeholder="Masalan: Nyuton qonunlari fizika dars yoki YouTube linki"
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 8, lineHeight: 1.6 }}>
                    Ushbu so'rov orqali talabaga YouTube-dan video darslar izlab ko'rsatiladi. Xohlasangiz tayyor videoning to'liq linkini kiritishingiz ham mumkin.
                  </div>
                </div>
              )}
            </div>

            {/* Modal Pastki Qismi (Buttons) */}
            <div style={{ padding: "16px 24px", borderTop: "1px solid #E2E8F0", display: "flex", justifyContent: "flex-end", gap: 12, background: "var(--surface)" }}>
              <button type="button" onClick={() => setEditingTopic(null)}
                style={{ padding: "10px 20px", borderRadius: 10, border: "1px solid #CBD5E1", background: "var(--card)", color: "var(--muted)", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                Bekor qilish
              </button>
              <button type="button" onClick={handleSaveEditedTopic}
                style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #2563EB, #059669)", color: "white", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                💾 O'zgarishlarni saqlash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
