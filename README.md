# Eagle1 Whereis Frontend UI

## What

A lightweight user interface that allows you to track shipments using the [Eagle1 Whereis API backend](https://github.com/eagle1-sys/whereis-api-v0/). Currently, two carriers are supported:
1. FedEx (fdx)
2. SF Express (sfex)

## How

Built with [Fresh](https://fresh.deno.dev/) and [Deno](https://deno.com/), deployable to Cloudflare Workers.

## Prerequisites

Before you begin, make sure you have the following installed:

- **Deno**: Install from [docs.deno.com/runtime/getting_started/installation](https://docs.deno.com/runtime/getting_started/installation)
- **Node.js** (for Wrangler CLI): Install from [nodejs.org](https://nodejs.org/)
- **Wrangler CLI** (for deployment): Install with `npm install -g wrangler`

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/eagle1-sys/whereis-ui-v0.git
cd whereis-ui-v0
```

### 2. Set Environment Variables

Create a `.env` file in the root directory and add `API_BASE_URL` and your `API_TOKEN`. See `.env.example` for reference:

```env
# API Configuration
API_BASE_URL=https://api.eg1.io/v0
API_TOKEN=your-api-token-here
```

### 3. Development

Start the development server with hot reloading:

```bash
deno task dev
```

### 4. Building for Production

To build the project for production:

```bash
deno task build
```

## Deployment

This project is configured to deploy to Cloudflare Workers.

### 1. Setup Cloudflare

1. Sign up for a [Cloudflare account](https://cloudflare.com/)
2. Authenticate with Cloudflare: `wrangler login`

### 2. Deploy

Deploy to Cloudflare Workers:

```bash
deno task build && wrangler deploy --keep-vars
```

### 3. Configure Environment Variables

Add the following variables to your worker directly from the Cloudflare dashboard:

- `API_BASE_URL`
- `API_TOKEN`

## Technologies Used

- **Fresh 2.x** - Full-stack web framework for Deno
- **Tailwind CSS** - Utility-first CSS framework
- **Cloudflare Workers** - Serverless deployment platform

