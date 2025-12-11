import { POST, GET } from '@/app/api/activity/route';

// R2: Activity Posting Functional Tests
describe('R2: Activity Posting', () => {
	const VALID_ACTIVITY = {
		title: 'Functional Test Activity',
		location: 'Test Location',
		timeAndDate: '10:00AM, 12/25/2024',
		maxAttendees: 5,
		currentUserEmail: 'creator@example.com'
	};

	// Success Case: Activity is posted and available for joining
	it('should create activity and make it available for joining', async () => {
		// Step 1: Post activity
		const postReq = new Request('http://localhost/api/activity', {
			method: 'POST',
			body: JSON.stringify(VALID_ACTIVITY)
		});

		const postResponse = await POST(postReq);
		const postData = await postResponse.json();

		expect(postResponse.status).toBe(201);
		expect(postData.title).toBe(VALID_ACTIVITY.title);
		expect(postData.location).toBe(VALID_ACTIVITY.location);
		expect(postData).toHaveProperty('id');

		// Step 2: Verify activity appears in activity feed
		const getResponse = await GET();
		const activities = await getResponse.json();

		expect(getResponse.status).toBe(200);
		expect(Array.isArray(activities)).toBe(true);
		
		const ourActivity = activities.find(activity => activity.title === VALID_ACTIVITY.title);
		expect(ourActivity).toBeTruthy();
		expect(ourActivity.maxAttendees).toBe(VALID_ACTIVITY.maxAttendees);
	});

	// Failure Case 1: User sets maximum attendees to 0
	it('should reject activity with 0 maximum attendees', async () => {
		const invalidActivity = {
			...VALID_ACTIVITY,
			maxAttendees: 0
		};

		const req = new Request('http://localhost/api/activity', {
			method: 'POST',
			body: JSON.stringify(invalidActivity)
		});

		const response = await POST(req);
		const data = await response.json();

		expect(response.status).toBe(400);
		expect(data.error).toBe('Missing fields'); // Current validation treats 0 as missing
	});

	// Edge Case: Missing required fields
	it('should reject activity with missing required fields', async () => {
		const incompleteActivity = {
			title: 'Test Activity',
			// Missing location, timeAndDate, maxAttendees
		};

		const req = new Request('http://localhost/api/activity', {
			method: 'POST',
			body: JSON.stringify(incompleteActivity)
		});

		const response = await POST(req);
		const data = await response.json();

		expect(response.status).toBe(400);
		expect(data.error).toBe('Missing fields');
	});

	// Success Case: Activity with minimum valid attendees
	it('should accept activity with 1 maximum attendee', async () => {
		const minActivity = {
			...VALID_ACTIVITY,
			title: 'Min Attendees Activity',
			maxAttendees: 1
		};

		const req = new Request('http://localhost/api/activity', {
			method: 'POST',
			body: JSON.stringify(minActivity)
		});

		const response = await POST(req);
		const data = await response.json();

		expect(response.status).toBe(201);
		expect(data.maxAttendees).toBe(1);
	});

	// Success Case: Activity with large number of attendees
	it('should accept activity with large maximum attendees', async () => {
		const largeActivity = {
			...VALID_ACTIVITY,
			title: 'Large Event',
			maxAttendees: 100
		};

		const req = new Request('http://localhost/api/activity', {
			method: 'POST',
			body: JSON.stringify(largeActivity)
		});

		const response = await POST(req);
		const data = await response.json();

		expect(response.status).toBe(201);
		expect(data.maxAttendees).toBe(100);
	});
});