import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AdminLoginForm } from "@/components/admin-login-form";

/**
 * Kirgan-kirmaganlik sessiyaga bog'liq — bu sahifa hech qachon oldindan (build vaqtida)
 * tayyorlanmasligi kerak, aks holda kirgan adminga ham keshdagi
 * "kirish" sahifasi ko'rsatilib qolishi mumkin.
 */
export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  // Allaqachon kirgan bo'lsa qaytadan so'ramaymiz.
  if (await getSession()) redirect("/admin");

  return (
    <div className="grid min-h-dvh place-items-center px-5 py-16">
      <div className="w-full max-w-sm">
        <p className="font-display text-xl font-semibold tracking-tight">
          Molto<span className="text-[var(--accent)]">.</span>Caldo
        </p>
        <h1 className="mt-6 font-display text-2xl font-semibold tracking-tight">
          Boshqaruv paneli
        </h1>
        <p className="mt-2 text-sm text-[var(--ink-soft)]">
          Buyurtmalarni ko&apos;rish uchun tizimga kiring.
        </p>

        <AdminLoginForm />

        <Link
          href="/"
          className="mt-8 block text-center text-sm text-[var(--ink-mute)] transition-colors hover:text-[var(--ink)]"
        >
          ← Do&apos;konga qaytish
        </Link>
      </div>
    </div>
  );
}
