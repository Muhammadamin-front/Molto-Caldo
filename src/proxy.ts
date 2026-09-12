import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Skip API routes, the admin panel (it is not translated and must not be
  // redirected to a locale), Next internals and any path containing a dot.
  matcher: ["/((?!api|admin|_next|_vercel|.*\\..*).*)"],
};
