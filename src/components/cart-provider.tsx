"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";

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

type Action =
  | { type: "add"; line: CartLine }
  | { type: "remove"; variantId: number }
  | { type: "setQuantity"; variantId: number; quantity: number }
  | { type: "clear" }
  | { type: "hydrate"; lines: CartLine[] };

const STORAGE_KEY = "molto_caldo_cart_v1";

function reducer(state: CartLine[], action: Action): CartLine[] {
  switch (action.type) {
    case "hydrate":
      return action.lines;

    case "add": {
      const existing = state.find((l) => l.variantId === action.line.variantId);
      if (!existing) return [...state, action.line];
      // Zaxiradan ko'p qo'shib bo'lmaydi.
      const quantity = Math.min(
        existing.quantity + action.line.quantity,
        existing.maxStock,
      );
      return state.map((l) =>
        l.variantId === action.line.variantId ? { ...l, quantity } : l,
      );
    }

    case "setQuantity": {
      if (action.quantity < 1) {
        return state.filter((l) => l.variantId !== action.variantId);
      }
      return state.map((l) =>
        l.variantId === action.variantId
          ? { ...l, quantity: Math.min(action.quantity, l.maxStock) }
          : l,
      );
    }

    case "remove":
      return state.filter((l) => l.variantId !== action.variantId);

    case "clear":
      return [];
  }
}

interface CartValue {
  lines: CartLine[];
  count: number;
  subtotal: number;
  add: (line: CartLine) => void;
  remove: (variantId: number) => void;
  setQuantity: (variantId: number, quantity: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, dispatch] = useReducer(reducer, []);

  // localStorage faqat brauzerda mavjud, shuning uchun birinchi renderdan
  // keyin o'qiymiz — aks holda server va klient HTML'i mos kelmaydi.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) dispatch({ type: "hydrate", lines: JSON.parse(raw) });
    } catch {
      /* private rejim yoki to'lgan xotira — savat bo'sh qoladi */
    }
  }, []);

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
      count: lines.reduce((n, l) => n + l.quantity, 0),
      subtotal: lines.reduce((n, l) => n + l.unitPrice * l.quantity, 0),
      add: (line) => dispatch({ type: "add", line }),
      remove: (variantId) => dispatch({ type: "remove", variantId }),
      setQuantity: (variantId, quantity) =>
        dispatch({ type: "setQuantity", variantId, quantity }),
      clear: () => dispatch({ type: "clear" }),
    };
  }, [lines]);

  return <CartContext value={value}>{children}</CartContext>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
