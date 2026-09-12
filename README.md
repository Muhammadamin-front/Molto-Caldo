# Molto Caldo — internet do'kon

Issiq ustki kiyim brendi uchun uch tilli (o'zbek / rus / ingliz) internet do'kon.

## Texnologiyalar

| Qatlam | Tanlov |
| --- | --- |
| Framework | Next.js 16 (App Router, React 19) |
| Uslub | Tailwind CSS 4 + CSS o'zgaruvchilari (yorug'/qorong'i mavzu) |
| Tillar | next-intl — `uz` (asosiy), `ru`, `en` |
| Baza | Postgres + Drizzle ORM |
| Animatsiya | IntersectionObserver reveal + CSS, `cubic-bezier(.16,1,.3,1)` |
| Hosting | Vercel |

## Ishga tushirish

```bash
npm install
npm run dev
```

`http://localhost:3000` ochiladi. **Baza ulanmagan bo'lsa ham ishlaydi** —
`src/db/sample-data.ts` dagi namuna katalog ko'rsatiladi.

## Bazani ulash

1. Neon (https://neon.tech) yoki Vercel Postgres'da bepul baza yarating.
2. `.env.local` ga ulanish satrini yozing:

```
DATABASE_URL="postgresql://..."
```

3. Jadvallarni yarating va to'ldiring:

```bash
npm run db:push
npm run db:seed
```

`DATABASE_URL` to'ldirilgan zahoti sayt avtomatik bazadan o'qiy boshlaydi.

## Tuzilma

```
src/
  app/[locale]/          sahifalar (bosh, katalog, mahsulot, savat, buyurtma)
  app/api/orders/        buyurtma qabul qilish
  app/api/variants/      savat uchun joriy narx va zaxira
  app/sitemap.ts         uchta til uchun sitemap + hreflang
  app/robots.ts          savat/buyurtma/API indekslanmaydi
  components/            UI komponentlar (savat, header, footer, kartochka)
  db/                    Drizzle sxemasi, namuna ma'lumot, seed
  i18n/                  next-intl yo'nalishlari
  lib/                   katalog so'rovlari, buyurtma mantiqi, yordamchilar
messages/                uz.json / ru.json / en.json
```

## Muhim qarorlar

- **Narxlar tiyinda saqlanadi** (`1 so'm = 100 tiyin`) — kasr sonlardagi
  yaxlitlash xatolarini oldini olish uchun.
- **Klient faqat `variantId` va `quantity` yuboradi.** Nom, narx va zaxira
  serverda katalogdan olinadi — brauzerdan kelgan summa umuman o'qilmaydi.
- **Zaxira buyurtma tranzaksiyasi ichida kamayadi**, `stock >= quantity`
  sharti bilan. Shart bajarilmasa tranzaksiya bekor bo'ladi va xaridorga
  nima tugaganini aytadi — oxirgi dona ikki kishiga sotilmaydi.
- **Savat ochilganda `/api/variants` dan yangilanadi.** `localStorage` dagi
  savat haftalab turishi mumkin; narx yoki zaxira o'zgargan bo'lsa savat
  to'g'rilanadi va xaridor ogohlantiriladi.
- **Buyurtma qatorlari denormallashtirilgan** — mahsulot keyin o'zgartirilsa
  ham eski buyurtma o'zgarmaydi.
- **`global-not-found.tsx`** — ildiz layout `[locale]` ichida bo'lgani uchun
  Next hech qaysi yo'nalishga tushmagan manzilni layout bilan ko'rsata
  olmaydi (`experimental.globalNotFound`). Mahsulot topilmaganda esa
  tarjima qilingan `[locale]/not-found.tsx` ishlaydi.

## Hali qilinmagan

- **Admin panel** (buyurtmalar ro'yxati, holatni o'zgartirish). `admin_users`
  jadvali, `bcryptjs`, `jose` va `AUTH_SECRET` tayyor — sahifaning o'zi yo'q.
  Hozir yangi buyurtma faqat bazada turadi, hech kimga xabar ketmaydi.
- **Click / Payme integratsiyasi** — merchant kalitlari kerak
  (`.env.example` ga qarang). Hozir har bir buyurtma amalda naqd to'lov.
- **Telegram xabarnomasi** — bot tokeni kerak.
- **O'lchamlar jadvali** — `product.sizeGuide` kaliti va `SIZES` ro'yxati
  turibdi, lekin haqiqiy o'lcham (ko'krak, yeng, uzunlik) ma'lumoti yo'q.
  O'ylab topilgan santimetrlar xaridorga noto'g'ri o'lcham sotib qo'yadi,
  shuning uchun jadval brend o'lchovlari berilgandan keyin qo'shiladi.
- **Har bir mahsulotga bir nechta fotosurat** — mahsulot sahifasidagi lenta
  tayyor, hozir har bir modelda bittadan surat bor.
