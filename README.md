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
│   ├── mcp-evaluator.ts
│   └── self-healer.ts
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

## Automated Self-Healing Pull Requests

The optional self-healer publishes a validated change to a dedicated branch and can open a pull request through the GitHub API. It is deliberately separate from the normal test command: Cucumber does not create branches, commit files, or push code automatically.

The workflow is:

1. A healer updates an approved step-definition file.
2. The self-healer stages only files under `features/step_definitions/`.
3. It creates a branch matching `fix/auto-heal-<description>`.
4. It commits and pushes the branch to `origin`.
5. When `GITHUB_TOKEN` is available, it creates a GitHub pull request targeting `main`.

Run it only after reviewing the generated change:

```bash
SELF_HEAL_FILES=features/step_definitions/proposals.steps.ts \
SELF_HEAL_BRANCH=fix/auto-heal-proposal-grid \
SELF_HEAL_COMMIT_MESSAGE="fix: self-heal dynamic locator for proposal cards" \
npm run self-heal
```

To create the pull request, provide a token with the minimum required repository permissions:

```bash
GITHUB_TOKEN=your-token \
SELF_HEAL_FILES=features/step_definitions/proposals.steps.ts \
SELF_HEAL_BRANCH=fix/auto-heal-proposal-grid \
npm run self-heal
```

The command refuses files outside `features/step_definitions/` and refuses branch names that do not use the `fix/auto-heal-*` convention. Review the resulting pull request before merging.

## Roadmap

- **v1 (Current):** Playwright MCP accessibility-tree inspection with Cucumber and Playwright state routing.
- **v2:** Add explicit MCP middleware for security controls and PII redaction.
- **v3:** Add closed-loop locator recovery with compiler verification and test-safe file updates.
# playwright-mcp-poc
