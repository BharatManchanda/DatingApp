const mongoose = require("mongoose")

async function connectToDatabase() {
    try {
    await mongoose.connect(process.env.DATABASE_LINK);
        console.log('MongoDB connected successfully!');
    } catch (error) {
        console.error('MongoDB connection error:', error);
    }
}

export default connectToDatabase;