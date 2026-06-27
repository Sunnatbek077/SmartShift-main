// ============================================================
// Tayyor HTML laboratoriya darslari kutubxonasi.
// Fayllar public/lab-library/{fanId}/*.html da joylashgan va
// fetch orqali o'qib, custom-upload bilan bir xil oqimga uzatiladi.
// ============================================================

export const LAB_LIBRARY = {
  algebra: [
    { id: "alg-tenglamalar-sistemasi", name: "Chiziqli va kvadrat tenglamalar sistemasi", path: "/lab-library/algebra/chiziqli-kvadrat-tenglamalar-sistemasi.html" },
    { id: "alg-funksiyalar-3d", name: "Funksiyalar (3D)", path: "/lab-library/algebra/funksiyalar-3d.html" },
    { id: "alg-funksiyalar-lab", name: "Funksiyalar laboratoriyasi", path: "/lab-library/algebra/funksiyalar-laboratoriyasi.html" },
    { id: "alg-korsatkichli-logarifmik", name: "Ko'rsatkichli va logarifmik funksiyalar", path: "/lab-library/algebra/korsatkichli-logarifmik-funksiyalar.html" },
    { id: "alg-sonlar-toplamlari", name: "Sonlar to'plamlari", path: "/lab-library/algebra/sonlar-toplamlari.html" },
  ],
  biologiya: [
    { id: "bio-dnk-rnk", name: "DNK va RNK", path: "/lab-library/biologiya/dnk-rnk.html" },
    { id: "bio-fotosintez", name: "Fotosintez va nafas olish", path: "/lab-library/biologiya/fotosintez-va-nafas-olish.html" },
    { id: "bio-hujayra", name: "Hujayra", path: "/lab-library/biologiya/hujayra.html" },
    { id: "bio-mendel", name: "Mendel genetikasi", path: "/lab-library/biologiya/mendel-genetikasi.html" },
    { id: "bio-oqsillar", name: "Oqsillar", path: "/lab-library/biologiya/oqsillar.html" },
  ],
  fizika: [
    { id: "fiz-energiya-3d", name: "Energiya laboratoriyasi (3D)", path: "/lab-library/fizika/energiya-laboratoriyasi-3d.html" },
    { id: "fiz-kinematika", name: "Kinematika laboratoriyasi", path: "/lab-library/fizika/kinematika-laboratoriyasi.html" },
    { id: "fiz-kulon", name: "Kulon kuchi laboratoriyasi", path: "/lab-library/fizika/kulon-laboratoriyasi.html" },
    { id: "fiz-nyuton", name: "Nyuton qonunlari va dinamika", path: "/lab-library/fizika/nyuton-qonunlari-va-dinamika.html" },
    { id: "fiz-termodinamika", name: "Termodinamika", path: "/lab-library/fizika/termodinamika.html" },
  ],
  geometriya: [
    { id: "geo-fazoda-harakat", name: "Fazoda to'g'ri chiziqli tekis harakat", path: "/lab-library/geometriya/fazoda-togri-chiziqli-tekis-harakat.html" },
    { id: "geo-kopburchaklar", name: "Ko'pburchaklar", path: "/lab-library/geometriya/kopburchaklar.html" },
    { id: "geo-konus-kesimlari", name: "Konus kesimlari", path: "/lab-library/geometriya/konus-kesimlari.html" },
    { id: "geo-togri-chiziq-tekislik", name: "To'g'ri chiziq va tekislik", path: "/lab-library/geometriya/togri-chiziq-va-tekislik.html" },
    { id: "geo-vektorlar", name: "Vektorlar", path: "/lab-library/geometriya/vektorlar.html" },
  ],
  kimyo: [
    { id: "kim-atomlar", name: "Atomlar tuzilishi", path: "/lab-library/kimyo/atomlar.html" },
    { id: "kim-eritmalar", name: "Eritmalar", path: "/lab-library/kimyo/eritmalar.html" },
    { id: "kim-boglanishlar", name: "Kimyoviy bog'lanishlar", path: "/lab-library/kimyo/kimyoviy-boglanishlar.html" },
    { id: "kim-organik", name: "Organik kimyo", path: "/lab-library/kimyo/organik-kimyo.html" },
    { id: "kim-reaksiyalar", name: "Kimyoviy reaksiyalar", path: "/lab-library/kimyo/reaksiyalar.html" },
  ],
};

export function getLabLibraryForFan(fanId) {
  const baseId = String(fanId || "").replace(/[0-9]+$/, "");
  return LAB_LIBRARY[baseId] || LAB_LIBRARY[fanId] || [];
}
