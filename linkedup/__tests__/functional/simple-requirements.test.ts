import { POST as UsersPOST } from '@/app/api/users/route';
import { POST as LoginPOST } from '@/app/api/login/route';
import { POST as ActivityPOST, GET as ActivityGET } from '@/app/api/activity/route';
import { POST as JoinActivityPOST } from '@/app/api/join-activity/route';

// Simple tests without complex database setup
describe('Simple Requirements Tests', () => {
	// R1: Account Creation Tests
	describe('R1: Account Creation', () => {
		it('SUCCESS: User can signup and login successfully', async () => {
			const testUser = {
				email: `test.${Date.now()}@example.com`,
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
		}, 15000);

		it('FAILURE: Cannot create account with existing email', async () => {
			const testUser = {
				email: `duplicate.${Date.now()}@example.com`,
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
		}, 15000);

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
		}, 15000);
	});

	// R2: Activity Posting Tests
	describe('R2: Activity Posting', () => {
		it('SUCCESS: User can create activity', async () => {
			const testUser = {
				email: `activity.creator.${Date.now()}@example.com`,
				password: 'testpass123'
			};

			// Create user first
			const userReq = new Request('http://localhost/api/users', {
				method: 'POST',
				body: JSON.stringify(testUser)
			});
			await UsersPOST(userReq);

			const validActivity = {
				title: `Test Activity ${Date.now()}`,
				location: 'Test Location',
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
		}, 15000);

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
		}, 15000);
	});

	// R3: Activity Joining Tests
	describe('R3: Activity Joining', () => {
		it('SUCCESS: User can join activity', async () => {
			const creator = {
				email: `creator.${Date.now()}@example.com`,
				password: 'testpass123'
			};

			const joiner = {
				email: `joiner.${Date.now()}@example.com`,
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
					title: `Join Test Activity ${Date.now()}`,
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
		}, 20000);

		it('FAILURE: Cannot join activity twice', async () => {
			const creator = {
				email: `creator.double.${Date.now()}@example.com`,
				password: 'testpass123'
			};

			const joiner = {
				email: `joiner.double.${Date.now()}@example.com`,
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
					title: `Double Join Test ${Date.now()}`,
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
		}, 25000);
	});

	// R4: Activity Feeds Tests
	describe('R4: Activity Feeds', () => {
		it('SUCCESS: User can view activities', async () => {
			const response = await ActivityGET();
			const activities = await response.json();

			expect(response.status).toBe(200);
			expect(Array.isArray(activities)).toBe(true);
		}, 15000);
	});
});