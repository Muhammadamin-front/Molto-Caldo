/**
 * Namuna katalogi. DATABASE_URL berilmagan bo'lsa sayt shu ma'lumot bilan
 * ishlaydi — shunday qilib do'konni baza ulanmasdan ham ko'rish mumkin.
 * Seed skripti (`npm run db:seed`) xuddi shu ro'yxatni Postgresga yozadi.
 */

export interface SampleVariant {
  id: number;
  size: string;
  colorName: string;
  colorHex: string;
  sku: string;
  stock: number;
}

export interface SampleProduct {
  id: number;
  slug: string;
  categorySlug: string;
  nameUz: string;
  nameRu: string;
  nameEn: string;
  descriptionUz: string;
  descriptionRu: string;
  descriptionEn: string;
  materialUz: string;
  materialRu: string;
  materialEn: string;
  price: number;
  compareAtPrice: number | null;
  images: string[];
  isFeatured: boolean;
  isActive: boolean;
  variants: SampleVariant[];
}

export const sampleCategories = [
  {
    id: 1,
    slug: "palto",
    nameUz: "Paltolar",
    nameRu: "Пальто",
    nameEn: "Coats",
    sortOrder: 1,
  },
  {
    id: 2,
    slug: "kurtka",
    nameUz: "Kurtkalar",
    nameRu: "Куртки",
    nameEn: "Jackets",
    sortOrder: 2,
  },
  {
    id: 3,
    slug: "trikotaj",
    nameUz: "Trikotaj",
    nameRu: "Трикотаж",
    nameEn: "Knitwear",
    sortOrder: 3,
  },
];

const SIZES = ["S", "M", "L", "XL"];

function variants(
  startId: number,
  sku: string,
  colors: { name: string; hex: string; stock: number[] }[],
): SampleVariant[] {
  const out: SampleVariant[] = [];
  let id = startId;
  colors.forEach((color, ci) => {
    SIZES.forEach((size, si) => {
      out.push({
        id: id++,
        size,
        colorName: color.name,
        colorHex: color.hex,
        sku: `${sku}-${ci + 1}-${size}`,
        stock: color.stock[si] ?? 0,
      });
    });
  });
  return out;
}

