"""Collect authorized supplier channel posts into Telegram Desktop compatible JSON.

Runs on the owner's machine. Credentials, session, exports and photos stay local.
"""
import argparse
import asyncio
import json
import os
import re
from datetime import datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
HANDLE = re.compile(r"^@?[A-Za-z][A-Za-z0-9_]{3,}$")


def read_channels(path):
    lines = path.read_text(encoding="utf-8").splitlines()
    channels = []
    for line in lines:
        value = line.split("#", 1)[0].strip().removeprefix("https://t.me/").lstrip("@")
        if not value:
            continue
        if not HANDLE.fullmatch(value):
            raise ValueError(f"Invalid public channel username: {value!r}")
        if value.lower() not in {x.lower() for x in channels}:
            channels.append(value)
    if not channels:
        raise ValueError("Add at least one public channel username to the channel file.")
    return channels


def message_record(message, username, photo=None):
    date = message.date.astimezone(timezone.utc)
    row = {
        "id": message.id,
        "type": "message",
        "date": date.isoformat(),
        "date_unixtime": str(int(date.timestamp())),
        "text": message.raw_text or "",
        "link": f"https://t.me/{username}/{message.id}",
    }
    if photo:
        row["photo"] = photo
    return row


async def collect(args, channels):
    try:
        from telethon import TelegramClient
        from telethon.tl.types import Channel
    except ImportError as exc:
        raise SystemExit("Install the optional collector dependency: python -m pip install telethon==1.45.0") from exc
    api_id, api_hash = os.getenv("TG_API_ID"), os.getenv("TG_API_HASH")
    if not api_id or not api_id.isdecimal() or not api_hash:
        raise SystemExit("Set TG_API_ID and TG_API_HASH in your local terminal. Never put them in this repository.")
    output = Path(args.output).resolve()
    output.parent.mkdir(parents=True, exist_ok=True)
    photo_dir = output.parent / "photos"
    session = output.parent / "winner_hunter.session"
    since = datetime.now(timezone.utc) - timedelta(days=args.days)
    chats = []
    async with TelegramClient(str(session), int(api_id), api_hash) as client:
        for name in channels:
            try:
                entity = await client.get_entity(name)
                # Reject users and chats with no public username. Never collect DMs.
                if not isinstance(entity, Channel) or not entity.username or entity.username.lower() != name.lower():
                    print(f"Skipped @{name}: not the requested public channel/group.")
                    continue
                messages = []
                async for msg in client.iter_messages(entity, limit=args.limit):
                    if msg.date < since:
                        break
                    if not msg.raw_text and not msg.photo:
                        continue
                    photo = None
                    if args.photos and msg.photo:
                        photo_dir.mkdir(parents=True, exist_ok=True)
                        target = photo_dir / f"{entity.username}-{msg.id}"
                        downloaded = await client.download_media(msg, file=str(target))
                        if downloaded:
                            file = Path(downloaded)
                            if file.stat().st_size <= 8 * 1024 * 1024:
                                photo = file.relative_to(output.parent).as_posix()
                            else:
                                file.unlink()
                    messages.append(message_record(msg, entity.username, photo))
                chats.append({"type": "public_channel" if entity.broadcast else "public_supergroup", "id": entity.id, "name": entity.title, "username": entity.username, "messages": messages})
                print(f"@{entity.username}: {len(messages)} posts")
            except Exception as exc:
                print(f"Skipped @{name}: {type(exc).__name__}: {exc}")
    if not chats:
        raise SystemExit("No authorized public channels were accessible. No export written.")
    output.write_text(json.dumps({"chats": {"list": chats}}, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Saved {output}. Import this JSON and photos/ in Winner Hunter. This is a partial snapshot; leave 'complete export' unchecked.")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--channels", default=str(ROOT / "tools" / "supplier-channels.txt"))
    parser.add_argument("--output", default=str(ROOT / "telegram-exports" / "result.json"))
    parser.add_argument("--days", type=int, default=30)
    parser.add_argument("--limit", type=int, default=500, help="Maximum recent posts per channel")
    parser.add_argument("--photos", action="store_true", help="Download available photos (may use substantial disk space)")
    args = parser.parse_args()
    if not 1 <= args.days <= 365 or not 1 <= args.limit <= 2000:
        parser.error("Days must be 1–365 and limit must be 1–2000.")
    asyncio.run(collect(args, read_channels(Path(args.channels))))


if __name__ == "__main__":
    main()
