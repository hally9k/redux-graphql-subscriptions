module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
  modulePaths: ['<rootDir>/node_modules/'],
  roots: ['<rootDir>/src/'],
  testRegex: '(\\.(test|spec))\\.(ts|tsx)$',
  include: ['src/**/*'],
}
