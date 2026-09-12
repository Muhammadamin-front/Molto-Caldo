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
  components/            UI komponentlar (savat, header, footer, kartochka)
  db/                    Drizzle sxemasi, namuna ma'lumot, seed
  i18n/                  next-intl yo'nalishlari
  lib/                   katalog so'rovlari, buyurtma mantiqi, yordamchilar
messages/                uz.json / ru.json / en.json
```

## Muhim qarorlar

- **Narxlar tiyinda saqlanadi** (`1 so'm = 100 tiyin`) — kasr sonlardagi
  yaxlitlash xatolarini oldini olish uchun.
- **Buyurtma jami har doim serverda qayta hisoblanadi** — klient yuborgan
  summaga ishonilmaydi.
- **Buyurtma qatorlari denormallashtirilgan** — mahsulot keyin o'zgartirilsa
  ham eski buyurtma o'zgarmaydi.
- Savat `localStorage` da, brauzerda saqlanadi.

## Hali qilinmagan

- Click / Payme integratsiyasi — merchant kalitlari kerak (`.env.example` ga qarang)
- Admin panel (buyurtmalar ro'yxati, mahsulot qo'shish)
- Haqiqiy mahsulot fotosuratlari — hozir `public/products/` da vaqtinchalik
  mato namunalari turibdi
