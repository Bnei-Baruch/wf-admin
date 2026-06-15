# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start        # Dev server on port 3000 with HMR
npm run build    # Production build → /build
npm run deploy   # Production build + scripts/deploy.sh
```

No test suite or linter is configured.

## Architecture

**wf-admin** is a single-page Archive Workflow Administration Portal — a tab-based admin UI for managing multimedia content processing pipelines. It's built with React 18 (class components), Semantic UI React, and integrates with multiple backend services via REST and MQTT.

### App Shell

[src/App.js](src/App.js) is the root shell. It:
- Authenticates via Keycloak and gates tab visibility by user role (`checkPermission`)
- Initializes a global MQTT connection (used by all modules)
- Lazy-loads 18 workflow modules as tabs using `React.lazy()`

### Module Structure

Each module lives in `src/apps/<ModuleName>/` and typically follows the pattern:
- `<ModuleName>App.js` — top-level class component, handles MQTT subscriptions and state
- Supporting component files for sub-views/forms

The modules are: Admin, Aricha, Carbon (conversion), Censor, CIT (content metadata), Dgima, External, Files, Ingest, Insert, Jobs, Ktaim, Metus, Monitor, Products, Sirtutim, Trimmer (shared), Upload, WFDB.

### Shared Utilities

- [src/shared/tools.js](src/shared/tools.js) — REST API helpers, token management, time formatters
- [src/shared/mqtt.js](src/shared/mqtt.js) — MQTT client wrapper (subscribe/publish)
- [src/shared/consts.js](src/shared/consts.js) — Content types, MIME mappings, language codes

### Data Sources

| Source | Purpose |
|--------|---------|
| Keycloak | Auth + role-based permissions |
| MQTT (WebSocket) | Real-time workflow state (capture, trimmer, conversion) |
| MDB REST API | Kabbalahmedia Database — content units, metadata |
| WFDB REST API | Workflow database status |
| WFAPI REST | Workflow operations |
| Carbon | Format conversion services |

All backend URLs are configured via `.env` as `REACT_APP_*` variables and injected at build time via Webpack's `DefinePlugin`.

### Build

Webpack 5 with Babel 7. Output goes to `/build`. Code-split into vendor chunks (`vendors`, `antd`, `manifest`). Environment variables from `.env` are parsed and injected — they must be accessed as `process.env.REACT_APP_*` in source.

### UI

Semantic UI React components throughout. Two additional modal mount points exist in the HTML (`#cit-modal-mount` for RTL, `#ltr-modal-mount`) used by CIT module modals alongside the main `#root`.
