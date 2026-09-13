import Link from "next/link";
import { redirect } from "next/navigation";
import { LogOut, PackageSearch, Phone } from "lucide-react";
import { getSession, adminReady } from "@/lib/auth";
import {
  listOrders,
  ORDER_STATUSES,
  STATUS_LABEL,
  type AdminOrder,
} from "@/lib/admin";
import { formatPrice } from "@/lib/utils";
import { changeStatus, logout } from "@/app/admin/actions";
import { AdminPasswordForm } from "@/components/admin-password-form";

/**
 * Buyurtmalar ro'yxati sessiyaga bog'liq — bu sahifa hech qachon oldindan (build vaqtida)
 * tayyorlanmasligi kerak, aks holda kirgan adminga ham keshdagi
 * "kirish" sahifasi ko'rsatilib qolishi mumkin.
 */
export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const ready = adminReady();
  const orders = await listOrders();

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-10">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--line)] pb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Buyurtmalar
          </h1>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">
            {session.email}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="rounded-full border border-[var(--line-strong)] px-4 py-2 text-sm font-medium transition-colors hover:bg-[var(--surface-2)]"
          >
            Do&apos;kon
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-full border border-[var(--line-strong)] px-4 py-2 text-sm font-medium transition-colors hover:bg-[var(--surface-2)]"
            >
              <LogOut size={15} />
              Chiqish
            </button>
          </form>
        </div>
      </header>

      <div className="mt-6">
        <AdminPasswordForm />
      </div>

      {!ready.database && (
        <p className="mt-8 rounded-lg border border-[var(--line-strong)] bg-[var(--surface-2)] px-4 py-3.5 text-sm leading-relaxed text-[var(--ink-soft)]">
          Baza ulanmagan: <code>DATABASE_URL</code> to&apos;ldirilgandan keyin
          buyurtmalar shu yerda ko&apos;rinadi.
        </p>
      )}

      {ready.database && orders.length === 0 && (
        <div className="mt-16 grid place-items-center text-center">
          <PackageSearch size={32} className="text-[var(--ink-mute)]" />
          <p className="mt-4 text-sm text-[var(--ink-soft)]">
            Hozircha buyurtma yo&apos;q.
          </p>
        </div>
      )}

      <div className="mt-8 space-y-5">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    </div>
  );
}

function OrderCard({ order }: { order: AdminOrder }) {
  const placed = new Intl.DateTimeFormat("uz-UZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(order.createdAt);

  return (
    <article className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="font-display text-lg font-semibold">
              {order.orderNumber}
            </h2>
            <span className="rounded-full bg-[var(--surface-2)] px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-[var(--ink-soft)] uppercase">
              {STATUS_LABEL[order.status]}
            </span>
          </div>
          <p className="mt-1 text-xs text-[var(--ink-mute)]">{placed}</p>
        </div>

        <p className="font-display text-xl font-semibold">
          {formatPrice(order.total)}
        </p>
      </div>

      <dl className="mt-4 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
        <div className="flex gap-2">
          <dt className="text-[var(--ink-mute)]">Mijoz:</dt>
          <dd className="font-medium">{order.customerName}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="text-[var(--ink-mute)]">Telefon:</dt>
          <dd>
            <a
              href={`tel:${order.phone}`}
              className="inline-flex items-center gap-1.5 font-medium text-[var(--accent)]"
            >
              <Phone size={13} />
              {order.phone}
            </a>
          </dd>
        </div>
        <div className="flex gap-2">
          <dt className="text-[var(--ink-mute)]">Manzil:</dt>
          <dd>
            {order.city}, {order.address}
          </dd>
        </div>
        <div className="flex gap-2">
          <dt className="text-[var(--ink-mute)]">To&apos;lov:</dt>
          <dd>
            {order.paymentMethod} · {order.paymentStatus}
          </dd>
        </div>
        {order.note && (
          <div className="flex gap-2 sm:col-span-2">
            <dt className="text-[var(--ink-mute)]">Izoh:</dt>
            <dd className="text-[var(--ink-soft)]">{order.note}</dd>
          </div>
        )}
      </dl>

      <ul className="mt-4 divide-y divide-[var(--line)] border-y border-[var(--line)] text-sm">
        {order.items.map((item, index) => (
          <li
            key={`${item.productSlug}-${item.size}-${index}`}
            className="flex justify-between gap-4 py-2.5"
          >
            <span>
              {item.productName}
              <span className="text-[var(--ink-mute)]">
                {" "}
                · {item.colorName} · {item.size} · {item.quantity}×
              </span>
            </span>
            <span className="shrink-0 font-medium">
              {formatPrice(item.unitPrice * item.quantity)}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-[var(--ink-mute)]">
          Mahsulotlar {formatPrice(order.subtotal)} · yetkazish{" "}
          {order.deliveryFee === 0 ? "bepul" : formatPrice(order.deliveryFee)}
        </p>

        {/* Holatni o'zgartirish — JS o'chirilgan bo'lsa ham ishlaydigan form. */}
        <form action={changeStatus} className="flex items-center gap-2">
          <input type="hidden" name="orderId" value={order.id} />
          <select
            name="status"
            defaultValue={order.status}
            className="rounded-lg border border-[var(--line-strong)] bg-[var(--surface)] px-3 py-2 text-sm"
          >
            {ORDER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABEL[status]}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-lg bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-[var(--bg)]"
          >
            Saqlash
          </button>
        </form>
      </div>
    </article>
  );
}
