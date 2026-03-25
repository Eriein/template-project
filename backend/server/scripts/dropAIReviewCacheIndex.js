require('dotenv').config();
const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.DB_URL);
  const collection = mongoose.connection.collection('AIReviewCache');
  await collection.dropIndex('userId_1_omdbId_1');
  console.log('Index dropped.');
  await mongoose.disconnect();
}

run().catch((err) => {
  // Index not found means it was already dropped — not an error
  if (err.codeName === 'IndexNotFound') {
    console.log('Index not found — already dropped or never existed.');
    process.exit(0);
  }
  console.error(err);
  process.exit(1);
});
