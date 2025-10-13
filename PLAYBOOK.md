# 🚀 Development Playbook

This guide walks you through setting up and running the project locally.

## 📋 Prerequisites

- [Bun](https://bun.sh/) installed
- Cloudflare account (for D1 database and R2 storage)
- Required API keys (see `.dev.vars.example`)

## 🔧 Setup Steps

### 1. Configure Environment Variables

Copy the example file and fill in your actual credentials:

```bash
cp .dev.vars.example .dev.vars
```

Then edit `.dev.vars` with your actual API keys and configuration.

### 2. Configure Cloudflare Database ID

Update the `database_id` in `wrangler.jsonc` with your own Cloudflare D1 database ID:

```jsonc
"d1_databases": [
    {
        "binding": "DB",
        "database_name": "wild-voice-db",
        "database_id": "your-actual-database-id-here", // ← Replace this
        "migrations_dir": "./src/drizzle"
    }
]
```

You can find your database ID in the Cloudflare dashboard or by running:

```bash
wrangler d1 list
```

### 3. Install Dependencies

```bash
bun install
```

### 4. Generate Database Schema

```bash
bun run db:generate
```

### 5. Run Database Migrations

For local development:

```bash
bun run db:migrate:local
```

For other environments:
- Preview: `bun run db:migrate:preview`
- Production: `bun run db:migrate:prod`

### 6. Kill Conflicting Ports (if needed)

If ports 3000-3005 are already in use:

```bash
kill -9 $(lsof -t -i:3000-3005)
```

### 7. Run the Development Server

Choose one of the following:

#### Option A: Cloudflare Workers Mode (Recommended)
Runs with Cloudflare bindings (D1, R2, etc.):

```bash
bun run dev:cf
```

#### Option B: Standard Next.js Mode
Runs without Cloudflare bindings:

```bash
bun dev
```

## 🗄️ Database Management

### View Database Studio

```bash
bun run db:studio        # Remote database
bun run db:studio:local  # Local database
```

### Inspect Database Tables

```bash
bun run db:inspect:local    # Local
bun run db:inspect:preview  # Preview
bun run db:inspect:prod     # Production
```

### Reset Local Database

```bash
bun run db:reset:local
```

## 🚢 Deployment

### Deploy to Cloudflare

```bash
bun run deploy           # Production
bun run deploy:preview   # Preview environment
```

### Build for Cloudflare

```bash
bun run build:cf
```

## 🛠️ Other Useful Commands

- **Format code**: `bun run lint`
- **Generate Cloudflare types**: `bun run cf-typegen`
- **Manage secrets**: `bun run cf:secret <SECRET_NAME>`

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Better Auth](https://www.better-auth.com/docs)
