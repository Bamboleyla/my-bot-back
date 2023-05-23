/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  roots: ["<rootDir>/src"],
  collectCoverageFrom: ["src/**/*.{js,ts}", "!src/**/*.d.ts"],
  preset: "ts-jest",
  testEnvironment: "node",
};
