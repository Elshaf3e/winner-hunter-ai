# Telegram product discovery (client-side)

Open **المنتجات التريندي**. All imported messages, offers, favorites, manual grouping and images live in the browser's IndexedDB. No network requests, credentials, paid APIs, backend or automatic Telegram access are used by the importer. The UI and source code remain public on GitHub Pages. Imported records are not published. Clearing browser/site storage deletes them; retain the original Telegram export and media as your backup. The existing JSON export button backs up the older Ads/Suppliers dataset, not this IndexedDB dataset.

## Import

Use an authorized Telegram Desktop **JSON** export of a channel/group, with Photos enabled. Select the JSON and associated image files, or the export folder. Both single-chat `messages` and full `chats.list` exports are supported. Personal, saved, bot and unknown chat types are skipped. The optional username is used only for a single-channel export and must identify its original public channel. Without a recorded message link/username, no source URL is invented.

Limits: 25 MiB JSON, 20,000 messages per import, 8 MiB per image and 100 MiB images per import. Missing, ambiguous, oversized, unsupported or unselected images show a placeholder. PNG/JPEG/WebP/GIF only. Paths are matched by export-relative path, then unique basename for separately selected files. SVG and remote image URLs are not loaded. Metadata and images commit atomically; storage quota failure preserves the previous dataset. Reimported channel/message IDs update existing records, rather than increasing listing frequency.

The parser takes a candidate title from the first descriptive line. It records price only when Egyptian currency is explicit and the amount is unambiguous. Ranges, old/new pricing, foreign currency or multiple prices remain unknown. MOQ, quantity and contacts are preserved only when explicitly present. Multi-product messages, informal wording, numeric formats and prices embedded in images may require manual review; OCR is not included.

## Matching and editing

Arabic diacritics, common alef/yaa/taa forms and Arabic digits are normalized. Matching uses conservative token overlap and a small synonym set; numeric models, Latin model names, sizes, units and common color/variant tokens must agree. All offers in a group must match. It intentionally leaves uncertain products separate. Review descriptions before using an offer. Details allow manual merge (explicit variant conflicts are blocked) and split of selected offers. These decisions persist independently from the imported records.

## Trend semantics

There is no fabricated trend score. The panel shows counts for 7/14/30 days and the immediately preceding equal periods. Comparison is enabled only if every relevant channel has one declared-complete export spanning both windows and reaching at least the preceding day. Gapped exports are not bridged. The user must explicitly confirm export completeness; timestamps alone do not prove complete history. The observation clock is the current browser time, not the latest imported message.

- New: first appearance in imported data within 7 days, not proof of a new product in Egypt.
- Frequently listed: at least 3 distinct suppliers and 6 listings in the last 30 days.
- Rising: 7-day listing count grows at least 50%, with at least 2 preceding listings, 4 current listings and 2 distinct current supplier channels, with sufficient complete history.
- Insufficient Data: incomplete comparative history or fewer than 2 prior listings. A new product can also carry this label.
- Confidence is limited or moderate, referring to imported data coverage only. Supplier reposts, cross-posts and listing frequency do not measure demand, sales, inventory or profitability. Advertising Winner Score remains separate.

First/last seen refer to imported message dates; they are not claimed to be the product's launch date or the first observation on the open market. Counts cover the imported supplier channels, which may not represent separate legal businesses.

## Validation

Run `node --test tests/discovery.test.js`. The fixture in `tests/fixtures/telegram-synthetic.json` contains **synthetic test records only**, including a synthetic personal chat to verify exclusion. It is never automatically loaded into the UI. Tests cover extraction, authorization boundaries, Arabic/model matching, deduplication, manual grouping, trend history/confidence, filters, cards, comparisons and legacy pages/calculator.

## Automatic live updates

Not implemented. A static GitHub Pages site cannot run a persistent Telegram client in the background. Authorized automatic updates would require an explicitly scoped collection process running on the user's device or another authorized runtime, with secure local session storage and a deliberate import/sync design. Never commit Telegram sessions, credentials, exports or real supplier datasets to this public repository. This task adds no collector and requests no Telegram login.
