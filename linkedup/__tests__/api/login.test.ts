import { POST } from '@/app/api/login/route';
import { dbConnect } from '@/lib/mongodb';
import mongoose from 'mongoose';

// Test constants to avoid hardcoded credentials
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'password123';
const MOCK_ID = 'mock-id-123';

jest.mock('@/lib/mongodb');
jest.mock('mongoose', () => {
	const mockUser = {
		findOne: jest.fn().mockReturnThis(),
		lean: jest.fn()
	};
	return {
		models: { User: mockUser },
		model: jest.fn(() => mockUser),
		Schema: jest.fn()
	};
});

const mockUser = (mongoose as any).models?.User || {
	findOne: jest.fn().mockReturnThis(),
	lean: jest.fn()
};

interface MockUser {
	_id: string;
	email: string;
	password: string;
}

describe('POST /api/login', () => {
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

	// Normative case: successful login
	it('should login successfully with valid credentials', async () => {
		mockUser.lean.mockResolvedValue(testUser);

		const req = new Request('http://localhost/api/login', {
			method: 'POST',
			body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD })
		});

		const response = await POST(req);
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data).toEqual({ id: MOCK_ID, email: TEST_EMAIL });
		expect(dbConnect).toHaveBeenCalledTimes(1);
		expect(mockUser.findOne).toHaveBeenCalledWith({ email: TEST_EMAIL, password: TEST_PASSWORD });
	});

	// Exceptional case: missing email
	it('should return 400 when email is missing', async () => {
		const req = new Request('http://localhost/api/login', {
			method: 'POST',
			body: JSON.stringify({ password: TEST_PASSWORD })
		});

		const response = await POST(req);
		const data = await response.json();

		expect(response.status).toBe(400);
		expect(data).toEqual({ error: 'Email and password are required' });
		expect(mockUser.findOne).not.toHaveBeenCalled();
	});

	// Exceptional case: missing password
	it('should return 400 when password is missing', async () => {
		const req = new Request('http://localhost/api/login', {
			method: 'POST',
			body: JSON.stringify({ email: TEST_EMAIL })
		});

		const response = await POST(req);
		const data = await response.json();

		expect(response.status).toBe(400);
		expect(data).toEqual({ error: 'Email and password are required' });
		expect(mockUser.findOne).not.toHaveBeenCalled();
	});

	// Boundary case: empty email
	it('should return 400 when email is empty string', async () => {
		const req = new Request('http://localhost/api/login', {
			method: 'POST',
			body: JSON.stringify({ email: '', password: TEST_PASSWORD })
		});

		const response = await POST(req);
		const data = await response.json();

		expect(response.status).toBe(400);
		expect(data).toEqual({ error: 'Email and password are required' });
	});

	// Boundary case: empty password
	it('should return 400 when password is empty string', async () => {
		const req = new Request('http://localhost/api/login', {
			method: 'POST',
			body: JSON.stringify({ email: TEST_EMAIL, password: '' })
		});

		const response = await POST(req);
		const data = await response.json();

		expect(response.status).toBe(400);
		expect(data).toEqual({ error: 'Email and password are required' });
	});

	// Exceptional case: user not found
	it('should return 401 when user does not exist', async () => {
		mockUser.lean.mockResolvedValue(null);

		const req = new Request('http://localhost/api/login', {
			method: 'POST',
			body: JSON.stringify({ email: 'nonexistent@example.com', password: TEST_PASSWORD })
		});

		const response = await POST(req);
		const data = await response.json();

		expect(response.status).toBe(401);
		expect(data).toEqual({ error: 'Invalid email or password' });
	});

	// Exceptional case: incorrect password
	it('should return 401 when password is incorrect', async () => {
		mockUser.lean.mockResolvedValue(null);

		const req = new Request('http://localhost/api/login', {
			method: 'POST',
			body: JSON.stringify({ email: TEST_EMAIL, password: 'wrongpassword' })
		});

		const response = await POST(req);
		const data = await response.json();

		expect(response.status).toBe(401);
		expect(data).toEqual({ error: 'Invalid email or password' });
	});

	// Boundary case: case-sensitive email
	it('should be case-sensitive for email', async () => {
		mockUser.lean.mockResolvedValue(null);

		const req = new Request('http://localhost/api/login', {
			method: 'POST',
			body: JSON.stringify({ email: 'TEST@EXAMPLE.COM', password: TEST_PASSWORD })
		});

		const response = await POST(req);
		const data = await response.json();

		expect(response.status).toBe(401);
		expect(mockUser.findOne).toHaveBeenCalledWith({ email: 'TEST@EXAMPLE.COM', password: TEST_PASSWORD });
	});

	// Exceptional case: database connection failure
	it('should return 500 when database connection fails', async () => {
		(dbConnect as jest.Mock).mockRejectedValue(new Error('DB connection failed'));

		const req = new Request('http://localhost/api/login', {
			method: 'POST',
			body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD })
		});

		const response = await POST(req);
		const data = await response.json();

		expect(response.status).toBe(500);
		expect(data).toEqual({ error: 'Server error' });
	});

	// Exceptional case: database query failure
	it('should return 500 when database query fails', async () => {
		mockUser.lean.mockRejectedValue(new Error('Query failed'));

		const req = new Request('http://localhost/api/login', {
			method: 'POST',
			body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD })
		});

		const response = await POST(req);
		const data = await response.json();

		expect(response.status).toBe(500);
		expect(data).toEqual({ error: 'Server error' });
	});

	// Boundary case: special characters in credentials
	it('should handle special characters in email and password', async () => {
		const specialUser = {
			_id: 'special-id',
			email: 'test+tag@example.com',
			password: '!@#$%^&*()'
		};
		mockUser.lean.mockResolvedValue(specialUser);

		const req = new Request('http://localhost/api/login', {
			method: 'POST',
			body: JSON.stringify({ email: 'test+tag@example.com', password: '!@#$%^&*()' })
		});

		const response = await POST(req);
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data).toEqual({ id: 'special-id', email: 'test+tag@example.com' });
	});

	// Normative case: verify password is not returned
	it('should not return password in response', async () => {
		mockUser.lean.mockResolvedValue(testUser);

		const req = new Request('http://localhost/api/login', {
			method: 'POST',
			body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD })
		});

		const response = await POST(req);
		const data = await response.json();

		expect(data).not.toHaveProperty('password');
		expect(data).toHaveProperty('id');
		expect(data).toHaveProperty('email');
	});
});