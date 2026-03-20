# Jeremy & Joanna's Wedding

Digital wedding invitation (e-kad) for Jeremy Chee & Joanna Tong.

**Date:** 20 September 2026 (Sunday)
**Venue:** M Resort & Hotel Kuala Lumpur

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v20+
- [pnpm](https://pnpm.io/) v10+
- [AWS CLI v2](https://aws.amazon.com/cli/) (for deployment)

### Setup

```bash
git clone https://github.com/thomassaw/jeremy-and-joanna-wedding.git
cd jeremy-and-joanna-wedding
pnpm install
```

### Development

```bash
pnpm dev
```

Open http://localhost:3000

### Build

```bash
pnpm build
```

## Tech Stack

- **Frontend:** React 19 + Vite 8 + TypeScript 5
- **Styling:** Plain CSS with CSS custom properties
- **Monorepo:** pnpm workspaces
- **Infra:** AWS CDK (TBD)
- **Backend:** AWS Lambda + DynamoDB (TBD)
