// src/auth/utils/tokenStorage.test.ts

// 1) Always mock SecureStore
jest.mock('expo-secure-store', () => {
  const memory: Record<string,string> = {};
  return {
    setItemAsync:    async (k:string, v:string) => { memory[k] = v; },
    getItemAsync:    async (k:string)     => memory[k] ?? null,
    deleteItemAsync: async (k:string)     => { delete memory[k]; },
    ALWAYS_THIS_DEVICE_ONLY: 'ALWAYS_THIS_DEVICE_ONLY',
  };
});

const scenarios = [
  { name: 'web',    os: 'web' },
  { name: 'native', os: 'ios' },
];

describe.each(scenarios)('tokenStorage (%s)', ({ os }) => {
  let storeTokens: typeof import('./tokenStorage').storeTokens;
  let getTokens:   typeof import('./tokenStorage').getTokens;
  let clearTokens: typeof import('./tokenStorage').clearTokens;
  let TOKEN_KEY:   typeof import('./tokenStorage').TOKEN_KEY;

  beforeEach(() => {
    jest.resetModules();

    // 2) Mock only what we need from react-native:
    jest.doMock('react-native', () => ({
      Platform: { OS: os }
    }));

    // 3) Now require under those mocks
    const mod = require('./tokenStorage');
    storeTokens = mod.storeTokens;
    getTokens   = mod.getTokens;
    clearTokens = mod.clearTokens;
    TOKEN_KEY   = mod.TOKEN_KEY;
  });

  afterEach(async () => {
    await clearTokens();
    if (os === 'web') localStorage.clear();
  });

  it('stores & retrieves tokens', async () => {
    const sample = {
      accessToken:  'a1',
      idToken:      'i1',
      refreshToken: 'r1',
      expiresIn:    1000,
      fetchedAt:    Date.now(),
    };

    await storeTokens(sample);
    const loaded = await getTokens();
    expect(loaded).toMatchObject(sample);

    if (os === 'web') {
      expect(localStorage.getItem(TOKEN_KEY)).toBeTruthy();
    }
  });

  it('clears tokens', async () => {
    const sample = {
      accessToken:  'x',
      idToken:      'y',
      refreshToken: 'z',
      expiresIn:    500,
      fetchedAt:    Date.now(),
    };

    await storeTokens(sample);
    await clearTokens();
    expect(await getTokens()).toBeNull();

    if (os === 'web') {
      expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    }
  });
});
