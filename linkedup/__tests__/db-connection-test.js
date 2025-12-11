const mongoose = require('mongoose');

async function testConnection() {
    try {
        const MONGODB_URI = "mongodb+srv://mykaala:mykaala@linkedup.ntc02tv.mongodb.net/linkedup_test?retryWrites=true&w=majority&appName=linkedup";
        console.log('Attempting to connect to:', MONGODB_URI);
        
        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 5000,
        });
        
        console.log('✅ Database connection successful');
        
        // Test a simple operation
        const testCollection = mongoose.connection.db.collection('test');
        await testCollection.insertOne({ test: 'connection', timestamp: new Date() });
        console.log('✅ Database write test successful');
        
        await mongoose.connection.close();
        console.log('✅ Database connection closed');
        
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        process.exit(1);
    }
}

testConnection();