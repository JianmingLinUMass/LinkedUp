const mongoose = require('mongoose');

async function debugConnection() {
    console.log('🔍 Starting database connection debug...');
    
    // Test 1: Check environment
    console.log('📋 Environment check:');
    console.log('- Node version:', process.version);
    console.log('- Mongoose version:', mongoose.version);
    
    // Test 2: Connection string validation
    const MONGODB_URI = "mongodb+srv://mykaala:mykaala@linkedup.ntc02tv.mongodb.net/linkedup_test?retryWrites=true&w=majority&appName=linkedup";
    console.log('🔗 Connection string:', MONGODB_URI.replace(/\/\/.*:.*@/, '//***:***@'));
    
    // Test 3: Connection with detailed options
    console.log('⏱️  Attempting connection with timeout options...');
    
    try {
        const startTime = Date.now();
        
        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 10000,
            connectTimeoutMS: 10000,
            socketTimeoutMS: 10000,
            maxPoolSize: 1,
            bufferCommands: false
        });
        
        const connectTime = Date.now() - startTime;
        console.log(`✅ Connected successfully in ${connectTime}ms`);
        console.log('📊 Connection state:', mongoose.connection.readyState);
        console.log('🏷️  Database name:', mongoose.connection.name);
        
        // Test 4: Simple operation
        console.log('🧪 Testing simple operation...');
        const testStart = Date.now();
        
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log(`✅ Listed collections in ${Date.now() - testStart}ms:`, collections.map(c => c.name));
        
        // Test 5: User model operation
        console.log('👤 Testing User model...');
        const UserSchema = new mongoose.Schema({
            email: String,
            password: String
        });
        const User = mongoose.models.User || mongoose.model('User', UserSchema);
        
        const userOpStart = Date.now();
        const userCount = await User.countDocuments();
        console.log(`✅ User count operation in ${Date.now() - userOpStart}ms: ${userCount} users`);
        
        // Test 6: Cleanup operation
        console.log('🧹 Testing cleanup operation...');
        const cleanupStart = Date.now();
        const deleteResult = await User.deleteMany({ email: { $regex: 'debug.*test' } });
        console.log(`✅ Cleanup in ${Date.now() - cleanupStart}ms: deleted ${deleteResult.deletedCount} documents`);
        
        console.log('🎉 All tests passed!');
        
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        console.error('🔍 Error details:', {
            name: error.name,
            code: error.code,
            codeName: error.codeName
        });
        
        if (error.reason) {
            console.error('📝 Reason:', error.reason);
        }
    } finally {
        if (mongoose.connection.readyState !== 0) {
            console.log('🔌 Closing connection...');
            await mongoose.connection.close();
            console.log('✅ Connection closed');
        }
    }
}

debugConnection().catch(console.error);