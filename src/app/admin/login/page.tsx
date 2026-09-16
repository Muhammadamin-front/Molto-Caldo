import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import AuthSwitch from "@/components/ui/auth-switch";

/**
 * Kirgan-kirmaganlik sessiyaga bog'liq — bu sahifa hech qachon oldindan (build vaqtida)
 * tayyorlanmasligi kerak, aks holda kirgan adminga ham keshdagi
 * "kirish" sahifasi ko'rsatilib qolishi mumkin.
 */
export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  // Allaqachon kirgan bo'lsa qaytadan so'ramaymiz.
  if (await getSession()) redirect("/admin");

  return <AuthSwitch />;
}
