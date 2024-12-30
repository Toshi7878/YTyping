export { auth as middleware } from "@/server/auth";

// export async function middleware(request: NextRequest) {
// const session = await auth();
// const isLoggedIn = !!session;
// if (isLoggedIn) {
//   const userName = session!.user.name;
//   if (request.nextUrl.pathname !== "/user/register") {
//     if (!userName) {
//       return NextResponse.redirect(new URL("/user/register", request.url));
//     }
//   } else {
//     //名付け済みで/user/registerに遷移される場合はrootにリダイレクト
//     return NextResponse.redirect(new URL("/", request.url));
//   }
// } else {
//   if (logoutRedirectPaths.includes(request.nextUrl.pathname)) {
//     return NextResponse.redirect(new URL("/", request.url));
//   }
// }
// }

// const logoutRedirectPaths = ["/user/register", "/user/settings"];

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"],
};
