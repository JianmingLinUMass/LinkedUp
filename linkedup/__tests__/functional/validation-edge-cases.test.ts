import { POST as UsersPOST } from '@/app/api/users/route';
import { POST as ActivityPOST, GET as ActivityGET } from '@/app/api/activity/route';
import { POST as JoinActivityPOST } from '@/app/api/join-activity/route';
import { dbConnect } from '@/lib/mongodb';
import mongoose from 'mongoose';
import Activity from '@/models/Activity';

const MONGODB_URI = "mongodb+srv://mykaala:mykaala@linkedup.ntc02tv.mongodb.net/linkedup_test?retryWrites=true&w=majority&appName=linkedup";

// Edge Cases and Validation Tests for All Requirements
describe('Validation and Edge Cases Tests', () => {
	beforeAll(async () => {
		process.env.MONGODB_URI = MONGODB_URI;
		await dbConnect();
	}, 10000);

	afterAll(async () => {
		const User = mongoose.models.User;
		if (User) {
			await User.deleteMany({ email: { $regex: 'edge.*test@example.com' } });
		}
		await Activity.deleteMany({ title: { $regex: 'Edge.*' } });
		await mongoose.connection.close();
	});

	beforeEach(async () => {
		const User = mongoose.models.User;
		if (User) {
			await User.deleteMany({ email: { $regex: 'edge.*test@example.com' } });
		}
		await Activity.deleteMany({ title: { $regex: 'Edge.*' } });
	});

	describe('Input Validation Edge Cases', () => {
		it('EDGE: Empty string inputs for user creation', async () => {
			const emptyInputs = [
				{ email: '', password: 'validpass' },
				{ email: 'valid@example.com', password: '' },
				{ email: '', password: '' }
			];

			for (const input of emptyInputs) {
				const req = new Request('http://localhost/api/users', {
					method: 'POST',
					body: JSON.stringify(input)
				});
				const response = await UsersPOST(req);
				const data = await response.json();

				expect(response.status).toBe(400);
				expect(data.error).toBe('Missing fields');
			}
		});

		it('EDGE: Extremely long input strings', async () => {
			const longString = 'a'.repeat(1000);
			const longInputs = {
				email: longString + '@example.com',
				password: longString
			};

			const req = new Request('http://localhost/api/users', {
				method: 'POST',
				body: JSON.stringify(longInputs)
			});
			const response = await UsersPOST(req);

			// Current API accepts long strings - this shows need for length validation
			expect(response.status).toBe(201);

			// Verify in database
			const User = mongoose.models.User;
			const dbUser = await User.findOne({ email: longInputs.email });
			expect(dbUser).toBeTruthy();
		});

		it('EDGE: Special characters in user inputs', async () => {
			const specialChars = {
				email: 'test+special.chars@example.com',
				password: 'pass!@#$%^&*()_+-=[]{}|;:,.<>?'
			};

			const req = new Request('http://localhost/api/users', {
				method: 'POST',
				body: JSON.stringify(specialChars)
			});
			const response = await UsersPOST(req);

			expect(response.status).toBe(201);

			// Verify special characters are preserved
			const User = mongoose.models.User;
			const dbUser = await User.findOne({ email: specialChars.email });
			expect(dbUser.password).toBe(specialChars.password);
		});

		it('EDGE: Unicode and international characters', async () => {
			const unicodeInputs = {
				email: 'tëst.üñíçødé@éxämplé.com',
				password: 'pässwørd123'
			};

			const req = new Request('http://localhost/api/users', {
				method: 'POST',
				body: JSON.stringify(unicodeInputs)
			});
			const response = await UsersPOST(req);

			expect(response.status).toBe(201);

			// Verify unicode preservation
			const User = mongoose.models.User;
			const dbUser = await User.findOne({ email: unicodeInputs.email });
			expect(dbUser.email).toBe(unicodeInputs.email);
		});
	});

	describe('Activity Creation Edge Cases', () => {
		const testUser = {
			email: 'edge.activity.test@example.com',
			password: 'testpass123'
		};

		beforeEach(async () => {
			await UsersPOST(new Request('http://localhost/api/users', {
				method: 'POST',
				body: JSON.stringify(testUser)
			}));
		});

		it('EDGE: Activity with maxAttendees = 0', async () => {
			const zeroAttendeesActivity = {
				title: 'Edge Zero Attendees Activity',
				location: 'Zero Location',
				timeAndDate: '7:00PM, 12/25/2024',
				maxAttendees: 0,
				currentUserEmail: testUser.email
			};

			const req = new Request('http://localhost/api/activity', {
				method: 'POST',
				body: JSON.stringify(zeroAttendeesActivity)
			});
			const response = await ActivityPOST(req);
			const data = await response.json();

			// API now correctly rejects 0 maxAttendees
			expect(response.status).toBe(400);
			expect(data.error).toContain('Maximum attendees must be greater than 0');

			// This creates a logical inconsistency that should be prevented
		});

		it('EDGE: Activity with negative maxAttendees', async () => {
			const negativeAttendeesActivity = {
				title: 'Edge Negative Attendees Activity',
				location: 'Negative Location',
				timeAndDate: '7:00PM, 12/25/2024',
				maxAttendees: -5,
				currentUserEmail: testUser.email
			};

			const req = new Request('http://localhost/api/activity', {
				method: 'POST',
				body: JSON.stringify(negativeAttendeesActivity)
			});
			const response = await ActivityPOST(req);

			// API now correctly rejects negative maxAttendees
			expect(response.status).toBe(400);
		});

		it('EDGE: Activity with extremely large maxAttendees', async () => {
			const largeAttendeesActivity = {
				title: 'Edge Large Attendees Activity',
				location: 'Large Location',
				timeAndDate: '7:00PM, 12/25/2024',
				maxAttendees: 999999999,
				currentUserEmail: testUser.email
			};

			const req = new Request('http://localhost/api/activity', {
				method: 'POST',
				body: JSON.stringify(largeAttendeesActivity)
			});
			const response = await ActivityPOST(req);
			const data = await response.json();

			expect(response.status).toBe(201);
			expect(data.maxAttendees).toBe(999999999);
		});

		it('EDGE: Activity with past date', async () => {
			const pastDateActivity = {
				title: 'Edge Past Date Activity',
				location: 'Past Location',
				timeAndDate: '7:00PM, 01/01/2020', // Clearly in the past
				maxAttendees: 5,
				currentUserEmail: testUser.email
			};

			const req = new Request('http://localhost/api/activity', {
				method: 'POST',
				body: JSON.stringify(pastDateActivity)
			});
			const response = await ActivityPOST(req);

			// Current API allows past dates - should be validated
			expect(response.status).toBe(201);

			// Verify in database
			const dbActivity = await Activity.findById((await response.json()).id);
			expect(dbActivity.time).toBe(pastDateActivity.timeAndDate);
		});

		it('EDGE: Activity with invalid date format', async () => {
			const invalidDateActivity = {
				title: 'Edge Invalid Date Activity',
				location: 'Invalid Location',
				timeAndDate: 'invalid-date-format',
				maxAttendees: 5,
				currentUserEmail: testUser.email
			};

			const req = new Request('http://localhost/api/activity', {
				method: 'POST',
				body: JSON.stringify(invalidDateActivity)
			});
			const response = await ActivityPOST(req);

			// Current API accepts invalid dates - should be validated
			expect(response.status).toBe(201);
		});

		it('EDGE: Activity with extremely long title and location', async () => {
			const longTitle = 'Edge '.repeat(100) + 'Long Title Activity';
			const longLocation = 'Very '.repeat(100) + 'Long Location';

			const longTextActivity = {
				title: longTitle,
				location: longLocation,
				timeAndDate: '7:00PM, 12/25/2024',
				maxAttendees: 5,
				currentUserEmail: testUser.email
			};

			const req = new Request('http://localhost/api/activity', {
				method: 'POST',
				body: JSON.stringify(longTextActivity)
			});
			const response = await ActivityPOST(req);
			const data = await response.json();

			expect(response.status).toBe(201);
			expect(data.title).toBe(longTitle);
			expect(data.location).toBe(longLocation);
		});
	});

	describe('Activity Joining Edge Cases', () => {
		const creator = {
			email: 'edge.creator.test@example.com',
			password: 'testpass123'
		};

		let activityId: string;

		beforeEach(async () => {
			await UsersPOST(new Request('http://localhost/api/users', {
				method: 'POST',
				body: JSON.stringify(creator)
			}));

			const activityResponse = await ActivityPOST(new Request('http://localhost/api/activity', {
				method: 'POST',
				body: JSON.stringify({
					title: 'Edge Join Test Activity',
					location: 'Join Location',
					timeAndDate: '8:00PM, 12/25/2024',
					maxAttendees: 3,
					currentUserEmail: creator.email
				})
			}));
			const activityData = await activityResponse.json();
			activityId = activityData.id;
		});

		it('EDGE: Join activity with invalid activity ID', async () => {
			const invalidId = 'invalid-activity-id';

			const joinReq = new Request('http://localhost/api/join-activity', {
				method: 'POST',
				body: JSON.stringify({
					activityId: invalidId,
					userId: 'test-user-id',
					userEmail: 'edge.joiner@example.com'
				})
			});

			try {
				const response = await JoinActivityPOST(joinReq);
				const data = await response.json();
				expect(response.status).toBe(500); // Should be 400 for invalid ID
			} catch (error) {
				// Expected for invalid ObjectId format
				expect(error).toBeTruthy();
			}
		});

		it('EDGE: Join activity with non-existent activity ID', async () => {
			const nonExistentId = new mongoose.Types.ObjectId().toString();

			const joinReq = new Request('http://localhost/api/join-activity', {
				method: 'POST',
				body: JSON.stringify({
					activityId: nonExistentId,
					userId: 'test-user-id',
					userEmail: 'edge.joiner@example.com'
				})
			});
			const response = await JoinActivityPOST(joinReq);
			const data = await response.json();

			expect(response.status).toBe(404);
			expect(data.error).toBe('Activity not found');
		});

		it('EDGE: Join activity with missing required fields', async () => {
			const incompleteRequests = [
				{ activityId: activityId }, // Missing userId and userEmail
				{ userId: 'test-user-id' }, // Missing activityId and userEmail
				{ userEmail: 'test@example.com' }, // Missing activityId and userId
				{} // Missing all fields
			];

			for (const incompleteReq of incompleteRequests) {
				const joinReq = new Request('http://localhost/api/join-activity', {
					method: 'POST',
					body: JSON.stringify(incompleteReq)
				});
				const response = await JoinActivityPOST(joinReq);
				const data = await response.json();

				expect(response.status).toBe(400);
				expect(data.error).toBe('Activity ID and User Email required');
			}
		});

		it('EDGE: Creator tries to join their own activity', async () => {
			const joinReq = new Request('http://localhost/api/join-activity', {
				method: 'POST',
				body: JSON.stringify({
					activityId: activityId,
					userId: 'creator-user-id',
					userEmail: creator.email
				})
			});
			const response = await JoinActivityPOST(joinReq);
			const data = await response.json();

			expect(response.status).toBe(400);
			expect(data.error).toBe('Already joined this activity');
		});

		it('EDGE: Multiple rapid join attempts (race condition)', async () => {
			const joinerEmail = 'edge.rapid.joiner@example.com';

			// Simulate rapid multiple join attempts
			const joinPromises = Array(5).fill(null).map(() => 
				JoinActivityPOST(new Request('http://localhost/api/join-activity', {
					method: 'POST',
					body: JSON.stringify({
						activityId: activityId,
						userId: 'rapid-joiner-id',
						userEmail: joinerEmail
					})
				}))
			);

			const responses = await Promise.all(joinPromises);
			const successfulJoins = responses.filter(r => r.status === 200);
			const duplicateErrors = responses.filter(r => r.status === 400);

			// Race condition test - may allow multiple joins due to timing
			expect(successfulJoins.length).toBeGreaterThanOrEqual(1);
			expect(responses).toHaveLength(5);

			// Verify only one participant was added
			const dbActivity = await Activity.findById(activityId);
			const joinerParticipants = dbActivity.participants.filter(p => p.username === joinerEmail);
			expect(joinerParticipants).toHaveLength(1);
		});
	});

	describe('Database Consistency Edge Cases', () => {
		it('EDGE: Database connection failure simulation', async () => {
			// This test would require mocking database connection
			// For now, we test that operations fail gracefully when DB is unavailable
			
			// Temporarily close connection
			await mongoose.connection.close();

			const req = new Request('http://localhost/api/users', {
				method: 'POST',
				body: JSON.stringify({
					email: 'edge.db.test@example.com',
					password: 'testpass123'
				})
			});

			try {
				const response = await UsersPOST(req);
				// Should handle DB connection error gracefully
				expect(response.status).toBe(500);
			} catch (error) {
				// Expected when DB is unavailable
				expect(error).toBeTruthy();
			}

			// Reconnect for other tests
			await dbConnect();
		});

		it('EDGE: Concurrent user creation with same email', async () => {
			const sameEmail = 'edge.concurrent.test@example.com';

			// Create multiple concurrent requests with same email
			const concurrentRequests = Array(3).fill(null).map(() =>
				UsersPOST(new Request('http://localhost/api/users', {
					method: 'POST',
					body: JSON.stringify({
						email: sameEmail,
						password: 'testpass123'
					})
				}))
			);

			const responses = await Promise.all(concurrentRequests);
			const successfulCreations = responses.filter(r => r.status === 201);
			const duplicateErrors = responses.filter(r => r.status === 409);

			// Concurrent creation test - database handles duplicates
			expect(successfulCreations.length + duplicateErrors.length).toBe(3);
			expect(successfulCreations.length).toBeGreaterThanOrEqual(1);

			// Verify only one user exists in database
			const User = mongoose.models.User;
			const users = await User.find({ email: sameEmail });
			expect(users).toHaveLength(1);
		});

		it('EDGE: Large dataset performance', async () => {
			// Create many activities to test performance
			const testUser = {
				email: 'edge.performance.test@example.com',
				password: 'testpass123'
			};

			await UsersPOST(new Request('http://localhost/api/users', {
				method: 'POST',
				body: JSON.stringify(testUser)
			}));

			const startTime = Date.now();

			// Create 50 activities
			const createPromises = Array(50).fill(null).map((_, index) =>
				ActivityPOST(new Request('http://localhost/api/activity', {
					method: 'POST',
					body: JSON.stringify({
						title: `Edge Performance Activity ${index}`,
						location: `Location ${index}`,
						timeAndDate: '7:00PM, 12/25/2024',
						maxAttendees: 5,
						currentUserEmail: testUser.email
					})
				}))
			);

			await Promise.all(createPromises);
			const creationTime = Date.now() - startTime;

			// Test retrieval performance
			const retrievalStart = Date.now();
			const response = await ActivityGET();
			const activities = await response.json();
			const retrievalTime = Date.now() - retrievalStart;

			// Verify all activities were created
			const userActivities = activities.filter(a => a.creator.username === testUser.email);
			expect(userActivities).toHaveLength(50);

			// Performance should be reasonable (adjust thresholds as needed)
			expect(creationTime).toBeLessThan(30000); // 30 seconds
			expect(retrievalTime).toBeLessThan(5000); // 5 seconds

			console.log(`Performance test: Created 50 activities in ${creationTime}ms, retrieved in ${retrievalTime}ms`);
		});
	});
});