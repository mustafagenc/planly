const commitlintConfig = {
	extends: ['@commitlint/config-conventional'],
	rules: {
		'type-enum': [
			2,
			'always',
			[
				'feat', // New feature
				'fix', // Bug fix
				'docs', // Documentation changes
				'style', // Code style changes (formatting, etc)
				'refactor', // Code refactoring
				'perf', // Performance improvements
				'test', // Adding or updating tests
				'chore', // Maintenance tasks
				'ci', // CI/CD changes
				'build', // Build system changes
				'revert', // Revert previous commit
			],
		],
		'scope-enum': [2, 'always', ['app', 'scripts', 'auth']],
		'subject-case': [2, 'always', 'sentence-case'],
		'body-max-line-length': [2, 'always', 180],
	},
};

export default commitlintConfig;
