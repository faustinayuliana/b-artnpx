import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/db";
import { getCurrentUser } from "@/src/lib/auth";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const filter = url.searchParams.get("type"); // "art" or "artist"

    if (filter === "art") {
      const favorites = await prisma.favorite.findMany({
        where: { userId: user.id },
        include: {
          art: {
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
          },
        },
      });
      return NextResponse.json(favorites.map((f) => f.art));
    }

    if (filter === "artist") {
      const follows = await prisma.follow.findMany({
        where: { followerId: user.id },
        include: {
          following: {
            select: {
              id: true,
              username: true,
              avatar: true,
              bio: true,
              badge: true,
            },
          },
        },
      });
      return NextResponse.json(follows.map((f) => f.following));
    }

    // Return both
    const favorites = await prisma.favorite.findMany({
      where: { userId: user.id },
      include: {
        art: {
          include: {
            artist: true,
          },
        },
      },
    });

    const follows = await prisma.follow.findMany({
      where: { followerId: user.id },
      include: {
        following: true,
      },
    });

    return NextResponse.json({
      arts: favorites.map((f) => f.art),
      artists: follows.map((f) => f.following),
    });
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
    const { type, targetId } = body; // type is "art" or "artist"

    if (!type || !targetId) {
      return NextResponse.json({ error: "type and targetId are required" }, { status: 400 });
    }

    if (type === "art") {
      // Toggle favorite
      const existing = await prisma.favorite.findFirst({
        where: { userId: user.id, artId: targetId },
      });

      if (existing) {
        await prisma.favorite.delete({ where: { id: existing.id } });
        return NextResponse.json({ success: true, favorited: false });
      } else {
        await prisma.favorite.create({
          data: { userId: user.id, artId: targetId },
        });
        return NextResponse.json({ success: true, favorited: true });
      }
    }

    if (type === "artist") {
      if (targetId === user.id) {
        return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });
      }

      // Toggle follow
      const existing = await prisma.follow.findFirst({
        where: { followerId: user.id, followingId: targetId },
      });

      if (existing) {
        await prisma.follow.delete({ where: { id: existing.id } });
        return NextResponse.json({ success: true, followed: false });
      } else {
        await prisma.follow.create({
          data: { followerId: user.id, followingId: targetId },
        });
        return NextResponse.json({ success: true, followed: true });
      }
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
