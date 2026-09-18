# Release Compass GitHub Action

Open a [Release Compass](https://release-compass.app) changelog **draft** from GitHub Actions. Publishing stays in the dashboard.

The action POSTs JSON to `https://api.release-compass.app/api/v1/releases`. A project API key (`rc_live_…`) selects the project. Release Compass never clones your repository.

Pin the **major** tag:

```yaml
- uses: tech-trail-io/release-compass-action@v0
  with:
    token: ${{ secrets.RELEASE_COMPASS_TOKEN }}
    version: ${{ github.ref_name }}
    title: ${{ github.event.release.name }}
    body: ${{ github.event.release.body }}
    url: ${{ github.event.release.html_url }}
    idempotency-key: ${{ github.run_id }}
```

Pass title and body as action inputs so GitHub keeps newlines.

## Inputs

| Input | Required | Description |
| --- | --- | --- |
| `token` | yes | Project API key (`rc_live_…`). Store as a secret. |
| `version` | yes | Version string, e.g. `v1.4.0` |
| `title` | no | Draft title. Defaults to `version`. |
| `body` | no | Source notes (markdown or plain text) |
| `url` | no | Source URL (GitHub release, ticket, …) |
| `channel` | no | `stable`, `rc`, `beta`, `alpha`, or `canary`. Omit to infer from version. |
| `api-url` | no | API origin. Default `https://api.release-compass.app` |
| `idempotency-key` | no | Retry key so the same run does not open a second draft |

## Outputs

`id`, `version`, `slug`, `channel`, `status`, `created-at`, `changelog-url`, `editor-url`

## Develop

Node 24. Commit `index.cjs` with source changes.

```bash
npm ci
npm test
npm run build
```
