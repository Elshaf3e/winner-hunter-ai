# Winner Hunter AI — Web MVP v0.2

Arabic RTL product research dashboard for ads, competitor records, supplier records and dropshipping profitability calculations.

## Features
- Dashboard, ad search/filtering, Good/Winner/Super Winner classifications based on entered duration.
- Supplier and competitor data management.
- CSV/JSON imports, local export, profitability and break-even CPA calculator.
- Runs as a static website without Python or paid APIs.

## Important limitations
- All initial records are **demo/sample data**. Winner classifications **do not demonstrate actual sales or profit**.
- No live Meta, TikTok, or Telegram integration yet.
- Data entered by users is saved **only in the browser localStorage**, not synchronized to GitHub or other devices. Export a backup regularly.
- No accounts, authentication or backend. Do not add sensitive data, credentials or API keys.

## Deploy with GitHub Pages
1. Open Settings → Pages.
2. Under Build and deployment, select Deploy from a branch.
3. Select main and /(root), then Save.
4. Open https://elshaf3e.github.io/winner-hunter-ai/ once deployment finishes.

The app is self-contained in `index.html`, with CSS and JavaScript inlined. This is a public repository.
