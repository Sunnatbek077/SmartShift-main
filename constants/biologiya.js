export const biologiyaTopics = [
  { 
    id: 801, name: "Ch.Darvinning evolyutsiya nazariyasi", status: "completed",
    hook: "Turlarning kelib chiqishi qanday sodir bo'lgan?",
    aiIntro: `Assalomu alaykum! Bugun biz tirik tabiatning rivojlanish qonuniyatlarini - Evolyutsiyani o'rganamiz. Darvinning kashfiyotlari bilan tanishamiz.`,
    videoUrl: "https://www.youtube.com/embed/jZ_y9N5Y9Uo",
    quiz: [
      { q: "Evolyutsiyaning harakatlantiruvchi kuchi nima?", opts: ["Tabiiy tanlanish", "Mutatsiya", "Moslashuv", "Nasldan-naslga o'tish"], correct: 0 },
      { q: "Darvin qaysi asarida evolyutsiya nazariyasini bayon etgan?", opts: ["Genlar haqida", "Turlarning kelib chiqishi", "Ekologiya asoslari", "Irsiyat qonunlari"], correct: 1 },
      { q: "Tabiiy tanlanish deganda nima tushuniladi?", opts: ["Inson tomonidan tanlash", "Muhitga moslashgan organizmlarning ko'proq nasl qoldirishi", "Mutatsiyalar", "Migratsiya"], correct: 1 },
      { q: "Rudiment nima?", opts: ["Yangi organ", "Rivojlanmagan, ahamiyatini yo'qotgan organ", "Muhim organ", "Yangi xususiyat"], correct: 1 },
      { q: "Atavizm nima?", opts: ["Yangi belgi", "Ajdodlarda bo'lgan, yo'qolgan belgilarning qayta paydo bo'lishi", "Mutatsiya", "Moslashuv"], correct: 1 }
    ]
  },
  { 
    id: 802, name: "Turlanish jarayonlari va mezonlari", status: "current", 
    aiIntro: "Turning biologik va geografik tushunchasi.",
    quiz: [
      { q: "Biologik tur mezonlari nechta?", opts: ["2", "3", "5", "7"], correct: 2 },
      { q: "Morfologik mezon nima?", opts: ["Tashqi va ichki tuzilish o'xshashligi", "Yashash joyi", "Xulq-atvor", "Genetik tarkib"], correct: 0 },
      { q: "Allopatrik turlanish nima?", opts: ["Bir hududda turlanish", "Geografik to'siq orqali turlanish", "Genetik mutatsiya", "Tabiiy tanlanish"], correct: 1 },
      { q: "Simpatrik turlanish nima?", opts: ["Geografik ajralish bilan", "Bir hududda turlanish", "Faqat dengizda", "Faqat quruqlikda"], correct: 1 },
      { q: "Tur nima?", opts: ["Bir xil ko'rinadigan organizmlar", "O'zaro chatishib unumdor avlod beradigan organizmlar guruhi", "Bir hududda yashovchilar", "Bir xil ovqatlanuvchilar"], correct: 1 }
    ]
  },
  { 
    id: 803, name: "Ekologik omillar: Abiotik va Biotik", status: "current", 
    aiIntro: "Tirik organizmlarning muhitga bog'liqligi.",
    quiz: [
      { q: "Abiotik omillarga nima kiradi?", opts: ["Yirtqichlar", "Harorat, yorug'lik, namlik", "Raqobat", "Simbioz"], correct: 1 },
      { q: "Biotik omillarga nima kiradi?", opts: ["Harorat", "Yorug'lik", "Organizmlarning bir-biriga ta'siri", "Tuproq tarkibi"], correct: 2 },
      { q: "Ekologik nisha nima?", opts: ["Organizmning yashash joyi", "Organizmning ekotizimdagi o'rni va roli", "Oziq zanjiri", "Populyatsiya"], correct: 1 },
      { q: "Tolerantlik qonuni kimning nomi bilan ataladi?", opts: ["Darvin", "Mendel", "Shelford", "Vernadskiy"], correct: 2 },
      { q: "Cheklovchi omil nima?", opts: ["Eng qulay omil", "Organizmning hayotini cheklaydigan omil", "Biotik omil", "Abiotik omil"], correct: 1 }
    ]
  },
  { 
    id: 804, name: "Populyatsiya va Ekotizim", status: "current", 
    aiIntro: "Oziq zanjiri va energiya oqimi.",
    quiz: [
      { q: "Populyatsiya nima?", opts: ["Barcha tirik organizmlar", "Bir turga mansub, bir hududda yashovchi organizmlar", "Ekotizim", "Biosfera"], correct: 1 },
      { q: "Oziq zanjiri qanday boshlanadi?", opts: ["Yirtqichlardan", "Ishlab chiqaruvchilardan (o'simliklar)", "Parchalovchilardan", "Iste'molchilardan"], correct: 1 },
      { q: "Ekotizimda energiya qanday o'tadi?", opts: ["Bir yo'nalishda", "Ikki yo'nalishda", "Aylanma", "O'tmaydi"], correct: 0 },
      { q: "Trofik daraja nima?", opts: ["Oziq zanjirida organizmning o'rni", "Populyatsiya zichligi", "Ekotizim turi", "Biotop"], correct: 0 },
      { q: "Ekologik piramida nima ko'rsatadi?", opts: ["Organizmlar sonini", "Har bir trofik darajadagi biomassa yoki energiyani", "Oziq zanjirini", "Populyatsiya o'sishini"], correct: 1 }
    ]
  },
  { 
    id: 805, name: "Biosfera va Vernadskiy nazariyasi", status: "current", 
    aiIntro: "Hayot qobig'ining global ahamiyati.",
    quiz: [
      { q: "Biosfera tushunchasini kim kiritgan?", opts: ["Darvin", "Mendel", "Vernadskiy", "Lamark"], correct: 2 },
      { q: "Biosfera qaysi qatlamlarni o'z ichiga oladi?", opts: ["Faqat quruqlik", "Faqat okean", "Litosfera, gidrosfera va atmosferaning bir qismi", "Faqat atmosfera"], correct: 2 },
      { q: "Noosfera nima?", opts: ["Biosferaning bir qismi", "Inson aql-zakovati ta'sirida o'zgargan biosfera", "Okean qatlami", "Atmosfera qatlami"], correct: 1 },
      { q: "Tirik modda biosferada qanday rol o'ynaydi?", opts: ["Hech qanday rol", "Moddalar aylanishini ta'minlaydi", "Faqat kislorod ishlab chiqaradi", "Faqat oziq-ovqat beradi"], correct: 1 },
      { q: "Biosferada uglerod aylanishi qanday sodir bo'ladi?", opts: ["Faqat fotosintez orqali", "Fotosintez, nafas olish va parchalanish orqali", "Faqat nafas olish orqali", "Faqat yonish orqali"], correct: 1 }
    ]
  },
  { 
    id: 806, name: "Irsiyat qonuniyatlari (Mendel qonunlari)", status: "current", 
    aiIntro: "Genetika asoslari.",
    quiz: [
      { q: "Mendel birinchi qonuni nima?", opts: ["Ajralish qonuni", "Dominantlik qonuni", "Mustaqil birikish qonuni", "Bog'liq irsiyat"], correct: 1 },
      { q: "Dominant belgi nima?", opts: ["Kuchsiz belgi", "Birinchi avlodda namoyon bo'ladigan kuchli belgi", "Retsessiv belgi", "Mutant belgi"], correct: 1 },
      { q: "Genotip nima?", opts: ["Organizmning tashqi ko'rinishi", "Organizmning genetik tarkibi", "Fenotip", "Mutatsiya"], correct: 1 },
      { q: "Fenotip nima?", opts: ["Genetik tarkib", "Organizmning tashqi va ichki belgilari majmui", "Genotip", "Allel"], correct: 1 },
      { q: "Aa x Aa chatishuvida avlodlar nisbati?", opts: ["1:1", "3:1", "1:2:1", "2:1"], correct: 2 }
    ]
  },
  { 
    id: 807, name: "Inson genetikasi va irsiy kasalliklar", status: "current", 
    aiIntro: "Mutatsiyalar va sog'lom avlod.",
    quiz: [
      { q: "Inson xromosomalar soni nechta?", opts: ["23", "44", "46", "48"], correct: 2 },
      { q: "Jins xromosomalari qanday belgilanadi?", opts: ["A va B", "X va Y", "1 va 2", "M va F"], correct: 1 },
      { q: "Daun sindromi qaysi xromosoma anomaliyasidan kelib chiqadi?", opts: ["21-xromosomaning uchtaligi", "X xromosomasi yo'qligi", "Y xromosomasi ortiqchaligi", "22-xromosoma anomaliyasi"], correct: 0 },
      { q: "Mutatsiya nima?", opts: ["Irsiy belgilarning o'zgarmasligi", "DNK tarkibidagi o'zgarish", "Fenotip o'zgarishi", "Ekologik moslashuv"], correct: 1 },
      { q: "Genetik kasalliklarni aniqlash usuli?", opts: ["Faqat tashqi ko'rinish", "Kariotiplanish va DNK tahlili", "Faqat qon tahlili", "Faqat rentgen"], correct: 1 }
    ]
  }
];
