# companion-module-clickpad

Bitfocus Companion module for **ClickPad**, the click, pads and song-announcement app for worship teams. Website: [clickpad.app](https://clickpad.app)

## Download

Open **Releases** (right side of this page), click the **Latest** release, and download the `clickpad-<version>.tgz` file under **Assets**. In Companion, open **Modules › Import module package** and choose that file.

## What it does

See [companion/HELP.md](companion/HELP.md).

## Sharing status

- Private for now; not yet submitted to the Bitfocus module list.
- The Bitfocus "Companion Module Checks" workflow is switched off while the repository is private (it can't read private repositories). Switch it back on (`gh workflow enable "Companion Module Checks"`) before sharing. The module's own build, lint, test and package checks run on every change.
- Nothing church-specific is in the module (no addresses, names or passwords); the connection address is entered in Companion.

## Contract with the app

ClickPad sends `{"type":"state", ...}` JSON over a WebSocket (default port 9330) whenever anything changes, and accepts `{"action":"<name>"}` and `{"action":"selectSong","song":N}`. Field and action names are shared with the app, so only add fields; never rename or remove them.
