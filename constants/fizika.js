export const fizikaTopics = [
  { 
    id: 1, name: "Kinematika: Harakat asoslari", status: "completed",
    hook: "Agar siz mashinada bir xil tezlikda ketyapsiz desak, nega tinch turibsiz?",
    aiIntro: `Salom, aziz o'quvchi! Bugun biz fizika olamining eng asosiy va eng qiziqarli bo'limlaridan biri — Kinematikaga sayohat qilamiz. Kinematika — bu harakatning sabablarini (ya'ni kuchlarni) o'rganmaydigan, faqat harakatning o'zini (tezlik, vaqt va masofa) matematik tasvirlaydigan bo'limdir.
Tasavvur qiling, siz poyezd ichida o'tirgan bo'lsangiz, o'rindiqqa nisbatan tinch holatdasiz, lekin yerga nisbatan 100 km/h tezlikda harakatlanyapsiz. Bu "Sanoq sistemasi" tushunchasini keltirib chiqaradi. Sanoq sistemasisiz harakatni aniqlab bo'lmaydi. Dunyodagi har qanday harakat nisbiydir.`,
    videoUrl: "https://www.youtube.com/embed/58S28j5y4q8", labType: "physics_lab",
    quiz: [
      { q: "Vektor miqdor nima?", opts: ["Faqat son qiymat", "Yo'nalish va son qiymat", "Vaqt", "Massa"], correct: 1 },
      { q: "Tezlik formulasi qanday?", opts: ["v = m*a", "v = s/t", "v = F/m", "v = m*g"], correct: 1 },
      { q: "Tezlanish birligi qanday?", opts: ["m/s", "m/s²", "km/h", "N"], correct: 1 },
      { q: "Bir tekis harakat deganda nima tushuniladi?", opts: ["Tezlanish o'zgarib turadi", "Tezlik o'zgarmasdan harakat", "Jism to'xtab turadi", "Tezlik ortib boradi"], correct: 1 },
      { q: "Erkin tushish tezlanishi taxminan qancha?", opts: ["5 m/s²", "9,8 m/s²", "15 m/s²", "3 m/s²"], correct: 1 }
    ],
    practice: [{ n: 1, level: "Oson", text: "10 m/s tezlikda 5 s yurganda qancha masofa bosiladi?", answer: "50 m" }],
    homework: [{ n: 1, text: "Uyingizdan maktabgacha bo'lgan yo'l va ko'chishni hisoblang.", deadline: "1 kun" }]
  },
  { 
    id: 2, name: "Nyuton 2-qonuni (F=ma)", status: "completed",
    hook: "Nega yuk mashinasini itarish, kichik mashinani itarishdan qiyinroq?",
    aiIntro: `Assalomu alaykum! Bugun biz fizikaning poydevori — Dinamika bo'limining eng muhim qonunini o'rganamiz. Bu — Nyutonning ikkinchi qonuni. Har bir harakatlanayotgan jism, xoh u koptok bo'lsin, xoh ulkan raketa, aynan shu qonunga bo'ysunadi.
Nyutonning ikkinchi qonuni jismga ta'sir etayotgan kuch, uning massasi va tezlanishi o'rtasidagi bog'liqlikni ifodalaydi. Formula juda taniqli: F=ma. Lekin uning orqasida butun koinot mexanikasi yashiringan.`,
    videoUrl: "https://www.youtube.com/embed/By-ggTfv6_8", labType: "physics_newton",
    quiz: [
      { q: "F=ma dagi 'm' nima?", opts: ["Kuch", "Tezlanish", "Massa", "Vaqt"], correct: 2 },
      { q: "Kuch birligi qanday?", opts: ["kg", "m/s²", "N (Nyuton)", "J"], correct: 2 },
      { q: "Massa 2 kg, tezlanish 5 m/s² bo'lsa, kuch qancha?", opts: ["2,5 N", "7 N", "10 N", "3 N"], correct: 2 },
      { q: "Kuch ikki barobar oshsa, tezlanish qanday o'zgaradi?", opts: ["O'zgarmaydi", "Ikki barobar kamayadi", "Ikki barobar ortadi", "To'rt barobar ortadi"], correct: 2 },
      { q: "Massa ikki barobar oshsa, tezlanish qanday o'zgaradi (kuch o'zgarmas)?", opts: ["Ikki barobar ortadi", "Ikki barobar kamayadi", "O'zgarmaydi", "To'rt barobar kamayadi"], correct: 1 }
    ],
    practice: [{ n: 1, level: "O'rta", text: "2 kg li jismga 10 N kuch berilsa, tezlanish qancha?", answer: "5 m/s^2" }],
    homework: [{ n: 1, text: "Kundalik hayotdan F=ma misolini topib, hisob-kitob qiling.", deadline: "2 kun" }]
  },
  { 
    id: 3, name: "Nyuton 3-qonuni", status: "current",
    hook: "Nega siz devorni itarsangiz, devor ham sizni itarayotgandek tuyuladi?",
    aiIntro: `Bugungi ma'ruzamiz "O'zaro ta'sir qonuni" haqida. Nyutonning uchinchi qonuni shunday deydi: "Har qanday harakatga teng va qarama-qarshi aks harakat bor". Bu tabiatning eng muvozanatlashtirilgan qonunidir.
Tasavvur qiling, siz muz ustida turibsiz va do'stingizni qattiq itardingiz. Natijada nafaqat do'stingiz, balki siz o'zingiz ham orqaga qarab ketasiz. Nega? Chunki siz do'stingizga kuch bilan ta'sir etganingizda, do'stingiz ham sizga aynan shunday miqdordagi kuch bilan javob berdi.`,
    videoUrl: "https://www.youtube.com/embed/JGO_zDWmkvk", labType: "physics_newton",
    quiz: [
      { q: "Harakatga teng aks harakat bormi?", opts: ["Ha", "Yo'q", "Faqat havoda", "Faqat suvda"], correct: 0 },
      { q: "Nyuton 3-qonuniga ko'ra aks ta'sir kuchi qanday?", opts: ["Kichikroq", "Kattaroq", "Teng va qarama-qarshi", "Nolga teng"], correct: 2 },
      { q: "Raketa uchishida qaysi qonun asosiy rol o'ynaydi?", opts: ["Nyuton 1-qonuni", "Nyuton 2-qonuni", "Nyuton 3-qonuni", "Paskal qonuni"], correct: 2 },
      { q: "Aks ta'sir kuchlari qayerga ta'sir etadi?", opts: ["Bir jismga", "Turli jismlarga", "Faqat havoga", "Faqat yerga"], correct: 1 },
      { q: "Muz ustida itarilganda ikki kishi ham orqaga ketadi. Bu qaysi qonun?", opts: ["Nyuton 1-qonuni", "Nyuton 2-qonuni", "Nyuton 3-qonuni", "Arximed qonuni"], correct: 2 }
    ],
    practice: [{ n: 1, level: "Oson", text: "Raketa gazni 500N bilan itarsa, gaz raketani qancha bilan itaradi?", answer: "500 N" }],
    homework: [{ n: 1, text: "Aks harakatga doir 5 ta misol yozing.", deadline: "1 kun" }]
  },
  { 
    id: 4, name: "Statika va Muvozanat", status: "current",
    hook: "Nega osmono'par binolar shamolda qulab tushmaydi?",
    aiIntro: `Salom! Bugun biz "Tinchlik ilmi" — Statikani o'rganamiz. Statika — bu jismlarning qanday qilib muvozanatda turishini o'rganadigan bo'lim. Nega ulkan binolar o'z-o'zidan qulab tushmaydi?
Jism tinch turishi (muvozanatda bo'lishi) uchun ikkita asosiy shart bajarilishi kerak. Birinchi shart: jismga ta'sir etayotgan barcha kuchlarning yig'indisi nolga teng bo'lishi kerak.`,
    videoUrl: "https://www.youtube.com/embed/jZ_y9N5Y9Uo", labType: "physics_lab",
    quiz: [
      { q: "Moment formulasi qanday?", opts: ["F*a", "F*d", "m*v", "m*g"], correct: 1 },
      { q: "Muvozanat uchun kuchlar yig'indisi nimaga teng bo'lishi kerak?", opts: ["1 ga", "Massaga", "Nolga", "Og'irlikka"], correct: 2 },
      { q: "Og'irlik markazi nima?", opts: ["Jismning eng og'ir nuqtasi", "Jism og'irligining ta'sir nuqtasi", "Jismning markazi", "Jismning eng yuqori nuqtasi"], correct: 1 },
      { q: "Barqaror muvozanat deganda nima tushuniladi?", opts: ["Jism hech qachon muvozanatda bo'lmaydi", "Jism siljiganda muvozanatga qaytadi", "Jism doim siljiydi", "Jism faqat gorizontal turadi"], correct: 1 },
      { q: "Moment birligi qanday?", opts: ["N", "kg", "N·m", "m/s²"], correct: 2 }
    ],
    practice: [{ n: 1, level: "O'rta", text: "2 metrli dastakning chetiga 10N kuch berilsa, momentni toping.", answer: "20 N*m" }],
    homework: [{ n: 1, text: "Uyingizdagi muvozanatda turgan 3 ta jismni tahlil qiling.", deadline: "2 kun" }]
  },
  { 
    id: 5, name: "Gidrostatika va Paskal", status: "current",
    hook: "Nega og'ir kema suvda cho'kmaydi, bir bo'lak kichik tosh esa g'arq bo'ladi?",
    aiIntro: `Assalomu alaykum! Bugun biz suyuqliklar va gazlar olamiga sho'ng'iymiz. Gidrostatika — tinch holatdagi suyuqliklarning muvozanat qonunlarini o'rganadi.
Eng boshida Paskal qonuni turadi: Suyuqlik yoki gazga berilgan bosim barcha yo'nalishlar bo'yicha o'zgarmasdan uzatiladi.`,
    videoUrl: "https://www.youtube.com/embed/jZ_y9N5Y9Uo", labType: "physics_lab",
    quiz: [
      { q: "Paskal qonuni nimani ifodalaydi?", opts: ["Kuch va massani", "Bosimning barcha yo'nalishlarda teng uzatilishini", "Tezlik va vaqtni", "Energiyaning saqlanishini"], correct: 1 },
      { q: "Bosim formulasi qanday?", opts: ["P = m*g", "P = F/S", "P = m*v", "P = F*d"], correct: 1 },
      { q: "Arximed kuchi nima?", opts: ["Tortishish kuchi", "Suyuqlik tomonidan jismga ta'sir etuvchi ko'taruvchi kuch", "Ishqalanish kuchi", "Elastiklik kuchi"], correct: 1 },
      { q: "Gidravlik press qaysi qonunga asoslanadi?", opts: ["Nyuton qonuniga", "Paskal qonuniga", "Arximed qonuniga", "Om qonuniga"], correct: 1 },
      { q: "Bosim birligi qanday?", opts: ["N", "kg", "Pa (Paskal)", "J"], correct: 2 }
    ]
  },
  { 
    id: 6, name: "Termodinamika asoslari", status: "current",
    hook: "Nega issiq choy o'z-o'zidan sovib, xona haroratiga keladi?",
    aiIntro: `Xush kelibsiz! Bugungi mavzumiz — Termodinamika, ya'ni issiqlik va energiyaning o'zaro aylanishlari haqida. Bu bo'lim koinotning 'qarishini' va barcha dvigatellarning ishlashini tushuntirib beradi.`,
    videoUrl: "https://www.youtube.com/embed/jZ_y9N5Y9Uo", labType: "physics_lab",
    quiz: [
      { q: "Termodinamikaning 1-qonuni nimani ifodalaydi?", opts: ["Energiyaning yo'qolishini", "Energiyaning saqlanish qonunini", "Issiqlikning faqat sovishini", "Massaning saqlanishini"], correct: 1 },
      { q: "Ichki energiya nima?", opts: ["Jismning tezligi", "Jism molekulalarining kinetik va potensial energiyasi", "Jismning og'irligi", "Jismning harorati"], correct: 1 },
      { q: "Issiqlik miqdori birligi?", opts: ["N", "Pa", "J (Joule)", "W"], correct: 2 },
      { q: "Termodinamikaning 2-qonuni nimani taqiqlaydi?", opts: ["Issiqlik uzatishni", "Issiqlikning o'z-o'zidan sovuqdan issiqqa o'tishini", "Energiya saqlanishini", "Ish bajarishni"], correct: 1 },
      { q: "Absolyut nol harorat qancha?", opts: ["0°C", "-100°C", "-273°C", "-373°C"], correct: 2 }
    ]
  },
  { 
    id: 7, name: "Elektr: Kulon qonuni", status: "current",
    hook: "Nega zaryadlar bir-birini tortadi yoki itaradi?",
    aiIntro: `Salom! Bugun biz "Ko'rinmas kuchlar" — Elektr olamiga qadam qo'yamiz. Tabiatda hamma narsa atomlardan iborat, atomlar ichida esa zaryadlar yashiringan.
Elektr zaryadlarining o'zaro ta'sir qonuni birinchi bo'lib Sharl Kulon tomonidan kashf etilgan.`,
    videoUrl: "https://www.youtube.com/embed/jZ_y9N5Y9Uo", labType: "physics_lab",
    quiz: [
      { q: "Kulon qonuniga ko'ra kuch masofaga qanday bog'liq?", opts: ["To'g'ri proporsional", "Masofa kvadratiga teskari proporsional", "O'zgarmaydi", "Masofa kubiga proporsional"], correct: 1 },
      { q: "Bir xil zaryadlar bir-birini...", opts: ["Tortadi", "Itaradi", "Ta'sir etmaydi", "Yo'q qiladi"], correct: 1 },
      { q: "Elektr zaryad birligi?", opts: ["A", "V", "Kl (Kulon)", "Om"], correct: 2 },
      { q: "Elektron qanday zaryadga ega?", opts: ["Musbat", "Manfiy", "Neytral", "Ikki xil"], correct: 1 },
      { q: "Proton qanday zaryadga ega?", opts: ["Manfiy", "Neytral", "Musbat", "Zaryadlanmagan"], correct: 2 }
    ]
  },
  { 
    id: 8, name: "O'zgarmas Tok qonunlari", status: "current", 
    aiIntro: "Elektr toki — bu zaryadlangan zarrachalarning tartibli harakatidir. Om qonuni zanjirning asosi...",
    quiz: [
      { q: "Om qonuni formulasi?", opts: ["I = R*U", "I = U/R", "I = U*R", "I = P/U"], correct: 1 },
      { q: "Elektr toki birligi?", opts: ["V", "Om", "A (Amper)", "W"], correct: 2 },
      { q: "Kuchlanish birligi?", opts: ["A", "V (Volt)", "Om", "W"], correct: 1 },
      { q: "Qarshilik birligi?", opts: ["A", "V", "Om (Ω)", "J"], correct: 2 },
      { q: "Ketma-ket ulanganda qarshiliklar qanday qo'shiladi?", opts: ["Teskari qo'shiladi", "To'g'ridan-to'g'ri qo'shiladi", "Ko'paytiriladi", "Bo'linadi"], correct: 1 }
    ]
  },
  { 
    id: 9, name: "Magnetizm sirlari", status: "current", 
    aiIntro: "Magnetizm — harakatlanayotgan zaryadlarning yana bir namoyon bo'lishi. Lorens kuchi...",
    quiz: [
      { q: "Magnit maydon chiziqlari qayerdan chiqadi?", opts: ["Janub qutbidan", "Shimol qutbidan", "Har ikki qutbdan", "Magnit o'rtasidan"], correct: 1 },
      { q: "Lorens kuchi qaysi zarrachalarga ta'sir etadi?", opts: ["Neytral zarrachalarga", "Harakatlanayotgan zaryadlangan zarrachalarga", "Faqat elektronlarga", "Faqat protonlarga"], correct: 1 },
      { q: "Magnit maydon kuchlanganligi birligi?", opts: ["A", "T (Tesla)", "V", "Om"], correct: 1 },
      { q: "Elektromagnit induksiya hodisasini kim kashf etgan?", opts: ["Nyuton", "Faradey", "Kulon", "Om"], correct: 1 },
      { q: "Magnit maydon tokli o'tkazgichga ta'sir etuvchi kuch?", opts: ["Lorens kuchi", "Amper kuchi", "Arximed kuchi", "Elastiklik kuchi"], correct: 1 }
    ]
  },
  { 
    id: 10, name: "Geometrik Optika", status: "current", 
    aiIntro: "Yorug'lik — bu elektromagnit to'lqini. Yorug'likning qaytishi va sinishi qonunlari...",
    quiz: [
      { q: "Yorug'likning qaytish qonuniga ko'ra tushish burchagi...", opts: ["Qaytish burchagidan katta", "Qaytish burchagiga teng", "Qaytish burchagidan kichik", "Nolga teng"], correct: 1 },
      { q: "Yorug'lik vakuumda qanday tezlikda tarqaladi?", opts: ["300 km/s", "3×10⁸ m/s", "3×10⁶ m/s", "300 m/s"], correct: 1 },
      { q: "Yig'uvchi linza qanday tasvir hosil qiladi?", opts: ["Faqat to'g'ri tasvir", "Faqat teskari tasvir", "Vaziyatga qarab to'g'ri yoki teskari", "Hech qanday tasvir hosil qilmaydi"], correct: 2 },
      { q: "Sinish qonunida nima saqlanadi?", opts: ["Tezlik", "Tushish burchagi", "n₁sinθ₁ = n₂sinθ₂ nisbati", "Energiya"], correct: 2 },
      { q: "Ko'zgu qanday tasvir hosil qiladi?", opts: ["Haqiqiy tasvir", "Virtual tasvir", "Kattaytirilgan tasvir", "Kichraytirilgan tasvir"], correct: 1 }
    ]
  },
  { id: 11, name: "Dinamika asoslari", status: "current", aiIntro: "Jism harakatiga sabab bo'luvchi kuchlarni o'rganamiz." },
  { id: 12, name: "Butunjahon tortishish qonuni", status: "current", aiIntro: "Nega olma yerga tushadi? Nyutonning buyuk kashfiyoti." },
  { id: 13, name: "Jismning og'irligi va vaznsizlik", status: "current", aiIntro: "Og'irlik va massa o'rtasidagi farq nima?" },
  { id: 14, name: "Ish va Energiya", status: "current", aiIntro: "Mexanik ish va energiyaning turlari (Kinetik, Potensial)." },
  { id: 15, name: "Mexanik energiyaning saqlanish qonuni", status: "current", aiIntro: "Energiya yo'qolmaydi, u bir turdan boshqasiga o'tadi." },
  { id: 16, name: "Impuls va uning saqlanish qonuni", status: "current", aiIntro: "Jismlarning to'qnashuvi va harakat miqdori." },
  { id: 17, name: "Aylanma harakat kinematikasi", status: "current", aiIntro: "Burchak tezlik va markazga intilma tezlanish." },
  { id: 18, name: "Qattiq jism dinamikasi", status: "current", aiIntro: "Inersiya momenti va aylanma harakat tenglamasi." },
  { id: 19, name: "Deformatsiya va Guk qonuni", status: "current", aiIntro: "Elastiklik kuchi va jism shaklining o'zgarishi." },
  { id: 20, name: "Mexanik tebranishlar", status: "current", aiIntro: "Garmonik tebranishlar va ularning parametrlari." },
  { id: 21, name: "Matematik va prujinali mayatnik", status: "current", aiIntro: "Tebranish davrini hisoblash formulalari." },
  { id: 22, name: "Mexanik to'lqinlar va tovush", status: "current", aiIntro: "To'lqin uzunligi va tovushning tarqalishi." },
  { id: 23, name: "Molekulyar kinetik nazariya", status: "current", aiIntro: "Modda tuzilishi va molekulalar harakati." },
  { id: 24, name: "Ideal gaz holat tenglamasi", status: "current", aiIntro: "Klaperon-Mendeleyev tenglamasi (PV=nRT)." },
  { id: 25, name: "Izojarayonlar: Izoterma, Izobara, Izoxora", status: "current", aiIntro: "Gaz parametrlarining o'zgarmas holatlari." },
  { id: 26, name: "Termodinamikaning 1-qonuni", status: "current", aiIntro: "Issiqlik miqdori va ichki energiya o'zgarishi." },
  { id: 27, name: "Issiqlik dvigatellari va F.I.K.", status: "current", aiIntro: "Karno sikli va foydali ish koeffitsiyenti." },
  { id: 28, name: "Bug'lanish, qaynash va namlik", status: "current", aiIntro: "Faza o'tishlari va havo namligi." },
  { id: 29, name: "Elektrostatik maydon", status: "current", aiIntro: "Kuchlanganlik va potensial tushunchalari." },
  { id: 30, name: "Elektr sig'imi va Kondensatorlar", status: "current", aiIntro: "Zaryad to'plovchi qurilmalar." },
  { id: 31, name: "Tok kuchi va Kuchlanish", status: "current", aiIntro: "Elektr zanjiri asoslari." },
  { id: 32, name: "Om qonuni (to'liq zanjir uchun)", status: "current", aiIntro: "E.Yu.K. va ichki qarshilik." },
  { id: 33, name: "O'tkazgichlarni ulash", status: "current", aiIntro: "Ketma-ket va parallel ulash qoidalari." },
  { id: 34, name: "Elektr tokining ishi va quvvati", status: "current", aiIntro: "Joul-Lens qonuni." },
  { id: 35, name: "Yarimo'tkazgichlarda elektr toki", status: "current", aiIntro: "Diodlar va tranzistorlar ishlash prinsipi." },
  { id: 36, name: "Elektrolitlarda elektr toki", status: "current", aiIntro: "Faradeyning elektroliz qonunlari." },
  { id: 37, name: "Magnit maydoni va Amper kuchi", status: "current", aiIntro: "Magnit maydonining tokli o'tkazgichga ta'siri." },
  { id: 38, name: "Lorens kuchi", status: "current", aiIntro: "Zaryadlangan zarrachaning magnit maydonidagi harakati." },
  { id: 39, name: "Elektromagnit induksiya qonuni", status: "current", aiIntro: "Faradey kashfiyoti va Lenz qoidasi." },
  { id: 40, name: "O'zgaruvchan tok asoslari", status: "current", aiIntro: "Transformatorlar va tokni uzatish." },
  { id: 41, name: "Yorug'likning qaytishi va sinishi", status: "current", aiIntro: "Optika asoslari va sinish koeffitsiyenti." },
  { id: 42, name: "Yupqa linzalar va Optik asboblar", status: "current", aiIntro: "Formula va tasvir yasash qoidalari." },
  { id: 43, name: "Yorug'lik interferensiyasi", status: "current", aiIntro: "To'lqinlar qo'shilishi va ranglar jilosi." },
  { id: 44, name: "Yorug'lik difraksiyasi va qutblanishi", status: "current", aiIntro: "To'siqlarni aylanib o'tish." },
  { id: 45, name: "Kvant fizikasi va Fotoeffekt", status: "current", aiIntro: "Eynshteyn tenglamasi va yorug'lik kvantlari." }
];
