declare const module: { exports: unknown };
declare const require: (moduleName: string) => any;

const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
const { StdioClientTransport } = require('@modelcontextprotocol/sdk/client/stdio.js');

async function analyzeLivePageState() {
	const transport = new StdioClientTransport({
		command: 'npx',
		args: ['-y', '@playwright/mcp@latest'],
	});

	const mcpClient = new Client({ name: 'BDD-Dynamic-Healer', version: '1.0' });
	await mcpClient.connect(transport);

	const snapshot = await mcpClient.callTool({ name: 'browser_snapshot' }) as {
		content: Array<{ type?: string; text?: string }>;
	};
	const pageTreeText = snapshot.content
		.filter((content) => content.type === 'text' && content.text !== undefined)
		.map((content) => content.text)
		.join('\n');

	if (pageTreeText.includes('Internal Server Error') || pageTreeText.includes('error-container')) {
		return { status: 'ERROR_STATE', payload: pageTreeText };
	}

	if (pageTreeText.includes('What needs to be done?') || pageTreeText.includes('todos')) {
		return { status: 'DYNAMIC_PROPOSALS_DASHBOARD', payload: pageTreeText };
	}

	return { status: 'UNKNOWN_STATE', payload: pageTreeText };
}

module.exports = { analyzeLivePageState };
