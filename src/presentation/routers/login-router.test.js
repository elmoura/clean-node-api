class LoginRouter {
  route (httpRequest) {
    if (!httpRequest.body.email) {
      return { statusCode: 400 }
    }
  }
}

describe('Login Router', () => {
  test('Should return 400 if no e-mail is provided', () => {
    const SYSTEM_UNDER_TEST = new LoginRouter()

    const httpRequest = {
      body: {
        password: 'any_password'
      }
    }

    const httpResponse = SYSTEM_UNDER_TEST.route(httpRequest)

    expect(httpResponse.statusCode).toBe(400)
  })
})
