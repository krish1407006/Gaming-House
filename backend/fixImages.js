import mongoose from 'mongoose';
import Game from './models/Game.js';

async function fixBrokenImages() {
  try {
    await mongoose.connect('mongodb://localhost:27017/criticscore');
    console.log('Connected to MongoDB');

    // Fix broken poster URLs
    const result1 = await Game.updateMany(
      { poster: { $regex: '81n5lHkQKGL._AC_UF894,1000_QL80_.jpg' } },
      { $set: { poster: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg' } }
    );

    const result2 = await Game.updateMany(
      { poster: { $regex: '81Q1b6vK8zL._AC_UF894,1000_QL80_.jpg' } },
      { $set: { poster: 'https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg' } }
    );

    console.log(`Updated ${result1.modifiedCount + result2.modifiedCount} broken poster URLs`);
    
    // List all games to verify
    const games = await Game.find({});
    console.log('\nCurrent games in database:');
    games.forEach((game) => {
      console.log(`- ${game.title}: ${game.poster}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixBrokenImages();