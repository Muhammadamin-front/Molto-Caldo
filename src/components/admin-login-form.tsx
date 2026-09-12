"use client";

import { useActionState } from "react";
import { LogIn } from "lucide-react";
import { login, type LoginState } from "@/app/admin/actions";

const MESSAGE: Record<string, string> = {
  invalid: "Email yoki parol to'g'ri kelmadi.",
  bad_input: "Emailni to'liq va to'g'ri kiriting.",
  not_configured:
    "Admin panel hali sozlanmagan: .env.local da DATABASE_URL va AUTH_SECRET to'ldirilishi, so'ng `npm run db:push && npm run db:seed` ishga tushirilishi kerak.",
};

export function AdminLoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    login,
    {},
  );

  const field =
    "mt-1.5 w-full rounded-lg border border-[var(--line-strong)] bg-[var(--surface)] px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--accent)]";

  return (
    <form action={formAction} className="mt-8">
      <label className="block">
        <span className="text-sm font-medium">Email</span>
        <input
          name="email"
          type="email"
          autoComplete="username"
          required
          className={field}
        />
      </label>

      <label className="mt-4 block">
        <span className="text-sm font-medium">Parol</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={field}
        />
      </label>

      {state.error && (
        <p className="mt-4 rounded-lg border border-[var(--accent)]/30 bg-[var(--accent)]/8 px-3.5 py-2.5 text-xs leading-relaxed text-[var(--accent)]">
          {MESSAGE[state.error]}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3.5 text-sm font-semibold text-[var(--accent-ink)] transition-transform duration-300 hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
        style={{ transitionTimingFunction: "var(--ease)" }}
      >
        <LogIn size={16} />
        {pending ? "Tekshirilmoqda..." : "Kirish"}
      </button>
    </form>
  );
}
