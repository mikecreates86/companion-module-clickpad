# companion-module-clickpad

Bitfocus Companion module for **ClickPad**, the click, pads and song-announcement app for worship teams, and for **Anchor**, ClickPad with tracks. Website: [clickpad.app](https://clickpad.app)

## Download

Open **Releases** (right side of this page), click the **Latest** release, and download the `clickpad-<version>.tgz` file under **Assets**. In Companion, open **Modules › Import module package** and choose that file.

## What it does

See [companion/HELP.md](companion/HELP.md).

### For Anchor (version 1.3.0 and later)

|          | Name                          | What it does                                                                         |
| -------- | ----------------------------- | ------------------------------------------------------------------------------------ |
| Action   | **Pads: Engage**              | Engages Anchor's Pads screen                                                         |
| Action   | **Pads: Stop**                | Stops Anchor's Pads screen                                                           |
| Action   | **Fade Song**                 | Fades the tracks song playing                                                        |
| Action   | **Loop Section**              | Loops the section playing now                                                        |
| Feedback | **Something Needs Attention** | Red while Anchor reports a problem; off when all is well                             |
| Variable | `section`                     | The section playing, e.g. "verse 2" (empty otherwise)                                |
| Variable | `problem`                     | The first problem, in plain English (empty when all is well)                         |
| Variable | `problems`                    | Every problem, separated by " · "                                                    |
| Variable | `problem_count`               | How many problems (0 when all is well)                                               |
| Preset   | **Problem banner**            | Blank when all is well; red with the first problem when not. For an offstage button. |
| Preset   | **Section playing**           | Shows `section`                                                                      |

ClickPad doesn't send problems or a section, so with ClickPad these stay empty and the feedback stays off. Everything else works the same with both apps.

## Sharing status

- Private for now; not yet submitted to the Bitfocus module list.
- The Bitfocus "Companion Module Checks" workflow is switched off while the repository is private (it can't read private repositories). Switch it back on (`gh workflow enable "Companion Module Checks"`) before sharing. The module's own build, lint, test and package checks run on every change.
- Nothing church-specific is in the module (no addresses, names or passwords); the connection address is entered in Companion.

## Contract with the app

ClickPad sends `{"type":"state", ...}` JSON over a WebSocket (default port 9330) whenever anything changes, and accepts `{"action":"<name>"}` and `{"action":"selectSong","song":N}`. Anchor sends the same messages plus `problems` (list of text) and `section` (text), and also accepts `engage`, `padsStop`, `fade` and `loop`. Field and action names are shared with the app, so only add fields; never rename or remove them.
