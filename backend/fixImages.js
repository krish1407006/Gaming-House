import mongoose from 'mongoose';
import Movie from './models/Movie.js';

async function fixBrokenImages() {
  try {
    await mongoose.connect('mongodb://localhost:27017/criticscore');
    console.log('Connected to MongoDB');

    // Fix broken poster URLs
    const result1 = await Movie.updateMany(
      { poster: { $regex: '81n5lHkQKGL._AC_UF894,1000_QL80_.jpg' } },
      { $set: { poster: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg' } }
    );

    const result2 = await Movie.updateMany(
      { poster: { $regex: '81Q1b6vK8zL._AC_UF894,1000_QL80_.jpg' } },
      { $set: { poster: 'https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg' } }
    );

    console.log(`Updated ${result1.modifiedCount + result2.modifiedCount} broken poster URLs`);
    
    // List all movies to verify
    const movies = await Movie.find({});
    console.log('\nCurrent movies in database:');
    movies.forEach(movie => {
      console.log(`- ${movie.title}: ${movie.poster}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixBrokenImages();