import type messages from "../messages/uz.json";

declare global {
  // next-intl kalitlarini TypeScript tekshirishi uchun.
  type IntlMessages = typeof messages;
}

export {};
