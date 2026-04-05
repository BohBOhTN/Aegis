import type { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    clearMocks: true,
    setupFilesAfterEnv: ['<rootDir>/src/utils/prisma.mock.ts'],
    modulePathIgnorePatterns: ['<rootDir>/dist/'],
    testMatch: ['**/*.test.ts'],
};

export default config;
