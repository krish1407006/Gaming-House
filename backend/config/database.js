import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/criticscore"
    );

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Drop stale index from old schema (movieId was renamed to gameId)
    try {
      const ratingsCollection = conn.connection.db.collection("ratings");
      const indexes = await ratingsCollection.indexes();
      const staleIndex = indexes.find((i) => i.name === "movieId_1_userId_1");
      if (staleIndex) {
        await ratingsCollection.dropIndex("movieId_1_userId_1");
        console.log('Dropped stale index "movieId_1_userId_1" from ratings collection');
      }
    } catch (e) {
      if (e.codeName !== "IndexNotFound") {
        console.warn("Index cleanup:", e.message);
      }
    }
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1);
  }
};

export default connectDB;
