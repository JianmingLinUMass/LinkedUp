const mongoose = require('mongoose');

async function testDatabaseConnection() {
    console.log('🧪 Testing database connection...');
    
    // Use the test database URI directly
    const MONGODB_URI = "mongodb+srv://mykaala:mykaala@linkedup.ntc02tv.mongodb.net/linkedup_test?retryWrites=true&w=majority&appName=linkedup";
    console.log('📍 Using test database URI');
    

    
    try {
        // Connect
        console.log('🔌 Connecting...');
        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 5000,
        });
        console.log('✅ Connected successfully');
        
        // Test User model
        const UserSchema = new mongoose.Schema({
            email: String,
            password: String
        });
        const User = mongoose.models.User || mongoose.model('User', UserSchema);
        
        // Test operations
        console.log('📊 Testing operations...');
        const count = await User.countDocuments();
        console.log(`✅ User count: ${count}`);
        
        // Test create and read
        const testUser = await User.create({
            email: 'test@example.com',
            password: 'testpass'
        });
        console.log('✅ Created test user:', testUser._id);
        
        const foundUser = await User.findById(testUser._id);
        console.log('✅ Found test user:', foundUser.email);
        
        // Cleanup
        await User.deleteOne({ _id: testUser._id });
        console.log('✅ Cleaned up test user');
        
        console.log('🎉 All database operations successful!');
        
    } catch (error) {
        console.error('❌ Database test failed:', error.message);
        if (error.code) {
            console.error('Error code:', error.code);
        }
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Connection closed');
    }
}

testDatabaseConnection();