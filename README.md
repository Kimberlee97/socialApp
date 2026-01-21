# SOCIALAPP

This repository contains the source code for SocialApp, a React Native application built with Expo and TypeScript. The application implements a social feed with content creation capabilities, local data persistence, and biometric authentication support.

## PROJECT OVERVIEW

The application follows an N-Layered Architecture to ensure separation of concerns, maintainability, and scalability. It utilizes a local SQLite database for data persistence, ensuring functionality without network dependencies.

## TECH STACK

- **Framework**: React Native 0.81 (via Expo SDK 54)
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

#### Via Zip File
Unzip the provided project file and navigate into the directory:
```bash
cd <project-folder-name>
```

#### Via Git Clone
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

- **Allowed**: Biometric Login (Face ID) after logging in with their PIN at least once.
- **Example**: AdminUser (PIN: 0000)

#### "Non-Local" Users

These simulate users who created their account on a different device (e.g., a web portal or another phone) and are now logging in here for the first time.

- **Allowed**: PIN Login.
- **Restricted**: Biometric Login is disabled for security reasons.

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

### Database Choice: SQLite for Performance & Future Scalability

**Justification**: The decision to use SQLite was driven by the need for immediate, high-performance local user experience while preparing the application for future scaling.

- **Local Performance & Smoothness**: SQLite offers sub-millisecond query times, ensuring that the application remains buttery smooth and responsive even when handling thousands of posts. This prioritizes the immediate user experience by removing network latency from the critical rendering path.
- **Scalability Pathway**: By using a structured SQL engine locally, we enforce data integrity and schemas that mirror production-grade server databases (like PostgreSQL). This ensures that when the application scales to a hosted database, the data models remain consistent.

### N-Layered Architecture for Multi-Device Scalability

The application implements a strict N-Layered Architecture (Presentation, Service, Repository). This pattern was chosen specifically to ensure scalability as the application grows from a single-device demo to a multi-user, multi-device platform.

- **Decoupled Data Source**: The Repository Layer abstracts the underlying data source. Currently, it connects to a local SQLite database. However, because the UI and Service layers are agnostic to the data source, we can swap the SQLite implementation for a REST API or GraphQL client in the future without refactoring the frontend.
- **Separation of Concerns**: This structure allows different teams to work on UI logic and Business logic simultaneously, essential for scaling development velocity.

### Security & Authentication Rationale

The security strategy allows for a frictionless local user experience while enforcing strict constraints on account ownership and biometrics.

- **PIN vs. Complex Passwords**: To ensure a smooth local experience, we utilize a 4-digit PIN rather than complex alphanumeric passwords. This reduces friction for frequent access while maintaining adequate security for a local-first environment.

#### The "Chain of Trust" (Biometric Logic):

- **PIN-First Requirement**: Users are required to authenticate successfully with their PIN at least once on a specific device to establish a "Chain of Trust."
- **Local vs. Non-Local Restrictions**: To prevent unauthorized access, accounts identified as "Non-Local" (simulated as created on a different device) are blocked from using biometric login initially. This ensures that a compromised account cannot be accessed via biometrics on a new device until the owner manually verifies their identity with the PIN.
- **Data Security**: To protect the integrity of the data, all database operations utilize parameterized queries (prepared statements) via the expo-sqlite API, preventing SQL injection attacks regardless of user input.

### Performance & Pagination

To ensure the application scales to handle datasets of unlimited size (e.g., thousands of posts), we prioritized an Infinite Scroll pattern over "Select All" queries.

- **Database Level**: Queries strictly use `LIMIT` and `OFFSET` to fetch data in small, manageable batches (Page Size: 20), ensuring memory usage remains constant regardless of total database size.
- **UI Optimization**: The Feed utilizes `React.memo` and `removeClippedSubviews` to ensure that off-screen components do not consume resources, maintaining 60fps scrolling performance.

### Image Handling

The application uses `expo-image-picker` with `allowsEditing` set to `true`.

- **Trade-off**: While the native editor introduces a slight delay on the Simulator due to virtualization overhead, it was retained to provide necessary cropping functionality for the user.
- **Optimization**: Images are compressed (quality: 0.7) before storage to balance visual fidelity with database performance and storage efficiency.

## SCALABILITY & CONCURRENCY ARCHITECTURE

### 1. Distributed Local Processing

The application uses a "Local-First" architecture, running entirely on the user's device. This eliminates server-side bottlenecks for read/write operations, allowing the app to support any number of concurrent users globally with consistent local performance and no central infrastructure costs.

### 2. Modular Architecture for Growth

The codebase utilizes the Repository Pattern to decouple data access from the UI. While the current implementation uses SQLite for offline capability, this abstraction layer allows for a future migration to a cloud-based backend (e.g., REST API or Firebase) without requiring changes to the frontend or business logic layers.

## KNOWN ISSUES

- **iOS Smart Punctuation**: On the iOS Simulator, double-tapping the spacebar may auto-insert a period (`.`). If Login fails, please check that no accidental periods were added to the username. 