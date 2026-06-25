import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/db";
import { getCurrentUser, clearAuthCookie } from "@/src/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        addresses: true,
        payments: true,
      },
    });
    return NextResponse.json(fullUser);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const action = url.searchParams.get("action");
  const body = await request.json();

  try {
    if (action === "update-profile") {
      const { avatar, username, bio, gender, birthDate, phone, email } = body;

      // Email change check
      if (email && email !== user.email) {
        if (!email.endsWith("@gmail.com") && !email.endsWith("@icloud.com")) {
          return NextResponse.json({ error: "Only Gmail or iCloud addresses are accepted" }, { status: 400 });
        }
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
          return NextResponse.json({ error: "Email is already taken" }, { status: 409 });
        }
      }

      const updated = await prisma.user.update({
        where: { id: user.id },
        data: {
          avatar: avatar !== undefined ? avatar : undefined,
          username: username || undefined,
          bio: bio !== undefined ? bio : undefined,
          gender: gender !== undefined ? gender : undefined,
          birthDate: birthDate ? new Date(birthDate) : undefined,
          phone: phone !== undefined ? phone : undefined,
          email: email || undefined,
        },
      });

      return NextResponse.json(updated);
    }

    if (action === "top-up") {
      const { amount } = body;
      if (!amount || amount <= 0) {
        return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
      }

      const updated = await prisma.user.update({
        where: { id: user.id },
        data: { wallet: { increment: parseFloat(amount) } },
      });

      return NextResponse.json(updated);
    }

    if (action === "become-artist") {
      if (user.role === "ARTIST") {
        return NextResponse.json({ error: "You are already an artist" }, { status: 400 });
      }

      const updated = await prisma.user.update({
        where: { id: user.id },
        data: {
          role: "ARTIST",
          badge: "COPPER",
        },
      });

      // Notify user
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: "🎨 Artist Role Activated!",
          message: "Congratulations! You are now a B.Art COPPER Artist. Start uploading your artworks from the Artist Dashboard.",
        },
      });

      return NextResponse.json(updated);
    }

    // Address CRUD
    if (action === "address-create") {
      const addressCount = await prisma.address.count({ where: { userId: user.id } });
      if (addressCount >= 10) {
        return NextResponse.json({ error: "Maximum 10 addresses allowed" }, { status: 400 });
      }

      const { name, phone, address, city, province, postalCode, isPrimary } = body;

      if (isPrimary) {
        await prisma.address.updateMany({
          where: { userId: user.id },
          data: { isPrimary: false },
        });
      }

      const newAddress = await prisma.address.create({
        data: {
          userId: user.id,
          name,
          phone,
          address,
          city,
          province,
          postalCode,
          isPrimary: isPrimary || addressCount === 0, // primary if first
        },
      });

      return NextResponse.json(newAddress);
    }

    if (action === "address-update") {
      const { id, name, phone, address, city, province, postalCode, isPrimary } = body;

      if (isPrimary) {
        await prisma.address.updateMany({
          where: { userId: user.id },
          data: { isPrimary: false },
        });
      }

      const updatedAddress = await prisma.address.update({
        where: { id, userId: user.id },
        data: {
          name,
          phone,
          address,
          city,
          province,
          postalCode,
          isPrimary,
        },
      });

      return NextResponse.json(updatedAddress);
    }

    if (action === "address-delete") {
      const { id } = body;
      await prisma.address.delete({
        where: { id, userId: user.id },
      });
      return NextResponse.json({ success: true });
    }

    if (action === "address-set-primary") {
      const { id } = body;
      await prisma.address.updateMany({
        where: { userId: user.id },
        data: { isPrimary: false },
      });
      const primary = await prisma.address.update({
        where: { id, userId: user.id },
        data: { isPrimary: true },
      });
      return NextResponse.json(primary);
    }

    // Payment CRUD
    if (action === "payment-create") {
      const { type, bank, number, isPrimary } = body;

      const validBanks = ["Mandiri", "BCA", "BNI", "BRI", "OVO", "Dana", "ShopeePay", "GoPay", "B.Art Wallet"];
      if (!validBanks.includes(bank)) {
        return NextResponse.json({ error: "Invalid payment provider" }, { status: 400 });
      }

      if (isPrimary) {
        await prisma.payment.updateMany({
          where: { userId: user.id },
          data: { isPrimary: false },
        });
      }

      const paymentCount = await prisma.payment.count({ where: { userId: user.id } });

      const newPayment = await prisma.payment.create({
        data: {
          userId: user.id,
          type,
          bank,
          number,
          isPrimary: isPrimary || paymentCount === 0,
        },
      });

      return NextResponse.json(newPayment);
    }

    if (action === "payment-update") {
      const { id, type, bank, number, isPrimary } = body;

      const validBanks = ["Mandiri", "BCA", "BNI", "BRI", "OVO", "Dana", "ShopeePay", "GoPay", "B.Art Wallet"];
      if (!validBanks.includes(bank)) {
        return NextResponse.json({ error: "Invalid payment provider" }, { status: 400 });
      }

      if (isPrimary) {
        await prisma.payment.updateMany({
          where: { userId: user.id },
          data: { isPrimary: false },
        });
      }

      const updatedPayment = await prisma.payment.update({
        where: { id, userId: user.id },
        data: {
          type,
          bank,
          number,
          isPrimary,
        },
      });

      return NextResponse.json(updatedPayment);
    }

    if (action === "payment-delete") {
      const { id } = body;
      await prisma.payment.delete({
        where: { id, userId: user.id },
      });
      return NextResponse.json({ success: true });
    }

    if (action === "payment-set-primary") {
      const { id } = body;
      await prisma.payment.updateMany({
        where: { userId: user.id },
        data: { isPrimary: false },
      });
      const primary = await prisma.payment.update({
        where: { id, userId: user.id },
        data: { isPrimary: true },
      });
      return NextResponse.json(primary);
    }

    if (action === "delete-account") {
      // Delete user cascading manually or let prisma cascade.
      // Delete dependent records first to avoid foreign key errors:
      await prisma.notification.deleteMany({ where: { userId: user.id } });
      await prisma.address.deleteMany({ where: { userId: user.id } });
      await prisma.payment.deleteMany({ where: { userId: user.id } });
      await prisma.favorite.deleteMany({ where: { userId: user.id } });
      await prisma.cartItem.deleteMany({ where: { userId: user.id } });
      await prisma.orderItem.deleteMany({ where: { order: { userId: user.id } } });
      await prisma.order.deleteMany({ where: { userId: user.id } });
      
      // If user uploaded arts, delete cart items and order items referencing them, then delete arts.
      const userArts = await prisma.art.findMany({ where: { artistId: user.id } });
      const userArtIds = userArts.map((a) => a.id);
      await prisma.cartItem.deleteMany({ where: { artId: { in: userArtIds } } });
      await prisma.favorite.deleteMany({ where: { artId: { in: userArtIds } } });
      await prisma.orderItem.deleteMany({ where: { artId: { in: userArtIds } } });
      await prisma.art.deleteMany({ where: { artistId: user.id } });

      await prisma.user.delete({ where: { id: user.id } });

      const response = NextResponse.json({ success: true });
      // clear cookie
      response.cookies.set({
        name: "b-art-token",
        value: "",
        path: "/",
        expires: new Date(0),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      });
      return response;
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
