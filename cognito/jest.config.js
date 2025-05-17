// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src/auth'],
  moduleFileExtensions: ['ts','tsx','js','json'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  globals: {
      'ts-jest': {
      tsconfig: 'tsconfig.json',
    }
  },
  moduleNameMapper: {
    '^expo-secure-store$': '<rootDir>/src/auth/utils/__mocks__/expo-secure-store.ts',
    '^expo-constants$':    '<rootDir>/src/auth/utils/__mocks__/expo-constants.ts',
  },
  // ensure any other node_modules (e.g. buffer) still get transformed by ts-jest
  transformIgnorePatterns: [
    'node_modules/(?!(buffer)/)',
  ],
}
