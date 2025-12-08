# LinkedUp

Under busy course schedules, college students often find themselves left with few free time to utilize to try out new activities. Further, students miss opportunities due to conflict schedules and complexity of using multiple social platforms to discover and join activities. The lack of a simple, centralized way to manage activities with others limits social interaction, reduces spontaneity, and contributes to decreased satisfaction with campus and community life.

To help address this problem, we propose **_LinkedUp_**, a social media-style application that aims for convenient activity creation, discovery and participation. Through this application, users can post activities by providing activity type, time, location, and number of participants. Participants can join posted activities upon the approval from the activity organizer. **_LinkedUp_** can bring many potential benefits to the users, including reducing time and effort to coordinate with different people individually, centralizing activity planning into a single platform, meeting new people who have shared interests, and helping students maintain a healthier balance between academics and social life.

## Features

### Core Functionality
- **User Authentication**: Secure account creation, login, and session management
- **Activity Management**: Create, view, edit, and delete activities
- **Activity Discovery**: Browse and join activities posted by other users
- **Calendar Timeline**: Visual calendar view for better activity scheduling
- **Profile Management**: Edit user information, password, and profile picture
- **Responsive Design**: Optimized for mobile, tablet, and desktop devices

### User Interface
- **Dashboard View**: Quick overview of personal activities and activity feeds
- **List/Calendar Toggle**: Switch between list and timeline views
- **Interactive Calendar**: Date-based activity visualization with time sorting
- **Real-time Updates**: Dynamic content updates without page refresh

## Technology Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Hooks (useState, useEffect)
- **Navigation**: Next.js Navigation API
- **Form Handling**: React Hook Form
- **Testing**: Jest + React Testing Library, Cypress E2E

## Project Structure

```
linkedup/
├── app/                          # Next.js App Router pages
│   ├── activity-creation/        # Activity creation page
│   ├── activity-history/         # Activity history page
│   ├── forgot-password/          # Password reset page
│   ├── log-in/                   # Login page
│   ├── main/                     # Main dashboard page
│   ├── password-reset/           # Password reset confirmation
│   ├── profile/                  # User profile page
│   ├── sign-up/                  # User registration page
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout component
│   └── page.tsx                  # Root page (redirects to login)
├── components/                   # Reusable React components
│   ├── ActivityPanel.tsx         # Activity list component
│   └── CalendarTimeline.tsx      # Calendar visualization component
├── public/                       # Static assets
│   ├── lemon_drink.jpeg          # Profile picture placeholder
│   └── *.svg                     # Icon assets
├── schemas/                      # TypeScript type definitions
│   └── ActivityRelated.tsx       # Activity-related types
├── __tests__/                    # Jest unit tests
│   ├── main.test.tsx             # Main page tests
│   └── login.test.tsx            # Login page tests
├── cypress/                      # Cypress E2E tests
├── jest.config.js                # Jest configuration
├── cypress.config.js             # Cypress configuration
└── package.json                  # Dependencies and scripts
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd linkedup
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open the application**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run Jest tests
npm run test:watch   # Run Jest in watch mode
npm run cypress:open # Open Cypress test runner
npm run cypress:run  # Run Cypress tests headlessly
```

## Usage

### Authentication Flow
1. **Sign Up**: Create a new account with email and password
2. **Login**: Access the application with existing credentials
3. **Auto-redirect**: Automatic routing based on authentication status

### Activity Management
1. **Create Activities**: Use the "Post an Activity" button to create new activities
2. **View Activities**: Switch between list and calendar views
3. **Join Activities**: Browse activity feeds and join interesting activities
4. **Manage Profile**: Update personal information and preferences

### Calendar Features
- **Date Selection**: Click on dates to view activities for specific days
- **Timeline View**: See activities organized chronologically
- **Event Count**: Visual indicators showing activity density per date

## Responsive Design

The application is fully responsive with breakpoints:
- **Mobile**: 320px+ (default)
- **Tablet**: 768px+ (md)
- **Desktop**: 1024px+ (lg)
- **Large Desktop**: 1280px+ (xl)

## Testing

### Unit Tests (Jest)
```bash
npm run test
```
Tests cover component rendering, user interactions, and authentication flows.

### E2E Tests (Cypress)
```bash
npm run cypress:open
```
End-to-end tests verify complete user workflows and page navigation.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -am 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## License

This project is part of CS520 Group 5 coursework at UMass Amherst.
