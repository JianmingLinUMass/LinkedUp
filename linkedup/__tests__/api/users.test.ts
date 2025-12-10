import { POST, GET } from '@/app/api/users/route';
import { dbConnect } from '@/lib/mongodb';
import mongoose from 'mongoose';

// Test constants to avoid hardcoded credentials
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'password123';
const MOCK_ID = 'mock-id-123';

jest.mock('@/lib/mongodb');
jest.mock('mongoose', () => {
	const mockUser = {
		findOne: jest.fn(),
		create: jest.fn(),
		find: jest.fn().mockReturnThis(),
		select: jest.fn().mockReturnThis(),
		lean: jest.fn()
	};
	return {
		models: { User: mockUser },
		model: jest.fn(() => mockUser),
		Schema: jest.fn()
	};
});

const mockUser = (mongoose as any).models?.User || {
	findOne: jest.fn(),
	create: jest.fn(),
	find: jest.fn().mockReturnThis(),
	select: jest.fn().mockReturnThis(),
	lean: jest.fn()
};

interface MockUser {
	_id: string;
	email: string;
	password: string;
}

describe('POST /api/users', () => {
	let testUser: MockUser;

	beforeEach(() => {
		jest.clearAllMocks();
		testUser = {
			_id: MOCK_ID,
			email: TEST_EMAIL,
			password: TEST_PASSWORD
		};

		(dbConnect as jest.Mock).mockResolvedValue(undefined);
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	// Normative case: successful user creation
	it('should create a new user with valid credentials', async () => {
		mockUser.findOne.mockResolvedValue(null);
		mockUser.create.mockResolvedValue(testUser);

		const req = new Request('http://localhost/api/users', {
			method: 'POST',
			body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD })
		});

		const response = await POST(req);
		const data = await response.json();

		expect(response.status).toBe(201);
		expect(data).toEqual({ id: MOCK_ID, email: TEST_EMAIL });
		expect(dbConnect).toHaveBeenCalledTimes(1);
		expect(mockUser.findOne).toHaveBeenCalledWith({ email: TEST_EMAIL });
		expect(mockUser.create).toHaveBeenCalledWith({ email: TEST_EMAIL, password: TEST_PASSWORD });
	});

	// Exceptional case: missing email
	it('should return 400 when email is missing', async () => {
		const req = new Request('http://localhost/api/users', {
			method: 'POST',
			body: JSON.stringify({ password: TEST_PASSWORD })
		});

		const response = await POST(req);
		const data = await response.json();

		expect(response.status).toBe(400);
		expect(data).toEqual({ error: 'Missing fields' });
		expect(mockUser.create).not.toHaveBeenCalled();
	});

	// Exceptional case: missing password
	it('should return 400 when password is missing', async () => {
		const req = new Request('http://localhost/api/users', {
			method: 'POST',
			body: JSON.stringify({ email: TEST_EMAIL })
		});

		const response = await POST(req);
		const data = await response.json();

		expect(response.status).toBe(400);
		expect(data).toEqual({ error: 'Missing fields' });
		expect(mockUser.create).not.toHaveBeenCalled();
	});

	// Boundary case: empty email
	it('should return 400 when email is empty string', async () => {
		const req = new Request('http://localhost/api/users', {
			method: 'POST',
			body: JSON.stringify({ email: '', password: TEST_PASSWORD })
		});

		const response = await POST(req);
		const data = await response.json();

		expect(response.status).toBe(400);
		expect(data).toEqual({ error: 'Missing fields' });
	});

	// Boundary case: empty password
	it('should return 400 when password is empty string', async () => {
		const req = new Request('http://localhost/api/users', {
			method: 'POST',
			body: JSON.stringify({ email: TEST_EMAIL, password: '' })
		});

		const response = await POST(req);
		const data = await response.json();

		expect(response.status).toBe(400);
		expect(data).toEqual({ error: 'Missing fields' });
	});

	// Exceptional case: duplicate email
	it('should return 409 when email already exists', async () => {
		mockUser.findOne.mockResolvedValue(testUser);

		const req = new Request('http://localhost/api/users', {
			method: 'POST',
			body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD })
		});

		const response = await POST(req);
		const data = await response.json();

		expect(response.status).toBe(409);
		expect(data).toEqual({ error: 'Email already exists' });
		expect(mockUser.create).not.toHaveBeenCalled();
	});

	// Exceptional case: database connection failure
	it('should return 500 when database connection fails', async () => {
		(dbConnect as jest.Mock).mockRejectedValue(new Error('DB connection failed'));

		const req = new Request('http://localhost/api/users', {
			method: 'POST',
			body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD })
		});

		const response = await POST(req);
		const data = await response.json();

		expect(response.status).toBe(500);
		expect(data).toEqual({ error: 'Server error' });
	});

	// Exceptional case: database create failure
	it('should return 500 when user creation fails', async () => {
		mockUser.findOne.mockResolvedValue(null);
		mockUser.create.mockRejectedValue(new Error('Create failed'));

		const req = new Request('http://localhost/api/users', {
			method: 'POST',
			body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD })
		});

		const response = await POST(req);
		const data = await response.json();

		expect(response.status).toBe(500);
		expect(data).toEqual({ error: 'Server error' });
	});

	// Boundary case: very long email
	it('should handle very long email addresses', async () => {
		const longEmail = 'a'.repeat(100) + '@example.com';
		mockUser.findOne.mockResolvedValue(null);
		mockUser.create.mockResolvedValue({ _id: 'mock-id', email: longEmail, password: 'pass' });

		const req = new Request('http://localhost/api/users', {
			method: 'POST',
			body: JSON.stringify({ email: longEmail, password: TEST_PASSWORD })
		});

		const response = await POST(req);
		const data = await response.json();

		expect(response.status).toBe(201);
		expect(data.email).toBe(longEmail);
	});

	// Boundary case: special characters in password
	it('should handle special characters in password', async () => {
		const specialPassword = '!@#$%^&*()_+-=[]{}|;:,.<>?';
		mockUser.findOne.mockResolvedValue(null);
		mockUser.create.mockResolvedValue({ _id: 'mock-id', email: TEST_EMAIL, password: specialPassword });

		const req = new Request('http://localhost/api/users', {
			method: 'POST',
			body: JSON.stringify({ email: TEST_EMAIL, password: specialPassword })
		});

		const response = await POST(req);

		expect(response.status).toBe(201);
		expect(mockUser.create).toHaveBeenCalledWith({ email: TEST_EMAIL, password: specialPassword });
	});
});

describe('GET /api/users', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		(dbConnect as jest.Mock).mockResolvedValue(undefined);
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	// Normative case: retrieve all users
	it('should return all users without passwords', async () => {
		const mockUsers = [
			{ _id: 'id1', email: 'user1@example.com' },
			{ _id: 'id2', email: 'user2@example.com' }
		];
		mockUser.lean.mockResolvedValue(mockUsers);

		const response = await GET();
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data).toEqual(mockUsers);
		expect(dbConnect).toHaveBeenCalledTimes(1);
		expect(mockUser.find).toHaveBeenCalled();
		expect(mockUser.select).toHaveBeenCalledWith('_id email');
	});

	// Boundary case: empty user list
	it('should return empty array when no users exist', async () => {
		mockUser.lean.mockResolvedValue([]);

		const response = await GET();
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data).toEqual([]);
	});

	// Normative case: single user
	it('should return single user in array', async () => {
		const mockUsers = [{ _id: 'id1', email: 'user1@example.com' }];
		mockUser.lean.mockResolvedValue(mockUsers);

		const response = await GET();
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data).toHaveLength(1);
		expect(data[0]).toEqual(mockUsers[0]);
	});
});