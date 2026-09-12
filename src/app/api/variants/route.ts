import { NextResponse, type NextRequest } from "next/server";
import { getVariantsById } from "@/lib/catalog";
import { routing, type Locale } from "@/i18n/routing";

const MAX_IDS = 50;

/**
 * Savatdagi qatorlarni yangilash uchun: narx, zaxira va nom — hammasi
 * serverdan. Savat `localStorage` da haftalab turishi mumkin, shuning uchun
 * unda saqlangan narxga ishonmaymiz.
 *
 * GET /api/variants?ids=101,102&locale=ru
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const ids = (params.get("ids") ?? "")
    .split(",")
    .map((part) => Number.parseInt(part, 10))
    .filter((id) => Number.isInteger(id) && id > 0)
    .slice(0, MAX_IDS);

  if (ids.length === 0) {
    return NextResponse.json({ variants: [] });
  }

  const requested = params.get("locale");
  const locale: Locale = routing.locales.includes(requested as Locale)
    ? (requested as Locale)
    : routing.defaultLocale;

  try {
    const variants = await getVariantsById(locale, ids);
    return NextResponse.json({ variants });
  } catch (error) {
    console.error("[variants] lookup failed", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
