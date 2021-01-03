const validator = require('validator')

const EmailValidator = require('./email-validator')

const makeSystemUnderTest = () => {
  return new EmailValidator()
}

describe('Email Validator', () => {
  test('Should return true if validator returns true', () => {
    const systemUnderTest = makeSystemUnderTest()

    const isEmailValid = systemUnderTest.isValid('valid_email@email.com')

    expect(isEmailValid).toBe(true)
  })

  test('Should return false if validator returns false', () => {
    validator.isEmailValid = false
    const systemUnderTest = makeSystemUnderTest()

    const isEmailValid = systemUnderTest.isValid('invalid_email.com')

    expect(isEmailValid).toBe(false)
  })

  test('Should call validator with correct email', () => {
    const systemUnderTest = makeSystemUnderTest()

    const testEmail = 'any_email@email.com'
    systemUnderTest.isValid(testEmail)

    expect(validator.email).toBe(testEmail)
  })
})
