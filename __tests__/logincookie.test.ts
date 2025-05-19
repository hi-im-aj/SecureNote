import { createTestDatabase, mockNextRequest } from "../utils/testutil";
import { POST } from "../src/app/api/login/route";

jest.mock("next/server", () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn((data, init) => ({
      ...init,
      json: async () => data,
      cookies: {
        set: jest.fn((name, value, options) => ({
          name,
          value,
          ...options,
        })),
        get: jest.fn(),
      },
    })),
  },
}));

describe("POST /api/login", () => {
  let db;

  beforeEach(() => {
    db = createTestDatabase();
    db.prepare("INSERT INTO users (username, password) VALUES (?, ?)").run("testuser", "password");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 on invalid credentials", async () => {
    const req = mockNextRequest({
      method: "POST",
      json: { username: "testuser", password: "wrong" },
    });

    const response = await POST(req);
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json).toEqual({ error: "Invalid credentials" });
    expect(response.cookies.set).not.toHaveBeenCalled();
  });
});
