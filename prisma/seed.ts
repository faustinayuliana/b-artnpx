import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const STYLES = ["Illustration", "Graphic Design", "Photography", "Japanese", "Abstract", "Paintings", "Traditional Art"];
const COLORS = ["Red", "Blue", "Purple", "Black", "White", "Pink", "Orange", "Green", "Yellow"];
const THEMES = ["Japanese", "Anime", "Sports", "Cars", "Movies", "Animals", "Nature", "Travel", "Food"];
const CATEGORIES = ["Poster", "Wallpaper", "Sticker", "Anime Graph", "Illustration", "Digital Asset"];

async function main() {
  try {
    console.log("Wiping existing database records...");
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

    console.log("Creating 10 Artists...");
    const artistsData = [
      { username: "ZenithArt", email: "zenith@gmail.com", bio: "Digital painter specializing in Japanese scenery. Passionate about color harmony." },
      { username: "PixelMage", email: "pixel@gmail.com", bio: "Retro-style illustrator and sticker designer. Nostalgia in every pixel." },
      { username: "VectorVibe", email: "vector@gmail.com", bio: "Minimalist vector graphic designs and posters. Clean lines, bold concepts." },
      { username: "AuraIllustrates", email: "aura@gmail.com", bio: "Fantasy and ethereal character design. Creating worlds with light and shadow." },
      { username: "ChromaCanvas", email: "chroma@gmail.com", bio: "Vibrant abstract expressionist painter pushing the boundaries of digital medium." },
      { username: "NebulaNoir", email: "nebula@gmail.com", bio: "Sci-fi concept designer, cyberpunk specialist, and futuristic environment builder." },
      { username: "SakuraBrush", email: "sakura@gmail.com", bio: "Traditional Japanese ink wash painting (Sumi-e) modernized for digital screens." },
      { username: "MonochromeMind", email: "mono@gmail.com", bio: "High-contrast black and white photography and minimalist poster layout artist." },
      { username: "PrismPulse", email: "prism@gmail.com", bio: "Psychedelic pop-art illustrator exploring retro-futurism and neon aesthetics." },
      { username: "StudioGhibVibe", email: "ghib@gmail.com", bio: "Cozy watercolor-style illustrations inspired by childhood dreams and nature." }
    ];

    const createdArtists = [];
    for (let i = 0; i < artistsData.length; i++) {
      const artist = await prisma.user.create({
        data: {
          username: artistsData[i].username,
          email: artistsData[i].email,
          password: hashedPassword,
          role: "ARTIST",
          badge: "COPPER",
          bio: artistsData[i].bio,
          wallet: 1500000 + (i * 250000),
          avatar: `https://picsum.photos/seed/avatar${i}/300/300`
        }
      });
      createdArtists.push(artist);
    }

    console.log("Creating 2 regular Users...");
    const createdUsers = [];
    const regularUsersData = [
      { username: "ArtFanatic", email: "user1@gmail.com", wallet: 2500000 },
      { username: "CollectorPro", email: "user2@gmail.com", wallet: 5000000 }
    ];

    for (let i = 0; i < regularUsersData.length; i++) {
      const user = await prisma.user.create({
        data: {
          username: regularUsersData[i].username,
          email: regularUsersData[i].email,
          password: hashedPassword,
          role: "USER",
          wallet: regularUsersData[i].wallet,
          avatar: `https://picsum.photos/seed/user${i}/300/300`
        }
      });
      createdUsers.push(user);
    }

    console.log("Creating 30 Artworks (3 per Artist)...");
    const createdArts = [];
    const artTitles = [
      // Artist 0
      "Neon Tokyo Night", "Sakura Path Reflection", "Rainy Akihabara",
      // Artist 1
      "Pixel Ramen Shop", "Retro Gaming Arcade", "Isometric Coffee Corner",
      // Artist 2
      "Cyberpunk GT-R Spec", "Abstract Geo Shapes", "Minimalist Mountain Line",
      // Artist 3
      "Elven Forest Keeper", "Celestial Mage Artifact", "Wings of Dawn Light",
      // Artist 4
      "Splash of Euphoria", "Chaos in Harmony", "Symphony of Cyan",
      // Artist 5
      "Neo-Seoul Alleyways", "Mars Colonist Station", "Orion Nebula Cruiser",
      // Artist 6
      "Fuji Sumi-e Dawn", "Bamboo Grove Whisper", "Koi Pond Swirl",
      // Artist 7
      "Solitude in Concrete", "Lines of Metropolis", "Shadows of Glass Tower",
      // Artist 8
      "Vaporwave Sunsets", "Psychedelic Pop Soda", "Electric Grid Disco",
      // Artist 9
      "Cozy Rain Cabin", "Sunlit Meadow Picnic", "Forest Spirit Lantern"
    ];

    let artIndex = 0;
    for (let artistIdx = 0; artistIdx < createdArtists.length; artistIdx++) {
      const artist = createdArtists[artistIdx];
      
      for (let artNum = 0; artNum < 3; artNum++) {
        const title = artTitles[artIndex];
        const style = STYLES[artIndex % STYLES.length];
        const color = COLORS[artIndex % COLORS.length];
        const theme = THEMES[artIndex % THEMES.length];
        const category = CATEGORIES[artIndex % CATEGORIES.length];
        const price = 50000 + (artIndex * 25000); // Rp50.000 to Rp775.000

        const art = await prisma.art.create({
          data: {
            title,
            description: `A breathtaking and premium high-fidelity ${category.toLowerCase()} featuring ${title.toLowerCase()} styled in beautiful ${style.toLowerCase()} with a theme of ${theme.toLowerCase()}. Perfect for home and workspace displays.`,
            image: `https://picsum.photos/seed/art${artIndex}/800/600`,
            price,
            stock: 5 + (artIndex % 5),
            style,
            color,
            theme,
            category,
            isCommission: artIndex % 7 === 0,
            discount: artIndex % 5 === 0 ? 10 : 0,
            artistId: artist.id
          } as any
        });
        createdArts.push(art);
        artIndex++;
      }
    }

    console.log("Creating 5 Notifications...");
    const notificationData = [
      { userId: createdUsers[0].id, title: "Order Successful", message: "Your purchase for 'Neon Tokyo Night' was completed successfully. E-ticket sent to email." },
      { userId: createdUsers[0].id, title: "Special Deal Alert", message: "SakuraBrush has discounted their popular sumi-e artworks by 15% today only!" },
      { userId: createdUsers[1].id, title: "Collector Reward", message: "Congratulations! You have unlocked a collector achievement badge for purchasing 5 artworks." },
      { userId: createdArtists[0].id, title: "Art Sold!", message: "Your artwork 'Neon Tokyo Night' has been purchased. Funds have been credited to your wallet." },
      { userId: createdArtists[1].id, title: "Artwork Approved", message: "Your submission 'Pixel Ramen Shop' has been reviewed and listed on the marketplace." }
    ];

    for (const notif of notificationData) {
      await prisma.notification.create({
        data: notif
      });
    }

    console.log("Creating 3 Payment Methods...");
    const paymentMethods = [
      { userId: createdUsers[0].id, type: "BANK_TRANSFER", bank: "Mandiri", number: "124000987654", isPrimary: true },
      { userId: createdUsers[0].id, type: "E_WALLET", bank: "OVO", number: "081234567890", isPrimary: false },
      { userId: createdUsers[1].id, type: "BANK_TRANSFER", bank: "BCA", number: "8830123456", isPrimary: true }
    ];

    for (const payment of paymentMethods) {
      await prisma.payment.create({
        data: payment
      });
    }

    console.log("Creating 3 Addresses...");
    const addresses = [
      { userId: createdUsers[0].id, name: "Home Address", phone: "081234567890", address: "Jl. Kemang Raya No. 12, RT 01/RW 02", city: "Jakarta Selatan", province: "DKI Jakarta", postalCode: "12730", isPrimary: true },
      { userId: createdUsers[0].id, name: "Office", phone: "089876543210", address: "Sudirman Central Business District (SCBD) Gedung Artha Lt. 15", city: "Jakarta Pusat", province: "DKI Jakarta", postalCode: "12190", isPrimary: false },
      { userId: createdUsers[1].id, name: "Primary Residence", phone: "081122334455", address: "Perumahan Dago Asri Blok C-7, Coblong", city: "Bandung", province: "Jawa Barat", postalCode: "40135", isPrimary: true }
    ];

    for (const addr of addresses) {
      await prisma.address.create({
        data: addr
      });
    }

    console.log("Creating 5 Favorites...");
    const favorites = [
      { userId: createdUsers[0].id, artId: createdArts[0].id }, // Neon Tokyo Night
      { userId: createdUsers[0].id, artId: createdArts[3].id }, // Pixel Ramen Shop
      { userId: createdUsers[0].id, artId: createdArts[6].id }, // Cyberpunk GT-R Spec
      { userId: createdUsers[1].id, artId: createdArts[0].id }, // Neon Tokyo Night
      { userId: createdUsers[1].id, artId: createdArts[12].id } // Splash of Euphoria
    ];

    for (const fav of favorites) {
      await prisma.favorite.create({
        data: fav
      });
    }

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error during seeding database:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
