import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const isAdminRoute = (pathname: string) => pathname.startsWith("/admin");
const isDoctorRoute = (pathname: string) => pathname.startsWith("/doctor");

const isLoginRoute = (pathname: string) =>
  pathname === "/admin/login" || pathname === "/doctor/login";

const getSessionFromRequest = async (request: NextRequest) => {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (!token?.sub || typeof token.role !== "string") {
    return null;
  }

  return {
    userId: token.sub,
    role: token.role,
    isBlacklisted: token.isBlacklisted === true,
  };
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/_next") || pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  if (pathname === "/blocked") {
    return NextResponse.next();
  }

  const session = await getSessionFromRequest(request);

  if (session?.isBlacklisted) {
    const url = request.nextUrl.clone();
    url.pathname = "/blocked";
    return NextResponse.redirect(url);
  }

  if ((isAdminRoute(pathname) || isDoctorRoute(pathname)) && !session) {
    const url = request.nextUrl.clone();
    url.pathname = isAdminRoute(pathname) ? "/admin/login" : "/doctor/login";
    return NextResponse.redirect(url);
  }

  if (isAdminRoute(pathname) && !isLoginRoute(pathname)) {
    if (session?.role !== "ADMIN") {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }

  if (isDoctorRoute(pathname) && !isLoginRoute(pathname)) {
    if (session?.role !== "DOCTOR") {
      const url = request.nextUrl.clone();
      url.pathname = "/doctor/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/doctor/:path*", "/blocked"],
};
