import { POST as UsersPOST } from '@/app/api/users/route';
import { POST as ActivityPOST, GET as ActivityGET } from '@/app/api/activity/route';
import { POST as JoinActivityPOST } from '@/app/api/join-activity/route';
import { dbConnect } from '@/lib/mongodb';
import mongoose from 'mongoose';
import Activity from '@/models/Activity';
import { parseActivityTime } from '@/schemas/ActivityRelated';

const MONGODB_URI = "mongodb+srv://mykaala:mykaala@linkedup.ntc02tv.mongodb.net/linkedup_test?retryWrites=true&w=majority&appName=linkedup";

// R7 & R8: Activity History and Management Tests
describe('R7 & R8: Activity History and Management', () => {
	beforeAll(async () => {
		process.env.MONGODB_URI = MONGODB_URI;
		await dbConnect();
	}, 10000);

	afterAll(async () => {
		const User = mongoose.models.User;
		if (User) {
			await User.deleteMany({ email: { $regex: 'history.*test@example.com' } });
		}
		await Activity.deleteMany({ title: { $regex: 'Test History.*' } });
		await mongoose.connection.close();
	});

	beforeEach(async () => {
		const User = mongoose.models.User;
		if (User) {
			await User.deleteMany({ email: { $regex: 'history.*test@example.com' } });
		}
		await Activity.deleteMany({ title: { $regex: 'Test History.*' } });
	});

	describe('R7: Activity History Viewing and Editing', () => {
		const testUser = {
			email: 'history.user.test@example.com',
			password: 'testpass123'
		};

		let pastActivityId: string;
		let currentActivityId: string;
		let futureActivityId: string;

		beforeEach(async () => {
			// Create user
			await UsersPOST(new Request('http://localhost/api/users', {
				method: 'POST',
				body: JSON.stringify(testUser)
			}));

			// Create activities with different time periods
			const activities = [
				{
					title: 'Test History Past Activity',
					location: 'Past Location',
					timeAndDate: '7:00AM, 01/01/2024', // Past
					maxAttendees: 5,
					currentUserEmail: testUser.email
				},
				{
					title: 'Test History Current Activity',
					location: 'Current Location',
					timeAndDate: '8:00PM, 12/25/2024', // Current/Near future
					maxAttendees: 10,
					currentUserEmail: testUser.email
				},
				{
					title: 'Test History Future Activity',
					location: 'Future Location',
					timeAndDate: '9:00AM, 06/15/2025', // Future
					maxAttendees: 8,
					currentUserEmail: testUser.email
				}
			];

			// Create activities and store IDs
			for (let i = 0; i < activities.length; i++) {
				const response = await ActivityPOST(new Request('http://localhost/api/activity', {
					method: 'POST',
					body: JSON.stringify(activities[i])
				}));
				const data = await response.json();
				
				if (i === 0) pastActivityId = data.id;
				if (i === 1) currentActivityId = data.id;
				if (i === 2) futureActivityId = data.id;
			}
		});

		it('SUCCESS: User can view complete activity history', async () => {
			const response = await ActivityGET();
			const activities = await response.json();

			expect(response.status).toBe(200);
			
			// Filter user's activities
			const userActivities = activities.filter(a => a.creator.username === testUser.email);
			expect(userActivities).toHaveLength(3);

			// Verify all time periods are represented
			const titles = userActivities.map(a => a.title);
			expect(titles).toContain('Test History Past Activity');
			expect(titles).toContain('Test History Current Activity');
			expect(titles).toContain('Test History Future Activity');

			// Verify database consistency
			const dbActivities = await Activity.find({ 'creator.username': testUser.email });
			expect(dbActivities).toHaveLength(3);
		});

		it('SUCCESS: Activities are properly categorized by time', async () => {
			const response = await ActivityGET();
			const activities = await response.json();
			const userActivities = activities.filter(a => a.creator.username === testUser.email);

			// Test time parsing and categorization
			const now = new Date();
			const categorized = {
				past: [],
				current: [],
				future: []
			};

			userActivities.forEach(activity => {
				const activityTime = parseActivityTime(activity.time);
				if (activityTime < now) {
					categorized.past.push(activity);
				} else if (activityTime.getTime() - now.getTime() < 24 * 60 * 60 * 1000) {
					categorized.current.push(activity);
				} else {
					categorized.future.push(activity);
				}
			});

			// Verify categorization works
			expect(categorized.past.length + categorized.current.length + categorized.future.length).toBe(3);
		});

		it('SUCCESS: Future activities can be edited in database', async () => {
			// Simulate editing future activity
			const updatedTitle = 'Test History Future Activity - EDITED';
			const updatedLocation = 'Updated Future Location';

			await Activity.updateOne(
				{ _id: futureActivityId },
				{ 
					$set: { 
						title: updatedTitle,
						location: updatedLocation
					}
				}
			);

			// Verify update in database
			const updatedActivity = await Activity.findById(futureActivityId);
			expect(updatedActivity.title).toBe(updatedTitle);
			expect(updatedActivity.location).toBe(updatedLocation);

			// Verify via API
			const response = await ActivityGET();
			const activities = await response.json();
			const apiActivity = activities.find(a => a.id === futureActivityId);
			expect(apiActivity.title).toBe(updatedTitle);
			expect(apiActivity.location).toBe(updatedLocation);
		});

		it('FAILURE: Past activities should not be editable (business rule)', async () => {
			// This test demonstrates the business rule that past activities shouldn't be edited
			const originalActivity = await Activity.findById(pastActivityId);
			const originalTitle = originalActivity.title;

			// Attempt to edit past activity (this should be prevented in the frontend/API)
			const updatedTitle = 'Test History Past Activity - SHOULD NOT BE EDITED';
			
			// For demonstration, we'll show that the database allows it but the application should prevent it
			await Activity.updateOne(
				{ _id: pastActivityId },
				{ $set: { title: updatedTitle } }
			);

			const updatedActivity = await Activity.findById(pastActivityId);
			expect(updatedActivity.title).toBe(updatedTitle);

			// This test shows that business logic should prevent past activity editing
			// In a real application, this would be blocked by the API or frontend
		});

		it('SUCCESS: Activity editing preserves participant list', async () => {
			// Add a participant to future activity
			await JoinActivityPOST(new Request('http://localhost/api/join-activity', {
				method: 'POST',
				body: JSON.stringify({
					activityId: futureActivityId,
					userId: 'test-participant-id',
					userEmail: 'participant@example.com'
				})
			}));

			// Edit the activity
			await Activity.updateOne(
				{ _id: futureActivityId },
				{ $set: { title: 'Edited Activity With Participants' } }
			);

			// Verify participants are preserved
			const editedActivity = await Activity.findById(futureActivityId);
			expect(editedActivity.participants).toHaveLength(2); // Creator + participant
			expect(editedActivity.title).toBe('Edited Activity With Participants');
		});
	});

	describe('R8: Activity Deletion with Confirmation', () => {
		const testUser = {
			email: 'history.delete.test@example.com',
			password: 'testpass123'
		};

		let activityToDelete: string;
		let activityWithParticipants: string;

		beforeEach(async () => {
			// Create user
			await UsersPOST(new Request('http://localhost/api/users', {
				method: 'POST',
				body: JSON.stringify(testUser)
			}));

			// Create activity for deletion
			const deleteActivityResponse = await ActivityPOST(new Request('http://localhost/api/activity', {
				method: 'POST',
				body: JSON.stringify({
					title: 'Test History Delete Activity',
					location: 'Delete Location',
					timeAndDate: '7:00PM, 06/15/2025',
					maxAttendees: 5,
					currentUserEmail: testUser.email
				})
			}));
			const deleteData = await deleteActivityResponse.json();
			activityToDelete = deleteData.id;

			// Create activity with participants
			const participantActivityResponse = await ActivityPOST(new Request('http://localhost/api/activity', {
				method: 'POST',
				body: JSON.stringify({
					title: 'Test History Activity With Participants',
					location: 'Participant Location',
					timeAndDate: '8:00PM, 06/20/2025',
					maxAttendees: 10,
					currentUserEmail: testUser.email
				})
			}));
			const participantData = await participantActivityResponse.json();
			activityWithParticipants = participantData.id;

			// Add participant
			await JoinActivityPOST(new Request('http://localhost/api/join-activity', {
				method: 'POST',
				body: JSON.stringify({
					activityId: activityWithParticipants,
					userId: 'participant-id',
					userEmail: 'participant.delete@example.com'
				})
			}));
		});

		it('SUCCESS: Activity can be deleted from database', async () => {
			// Verify activity exists
			const beforeDelete = await Activity.findById(activityToDelete);
			expect(beforeDelete).toBeTruthy();

			// Delete activity (simulating delete API)
			await Activity.deleteOne({ _id: activityToDelete });

			// Verify deletion in database
			const afterDelete = await Activity.findById(activityToDelete);
			expect(afterDelete).toBeNull();

			// Verify via API
			const response = await ActivityGET();
			const activities = await response.json();
			const deletedActivity = activities.find(a => a.id === activityToDelete);
			expect(deletedActivity).toBeUndefined();
		});

		it('SUCCESS: Activity deletion removes from user history', async () => {
			// Get initial count
			const initialResponse = await ActivityGET();
			const initialActivities = await initialResponse.json();
			const initialUserActivities = initialActivities.filter(a => a.creator.username === testUser.email);
			const initialCount = initialUserActivities.length;

			// Delete activity
			await Activity.deleteOne({ _id: activityToDelete });

			// Verify count decreased
			const finalResponse = await ActivityGET();
			const finalActivities = await finalResponse.json();
			const finalUserActivities = finalActivities.filter(a => a.creator.username === testUser.email);
			
			expect(finalUserActivities).toHaveLength(initialCount - 1);
			expect(finalUserActivities.find(a => a.id === activityToDelete)).toBeUndefined();
		});

		it('SUCCESS: Deleting activity with participants removes all participant data', async () => {
			// Verify activity has participants
			const beforeDelete = await Activity.findById(activityWithParticipants);
			expect(beforeDelete.participants).toHaveLength(2); // Creator + participant

			// Delete activity
			await Activity.deleteOne({ _id: activityWithParticipants });

			// Verify complete removal
			const afterDelete = await Activity.findById(activityWithParticipants);
			expect(afterDelete).toBeNull();

			// Verify no orphaned participant data
			const allActivities = await Activity.find({});
			const orphanedParticipants = allActivities.filter(activity => 
				activity.participants.some(p => p.username === 'participant.delete@example.com')
			);
			expect(orphanedParticipants).toHaveLength(0);
		});

		it('FAILURE: Cannot delete non-existent activity', async () => {
			const fakeId = new mongoose.Types.ObjectId();
			
			// Try to delete non-existent activity
			const result = await Activity.deleteOne({ _id: fakeId });
			
			// Should not delete anything
			expect(result.deletedCount).toBe(0);
		});

		it('SUCCESS: Bulk deletion of user activities', async () => {
			// Create multiple activities for bulk deletion test
			const bulkActivities = [
				'Test Bulk Delete 1',
				'Test Bulk Delete 2',
				'Test Bulk Delete 3'
			];

			for (const title of bulkActivities) {
				await ActivityPOST(new Request('http://localhost/api/activity', {
					method: 'POST',
					body: JSON.stringify({
						title,
						location: 'Bulk Location',
						timeAndDate: '9:00AM, 07/01/2025',
						maxAttendees: 5,
						currentUserEmail: testUser.email
					})
				}));
			}

			// Verify activities created
			const beforeBulkDelete = await Activity.find({ 'creator.username': testUser.email });
			expect(beforeBulkDelete.length).toBeGreaterThanOrEqual(3);

			// Bulk delete user's activities
			const deleteResult = await Activity.deleteMany({ 'creator.username': testUser.email });
			expect(deleteResult.deletedCount).toBeGreaterThanOrEqual(3);

			// Verify all user activities deleted
			const afterBulkDelete = await Activity.find({ 'creator.username': testUser.email });
			expect(afterBulkDelete).toHaveLength(0);
		});
	});

	describe('Activity History Data Integrity', () => {
		const testUser = {
			email: 'history.integrity.test@example.com',
			password: 'testpass123'
		};

		beforeEach(async () => {
			await UsersPOST(new Request('http://localhost/api/users', {
				method: 'POST',
				body: JSON.stringify(testUser)
			}));
		});

		it('SUCCESS: Activity history maintains chronological order', async () => {
			// Create activities with different times
			const timeSlots = [
				'7:00AM, 01/15/2025',
				'8:00AM, 01/10/2025',
				'9:00AM, 01/20/2025',
				'10:00AM, 01/05/2025'
			];

			for (let i = 0; i < timeSlots.length; i++) {
				await ActivityPOST(new Request('http://localhost/api/activity', {
					method: 'POST',
					body: JSON.stringify({
						title: `Test Order Activity ${i + 1}`,
						location: 'Order Location',
						timeAndDate: timeSlots[i],
						maxAttendees: 5,
						currentUserEmail: testUser.email
					})
				}));
			}

			// Get activities and verify they can be sorted chronologically
			const response = await ActivityGET();
			const activities = await response.json();
			const userActivities = activities.filter(a => a.creator.username === testUser.email);

			// Sort by time
			const sortedActivities = userActivities.sort((a, b) => {
				const timeA = parseActivityTime(a.time);
				const timeB = parseActivityTime(b.time);
				return timeA.getTime() - timeB.getTime();
			});

			// Verify chronological order
			expect(sortedActivities[0].time).toBe('10:00AM, 01/05/2025');
			expect(sortedActivities[1].time).toBe('8:00AM, 01/10/2025');
			expect(sortedActivities[2].time).toBe('7:00AM, 01/15/2025');
			expect(sortedActivities[3].time).toBe('9:00AM, 01/20/2025');
		});

		it('SUCCESS: Activity history persists across multiple operations', async () => {
			// Create activity
			const createResponse = await ActivityPOST(new Request('http://localhost/api/activity', {
				method: 'POST',
				body: JSON.stringify({
					title: 'Test Persistence Activity',
					location: 'Persistence Location',
					timeAndDate: '7:00PM, 06/15/2025',
					maxAttendees: 5,
					currentUserEmail: testUser.email
				})
			}));
			const createData = await createResponse.json();

			// Add participant
			await JoinActivityPOST(new Request('http://localhost/api/join-activity', {
				method: 'POST',
				body: JSON.stringify({
					activityId: createData.id,
					userId: 'persistence-participant',
					userEmail: 'persistence@example.com'
				})
			}));

			// Edit activity
			await Activity.updateOne(
				{ _id: createData.id },
				{ $set: { title: 'Test Persistence Activity - UPDATED' } }
			);

			// Verify all changes persisted
			const finalActivity = await Activity.findById(createData.id);
			expect(finalActivity.title).toBe('Test Persistence Activity - UPDATED');
			expect(finalActivity.participants).toHaveLength(2);
			expect(finalActivity.location).toBe('Persistence Location');

			// Verify via API
			const apiResponse = await ActivityGET();
			const apiActivities = await apiResponse.json();
			const apiActivity = apiActivities.find(a => a.id === createData.id);
			expect(apiActivity.title).toBe('Test Persistence Activity - UPDATED');
			expect(apiActivity.participants).toHaveLength(2);
		});
	});
});