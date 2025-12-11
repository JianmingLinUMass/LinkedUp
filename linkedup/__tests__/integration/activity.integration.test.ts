import { POST, GET } from '@/app/api/activity/route';
import { dbConnect } from '@/lib/mongodb';
import mongoose from 'mongoose';

// Test constants
const TEST_ACTIVITY = {
	title: 'Integration Test Activity',
	location: 'Test Location',
	timeAndDate: '10:00AM, 12/15/2024',
	maxAttendees: 5,
	currentUserEmail: 'test@example.com'
};

describe('Activity API Integration Tests', () => {
	beforeAll(async () => {
		process.env.MONGODB_URI = 'mongodb://localhost:27017/linkedup_test';
		await dbConnect();
	});

	afterAll(async () => {
		await mongoose.connection.db.dropDatabase();
		await mongoose.connection.close();
	});

	beforeEach(async () => {
		// Clear activities collection
		const Activity = mongoose.models.Activity || mongoose.model('Activity', new mongoose.Schema({
			title: String,
			location: String,
			time: String,
			maxAttendees: Number,
			creator: Object,
			participants: Array
		}));
		await Activity.deleteMany({});
	});

	describe('POST /api/activity', () => {
		it('should create a real activity in database', async () => {
			const req = new Request('http://localhost/api/activity', {
				method: 'POST',
				body: JSON.stringify(TEST_ACTIVITY)
			});

			const response = await POST(req);
			const data = await response.json();

			expect(response.status).toBe(201);
			expect(data).toHaveProperty('id');
			expect(data.title).toBe(TEST_ACTIVITY.title);

			// Verify activity exists in database
			const Activity = mongoose.models.Activity;
			const savedActivity = await Activity.findOne({ title: TEST_ACTIVITY.title });
			expect(savedActivity).toBeTruthy();
			expect(savedActivity.location).toBe(TEST_ACTIVITY.location);
		});
	});

	describe('GET /api/activity', () => {
		it('should return real activities from database', async () => {
			// Create test activities
			const Activity = mongoose.models.Activity;
			await Activity.create({
				title: 'Activity 1',
				location: 'Location 1',
				time: '9:00AM, 12/15/2024',
				maxAttendees: 3,
				creator: { username: 'user1', avatar: '/avatar.jpg' },
				participants: []
			});

			const response = await GET();
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data).toHaveLength(1);
			expect(data[0]).toHaveProperty('title', 'Activity 1');
		});
	});
});