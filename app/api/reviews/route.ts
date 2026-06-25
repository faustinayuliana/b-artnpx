import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/db";
import { getCurrentUser } from "@/src/lib/auth";

// GET /api/reviews?artId=...
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const artId = searchParams.get("artId");

    if (!artId) {
      return NextResponse.json({ error: "artId is required" }, { status: 400 });
    }

    const reviews = await prisma.review.findMany({
      where: { artId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(reviews);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/reviews
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { artId, rating, comment } = body;

    if (!artId || !rating || !comment) {
      return NextResponse.json({ error: "artId, rating, and comment are required" }, { status: 400 });
    }

    const parsedRating = parseInt(rating, 10);
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    const review = await prisma.review.create({
      data: {
        artId,
        rating: parsedRating,
        comment,
        userId: user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json(review);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/reviews
export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { reviewId, rating, comment } = body;

    if (!reviewId || !rating || !comment) {
      return NextResponse.json({ error: "reviewId, rating, and comment are required" }, { status: 400 });
    }

    const parsedRating = parseInt(rating, 10);
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!existingReview) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    if (existingReview.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden: You do not own this review" }, { status: 403 });
    }

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        rating: parsedRating,
        comment,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json(updatedReview);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/reviews?reviewId=...
export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get("reviewId");

    if (!reviewId) {
      return NextResponse.json({ error: "reviewId is required" }, { status: 400 });
    }

    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!existingReview) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    if (existingReview.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden: You do not own this review" }, { status: 403 });
    }

    await prisma.review.delete({
      where: { id: reviewId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
