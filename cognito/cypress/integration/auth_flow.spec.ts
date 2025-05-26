// cypress/integration/auth_flow.spec.ts
const fakeTokens = {
  accessToken:  'fake',
  idToken:      'eyJhbGciOiJub25lIn0.eyJlbWFpbCI6ImV2ZU BleGFtcGxlLmNvbSJ9.',
  refreshToken: 'fake',
  expiresIn:    3600,
  fetchedAt:    Date.now(),
}

describe('Full auth flow', () => {
  beforeEach(() => {
    cy.intercept('POST', '**/refresh', {
      statusCode: 200,
      body: {
        access_token:  fakeTokens.accessToken,
        id_token:      fakeTokens.idToken,
        refresh_token: fakeTokens.refreshToken,
        expires_in:    fakeTokens.expiresIn
      }
    })
    cy.clearLocalStorage()
  })

  it('redirects to Auth when not signed in', () => {
    cy.visit('/')
    // you’ll almost certainly never catch Splash on web,
    // so just assert you end up at Auth
    cy.get('[data-testid="Auth-root"]', { timeout: 10_000 })
      .should('exist')
  })

  it('can fake a logged-in user via localStorage and go straight to Home', () => {
    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.setItem(
          'auth_tokens', 
          JSON.stringify(fakeTokens)
        )
      }
    })
    cy.get('[data-testid="Home-root"]', { timeout: 10_000 })
      .should('exist')
  })

  it('launches the Hosted-UI login when you click "Log in"', () => {
    cy.intercept('GET', '**/oauth2/authorize**').as('authorize')

    cy.visit('/')            // mount your app
    cy.get('[data-testid="Auth-root"]').click()

    // now confirm that clicking “Log in” really did kick off a GET to Cognito’s /authorize
    cy.wait('@authorize').its('request.url')
      .should('match', /^https:\/\/dev-khatoon-cuisine\.auth\.us-east-2\.amazoncognito\.com\/oauth2\/authorize\?/)
  })

  it('can log out from Home', () => {
    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.setItem(
          'auth_tokens',
          JSON.stringify(fakeTokens)
        )
      }
    })
    // now we should be on Home already
    cy.get('[data-testid="Home-root"]').should('exist')

    cy.get('button').contains('Sign Out').click()
    // gives the logout flow a second to round-trip
    cy.get('[data-testid="Auth-root"]', { timeout: 10_000 })
  })
})
