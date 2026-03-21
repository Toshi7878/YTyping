
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"],
};

// const authRoutes = ["/user/register", "/user/settings"];

// export async function proxy(request: NextRequest) {
//   const { nextUrl } = request;
//   const { pathname } = nextUrl;

//   const session = await auth.api.getSession({ headers: request.headers });
//   const isLoggedIn = !!session?.user;

//   if (isLoggedIn) {
//     const userName = session.user.name;

//     const isMaintenanceMode = env.NEXT_PUBLIC_MAINTENANCE_MODE !== "false";
//     if (isMaintenanceMode) {
//       if (pathname !== "/maintenance") {
//         return NextResponse.redirect(new URL("/maintenance", nextUrl));
//       }
//     } else if (pathname === "/maintenance") {
//       return NextResponse.redirect(new URL("/404", nextUrl));
//     }

//     if (userName) {
//       if (pathname === "/user/register") {
//         return NextResponse.redirect(new URL("/", nextUrl));
//       }
//     } else if (pathname !== "/user/register") {
//       return NextResponse.redirect(new URL("/user/register", nextUrl));
//     }
//   } else {
//     const isAuthRoute = authRoutes.includes(pathname);
//     if (isAuthRoute) {
//       return NextResponse.redirect(new URL("/", nextUrl));
//     }
//   }

//   return NextResponse.next();
// }
