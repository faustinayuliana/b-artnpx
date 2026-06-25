import { NextRequest, NextResponse } from "next/server";

function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    if (!payload.exp) return false;
    const now = Math.floor(Date.now() / 1000);
    return now >= payload.exp;
  } catch {
    return true;
  }
}

// Routes that require the user to be logged in
const PROTECTED_ROUTES = [
  "/profile",
  "/favorites",
  "/notifications",
  "/become-artist",
  "/payment", // Protect payment individual routes
];

// Routes only accessible when logged OUT (redirect to /home if already logged in)
const AUTH_ROUTES = ["/login", "/register"];

async function verifyTokenSignature(token: string): Promise<boolean> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    const [header, payload, signature] = parts;
    
    const secret = process.env.JWT_SECRET || "b-art-secret";
    const encoder = new TextEncoder();
    const data = encoder.encode(`${header}.${payload}`);
    const keyData = encoder.encode(secret);
    
    const key = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    
    const base64 = signature.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    
    return await crypto.subtle.verify("HMAC", key, bytes, data);
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  let token = request.cookies.get("b-art-token")?.value;
  let expired = false;
  let isValid = false;

  if (token) {
    expired = isTokenExpired(token);
    if (expired) {
      token = undefined; // Treat as unauthenticated
    } else {
      isValid = await verifyTokenSignature(token);
      if (!isValid) {
        token = undefined; // Treat as unauthenticated
      }
    }
  }

  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  // Redirect unauthenticated users away from protected routes
  if (isProtected && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    const response = NextResponse.redirect(loginUrl);
    
    // Clear the stale/expired/invalid cookie from the browser immediately
    response.cookies.set({
      name: "b-art-token",
      value: "",
      path: "/",
      expires: new Date(0),
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    });
    return response;
  }

  // Redirect already-authenticated users away from login/register
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  // If the user has an invalid/expired token but is on a public route, clear the cookie
  if (!token && request.cookies.has("b-art-token")) {
    const response = NextResponse.next();
    response.cookies.set({
      name: "b-art-token",
      value: "",
      path: "/",
      expires: new Date(0),
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public assets
     * - API routes (handled server-side)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
