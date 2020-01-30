module.exports = {
  browser: true,
  collectCoverageFrom: ['src/**/*.*'],
  coverageReporters: ['lcov', 'cobertura'],
  modulePathIgnorePatterns: ['<rootDir>/bin'],
  reporters: ['default', 'jest-junit'],
  testRunner: 'jest-circus/runner',
};
