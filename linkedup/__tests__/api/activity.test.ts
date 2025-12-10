import { POST, GET } from '@/app/api/activity/route';
import { dbConnect } from '@/lib/mongodb';
import mongoose from 'mongoose';
import '@testing-library/jest-dom';

// Test constants to avoid hardcoded data
const TEST_TITLE = 'Morning Jog';
const TEST_LOCATION = 'Amherst';
const TEST_TIME_DATE = '7:00AM, 11/07/2025';
const TEST_MAX_ATTENDEES = 5;
const TEST_CREATOR = 'user123';
const MOCK_ACTIVITY_ID = 'activity-id-123';

jest.mock('@/lib/mongodb');
jest.mock('mongoose', () => {
	const actual = jest.requireActual('mongoose');
	return {
		...actual,
		models: {},
		model: jest.fn()
	};
});

interface MockActivity {
	_id: string;
	title: string;
	location: string;
	timeAndDate: string;
	maxAttendees: number;
	creator: string;
	participants: string[];
	toObject: jest.Mock;
}

interface MockModel {
	create: jest.Mock;
	find: jest.Mock;
	lean: jest.Mock;
}

describe('POST /api/activity', () => {
	let mockActivity: MockActivity;
	let mockModel: MockModel;

	beforeEach(() => {
		jest.clearAllMocks();
		mockActivity = {
			_id: MOCK_ACTIVITY_ID,
			title: TEST_TITLE,
			location: TEST_LOCATION,
			timeAndDate: TEST_TIME_DATE,
			maxAttendees: TEST_MAX_ATTENDEES,
			creator: TEST_CREATOR,
			participants: [],
			toObject: jest.fn().mockReturnValue({
				title: TEST_TITLE,
				location: TEST_LOCATION,
				timeAndDate: TEST_TIME_DATE,
				maxAttendees: TEST_MAX_ATTENDEES,
				creator: TEST_CREATOR,
				participants: []
			})
		};

		mockModel = {
			create: jest.fn(),
			find: jest.fn().mockReturnThis(),
			lean: jest.fn()
		};

		(mongoose.model as jest.Mock).mockReturnValue(mockModel);
		(dbConnect as jest.Mock).mockResolvedValue(undefined);
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	// Normative case: successful activity creation
	it('should create a new activity with valid data', async () => {
		mockModel.create.mockResolvedValue(mockActivity);

		const req = new Request('http://localhost/api/activity', {
			method: 'POST',
			body: JSON.stringify({
				title: TEST_TITLE,
				location: TEST_LOCATION,
				timeAndDate: TEST_TIME_DATE,
				maxAttendees: TEST_MAX_ATTENDEES,
				creator: TEST_CREATOR
			})
		});

		const response = await POST(req);
		const data = await response.json();

		expect(response.status).toBe(201);
		expect(data).toHaveProperty('id', MOCK_ACTIVITY_ID);
		expect(data).toHaveProperty('title', TEST_TITLE);
		expect(dbConnect).toHaveBeenCalledTimes(1);
		expect(mockModel.create).toHaveBeenCalledWith({
			title: TEST_TITLE,
			location: TEST_LOCATION,
			timeAndDate: TEST_TIME_DATE,
			maxAttendees: TEST_MAX_ATTENDEES,
			creator: TEST_CREATOR,
			participants: []
		});
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
		expect(data).toEqual({ error: 'Missing required fields' });
		expect(mockModel.create).not.toHaveBeenCalled();
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
		expect(data).toEqual({ error: 'Missing required fields' });
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
		expect(data).toEqual({ error: 'Missing required fields' });
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
		expect(data).toEqual({ error: 'Missing required fields' });
	});

	// Boundary case: maxAttendees is 0
	it('should return 400 when maxAttendees is 0', async () => {
		const req = new Request('http://localhost/api/activity', {
			method: 'POST',
			body: JSON.stringify({
				title: TEST_TITLE,
				location: TEST_LOCATION,
				timeAndDate: TEST_TIME_DATE,
				maxAttendees: 0
			})
		});

		const response = await POST(req);
		const data = await response.json();

		expect(response.status).toBe(400);
		expect(data).toEqual({ error: 'Max attendees must be at least 1' });
	});

	// Boundary case: maxAttendees is negative
	it('should return 400 when maxAttendees is negative', async () => {
		const req = new Request('http://localhost/api/activity', {
			method: 'POST',
			body: JSON.stringify({
				title: TEST_TITLE,
				location: TEST_LOCATION,
				timeAndDate: TEST_TIME_DATE,
				maxAttendees: -5
			})
		});

		const response = await POST(req);
		const data = await response.json();

		expect(response.status).toBe(400);
		expect(data).toEqual({ error: 'Max attendees must be at least 1' });
	});

	// Boundary case: maxAttendees is 1 (minimum valid)
	it('should accept maxAttendees of 1', async () => {
		const activity = { ...mockActivity, maxAttendees: 1 };
		activity.toObject = jest.fn().mockReturnValue({ ...mockActivity.toObject(), maxAttendees: 1 });
		mockModel.create.mockResolvedValue(activity);

		const req = new Request('http://localhost/api/activity', {
			method: 'POST',
			body: JSON.stringify({
				title: TEST_TITLE,
				location: TEST_LOCATION,
				timeAndDate: TEST_TIME_DATE,
				maxAttendees: 1
			})
		});

		const response = await POST(req);

		expect(response.status).toBe(201);
		expect(mockModel.create).toHaveBeenCalled();
	});

	// Boundary case: very large maxAttendees
	it('should accept very large maxAttendees', async () => {
		const activity = { ...mockActivity, maxAttendees: 1000 };
		activity.toObject = jest.fn().mockReturnValue({ ...mockActivity.toObject(), maxAttendees: 1000 });
		mockModel.create.mockResolvedValue(activity);

		const req = new Request('http://localhost/api/activity', {
			method: 'POST',
			body: JSON.stringify({
				title: TEST_TITLE,
				location: TEST_LOCATION,
				timeAndDate: TEST_TIME_DATE,
				maxAttendees: 1000
			})
		});

		const response = await POST(req);

		expect(response.status).toBe(201);
	});

	// Normative case: activity without creator
	it('should create activity without creator field', async () => {
		mockModel.create.mockResolvedValue(mockActivity);

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
		expect(mockModel.create).toHaveBeenCalledWith(
			expect.objectContaining({
				participants: []
			})
		);
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
		mockModel.create.mockRejectedValue(new Error('Create failed'));

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
		expect(data).toEqual({ error: 'Missing required fields' });
	});

	// Normative case: verify participants array is initialized
	it('should initialize participants as empty array', async () => {
		mockModel.create.mockResolvedValue(mockActivity);

		const req = new Request('http://localhost/api/activity', {
			method: 'POST',
			body: JSON.stringify({
				title: TEST_TITLE,
				location: TEST_LOCATION,
				timeAndDate: TEST_TIME_DATE,
				maxAttendees: TEST_MAX_ATTENDEES
			})
		});

		await POST(req);

		expect(mockModel.create).toHaveBeenCalledWith(
			expect.objectContaining({
				participants: []
			})
		);
	});
});

describe('GET /api/activity', () => {
	let mockModel: MockModel;

	beforeEach(() => {
		jest.clearAllMocks();
		mockModel = {
			find: jest.fn().mockReturnThis(),
			lean: jest.fn(),
			create: jest.fn()
		};

		(mongoose.model as jest.Mock).mockReturnValue(mockModel);
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
				timeAndDate: TEST_TIME_DATE,
				maxAttendees: TEST_MAX_ATTENDEES,
				participants: []
			},
			{
				_id: 'id2',
				title: 'Club Meetup',
				location: 'Boston',
				timeAndDate: '4:00PM, 11/08/2025',
				maxAttendees: 10,
				participants: ['user1']
			}
		];
		mockModel.lean.mockResolvedValue(mockActivities);

		const response = await GET();
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data).toEqual(mockActivities);
		expect(dbConnect).toHaveBeenCalledTimes(1);
		expect(mockModel.find).toHaveBeenCalled();
	});

	// Boundary case: empty activity list
	it('should return empty array when no activities exist', async () => {
		mockModel.lean.mockResolvedValue([]);

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
			timeAndDate: TEST_TIME_DATE,
			maxAttendees: TEST_MAX_ATTENDEES,
			participants: []
		}];
		mockModel.lean.mockResolvedValue(mockActivities);

		const response = await GET();
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data).toHaveLength(1);
		expect(data[0]).toEqual(mockActivities[0]);
	});

	// Normative case: activities with participants
	it('should return activities with participants array', async () => {
		const mockActivities = [{
			_id: 'id1',
			title: TEST_TITLE,
			location: TEST_LOCATION,
			timeAndDate: TEST_TIME_DATE,
			maxAttendees: TEST_MAX_ATTENDEES,
			participants: ['user1', 'user2', 'user3']
		}];
		mockModel.lean.mockResolvedValue(mockActivities);

		const response = await GET();
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data[0].participants).toHaveLength(3);
	});
});