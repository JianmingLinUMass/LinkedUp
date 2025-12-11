import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

export async function dbConnect() {
	if (mongoose.connection.readyState >= 1) {
		return mongoose.connection;
	}
	
	if (!MONGODB_URI) {
		throw new Error('MONGODB_URI environment variable is not defined');
	}
	
	try {
		await mongoose.connect(MONGODB_URI, {
			serverSelectionTimeoutMS: 10000,
			connectTimeoutMS: 10000,
			socketTimeoutMS: 10000,
			maxPoolSize: 1,
			bufferCommands: false
		});
		return mongoose.connection;
	} catch (error) {
		console.error('Database connection error:', error);
		throw error;
	}
}

export async function dbDisconnect() {
	if (mongoose.connection.readyState !== 0) {
		await mongoose.connection.close();
	}
}
