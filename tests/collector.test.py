import importlib.util
import tempfile
import unittest
from datetime import datetime, timezone
from pathlib import Path
from types import SimpleNamespace


spec = importlib.util.spec_from_file_location("collector", Path(__file__).resolve().parents[1] / "tools" / "telegram_collect.py")
collector = importlib.util.module_from_spec(spec)
spec.loader.exec_module(collector)


class CollectorTests(unittest.TestCase):
    def test_public_channel_list_rejects_links_to_messages_and_deduplicates(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / "channels.txt"
            path.write_text("# comment\n@StoreEgypt\nhttps://t.me/storeegypt\n", encoding="utf-8")
            self.assertEqual(collector.read_channels(path), ["StoreEgypt"])
            path.write_text("https://t.me/StoreEgypt/123\n", encoding="utf-8")
            with self.assertRaises(ValueError):
                collector.read_channels(path)

    def test_record_is_compatible_with_existing_telegram_importer(self):
        msg = SimpleNamespace(id=42, date=datetime(2026, 10, 28, tzinfo=timezone.utc), raw_text="مكنسة سيارة 120W\nالسعر 120 جنيه")
        row = collector.message_record(msg, "storeegypt", "photos/storeegypt-42.jpg")
        self.assertEqual(row["link"], "https://t.me/storeegypt/42")
        self.assertEqual(row["photo"], "photos/storeegypt-42.jpg")
        self.assertEqual(row["date_unixtime"], "1793145600")


if __name__ == "__main__":
    unittest.main()
