import "server-only";

/**
 * So'rov yuborgan manzil. Vercel va ko'pchilik proksilar `x-forwarded-for`
 * qo'yadi — birinchi element asl mijoz. Sarlavha bo'lmasa (lokal ishga
 * tushirish) "unknown": bu holda barcha so'rovlar bitta hisobga tushadi,
 * bu faqat lokalda uchraydi.
 *
 * Eslatma: `x-forwarded-for` ni mijozning o'zi ham yuborishi mumkin. Vercel
 * uni o'zi qayta yozadi; boshqa hostingda proksi shunday qilishini tekshiring,
 * aks holda IP bo'yicha limitni chetlab o'tish mumkin (telefon bo'yicha limit
 * baribir ishlaydi).
 */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first.slice(0, 64);
  }
  return headers.get("x-real-ip")?.trim().slice(0, 64) || "unknown";
}
