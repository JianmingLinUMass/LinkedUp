import { POST as JoinPOST } from '@/app/api/join-activity/route';
import { POST as LeavePOST } from '@/app/api/leave-activity/route';
import { POST as ActivityPOST, GET as ActivityGET } from '@/app/api/activity/route';

// R3: Activity Joining Functional Tests
describe('R3: Activity Joining', () => {
	const TEST_ACTIVITY = {
		title: 'Joinable Activity',
		location: 'Join Test Location',
		timeAndDate: '2:00PM, 12/30/2024',
		maxAttendees: 3,
		currentUserEmail: 'creator@example.com'
	};

	const TEST_USER = 'joiner@example.com';

	let activityId: string;

	beforeEach(async () => {
		// Create an activity to join
		const createReq = new Request('http://localhost/api/activity', {
			method: 'POST',
			body: JSON.stringify(TEST_ACTIVITY)
		});
		const createResponse = await ActivityPOST(createReq);
		const activityData = await createResponse.json();
		activityId = activityData.id;
	});

	// Success Case: User joins activity and dashboard updates
	it('should allow user to join activity and update their dashboard', async () => {
		// Step 1: Join activity
		const joinReq = new Request('http://localhost/api/join-activity', {
			method: 'POST',
			body: JSON.stringify({
				activityId: activityId,
				userEmail: TEST_USER
			})
		});

		const joinResponse = await JoinPOST(joinReq);
		const joinData = await joinResponse.json();

		expect(joinResponse.status).toBe(200);
		expect(joinData.message).toContain('joined');

		// Step 2: Verify activity shows user as participant
		const getResponse = await ActivityGET();
		const activities = await getResponse.json();
		
		const joinedActivity = activities.find((a: any) => a.id === activityId);
		expect(joinedActivity).toBeTruthy();
		expect(joinedActivity.participants.some((p: any) => p.username === TEST_USER)).toBe(true);
	});

	// Success Case: User can leave activity
	it('should allow user to leave activity', async () => {
		// Step 1: Join activity first
		const joinReq = new Request('http://localhost/api/join-activity', {
			method: 'POST',
			body: JSON.stringify({
				activityId: activityId,
				userEmail: TEST_USER
			})
		});
		await JoinPOST(joinReq);

		// Step 2: Leave activity
		const leaveReq = new Request('http://localhost/api/leave-activity', {
			method: 'POST',
			body: JSON.stringify({
				activityId: activityId,
				userEmail: TEST_USER
			})
		});

		const leaveResponse = await LeavePOST(leaveReq);
		const leaveData = await leaveResponse.json();

		expect(leaveResponse.status).toBe(200);
		expect(leaveData.message).toContain('left');

		// Step 3: Verify user is no longer participant
		const getResponse = await ActivityGET();
		const activities = await getResponse.json();
		
		const leftActivity = activities.find((a: any) => a.id === activityId);
		expect(leftActivity.participants.some((p: any) => p.username === TEST_USER)).toBe(false);
	});

	// Failure Case: User tries to join non-existent activity
	it('should reject joining non-existent activity', async () => {
		const joinReq = new Request('http://localhost/api/join-activity', {
			method: 'POST',
			body: JSON.stringify({
				activityId: 'nonexistent-id',
				userEmail: TEST_USER
			})
		});

		const response = await JoinPOST(joinReq);
		const data = await response.json();

		expect(response.status).toBe(404);
		expect(data.error).toContain('not found');
	});

	// Failure Case: User tries to join activity at capacity
	it('should reject joining activity at maximum capacity', async () => {
		// Fill activity to capacity
		for (let i = 0; i < TEST_ACTIVITY.maxAttendees; i++) {
			const joinReq = new Request('http://localhost/api/join-activity', {
				method: 'POST',
				body: JSON.stringify({
					activityId: activityId,
					userEmail: `user${i}@example.com`
				})
			});
			await JoinPOST(joinReq);
		}

		// Try to join when full
		const joinReq = new Request('http://localhost/api/join-activity', {
			method: 'POST',
			body: JSON.stringify({
				activityId: activityId,
				userEmail: 'overflow@example.com'
			})
		});

		const response = await JoinPOST(joinReq);
		const data = await response.json();

		expect(response.status).toBe(400);
		expect(data.error).toContain('full');
	});

	// Edge Case: User tries to join same activity twice
	it('should handle duplicate join attempts gracefully', async () => {
		// Join once
		const joinReq1 = new Request('http://localhost/api/join-activity', {
			method: 'POST',
			body: JSON.stringify({
				activityId: activityId,
				userEmail: TEST_USER
			})
		});
		await JoinPOST(joinReq1);

		// Try to join again
		const joinReq2 = new Request('http://localhost/api/join-activity', {
			method: 'POST',
			body: JSON.stringify({
				activityId: activityId,
				userEmail: TEST_USER
			})
		});

		const response = await JoinPOST(joinReq2);
		const data = await response.json();

		expect(response.status).toBe(400);
		expect(data.error).toContain('Already');
	});
});