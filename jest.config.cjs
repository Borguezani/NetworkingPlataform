module.exports = {
  preset: 'ts-jest',
  // Use 'node' by default for server-side integration tests. Switch to 'jsdom' when running UI/browser tests.
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.(spec|test).[jt]s?(x)'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: 'tsconfig.json' }]
  },
}
