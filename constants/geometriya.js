export const geometriyaTopics = [
  { 
    id: 601, name: "Stereometriya aksiomalari va natijalar", status: "completed",
    hook: "Nega uch oyoqli stul hech qachon qimirlamaydi?",
    aiIntro: `Xush kelibsiz! Biz endi tekislikdan fazoga (3D) chiqamiz. Stereometriya - bu fazoviy shakllar haqidagi fan.`,
    videoUrl: "https://www.youtube.com/embed/5U9uP6on7X8",
    quiz: [
      { q: "Tekislikni aniqlash uchun nechta nuqta kerak?", opts: ["1", "2", "3", "4"], correct: 2 },
      { q: "Fazoda ikki to'g'ri chiziq qanday joylashishi mumkin?", opts: ["Faqat parallel", "Kesishuvchi, parallel yoki ayqash", "Faqat kesishuvchi", "Faqat ayqash"], correct: 1 },
      { q: "Ayqash to'g'ri chiziqlar nima?", opts: ["Bir tekislikda bo'lmagan, kesishmaydigan to'g'ri chiziqlar", "Parallel to'g'ri chiziqlar", "Kesishuvchi to'g'ri chiziqlar", "Bir nuqtada kesishuvchi chiziqlar"], correct: 0 },
      { q: "Stereometriyaning asosiy aksiomasiga ko'ra uch nuqta...", opts: ["Har doim bir to'g'ri chiziqda", "Bir tekislikni aniqlaydi (agar bir to'g'ri chiziqda bo'lmasa)", "Fazoda erkin joylashadi", "Doim uchburchak hosil qiladi"], correct: 1 },
      { q: "Tekislik va to'g'ri chiziq qanday joylashishi mumkin?", opts: ["Faqat kesishadi", "Kesishadi, parallel yoki tekislikda yotadi", "Faqat parallel", "Faqat tekislikda yotadi"], correct: 1 }
    ]
  },
  { 
    id: 602, name: "Fazoda to'g'ri chiziq va tekisliklar parallelizmi", status: "current", 
    aiIntro: "Parallel va ayqash to'g'ri chiziqlar.",
    quiz: [
      { q: "Ikki tekislik parallel bo'lishi uchun shart?", opts: ["Bir nuqtada kesishmasligi", "Ikkita kesishuvchi to'g'ri chiziqlar parallel bo'lishi", "Bir xil yo'nalishda bo'lishi", "Bir-biriga tegmasligi"], correct: 1 },
      { q: "To'g'ri chiziq tekislikka parallel bo'lishi uchun?", opts: ["Tekislikda yotmasligi va tekislikdagi biror chiziqqa parallel bo'lishi", "Faqat tekislikda yotmasligi", "Tekislikka perpendikulyar bo'lishi", "Tekislikni kesmasligi"], correct: 0 },
      { q: "Parallellik tranzitivligi nima?", opts: ["a ∥ b va b ∥ c bo'lsa, a ∥ c", "a ⊥ b va b ⊥ c bo'lsa, a ∥ c", "a ∥ b bo'lsa, a ⊥ b", "Hech qanday xossa yo'q"], correct: 0 },
      { q: "Ikki parallel tekislik orasidagi masofa qanday?", opts: ["O'zgaruvchan", "Doimiy", "Nolga teng", "Cheksiz"], correct: 1 },
      { q: "Bir tekislikdagi parallel chiziqlar boshqa tekislikda ham...", opts: ["Kesishadi", "Parallel bo'ladi", "Perpendikulyar bo'ladi", "Ayqash bo'ladi"], correct: 1 }
    ]
  },
  { 
    id: 603, name: "Fazoda perpendikulyarlik", status: "current", 
    aiIntro: "Uchta perpendikulyar haqidagi teorema.",
    quiz: [
      { q: "To'g'ri chiziq tekislikka perpendikulyar bo'lishi uchun?", opts: ["Tekislikdagi bitta chiziqqa perpendikulyar bo'lishi", "Tekislikdagi ikkita kesishuvchi chiziqqa perpendikulyar bo'lishi", "Tekislikni kesishi", "Tekislikda yotmasligi"], correct: 1 },
      { q: "Uchta perpendikulyar teoremasi nima haqida?", opts: ["Uchta to'g'ri chiziq haqida", "Tekislikdagi proyeksiya va perpendikulyarlik haqida", "Uchta tekislik haqida", "Uchburchak haqida"], correct: 1 },
      { q: "Ikki tekislik perpendikulyar bo'lishi uchun?", opts: ["Bir-birini kesishi", "Birining ikkinchisiga perpendikulyar to'g'ri chiziq tutishi", "Parallel bo'lmasligi", "Bir nuqtada kesishishi"], correct: 1 },
      { q: "Perpendikulyar tekisliklar orasidagi burchak?", opts: ["0°", "45°", "90°", "180°"], correct: 2 },
      { q: "Nuqtadan tekislikka tushirilgan perpendikulyar nima?", opts: ["Eng uzun kesmа", "Eng qisqa masofa", "O'rtacha masofa", "Diagonal"], correct: 1 }
    ]
  },
  { 
    id: 604, name: "Ko'pyoqlar: Prizma va Parallelepiped", status: "current", 
    aiIntro: "Hajm va sirt yuzasi hisoblash.",
    quiz: [
      { q: "To'g'ri prizma hajmi formulasi?", opts: ["S_asos * h", "S_asos + h", "2*S_asos * h", "S_asos / h"], correct: 0 },
      { q: "To'g'ri to'rtburchakli parallelepiped hajmi?", opts: ["a + b + c", "2(ab+bc+ac)", "a*b*c", "a²*b"], correct: 2 },
      { q: "Prizmaning yon sirti yuzasi?", opts: ["P_asos * h", "S_asos * h", "2*S_asos", "P_asos + h"], correct: 0 },
      { q: "Kub nechta yoqqa ega?", opts: ["4", "6", "8", "12"], correct: 1 },
      { q: "To'g'ri prizmaning to'la sirti yuzasi?", opts: ["S_yon", "S_yon + S_asos", "S_yon + 2*S_asos", "2*S_asos"], correct: 2 }
    ]
  },
  { 
    id: 605, name: "Piramida va kesik piramida", status: "current", 
    aiIntro: "Piramida hajmi formulalari.",
    quiz: [
      { q: "Piramida hajmi formulasi?", opts: ["S_asos * h", "(1/2)*S_asos*h", "(1/3)*S_asos*h", "2*S_asos*h"], correct: 2 },
      { q: "To'g'ri piramidaning apofemasi nima?", opts: ["Yon qirrasi", "Yon yuzining balandligi", "Asosining diagonali", "Piramida balandligi"], correct: 1 },
      { q: "Kesik piramida hajmi formulasida nima ishlatiladi?", opts: ["Faqat yuqori asos", "Faqat quyi asos", "Ikkala asos va balandlik", "Faqat balandlik"], correct: 2 },
      { q: "To'g'ri uchburchakli piramidaning nechta yoqi bor?", opts: ["3", "4", "5", "6"], correct: 1 },
      { q: "Piramidaning yon yuzasi qanday shakllardan iborat?", opts: ["To'rtburchaklar", "Uchburchaklar", "Beshburchaklar", "Doiralar"], correct: 1 }
    ]
  },
  { 
    id: 606, name: "Aylanma jismlar: Silindr va Konus", status: "current", 
    aiIntro: "Fazoviy aylanish natijalari.",
    quiz: [
      { q: "Silindr hajmi formulasi?", opts: ["πr²", "2πr", "πr²h", "2πrh"], correct: 2 },
      { q: "Konus hajmi formulasi?", opts: ["πr²h", "(1/3)πr²h", "2πrh", "πrh"], correct: 1 },
      { q: "Silindrning to'la sirti yuzasi?", opts: ["2πrh", "πr²", "2πr(r+h)", "πr²h"], correct: 2 },
      { q: "Konus yanal sirti yuzasi?", opts: ["πrl", "πr²", "2πrl", "πr(r+l)"], correct: 0 },
      { q: "Silindr to'g'ri to'rtburchakni qaysi o'q atrofida aylantirish orqali hosil bo'ladi?", opts: ["Diagonal atrofida", "Bir tomoni atrofida", "Markaz atrofida", "Burchak atrofida"], correct: 1 }
    ]
  },
  { 
    id: 607, name: "Shar va Sfera", status: "current", 
    aiIntro: "Globus va koptok geometriyasi.",
    quiz: [
      { q: "Shar hajmi formulasi?", opts: ["4πr²", "πr³", "(4/3)πr³", "2πr³"], correct: 2 },
      { q: "Sfera sirti yuzasi formulasi?", opts: ["πr²", "2πr²", "4πr²", "(4/3)πr²"], correct: 2 },
      { q: "Shar va sfera farqi nima?", opts: ["Farqi yo'q", "Shar - hajmli jism, sfera - uning sirti", "Sfera - hajmli jism, shar - uning sirti", "Ikkalasi bir xil"], correct: 1 },
      { q: "Sharning diametri radiusga qanday bog'liq?", opts: ["d = r", "d = r/2", "d = 2r", "d = r²"], correct: 2 },
      { q: "Shar ichiga joylashtirilgan kub uchun shar radiusi va kub qirrasi qanday bog'liq?", opts: ["r = a", "r = a√3/2", "r = a/2", "r = a√2"], correct: 1 }
    ]
  },
  { 
    id: 608, name: "Vektorlarning fazodagi koordinatalari", status: "current", 
    aiIntro: "Skalyar ko'paytma va burchaklar.",
    quiz: [
      { q: "Fazodagi vektor koordinatalari nechta?", opts: ["1", "2", "3", "4"], correct: 2 },
      { q: "Ikki vektorning skalyar ko'paytmasi formulasi?", opts: ["a⃗·b⃗ = |a||b|", "a⃗·b⃗ = |a||b|cos(θ)", "a⃗·b⃗ = |a||b|sin(θ)", "a⃗·b⃗ = |a|+|b|"], correct: 1 },
      { q: "Perpendikulyar vektorlarning skalyar ko'paytmasi?", opts: ["1", "-1", "0", "|a||b|"], correct: 2 },
      { q: "Vektor uzunligi formulasi (koordinatalar orqali)?", opts: ["x+y+z", "x²+y²+z²", "√(x²+y²+z²)", "x*y*z"], correct: 2 },
      { q: "Ikki nuqta orasidagi masofa formulasi?", opts: ["(x₂-x₁)+(y₂-y₁)", "√((x₂-x₁)²+(y₂-y₁)²+(z₂-z₁)²)", "(x₂-x₁)*(y₂-y₁)", "x₂*y₂"], correct: 1 }
    ]
  }
];
