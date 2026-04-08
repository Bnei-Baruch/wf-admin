# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
yarn start      # Development server on port 3000 with hot reload
yarn build      # Production webpack build to ./build/
yarn deploy     # Production build + deploy script
```

There are no test commands — this project has no test suite.

## Architecture Overview

This is a **React-based workflow management admin panel** for the Kabbalah Media archive. It provides specialized modules for content ingest, editing, verification, censoring, conversion, and product management.

### Entry Point & Navigation

[src/App.js](src/App.js) is a class component that renders a tab-based interface with **19+ lazy-loaded sub-apps** via `React.lazy()`. Access to each tab is controlled by Keycloak roles (e.g., `wf_ingest`, `wf_censor`, `wf_admin`, `wf_insert`). The minimum required role is `bb_user`.

### Sub-App Modules (`src/apps/`)

Each subdirectory under `src/apps/` is an independent feature module. Key modules:

- **WFDB** — Workflow database UI; 13+ sub-components for archive, aricha, capture, carbon, convert, dgima, files workflows
- **Monitor** — Real-time MQTT dashboard showing workflow status
- **Insert** — File upload and MDB insertion with modal-based workflows
- **Products/FileManager** — File management with language-specific encoding (windows-1251 for Cyrillic, windows-1255 for Hebrew)
- **Ingest, Censor, Aricha, Dgima, External** — Workflow stage apps following a similar pattern
- **CIT** — Complex content import tool with 8+ form components and utilities
- **Trimmer** — Video trimming with multiple variant components
- **Upload** — Upload workflows: Aklada, Raw, Files, Backup

### Shared Utilities (`src/shared/`)

- **[tools.js](src/shared/tools.js)** — All API client functions. Provides REST wrappers (`getData`, `putData`, `postData`, `mdbPost`) that attach JWT Bearer tokens, plus MDB-specific operations (`newMdbUnit`, `updateMdbUnit`, `insertFile`, `insertSrtToMdb`, `insertDocxToMdb`). Backend endpoints are injected from environment variables.
- **[consts.js](src/shared/consts.js)** — Global constants: upload options, MIME type mappings, language lists, content type definitions.
- **[mqtt.js](src/shared/mqtt.js)** — MQTT 5.0 pub/sub class for real-time workflow updates. Connects to local (`mqtt.bbdomain.org`) or external (`msg.kab.sh`) brokers.

### Authentication

[src/components/UserManager.js](src/components/UserManager.js) handles Keycloak OAuth 2.0 (PKCE). `getToken()` in `tools.js` extracts the JWT for API requests. Token refresh is handled automatically with retry logic.

### Backend Endpoints

Configured via `.env` and injected by webpack's `DefinePlugin`:

| Variable | Purpose |
|---|---|
| `MDB_BACKEND` | MDB REST API (content metadata) |
| `WFDB_BACKEND` / `WFSRV_BACKEND` | Workflow DB and server |
| `WFRP_BACKEND` | Workflow reporting |
| `CNV_BACKEND` | Conversion service |
| `MQTT_LCL_URL` / `MQTT_EXT_URL` | MQTT brokers |

### UI Stack

- **React 18** with class components (no hooks pattern used broadly)
- **Semantic UI React** for all UI components
- Props/callbacks for inter-component communication (no Redux or Context API)
- Hebrew locale support with RTL layout switching via `react-datepicker`

### Webpack

Dev server proxies `/vod-proxy` → `http://10.66.1.76`. Code splits into three chunks: `vendors`, `antd`, and `manifest`. Modules resolve from `./src` first.
