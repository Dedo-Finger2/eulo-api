// jest.config.mjs
import { defaults } from 'jest-config';

/** @type {import('jest').Config} */
const config = {
  coverageProvider: 'v8',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest',
  },
  testEnvironment: 'node',
  moduleFileExtensions: [...defaults.moduleFileExtensions, 'js', 'jsx'],
  transformIgnorePatterns: [
    '/node_modules/(?!(module-to-transform)/)',
  ],
};

export default config;
