---
name: coremail
description: "Operate the local Coremail CMClient mailbox via its loopback HTTP SDK: read mail, export attachments, organize folders and tags, query contacts and calendars, open compose windows. Use when the task needs anything from the user's own CMClient mailbox or address book."
---

# Coremail

Operate the user's own Coremail desktop client through its local HTTP SDK. All calls stay on loopback; no credentials are stored. Scope is this machine's mailbox and address book only. When the SDK is unreachable, follow the reconnect procedure below instead of parsing the client's proprietary local store (observed dead end, not a fallback to engineer around).

## Connect first, then act

From this skill directory, probe before any real work:

```bash
python scripts/enable_sdk.py
```

It reports `open true` or a repair plan and changes nothing by default. If the port is closed, the repair (backup config, quit client, flip `EnableAIMCP`, restart, re-probe) interrupts one mail sync and needs the user's explicit go-ahead every time — never run `--confirm-restart` on a standing instruction. See [SDK reference](references/sdk-reference.md) for the endpoint shape.

## Capability map and authority

Read-only calls are free to use once connected. Anything that changes mailbox state or reaches another person needs the user's explicit confirmation for that action; a prior approval does not carry over.

- Read: `listAccount`, `listFolder`, `listMails` (per-folder listing with time windows, paging and sorting), `searchMail`, `readMail` (bodies plus `ExportAttach` attachment export). Prefer `listMails` plus client-side filtering: `searchMail` has answered `code 1` even for known-existing subjects on some sessions, so absence from search proves nothing. Probe search per session; never depend on it alone.
- Organize (confirm first): `createFolder`, `deleteFolder`, `moveMail` (single or batch), `listTags`, `addTags`, `modifyMailTags`. There is no delete-mail call in the observed surface; moving to trash is the closest equivalent.
- Contacts (read-only): `listAddressBook` (personal groups, org groups, personal and org contacts), `searchAddressBook` by keyword.
- Calendar (read-only): `listCalendar` over an explicit time range.
- Compose (confirm first, every time): `startCompose` opens a compose window prefilled with recipients, subject, body and attachments. It opens UI; sending completes with Ctrl+Enter in that window followed by confirming the popup dialog (verified end-to-end including inbox delivery). Recipients and CC for any composed or test mail are limited to addresses the user names; default to the mailbox owner alone.

## Recipes

A recipe composes capabilities for one concrete job; it is not the skill's scope. The bundled example archives a mail thread into per-person folders:

```bash
python scripts/cm_scan.py --out <papers-dir> --since YYYY-MM-DD [--account @@any] [--keywords ...] [--meta <meta-dir>] [--roster-mid <MID>]
```

Keywords, roster source and folder naming are that recipe's deployment choices (defaults suit a Chinese training-paper collection: person folders named 工号+姓名, original filenames kept, zips kept alongside extracted files, reruns handle only new mail). Its output object carries full per-mail metadata plus `roster`, `submitters`, `saved` and `missing` fields, documented at the top of the recipe script. When grading depends on completeness, name the roster explicitly with the user and do not open unrelated mail to build it.

## Verify

From this skill directory:

```bash
python scripts/selftest.py
```

Unit checks always run; live SDK checks run only when the client answers and report SKIP otherwise. On consoles that cannot display UTF-8, `--help` text may render as mojibake — set `PYTHONUTF8=1` for that invocation; run output itself is ASCII-safe.
