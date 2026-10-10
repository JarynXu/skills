# CMClient HTTP SDK reference (observed)

Base: `http://127.0.0.1:11328/sdk?func=<name>`, POST JSON. Success is `code 0` with `var`; tolerate a present-or-absent `msg` field. Account selector `"@@any"` means the first non-offline account; an address or numeric ID also works.

Observed against client user-agent `L-CMClient_4.2.3.x_WINDOWS`. Re-verify names on a new major client version before trusting them blindly.

| func | params | returns |
|---|---|---|
| `listAccount` | `{}` | account list: `AccountID`, `AccountName` (address), `DisplayName`, `ProtocolType`, `StorePath` |
| `listFolder` | `{"Account"}` | folders: `FID`, `Name`, `ParentID`, `Type` (1 inbox, 2 drafts, 3 sent, 4 trash, 5 spam, 6 virus mail, 254 local archive, 255 custom) |
| `listMails` | `{"Account"\|"AccountID", "Condition": {"FID", "RecTime": {"Begin","End"} (epoch sec), "MailTime"?, "ModTime"?}, "Sort": "RecTime", "SortDesc": true, "Limit", "Offset", "ReturnType"?}` | `{Mails: [...], Total}`; entries carry `ID`, `FID`, `Subject`, `Sender`, `SenderDecode` (`Display`/`Email`/`Name`), `Rcpt`, `Cc`, `MailTime`/`RecTime` (epoch sec), `Size`, `Flags`, `Summary`, `MailStruct`, `HMID`, `ThreadID` |
| `searchMail` | `{"Account", "Full"\|"Sender"\|"Rcpt"\|"Subject"\|"Body"\|"Attach", "FID?", "Limit?", "Sort?", "SortDesc?", "ReturnType?", "Policy?", "RecTime"?, "MailTime"?, "SearchSent"?, "ConditionOr"?, "SortCharset"?}` | observed answering `code 1` with `var null` even for known-existing subjects on one machine/index state — treat as unreliable, probe per session, use `listMails` plus filtering as the primary path |
| `readMail` | `{"mail_id": "<ID>", "Account?", "bodyType"? (All\|Html\|Text\|MD), "ExportAttach?"}` | `{json: <export-dir json path>, mail: {...}}`; the export dir holds `mail_<acct>_<mid>.json` (header in `mailHeader`, body file in `mailFilePath`), `main.txt` body, and `att_N` files when `ExportAttach` is true. `MailStruct` entries with `flags 5` are attachments: match them to `att_N` files by `size`, names are accurate |
| `listAddressBook` | `{"Account", "type": "personGroup"\|"orgGroup"\|"personContacts"\|"orgContacts", "parentOrgGroupID?", "Recursive?", "personGroupID?", "orgGroupID?"}` (`orgGroupID` required for `orgContacts`) | `{value: [...]}` unwrapped by callers |
| `searchAddressBook` | `{"Account", "keyword"}` (required) | `{value: [...]}` unwrapped by callers |
| `listCalendar` | `{"Account", "Time": {...}}` (range required) | `{calendar: [...]}` unwrapped by callers |
| `startCompose` | `{"Account" (required in practice — omitting it answers `Account not found`), "to"?, "cc"?, "bcc"?, "subject"?, "body"?, "htmlbody"?, "htmlfile"?, "attachment"?}` (recipients/attachments accept single or array) | opens a compose window; returns nothing. Chinese text MUST be sent ASCII-escaped (`\uXXXX`, e.g. Python `json.dumps(ensure_ascii=True)`): raw UTF-8 bytes render as mojibake in the compose window (verified visually), escaped input renders clean. There is no silent send — the user sends from the window. Outward-facing: confirm every time |
| `createFolder` | `{"Account"\|"AccountID", "FID": <parent>, "Name"}` | state-changing: confirm first |
| `deleteFolder` | `{"Account"\|"AccountID", "FID"}` | state-changing: confirm first |
| `moveMail` | `{"Account", "FID": <target>, "MID": <id\|array>}` | state-changing: confirm first. No delete-mail call observed; trash folder is the equivalent |
| `listTags` | `{"Account"}` | `{Tag: [...]}` unwrapped by callers |
| `addTags` | `{"Account", "tagname", "color"? 0-24}` | state-changing: confirm first |
| `modifyMailTags` | `{"Account", "MID", "id", "set", "clear"?}` | state-changing: confirm first |

Attachment realities the script handles: zip inner names are GBK-encoded without a UTF-8 flag (repair via cp437→gb18030, as observed on real archives); downloaded single attachments are extensionless `att_N` files whose type is detected from content (UTF-8/GBK text versus binary). `MailStruct` matching is size-keyed: two attachments of byte-identical size can mismatch names — verify against sizes when that matters.
