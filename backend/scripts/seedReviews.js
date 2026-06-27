import "dotenv/config";
import mongoose from "mongoose";
import Game from "../models/Game.js";
import Rating from "../models/Rating.js";
import connectDB from "../config/database.js";

const reviewTemplates = [
  "Absolutely incredible game. The attention to detail is unmatched and the gameplay is super satisfying.",
  "One of the best games I have ever played. The story kept me hooked from start to finish.",
  "Great game overall but there are some minor bugs that need fixing. Still highly recommend it.",
  "The graphics are stunning and the gameplay is smooth. Worth every penny.",
  "Not perfect but definitely a solid experience. The developers really put love into this.",
  "Been playing for weeks and still discovering new things. The replay value is amazing.",
  "The soundtrack alone makes this game worth buying. Combined with the gameplay, it is a masterpiece.",
  "Good game but I feel it is slightly overrated. Still enjoyable though.",
  "A must-play for any fan of the genre. Sets a new standard for what games can achieve.",
  "Incredible world design and immersive atmosphere. Lost myself in this game for hours.",
  "The combat system is fantastic and the boss battles are epic. Highly recommended.",
  "I was blown away by the visual quality and the depth of the storyline.",
  "Solid gameplay mechanics and a compelling narrative. One of the better releases this year.",
  "This game exceeded all my expectations. The developers really outdid themselves.",
  "Fun gameplay but the story could have been better. Still worth checking out.",
  "A true masterpiece of game design. Every aspect feels polished and intentional.",
  "The multiplayer mode is where this game really shines. Endless fun with friends.",
  "Really immersive experience with great attention to world-building.",
  "Good but not great. There are better options in this genre.",
  "An emotional journey that stayed with me long after I finished playing.",
];

const negativeReviews = [
  "Disappointing experience overall. Expected much more given the hype.",
  "The game has potential but feels unfinished in many areas.",
  "Too many bugs and technical issues ruined the experience for me.",
  "Not worth the full price. Wait for a sale if you are interested.",
  "The story is confusing and the gameplay feels repetitive after a while.",
  "I wanted to like this game but the technical problems made it unplayable at times.",
  "Mediocre at best. There are much better games in this genre.",
  "The controls are clunky and the UI is a mess. Needs major improvements.",
];

const topGames = {
  "Elden Ring": 9.5,
  "The Legend of Zelda: Breath of the Wild": 9.5,
  "God of War Ragnarök": 9.3,
  "Baldur's Gate 3": 9.5,
  "The Witcher 3: Wild Hunt": 9.5,
  "Red Dead Redemption 2": 9.5,
  "Ghost of Tsushima": 9.2,
  "Bloodborne": 9.3,
  "Dark Souls III": 9.0,
  "Persona 5": 9.3,
  "Final Fantasy VII Remake": 9.0,
  "Resident Evil 4 Remake": 9.2,
  "Minecraft": 8.8,
  "Grand Theft Auto V": 9.5,
  "Spider-Man 2": 9.0,
  "Alan Wake 2": 9.0,
  "Street Fighter 6": 9.0,
  "Tekken 8": 9.0,
  "Monster Hunter: World": 8.8,
  "Final Fantasy XVI": 8.8,
  "Death Stranding": 8.5,
  "Dragon's Dogma 2": 8.5,
  "Helldivers 2": 8.5,
  "Star Wars Jedi: Survivor": 8.5,
  "Metal Gear Solid V": 9.0,
  "Cyberpunk 2077": 8.0,
  "Hogwarts Legacy": 8.0,
  "Palworld": 8.0,
  "Gran Turismo 7": 8.5,
  "Forza Motorsport": 8.0,
  "Devil May Cry 5": 8.8,
  "Halo Infinite": 7.5,
  "Assassin's Creed: Mirage": 7.5,
  "FC 24": 7.5,
  "Mortal Kombat 1": 8.0,
  "Call of Duty: Modern Warfare III": 6.5,
  "NBA 2K24": 6.5,
  "Overwatch 2": 7.0,
  "Apex Legends": 8.0,
  "Warframe": 8.0,
  "Path of Exile": 8.5,
  "Lost Ark": 7.5,
  "New World": 7.0,
  "Final Fantasy XIV": 9.0,
  "World of Warcraft": 8.0,
  "Counter-Strike 2": 8.0,
  "Valorant": 8.0,
  "Dota 2": 8.0,
  "League of Legends": 7.5,
  "Fortnite": 7.5,
  "Grand Theft Auto VI": 9.5,
  "Monster Hunter Wilds": 8.8,
  "Doom: The Dark Ages": 8.5,
  "Death Stranding 2: On the Beach": 8.5,
  "Assassin's Creed Shadows": 8.0,
  Avowed: 8.0,
  "Metroid Prime 4: Beyond": 9.0,
  "Ghost of Yotei": 8.5,
  "Borderlands 4": 8.0,
  "Sid Meier's Civilization VII": 8.5,
  "Split Fiction": 8.5,
  Fable: 8.0,
  "The First Berserker: Khazan": 7.5,
  Atomfall: 7.5,
  "Elden Ring Nightreign": 9.0,
  "Mafia: The Old Country": 8.0,
  "Like a Dragon: Pirate Yakuza in Hawaii": 8.0,
  "Clair Obscur: Expedition 33": 7.5,
  "South of Midnight": 7.5,
  "The Witcher IV": 9.0,
  "Marvel's Wolverine": 8.5,
  "Gears of War: E-Day": 8.5,
  "Mass Effect 5": 8.5,
  "Resident Evil 2 Remake": 9.0,
  "Resident Evil 3 Remake": 7.5,
  "Resident Evil 7: Biohazard": 9.0,
  "Resident Evil Village": 8.5,
  "Resident Evil 5": 7.5,
  "Resident Evil 0": 7.0,
};

