# Backend API Unit Tests

This directory contains comprehensive unit tests for the LinkedUp backend API routes.

## Test Structure

All tests follow the standard testing structure:
1. **Setup** - Mock dependencies and initialize test data
2. **Execution** - Call the API route with test inputs
3. **Validation** - Assert expected outcomes
4. **Cleanup** - Restore mocks and clean up

## Test Coverage

### `/api/users` (users.test.ts)
- **POST /api/users** - User registration
  - ✓ Normative: Successful user creation
  - ✓ Exceptional: Missing email/password
  - ✓ Exceptional: Duplicate email (409)
  - ✓ Exceptional: Database failures (500)
  - ✓ Boundary: Empty strings
  - ✓ Boundary: Very long email
  - ✓ Boundary: Special characters in password

- **GET /api/users** - Retrieve all users
  - ✓ Normative: Return all users without passwords
  - ✓ Boundary: Empty user list
  - ✓ Normative: Single user

### `/api/login` (login.test.ts)
- **POST /api/login** - User authentication
  - ✓ Normative: Successful login
  - ✓ Exceptional: Missing credentials (400)
  - ✓ Exceptional: User not found (401)
  - ✓ Exceptional: Incorrect password (401)
  - ✓ Exceptional: Database failures (500)
  - ✓ Boundary: Empty strings
  - ✓ Boundary: Case-sensitive email
  - ✓ Boundary: Special characters
  - ✓ Security: Password not returned in response

### `/api/activity` (activity.test.ts)
- **POST /api/activity** - Create activity
  - ✓ Normative: Successful activity creation
  - ✓ Exceptional: Missing required fields (400)
  - ✓ Exceptional: Invalid maxAttendees (400)
  - ✓ Exceptional: Database failures (500)
  - ✓ Boundary: maxAttendees = 0, negative, 1, 1000
  - ✓ Boundary: Empty string fields
  - ✓ Normative: Participants array initialization

- **GET /api/activity** - Retrieve activities
  - ✓ Normative: Return all activities
  - ✓ Boundary: Empty activity list
  - ✓ Normative: Single activity
  - ✓ Normative: Activities with participants

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run specific test file
npm test users.test.ts
```

## Test Principles

### Isolation
- All external dependencies (database, mongoose) are mocked
- Tests do not depend on external systems
- Each test is independent and can run in any order

### Determinism
- Tests produce consistent results
- No reliance on timing, random data, or external state
- Mocks return predictable values

### Focus
- One method/endpoint per test suite
- One behavior per test case
- Clear test names describing what is being tested

### Coverage Goals
- **Statement Coverage**: All code lines executed
- **Branch Coverage**: All decision paths tested
- **Condition Coverage**: All boolean conditions tested
- **Black-box**: Tests based on API specifications
- **White-box**: Tests based on implementation logic

## Mocking Strategy

All tests mock:
- `@/lib/mongodb` - Database connection
- `mongoose` - Database models and operations

This ensures:
- Fast test execution
- No database setup required
- Predictable test behavior
- Isolation from external systems

## Test Assertions

Each test validates:
- **Return values**: HTTP status codes and response bodies
- **State changes**: Database operations called with correct parameters
- **Expected exceptions**: Error cases handled properly
- **Side effects**: Mocks called/not called as expected
