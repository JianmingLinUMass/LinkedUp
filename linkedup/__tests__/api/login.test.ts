import { POST } from '@/app/api/login/route';
import { dbConnect } from '@/lib/mongodb';
import mongoose from 'mongoose';

// Test constants to avoid hardcoded credentials
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'password123';
const MOCK_ID = 'mock-id-123';

jest.mock('@/lib/mongodb');
jest.mock('mongoose', () => {
	const actual = jest.requireActual('mongoose');
	return {
		...actual,
		models: {},
		model: jest.fn()
	};
});

interface MockUser {
	_id: string;
	email: string;
	password: string;
}

interface MockModel {
	findOne: jest.Mock;
}

describe('POST /api/login', () => {
	let mockUser: MockUser;
	let mockModel: MockModel;

	beforeEach(() => {
		jest.clearAllMocks();
		mockUser = {
			_id: MOCK_ID,
			email: TEST_EMAIL,
			password: TEST_PASSWORD
		};

		mockModel = {
			findOne: jest.fn()
		};

		(mongoose.model as jest.Mock).mockReturnValue(mockModel);
		(dbConnect as jest.Mock).mockResolvedValue(undefined);
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	// Normative case: successful login
	it('should login successfully with valid credentials', async () => {
		mockModel.findOne.mockResolvedValue(mockUser);

		const req = new Request('http://localhost/api/login', {
			method: 'POST',
			body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD })
		});

		const response = await POST(req);
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data).toEqual({ id: MOCK_ID, email: TEST_EMAIL });
		expect(dbConnect).toHaveBeenCalledTimes(1);
		expect(mockModel.findOne).toHaveBeenCalledWith({ email: TEST_EMAIL });
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
		expect(data).toEqual({ error: 'Missing credentials' });
		expect(mockModel.findOne).not.toHaveBeenCalled();
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
		expect(data).toEqual({ error: 'Missing credentials' });
		expect(mockModel.findOne).not.toHaveBeenCalled();
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
		expect(data).toEqual({ error: 'Missing credentials' });
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
		expect(data).toEqual({ error: 'Missing credentials' });
	});

	// Exceptional case: user not found
	it('should return 401 when user does not exist', async () => {
		mockModel.findOne.mockResolvedValue(null);

		const req = new Request('http://localhost/api/login', {
			method: 'POST',
			body: JSON.stringify({ email: 'nonexistent@example.com', password: TEST_PASSWORD })
		});

		const response = await POST(req);
		const data = await response.json();

		expect(response.status).toBe(401);
		expect(data).toEqual({ error: 'Invalid credentials' });
	});

	// Exceptional case: incorrect password
	it('should return 401 when password is incorrect', async () => {
		mockModel.findOne.mockResolvedValue(mockUser);

		const req = new Request('http://localhost/api/login', {
			method: 'POST',
			body: JSON.stringify({ email: TEST_EMAIL, password: 'wrongpassword' })
		});

		const response = await POST(req);
		const data = await response.json();

		expect(response.status).toBe(401);
		expect(data).toEqual({ error: 'Invalid credentials' });
	});

	// Boundary case: case-sensitive email
	it('should be case-sensitive for email', async () => {
		mockModel.findOne.mockResolvedValue(null);

		const req = new Request('http://localhost/api/login', {
			method: 'POST',
			body: JSON.stringify({ email: 'TEST@EXAMPLE.COM', password: TEST_PASSWORD })
		});

		const response = await POST(req);
		const data = await response.json();

		expect(response.status).toBe(401);
		expect(mockModel.findOne).toHaveBeenCalledWith({ email: 'TEST@EXAMPLE.COM' });
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
		mockModel.findOne.mockRejectedValue(new Error('Query failed'));

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
		mockModel.findOne.mockResolvedValue(specialUser);

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
		mockModel.findOne.mockResolvedValue(mockUser);

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