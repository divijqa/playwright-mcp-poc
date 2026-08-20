declare const module: { exports: unknown };
declare const require: (moduleName: string) => any;

const { execFileSync } = require('node:child_process') as {
	execFileSync: (file: string, args: string[], options?: {
		cwd?: string;
		encoding?: 'utf8';
		stdio?: 'inherit' | 'pipe';
	}) => string;
};
const { basename, relative, resolve } = require('node:path') as {
	basename: (path: string) => string;
	relative: (from: string, to: string) => string;
	resolve: (...paths: string[]) => string;
};

interface SelfHealingOptions {
	files: string[];
	branchName: string;
	commitMessage: string;
	pullRequestTitle?: string;
	pullRequestBody?: string;
}

interface PullRequestResponse {
	html_url: string;
}

const repositoryRoot = resolve(__dirname, '..');

function runGit(args: string[]): string {
	return execFileSync('git', args, { encoding: 'utf8' }).trim();
}

function runValidation(): void {
	execFileSync('npx', ['tsc', '--noEmit', '--pretty', 'false'], {
		cwd: repositoryRoot,
		stdio: 'inherit',
	});
	execFileSync('npx', ['cucumber-js'], {
		cwd: repositoryRoot,
		stdio: 'inherit',
	});
}

function validateFiles(files: string[]): void {
	for (const file of files) {
		const relativePath = relative(repositoryRoot, resolve(repositoryRoot, file));
		if (!relativePath.startsWith('features/step_definitions/') || relativePath.includes('..')) {
			throw new Error(`Self-healing is restricted to feature step definitions: ${file}`);
		}
	}
}

function validateBranchName(branchName: string): void {
	if (!/^fix\/auto-heal-[a-z0-9-]+$/.test(branchName)) {
		throw new Error('Branch names must match fix/auto-heal-<description>.');
	}
}

function getRepositorySlug(): string {
	const configuredRepository = process.env.GITHUB_REPOSITORY;
	if (configuredRepository) {
		return configuredRepository;
	}

	const remote = runGit(['remote', 'get-url', 'origin']);
	const match = remote.match(/github\.com[/:]([^/]+\/[^/.]+)(?:\.git)?$/);
	if (!match) {
		throw new Error('Set GITHUB_REPOSITORY or configure an origin GitHub remote.');
	}
	const repository = match[1];
	if (!repository) {
		throw new Error('Unable to determine the GitHub repository from origin.');
	}
	return repository;
}

async function createPullRequest(options: SelfHealingOptions): Promise<string | undefined> {
	const token = process.env.GITHUB_TOKEN;
	if (!token) {
		return undefined;
	}

	const repository = getRepositorySlug();
	const response = await fetch(`https://api.github.com/repos/${repository}/pulls`, {
		method: 'POST',
		headers: {
			Accept: 'application/vnd.github+json',
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json',
			'X-GitHub-Api-Version': '2022-11-28',
		},
		body: JSON.stringify({
			title: options.pullRequestTitle ?? options.commitMessage,
			body: options.pullRequestBody ?? 'Automated self-healing change. Please review before merging.',
			head: options.branchName,
			base: process.env.GITHUB_BASE_REF ?? 'main',
		}),
	});

	if (!response.ok) {
		throw new Error(`GitHub pull request creation failed: ${response.status} ${await response.text()}`);
	}

	const pullRequest = await response.json() as PullRequestResponse;
	return pullRequest.html_url;
}

async function publishSelfHealingChange(options: SelfHealingOptions): Promise<string | undefined> {
	validateBranchName(options.branchName);
	validateFiles(options.files);

	if (options.files.length === 0) {
		throw new Error('At least one changed step-definition file is required.');
	}

	runGit(['checkout', '-b', options.branchName]);
	runGit(['add', '--', ...options.files]);

	try {
		runGit(['diff', '--cached', '--quiet']);
		throw new Error('No staged self-healing changes were found.');
	} catch (error) {
		if (error instanceof Error && error.message.includes('No staged self-healing changes')) {
			throw error;
		}
	}

	runValidation();
	runGit(['commit', '-m', options.commitMessage]);
	runGit(['push', '--set-upstream', 'origin', options.branchName]);

	return createPullRequest(options);
}

module.exports = { publishSelfHealingChange };

async function main(): Promise<void> {
	const files = (process.env.SELF_HEAL_FILES ?? '').split(',').map((file) => file.trim()).filter(Boolean);
	const branchName = process.env.SELF_HEAL_BRANCH;
	const commitMessage = process.env.SELF_HEAL_COMMIT_MESSAGE ?? 'fix: self-heal dynamic locator';

	if (!branchName) {
		throw new Error('Set SELF_HEAL_BRANCH before running the self-healer.');
	}

	const pullRequestUrl = await publishSelfHealingChange({ files, branchName, commitMessage });
	console.log(pullRequestUrl ? `Pull request created: ${pullRequestUrl}` : 'Branch pushed. Set GITHUB_TOKEN to create a pull request.');
}

if (basename(process.argv[1] ?? '') === 'self-healer.ts') {
	main().catch((error: unknown) => {
		console.error(error instanceof Error ? error.message : error);
		process.exitCode = 1;
	});
}
