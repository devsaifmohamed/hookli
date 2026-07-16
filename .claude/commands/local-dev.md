# Local Dev Environment

How to run the platform locally for development and testing.

## Running from master (default)

All services run from the main working directory:

```bash
# Terminal 1: Backend (all apps)
cd backend && npm run dev:all

# Terminal 2: Dashboard
cd dashboard && yarn dev          # http://localhost:5007

# Terminal 3: Storefront
cd storefront && yarn dev         # http://localhost:5006
```

## Testing a feature branch (from a worktree)

To test a feature branch created in a worktree, **switch master to that branch** instead of running from the worktree directory. This avoids needing to install node_modules or copy .env files.

### Steps:

1. **Stop all running processes** (kill processes on ports 5002, 5003, 5004, 5006, 5007)

2. **Switch master to the feature branch**:
   ```bash
   cd /Users/ahmed/Sites/nzmly/platform
   git checkout <branch-name>
   ```

3. **Run migrations if needed** (new tables, schema changes):
   ```bash
   cd backend && npm run migrate
   ```

4. **Start services**:
   ```bash
   # Terminal 1: Backend
   cd backend && npm run dev:all

   # Terminal 2: Dashboard
   cd dashboard && yarn dev          # http://localhost:5007

   # Terminal 3: Storefront
   cd storefront && yarn dev         # http://localhost:5006
   ```

5. **When done testing**, stop processes and switch back to master:
   ```bash
   git checkout master
   ```

## Ports

| Service | Port |
|---------|------|
| dash-api (merchant GQL) | 5002 |
| shop-api (storefront GQL) | 5003 |
| admin-api (admin GQL) | 5004 |
| Dashboard (Next.js) | 5007 |
| Storefront (Next.js) | 5006 |

## Tips

- You only need to run the services relevant to your feature. E.g., for a dashboard-only change, just run `dash-api` + `dashboard`.
- Master and feature branches use the **same ports** — always stop one before starting the other.
- Never install node_modules in worktree directories — always test by switching the main directory to the branch.
