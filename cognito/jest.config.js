// jest.config.js
module.exports = {
  preset: 'ts-jest/presets/default',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  roots: ['<rootDir>/src/auth'],
  moduleFileExtensions: ['ts','tsx','js','json'],
  transform: {
    '^.+\\.[tj]sx?$': 'ts-jest',
  },
  globals: {
      'ts-jest': {
      tsconfig: 'tsconfig.json',
    }
  },
  moduleNameMapper: {
    '\\.(png|jpe?g|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js',
    '^expo-secure-store$': '<rootDir>/src/auth/utils/__mocks__/expo-secure-store.ts',
    '^expo-constants$': '<rootDir>/src/auth/utils/__mocks__/expo-constants.ts',
    '^react-native/Libraries/Utilities/codegenNativeComponent$': '<rootDir>/__mocks__/react-native-codegenNativeComponent.js',
    '^react-native$': 'react-native-web',
  },
  // ensure any other node_modules (e.g. buffer) still get transformed by ts-jest
  transformIgnorePatterns: [
    '/node_modules/(?!(buffer|@react-navigation|react-native-screens|react-native-safe-area-context|react-native-gesture-handler)/)',
  ],
}
