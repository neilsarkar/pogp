module.exports = {
	transform: {'^.+\\.ts?$': 'ts-jest'},
  testEnvironment: 'node',
  testRegex: '/test/.*\\.(test|spec)?\\.(ts|tsx)$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  // https://github.com/facebook/jest/issues/11617
  // https://github.com/facebook/jest/issues/8202
  maxWorkers: 1,
}