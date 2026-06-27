export const algebraTopics = [
  { 
    id: 501, name: "Trigonometrik funksiyalar va ularning formulalari", status: "completed",
    hook: "Sinus va Kosinus yordamida to'lqinlarni qanday tasvirlaymiz?",
    aiIntro: `Assalomu alaykum! Bugun biz trigonometriya dunyosiga chuqurroq kiramiz. Davriy funksiyalar va ularning hayotdagi tatbiqlarini ko'rib chiqamiz.`,
    videoUrl: "https://www.youtube.com/embed/_O_Zay0vQk0",
    quiz: [
      { q: "sin²(x) + cos²(x) nimaga teng?", opts: ["0", "1", "-1", "2"], correct: 1 },
      { q: "sin(0°) = ?", opts: ["1", "0", "-1", "1/2"], correct: 1 },
      { q: "cos(90°) = ?", opts: ["1", "-1", "0", "1/2"], correct: 2 },
      { q: "tan(x) = ?", opts: ["sin(x)*cos(x)", "sin(x)/cos(x)", "cos(x)/sin(x)", "1/sin(x)"], correct: 1 },
      { q: "Trigonometrik funksiyalarning davri qancha?", opts: ["π", "2π", "π/2", "3π"], correct: 1 }
    ]
  },
  { 
    id: 502, name: "Hosila va uning tatbiqlari", status: "current", 
    aiIntro: "Funksiya o'zgarish tezligini aniqlash.",
    quiz: [
      { q: "x^n ning hosilasi?", opts: ["x^(n-1)", "n*x^(n-1)", "n*x^n", "x^(n+1)"], correct: 1 },
      { q: "Hosila geometrik jihatdan nimani ifodalaydi?", opts: ["Yuzani", "Urinma qiyaligini", "Uzunlikni", "Hajmni"], correct: 1 },
      { q: "e^x ning hosilasi?", opts: ["x*e^(x-1)", "e^x", "e^(x-1)", "x*e^x"], correct: 1 },
      { q: "Funksiya o'sish shartini hosila orqali qanday aniqlash mumkin?", opts: ["f'(x) < 0", "f'(x) = 0", "f'(x) > 0", "f'(x) ≥ 1"], correct: 2 },
      { q: "Mahalliy minimum nuqtasida hosila qanday?", opts: ["Musbat", "Manfiy", "Nolga teng", "Aniqlanmagan"], correct: 2 }
    ]
  },
  { 
    id: 503, name: "Funksiyaning ekstremumlari", status: "current", 
    aiIntro: "Maksimal va minimal qiymatlarni topish.",
    quiz: [
      { q: "Ekstremum nuqtasida hosila qanday?", opts: ["Musbat", "Manfiy", "Nolga teng", "Cheksiz"], correct: 2 },
      { q: "Mahalliy maksimum qanday aniqlanadi?", opts: ["f'(x) = 0 va f''(x) > 0", "f'(x) = 0 va f''(x) < 0", "f'(x) > 0", "f'(x) < 0"], correct: 1 },
      { q: "Mahalliy minimum qanday aniqlanadi?", opts: ["f'(x) = 0 va f''(x) < 0", "f'(x) = 0 va f''(x) > 0", "f'(x) > 0", "f'(x) < 0"], correct: 1 },
      { q: "Infleksiya nuqtasi nima?", opts: ["Maksimum nuqtasi", "Minimum nuqtasi", "Egrilik yo'nalishi o'zgaradigan nuqta", "Nol nuqtasi"], correct: 2 },
      { q: "f(x) = x² - 4x + 3 funksiyasining minimumi qayerda?", opts: ["x = 0", "x = 2", "x = 3", "x = -2"], correct: 1 }
    ]
  },
  { 
    id: 504, name: "Integral va yuzalarni hisoblash", status: "current", 
    aiIntro: "Egri chiziqli trapetsiya yuzasi.",
    quiz: [
      { q: "∫x² dx = ?", opts: ["2x", "x³/3 + C", "x²/2 + C", "3x³ + C"], correct: 1 },
      { q: "Aniq integral nima hisoblaydi?", opts: ["Hosilani", "Egri chiziq ostidagi yuzani", "Tezlikni", "Burchakni"], correct: 1 },
      { q: "∫1 dx = ?", opts: ["0", "x + C", "1 + C", "x²"], correct: 1 },
      { q: "Nyuton-Leybnits formulasi: ∫(a dan b gacha) f(x)dx = ?", opts: ["F(a) - F(b)", "F(b) - F(a)", "F(a) + F(b)", "F(b) * F(a)"], correct: 1 },
      { q: "∫e^x dx = ?", opts: ["e^(x-1) + C", "x*e^x + C", "e^x + C", "e^(x+1) + C"], correct: 2 }
    ]
  },
  { 
    id: 505, name: "Ko'rsatkichli funksiyalar", status: "current", 
    aiIntro: "Darajali o'sish qonuniyatlari.",
    quiz: [
      { q: "a^m * a^n = ?", opts: ["a^(m-n)", "a^(m*n)", "a^(m+n)", "a^(m/n)"], correct: 2 },
      { q: "a^0 = ?", opts: ["0", "a", "1", "Aniqlanmagan"], correct: 2 },
      { q: "(a^m)^n = ?", opts: ["a^(m+n)", "a^(m-n)", "a^(m*n)", "a^(m/n)"], correct: 2 },
      { q: "a^(-n) = ?", opts: ["a^n", "-a^n", "1/a^n", "a/n"], correct: 2 },
      { q: "Ko'rsatkichli funksiya y = 2^x da x = 3 bo'lsa, y = ?", opts: ["6", "8", "9", "16"], correct: 1 }
    ]
  },
  { 
    id: 506, name: "Logarifmik funksiyalar va xossalari", status: "current", 
    aiIntro: "Logarifm tushunchasi va formulalari.",
    quiz: [
      { q: "log_a(a^n) = ?", opts: ["a", "1", "n", "0"], correct: 2 },
      { q: "log_a(1) = ?", opts: ["1", "a", "0", "Aniqlanmagan"], correct: 2 },
      { q: "log(a*b) = ?", opts: ["log(a) * log(b)", "log(a) + log(b)", "log(a) - log(b)", "log(a/b)"], correct: 1 },
      { q: "log₂(8) = ?", opts: ["2", "4", "3", "8"], correct: 2 },
      { q: "Logarifm asosi qanday bo'lishi kerak?", opts: ["Istalgan son", "Musbat va 1 ga teng bo'lmagan", "Faqat natural son", "Faqat 10"], correct: 1 }
    ]
  },
  { 
    id: 507, name: "Tenglamalar va tengsizliklar sistemalari", status: "current", 
    aiIntro: "Murakkab sistemalarni yechish usullari.",
    quiz: [
      { q: "Ikki noma'lumli chiziqli tenglama sistemasini yechish usullari?", opts: ["Faqat grafik usul", "Qo'shish, almashtirish, grafik usullari", "Faqat almashtirish usuli", "Faqat matritsa usuli"], correct: 1 },
      { q: "Tengsizlikni ko'paytganda manfiy songa bo'lganda nima o'zgaradi?", opts: ["Hech narsa", "Tengsizlik belgisi o'zgaradi", "Tengsizlik nolga teng bo'ladi", "Tengsizlik yo'qoladi"], correct: 1 },
      { q: "x² > 4 tengsizligining yechimi?", opts: ["x > 2", "x < -2", "x > 2 yoki x < -2", "-2 < x < 2"], correct: 2 },
      { q: "Sistemaning yechimi yo'q bo'lsa, bu nima deyiladi?", opts: ["Mos sistema", "Qarama-qarshi sistema", "Noaniq sistema", "Chiziqli sistema"], correct: 1 },
      { q: "|x| < 3 tengsizligining yechimi?", opts: ["x > 3", "x < -3", "-3 < x < 3", "x > 3 yoki x < -3"], correct: 2 }
    ]
  },
  { 
    id: 508, name: "Kombinatorika elementlari", status: "current", 
    aiIntro: "O'rinlashtirish va guruhlash qoidalari.",
    quiz: [
      { q: "4! = ?", opts: ["8", "16", "24", "12"], correct: 2 },
      { q: "C(6,2) = ?", opts: ["12", "15", "30", "36"], correct: 1 },
      { q: "O'rinlashtirish P(n) = ?", opts: ["n²", "n!", "2n", "n/2"], correct: 1 },
      { q: "Joylashtirishlar soni A(n,k) = ?", opts: ["n!/k!", "n!/(n-k)!", "k!/(n-k)!", "n!/(k!(n-k)!)"], correct: 1 },
      { q: "5 ta kitobni javonga necha xil usulda joylashtirish mumkin?", opts: ["25", "60", "120", "720"], correct: 2 }
    ]
  }
];
