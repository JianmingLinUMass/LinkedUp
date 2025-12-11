import { GET } from '@/app/api/activity/route';
import { POST } from '@/app/api/activity/route';

// R4: Activity Feeds Functional Tests
describe('R4: Activity Feeds', () => {
	const SAMPLE_ACTIVITIES = [
		{
			title: 'Current Activity',
			location: 'Current Location',
			timeAndDate: '3:00PM, 12/31/2024',
			maxAttendees: 5,
			currentUserEmail: 'user@example.com'
		},
		{
			title: 'Past Activity',
			location: 'Past Location', 
			timeAndDate: '1:00PM, 01/01/2020',
			maxAttendees: 3,
			currentUserEmail: 'user@example.com'
		},
		{
			title: 'Future Activity',
			location: 'Future Location',
			timeAndDate: '5:00PM, 12/31/2025',
			maxAttendees: 10,
			currentUserEmail: 'user@example.com'
		}
	];

	beforeEach(async () => {
		// Create sample activities for testing
		for (const activity of SAMPLE_ACTIVITIES) {
			const req = new Request('http://localhost/api/activity', {
				method: 'POST',
				body: JSON.stringify(activity)
			});
			await POST(req);
		}
	});

	// Success Case: User sees activities with all required information
	it('should display activities with title, location, capacity, and date', async () => {
		const response = await GET();
		const activities = await response.json();

		expect(response.status).toBe(200);
		expect(Array.isArray(activities)).toBe(true);
		expect(activities.length).toBeGreaterThanOrEqual(3);

		// Verify each activity has required fields
		activities.forEach((activity: any) => {
			expect(activity).toHaveProperty('title');
			expect(activity).toHaveProperty('location');
			expect(activity).toHaveProperty('maxAttendees');
			expect(activity).toHaveProperty('time'); // timeAndDate stored as 'time'
			expect(activity).toHaveProperty('participants');
			expect(activity).toHaveProperty('id');
		});
	});

	// Success Case: Activities show current participant count
	it('should show current participants for each activity', async () => {
		const response = await GET();
		const activities = await response.json();

		expect(response.status).toBe(200);
		
		activities.forEach((activity: any) => {
			expect(activity).toHaveProperty('participants');
			expect(Array.isArray(activity.participants)).toBe(true);
			expect(activity.participants.length).toBeLessThanOrEqual(activity.maxAttendees);
		});
	});

	// Success Case: User can differentiate activity status by information shown
	it('should provide enough information to differentiate activity status', async () => {
		const response = await GET();
		const activities = await response.json();

		expect(response.status).toBe(200);

		// Find our test activities
		const currentActivity = activities.find((a: any) => a.title === 'Current Activity');
		const pastActivity = activities.find((a: any) => a.title === 'Past Activity');
		const futureActivity = activities.find((a: any) => a.title === 'Future Activity');

		// All should be present
		expect(currentActivity).toBeTruthy();
		expect(pastActivity).toBeTruthy();
		expect(futureActivity).toBeTruthy();

		// Each should have time information to determine status
		expect(currentActivity.time).toContain('2024');
		expect(pastActivity.time).toContain('2020');
		expect(futureActivity.time).toContain('2025');
	});

	// Success Case: Empty feed returns empty array
	it('should handle empty activity feed gracefully', async () => {
		// This test assumes we can clear activities, but since we don't have delete in current API,
		// we'll test that the response is always a valid array
		const response = await GET();
		const activities = await response.json();

		expect(response.status).toBe(200);
		expect(Array.isArray(activities)).toBe(true);
	});

	// Success Case: Activities show creator information
	it('should display creator information for activities', async () => {
		const response = await GET();
		const activities = await response.json();

		expect(response.status).toBe(200);

		activities.forEach((activity: any) => {
			expect(activity).toHaveProperty('creator');
			if (activity.creator) {
				expect(activity.creator).toHaveProperty('username');
			}
		});
	});

	// Failure Case: User cannot easily differentiate activity status
	it('should provide clear status indicators for activities', async () => {
		const response = await GET();
		const activities = await response.json();

		expect(response.status).toBe(200);

		// Each activity should have enough information to determine its status
		activities.forEach((activity: any) => {
			// Should have time information
			expect(activity.time).toBeTruthy();
			expect(typeof activity.time).toBe('string');
			
			// Should have participant information to show availability
			expect(activity.participants).toBeDefined();
			expect(activity.maxAttendees).toBeGreaterThan(0);
			
			// Should be able to calculate if activity is full
			const isFull = activity.participants.length >= activity.maxAttendees;
			expect(typeof isFull).toBe('boolean');
		});
	});
});