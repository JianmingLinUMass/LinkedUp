import { POST, GET } from '@/app/api/activity/route';
import { dbConnect } from '@/lib/mongodb';
import mongoose from 'mongoose';

// Test constants to avoid hardcoded data
const TEST_TITLE = 'Morning Jog';
const TEST_LOCATION = 'Amherst';
const TEST_TIME_DATE = '7:00AM, 11/07/2025';
const TEST_MAX_ATTENDEES = 5;
const TEST_CREATOR = 'user123';
const MOCK_ACTIVITY_ID = 'activity-id-123';

jest.mock('@/lib/mongodb');
jest.mock('mongoose', () => {
	const mockActivity = {
		create: jest.fn(),
		find: jest.fn().mockReturnThis(),
		lean: jest.fn()
	};
	return {
		models: { Activity: mockActivity },
		model: jest.fn(() => mockActivity),
		Schema: jest.fn()
	};
});

const mockActivity = (mongoose as any).models?.Activity || {
	create: jest.fn(),
	find: jest.fn().mockReturnThis(),
	lean: jest.fn()
};

interface MockActivity {
	_id: string;
	title: string;
	location: string;
	time: string;
	maxAttendees: number;
	creator: any;
	participants: string[];
	toObject: jest.Mock;
}

describe('POST /api/activity', () => {
	let testActivity: MockActivity;

	beforeEach(() => {
		jest.clearAllMocks();
		testActivity = {
			_id: MOCK_ACTIVITY_ID,
			title: TEST_TITLE,
			location: TEST_LOCATION,
			time: TEST_TIME_DATE,
			maxAttendees: TEST_MAX_ATTENDEES,
			creator: { username: TEST_CREATOR, avatar: '/lemon_drink.jpeg' },
			participants: [],
			toObject: jest.fn().mockReturnValue({
				_id: MOCK_ACTIVITY_ID,
				title: TEST_TITLE,
				location: TEST_LOCATION,
				time: TEST_TIME_DATE,
				maxAttendees: TEST_MAX_ATTENDEES,
				creator: { username: TEST_CREATOR, avatar: '/lemon_drink.jpeg' },
				participants: []
			})
		};

		(dbConnect as jest.Mock).mockResolvedValue(undefined);
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	// Normative case: successful activity creation
	it('should create a new activity with valid data', async () => {
		mockActivity.create.mockResolvedValue(testActivity);

		const req = new Request('http://localhost/api/activity', {
			method: 'POST',
			body: JSON.stringify({
				title: TEST_TITLE,
				location: TEST_LOCATION,
				timeAndDate: TEST_TIME_DATE,
				maxAttendees: TEST_MAX_ATTENDEES,
				currentUserEmail: TEST_CREATOR
			})
		});

		const response = await POST(req);
		const data = await response.json();

		expect(response.status).toBe(201);
		expect(data).toHaveProperty('id', MOCK_ACTIVITY_ID);
		expect(data).toHaveProperty('title', TEST_TITLE);
		expect(dbConnect).toHaveBeenCalledTimes(1);
	});

	// Exceptional case: missing title
	it('should return 400 when title is missing', async () => {
		const req = new Request('http://localhost/api/activity', {
			method: 'POST',
			body: JSON.stringify({
				location: TEST_LOCATION,
				timeAndDate: TEST_TIME_DATE,
				maxAttendees: TEST_MAX_ATTENDEES
			})
		});

		const response = await POST(req);
		const data = await response.json();

		expect(response.status).toBe(400);
		expect(data).toEqual({ error: 'Missing fields' });
		expect(mockActivity.create).not.toHaveBeenCalled();
	});

	// Exceptional case: missing location
	it('should return 400 when location is missing', async () => {
		const req = new Request('http://localhost/api/activity', {
			method: 'POST',
			body: JSON.stringify({
				title: TEST_TITLE,
				timeAndDate: TEST_TIME_DATE,
				maxAttendees: TEST_MAX_ATTENDEES
			})
		});

		const response = await POST(req);
		const data = await response.json();

		expect(response.status).toBe(400);
		expect(data).toEqual({ error: 'Missing fields' });
	});

	// Exceptional case: missing timeAndDate
	it('should return 400 when timeAndDate is missing', async () => {
		const req = new Request('http://localhost/api/activity', {
			method: 'POST',
			body: JSON.stringify({
				title: TEST_TITLE,
				location: TEST_LOCATION,
				maxAttendees: TEST_MAX_ATTENDEES
			})
		});

		const response = await POST(req);
		const data = await response.json();

		expect(response.status).toBe(400);
		expect(data).toEqual({ error: 'Missing fields' });
	});

	// Exceptional case: missing maxAttendees
	it('should return 400 when maxAttendees is missing', async () => {
		const req = new Request('http://localhost/api/activity', {
			method: 'POST',
			body: JSON.stringify({
				title: TEST_TITLE,
				location: TEST_LOCATION,
				timeAndDate: TEST_TIME_DATE
			})
		});

		const response = await POST(req);
		const data = await response.json();

		expect(response.status).toBe(400);
		expect(data).toEqual({ error: 'Missing fields' });
	});

	// Normative case: activity without creator
	it('should create activity without creator field', async () => {
		mockActivity.create.mockResolvedValue(testActivity);

		const req = new Request('http://localhost/api/activity', {
			method: 'POST',
			body: JSON.stringify({
				title: TEST_TITLE,
				location: TEST_LOCATION,
				timeAndDate: TEST_TIME_DATE,
				maxAttendees: TEST_MAX_ATTENDEES
			})
		});

		const response = await POST(req);

		expect(response.status).toBe(201);
	});

	// Exceptional case: database connection failure
	it('should return 500 when database connection fails', async () => {
		(dbConnect as jest.Mock).mockRejectedValue(new Error('DB connection failed'));

		const req = new Request('http://localhost/api/activity', {
			method: 'POST',
			body: JSON.stringify({
				title: TEST_TITLE,
				location: TEST_LOCATION,
				timeAndDate: TEST_TIME_DATE,
				maxAttendees: TEST_MAX_ATTENDEES
			})
		});

		const response = await POST(req);
		const data = await response.json();

		expect(response.status).toBe(500);
		expect(data).toEqual({ error: 'Server error' });
	});

	// Exceptional case: database create failure
	it('should return 500 when activity creation fails', async () => {
		mockActivity.create.mockRejectedValue(new Error('Create failed'));

		const req = new Request('http://localhost/api/activity', {
			method: 'POST',
			body: JSON.stringify({
				title: TEST_TITLE,
				location: TEST_LOCATION,
				timeAndDate: TEST_TIME_DATE,
				maxAttendees: TEST_MAX_ATTENDEES
			})
		});

		const response = await POST(req);
		const data = await response.json();

		expect(response.status).toBe(500);
		expect(data).toEqual({ error: 'Server error' });
	});

	// Boundary case: empty string fields
	it('should return 400 when title is empty string', async () => {
		const req = new Request('http://localhost/api/activity', {
			method: 'POST',
			body: JSON.stringify({
				title: '',
				location: TEST_LOCATION,
				timeAndDate: TEST_TIME_DATE,
				maxAttendees: TEST_MAX_ATTENDEES
			})
		});

		const response = await POST(req);
		const data = await response.json();

		expect(response.status).toBe(400);
		expect(data).toEqual({ error: 'Missing fields' });
	});
});

describe('GET /api/activity', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		(dbConnect as jest.Mock).mockResolvedValue(undefined);
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	// Normative case: retrieve all activities
	it('should return all activities', async () => {
		const mockActivities = [
			{
				_id: 'id1',
				title: TEST_TITLE,
				location: TEST_LOCATION,
				time: TEST_TIME_DATE,
				maxAttendees: TEST_MAX_ATTENDEES,
				participants: []
			},
			{
				_id: 'id2',
				title: 'Club Meetup',
				location: 'Boston',
				time: '4:00PM, 11/08/2025',
				maxAttendees: 10,
				participants: ['user1']
			}
		];
		mockActivity.lean.mockResolvedValue(mockActivities);

		const response = await GET();
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data).toHaveLength(2);
		expect(dbConnect).toHaveBeenCalledTimes(1);
		expect(mockActivity.find).toHaveBeenCalled();
	});

	// Boundary case: empty activity list
	it('should return empty array when no activities exist', async () => {
		mockActivity.lean.mockResolvedValue([]);

		const response = await GET();
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data).toEqual([]);
	});

	// Normative case: single activity
	it('should return single activity in array', async () => {
		const mockActivities = [{
			_id: 'id1',
			title: TEST_TITLE,
			location: TEST_LOCATION,
			time: TEST_TIME_DATE,
			maxAttendees: TEST_MAX_ATTENDEES,
			participants: []
		}];
		mockActivity.lean.mockResolvedValue(mockActivities);

		const response = await GET();
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data).toHaveLength(1);
		expect(data[0]).toHaveProperty('title', TEST_TITLE);
	});
});