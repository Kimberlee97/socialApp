import { PostRepositorySql } from '../src/database/PostRepositorySql';
import { getDB } from '../src/database/connection';

// 1. Mock the connection file
jest.mock('../src/database/connection', () => ({
  getDB: jest.fn(),
}));

describe('PostRepositorySql', () => {
  let mockRunAsync: jest.Mock;
  let mockGetAllAsync: jest.Mock;

  beforeEach(() => {
    // Reset mocks before each test
    mockRunAsync = jest.fn();
    mockGetAllAsync = jest.fn();

    // 🚨 THE FIX IS HERE: "Double Cast"
    // We convert it to 'unknown' first, then to 'jest.Mock'
    (getDB as unknown as jest.Mock).mockResolvedValue({
      runAsync: mockRunAsync,
      getAllAsync: mockGetAllAsync,
    });
  });

  test('getAll() should return a list of posts', async () => {
    // Arrange
    const fakePosts = [{ id: 1, title: 'Test Post', author: 'Me' }];
    mockGetAllAsync.mockResolvedValue(fakePosts);

    // Act
    const result = await PostRepositorySql.getAll(10, 0);

    // Assert
    expect(result).toEqual(fakePosts);
    expect(mockGetAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('SELECT * FROM posts'), 
      [10, 0]
    );
  });

  test('create() should insert a post with correct values', async () => {
    // Arrange
    const newPost = { title: 'New', author: 'Dave', description: 'Desc', image: null };

    // Act
    await PostRepositorySql.create(newPost);

    // Assert
    expect(mockRunAsync).toHaveBeenCalledTimes(1);
    expect(mockRunAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO posts'),
      expect.arrayContaining(['New', 'Dave', 'Desc', null])
    );
  });

  test('Pagination Integration: Should load ALL posts exactly once', async () => {
    // 1. ARRANGE: Create a fake DB with 55 posts (IDs 1 to 55)
    // We create them in reverse order (55 down to 1) to mimic "ORDER BY id DESC"
    const totalPosts = 55;
    const pageSize = 20;
    const allFakePosts = Array.from({ length: totalPosts }, (_, i) => ({
      id: totalPosts - i, // 55, 54, 53...
      title: `Post ${totalPosts - i}`,
      author: 'Tester'
    }));

    // Mock the db.getAllAsync function to simulate SQL LIMIT/OFFSET
    mockGetAllAsync.mockImplementation(async (query, params) => {
      // params[0] is LIMIT, params[1] is OFFSET
      const limit = params[0];
      const offset = params[1];
      
      // Simulate SQL: Return a slice of the array
      return allFakePosts.slice(offset, offset + limit);
    });

    // 2. ACT: Loop until we have fetched everything
    const fetchedPosts: any[] = [];
    let offset = 0;
    let keepFetching = true;

    while (keepFetching) {
      const batch = await PostRepositorySql.getAll(pageSize, offset);
      
      if (batch.length > 0) {
        fetchedPosts.push(...batch);
        offset += batch.length; // Move the cursor forward
      } else {
        keepFetching = false; // Stop when DB returns empty
      }
    }

    // 3. ASSERT: Did we get exactly 55 posts?
    expect(fetchedPosts.length).toBe(totalPosts);
    
    // Check the first and last ID to ensure order is correct
    expect(fetchedPosts[0].id).toBe(55); // Newest
    expect(fetchedPosts[54].id).toBe(1); // Oldest
    
    // Check that we made exactly 3 calls (20 + 20 + 15 items)
    // Call 1 (Offset 0), Call 2 (Offset 20), Call 3 (Offset 40), Call 4 (Offset 55 -> Empty)
    expect(mockGetAllAsync).toHaveBeenCalledTimes(4);
  });

  test('Pagination Loop: Should eventually load ALL posts', async () => {
    // 1. ARRANGE: Create 65 fake posts
    const totalPosts = 65;
    const pageSize = 20;
    const allFakePosts = Array.from({ length: totalPosts }, (_, i) => ({
      id: i, title: `Post ${i}`, author: 'Test'
    }));

    // Mock logic: return slice of array based on limit/offset
    mockGetAllAsync.mockImplementation(async (sql, params) => {
      // Handle the "COUNT" query
      if (sql.includes('COUNT')) return [{ c: totalPosts }]; 
      
      const limit = params[0];
      const offset = params[1];
      return allFakePosts.slice(offset, offset + limit);
    });

    // 2. ACT: Simulate scrolling
    let loadedPosts: any[] = [];
    let currentOffset = 0;
    let keepLoading = true;

    while (keepLoading) {
      const batch = await PostRepositorySql.getAll(pageSize, currentOffset);
      
      if (batch.length === 0) {
        keepLoading = false;
      } else {
        loadedPosts = [...loadedPosts, ...batch];
        currentOffset += batch.length;
      }
    }

    // 3. ASSERT
    expect(loadedPosts.length).toBe(totalPosts); // Must match exactly
    expect(loadedPosts[0]).toEqual(allFakePosts[0]); // First one correct
    expect(loadedPosts[64]).toEqual(allFakePosts[64]); // Last one correct
  });
});