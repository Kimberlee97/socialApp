import { PostRepositorySql } from '../src/database/PostRepositorySql';
import { getDB } from '../src/database/connection';

// ------------------------------------------------------------------
// MOCK SETUP
// ------------------------------------------------------------------
// We mock the database connection to prevent running actual SQL queries
// during unit tests. This ensures tests are fast, deterministic, and
// do not require a running SQLite environment.
jest.mock('../src/database/connection', () => ({
  getDB: jest.fn(),
}));

describe('PostRepositorySql', () => {
  let mockRunAsync: jest.Mock;
  let mockGetAllAsync: jest.Mock;

  // ----------------------------------------------------------------
  // TEST LIFECYCLE
  // ----------------------------------------------------------------
  beforeEach(() => {
    // Reset mocks before each individual test to ensure a clean state.
    // This prevents data or call counts from one test leaking into another.
    mockRunAsync = jest.fn();
    mockGetAllAsync = jest.fn();

    // Configure the mock database object.
    // When the repository calls getDB(), it receives this object containing
    // our spied 'runAsync' and 'getAllAsync' methods.
    (getDB as unknown as jest.Mock).mockResolvedValue({
      runAsync: mockRunAsync,
      getAllAsync: mockGetAllAsync,
    });
  });

  // ----------------------------------------------------------------
  // UNIT TEST: READ OPERATION
  // ----------------------------------------------------------------
  test('getAll() should return a list of posts', async () => {
    // ARRANGE: Prepare the data we expect the database to return.
    const fakePosts = [{ id: 1, title: 'Test Post', author: 'Me' }];
    mockGetAllAsync.mockResolvedValue(fakePosts);

    // ACT: Call the repository method with specific pagination params.
    const result = await PostRepositorySql.getAll(10, 0);

    // ASSERT: Verify two things:
    // 1. The function returns exactly what the database gave it.
    // 2. The database was called with the correct SQL query and parameters.
    expect(result).toEqual(fakePosts);
    expect(mockGetAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('SELECT * FROM posts'), 
      [10, 0] // Limit 10, Offset 0
    );
  });

  // ----------------------------------------------------------------
  // UNIT TEST: WRITE OPERATION
  // ----------------------------------------------------------------
  test('create() should insert a post with correct values', async () => {
    // ARRANGE: Define the new post data to be inserted.
    const newPost = { title: 'New', author: 'Dave', description: 'Desc', image: null };

    // ACT: Call the create method.
    await PostRepositorySql.create(newPost);

    // ASSERT: Verify the persistence layer was invoked correctly.
    // We check that 'INSERT INTO' was called and that the parameters
    // match the values in our 'newPost' object.
    expect(mockRunAsync).toHaveBeenCalledTimes(1);
    expect(mockRunAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO posts'),
      expect.arrayContaining(['New', 'Dave', 'Desc', null])
    );
  });

  // ----------------------------------------------------------------
  // INTEGRATION TEST: PAGINATION LOGIC (LIMIT/OFFSET)
  // ----------------------------------------------------------------
  // This test simulates a user scrolling through an entire feed.
  // It verifies that the repository's 'getAll' method correctly handles
  // offsets to retrieve every single record without duplicates or gaps.
  test('Pagination Integration: Should load ALL posts exactly once', async () => {
    // 1. ARRANGE: Create a large dataset (55 posts).
    // The feed uses 'ORDER BY id DESC', so we generate IDs 55 down to 1.
    const totalPosts = 55;
    const pageSize = 20;
    const allFakePosts = Array.from({ length: totalPosts }, (_, i) => ({
      id: totalPosts - i, // 55, 54, 53...
      title: `Post ${totalPosts - i}`,
      author: 'Tester'
    }));

    // Mock the database behavior to act like a real SQL engine.
    // Instead of returning a static array, it dynamically slices the data
    // based on the LIMIT (params[0]) and OFFSET (params[1]) it receives.
    mockGetAllAsync.mockImplementation(async (query, params) => {
      const limit = params[0];
      const offset = params[1];
      return allFakePosts.slice(offset, offset + limit);
    });

    // 2. ACT: Simulate the Infinite Scroll Loop.
    // We keep calling 'getAll' and increasing the offset until no data remains.
    const fetchedPosts: any[] = [];
    let offset = 0;
    let keepFetching = true;

    while (keepFetching) {
      const batch = await PostRepositorySql.getAll(pageSize, offset);
      
      if (batch.length > 0) {
        fetchedPosts.push(...batch);
        offset += batch.length; // Advance the cursor by the number of items received
      } else {
        keepFetching = false; // Database returned empty, end of feed
      }
    }

    // 3. ASSERT: Mathematical Proof of Correctness.
    // If the pagination logic is correct, the length of 'fetchedPosts'
    // MUST equal the total number of records in the fake DB.
    expect(fetchedPosts.length).toBe(totalPosts);
    
    // Validate order: The first item fetched should be the newest (ID 55),
    // and the last item fetched should be the oldest (ID 1).
    expect(fetchedPosts[0].id).toBe(55); 
    expect(fetchedPosts[54].id).toBe(1); 
    
    // Verify Efficiency:
    // With 55 items and page size 20, we expect exactly 4 calls:
    // Call 1: Offset 0 (Gets 20)
    // Call 2: Offset 20 (Gets 20)
    // Call 3: Offset 40 (Gets 15)
    // Call 4: Offset 55 (Gets 0 -> Stops loop)
    expect(mockGetAllAsync).toHaveBeenCalledTimes(4);
  });
});