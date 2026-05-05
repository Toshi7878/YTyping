import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSession } from "@/auth/server";
import { env } from "@/env";

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"],
};

export async function proxy(request: NextRequest) {
  const { nextUrl } = request;
  const { pathname } = nextUrl;

  const redirect = (path: string) => NextResponse.redirect(new URL(path, nextUrl));

  // メンテナンスモードは最優先（ログイン状態に関わらず）
  const isMaintenanceMode = env.NEXT_PUBLIC_MAINTENANCE_MODE !== "false";
  if (isMaintenanceMode) {
    if (pathname !== "/maintenance") return redirect("/maintenance");
    return NextResponse.next();
  }
  if (pathname === "/maintenance") return redirect("/404");

  const session = await getSession();

  // 未ログイン: 認証必須ルートは弾く
  if (!session?.user) {
    if (["/user/register", "/user/settings"].includes(pathname)) return redirect("/");
    return NextResponse.next();
  }

  // ログイン済み: ユーザー名未設定は登録ページへ強制
  const hasName = !!session.user.name;
  if (!hasName) {
    if (pathname !== "/user/register") return redirect("/user/register");
    return NextResponse.next();
  }

  // ログイン済み + ユーザー名あり: 登録ページは不要
  if (pathname === "/user/register") return redirect("/");

  return NextResponse.next();
}
