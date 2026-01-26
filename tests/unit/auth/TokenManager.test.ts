import nock from 'nock';
import { TokenManager } from '../../../src/auth/TokenManager';
import { AuthenticationError } from '../../../src/core/errors';

describe('TokenManager', () => {
  const baseUrl = 'https://api.greeninvoice.co.il/api/v1';
  const apiKeyId = 'test-key';
  const apiKeySecret = 'test-secret';

  beforeEach(() => {
    nock.cleanAll();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('should fetch token successfully', async () => {
    nock(baseUrl)
      .post('/account/token', { id: apiKeyId, secret: apiKeySecret })
      .reply(200, { token: 'test-jwt-token' });

    const tokenManager = new TokenManager({
      apiKeyId,
      apiKeySecret,
      baseUrl,
    });

    const token = await tokenManager.getToken();
    expect(token).toBe('test-jwt-token');
  });

  it('should cache token and reuse it', async () => {
    nock(baseUrl)
      .post('/account/token')
      .once()
      .reply(200, { token: 'test-jwt-token' });

    const tokenManager = new TokenManager({
      apiKeyId,
      apiKeySecret,
      baseUrl,
    });

    const token1 = await tokenManager.getToken();
    const token2 = await tokenManager.getToken();

    expect(token1).toBe('test-jwt-token');
    expect(token2).toBe('test-jwt-token');
    expect(nock.isDone()).toBe(true); // Only one request should be made
  });

  it('should throw AuthenticationError on 401', async () => {
    nock(baseUrl)
      .post('/account/token')
      .reply(401, { message: 'Invalid credentials' });

    const tokenManager = new TokenManager({
      apiKeyId,
      apiKeySecret,
      baseUrl,
    });

    await expect(tokenManager.getToken()).rejects.toThrow(AuthenticationError);
  });

  it('should handle missing token in response', async () => {
    nock(baseUrl)
      .post('/account/token')
      .reply(200, {});

    const tokenManager = new TokenManager({
      apiKeyId,
      apiKeySecret,
      baseUrl,
    });

    await expect(tokenManager.getToken()).rejects.toThrow(AuthenticationError);
  });

  it('should clear token on clearToken()', async () => {
    nock(baseUrl)
      .post('/account/token')
      .times(2)
      .reply(200, { token: 'test-jwt-token' });

    const tokenManager = new TokenManager({
      apiKeyId,
      apiKeySecret,
      baseUrl,
    });

    await tokenManager.getToken();
    tokenManager.clearToken();

    // Should fetch new token after clear
    await tokenManager.getToken();

    expect(nock.isDone()).toBe(true); // Two requests should be made
  });

  it('should handle concurrent token fetches', async () => {
    nock(baseUrl)
      .post('/account/token')
      .once()
      .reply(200, { token: 'test-jwt-token' });

    const tokenManager = new TokenManager({
      apiKeyId,
      apiKeySecret,
      baseUrl,
    });

    // Simulate concurrent requests
    const [token1, token2, token3] = await Promise.all([
      tokenManager.getToken(),
      tokenManager.getToken(),
      tokenManager.getToken(),
    ]);

    expect(token1).toBe('test-jwt-token');
    expect(token2).toBe('test-jwt-token');
    expect(token3).toBe('test-jwt-token');
    expect(nock.isDone()).toBe(true); // Only one request should be made
  });
});
