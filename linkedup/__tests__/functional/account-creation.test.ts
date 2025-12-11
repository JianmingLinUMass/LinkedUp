import { POST } from '@/app/api/users/route';
import { POST as LoginPOST } from '@/app/api/login/route';

// R1: Account Creation Functional Tests
describe('R1: Account Creation', () => {
	const TEST_USER = {
		email: 'functional.test@example.com',
		password: 'testpass123'
	};

	// Success Case: User can successfully create account and login
	it('should allow user to signup and login successfully', async () => {
		// Step 1: Create account (Signup)
		const signupReq = new Request('http://localhost/api/users', {
			method: 'POST',
			body: JSON.stringify(TEST_USER)
		});

		const signupResponse = await POST(signupReq);
		const signupData = await signupResponse.json();

		expect(signupResponse.status).toBe(201);
		expect(signupData.email).toBe(TEST_USER.email);
		expect(signupData).toHaveProperty('id');

		// Step 2: Login with created account
		const loginReq = new Request('http://localhost/api/login', {
			method: 'POST',
			body: JSON.stringify(TEST_USER)
		});

		const loginResponse = await LoginPOST(loginReq);
		const loginData = await loginResponse.json();

		expect(loginResponse.status).toBe(200);
		expect(loginData.email).toBe(TEST_USER.email);
		expect(loginData).toHaveProperty('id');
		expect(loginData).not.toHaveProperty('password');
	});

	// Failure Case 1: User tries to create account with existing email
	it('should reject signup with existing email address', async () => {
		// Create first account
		const req1 = new Request('http://localhost/api/users', {
			method: 'POST',
			body: JSON.stringify(TEST_USER)
		});
		await POST(req1);

		// Try to create duplicate account
		const req2 = new Request('http://localhost/api/users', {
			method: 'POST',
			body: JSON.stringify(TEST_USER)
		});
		const response = await POST(req2);
		const data = await response.json();

		expect(response.status).toBe(409);
		expect(data.error).toBe('Email already exists');
	});

	// Failure Case 2: User tries to login with invalid credentials
	it('should reject login with invalid credentials', async () => {
		const invalidLoginReq = new Request('http://localhost/api/login', {
			method: 'POST',
			body: JSON.stringify({
				email: 'nonexistent@example.com',
				password: 'wrongpassword'
			})
		});

		const response = await LoginPOST(invalidLoginReq);
		const data = await response.json();

		expect(response.status).toBe(401);
		expect(data.error).toBe('Invalid email or password');
	});

	// Edge Case: Missing required fields
	it('should reject signup with missing fields', async () => {
		const incompleteReq = new Request('http://localhost/api/users', {
			method: 'POST',
			body: JSON.stringify({ email: 'test@example.com' }) // Missing password
		});

		const response = await POST(incompleteReq);
		const data = await response.json();

		expect(response.status).toBe(400);
		expect(data.error).toBe('Missing fields');
	});
});