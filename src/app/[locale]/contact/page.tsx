import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Phone, Send, Mail, MapPin } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { CONTACT } from "@/lib/constants";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return { title: t("title"), description: t("lead") };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");

  const rows = [
    { icon: Phone, label: t("phone"), value: CONTACT.phone, href: CONTACT.phoneHref },
    { icon: Send, label: t("telegram"), value: CONTACT.telegram, href: CONTACT.telegramHref },
    { icon: Mail, label: t("email"), value: CONTACT.email, href: `mailto:${CONTACT.email}` },
    { icon: MapPin, label: t("address"), value: t("addressValue"), href: null },
  ];

  return (
    <div className="mc-container py-12 lg:py-16">
      <h1 className="font-display text-[clamp(2rem,5vw,3rem)] font-semibold tracking-tight">
        {t("title")}
      </h1>
      <p className="mt-3 max-w-lg text-sm text-[var(--ink-soft)]">{t("lead")}</p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2" data-stagger>
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-start gap-4 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-6"
          >
            <row.icon size={20} className="mt-0.5 shrink-0 text-[var(--accent)]" />
            <div>
              <p className="text-xs tracking-wide text-[var(--ink-mute)] uppercase">
                {row.label}
              </p>
              {row.href ? (
                <a
                  href={row.href}
                  target={row.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="mt-1 block font-display text-lg hover:text-[var(--accent)]"
                >
                  {row.value}
                </a>
              ) : (
                <p className="mt-1 font-display text-lg">{row.value}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
