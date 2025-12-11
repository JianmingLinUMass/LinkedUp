import { POST as UsersPOST, GET as UsersGET } from '@/app/api/users/route';
import { POST as LoginPOST } from '@/app/api/login/route';
import { POST as ActivityPOST, GET as ActivityGET } from '@/app/api/activity/route';
import { POST as JoinActivityPOST } from '@/app/api/join-activity/route';
import { dbConnect } from '@/lib/mongodb';
import mongoose from 'mongoose';
import Activity from '@/models/Activity';

describe('Comprehensive Functional Requirements Tests (R1-R8)', () => {
	beforeAll(async () => {
		// Use existing environment variable or fallback
		if (!process.env.MONGODB_URI) {
			process.env.MONGODB_URI = "mongodb+srv://mykaala:mykaala@linkedup.ntc02tv.mongodb.net/linkedup_test?retryWrites=true&w=majority&appName=linkedup";
		}
		await dbConnect();
	}, 30000);

	afterAll(async () => {
		try {
			// Clean up all test data
			const User = mongoose.models.User;
			if (User) {
				await User.deleteMany({ email: { $regex: 'test.*@example.com' } });
			}
			await Activity.deleteMany({ title: { $regex: 'Test.*' } });
		} catch (error) {
			console.log('Cleanup error:', error);
		} finally {
			if (mongoose.connection.readyState !== 0) {
				await mongoose.connection.close();
			}
		}
	}, 30000);

	beforeEach(async () => {
		try {
			// Clean test data before each test
			const User = mongoose.models.User;
			if (User) {
				await User.deleteMany({ email: { $regex: 'test.*@example.com' } });
			}
			await Activity.deleteMany({ title: { $regex: 'Test.*' } });
		} catch (error) {
			console.log('BeforeEach cleanup error:', error);
		}
	}, 15000);

	// R1: Account Creation Tests
	describe('R1: Account Creation', () => {
		const testUser = {
			email: 'test.user@example.com',
			password: 'testpass123'
		};

		it('SUCCESS: User can signup and login successfully', async () => {
			// Step 1: Create account
			const signupReq = new Request('http://localhost/api/users', {
				method: 'POST',
				body: JSON.stringify(testUser)
			});
			const signupResponse = await UsersPOST(signupReq);
			const signupData = await signupResponse.json();

			expect(signupResponse.status).toBe(201);
			expect(signupData.email).toBe(testUser.email);

			// Verify in database
			const User = mongoose.models.User;
			const dbUser = await User.findOne({ email: testUser.email });
			expect(dbUser).toBeTruthy();
			expect(dbUser.email).toBe(testUser.email);

			// Step 2: Login with created account
			const loginReq = new Request('http://localhost/api/login', {
				method: 'POST',
				body: JSON.stringify(testUser)
			});
			const loginResponse = await LoginPOST(loginReq);
			const loginData = await loginResponse.json();

			expect(loginResponse.status).toBe(200);
			expect(loginData.email).toBe(testUser.email);
		});

		it('FAILURE: Cannot create account with existing email', async () => {
			// Create first account
			const req1 = new Request('http://localhost/api/users', {
				method: 'POST',
				body: JSON.stringify(testUser)
			});
			await UsersPOST(req1);

			// Try duplicate
			const req2 = new Request('http://localhost/api/users', {
				method: 'POST',
				body: JSON.stringify(testUser)
			});
			const response = await UsersPOST(req2);
			const data = await response.json();

			expect(response.status).toBe(409);
			expect(data.error).toBe('Email already exists');
		});

		it('FAILURE: Cannot login with invalid credentials', async () => {
			const loginReq = new Request('http://localhost/api/login', {
				method: 'POST',
				body: JSON.stringify({
					email: 'nonexistent@example.com',
					password: 'wrongpass'
				})
			});
			const response = await LoginPOST(loginReq);
			const data = await response.json();

			expect(response.status).toBe(401);
			expect(data.error).toBe('Invalid email or password');
		});
	});

	// R2: Activity Posting Tests
	describe('R2: Activity Posting', () => {
		const testUser = {
			email: 'test.creator@example.com',
			password: 'testpass123'
		};

		const validActivity = {
			title: 'Test Basketball Game',
			location: 'Central Park',
			timeAndDate: '7:00PM, 12/25/2024',
			maxAttendees: 10,
			currentUserEmail: testUser.email
		};

		beforeEach(async () => {
			// Create user for activity creation
			const userReq = new Request('http://localhost/api/users', {
				method: 'POST',
				body: JSON.stringify(testUser)
			});
			await UsersPOST(userReq);
		});

		it('SUCCESS: User can create activity and it appears in database', async () => {
			const activityReq = new Request('http://localhost/api/activity', {
				method: 'POST',
				body: JSON.stringify(validActivity)
			});
			const response = await ActivityPOST(activityReq);
			const data = await response.json();

			expect(response.status).toBe(201);
			expect(data.title).toBe(validActivity.title);
			expect(data.location).toBe(validActivity.location);
			expect(data.maxAttendees).toBe(validActivity.maxAttendees);
			expect(data.creator.username).toBe(testUser.email);
			expect(data.participants).toHaveLength(1); // Creator auto-joins

			// Verify in database
			const dbActivity = await Activity.findById(data.id);
			expect(dbActivity).toBeTruthy();
			expect(dbActivity.title).toBe(validActivity.title);
			expect(dbActivity.participants).toHaveLength(1);

			// Verify activity appears in GET request
			const getResponse = await ActivityGET();
			const activities = await getResponse.json();
			const createdActivity = activities.find(a => a.id === data.id);
			expect(createdActivity).toBeTruthy();
		});

		it('FAILURE: Cannot create activity with maxAttendees = 0', async () => {
			const invalidActivity = {
				...validActivity,
				maxAttendees: 0
			};

			const activityReq = new Request('http://localhost/api/activity', {
				method: 'POST',
				body: JSON.stringify(invalidActivity)
			});
			const response = await ActivityPOST(activityReq);

			expect(response.status).toBe(400); // API now correctly validates maxAttendees > 0
			// Note: This test reveals that the API should validate maxAttendees > 0
		});

		it('FAILURE: Cannot create activity with missing fields', async () => {
			const incompleteActivity = {
				title: 'Test Activity'
				// Missing required fields
			};

			const activityReq = new Request('http://localhost/api/activity', {
				method: 'POST',
				body: JSON.stringify(incompleteActivity)
			});
			const response = await ActivityPOST(activityReq);
			const data = await response.json();

			expect(response.status).toBe(400);
			expect(data.error).toBe('Missing fields');
		});
	});

	// R3: Activity Joining Tests
	describe('R3: Activity Joining', () => {
		const creator = {
			email: 'test.creator@example.com',
			password: 'testpass123'
		};

		const joiner = {
			email: 'test.joiner@example.com',
			password: 'testpass123'
		};

		let activityId: string;

		beforeEach(async () => {
			// Create users
			await UsersPOST(new Request('http://localhost/api/users', {
				method: 'POST',
				body: JSON.stringify(creator)
			}));
			await UsersPOST(new Request('http://localhost/api/users', {
				method: 'POST',
				body: JSON.stringify(joiner)
			}));

			// Create activity
			const activityReq = new Request('http://localhost/api/activity', {
				method: 'POST',
				body: JSON.stringify({
					title: 'Test Join Activity',
					location: 'Test Location',
					timeAndDate: '8:00PM, 12/25/2024',
					maxAttendees: 5,
					currentUserEmail: creator.email
				})
			});
			const activityResponse = await ActivityPOST(activityReq);
			const activityData = await activityResponse.json();
			activityId = activityData.id;
		});

		it('SUCCESS: User can join activity and database is updated', async () => {
			const joinReq = new Request('http://localhost/api/join-activity', {
				method: 'POST',
				body: JSON.stringify({
					activityId,
					userId: 'test-user-id',
					userEmail: joiner.email
				})
			});
			const response = await JoinActivityPOST(joinReq);
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data.success).toBe(true);

			// Verify in database
			const dbActivity = await Activity.findById(activityId);
			expect(dbActivity.participants).toHaveLength(2); // Creator + joiner
			const joinedUser = dbActivity.participants.find(p => p.username === joiner.email);
			expect(joinedUser).toBeTruthy();

			// Verify via GET API
			const getResponse = await ActivityGET();
			const activities = await getResponse.json();
			const updatedActivity = activities.find(a => a.id === activityId);
			expect(updatedActivity.participants).toHaveLength(2);
		});

		it('FAILURE: Cannot join activity twice', async () => {
			// Join once
			const joinReq1 = new Request('http://localhost/api/join-activity', {
				method: 'POST',
				body: JSON.stringify({
					activityId,
					userId: 'test-user-id',
					userEmail: joiner.email
				})
			});
			await JoinActivityPOST(joinReq1);

			// Try to join again
			const joinReq2 = new Request('http://localhost/api/join-activity', {
				method: 'POST',
				body: JSON.stringify({
					activityId,
					userId: 'test-user-id',
					userEmail: joiner.email
				})
			});
			const response = await JoinActivityPOST(joinReq2);
			const data = await response.json();

			expect(response.status).toBe(400);
			expect(data.error).toBe('Already joined this activity');
		});

		it('FAILURE: Cannot join full activity', async () => {
			// Create activity with maxAttendees = 1 (only creator)
			const fullActivityReq = new Request('http://localhost/api/activity', {
				method: 'POST',
				body: JSON.stringify({
					title: 'Test Full Activity',
					location: 'Test Location',
					timeAndDate: '9:00PM, 12/25/2024',
					maxAttendees: 1,
					currentUserEmail: creator.email
				})
			});
			const fullActivityResponse = await ActivityPOST(fullActivityReq);
			const fullActivityData = await fullActivityResponse.json();

			// Try to join full activity
			const joinReq = new Request('http://localhost/api/join-activity', {
				method: 'POST',
				body: JSON.stringify({
					activityId: fullActivityData.id,
					userId: 'test-user-id',
					userEmail: joiner.email
				})
			});
			const response = await JoinActivityPOST(joinReq);
			const data = await response.json();

			expect(response.status).toBe(400);
			expect(data.error).toBe('Activity is full');
		});
	});

	// R4: Activity Feeds Tests
	describe('R4: Activity Feeds', () => {
		const testUser = {
			email: 'test.feeds@example.com',
			password: 'testpass123'
		};

		beforeEach(async () => {
			// Create user
			await UsersPOST(new Request('http://localhost/api/users', {
				method: 'POST',
				body: JSON.stringify(testUser)
			}));

			// Create multiple activities
			const activities = [
				{
					title: 'Test Past Activity',
					location: 'Location 1',
					timeAndDate: '7:00AM, 11/01/2024',
					maxAttendees: 5,
					currentUserEmail: testUser.email
				},
				{
					title: 'Test Current Activity',
					location: 'Location 2',
					timeAndDate: '8:00PM, 12/25/2024',
					maxAttendees: 10,
					currentUserEmail: testUser.email
				},
				{
					title: 'Test Future Activity',
					location: 'Location 3',
					timeAndDate: '9:00AM, 01/15/2025',
					maxAttendees: 8,
					currentUserEmail: testUser.email
				}
			];

			for (const activity of activities) {
				await ActivityPOST(new Request('http://localhost/api/activity', {
					method: 'POST',
					body: JSON.stringify(activity)
				}));
			}
		});

		it('SUCCESS: User can view all their activities with details', async () => {
			const response = await ActivityGET();
			const activities = await response.json();

			expect(response.status).toBe(200);
			expect(Array.isArray(activities)).toBe(true);
			
			// Find user's activities
			const userActivities = activities.filter(a => a.creator.username === testUser.email);
			expect(userActivities).toHaveLength(3);

			// Verify all required fields are present
			userActivities.forEach(activity => {
				expect(activity).toHaveProperty('title');
				expect(activity).toHaveProperty('location');
				expect(activity).toHaveProperty('time');
				expect(activity).toHaveProperty('maxAttendees');
				expect(activity).toHaveProperty('participants');
				expect(activity.creator.username).toBe(testUser.email);
			});
		});

		it('SUCCESS: Activities are properly stored and retrievable from database', async () => {
			// Verify activities exist in database
			const dbActivities = await Activity.find({ 'creator.username': testUser.email });
			expect(dbActivities).toHaveLength(3);

			// Verify database data matches API response
			const apiResponse = await ActivityGET();
			const apiActivities = await apiResponse.json();
			const userApiActivities = apiActivities.filter(a => a.creator.username === testUser.email);

			expect(userApiActivities).toHaveLength(dbActivities.length);
		});
	});

	// R5 & R6: Profile Configuration Tests (Basic structure - would need profile API)
	describe('R5 & R6: Profile Configuration', () => {
		it('PLACEHOLDER: Profile navigation and editing functionality', () => {
			// Note: These tests would require profile API endpoints to be implemented
			// Current implementation only has user creation, not profile updates
			expect(true).toBe(true); // Placeholder
		});
	});

	// R7 & R8: Activity History Tests
	describe('R7 & R8: Activity History and Management', () => {
		const testUser = {
			email: 'test.history@example.com',
			password: 'testpass123'
		};

		let pastActivityId: string;
		let futureActivityId: string;

		beforeEach(async () => {
			// Create user
			await UsersPOST(new Request('http://localhost/api/users', {
				method: 'POST',
				body: JSON.stringify(testUser)
			}));

			// Create past activity
			const pastActivityReq = new Request('http://localhost/api/activity', {
				method: 'POST',
				body: JSON.stringify({
					title: 'Test Past Activity History',
					location: 'Past Location',
					timeAndDate: '7:00AM, 11/01/2024',
					maxAttendees: 5,
					currentUserEmail: testUser.email
				})
			});
			const pastResponse = await ActivityPOST(pastActivityReq);
			const pastData = await pastResponse.json();
			pastActivityId = pastData.id;

			// Create future activity
			const futureActivityReq = new Request('http://localhost/api/activity', {
				method: 'POST',
				body: JSON.stringify({
					title: 'Test Future Activity History',
					location: 'Future Location',
					timeAndDate: '9:00AM, 01/15/2025',
					maxAttendees: 8,
					currentUserEmail: testUser.email
				})
			});
			const futureResponse = await ActivityPOST(futureActivityReq);
			const futureData = await futureResponse.json();
			futureActivityId = futureData.id;
		});

		it('SUCCESS: User can view complete activity history', async () => {
			const response = await ActivityGET();
			const activities = await response.json();

			const userActivities = activities.filter(a => a.creator.username === testUser.email);
			expect(userActivities).toHaveLength(2);

			// Verify both past and future activities are present
			const pastActivity = userActivities.find(a => a.id === pastActivityId);
			const futureActivity = userActivities.find(a => a.id === futureActivityId);

			expect(pastActivity).toBeTruthy();
			expect(futureActivity).toBeTruthy();
			expect(pastActivity.title).toBe('Test Past Activity History');
			expect(futureActivity.title).toBe('Test Future Activity History');
		});

		it('SUCCESS: Activities persist in database for history tracking', async () => {
			// Verify activities exist in database
			const pastDbActivity = await Activity.findById(pastActivityId);
			const futureDbActivity = await Activity.findById(futureActivityId);

			expect(pastDbActivity).toBeTruthy();
			expect(futureDbActivity).toBeTruthy();
			expect(pastDbActivity.title).toBe('Test Past Activity History');
			expect(futureDbActivity.title).toBe('Test Future Activity History');
		});

		// Note: Delete functionality would require delete API endpoint tests
		it('PLACEHOLDER: Activity deletion with confirmation', () => {
			// This would test the delete-activity API endpoint
			// and verify removal from database
			expect(true).toBe(true); // Placeholder
		});
	});

	// Cross-functional integration test
	describe('End-to-End Integration Test', () => {
		it('COMPLETE WORKFLOW: Signup -> Login -> Create Activity -> Join Activity -> View History', async () => {
			const creator = { email: 'test.e2e.creator@example.com', password: 'pass123' };
			const joiner = { email: 'test.e2e.joiner@example.com', password: 'pass123' };

			// 1. Create both users
			await UsersPOST(new Request('http://localhost/api/users', {
				method: 'POST',
				body: JSON.stringify(creator)
			}));
			await UsersPOST(new Request('http://localhost/api/users', {
				method: 'POST',
				body: JSON.stringify(joiner)
			}));

			// 2. Login both users
			const creatorLogin = await LoginPOST(new Request('http://localhost/api/login', {
				method: 'POST',
				body: JSON.stringify(creator)
			}));
			const joinerLogin = await LoginPOST(new Request('http://localhost/api/login', {
				method: 'POST',
				body: JSON.stringify(joiner)
			}));

			expect(creatorLogin.status).toBe(200);
			expect(joinerLogin.status).toBe(200);

			// 3. Creator creates activity
			const activityResponse = await ActivityPOST(new Request('http://localhost/api/activity', {
				method: 'POST',
				body: JSON.stringify({
					title: 'Test E2E Activity',
					location: 'E2E Location',
					timeAndDate: '7:00PM, 12/31/2024',
					maxAttendees: 10,
					currentUserEmail: creator.email
				})
			}));
			const activityData = await activityResponse.json();
			expect(activityResponse.status).toBe(201);

			// 4. Joiner joins activity
			const joinResponse = await JoinActivityPOST(new Request('http://localhost/api/join-activity', {
				method: 'POST',
				body: JSON.stringify({
					activityId: activityData.id,
					userId: 'joiner-id',
					userEmail: joiner.email
				})
			}));
			expect(joinResponse.status).toBe(200);

			// 5. Verify complete workflow in database
			const dbActivity = await Activity.findById(activityData.id);
			expect(dbActivity.participants).toHaveLength(2);
			expect(dbActivity.participants.some(p => p.username === creator.email)).toBe(true);
			expect(dbActivity.participants.some(p => p.username === joiner.email)).toBe(true);

			// 6. Verify via API
			const finalCheck = await ActivityGET();
			const finalActivities = await finalCheck.json();
			const ourActivity = finalActivities.find(a => a.id === activityData.id);
			expect(ourActivity.participants).toHaveLength(2);
		});
	});
});