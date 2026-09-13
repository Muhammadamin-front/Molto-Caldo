"use client";

import { useActionState, useEffect, useRef } from "react";
import { KeyRound } from "lucide-react";
import { changePassword, type PasswordState } from "@/app/admin/actions";

const MESSAGE: Record<NonNullable<PasswordState["status"]>, string> = {
  ok: "Parol almashtirildi. Boshqa qurilmalardagi sessiyalar yopildi.",
  wrong_current: "Joriy parol noto'g'ri.",
  too_short: "Yangi parol kamida 12 belgidan iborat bo'lishi kerak.",
  mismatch: "Yangi parol va takrori bir xil emas.",
  rate_limited: "Juda ko'p xato urinish. 15 daqiqadan keyin qayta urinib ko'ring.",
  error: "Parolni almashtirib bo'lmadi.",
};

export function AdminPasswordForm() {
  const [state, formAction, pending] = useActionState<PasswordState, FormData>(
    changePassword,
    {},
  );
  const formRef = useRef<HTMLFormElement>(null);

  // Muvaffaqiyatdan keyin maydonlarda parol qolib ketmasin.
  useEffect(() => {
    if (state.status === "ok") formRef.current?.reset();
  }, [state]);

  const field =
    "mt-1.5 w-full rounded-lg border border-[var(--line-strong)] bg-[var(--surface)] px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-[var(--accent)]";

  return (
    <details className="group rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5">
      <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold">
        <KeyRound size={15} className="text-[var(--ink-mute)]" />
        Parolni almashtirish
      </summary>

      <form ref={formRef} action={formAction} className="mt-4 grid gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="text-xs font-medium text-[var(--ink-soft)]">Joriy parol</span>
          <input name="current" type="password" autoComplete="current-password" required className={field} />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-[var(--ink-soft)]">Yangi parol (12+)</span>
          <input name="next" type="password" autoComplete="new-password" minLength={12} required className={field} />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-[var(--ink-soft)]">Takroran</span>
          <input name="confirm" type="password" autoComplete="new-password" minLength={12} required className={field} />
        </label>

        <div className="flex flex-wrap items-center gap-3 sm:col-span-3">
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-[var(--bg)] disabled:opacity-60"
          >
            {pending ? "Saqlanmoqda..." : "Saqlash"}
          </button>
          {state.status && (
            <p
              role={state.status === "ok" ? "status" : "alert"}
              className={
                state.status === "ok"
                  ? "text-xs text-[var(--ink-soft)]"
                  : "text-xs text-[var(--accent)]"
              }
            >
              {MESSAGE[state.status]}
            </p>
          )}
        </div>
      </form>
    </details>
  );
}
