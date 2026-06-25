const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function run() {
  try {
    console.log("Wiping existing records...");
    await prisma.notification.deleteMany();
    await prisma.address.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.favorite.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.art.deleteMany();
    await prisma.user.deleteMany();

    console.log("Hashing password...");
    const hashed = await bcrypt.hash("password123", 10);

    console.log("Creating artists and users...");
    const artist1 = await prisma.user.create({
      data: {
        email: "artist1@gmail.com",
        password: hashed,
        username: "ZenithArt",
        role: "ARTIST",
        badge: "COPPER",
        bio: "Digital painter specializing in Japanese scenery. Passionate about color harmony.",
        wallet: 5000000,
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
      }
    });

    const artist2 = await prisma.user.create({
      data: {
        email: "artist2@gmail.com",
        password: hashed,
        username: "PixelMage",
        role: "ARTIST",
        badge: "COPPER",
        bio: "Retro-style illustrator and sticker designer. Nostalgia in every pixel.",
        wallet: 7500000,
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
      }
    });

    const artist3 = await prisma.user.create({
      data: {
        email: "artist3@gmail.com",
        password: hashed,
        username: "VectorVibe",
        role: "ARTIST",
        badge: "COPPER",
        bio: "Minimalist vector graphic designs and posters. Clean lines, bold concepts.",
        wallet: 3200000,
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
      }
    });

    const user1 = await prisma.user.create({
      data: {
        email: "user1@gmail.com",
        password: hashed,
        username: "ArtFanatic",
        role: "USER",
        wallet: 1000000,
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
      }
    });

    console.log("Creating art pieces...");
    const artsData = [
      {
        title: "Neon Tokyo Night",
        description: "A breathtaking illustration of a rainy night in Tokyo illuminated by vibrant neon signs.",
        image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80",
        price: 150000,
        stock: 10,
        style: "Illustration",
        theme: "Japanese",
        color: "Purple",
        category: "Illustration",
        isCommission: false,
        artistId: artist1.id,
      },
      {
        title: "Pixel Ramen Shop",
        description: "An adorable 8-bit isometric pixel art of a traditional Japanese ramen shop.",
        image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80",
        price: 45000,
        stock: 25,
        style: "Paintings",
        theme: "Food",
        color: "Yellow",
        category: "Sticker",
        isCommission: false,
        artistId: artist2.id,
      },
      {
        title: "Cyberpunk GT-R Spec",
        description: "Sleek vector graphics detailing a futuristic cyberpunk Nissan GT-R racing through a synthwave grid.",
        image: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=600&q=80",
        price: 80000,
        stock: 15,
        style: "Graphic Design",
        theme: "Cars",
        color: "Blue",
        category: "Wallpaper",
        isCommission: false,
        artistId: artist3.id,
      },
      {
        title: "Kyoto Spring Pagoda",
        description: "A beautiful traditional digital painting showing cherry blossoms surrounding the Yasaka Pagoda.",
        image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80",
        price: 250000,
        stock: 5,
        style: "Illustration",
        theme: "Travel",
        color: "Pink",
        category: "Poster",
        isCommission: false,
        artistId: artist1.id,
      },
      {
        title: "Forest Dreams Peak",
        description: "Fine art photography capturing the misty peaks of a dense pine forest during sunrise.",
        image: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80",
        price: 120000,
        stock: 8,
        style: "Photography",
        theme: "Nature",
        color: "Green",
        category: "Digital Asset",
        isCommission: false,
        artistId: artist3.id,
      },
      {
        title: "Abstract Liquid Waves",
        description: "Fluid abstract acrylic art featuring dark marble style patterns highlighted with gold veins.",
        image: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=600&q=80",
        price: 350000,
        stock: 3,
        style: "Abstract",
        theme: "Nature",
        color: "Black",
        category: "Poster",
        isCommission: false,
        artistId: artist1.id,
      },
      {
        title: "Vintage Sports Grid",
        description: "Retro poster artwork capturing the speed and energy of F1 racing cars from the 1970s.",
        image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=600&q=80",
        price: 180000,
        stock: 12,
        style: "Traditional Art",
        theme: "Sports",
        color: "Orange",
        category: "Poster",
        isCommission: false,
        artistId: artist3.id,
      },
      {
        title: "Cute Panda Sticker Pack",
        description: "High quality vector sticker designs representing pandas in different funny moods.",
        image: "https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?auto=format&fit=crop&w=600&q=80",
        price: 50000,
        stock: 100,
        style: "Illustration",
        theme: "Animals",
        color: "White",
        category: "Sticker",
        isCommission: false,
        artistId: artist2.id,
      },
      {
        title: "Anime Spirit Commission",
        description: "Open Commission for custom anime illustrations. Hand-drawn digital portraits in high resolution.",
        image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80",
        price: 500000,
        stock: 99,
        style: "Japanese",
        theme: "Anime",
        color: "Red",
        category: "Open Commission",
        isCommission: true,
        artistId: artist2.id,
      }
    ];

    for (const art of artsData) {
      await prisma.art.create({ data: art });
    }

    console.log("Seeding complete successfully!");
  } catch (err) {
    console.error("Seeding failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
