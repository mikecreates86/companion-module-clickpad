# companion-module-clickpad

Bitfocus Companion module for **ClickPad**, the click, key-matched pads and song-announcement app for worship teams.

## Download

Open **Releases** (right side of this page), click the **Latest** release, and download the `clickpad-<version>.tgz` file under **Assets**. In Companion, open **Modules › Import module package** and choose that file.

## What it does

See [companion/HELP.md](companion/HELP.md).

### About the name

The module's internal ID is `clickpad`, and so are the variable names and the download's file name (`clickpad-<version>.tgz`), so existing connections and buttons keep working whatever it was called. Changing the ID would make Companion treat it as a different module.

## Sharing status

- Private for now; not yet submitted to the Bitfocus module list.
- The Bitfocus "Companion Module Checks" workflow is switched off while the repository is private (it can't read private repositories). Switch it back on (`gh workflow enable "Companion Module Checks"`) before sharing. The module's own build, lint, test and package checks run on every change.
- Nothing church-specific is in the module (no addresses, names or passwords); the connection address is entered in Companion.

## Contract with the app

ClickPad sends `{"type":"state", ...}` JSON over a WebSocket (default port 9330) whenever anything changes, including `problem` (a few words, "" when all is well), and accepts `{"action":"<name>"}` (its TransportAction names: `go`, `play`, `stop`, `startStopToggle`, `clickStart`, `clickStop`, `clickToggle`, `padStart`, `padStop`, `padToggle`, `nextSong`, `previousSong`, `stopAll`), `{"action":"selectSong","song":N}` and `{"action":"adjustLevel", ...}`. Field and action names are shared with the app, so only add fields; never rename or remove them.
