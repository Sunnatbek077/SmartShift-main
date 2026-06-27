# EduMind — AI-asoslangan ta'lim platformasi

O'zbekiston oliy ta'lim muassasalari uchun mo'ljallangan, sun'iy intellektga asoslangan interaktiv ta'lim platformasi. Professorlarga avtomatik baholash va hisobot bilan vaqt tejaydi, talabalarga 24/7 shaxsiy AI ustoz (Nigora) taqdim etadi, vazirlikka esa barcha muassasalar bo'yicha umumiy statistikani ko'rish imkonini beradi.

## Asosiy imkoniyatlar

- Talabalar uchun — interaktiv darslar, 3D fizik simulyatsiyalar (Newton, O'natili), AI chat-ustoz, video darslar, quiz va amaliy mashqlar, AI orqali avtomatik baholanadigan topshiriqlar.
- Professorlar uchun — talabalar progressini kuzatish, AI yordamida tez baholash, HTML/Word/video formatdagi mashg'ulot va laboratoriya materiallarini yuklash, avtomatik hisobotlar.
- Vazirlik uchun — barcha o'qituvchi va talabalar bo'yicha umumiy statistika: jami talabalar, o'rtacha ball, "diqqat talab" guruhlar — faqat ko'rish huquqi bilan alohida kirish.
- Admin panel — o'qituvchilarni boshqarish, parollarni qayta o'rnatish, yangi o'qituvchi qo'shish.
- Biometrik ro'yxatdan o'tish — talabalar uchun ixtiyoriy biometrik profil yaratish.
- Bulutli sinxronizatsiya — Supabase orqali barcha ma'lumotlar istalgan qurilmada saqlanadi va sinxronlanadi.
- Ovozli yordamchi (Nigora) — Yandex Cloud SpeechKit orqali o'zbek tilida ovozli salomlashish va darslarni ovozli tushuntirish.

## Texnologiyalar

- Frontend: React 18, Vite 6, React Router
- State: Zustand
- Backend / Ma'lumotlar bazasi: Supabase (PostgreSQL + REST API)
- AI: Google Gemini (avtomatik baholash, dars yozish), Yandex Cloud SpeechKit (matn-ovoz)
- 3D: Three.js
- Boshqa: localforage (offline saqlash), mammoth (Word fayllarni o'qish), xlsx (Excel import)

## Loyihani ishga tushirish


npm install
npm run dev       # development server (http://localhost:5173)
npm run build     # production build
npm run preview   # build natijasini ko'rish
npm run lint       # ESLint tekshiruvi
npm test           # Vitest testlari


> ⚠️ Standart parollarni production muhitida albatta o'zgartiring.

## Muhit o'zgaruvchilari

Supabase ulanishi localStorage orqali sozlanadi (`supabase_url`, supabase_key`) — ilova ichidagi ☁ tugmasi orqali kiritiladi, alohida .env` fayl talab qilinmaydi.
