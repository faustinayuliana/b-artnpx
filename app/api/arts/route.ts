import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/db";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const search = url.searchParams.get("search") || "";
    const style = url.searchParams.get("style") || "";
    const color = url.searchParams.get("color") || "";
    const theme = url.searchParams.get("theme") || "";
    const category = url.searchParams.get("category") || "";
    const priceRange = url.searchParams.get("priceRange") || "";
    const artistId = url.searchParams.get("artistId") || "";

    const where: any = {};

    if (artistId) {
      where.artistId = artistId;
    }

    if (style && style !== "All Arts") {
      where.style = { equals: style, mode: "insensitive" };
    }

    if (color) {
      where.color = { equals: color, mode: "insensitive" };
    }

    if (theme) {
      where.theme = { equals: theme, mode: "insensitive" };
    }

    if (category) {
      if (category === "Open Commission") {
        where.isCommission = true;
      } else {
        where.category = { equals: category, mode: "insensitive" };
        where.isCommission = false;
      }
    }

    if (priceRange) {
      if (priceRange === "under-100k") {
        where.price = { lt: 100000 };
      } else if (priceRange === "100k-500k") {
        where.price = { gte: 100000, lte: 500000 };
      } else if (priceRange === "500k-1m") {
        where.price = { gte: 500000, lte: 1000000 };
      } else if (priceRange === "1m-5m") {
        where.price = { gte: 1000000, lte: 5000000 };
      } else if (priceRange === "above-5m") {
        where.price = { gt: 5000000 };
      }
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { style: { contains: search, mode: "insensitive" } },
        { theme: { contains: search, mode: "insensitive" } },
        { color: { contains: search, mode: "insensitive" } },
        {
          artist: {
            username: { contains: search, mode: "insensitive" },
          },
        },
      ];
    }

    const arts = await prisma.art.findMany({
      where,
      include: {
        artist: {
          select: {
            id: true,
            username: true,
            avatar: true,
            badge: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(arts);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST — Create a new art (Artist only)
export async function POST(request: Request) {
  const { getCurrentUser } = await import("@/src/lib/auth");
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { prisma } = await import("@/src/lib/db");
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser || dbUser.role !== "ARTIST") {
    return NextResponse.json({ error: "Only artists can upload artworks" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { title, description, image, price, style, color, theme, category, isCommission } = body;

    if (!title || !image || !price) {
      return NextResponse.json({ error: "Title, image, and price are required" }, { status: 400 });
    }

    const art = await prisma.art.create({
      data: {
        title,
        description: description || "",
        image,
        price: parseFloat(price),
        style: style || "",
        color: color || "",
        theme: theme || "",
        category: category || "Illustration",
        isCommission: isCommission || false,
        artistId: user.id,
      } as any,
    });

    return NextResponse.json(art, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT — Update art (artist owner only)
export async function PUT(request: Request) {
  const { getCurrentUser } = await import("@/src/lib/auth");
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { prisma } = await import("@/src/lib/db");
  try {
    const body = await request.json();
    const { id, title, description, image, price, style, color, theme, category, isCommission } = body;

    if (!id) return NextResponse.json({ error: "Art ID is required" }, { status: 400 });

    const existing = await prisma.art.findUnique({ where: { id } });
    if (!existing || existing.artistId !== user.id) {
      return NextResponse.json({ error: "Not found or not your artwork" }, { status: 404 });
    }

    const updated = await prisma.art.update({
      where: { id },
      data: {
        title: title || existing.title,
        description: description !== undefined ? description : existing.description,
        image: image || existing.image,
        price: price ? parseFloat(price) : existing.price,
        style: style !== undefined ? style : existing.style,
        color: color !== undefined ? color : existing.color,
        theme: theme !== undefined ? theme : existing.theme,
        category: category || existing.category,
        isCommission: isCommission !== undefined ? isCommission : existing.isCommission,
      } as any,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE — Delete art (artist owner only)
export async function DELETE(request: Request) {
  const { getCurrentUser } = await import("@/src/lib/auth");
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { prisma } = await import("@/src/lib/db");
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Art ID required" }, { status: 400 });

    const existing = await prisma.art.findUnique({ where: { id } });
    if (!existing || existing.artistId !== user.id) {
      return NextResponse.json({ error: "Not found or not your artwork" }, { status: 404 });
    }

    // Remove related cart items first
    await prisma.cartItem.deleteMany({ where: { artId: id } });
    await prisma.art.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

