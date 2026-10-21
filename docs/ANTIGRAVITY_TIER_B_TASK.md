ROBO VAULT NEXUS — AUTONOMOUS TIER B HARDENING AND GITHUB DELIVERY

Repository: C:\Users\sabarivasan\.gemini\antigravity\scratch\RoboVault
Branch: main
Expected starting commit: 3924f8f159b26c3a0c3c8d597badac670740db7c

OBJECTIVE:
Fix Docker build reproducibility, MongoDB authentication, JWT secret handling, service health ordering, and deployment documentation. Run all possible tests, then commit and push only safe, verified changes.

1. Inspect git status, current HEAD, origin/main, existing diffs, all Dockerfiles, docker-compose.yml, Nginx configuration, Spring Boot security/database configuration, package manifests, and existing tests. Preserve unrelated work and runtime databases.

2. FRONTEND BUILD:
- Create frontend/.dockerignore excluding node_modules, dist, .git, logs, and local environment files.
- Update frontend/Dockerfile to COPY package.json package-lock.json before RUN npm ci.
- Preserve the existing production Nginx stage and verify the lockfile.

3. SECURITY:
- Configure MongoDB authentication using environment variables and supported official-image settings.
- Configure Spring Boot's authenticated MongoDB URI with the correct authentication database and safely encoded credentials.
- Remove insecure production JWT secret fallbacks; require JWT_SECRET and validate it against the actual signing algorithm's security requirements.
- Add only placeholder values to .env.example and ensure .env is gitignored.
- Never print or commit secrets.
- Avoid exposing MongoDB port 27017 publicly; use localhost-only binding if host access is necessary.
- Inspect MongoDB initialization and persistence implications. Existing volumes must never be deleted or reset. If migration is required, document and stop before risky operations.

4. HEALTH AND NETWORKING:
- Ensure backend waits for MongoDB health.
- Make frontend depend on backend with condition: service_healthy.
- Verify the backend health check tests real readiness and uses tools available in its image.
- Add a frontend health check only when its probe utility exists.
- Verify Nginx API proxy and SPA fallback.
- Avoid stopping the active Tier A service on port 3000. Use an alternate FRONTEND_PORT for container testing if needed.

5. TESTS:
- Run frontend npm ci and production build.
- Run available mission workflow, lifecycle, regression, and rendering tests.
- Run git diff --check and inspect the complete diff.
- If Docker exists, run docker compose config, build, start, health checks, authenticated database connectivity, API smoke tests, and persistence verification.
- If Docker is unavailable, explicitly mark container build/runtime tests BLOCKED. Do not claim deployment succeeded based on static checks.

6. DOCUMENT:
- Update docs/DEPLOYMENT_READINESS_AUDIT.md with actual changes and results.
- Never fabricate test output or claim unexecuted tests passed.

7. GIT:
- Preserve robovault-local-db.json, robovault-local-db.json.bak, MongoDB volumes, .env, and unrelated changes.
- Stage only reviewed intended files.
- Commit and push to origin/main only when all available required tests pass and no secrets or unrelated files are staged.
- Verify local HEAD equals origin/main after pushing.
- If any mandatory check fails, do not push; report the failure and next action.

Work autonomously within these constraints. Report changed files, actual test results, blocked checks, remaining risks, and commit SHA if pushed.
