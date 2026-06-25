import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/db";
import { getCurrentUser } from "@/src/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const items = await prisma.cartItem.findMany({
      where: { userId: user.id },
      include: {
        art: {
          include: {
            artist: {
              select: {
                username: true,
              },
            },
          },
        },
      },
    });
    return NextResponse.json(items);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { artId, qty = 1 } = body;

    if (!artId) {
      return NextResponse.json({ error: "artId is required" }, { status: 400 });
    }

    // Check if art exists
    const art = await prisma.art.findUnique({ where: { id: artId } });
    if (!art) {
      return NextResponse.json({ error: "Artwork not found" }, { status: 404 });
    }

    // Check if already in cart
    const existing = await prisma.cartItem.findFirst({
      where: { userId: user.id, artId },
    });

    if (existing) {
      const updated = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { qty: existing.qty + qty },
        include: { art: true },
      });
      return NextResponse.json(updated);
    }

    const item = await prisma.cartItem.create({
      data: {
        userId: user.id,
        artId,
        qty,
      },
      include: { art: true },
    });

    return NextResponse.json(item);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { cartItemId, qty } = body;

    if (!cartItemId || qty === undefined) {
      return NextResponse.json({ error: "cartItemId and qty are required" }, { status: 400 });
    }

    if (qty <= 0) {
      await prisma.cartItem.delete({
        where: { id: cartItemId, userId: user.id },
      });
      return NextResponse.json({ success: true, removed: true });
    }

    const updated = await prisma.cartItem.update({
      where: { id: cartItemId, userId: user.id },
      data: { qty },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const cartItemId = url.searchParams.get("cartItemId");
    const clearAll = url.searchParams.get("clearAll") === "true";

    if (clearAll) {
      await prisma.cartItem.deleteMany({
        where: { userId: user.id },
      });
      return NextResponse.json({ success: true });
    }

    if (!cartItemId) {
      return NextResponse.json({ error: "cartItemId is required" }, { status: 400 });
    }

    await prisma.cartItem.delete({
      where: { id: cartItemId, userId: user.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
