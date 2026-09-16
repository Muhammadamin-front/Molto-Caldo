"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { useState } from "react";
import { AdminLoginForm } from "@/components/admin-login-form";
import { cn } from "@/lib/utils";

type AuthMode = "login" | "signup";

const PANEL_TRANSITION = {
  type: "spring" as const,
  stiffness: 145,
  damping: 22,
  mass: 0.85,
};

export const Component = () => {
  const [mode, setMode] = useState<AuthMode>("login");
  const reduceMotion = useReducedMotion();
  const isLogin = mode === "login";

  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden bg-[#f4efe9] px-4 py-24 text-[#171214] sm:px-6">
      <motion.div
        aria-hidden="true"
        className="absolute -left-28 top-12 size-72 rounded-full bg-[#d21f30]/16 blur-3xl"
        animate={
          reduceMotion
            ? undefined
            : { x: [0, 42, 0], y: [0, -28, 0], scale: [1, 1.12, 1] }
        }
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden="true"
        className="absolute -bottom-32 -right-20 size-96 rounded-full bg-[#951625]/14 blur-3xl"
        animate={
          reduceMotion
            ? undefined
            : { x: [0, -36, 0], y: [0, 24, 0], scale: [1, 1.08, 1] }
        }
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
      />

      <Link
        href="/"
        className="absolute left-5 top-6 z-20 font-display text-xl font-semibold tracking-tight sm:left-8 sm:top-8"
      >
        Molto<span className="text-[#d21f30]">.</span>Caldo
      </Link>
      <Link
        href="/"
        className="absolute right-5 top-6 z-20 inline-flex items-center gap-2 text-sm font-medium text-[#62595c] transition-colors hover:text-[#d21f30] sm:right-8 sm:top-8"
      >
        <ArrowLeft size={15} />
        Do&apos;konga qaytish
      </Link>

      <motion.section
        initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-black/8 bg-white shadow-[0_32px_90px_-42px_rgba(75,15,24,0.55)] md:grid-cols-2"
      >
        <motion.aside
          layout={!reduceMotion}
          transition={{ layout: PANEL_TRANSITION }}
          className={cn(
            "relative flex min-h-72 flex-col justify-between overflow-hidden bg-[#b8192d] p-8 text-white sm:p-10 md:min-h-[620px] md:p-12",
            isLogin ? "md:order-1" : "md:order-2",
          )}
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.16)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.16)_1px,transparent_1px)] [background-size:42px_42px] [mask-image:linear-gradient(to_bottom,black,transparent_88%)]"
          />
          <motion.div
            aria-hidden="true"
            className="absolute -right-24 top-16 size-64 rounded-full border border-white/20"
            animate={reduceMotion ? undefined : { rotate: 360, scale: [1, 1.08, 1] }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            aria-hidden="true"
            className="absolute -bottom-28 -left-20 size-72 rounded-full bg-white/10 blur-2xl"
            animate={reduceMotion ? undefined : { x: [0, 28, 0], y: [0, -20, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="relative z-10 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] backdrop-blur-sm">
            <Sparkles size={13} />
            Molto Caldo
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={mode}
              initial={reduceMotion ? false : { opacity: 0, x: isLogin ? -24 : 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, x: isLogin ? 24 : -24 }}
              transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 my-10"
            >
              <p className="text-sm font-semibold text-white/64">
                {isLogin ? "Yangi foydalanuvchimisiz?" : "Akkauntingiz bormi?"}
              </p>
              <h2 className="mt-3 max-w-sm font-display text-4xl font-semibold leading-[1.04] tracking-[-0.04em] sm:text-5xl">
                {isLogin
                  ? "Yangi imkoniyatlarga bir qadam."
                  : "Yana bir bor xush kelibsiz."}
              </h2>
              <p className="mt-5 max-w-sm text-sm leading-6 text-white/72 sm:text-base">
                {isLogin
                  ? "Profil imkoniyatlari haqida bilish va jamoa bilan bog‘lanish uchun ro‘yxatdan o‘tish bo‘limini oching."
                  : "Buyurtmalarni boshqarish uchun mavjud administrator profilingizga kiring."}
              </p>
            </motion.div>
          </AnimatePresence>

          <button
            type="button"
            onClick={() => setMode(isLogin ? "signup" : "login")}
            className="relative z-10 inline-flex w-fit items-center gap-2 rounded-full border border-white/28 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white hover:text-[#b8192d]"
          >
            {isLogin ? "Ro‘yxatdan o‘tish" : "Kirish"}
            <ArrowRight size={16} />
          </button>
        </motion.aside>

        <motion.div
          layout={!reduceMotion}
          transition={{ layout: PANEL_TRANSITION }}
          className={cn(
            "flex min-h-[520px] items-center p-7 sm:p-12 md:min-h-[620px] md:p-14",
            isLogin ? "md:order-2" : "md:order-1",
          )}
        >
          <AnimatePresence mode="wait" initial={false}>
            {isLogin ? (
              <motion.div
                key="login-form"
                initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -14 }}
                transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                className="mx-auto w-full max-w-sm"
              >
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b8192d]">
                  Xavfsiz kirish
                </p>
                <h1 className="mt-3 font-display text-4xl font-semibold tracking-[-0.04em]">
                  Xush kelibsiz
                </h1>
                <p className="mt-3 text-sm leading-6 text-[#71676a]">
                  Buyurtmalar va mahsulotlarni boshqarish uchun ma&apos;lumotlaringizni kiriting.
                </p>
                <AdminLoginForm />
              </motion.div>
            ) : (
              <motion.div
                key="signup-info"
                initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -14 }}
                transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                className="mx-auto w-full max-w-sm"
              >
                <span className="grid size-12 place-items-center rounded-2xl bg-[#b8192d]/10 text-[#b8192d]">
                  <ShieldCheck size={23} />
                </span>
                <p className="mt-7 text-xs font-bold uppercase tracking-[0.2em] text-[#b8192d]">
                  Yangi profil
                </p>
                <h1 className="mt-3 font-display text-4xl font-semibold tracking-[-0.04em]">
                  Ro‘yxatdan o‘tish
                </h1>
                <p className="mt-4 text-sm leading-6 text-[#71676a]">
                  Xaridor profillari tez orada ochiladi. Hozir buyurtma berish uchun akkaunt shart emas — savatdan to‘g‘ridan-to‘g‘ri davom etishingiz mumkin.
                </p>
                <div className="mt-8 grid gap-3">
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#b8192d] px-6 py-3.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
                  >
                    Biz bilan bog‘lanish
                    <ArrowRight size={16} />
                  </Link>
                  <Link
                    href="/catalog"
                    className="inline-flex items-center justify-center rounded-full border border-black/12 px-6 py-3.5 text-sm font-semibold text-[#30282a] transition-colors hover:border-[#b8192d]/40 hover:text-[#b8192d]"
                  >
                    Katalogni ko‘rish
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.section>
    </main>
  );
};

export default Component;
