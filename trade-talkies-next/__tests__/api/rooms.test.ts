import { createMocks } from 'node-mocks-http';
import { GET } from '@/app/api/rooms/route';

describe('/api/rooms', () => {
  it('returns a list of rooms', async () => {
    const { req } = createMocks({
      method: 'GET',
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
  });
});
