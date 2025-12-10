import type { Config } from 'jest';
import nextJest from 'next/jest';

const createJestConfig = nextJest({
	dir: './',
});

const config: Config = {
	coverageProvider: 'v8',
	testEnvironment: 'node',
	setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/$1',
	},
	testMatch: [
		'**/__tests__/**/*.test.ts',
		'**/__tests__/**/*.test.tsx'
	],
	collectCoverageFrom: [
		'app/api/**/*.ts',
		'lib/**/*.ts',
		'!**/*.d.ts',
		'!**/node_modules/**',
	],
};

export default createJestConfig(config);
