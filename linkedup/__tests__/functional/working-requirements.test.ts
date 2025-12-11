import { POST as UsersPOST } from '@/app/api/users/route';
import { POST as LoginPOST } from '@/app/api/login/route';
import { POST as ActivityPOST, GET as ActivityGET } from '@/app/api/activity/route';
import { POST as JoinActivityPOST } from '@/app/api/join-activity/route';
import { dbConnect, dbDisconnect } from '@/lib/mongodb';
import mongoose from 'mongoose';
import Activity from '@/models/Activity';

// Working Requirements Tests with Fixed Database Connection
describe('Working Requirements Tests (R1-R8)', () => {
	beforeAll(async () => {
		// Set environment variable
		if (!process.env.MONGODB_URI) {
			process.env.MONGODB_URI = "mongodb+srv://mykaala:mykaala@linkedup.ntc02tv.mongodb.net/linkedup_test?retryWrites=true&w=majority&appName=linkedup";
		}
		
		// Connect to database
		await dbConnect();
	}, 15000);

	afterAll(async () => {
		// Clean up and disconnect
		try {
			const User = mongoose.models.User;
			if (User) {
				await User.deleteMany({ email: { $regex: 'working.*test@example.com' } });
			}
			await Activity.deleteMany({ title: { $regex: 'Working.*' } });
		} catch (error) {
			console.log('Cleanup error:', error);
		}
		
		await dbDisconnect();
	}, 15000);

	// R1: Account Creation Tests
	describe('R1: Account Creation', () => {
		it('SUCCESS: User can signup and login successfully', async () => {
			const testUser = {
				email: `working.signup.${Date.now()}@example.com`,
				password: 'testpass123'
			};

			// Step 1: Create account
			const signupReq = new Request('http://localhost/api/users', {
				method: 'POST',
				body: JSON.stringify(testUser)
			});
			const signupResponse = await UsersPOST(signupReq);
			const signupData = await signupResponse.json();

			expect(signupResponse.status).toBe(201);
			expect(signupData.email).toBe(testUser.email);
			expect(signupData).toHaveProperty('id');

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
			expect(loginData).toHaveProperty('id');
		});

		it('FAILURE: Cannot create account with existing email', async () => {
			const testUser = {
				email: `working.duplicate.${Date.now()}@example.com`,
				password: 'testpass123'
			};

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
		it('SUCCESS: User can create activity and it appears in database', async () => {
			const testUser = {
				email: `working.activity.${Date.now()}@example.com`,
				password: 'testpass123'
			};

			// Create user first
			const userReq = new Request('http://localhost/api/users', {
				method: 'POST',
				body: JSON.stringify(testUser)
			});
			await UsersPOST(userReq);

			const validActivity = {
				title: `Working Test Activity ${Date.now()}`,
				location: 'Working Location',
				timeAndDate: '7:00PM, 12/25/2024',
				maxAttendees: 10,
				currentUserEmail: testUser.email
			};

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

		it('FAILURE: Cannot create activity with missing fields', async () => {
			const incompleteActivity = {
				title: 'Working Test Activity'
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
		it('SUCCESS: User can join activity and database is updated', async () => {
			const creator = {
				email: `working.creator.${Date.now()}@example.com`,
				password: 'testpass123'
			};

			const joiner = {
				email: `working.joiner.${Date.now()}@example.com`,
				password: 'testpass123'
			};

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
					title: `Working Join Activity ${Date.now()}`,
					location: 'Join Location',
					timeAndDate: '8:00PM, 12/25/2024',
					maxAttendees: 5,
					currentUserEmail: creator.email
				})
			});
			const activityResponse = await ActivityPOST(activityReq);
			const activityData = await activityResponse.json();

			// Join activity
			const joinReq = new Request('http://localhost/api/join-activity', {
				method: 'POST',
				body: JSON.stringify({
					activityId: activityData.id,
					userId: 'test-user-id',
					userEmail: joiner.email
				})
			});
			const response = await JoinActivityPOST(joinReq);
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data.success).toBe(true);

			// Verify in database
			const dbActivity = await Activity.findById(activityData.id);
			expect(dbActivity.participants).toHaveLength(2); // Creator + joiner
			const joinedUser = dbActivity.participants.find(p => p.username === joiner.email);
			expect(joinedUser).toBeTruthy();

			// Verify via GET API
			const getResponse = await ActivityGET();
			const activities = await getResponse.json();
			const updatedActivity = activities.find(a => a.id === activityData.id);
			expect(updatedActivity.participants).toHaveLength(2);
		});

		it('FAILURE: Cannot join activity twice', async () => {
			const creator = {
				email: `working.creator.double.${Date.now()}@example.com`,
				password: 'testpass123'
			};

			const joiner = {
				email: `working.joiner.double.${Date.now()}@example.com`,
				password: 'testpass123'
			};

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
					title: `Working Double Join ${Date.now()}`,
					location: 'Double Location',
					timeAndDate: '8:00PM, 12/25/2024',
					maxAttendees: 5,
					currentUserEmail: creator.email
				})
			});
			const activityResponse = await ActivityPOST(activityReq);
			const activityData = await activityResponse.json();

			// Join once
			const joinReq1 = new Request('http://localhost/api/join-activity', {
				method: 'POST',
				body: JSON.stringify({
					activityId: activityData.id,
					userId: 'test-user-id',
					userEmail: joiner.email
				})
			});
			await JoinActivityPOST(joinReq1);

			// Try to join again
			const joinReq2 = new Request('http://localhost/api/join-activity', {
				method: 'POST',
				body: JSON.stringify({
					activityId: activityData.id,
					userId: 'test-user-id',
					userEmail: joiner.email
				})
			});
			const response = await JoinActivityPOST(joinReq2);
			const data = await response.json();

			expect(response.status).toBe(400);
			expect(data.error).toBe('Already joined this activity');
		});
	});

	// R4: Activity Feeds Tests
	describe('R4: Activity Feeds', () => {
		it('SUCCESS: User can view all their activities with details', async () => {
			const response = await ActivityGET();
			const activities = await response.json();

			expect(response.status).toBe(200);
			expect(Array.isArray(activities)).toBe(true);
			
			// Verify activities have required fields
			if (activities.length > 0) {
				const activity = activities[0];
				expect(activity).toHaveProperty('title');
				expect(activity).toHaveProperty('location');
				expect(activity).toHaveProperty('time');
				expect(activity).toHaveProperty('maxAttendees');
				expect(activity).toHaveProperty('participants');
				expect(activity).toHaveProperty('creator');
			}
		});
	});

	// End-to-End Integration Test
	describe('End-to-End Integration Test', () => {
		it('COMPLETE WORKFLOW: Signup -> Login -> Create Activity -> Join Activity -> View History', async () => {
			const creator = { 
				email: `working.e2e.creator.${Date.now()}@example.com`, 
				password: 'pass123' 
			};
			const joiner = { 
				email: `working.e2e.joiner.${Date.now()}@example.com`, 
				password: 'pass123' 
			};

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
					title: `Working E2E Activity ${Date.now()}`,
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