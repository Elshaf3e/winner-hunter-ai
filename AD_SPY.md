# Ad Spy workspace

The Ads Library uses the existing browser-only ad records in Local Storage and adds media blobs to a new `adMedia` object store in the existing IndexedDB (`winner_hunter_telegram_v1`, schema version 2). The upgrade retains existing Telegram offers, images, favorites and grouping. No backend, API key, automatic platform access or scraping is involved.

## Adding ads

Use **سجل إعلان** for a manually reviewed record, or **استيراد إعلانات** for CSV/JSON (up to 500 rows / 2 MB). Fields include `title`, `advertiser`, `platform`, `country`, `collection_date`, `first_seen`, `last_seen`, `status` (`active`, `inactive`, `unknown`), `destination_type` (`website`, `messages`), `copies`, `ad_text`, `ad_url`, `landing_url`, `creative_url`, `creative_file`, and `landing_image_files`. Imported filenames must exactly match files selected in the same import. Separate landing-image filenames with semicolons or pipes. Files stay in this browser: PNG/JPEG/WebP/GIF up to 10 MB each, MP4/WebM up to 50 MB each, total 100 MB per import. Direct external media URLs can preview when the origin permits it, but only uploaded files can be downloaded in the tool. A URL to a landing page does not authorize fetching or extracting its images.

Records bundled with the site carry `DEMO`; user-added/imported records are labelled separately. Missing dates remain `Unverified`, including older records with a standalone `days_active` number. Both valid first and last observed dates are needed to compute inclusive observed days and Good (0–49), Winner (50–199), or Super Winner (200+). The classification is not proof of sales, demand, continuous activity, or profitability. The collection-date filter refers to the date the record was collected, not the ad's first appearance. Status is user-supplied, never checked live.

## Research and bulk actions

Search and filter only saved local ad records. Select visible cards or individual checkboxes to save in bulk, export selected metadata to CSV/JSON, download locally uploaded media as one ZIP, or add the selected ads to a named collection. The collection filter finds that group later. Copy Text requires stored copy; Landing Page requires an actual destination URL; Landing Images requires images explicitly uploaded. Missing inputs give an explanation. An external media URL alone is not downloaded. Bulk ZIP is limited to 200 MB. Ad media can use significant browser quota.

Find Suppliers conservatively matches the ad title against the already-imported Telegram products, retaining model, color and size distinctions. It also shows matching legacy supplier-directory entries with DEMO labels where applicable. Telegram prices and source links are shown only when present; selecting a price populates the existing calculator's supplier-cost field. This is a candidate match, not verification of offer availability or product identity.

The legacy JSON backup and selected-record exports contain **metadata only**, not uploaded media blobs or Telegram images. Keep original authorized files separately. Clearing browser storage removes local data. Never commit private ad exports, media, Telegram sessions, or credentials to this public repository. For live Meta/TikTok/Google coverage or protected creative downloads, appropriate external authorized access and a separate collection/sync process would be necessary.

Run `node --test tests/adspy.test.js tests/discovery.test.js`. The tests use synthetic records and do not publish real advertising datasets.
