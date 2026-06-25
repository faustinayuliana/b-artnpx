import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/db";
import { getCurrentUser } from "@/src/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser || dbUser.role !== "ARTIST") {
      return NextResponse.json({ error: "Forbidden - Not an Artist" }, { status: 403 });
    }

    // 1. Count actual order items sold by the artist
    // An item is sold if it belongs to an order that is COMPLETED
    const actualSalesCount = await prisma.orderItem.count({
      where: {
        art: { artistId: user.id },
        order: { status: "COMPLETED" },
      },
    });

    // 2. Count actual revenue from those sales
    const actualOrderItems = await prisma.orderItem.findMany({
      where: {
        art: { artistId: user.id },
        order: { status: "COMPLETED" },
      },
      select: {
        price: true,
        qty: true,
      },
    });
    const actualRevenue = actualOrderItems.reduce((sum, item) => sum + item.price * item.qty, 0);

    // 3. Count actual followers
    const followersCount = await prisma.follow.count({
      where: { followingId: user.id },
    });

    // 4. Count uploaded artworks
    const artsCount = await prisma.art.count({
      where: { artistId: user.id },
    });

    // 5. Apply Reputational Seed Fallbacks for Seeded Artists
    let baseSales = 0;
    let baseRevenue = 0;

    const email = dbUser.email.toLowerCase();
    if (email === "akira@gmail.com") {
      baseSales = 52;
      baseRevenue = 7200000;
    } else if (email === "daniel@gmail.com") {
      baseSales = 35;
      baseRevenue = 4850000;
    } else if (email === "maya@gmail.com") {
      baseSales = 18;
      baseRevenue = 2400000;
    } else if (email === "aria@gmail.com") {
      baseSales = 4;
      baseRevenue = 500000;
    }

    const totalSalesCount = baseSales + actualSalesCount;
    const totalRevenue = baseRevenue + actualRevenue;

    // 6. Calculate the dynamic badge based on total sales count
    // 0-9: Beginner (COPPER)
    // 10-49: Intermediate (SILVER/GOLD)
    // 50+: Professional (PLATINUM)
    let computedBadge: "COPPER" | "SILVER" | "PLATINUM" = "COPPER";
    if (totalSalesCount >= 50) {
      computedBadge = "PLATINUM";
    } else if (totalSalesCount >= 10) {
      computedBadge = "SILVER"; // intermediate
    } else {
      computedBadge = "COPPER"; // beginner
    }

    // 7. Sync computed badge with database if it differs
    if (dbUser.badge !== computedBadge) {
      await prisma.user.update({
        where: { id: user.id },
        data: { badge: computedBadge },
      });
    }

    return NextResponse.json({
      artsCount,
      salesCount: totalSalesCount,
      revenue: totalRevenue,
      followersCount,
      badge: computedBadge,
      wallet: dbUser.wallet,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
