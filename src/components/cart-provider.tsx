"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import { useLocale } from "next-intl";

export interface CartLine {
  variantId: number;
  productSlug: string;
  name: string;
  image: string;
  size: string;
  colorName: string;
  colorHex: string;
  unitPrice: number;
  quantity: number;
  maxStock: number;
}

/** `/api/variants` qaytaradigan shakl. */
interface ServerVariant {
  variantId: number;
  productSlug: string;
  productName: string;
  size: string;
  colorName: string;
  colorHex: string;
  image: string;
  unitPrice: number;
  stock: number;
}

interface State {
  lines: CartLine[];
  /** Serverdan yangilanganda biror qator o'zgargan yoki o'chirilganmi. */
  adjusted: boolean;
}

type Action =
  | { type: "add"; line: CartLine }
  | { type: "remove"; variantId: number }
  | { type: "setQuantity"; variantId: number; quantity: number }
  | { type: "clear" }
  | { type: "hydrate"; lines: CartLine[] }
  | { type: "reconcile"; variants: ServerVariant[] }
  | { type: "dismissAdjusted" };

const STORAGE_KEY = "molto_caldo_cart_v1";

/**
 * Saqlangan savat boshqa versiyadan qolgan yoki buzilgan bo'lishi mumkin —
 * shakli to'g'ri kelmagan qatorlarni tashlab yuboramiz.
 */
function parseStored(raw: string): CartLine[] {
  const data: unknown = JSON.parse(raw);
  if (!Array.isArray(data)) return [];
  return data.filter(
    (l): l is CartLine =>
      typeof l === "object" &&
      l !== null &&
      Number.isInteger((l as CartLine).variantId) &&
      Number.isInteger((l as CartLine).quantity) &&
      (l as CartLine).quantity > 0,
  );
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "hydrate":
      return { ...state, lines: action.lines };

    case "add": {
      const existing = state.lines.find(
        (l) => l.variantId === action.line.variantId,
      );
      if (!existing) return { ...state, lines: [...state.lines, action.line] };
      // Zaxiradan ko'p qo'shib bo'lmaydi.
      const quantity = Math.min(
        existing.quantity + action.line.quantity,
        existing.maxStock,
      );
      return {
        ...state,
        lines: state.lines.map((l) =>
          l.variantId === action.line.variantId ? { ...l, quantity } : l,
        ),
      };
    }

    case "setQuantity": {
      if (action.quantity < 1) {
        return {
          ...state,
          lines: state.lines.filter((l) => l.variantId !== action.variantId),
        };
      }
      return {
        ...state,
        lines: state.lines.map((l) =>
          l.variantId === action.variantId
            ? { ...l, quantity: Math.min(action.quantity, l.maxStock) }
            : l,
        ),
      };
    }

    case "remove":
      return {
        ...state,
        lines: state.lines.filter((l) => l.variantId !== action.variantId),
      };

    case "clear":
      return { lines: [], adjusted: false };

    case "reconcile": {
      // Savat brauzerda uzoq turadi: narx ko'tarilgan, mahsulot o'chirilgan
      // yoki zaxira tugagan bo'lishi mumkin. Server aytganini olamiz.
      const byId = new Map(action.variants.map((v) => [v.variantId, v]));
      let adjusted = false;
      const lines: CartLine[] = [];

      for (const line of state.lines) {
        const fresh = byId.get(line.variantId);
        if (!fresh || fresh.stock < 1) {
          adjusted = true;
          continue;
        }

        const quantity = Math.min(line.quantity, fresh.stock);
        if (quantity !== line.quantity || fresh.unitPrice !== line.unitPrice) {
          adjusted = true;
        }

        lines.push({
          variantId: line.variantId,
          productSlug: fresh.productSlug,
          name: fresh.productName,
          image: fresh.image,
          size: fresh.size,
          colorName: fresh.colorName,
          colorHex: fresh.colorHex,
          unitPrice: fresh.unitPrice,
          quantity,
          maxStock: fresh.stock,
        });
      }

      return { lines, adjusted: state.adjusted || adjusted };
    }

    case "dismissAdjusted":
      return { ...state, adjusted: false };
  }
}

interface CartValue {
  lines: CartLine[];
  count: number;
  subtotal: number;
  adjusted: boolean;
  add: (line: CartLine) => void;
  remove: (variantId: number) => void;
  setQuantity: (variantId: number, quantity: number) => void;
  clear: () => void;
  dismissAdjusted: () => void;
  refresh: () => void;
}

const CartContext = createContext<CartValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const locale = useLocale();
  const [state, dispatch] = useReducer(reducer, { lines: [], adjusted: false });
  const { lines } = state;

  // localStorage faqat brauzerda mavjud, shuning uchun birinchi renderdan
  // keyin o'qiymiz — aks holda server va klient HTML'i mos kelmaydi. O'qib
  // bo'lgach saqlangan narx va zaxirani serverda tekshiramiz.
  useEffect(() => {
    let stored: CartLine[] = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) stored = parseStored(raw);
    } catch {
      /* private rejim yoki buzilgan ma'lumot — savat bo'sh qoladi */
    }

    if (stored.length > 0) dispatch({ type: "hydrate", lines: stored });
    if (stored.length === 0) return;

    const controller = new AbortController();
    void fetchVariants(
      stored.map((l) => l.variantId),
      locale,
      controller.signal,
    ).then((variants) => {
      if (variants) dispatch({ type: "reconcile", variants });
    });

    return () => controller.abort();
  }, [locale]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* yozib bo'lmasa ham sahifa ishlashda davom etadi */
    }
  }, [lines]);

  const value = useMemo<CartValue>(() => {
    return {
      lines,
      adjusted: state.adjusted,
      count: lines.reduce((n, l) => n + l.quantity, 0),
      subtotal: lines.reduce((n, l) => n + l.unitPrice * l.quantity, 0),
      add: (line) => dispatch({ type: "add", line }),
      remove: (variantId) => dispatch({ type: "remove", variantId }),
      setQuantity: (variantId, quantity) =>
        dispatch({ type: "setQuantity", variantId, quantity }),
      clear: () => dispatch({ type: "clear" }),
      dismissAdjusted: () => dispatch({ type: "dismissAdjusted" }),
      refresh: () => {
        if (lines.length === 0) return;
        void fetchVariants(
          lines.map((l) => l.variantId),
          locale,
        ).then((variants) => {
          if (variants) dispatch({ type: "reconcile", variants });
        });
      },
    };
  }, [lines, state.adjusted, locale]);

  return <CartContext value={value}>{children}</CartContext>;
}

/** Xato bo'lsa `null` — savat eski narx bilan qolsa ham sahifa ishlaydi. */
async function fetchVariants(
  ids: number[],
  locale: string,
  signal?: AbortSignal,
): Promise<ServerVariant[] | null> {
  try {
    const response = await fetch(
      `/api/variants?ids=${ids.join(",")}&locale=${locale}`,
      { signal },
    );
    if (!response.ok) return null;
    const data: { variants?: ServerVariant[] } = await response.json();
    return data.variants ?? null;
  } catch {
    return null;
  }
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
