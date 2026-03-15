import { formatPhoneKZ, normalizePhoneKZ } from '../i18n/LanguageContext'

describe('formatPhoneKZ', () => {
  test('formats 10 digit number starting with 7', () => {
    expect(formatPhoneKZ('7001234567')).toBe('+7 (001) 234-56-67')
  })

  test('formats 11 digit number starting with 8', () => {
    expect(formatPhoneKZ('87001234567')).toBe('+7 (700) 123-45-67')
  })

  test('formats number with +7 prefix', () => {
    expect(formatPhoneKZ('+77001234567')).toBe('+7 (700) 123-45-67')
  })

  test('handles empty string', () => {
    expect(formatPhoneKZ('')).toBe('')
  })

  test('handles partial number - 3 digits', () => {
    expect(formatPhoneKZ('700')).toBe('+7 (00')
  })

  test('handles partial number - 6 digits', () => {
    expect(formatPhoneKZ('700123')).toBe('+7 (001) 23')
  })

  test('handles partial number - 8 digits', () => {
    expect(formatPhoneKZ('70012345')).toBe('+7 (001) 234-5')
  })

  test('strips non-digit characters', () => {
    expect(formatPhoneKZ('7 (001) 234-56-67')).toBe('+7 (001) 234-56-67')
  })
})

describe('normalizePhoneKZ', () => {
  test('converts 8 prefix to 7', () => {
    expect(normalizePhoneKZ('87001234567')).toBe('77001234567')
  })

  test('keeps 7 prefix as is', () => {
    expect(normalizePhoneKZ('77001234567')).toBe('77001234567')
  })

  test('adds 7 prefix to 10 digit number', () => {
    expect(normalizePhoneKZ('7001234567')).toBe('77001234567')
  })

  test('handles number with special characters', () => {
    expect(normalizePhoneKZ('+7 (700) 123-45-67')).toBe('77001234567')
  })

  test('handles empty string', () => {
    expect(normalizePhoneKZ('')).toBe('')
  })
})
