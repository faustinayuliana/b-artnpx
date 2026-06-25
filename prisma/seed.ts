import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Wiping existing database records...");
    await prisma.message.deleteMany();
    await prisma.conversation.deleteMany();
    await prisma.follow.deleteMany();
    await prisma.bid.deleteMany();
    await prisma.auction.deleteMany();
    await (prisma as any).review.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.address.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.favorite.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.art.deleteMany();
    await prisma.user.deleteMany();

    console.log("Hashing default password...");
    const hashedPassword = await bcrypt.hash("password123", 10);

    console.log("Creating 10 Artists with matching styles...");
    
    // 1. Akira Tanaka - Anime
    const akira = await prisma.user.create({
      data: {
        username: "Akira Tanaka",
        email: "akira@gmail.com",
        password: hashedPassword,
        role: "ARTIST",
        badge: "PLATINUM",
        bio: "Anime illustrator specializing in futuristic cyberpunk designs and ethereal fantasy character art.",
        wallet: 2500000,
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80"
      }
    });

    // 2. Daniel Smith - Photography
    const daniel = await prisma.user.create({
      data: {
        username: "Daniel Smith",
        email: "daniel@gmail.com",
        password: hashedPassword,
        role: "ARTIST",
        badge: "GOLD",
        bio: "Award-winning landscape photographer capturing natural light and starry nightscapes across the globe.",
        wallet: 1800000,
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80"
      }
    });

    // 3. Maya Putri - Illustration
    const maya = await prisma.user.create({
      data: {
        username: "Maya Putri",
        email: "maya@gmail.com",
        password: hashedPassword,
        role: "ARTIST",
        badge: "SILVER",
        bio: "Indonesian vector illustrator creating cute sticker packs, pixel art patterns, and kawaii character sets.",
        wallet: 1200000,
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80"
      }
    });

    // 4. Aria Kusuma - Traditional Art
    const aria = await prisma.user.create({
      data: {
        username: "Aria Kusuma",
        email: "aria@gmail.com",
        password: hashedPassword,
        role: "ARTIST",
        badge: "COPPER",
        bio: "Traditional painter specializing in oil and watercolor portrait commissions and custom scenery sheets.",
        wallet: 800000,
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80"
      }
    });

    // 5. Kenji Sato - Anime
    const kenji = await prisma.user.create({
      data: {
        username: "Kenji Sato",
        email: "kenji@gmail.com",
        password: hashedPassword,
        role: "ARTIST",
        badge: "SILVER",
        bio: "Concept artist drafting high-fidelity anime mechas and futuristic shrine maidens.",
        wallet: 1500000,
        avatar: "https://images.unsplash.com/photo-1620122303020-43ec4b6cf7f8?w=150&q=80"
      }
    });

    // 6. Marcus Vance - Photography
    const marcus = await prisma.user.create({
      data: {
        username: "Marcus Vance",
        email: "marcus@gmail.com",
        password: hashedPassword,
        role: "ARTIST",
        badge: "GOLD",
        bio: "Adventure photographer chasing cosmic horizons, mountain trails, and coastal sunrises.",
        wallet: 2000000,
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80"
      }
    });

    // 7. Chloe Dubois - Illustration
    const chloe = await prisma.user.create({
      data: {
        username: "Chloe Dubois",
        email: "chloe@gmail.com",
        password: hashedPassword,
        role: "ARTIST",
        badge: "COPPER",
        bio: "Graphic designer compiling user interface kits, retro game icons, and elegant web template sheets.",
        wallet: 950000,
        avatar: "https://images.unsplash.com/photo-1534751516642-a131fed10495?w=150&q=80"
      }
    });

    // 8. Elena Rostova - Traditional Art
    const elena = await prisma.user.create({
      data: {
        username: "Elena Rostova",
        email: "elena@gmail.com",
        password: hashedPassword,
        role: "ARTIST",
        badge: "COPPER",
        bio: "Fine artist creating watercolor landscapes, autumn forest studies, and organic flora sketches.",
        wallet: 750000,
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&q=80"
      }
    });

    // 9. Yukihiro Kato - Anime
    const yukihiro = await prisma.user.create({
      data: {
        username: "Yukihiro Kato",
        email: "yukihiro@gmail.com",
        password: hashedPassword,
        role: "ARTIST",
        badge: "PLATINUM",
        bio: "Doujinshi and game illustrator painting high-intensity fantasy katanas and legendary ronins.",
        wallet: 3000000,
        avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&q=80"
      }
    });

    // 10. Sarah Jenkins - Illustration
    const sarah = await prisma.user.create({
      data: {
        username: "Sarah Jenkins",
        email: "sarah@gmail.com",
        password: hashedPassword,
        role: "ARTIST",
        badge: "SILVER",
        bio: "Digital creator drafting modern vector dashboards, sticker packs, and game mockups.",
        wallet: 1100000,
        avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&q=80"
      }
    });

    const artists = [akira, daniel, maya, aria, kenji, marcus, chloe, elena, yukihiro, sarah];

    console.log("Creating 2 regular Users...");
    const user1 = await prisma.user.create({
      data: {
        username: "ArtFanatic",
        email: "user1@gmail.com",
        password: hashedPassword,
        role: "USER",
        wallet: 5000000, // Rp5.000.000
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80"
      }
    });

    const user2 = await prisma.user.create({
      data: {
        username: "CollectorPro",
        email: "user2@gmail.com",
        password: hashedPassword,
        role: "USER",
        wallet: 7500000, // Rp7.500.000
        avatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&q=80"
      }
    });

    const users = [user1, user2];

    console.log("Creating 30 Artworks perfectly consistent with their categories, titles, and artist styles...");
    
    // Artwork definitions
    const artworksData = [
      // === Akira Tanaka (Anime Graph) ===
      {
        artistId: akira.id,
        title: "Cyberpunk Samurai",
        description: "A futuristic samurai standing beneath neon signs in a rainy Tokyo alley.",
        image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&q=80",
        price: 350000,
        category: "Anime Graph",
        style: "Japanese",
        theme: "Anime",
        color: "Purple",
      },
      {
        artistId: akira.id,
        title: "Cherry Blossom Spirit",
        description: "A mystical nature spirit floating amidst floating sakura petals under a full moon.",
        image: "https://images.unsplash.com/photo-1522441815192-d9f04eb0615c?w=800&q=80",
        price: 450000,
        category: "Anime Graph",
        style: "Japanese",
        theme: "Nature",
        color: "Pink",
      },
      {
        artistId: akira.id,
        title: "Moonlight Kitsune",
        description: "A magical white fox with multiple tails sitting on a Torii gate at night.",
        image: "https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?w=800&q=80",
        price: 400000,
        category: "Anime Graph",
        style: "Japanese",
        theme: "Japanese",
        color: "Blue",
      },

      // === Daniel Smith (Wallpaper) ===
      {
        artistId: daniel.id,
        title: "Aurora Night",
        description: "A breathtaking view of green northern lights dancing over snowy arctic mountains.",
        image: "https://images.unsplash.com/photo-1483347756197-71ef80e95f73?w=800&q=80",
        price: 150000,
        category: "Wallpaper",
        style: "Photography",
        theme: "Nature",
        color: "Green",
      },
      {
        artistId: daniel.id,
        title: "Ocean Dreams",
        description: "Crystal clear waves crashing on a pristine sandy beach under soft pastel clouds.",
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
        price: 180000,
        category: "Wallpaper",
        style: "Photography",
        theme: "Travel",
        color: "Blue",
      },
      {
        artistId: daniel.id,
        title: "Sunset Hills",
        description: "Golden hour sunlight casting warm glows over rolling green hills and wild flower valleys.",
        image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80",
        price: 200000,
        category: "Wallpaper",
        style: "Photography",
        theme: "Nature",
        color: "Orange",
      },

      // === Maya Putri (Sticker) ===
      {
        artistId: maya.id,
        title: "Cute Panda Pack",
        description: "A collection of adorable, chubby panda stickers showing various fun emotions.",
        image: "https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=800&q=80",
        price: 75000,
        category: "Sticker",
        style: "Illustration",
        theme: "Animals",
        color: "Black",
      },
      {
        artistId: maya.id,
        title: "Pixel Cat Set",
        description: "A retro 8-bit aesthetic sticker sheet featuring cozy and cute kitten expressions.",
        image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&q=80",
        price: 80000,
        category: "Sticker",
        style: "Illustration",
        theme: "Animals",
        color: "White",
      },
      {
        artistId: maya.id,
        title: "Kawaii Food Collection",
        description: "A colorful set of smiling sushi, bubble tea, and sweet dessert stickers.",
        image: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=800&q=80",
        price: 90000,
        category: "Sticker",
        style: "Illustration",
        theme: "Food",
        color: "Pink",
      },

      // === Aria Kusuma (Open Commission) ===
      {
        artistId: aria.id,
        title: "Portrait Commission",
        description: "A highly detailed, custom digital portrait showcasing soft lighting and expressive eyes.",
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80",
        price: 500000,
        category: "Open Commission",
        style: "Traditional Art",
        theme: "Japanese",
        color: "Red",
        isCommission: true,
      },
      {
        artistId: aria.id,
        title: "Chibi Commission",
        description: "An ultra-cute, small-scale character design with oversized head and big sparkly eyes.",
        image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80",
        price: 300000,
        category: "Open Commission",
        style: "Traditional Art",
        theme: "Anime",
        color: "Pink",
        isCommission: true,
      },
      {
        artistId: aria.id,
        title: "Character Design Commission",
        description: "A full-body character sheet detailing front, back, and expression views for a custom hero.",
        image: "https://images.unsplash.com/photo-1569172122301-bc5008bc09c5?w=800&q=80",
        price: 800000,
        category: "Open Commission",
        style: "Traditional Art",
        theme: "Movies",
        color: "Black",
        isCommission: true,
      },

      // === Kenji Sato (Anime Graph) ===
      {
        artistId: kenji.id,
        title: "Neon Ronin",
        description: "A cybernetically enhanced wandering swordsman looking over a neon-drenched metropolis.",
        image: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&q=80",
        price: 380000,
        category: "Anime Graph",
        style: "Japanese",
        theme: "Anime",
        color: "Blue",
      },
      {
        artistId: kenji.id,
        title: "Mecha Genesis",
        description: "A giant humanoid robot standing in a futuristic hangar under industrial spotlights.",
        image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80",
        price: 420000,
        category: "Anime Graph",
        style: "Japanese",
        theme: "Cars",
        color: "Black",
      },
      {
        artistId: kenji.id,
        title: "Cyber Shrine Maiden",
        description: "A shrine maiden with high-tech visors standing before a glowing digital Torii gate.",
        image: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800&q=80",
        price: 390000,
        category: "Anime Graph",
        style: "Japanese",
        theme: "Japanese",
        color: "Red",
      },

      // === Marcus Vance (Wallpaper) ===
      {
        artistId: marcus.id,
        title: "Galaxy Horizon",
        description: "An epic cosmic vista showing a distant galaxy rising behind a calm mountain lake.",
        image: "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=800&q=80",
        price: 160000,
        category: "Wallpaper",
        style: "Photography",
        theme: "Nature",
        color: "Purple",
      },
      {
        artistId: marcus.id,
        title: "Starry Night Canopy",
        description: "A spectacular view of the Milky Way galaxy arching over a dark forest camp.",
        image: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=800&q=80",
        price: 170000,
        category: "Wallpaper",
        style: "Photography",
        theme: "Travel",
        color: "Black",
      },
      {
        artistId: marcus.id,
        title: "Desert Solitude",
        description: "A vast red sand desert under a blazing orange sun with long dramatic shadows.",
        image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&q=80",
        price: 140000,
        category: "Wallpaper",
        style: "Photography",
        theme: "Nature",
        color: "Orange",
      },

      // === Chloe Dubois (Digital Asset) ===
      {
        artistId: chloe.id,
        title: "Fantasy UI Kit",
        description: "A complete set of dark fantasy themed user interface elements with gold borders and glowing buttons.",
        image: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=800&q=80",
        price: 250000,
        category: "Digital Asset",
        style: "Graphic Design",
        theme: "Movies",
        color: "Yellow",
      },
      {
        artistId: chloe.id,
        title: "Game Icon Bundle",
        description: "A comprehensive package of stylized skill and item icons for fantasy RPG games.",
        image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&q=80",
        price: 290000,
        category: "Digital Asset",
        style: "Graphic Design",
        theme: "Sports",
        color: "Red",
      },
      {
        artistId: chloe.id,
        title: "Social Media Template Pack",
        description: "Sleek and modern graphic design templates optimized for clean aesthetic social posts.",
        image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80",
        price: 190000,
        category: "Digital Asset",
        style: "Graphic Design",
        theme: "Travel",
        color: "White",
      },

      // === Elena Rostova (Traditional Art / Poster) ===
      {
        artistId: elena.id,
        title: "Watercolor Meadow",
        description: "A peaceful countryside meadow painting with soft wildflowers and warm sunlight.",
        image: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800&q=80",
        price: 320000,
        category: "Poster",
        style: "Traditional Art",
        theme: "Nature",
        color: "Green",
      },
      {
        artistId: elena.id,
        title: "Autumn Forest Pathway",
        description: "A stunning traditional painting of a forest pathway covered in vibrant red and gold autumn leaves.",
        image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
        price: 340000,
        category: "Poster",
        style: "Traditional Art",
        theme: "Nature",
        color: "Orange",
      },
      {
        artistId: elena.id,
        title: "Mist Mountain Lake",
        description: "A serene and mystical view of a fog-covered mountain lake surrounded by pine trees.",
        image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80",
        price: 380000,
        category: "Poster",
        style: "Traditional Art",
        theme: "Nature",
        color: "Blue",
      },

      // === yukihiro (Anime Graph) ===
      {
        artistId: yukihiro.id,
        title: "Dragon Slayer Spirit",
        description: "An epic anime-style dragon slayer sword glowing with electric blue flames under a dramatic stormy sky.",
        image: "https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=800&q=80",
        price: 460000,
        category: "Anime Graph",
        style: "Japanese",
        theme: "Anime",
        color: "Blue",
      },
      {
        artistId: yukihiro.id,
        title: "Tokyo Cyber Grid",
        description: "A vibrant cybernetic grid overlaying a highly detailed anime sketch of Tokyo's night towers.",
        image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80",
        price: 420000,
        category: "Anime Graph",
        style: "Japanese",
        theme: "Cars",
        color: "Purple",
      },
      {
        artistId: yukihiro.id,
        title: "Spirited Fox Mask",
        description: "A gorgeous watercolor-style anime mask sitting atop Japanese moss-covered forest rocks.",
        image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80",
        price: 390000,
        category: "Anime Graph",
        style: "Japanese",
        theme: "Japanese",
        color: "Red",
      },

      // === Sarah Jenkins (Illustration) ===
      {
        artistId: sarah.id,
        title: "Cyber HUD Assets",
        description: "High-tech head-up display elements, vector reticles, and futuristic data panels.",
        image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80",
        price: 180000,
        category: "Digital Asset",
        style: "Graphic Design",
        theme: "Nature",
        color: "Green",
      },
      {
        artistId: sarah.id,
        title: "Happy Shiba Pack",
        description: "A bundle of playful Shiba Inu dogs expressing pure happiness and excitement.",
        image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800&q=80",
        price: 85000,
        category: "Sticker",
        style: "Illustration",
        theme: "Animals",
        color: "Orange",
      },
      {
        artistId: sarah.id,
        title: "Couple Illustration",
        description: "A warm and romantic digital illustration of a couple sharing a cozy coffee date.",
        image: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&q=80",
        price: 240000,
        category: "Open Commission",
        style: "Illustration",
        theme: "Food",
        color: "Pink",
        isCommission: true,
      },
    ];

    const createdArts = [];
    for (let i = 0; i < artworksData.length; i++) {
      const art = await prisma.art.create({
        data: {
          title: artworksData[i].title,
          description: artworksData[i].description,
          image: artworksData[i].image,
          price: artworksData[i].price,
          stock: 10 + (i % 5),
          style: artworksData[i].style,
          color: artworksData[i].color,
          theme: artworksData[i].theme,
          category: artworksData[i].category,
          isCommission: artworksData[i].isCommission || false,
          discount: i % 4 === 0 ? 10 : 0,
          artistId: artworksData[i].artistId,
        } as any
      });
      createdArts.push(art);
    }

    console.log("Creating 5 Notifications...");
    const notifications = [
      { userId: user1.id, title: "Order Successful", message: "Your purchase for 'Cyberpunk Samurai' was completed successfully. E-ticket sent to email." },
      { userId: user1.id, title: "Special Deal Alert", message: "Akira Tanaka has discounted their popular sumi-e artworks by 10% today only!" },
      { userId: user2.id, title: "Collector Reward", message: "Congratulations! You have unlocked a collector achievement badge for purchasing 5 artworks." },
      { userId: akira.id, title: "Art Sold!", message: "Your artwork 'Cyberpunk Samurai' has been purchased. Funds have been credited to your wallet." },
      { userId: daniel.id, title: "Artwork Approved", message: "Your submission 'Aurora Night' has been reviewed and listed on the marketplace." }
    ];

    for (const notif of notifications) {
      await prisma.notification.create({
        data: notif
      });
    }

    console.log("Creating 3 Payment Methods...");
    const paymentMethods = [
      { userId: user1.id, type: "BANK_TRANSFER", bank: "Mandiri", number: "124000987654", isPrimary: true },
      { userId: user1.id, type: "E_WALLET", bank: "OVO", number: "081234567890", isPrimary: false },
      { userId: user2.id, type: "BANK_TRANSFER", bank: "BCA", number: "8830123456", isPrimary: true }
    ];

    for (const payment of paymentMethods) {
      await prisma.payment.create({
        data: payment
      });
    }

    console.log("Creating 3 Addresses...");
    const addresses = [
      { userId: user1.id, name: "Home Address", phone: "081234567890", address: "Jl. Kemang Raya No. 12, RT 01/RW 02", city: "Jakarta Selatan", province: "DKI Jakarta", postalCode: "12730", isPrimary: true },
      { userId: user1.id, name: "Office", phone: "089876543210", address: "Sudirman Central Business District (SCBD) Gedung Artha Lt. 15", city: "Jakarta Pusat", province: "DKI Jakarta", postalCode: "12190", isPrimary: false },
      { userId: user2.id, name: "Primary Residence", phone: "081122334455", address: "Perumahan Dago Asri Blok C-7, Coblong", city: "Bandung", province: "Jawa Barat", postalCode: "40135", isPrimary: true }
    ];

    for (const addr of addresses) {
      await prisma.address.create({
        data: addr
      });
    }

    console.log("Creating 5 Favorites...");
    const favorites = [
      { userId: user1.id, artId: createdArts[0].id }, // Cyberpunk Samurai
      { userId: user1.id, artId: createdArts[3].id }, // Aurora Night
      { userId: user1.id, artId: createdArts[6].id }, // Cute Panda Pack
      { userId: user2.id, artId: createdArts[0].id }, // Cyberpunk Samurai
      { userId: user2.id, artId: createdArts[12].id } // Neon Ronin
    ];

    for (const fav of favorites) {
      await prisma.favorite.create({
        data: fav
      });
    }

    console.log("Creating 10 Reviews...");
    const reviews = [
      { artId: createdArts[0].id, userId: user1.id, rating: 5, comment: "Absolutely gorgeous work! The neon details look incredible in dark mode." },
      { artId: createdArts[0].id, userId: user2.id, rating: 4, comment: "Beautiful illustration, the composition is very strong. Highly recommended." },
      { artId: createdArts[3].id, userId: user1.id, rating: 5, comment: "Amazing capture! The green tones of the aurora are absolutely stunning." },
      { artId: createdArts[6].id, userId: user2.id, rating: 5, comment: "Such a cute sticker pack. Printed them out and they look beautiful." },
      { artId: createdArts[12].id, userId: user1.id, rating: 5, comment: "Outstanding artwork by Kenji. A perfect addition to my collection." },
      { artId: createdArts[1].id, userId: user2.id, rating: 5, comment: "Very ethereal and mystical. Gives off a lovely cozy vibe." },
      { artId: createdArts[4].id, userId: user1.id, rating: 4, comment: "High quality photo resolution. Makes for a great high-res screen wallpaper." },
      { artId: createdArts[7].id, userId: user2.id, rating: 5, comment: "Super cute and creative cat sticker pack!" },
      { artId: createdArts[9].id, userId: user1.id, rating: 5, comment: "The custom digital portrait exceeded all my expectations! Highly detailed." },
      { artId: createdArts[19].id, userId: user2.id, rating: 4, comment: "Very comprehensive UI kit, matches the description and styles perfectly." },
    ];

    for (const rev of reviews) {
      await (prisma as any).review.create({
        data: rev
      });
    }

    console.log("Database seeded successfully with consistent and high-quality data!");
  } catch (error) {
    console.error("Error during seeding database:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
