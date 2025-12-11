import { POST, GET } from '@/app/api/users/route';
import { dbConnect, dbDisconnect } from '@/lib/mongodb';
import mongoose from 'mongoose';

describe('Database Integration Tests', () => {
	beforeAll(async () => {
		// Ensure we're using the test database
		if (!process.env.MONGODB_URI) {
			process.env.MONGODB_URI = "mongodb+srv://mykaala:mykaala@linkedup.ntc02tv.mongodb.net/linkedup_test?retryWrites=true&w=majority&appName=linkedup";
		}
		await dbConnect();
	}, 15000);

	afterAll(async () => {
		try {
			// Clean up test data
			const User = mongoose.models.User;
			if (User) {
				await User.deleteMany({ email: { $regex: 'integration.*test' } });
			}
		} catch (error) {
			console.warn('Cleanup error:', error);
		} finally {
			await dbDisconnect();
		}
	}, 10000);

	beforeEach(async () => {
		// Clean test users before each test
		const User = mongoose.models.User;
		if (User) {
			await User.deleteMany({ email: { $regex: 'integration.*test' } });
		}
	});

	it('should POST data to database and GET it back with matching results', async () => {
		const testEmail = 'integration.test@example.com';
		const testPassword = 'testpass123';

		// 1. POST: Create user in database
		const postReq = new Request('http://localhost/api/users', {
			method: 'POST',
			body: JSON.stringify({ email: testEmail, password: testPassword })
		});

		const postResponse = await POST(postReq);
		const postData = await postResponse.json();

		// Verify POST worked
		expect(postResponse.status).toBe(201);
		expect(postData.email).toBe(testEmail);
		expect(postData).toHaveProperty('id');

		// 2. GET: Read all users from database
		const getResponse = await GET();
		const getData = await getResponse.json();

		// 3. Verify the data matches
		expect(getResponse.status).toBe(200);
		expect(Array.isArray(getData)).toBe(true);
		
		// Find our test user in the results
		const ourUser = getData.find(user => user.email === testEmail);
		expect(ourUser).toBeTruthy();
		expect(ourUser.email).toBe(testEmail);
		expect(ourUser._id).toBe(postData.id);
		expect(ourUser).not.toHaveProperty('password'); // Should be excluded

		// 4. Verify it's actually in the database
		const User = mongoose.models.User;
		const dbUser = await User.findOne({ email: testEmail });
		expect(dbUser).toBeTruthy();
		expect(dbUser.email).toBe(testEmail);
		expect(dbUser.password).toBe(testPassword); // Raw DB should have password
	});

	it('should handle duplicate emails correctly in real database', async () => {
		const testEmail = 'integration.duplicate@example.com';

		// Create first user
		const req1 = new Request('http://localhost/api/users', {
			method: 'POST',
			body: JSON.stringify({ email: testEmail, password: 'pass1' })
		});
		const response1 = await POST(req1);
		expect(response1.status).toBe(201);

		// Try to create duplicate
		const req2 = new Request('http://localhost/api/users', {
			method: 'POST',
			body: JSON.stringify({ email: testEmail, password: 'pass2' })
		});
		const response2 = await POST(req2);
		const data2 = await response2.json();

		// Should reject duplicate
		expect(response2.status).toBe(409);
		expect(data2.error).toBe('Email already exists');

		// Verify only one user exists in database
		const User = mongoose.models.User;
		const users = await User.find({ email: testEmail });
		expect(users).toHaveLength(1);
		expect(users[0].password).toBe('pass1'); // First password should remain
	});
});