function getTargetRating(title) {
  const match = Object.entries(topGames).find(([key]) =>
    title.toLowerCase().includes(key.toLowerCase()) ||
    key.toLowerCase().includes(title.toLowerCase())
  );
  return match ? match[1] : 7.5;
}

function generateRating(targetAvg) {
  const variation = (Math.random() - 0.5) * 4;
  let rating = Math.round(targetAvg + variation);
  rating = Math.max(1, Math.min(10, rating));
  return rating;
}

function generateReviewsForGame(game, count) {
  const targetAvg = getTargetRating(game.title);
  const reviews = [];
  const usedUsers = new Set();

  for (let i = 0; i < count; i++) {
    const rating = generateRating(targetAvg);

    let userId;
    do {
      userId = `seed_user_${Math.random().toString(36).substring(2, 10)}`;
    } while (usedUsers.has(userId));
    usedUsers.add(userId);

    const useNegative = rating <= 5;
    const pool = useNegative ? negativeReviews : reviewTemplates;
    let review = pool[Math.floor(Math.random() * pool.length)];

    if (rating >= 9) {
      const extras = [
        " Absolutely amazing, 10/10 would recommend to everyone.",
        " This is gaming at its absolute finest.",
        " A landmark title that will be remembered for years.",
      ];
      review += extras[Math.floor(Math.random() * extras.length)];
    } else if (rating <= 4) {
      const extras = [
        " Would not recommend in its current state.",
        " Really disappointed with this purchase.",
        " Hopefully future updates will fix the issues.",
      ];
      review += extras[Math.floor(Math.random() * extras.length)];
    }

    if (review.length > 1000) {
      review = review.substring(0, 997) + "...";
    }

    reviews.push({
      gameId: game._id,
      userId,
      rating,
      review,
      isPublic: true,
      helpfulVotes: Math.floor(Math.random() * 50),
      helpfulBy: [],
    });
  }

  return { reviews, targetAvg };
}

async function seedReviews() {
  try {
    await connectDB();

    const games = await Game.find({});
    console.log(`Found ${games.length} games to rate`);

    await Rating.deleteMany({});
    console.log("Cleared existing ratings");

    let totalReviews = 0;
    const reviewCounts = {};

    for (const game of games) {
      const count = 6 + Math.floor(Math.random() * 2);
      const { reviews, targetAvg } = generateReviewsForGame(game, count);

      await Rating.insertMany(reviews);
      totalReviews += reviews.length;

      const actualAvg =
        reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      await Game.findByIdAndUpdate(game._id, {
        averageRating: Math.round(actualAvg * 10) / 10,
        totalRatings: reviews.length,
      });

      reviewCounts[game.title] = {
        reviews: reviews.length,
        targetAvg,
        actualAvg: Math.round(actualAvg * 10) / 10,
      };

      console.log(
        `  ${game.title}: ${reviews.length} reviews (target: ${targetAvg}, actual: ${Math.round(actualAvg * 10) / 10})`
      );
    }

    console.log(`\nSeeded ${totalReviews} total reviews across ${games.length} games`);
    console.log("\nTop rated games:");
    const sorted = await Game.find({}).sort({ averageRating: -1 }).limit(10);
    sorted.forEach((g, i) => {
      console.log(`  ${i + 1}. ${g.title} - ${g.averageRating}/10 (${g.totalRatings} reviews)`);
    });

  } catch (error) {
    console.error("Error seeding reviews:", error);
  } finally {
    await mongoose.disconnect();
  }
}

seedReviews();
