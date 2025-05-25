// src/auth/utils/urls.test.ts
import { buildAuthorizeUrl, buildLogoutUrl, OAuth2Config } from './urls';

const cfg: OAuth2Config = {
  domain:     'dev-xyz.auth.us-east-2.amazoncognito.com',
  clientId:   'CLIENT123',
  redirectUri:'https://app.example.com/redirect',
};

describe('buildAuthorizeUrl()', () => {
  it('includes all the right query params', () => {
    const url = buildAuthorizeUrl(cfg, 'CHALLENGE123');
    const parts = new URL(url);
    expect(parts.origin).toBe('https://dev-xyz.auth.us-east-2.amazoncognito.com');
    expect(parts.pathname).toBe('/oauth2/authorize');

    const qp = parts.searchParams;
    expect(qp.get('response_type')).toBe('code');
    expect(qp.get('client_id')).toBe(cfg.clientId);
    expect(qp.get('redirect_uri')).toBe(cfg.redirectUri);
    expect(qp.get('code_challenge')).toBe('CHALLENGE123');
    expect(qp.get('code_challenge_method')).toBe('S256');
    expect(qp.get('scope')).toBe('openid email profile');
  });
});

describe('buildLogoutUrl()', () => {
  it('builds the correct logout URL', () => {
    const url = buildLogoutUrl(cfg);
    const parts = new URL(url);
    expect(parts.origin).toBe('https://dev-xyz.auth.us-east-2.amazoncognito.com');
    expect(parts.pathname).toBe('/logout');

    const qp = parts.searchParams;
    expect(qp.get('client_id')).toBe(cfg.clientId);
    expect(qp.get('logout_uri')).toBe(cfg.redirectUri);
  });
});
