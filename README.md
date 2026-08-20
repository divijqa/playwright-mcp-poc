# Playwright MCP Self-Healing BDD Framework (POC)

An enterprise-ready, programmatic Proof of Concept (POC) demonstrating **Autonomous Self-Healing Web Automation**. This framework replaces traditional, brittle CSS/XPath locator paradigms with dynamic runtime layout analysis.

## Overview

This POC combines Cucumber, Playwright, and the Model Context Protocol (MCP) to inspect a live page's accessibility tree and route automation based on the detected page state.

## Architecture

```text
[ Gherkin `.feature` ] ──► [ TypeScript Step Definitions ]
                                  │
                       (If Selector Fails / Times Out)
                                  ▼
                         [ Playwright MCP Server ]
                         Extracts Accessibility Tree Nodes
                                  │
                                  ▼
                          [ MCP-Based State Analyzer ]
                          Classifies Page State for Test Routing
```

The runtime flow is:

1. Cucumber loads the Gherkin feature and TypeScript step definitions.
2. Playwright opens the target page and performs the initial navigation.
3. The MCP evaluator requests an accessibility-tree snapshot from the Playwright MCP server.
4. The state dispatcher classifies the page and selects the appropriate recovery or verification path.

## Features

- **Microsoft Playwright MCP:** Uses the official `@playwright/mcp` server over a local stdio transport from the TypeScript evaluator.
- **Token-Efficient Inspections:** Leverages the webpage's **Semantic Accessibility Tree** rather than dense HTML string splits or coordinate-based image vision models.
- **Dynamic State Dispatcher:** Built specifically to navigate complex enterprise edge cases: flaky redirect routing URLs, application auto-refreshes, and variably ordered data lists.
- **Programmatic Execution:** Integrates MCP inspection with Cucumber and Playwright step definitions for repeatable CI/CD workflows.

## Tech Stack

| Area | Technology |
| --- | --- |
| Language | TypeScript |
| BDD framework | Cucumber JS with Gherkin syntax |
| Execution interface | Model Context Protocol TypeScript SDK |
| Automation engine | Playwright Test |

## Repository Structure

```text
playwright-mcp-poc/
├── features/
│   ├── proposals.feature
│   └── step_definitions/
│       └── proposals.steps.ts
├── scripts/
│   └── mcp-evaluator.ts
├── cucumber.js
├── package.json
└── tsconfig.json
```

## Getting Started

### Prerequisites

- Node.js and npm
- A Chromium installation managed by Playwright
- Network access to download the Playwright MCP package through `npx`

### Install

```bash
git clone https://github.com/<your-account>/playwright-mcp-poc.git
cd playwright-mcp-poc
npm install
```

## Commands

### Run the Test Suite

```bash
npx cucumber-js
```

The scenario launches Playwright in headed mode, navigates to the target page, invokes the Microsoft Playwright MCP accessibility snapshot analyzer, and verifies the target proposal when the dynamic dashboard state is detected.

### Validate Feature Discovery

Use Cucumber's dry-run mode to verify feature discovery and step-definition loading without executing hooks or steps:

```bash
npx cucumber-js --dry-run
```

### Type-check the Project

```bash
npx tsc --noEmit --pretty false
```

## Roadmap

- **v1 (Current):** Playwright MCP accessibility-tree inspection with Cucumber and Playwright state routing.
- **v2:** Add explicit MCP middleware for security controls and PII redaction.
- **v3:** Add closed-loop locator recovery with compiler verification and test-safe file updates.
# playwright-mcp-poc
