import { POST, GET } from '@/app/api/users/route';
import { dbConnect } from '@/lib/mongodb';
import mongoose from 'mongoose';

// Test constants
const TEST_EMAIL = 'integration@test.com';
const TEST_PASSWORD = 'testpass123';

describe('Users API Integration Tests', () => {
	beforeAll(async () => {
		// Use test database
		process.env.MONGODB_URI = 'mongodb://localhost:27017/linkedup_test';
		await dbConnect();
	});

	afterAll(async () => {
		// Clean up test database
		await mongoose.connection.db.dropDatabase();
		await mongoose.connection.close();
	});

	beforeEach(async () => {
		// Clear users collection before each test
		const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
			email: String,
			password: String
		}));
		await User.deleteMany({});
	});

	describe('POST /api/users', () => {
		it('should create a real user in database', async () => {
			const req = new Request('http://localhost/api/users', {
				method: 'POST',
				body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD })
			});

			const response = await POST(req);
			const data = await response.json();

			expect(response.status).toBe(201);
			expect(data).toHaveProperty('id');
			expect(data.email).toBe(TEST_EMAIL);

			// Verify user exists in database
			const User = mongoose.models.User;
			const savedUser = await User.findOne({ email: TEST_EMAIL });
			expect(savedUser).toBeTruthy();
			expect(savedUser.email).toBe(TEST_EMAIL);
		});

		it('should prevent duplicate emails', async () => {
			// Create first user
			const req1 = new Request('http://localhost/api/users', {
				method: 'POST',
				body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD })
			});
			await POST(req1);

			// Try to create duplicate
			const req2 = new Request('http://localhost/api/users', {
				method: 'POST',
				body: JSON.stringify({ email: TEST_EMAIL, password: 'different' })
			});
			const response = await POST(req2);
			const data = await response.json();

			expect(response.status).toBe(409);
			expect(data.error).toBe('Email already exists');
		});
	});

	describe('GET /api/users', () => {
		it('should return real users from database', async () => {
			// Create test users
			const User = mongoose.models.User;
			await User.create({ email: 'user1@test.com', password: 'pass1' });
			await User.create({ email: 'user2@test.com', password: 'pass2' });

			const response = await GET();
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data).toHaveLength(2);
			expect(data[0]).toHaveProperty('email');
			expect(data[0]).not.toHaveProperty('password');
		});
	});
});