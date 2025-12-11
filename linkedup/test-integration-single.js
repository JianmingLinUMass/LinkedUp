const mongoose = require('mongoose');

// Test database URI
const MONGODB_URI = "mongodb+srv://mykaala:mykaala@linkedup.ntc02tv.mongodb.net/linkedup_test?retryWrites=true&w=majority&appName=linkedup";

// User schema with unique email
const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

// Ensure the unique index is created
UserSchema.index({ email: 1 }, { unique: true });

async function testIntegration() {
    console.log('🧪 Running integration test...');
    
    try {
        // Connect
        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 10000,
            connectTimeoutMS: 10000,
        });
        console.log('✅ Connected to database');
        
        // Get or create User model
        const User = mongoose.models.User || mongoose.model('User', UserSchema);
        
        // Clean up any existing test data
        await User.deleteMany({ email: { $regex: 'integration.*test' } });
        console.log('🧹 Cleaned up existing test data');
        
        // Test 1: Create a user
        const testEmail = 'integration.test@example.com';
        const testPassword = 'testpass123';
        
        const newUser = await User.create({
            email: testEmail,
            password: testPassword
        });
        console.log('✅ Created user:', newUser._id);
        
        // Test 2: Find the user
        const foundUser = await User.findOne({ email: testEmail });
        if (!foundUser) {
            throw new Error('User not found after creation');
        }
        console.log('✅ Found user:', foundUser.email);
        
        // Test 3: Get all users
        const allUsers = await User.find().select('_id email').lean();
        const ourUser = allUsers.find(user => user.email === testEmail);
        if (!ourUser) {
            throw new Error('User not found in all users query');
        }
        console.log('✅ User found in all users query');
        
        // Test 4: Test duplicate email
        try {
            await User.create({
                email: testEmail,
                password: 'different_password'
            });
            throw new Error('Should have failed on duplicate email');
        } catch (error) {
            if (error.code === 11000) {
                console.log('✅ Duplicate email correctly rejected');
            } else {
                throw error;
            }
        }
        
        // Cleanup
        await User.deleteMany({ email: { $regex: 'integration.*test' } });
        console.log('🧹 Final cleanup completed');
        
        console.log('🎉 All integration tests passed!');
        
    } catch (error) {
        console.error('❌ Integration test failed:', error.message);
        if (error.code) {
            console.error('Error code:', error.code);
        }
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Connection closed');
    }
}

testIntegration();