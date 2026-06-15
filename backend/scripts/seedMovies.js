import "dotenv/config";
import mongoose from "mongoose";
import Movie from "../models/Movie.js";
import connectDB from "../config/database.js";

// Sample movie data based on the frontend data.json
const sampleMovies = [
  {
    title: "Tokyo Revengers",
    description: "A thrilling story of time travel and gang conflicts.",
    director: "Tsutomu Hanabusa",
    cast: ["Takumi Kitamura", "Yuki Yamada", "Yosuke Sugino"],
    genre: ["Action", "Drama"],
    releaseDate: new Date("2021-07-09"),
    duration: 120,
    language: "English",
    country: "Japan",
    poster:
      "https://m.media-amazon.com/images/I/81p+xe8cbnL._AC_UF894,1000_QL80_.jpg",
    featured: true,
    isActive: true,
    addedBy: "system",
  },
  {
    title: "Bleach: Sennen Kessen-hen",
    description: "The final arc of the legendary Bleach series.",
    director: "Tomohisa Taguchi",
    cast: ["Masakazu Morita", "Fumiko Orikasa", "Kazuya Nakai"],
    genre: ["Fantasy", "Action"],
    releaseDate: new Date("2022-10-10"),
    duration: 24,
    language: "English",
    country: "Japan",
    poster:
      "https://m.media-amazon.com/images/I/81n5lHkQKGL._AC_UF894,1000_QL80_.jpg",
    featured: true,
    isActive: true,
    addedBy: "system",
  },
  {
    title: "Demon Slayer: Kimetsu no Yaiba",
    description: "A young boy becomes a demon slayer to save his sister.",
    director: "Haruo Sotozaki",
    cast: ["Natsuki Hanae", "Satomi Sato", "Hiro Shimono"],
    genre: ["Action", "Adventure"],
    releaseDate: new Date("2019-04-06"),
    duration: 144,
    language: "English",
    country: "Japan",
    poster:
      "https://m.media-amazon.com/images/I/81p+xe8cbnL._AC_UF894,1000_QL80_.jpg",
    featured: false,
    isActive: true,
    addedBy: "system",
  },
  {
    title: "Jujutsu Kaisen 0",
    description: "A prequel to the hit series, full of curses and action.",
    director: "Sunghoo Park",
    cast: ["Megumi Ogata", "Kana Hanazawa", "Mikako Komatsu"],
    genre: ["Action", "Fantasy"],
    releaseDate: new Date("2022-03-18"),
    duration: 105,
    language: "English",
    country: "Japan",
    poster:
      "https://m.media-amazon.com/images/I/81Q1b6vK8zL._AC_UF894,1000_QL80_.jpg",
    featured: true,
    isActive: true,
    addedBy: "system",
  },
  {
    title: "Attack on Titan: Final Season",
    description: "The epic conclusion to the titan saga.",
    director: "Yuichiro Hayashi",
    cast: ["Yuki Kaji", "Marina Inoue", "Yui Ishikawa"],
    genre: ["Action", "Drama"],
    releaseDate: new Date("2023-03-03"),
    duration: 87,
    language: "English",
    country: "Japan",
    poster:
      "https://m.media-amazon.com/images/I/81n5lHkQKGL._AC_UF894,1000_QL80_.jpg",
    featured: true,
    isActive: true,
    addedBy: "system",
  },
];

async function seedMovies() {
  try {
    await connectDB();

    // Clear existing movies
    await Movie.deleteMany({});
    console.log("Cleared existing movies");

    // Insert sample movies
    const insertedMovies = await Movie.insertMany(sampleMovies);
    console.log(`Inserted ${insertedMovies.length} movies:`);
    insertedMovies.forEach((movie) => {
      console.log(`- ${movie.title} (ID: ${movie._id})`);
    });

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await mongoose.disconnect();
  }
}

seedMovies();
