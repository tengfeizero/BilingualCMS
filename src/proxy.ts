import { NextResponse, type NextRequest } from "next/server";

/** 支持的站点语言 */
const LOCALES = ["zh", "en"];
const DEFAULT_LOCALE = "zh";

/** 根据浏览器语言偏好选择站点语言（海外买家默认英文） */
function getLocale(request: NextRequest): string {
  const acceptLang = request.headers.get("accept-language") ?? "";
  const first = acceptLang.split(",")[0]?.split(";")[0]?.trim().toLowerCase() ?? "";
  if (first.startsWith("en")) return "en";
  if (first.startsWith("zh")) return "zh";
  return DEFAULT_LOCALE;
}

/** 无语言前缀的路径重定向到对应语言版本（如 / -> /zh 或 /en） */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocale = LOCALES.some(
    (l) => pathname.startsWith(`/${l}/`) || pathname === `/${l}`,
  );
  if (hasLocale) return;

  const locale = getLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // 跳过静态资源、后台、API 等路径
  matcher: [
    "/((?!api|admin|_next|uploads|robots\\.txt|sitemap\\.xml|favicon\\.ico).*)",
  ],
};
