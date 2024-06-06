// jest.config.mjs
import { defaults } from 'jest-config';

/** @type {import('jest').Config} */
const config = {
  coverageProvider: 'v8',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest', // Transforma arquivos .js, .jsx, .ts, .tsx usando babel-jest
  },
  testEnvironment: 'node',
  moduleFileExtensions: [...defaults.moduleFileExtensions, 'js', 'jsx', 'ts', 'tsx'],
  transformIgnorePatterns: [
    '/node_modules/(?!(module-to-transform)/)',
  ],
  // extensionsToTreatAsEsm: ['.js', '.jsx', '.ts', '.tsx'],
  setupFiles: ['./jest.setup.js'],
};

export default config;
