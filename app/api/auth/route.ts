import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/db";
import { comparePassword, createToken, hashPassword } from "@/src/lib/auth";

export async function POST(request: Request) {
  const url = new URL(request.url);
  const action = url.searchParams.get("action");
  const body = await request.json();

  if (action === "login") {
    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const valid = await comparePassword(body.password, user.password);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = createToken({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      avatar: user.avatar,
      bio: user.bio,
      wallet: user.wallet,
      badge: user.badge,
      phone: user.phone,
      gender: user.gender,
      birthDate: user.birthDate,
    });

    const response = NextResponse.json({ success: true });
    response.cookies.set({
      name: "b-art-token",
      value: token,
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  }

  if (action === "register") {
    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const passwordHash = await hashPassword(body.password);
    const user = await prisma.user.create({
      data: {
        email: body.email,
        password: passwordHash,
        username: body.username,
        wallet: 0,
        role: "USER",
      },
    });

    const token = createToken({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      avatar: user.avatar,
      bio: user.bio,
      wallet: user.wallet,
      badge: user.badge,
      phone: user.phone,
      gender: user.gender,
      birthDate: user.birthDate,
    });

    const response = NextResponse.json({ success: true });
    response.cookies.set({
      name: "b-art-token",
      value: token,
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  }

  if (action === "logout") {
    const response = NextResponse.json({ success: true });
    response.cookies.set({
      name: "b-art-token",
      value: "",
      path: "/",
      expires: new Date(0),
      httpOnly: true,
      sameSite: "lax",
      secure: true,
    });
    return response;
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
