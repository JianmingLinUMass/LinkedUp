import '@testing-library/jest-dom';
import { config } from 'dotenv';

// Load test environment variables
config({ path: '.env.test', debug: false });

// Global test setup
beforeAll(() => {
	// Set test timeout
	jest.setTimeout(30000);
});

afterAll(async () => {
	// Force close any remaining connections
	await new Promise(resolve => setTimeout(resolve, 100));
});