export const sampleProducts: SampleProduct[] = [
  {
    id: 1,
    slug: "cappotto-milano",
    categorySlug: "palto",
    nameUz: "Cappotto Milano palto",
    nameRu: "Пальто Cappotto Milano",
    nameEn: "Cappotto Milano coat",
    descriptionUz:
      "Klassik to'g'ri qirqimli palto. Yelka chizig'i aniq tushadi, yenglar bilak ustida tugaydi. Ichki cho'ntaklari bor, astar butun bo'ylab tikilgan.",
    descriptionRu:
      "Классическое пальто прямого кроя. Линия плеча ложится чётко, рукава заканчиваются на запястье. Есть внутренние карманы, подкладка прострочена по всей длине.",
    descriptionEn:
      "A classic straight-cut coat. The shoulder line sits cleanly and the sleeves finish at the wrist. Inside pockets, fully stitched lining.",
    materialUz: "70% jun, 20% poliester, 10% kashmir. Quruq tozalash.",
    materialRu: "70% шерсть, 20% полиэстер, 10% кашемир. Сухая чистка.",
    materialEn: "70% wool, 20% polyester, 10% cashmere. Dry clean only.",
    price: 219_000_000,
    compareAtPrice: 259_000_000,
    images: ["/products/cappotto-milano-1.jpg"],
    isFeatured: true,
    isActive: true,
    variants: variants(101, "MC-CM", [
      { name: "Kamel", hex: "#b08056", stock: [4, 7, 6, 3] },
      { name: "Grafit", hex: "#3b3a38", stock: [2, 5, 5, 4] },
    ]),
  },
  {
    id: 2,
    slug: "cappotto-roma",
    categorySlug: "palto",
    nameUz: "Cappotto Roma palto",
    nameRu: "Пальто Cappotto Roma",
    nameEn: "Cappotto Roma coat",
    descriptionUz:
      "Ikki qator tugmali, bel chizig'i belgilangan palto. Sovuq kunlar uchun zich jun matodan tikilgan.",
    descriptionRu:
      "Двубортное пальто с обозначенной линией талии. Сшито из плотной шерсти для холодных дней.",
    descriptionEn:
      "A double-breasted coat with a defined waist, cut from dense wool for cold days.",
    materialUz: "80% jun, 20% poliamid. Quruq tozalash.",
    materialRu: "80% шерсть, 20% полиамид. Сухая чистка.",
    materialEn: "80% wool, 20% polyamide. Dry clean only.",
    price: 265_000_000,
    compareAtPrice: null,
    images: ["/products/cappotto-roma-1.jpg"],
    isFeatured: true,
    isActive: true,
    variants: variants(201, "MC-CR", [
      { name: "Qora", hex: "#1c1a19", stock: [3, 6, 4, 2] },
      { name: "Marsala", hex: "#6d2b2b", stock: [2, 3, 3, 1] },
    ]),
  },
  {
    id: 3,
    slug: "giacca-alpina",
    categorySlug: "kurtka",
    nameUz: "Giacca Alpina kurtka",
    nameRu: "Куртка Giacca Alpina",
    nameEn: "Giacca Alpina jacket",
    descriptionUz:
      "Suv o'tkazmaydigan ustki qatlam va issiq to'ldiruvchi. Kapyushon yechiladi, manjetlar sozlanadi.",
    descriptionRu:
      "Водоотталкивающий верхний слой и тёплый наполнитель. Капюшон отстёгивается, манжеты регулируются.",
    descriptionEn:
      "A water-repellent shell over a warm fill. The hood detaches and the cuffs adjust.",
    materialUz: "Tashqi: 100% poliester. To'ldiruvchi: sintetik paxta 200 g/m².",
    materialRu: "Верх: 100% полиэстер. Наполнитель: синтепух 200 г/м².",
    materialEn: "Shell: 100% polyester. Fill: synthetic down 200 g/m².",
    price: 149_000_000,
    compareAtPrice: 179_000_000,
    images: ["/products/giacca-alpina-1.jpg"],
    isFeatured: true,
    isActive: true,
    variants: variants(301, "MC-GA", [
      { name: "Zaytun", hex: "#4a5340", stock: [5, 8, 7, 4] },
      { name: "Qora", hex: "#1c1a19", stock: [4, 9, 8, 5] },
    ]),
  },
  {
    id: 4,
    slug: "giacca-bomber",
    categorySlug: "kurtka",
    nameUz: "Bomber Inverno kurtka",
    nameRu: "Куртка Bomber Inverno",
    nameEn: "Bomber Inverno jacket",
    descriptionUz:
      "Qisqa qirqimli bomber. Rezinkali manjet va etak, ko'krak cho'ntagi bor.",
    descriptionRu:
      "Короткий бомбер. Манжеты и низ на резинке, есть нагрудный карман.",
    descriptionEn:
      "A short bomber with ribbed cuffs and hem, plus a chest pocket.",
    materialUz: "Tashqi: 100% neylon. Astar: 100% poliester.",
    materialRu: "Верх: 100% нейлон. Подкладка: 100% полиэстер.",
    materialEn: "Shell: 100% nylon. Lining: 100% polyester.",
    price: 119_000_000,
    compareAtPrice: null,
    images: ["/products/bomber-inverno-1.jpg"],
    isFeatured: false,
    isActive: true,
    variants: variants(401, "MC-BI", [
      { name: "Qora", hex: "#1c1a19", stock: [6, 10, 8, 3] },
      { name: "Bej", hex: "#c9b295", stock: [3, 5, 4, 2] },
    ]),
  },
  {
    id: 5,
    slug: "maglione-merino",
    categorySlug: "trikotaj",
    nameUz: "Maglione Merino sviter",
    nameRu: "Свитер Maglione Merino",
    nameEn: "Maglione Merino sweater",
    descriptionUz:
      "Merinos junidan to'qilgan sviter. Teriga qichishmaydi, shaklini uzoq saqlaydi.",
    descriptionRu:
      "Свитер из мериносовой шерсти. Не колется и долго держит форму.",
    descriptionEn:
      "A merino wool sweater that does not itch and holds its shape.",
    materialUz: "100% merinos juni. 30°C da qo'lda yuvish.",
    materialRu: "100% мериносовая шерсть. Ручная стирка при 30°C.",
    materialEn: "100% merino wool. Hand wash at 30°C.",
    price: 79_000_000,
    compareAtPrice: 95_000_000,
    images: ["/products/maglione-merino-1.jpg"],
    isFeatured: true,
    isActive: true,
    variants: variants(501, "MC-MM", [
      { name: "Tutun", hex: "#6e6a63", stock: [7, 12, 9, 5] },
      { name: "Terrakota", hex: "#a4522f", stock: [4, 8, 6, 3] },
    ]),
  },
  {
    id: 6,
    slug: "dolcevita-collo",
    categorySlug: "trikotaj",
    nameUz: "Dolcevita bo'yinbog'li sviter",
    nameRu: "Свитер Dolcevita с высоким горлом",
    nameEn: "Dolcevita roll-neck sweater",
    descriptionUz:
      "Baland yoqali sviter. Palto ostiga ham, alohida ham kiyiladi.",
    descriptionRu:
      "Свитер с высоким воротом. Носится и под пальто, и отдельно.",
    descriptionEn: "A high-neck sweater, worn under a coat or on its own.",
    materialUz: "90% merinos juni, 10% kashmir. Qo'lda yuvish.",
    materialRu: "90% мериносовая шерсть, 10% кашемир. Ручная стирка.",
    materialEn: "90% merino wool, 10% cashmere. Hand wash.",
    price: 92_000_000,
    compareAtPrice: null,
    images: ["/products/dolcevita-collo-1.jpg"],
    isFeatured: false,
    isActive: true,
    variants: variants(601, "MC-DC", [
      { name: "Krem", hex: "#e2d6c2", stock: [5, 9, 7, 4] },
      { name: "Qora", hex: "#1c1a19", stock: [6, 10, 8, 4] },
    ]),
  },
  {
    id: 7,
    slug: "cappotto-lungo",
    categorySlug: "palto",
    nameUz: "Cappotto Lungo uzun palto",
    nameRu: "Длинное пальто Cappotto Lungo",
    nameEn: "Cappotto Lungo long coat",
    descriptionUz:
      "Tizzadan pastga tushadigan uzun palto. Orqa tomonida yurish uchun kesik bor.",
    descriptionRu:
      "Длинное пальто ниже колена. Сзади предусмотрена шлица для шага.",
    descriptionEn:
      "A long coat falling below the knee, with a back vent for stride.",
    materialUz: "75% jun, 25% poliester. Quruq tozalash.",
    materialRu: "75% шерсть, 25% полиэстер. Сухая чистка.",
    materialEn: "75% wool, 25% polyester. Dry clean only.",
    price: 289_000_000,
    compareAtPrice: null,
    images: ["/products/cappotto-lungo-1.jpg"],
    isFeatured: false,
    isActive: true,
    variants: variants(701, "MC-CL", [
      { name: "Kamel", hex: "#b08056", stock: [2, 4, 3, 1] },
      { name: "Grafit", hex: "#3b3a38", stock: [3, 5, 4, 2] },
    ]),
  },
  {
    id: 8,
    slug: "gilet-lana",
    categorySlug: "trikotaj",
    nameUz: "Gilet Lana jiletka",
    nameRu: "Жилет Gilet Lana",
    nameEn: "Gilet Lana vest",
    descriptionUz:
      "Yengsiz jun jiletka. Ko'ylak ustidan kiyiladi, harakatni cheklamaydi.",
    descriptionRu:
      "Шерстяной жилет без рукавов. Надевается поверх рубашки, не сковывает движения.",
    descriptionEn:
      "A sleeveless wool vest worn over a shirt; it does not restrict movement.",
    materialUz: "100% jun. Qo'lda yuvish.",
    materialRu: "100% шерсть. Ручная стирка.",
    materialEn: "100% wool. Hand wash.",
    price: 64_000_000,
    compareAtPrice: null,
    images: ["/products/gilet-lana-1.jpg"],
    isFeatured: false,
    isActive: true,
    variants: variants(801, "MC-GL", [
      { name: "Tutun", hex: "#6e6a63", stock: [4, 7, 5, 2] },
      { name: "Marsala", hex: "#6d2b2b", stock: [3, 5, 4, 2] },
    ]),
  },
];
