import mongoose from 'mongoose';
// Updated to Standard Connection String
// make local url 
const localMongodbUrl = "mongodb://localhost:27017/shahin-traders"


async function test() {
  console.log("Testing connection to Standard URI...");
  try {
    await mongoose.connect(localMongodbUrl, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("✅ Connected successfully to Atlas via Standard URI");
    await mongoose.disconnect();
  } catch (err) {
    console.error("❌ Connection failed:", err.message);
    if (err.message.includes('IP not whitelisted')) {
      console.log("\nTIP: Ensure your current IP is whitelisted in MongoDB Atlas under Network Access.");
    }
  }
}

test();
