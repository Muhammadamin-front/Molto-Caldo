import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { CONTACT } from "@/lib/constants";

export async function SiteFooter() {
  const t = await getTranslations("footer");
  const tn = await getTranslations("nav");
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-[var(--line)] bg-[var(--surface-2)]">
      <div className="mc-container grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-xl font-semibold">
            Molto<span className="text-[var(--accent)]">.</span>Caldo
          </p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-[var(--ink-soft)]">
            {t("tagline")}
          </p>
        </div>

        <nav aria-labelledby="f-shop">
          <p id="f-shop" className="text-sm font-semibold">
            {t("shop")}
          </p>
          <ul className="mt-4 space-y-2.5 text-sm text-[var(--ink-soft)]">
            <li>
              <Link href="/catalog" className="hover:text-[var(--ink)]">
                {tn("catalog")}
              </Link>
            </li>
            <li>
              <Link href="/cart" className="hover:text-[var(--ink)]">
                {tn("cart")}
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-labelledby="f-info">
          <p id="f-info" className="text-sm font-semibold">
            {t("info")}
          </p>
          <ul className="mt-4 space-y-2.5 text-sm text-[var(--ink-soft)]">
            <li>
              <Link href="/lookbook" className="hover:text-[var(--ink)]">
                {tn("lookbook")}
              </Link>
            </li>
            <li>
              <Link href="/delivery" className="hover:text-[var(--ink)]">
                {tn("delivery")}
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-[var(--ink)]">
                {tn("contact")}
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <p className="text-sm font-semibold">{t("contacts")}</p>
          <ul className="mt-4 space-y-2.5 text-sm text-[var(--ink-soft)]">
            <li>
              <a href={CONTACT.phoneHref} className="hover:text-[var(--ink)]">
                {CONTACT.phone}
              </a>
            </li>
            <li>
              <a
                href={CONTACT.telegramHref}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--ink)]"
              >
                {CONTACT.telegram}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${CONTACT.email}`}
                className="hover:text-[var(--ink)]"
              >
                {CONTACT.email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="mc-container flex flex-col gap-2 border-t border-[var(--line)] py-6 text-xs text-[var(--ink-mute)] sm:flex-row sm:items-center sm:justify-between">
        <p>
          &copy; {year} Molto Caldo — {t("rights")}
        </p>
        <p>Click · Payme · {t("payment")}</p>
      </div>
    </footer>
  );
}
