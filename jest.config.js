module.exports = {
  browser: true,
  collectCoverageFrom: ['src/**/*.*'],
  coverageReporters: ['lcov', 'cobertura'],
  reporters: ['default', 'jest-junit'],
  testRunner: 'jest-circus/runner',
};
