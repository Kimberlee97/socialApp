# SOCIALAPP

This repository contains the source code for SocialApp, a React Native application built with Expo and TypeScript. The application implements a social feed with content creation capabilities, local data persistence, and biometric authentication support.

## PROJECT OVERVIEW

The application follows an N-Layered Architecture to ensure separation of concerns, maintainability, and scalability. It utilizes a local SQLite database for data persistence, ensuring functionality without network dependencies.

## TECH STACK

- **Framework**: React Native (via Expo SDK 52)
- **Language**: TypeScript
- **Database**: SQLite (using expo-sqlite)
- **Navigation**: Expo Router
- **Authentication**: Local Authentication (Biometrics/PIN) via expo-local-authentication
- **Testing**: Jest & Jest Expo

## KEY FEATURES

- **Authentication**: User login and signup flows, including biometric authentication (FaceID/TouchID) and PIN verification.
- **Feed**: A high-performance, infinite-scrolling feed capable of handling thousands of records efficiently.
- **Content Creation**: A post creation interface with image selection, cropping, and validation.
- **Data Seeding**: Automated seeding of initial data from JSON into the local SQLite database upon first launch.

## PREREQUISITES

To run this project, you need the following installed on your development machine:

- **Node.js** (LTS version recommended) - Required to run the Expo CLI and package manager.
- **npm** or **yarn**
- **iOS Simulator** (Mac) or **Android Emulator**
- **Expo Go** app (if testing on a physical device)

## INSTALLATION & SETUP

Follow these instructions to run the application locally.

### Clone the repository:

```bash
git clone <repository-url>
cd SocialApp
```

### Install dependencies:

```bash
npm install
```

### Initialize the Database:

The application automatically initializes the SQLite database and seeds it with data from `assets/data/users.json` and `assets/data/seed.json` on the first run. No manual database setup is required.

### Run the application:

```bash
npx expo start
```

- Press **"i"** to open in the iOS Simulator.
- Press **"a"** to open in the Android Emulator.
- Scan the QR code to run on a physical device via Expo Go.

**Platform Note**: This application has been primarily developed and tested on the iOS Simulator (iPhone 17, iOS 18.2).

## TESTING INSTRUCTIONS

### User Accounts & Simulation Strategy

The application comes pre-seeded with test accounts defined in `assets/data/users.json`. These accounts are designed to simulate different user origins to test the security constraints of Biometric Authentication.

#### "Local" Users
These simulate users who signed up on this specific device.

- **Allowed**: Biometric Login (Face ID).
- **Example**: AdminUser (PIN: 0000), Johnny (PIN: 0000).

#### "Non-Local" Users
These simulate users who created their account on a different device (e.g., a web portal or another phone) and are now logging in here for the first time.

- **Restricted**: Biometric Login is disabled for security reasons until they manually authenticate at least once.
- **Example**: Guest (PIN: 1234), John (PIN: 1111).

### Unit & Integration Testing

The project utilizes Jest for automated testing. The testing strategy focuses on validating business logic, data persistence, and the integrity of the pagination system.

To run the test suite, execute the following command:

```bash
npm test
```

The test suite (`src/database/tests/PostRepositorySql.test.ts`) covers the following critical areas:

- **Data Persistence**: Verifies that the `create()` method correctly inserts data into the SQLite database.
- **Query Logic**: Verifies that `getAll()` correctly retrieves data based on provided parameters.
- **Pagination Integration**: A loop-based integration test simulates a user scrolling through the entire dataset. This test mathematically verifies that the pagination logic (limit/offset) retrieves every single record from the database without duplication or omission.

## ARCHITECTURAL & DESIGN DECISIONS

### Database Choice: SQLite

**Justification**: SQLite was chosen as the persistence layer because it provides a robust, relational database engine that runs entirely on the device.

- **Offline Capability**: Unlike a REST API or Firebase, SQLite allows the app to function perfectly without an internet connection.
- **Data Integrity**: It enforces structured data schemas, ensuring reliability as the application scales.
- **Performance**: For a read-heavy application like a Social Feed, SQLite offers sub-millisecond query times, which is superior to reading from flat JSON files or AsyncStorage.

### Security & Authentication Strategy

The application implements a dual-layer authentication system designed to balance security with user convenience.

- **PIN-Based Security**: A 4-digit PIN is used as the primary credential. This was chosen over complex passwords for the mobile context, reducing friction while maintaining adequate security for a local-first application.
- **Biometric Auto-Login**: Biometric authentication (FaceID/TouchID) is implemented as a convenience layer on top of the PIN. It allows for seamless "auto-login" upon app launch but strictly serves as a shortcut; the underlying cryptographic validation still relies on the secure token generation linked to the user's initial authentication.
- **Database Security**: To prevent SQL injection attacks, all database operations utilize parameterized queries (prepared statements) via the expo-sqlite API. This ensures that user input—such as post titles or search queries—is never executed as raw SQL code.

### N-Layered Architecture

The application is structured into distinct layers to decouple the UI from data logic:

- **Presentation Layer** (`screens/`): React components responsible solely for rendering UI and handling user interaction.
- **Service Layer** (`services/`): Handles business logic (e.g., ImageService for file system operations, AuthService for session management, UserService for data sanitation).
- **Repository Layer** (`database/`): Abstracts direct SQL queries, allowing the data source to be swapped without affecting the UI.

### Performance & Pagination

To ensure a smooth user experience with large datasets (thousands of posts), "Select All" queries were rejected in favor of an Infinite Scroll pattern.

- **Database Level**: Queries use `LIMIT` and `OFFSET` to fetch data in small batches (Page Size: 20), minimizing memory usage.
- **UI Level**: The FlatList is optimized with `initialNumToRender`, `maxToRenderPerBatch`, `windowSize`, and `removeClippedSubviews`.
- **Memoization**: The PostItem component is wrapped in `React.memo` to prevent unnecessary re-renders of off-screen or unchanged items during scrolling.

### Image Handling

The application uses `expo-image-picker` with `allowsEditing` set to `true`.

- **Trade-off**: While the native editor introduces a slight delay on the Simulator due to virtualization overhead, it was retained to provide necessary cropping functionality for the user.
- **Optimization**: Images are compressed (quality: 0.7) before storage to balance visual fidelity with database performance and storage efficiency.

## SCALABILITY & CONCURRENCY ARCHITECTURE

### 1. Distributed Local Processing

The application uses a "Local-First" architecture, running entirely on the user's device. This eliminates server-side bottlenecks for read/write operations, allowing the app to support any number of concurrent users globally with consistent local performance and no central infrastructure costs.

### 2. Modular Architecture for Growth

The codebase utilizes the Repository Pattern to decouple data access from the UI. While the current implementation uses SQLite for offline capability, this abstraction layer allows for a future migration to a cloud-based backend (e.g., REST API or Firebase) without requiring changes to the frontend or business logic layers.