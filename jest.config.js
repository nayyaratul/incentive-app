module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.jsx?$': 'babel-jest'
  },
  moduleNameMapper: {
    '\\.(scss|sass|css)$': 'identity-obj-proxy'
  },
  testMatch: ['**/?(*.)+(test|spec).[jt]s?(x)'],
  collectCoverageFrom: ['src/**/*.{js,jsx}', '!src/index.js']
};
