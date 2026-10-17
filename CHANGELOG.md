# Changelog

## 1.2.2

- Device-neutral wording in settings and variable descriptions ("device address").

## 1.2.1

- Help and settings point to ClickPad's current Settings › Network, and use device-neutral wording (ClickPad may run on Mac or iPad).

## 1.2.0

- Song buttons show the song's title and key: new variables `song_1_title` … `song_20_title` and `song_1_key` … `song_20_key`.
- Levels: new actions **Level Up/Down** and **Set Level** for the click, pad and song name, variables `click_volume`, `pad_volume`, `song_name_volume`, and a Levels preset group.

## 1.1.2

- If ClickPad removes this connection (Settings › Network › Remove), it stays off instead of reconnecting, and says so. Save the connection or turn it off and on to reconnect.

## 1.1.1

- Fixed: status display presets showed "$NA" instead of the song, key and tempo.
- The Start/Stop preset now reads START (and STOP while the click runs), so it's not confused with GO.

## 1.1.0

- New variables: `clickpad_name`, `remote_count`, `remote_names` (remote ClickPads connected to the main one).
- The connection introduces itself, so ClickPad's Settings › Remote shows it as Companion, by name.
- Link to the ClickPad website, clickpad.app, in the help.

## 1.0.0

- First release: live song, key, tempo and click/pad state; every ClickPad control; presets.
