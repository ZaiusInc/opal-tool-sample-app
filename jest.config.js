const {defaults} = require('jest-config');

process.env.ZAIUS_ENV = 'test';

require('dotenv').config({path: `.env.test`});

module.exports = {
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  roots: ['./src'],
  testRegex: "\\.test\\.ts$",
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  moduleFileExtensions: [
    ...defaults.moduleFileExtensions,
    'ts'
  ],
  verbose: true,
  collectCoverageFrom: ['src/**/*.ts', '!src/test/**/*', '!src/**/index.ts'],
  testEnvironment: 'node'
};
