export const dasturlashTopics = [
  { 
    id: 201, name: "Python: Kirish va O'rnatish", status: "completed",
    hook: "Kompyuter bilan qanday qilib 'do'stlashish' mumkin?",
    aiIntro: `Salom, kelajak dasturchisi! Bugun siz insoniyat tarixidagi eng kuchli sohalardan biri — Dasturlash dunyosiga qadam qo'yasiz. Biz Python tilini o'rganamiz.
Nima uchun Python? Chunki u bugungi kunda dunyodagi eng ommabop, o'rganishga oson va juda ko'p qirrali tildir.`,
    videoUrl: "https://www.youtube.com/embed/mvK0UzFNw1Q", labType: "coding_editor",
    quiz: [
      { q: "Python-da ma'lumotni chiqarish funksiyasi?", opts: ["echo", "print", "console.log", "write"], correct: 1 },
      { q: "Python qaysi yilda yaratilgan?", opts: ["1985", "1991", "2000", "2005"], correct: 1 },
      { q: "Python-da izoh (comment) qanday yoziladi?", opts: ["// izoh", "/* izoh */", "# izoh", "-- izoh"], correct: 2 },
      { q: "Python-da o'zgaruvchi e'lon qilish uchun nima kerak?", opts: ["var kalit so'zi", "let kalit so'zi", "Hech narsa kerak emas, to'g'ridan-to'g'ri qiymat berish", "int kalit so'zi"], correct: 2 },
      { q: "Python faylining kengaytmasi?", opts: [".py", ".python", ".pt", ".pyt"], correct: 0 }
    ],
    practice: [{ n: 1, level: "Oson", text: "Ekranga 'Salom Dunyo' deb chiqaruvchi kod yozing.", answer: "print('Salom Dunyo')" }],
    homework: [{ n: 1, text: "Python o'rnatib, birinchi sodda kalkulyatoringizni yarating.", deadline: "1 kun" }]
  },
  { 
    id: 202, name: "O'zgaruvchilar va Ma'lumot turlari", status: "current",
    hook: "Ma'lumotlarni xotirada qanday saqlaymiz?",
    aiIntro: `Dasturlashda ma'lumotlarni saqlash uchun biz "Konteyner"lardan foydalanamiz. Bular — O'zgaruvchilar (Variables) deb ataladi.
Ular xuddi qutichaga o'xshaydi: ustiga nom yoziladi va ichiga kerakli qiymat solinadi.`,
    labType: "coding_editor",
    quiz: [
      { q: "Python-da butun son turi?", opts: ["float", "str", "int", "bool"], correct: 2 },
      { q: "Python-da matn turi?", opts: ["int", "str", "float", "list"], correct: 1 },
      { q: "type() funksiyasi nima qiladi?", opts: ["Qiymat chiqaradi", "O'zgaruvchi turini aniqlaydi", "O'zgaruvchini o'chiradi", "Qiymat o'zgartiradi"], correct: 1 },
      { q: "Python-da haqiqiy son turi?", opts: ["int", "str", "bool", "float"], correct: 3 },
      { q: "x = '5' da x qanday turda?", opts: ["int", "float", "str", "bool"], correct: 2 }
    ]
  },
  { 
    id: 203, name: "Shart operatorlari (If-Else)", status: "current", 
    aiIntro: "Agarda shart bajarilsa... Dasturni qaror qabul qilishga o'rgatamiz...",
    quiz: [
      { q: "Python-da shart operatori qanday yoziladi?", opts: ["if (shart) {}", "if shart:", "if shart then", "shart ? a : b"], correct: 1 },
      { q: "elif nima?", opts: ["Else if ning qisqartmasi", "Yangi funksiya", "Tsikl", "Import"], correct: 0 },
      { q: "Python-da 'va' mantiqiy operatori?", opts: ["&&", "and", "&", "||"], correct: 1 },
      { q: "Python-da 'yoki' mantiqiy operatori?", opts: ["||", "or", "|", "OR"], correct: 1 },
      { q: "Python-da 'emas' mantiqiy operatori?", opts: ["!", "not", "~", "NO"], correct: 1 }
    ]
  },
  { 
    id: 204, name: "Tsikllar (Loops): For va While", status: "current", 
    aiIntro: "Bir xil amallarni takrorlash san'ati. Tsikllar va range funksiyasi...",
    quiz: [
      { q: "for i in range(5) necha marta takrorlanadi?", opts: ["4", "5", "6", "10"], correct: 1 },
      { q: "while tsikli qachon to'xtaydi?", opts: ["Har doim", "Shart yolg'on bo'lganda", "Shart rost bo'lganda", "Hech qachon"], correct: 1 },
      { q: "break operatori nima qiladi?", opts: ["Tsiklni davom ettiradi", "Tsikldan chiqadi", "Keyingi iteratsiyaga o'tadi", "Xato chiqaradi"], correct: 1 },
      { q: "continue operatori nima qiladi?", opts: ["Tsikldan chiqadi", "Tsiklni to'xtatadi", "Joriy iteratsiyani o'tkazib, keyingisiga o'tadi", "Xato chiqaradi"], correct: 2 },
      { q: "range(2, 10, 2) qanday qiymatlar beradi?", opts: ["2,4,6,8,10", "2,4,6,8", "2,3,4,5,6,7,8,9", "0,2,4,6,8"], correct: 1 }
    ]
  },
  { 
    id: 205, name: "Funksiyalar va Modullar", status: "current", 
    aiIntro: "Kodni qayta ishlatish. Def kalit so'zi va parametrizatsiya...",
    quiz: [
      { q: "Python-da funksiya qanday e'lon qilinadi?", opts: ["function nom():", "def nom():", "func nom():", "fun nom():"], correct: 1 },
      { q: "return operatori nima qiladi?", opts: ["Funksiyani chaqiradi", "Funksiyadan qiymat qaytaradi", "Funksiyani o'chiradi", "Parametr beradi"], correct: 1 },
      { q: "Modul nima?", opts: ["Funksiya", "Python kodi saqlangan fayl", "O'zgaruvchi", "Tsikl"], correct: 1 },
      { q: "Modulni import qilish uchun?", opts: ["include modul", "import modul", "use modul", "require modul"], correct: 1 },
      { q: "Standart parametrli funksiya qanday yoziladi?", opts: ["def f(x = 0):", "def f(x := 0):", "def f(x == 0):", "def f(x -> 0):"], correct: 0 }
    ]
  },
  { 
    id: 206, name: "Ro'yxatlar (Lists) va Lug'atlar", status: "current", 
    aiIntro: "Kolleksiyalar bilan ishlash. Ma'lumotlarni saqlash va qidirish...",
    quiz: [
      { q: "Python-da ro'yxat qanday yaratiladi?", opts: ["(1, 2, 3)", "[1, 2, 3]", "{1, 2, 3}", "<1, 2, 3>"], correct: 1 },
      { q: "Ro'yxatga element qo'shish metodi?", opts: ["add()", "append()", "insert()", "push()"], correct: 1 },
      { q: "Lug'at (dict) qanday yaratiladi?", opts: ["[kalit: qiymat]", "{kalit: qiymat}", "(kalit: qiymat)", "<kalit: qiymat>"], correct: 1 },
      { q: "Ro'yxatdan element o'chirish metodi?", opts: ["delete()", "remove()", "erase()", "pop() yoki remove()"], correct: 3 },
      { q: "len([1, 2, 3, 4]) = ?", opts: ["3", "4", "5", "0"], correct: 1 }
    ]
  },
  { 
    id: 207, name: "Fayllar bilan ishlash", status: "current", 
    aiIntro: "Ma'lumotlarni faylga yozish va undan o'qish...",
    quiz: [
      { q: "Faylni o'qish uchun qanday rejim ishlatiladi?", opts: ["'w'", "'r'", "'a'", "'x'"], correct: 1 },
      { q: "Faylga yozish uchun qanday rejim?", opts: ["'r'", "'w'", "'x'", "'b'"], correct: 1 },
      { q: "Faylni ochish funksiyasi?", opts: ["read()", "open()", "file()", "load()"], correct: 1 },
      { q: "with open() as f: konstruksiyasi nima uchun?", opts: ["Faylni o'chirish uchun", "Faylni avtomatik yopish uchun", "Faylni ko'chirish uchun", "Faylni yaratish uchun"], correct: 1 },
      { q: "Fayl oxiriga qo'shish uchun qanday rejim?", opts: ["'r'", "'w'", "'a'", "'x'"], correct: 2 }
    ]
  },
  { 
    id: 208, name: "OOP: Obyektga yo'naltirilgan dasturlash", status: "current", 
    aiIntro: "Sinf (Class) va Obyekt. Merosxo'rlik va Inkapsulyatsiya...",
    quiz: [
      { q: "Python-da sinf qanday e'lon qilinadi?", opts: ["object Nom:", "class Nom:", "struct Nom:", "type Nom:"], correct: 1 },
      { q: "__init__ metodi nima?", opts: ["Sinfni o'chiradi", "Obyekt yaratilganda chaqiriladigan konstruktor", "Sinfni chop etadi", "Merosxo'rlik metodi"], correct: 1 },
      { q: "self parametri nima?", opts: ["Tashqi o'zgaruvchi", "Joriy obyektga havola", "Sinf nomi", "Modul nomi"], correct: 1 },
      { q: "Merosxo'rlik (inheritance) nima?", opts: ["Sinfni o'chirish", "Bir sinfning boshqa sinfdan xususiyatlarni olishi", "Obyekt yaratish", "Metod chaqirish"], correct: 1 },
      { q: "Inkapsulyatsiya nima?", opts: ["Ma'lumotlarni ochiq qilish", "Ma'lumotlarni yashirish va himoya qilish", "Merosxo'rlik", "Polimorfizm"], correct: 1 }
    ]
  },
  { 
    id: 209, name: "Xatolar bilan ishlash (Exceptions)", status: "current", 
    aiIntro: "Try-Except bloklari. Kodning 'sinishidan' saqlanish...",
    quiz: [
      { q: "Xatolarni ushlash uchun qaysi blok ishlatiladi?", opts: ["if-else", "try-except", "for-while", "with-as"], correct: 1 },
      { q: "ZeroDivisionError qachon chiqadi?", opts: ["Nolga ko'paytganda", "Nolga bo'lganda", "Nol qo'shganda", "Nolni o'chirganda"], correct: 1 },
      { q: "finally bloki qachon bajariladi?", opts: ["Faqat xato bo'lganda", "Faqat xato bo'lmaganda", "Har doim", "Hech qachon"], correct: 2 },
      { q: "raise operatori nima qiladi?", opts: ["Xatoni ushlaydi", "Xatoni qayta chiqaradi yoki yangi xato yaratadi", "Xatoni o'chiradi", "Xatoni yozadi"], correct: 1 },
      { q: "TypeError qachon chiqadi?", opts: ["Noto'g'ri tur ishlatilganda", "Nolga bo'lganda", "Fayl topilmaganda", "Indeks chegaradan oshganda"], correct: 0 }
    ]
  },
  { 
    id: 210, name: "Tashqi kutubxonalar (PIP)", status: "current", 
    aiIntro: "Boshqalar yozgan koddan foydalanish. Requests va Pandas bilan tanishuv...",
    quiz: [
      { q: "PIP nima?", opts: ["Python dasturlash tili", "Python paketlarini boshqarish tizimi", "Python IDE", "Python versiyasi"], correct: 1 },
      { q: "Kutubxona o'rnatish buyrug'i?", opts: ["python install numpy", "pip install numpy", "import numpy", "get numpy"], correct: 1 },
      { q: "Pandas kutubxonasi nima uchun ishlatiladi?", opts: ["Grafik chizish", "Ma'lumotlarni tahlil qilish", "Veb-sayt yaratish", "O'yin yaratish"], correct: 1 },
      { q: "Requests kutubxonasi nima uchun?", opts: ["Ma'lumotlar tahlili", "HTTP so'rovlar yuborish", "Grafik chizish", "Fayl bilan ishlash"], correct: 1 },
      { q: "NumPy kutubxonasi nima uchun?", opts: ["Veb-dasturlash", "Matematik hisob-kitoblar va massivlar", "Ma'lumotlar bazasi", "Grafik interfeys"], correct: 1 }
    ]
  },
  { id: 211, name: "String (Matn) metodlari", status: "current", aiIntro: "Matnlarni kesish, o'zgartirish va formatlash." },
  { id: 212, name: "Tuple va Set to'plamlari", status: "current", aiIntro: "O'zgarmas va takrorlanmas ma'lumot turlari." },
  { id: 213, name: "List Comprehensions", status: "current", aiIntro: "Bir qatorda ro'yxat yaratish usuli." },
  { id: 214, name: "Lambda funksiyalar", status: "current", aiIntro: "Nomsiz va qisqa funksiyalar." },
  { id: 215, name: "Map, Filter va Reduce", status: "current", aiIntro: "Funksional dasturlash elementlari." },
  { id: 216, name: "Dekoratorlar (Decorators)", status: "current", aiIntro: "Funksiya xatti-harakatini o'zgartirish." },
  { id: 217, name: "Generatorlar va Yield", status: "current", aiIntro: "Xotirani tejash va ma'lumotlarni ketma-ket uzatish." },
  { id: 218, name: "Iterators va Iterables", status: "current", aiIntro: "Iteratsiya qilinuvchi obyektlar." },
  { id: 219, name: "Dunder (Magic) metodlar", status: "current", aiIntro: "__init__, __str__ va boshqalar." },
  { id: 220, name: "OOP: Polimorfizm va Abstraksiya", status: "current", aiIntro: "Kodni moslashuvchan qilish." },
  { id: 221, name: "Ko'p tarmoqli merosxo'rlik", status: "current", aiIntro: "MRO (Method Resolution Order)." },
  { id: 222, name: "Data Classes", status: "current", aiIntro: "Ma'lumotlarni saqlash uchun qulay sinflar." },
  { id: 223, name: "JSON fayllar bilan ishlash", status: "current", aiIntro: "Ma'lumot almashish formati." },
  { id: 224, name: "CSV va Excel fayllarni o'qish", status: "current", aiIntro: "Jadvallar bilan ishlash." },
  { id: 225, name: "Ma'lumotlar bazasi: SQLite", status: "current", aiIntro: "SQL tili asoslari va Python bog'liqligi." },
  { id: 226, name: "ORM: SQLAlchemy asoslari", status: "current", aiIntro: "Kodni SQL ga o'tkazish." },
  { id: 227, name: "RegEx (Muntazam ifodalar)", status: "current", aiIntro: "Matn ichidan qidirish qoidalari." },
  { id: 228, name: "Vaqt bilan ishlash (Datetime)", status: "current", aiIntro: "Sanalar va vaqt oralig'i." },
  { id: 229, name: "Algoritmlar: Qidirish usullari", status: "current", aiIntro: "Linear va Binary Search." },
  { id: 230, name: "Algoritmlar: Saralash usullari", status: "current", aiIntro: "Bubble, Quick va Merge Sort." },
  { id: 231, name: "Ma'lumotlar tuzilmasi: Stack va Queue", status: "current", aiIntro: "FIFO va LIFO prinsiplari." },
  { id: 232, name: "Bog'langan ro'yxatlar (Linked Lists)", status: "current", aiIntro: "Dinamik xotira tuzilmasi." },
  { id: 233, name: "Daraxtlar (Trees) va Grafiklar", status: "current", aiIntro: "Murakkab bog'liqliklar." },
  { id: 234, name: "Rekursiya asoslari", status: "current", aiIntro: "Funksiyaning o'zini o'zi chaqirishi." },
  { id: 235, name: "Veb-skraping: BeautifulSoup", status: "current", aiIntro: "Saytlardan ma'lumot yig'ish." },
  { id: 236, name: "API bilan ishlash: Requests", status: "current", aiIntro: "GET va POST so'rovlari." },
  { id: 237, name: "Asinxron dasturlash (Asyncio)", status: "current", aiIntro: "Kodni parallel bajarish." },
  { id: 238, name: "Multiprocessing va Threading", status: "current", aiIntro: "Oqimlar va jarayonlar." },
  { id: 239, name: "Unit testing (PyTest)", status: "current", aiIntro: "Kodni avtomatik tekshirish." },
  { id: 240, name: "Logging (Xatolarni qayd etish)", status: "current", aiIntro: "Dastur jurnalini yuritish." },
  { id: 241, name: "Veb-freymvork: Flask asoslari", status: "current", aiIntro: "Kichik veb-ilovalar yaratish." },
  { id: 242, name: "Django: Kirish va MVC", status: "current", aiIntro: "Katta loyihalar tuzilmasi." },
  { id: 243, name: "FastAPI: Zamonaviy API", status: "current", aiIntro: "Tezkor va avtomatik dokumentatsiyali API." },
  { id: 244, name: "Git va GitHub asoslari", status: "current", aiIntro: "Versiyalarni boshqarish tizimi." },
  { id: 245, name: "Docker asoslari", status: "current", aiIntro: "Dasturni konteynerga joylash." }
];
