import type { ChromiumBrowser, Page } from '@playwright/test';

declare const require: (moduleName: string) => any;

const { Given, Then, When, Before, After, setDefaultTimeout } = require('@cucumber/cucumber');
const { chromium, expect } = require('@playwright/test');
const { analyzeLivePageState } = require('../../scripts/mcp-evaluator');

setDefaultTimeout(60_000);

let browser: ChromiumBrowser;
let page: Page;
const targetUrl = 'https://demo.playwright.dev/todomvc/';

Before(async function () {
	browser = await chromium.launch({ headless: process.env.CI !== 'true' });
	page = await browser.newPage();
});

Given('the user navigates to the login gateway', async function () {
	await page.goto(targetUrl);
});

When('the user authenticates and handles the dynamic landing state', async function () {
	console.log('[POC] Executing live browser snapshot analysis via MCP...');
	const pageState = await analyzeLivePageState(targetUrl);

	if (pageState.status === 'ERROR_STATE') {
		console.error('[HEAL] Detected a system failure routing block. Forcing a refresh...');
		await page.reload();
	}

	if (pageState.status === 'DYNAMIC_PROPOSALS_DASHBOARD') {
		console.log('[HEAL] Dashboard recognized. Injecting dynamic data values into fields...');
		const proposalInput = page.getByPlaceholder('What needs to be done?');
		await proposalInput.fill('Proposal #4820 - Premium Enterprise Tier');
		await proposalInput.press('Enter');
	}
});

Then('the target proposal should be successfully verified', async function () {
	const targetCard = page.getByText('Proposal #4820 - Premium Enterprise Tier');
	await expect(targetCard).toBeVisible();
	console.log('[SUCCESS] POC Verification complete. Test passed smoothly.');
});

After(async function () {
	await browser.close();
});
