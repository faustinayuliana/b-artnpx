import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/db";
import { getCurrentUser } from "@/src/lib/auth";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: user.id },
      include: { art: true },
    });

    if (cartItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Calculations
    let subtotal = 0;
    for (const item of cartItems) {
      // Validate stock
      if (item.art.stock < item.qty) {
        return NextResponse.json(
          { error: `Insufficient stock for "${item.art.title}". Only ${item.art.stock} left.` },
          { status: 400 }
        );
      }
      subtotal += item.art.price * item.qty;
    }

    const adminFee = 2500;
    const serviceFee = 3000;
    const tax = Math.round(subtotal * 0.01);
    const total = subtotal + adminFee + serviceFee + tax;

    // Fetch user with fresh wallet balance
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (dbUser.wallet < total) {
      return NextResponse.json(
        { error: `Insufficient wallet balance. Total is Rp${total.toLocaleString()}, your balance is Rp${dbUser.wallet.toLocaleString()}.` },
        { status: 400 }
      );
    }

    // Transaction to update database
    const result = await prisma.$transaction(async (tx) => {
      // Deduct wallet
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: { wallet: { decrement: total } },
      });

      // Decrease artwork stock
      for (const item of cartItems) {
        await tx.art.update({
          where: { id: item.artId },
          data: { stock: { decrement: item.qty } },
        });
      }

      // Create Order
      const order = await tx.order.create({
        data: {
          userId: user.id,
          subtotal,
          adminFee,
          serviceFee,
          tax,
          total,
          status: "COMPLETED",
          items: {
            create: cartItems.map((item) => ({
              artId: item.artId,
              qty: item.qty,
              price: item.art.price,
            })),
          },
        },
        include: {
          items: {
            include: {
              art: true,
            },
          },
        },
      });

      // Clear Cart
      await tx.cartItem.deleteMany({
        where: { userId: user.id },
      });

      // Create Notification
      await tx.notification.create({
        data: {
          userId: user.id,
          title: "Order Successful",
          message: `Your order for ${cartItems.map((c) => c.art.title).join(", ")} was completed successfully. Total: Rp${total.toLocaleString()}`,
        },
      });

      // Create notifications for the artists that their arts are sold
      for (const item of cartItems) {
        await tx.notification.create({
          data: {
            userId: item.art.artistId,
            title: "Art Sold!",
            message: `Your artwork "${item.art.title}" has been purchased (Qty: ${item.qty}). Rp${(item.art.price * item.qty).toLocaleString()} added to pending sales.`,
          },
        });
      }

      return order;
    });

    return NextResponse.json({ success: true, order: result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
