## ClickPad

Website: [clickpad.app](https://clickpad.app)

Control **ClickPad** (the click, pads and song announcements app for worship teams) from Companion, and show what it's doing on your buttons: the song title, key, scale and tempo, and whether the click and pad are running. Everything updates live; no polling or refresh buttons.

### Setup

1. In ClickPad, open **Settings › Network** and turn on **Allow remotes and Companion**. It shows the device's address and the port (normally `9330`).
2. In Companion, add a **ClickPad** connection and enter that address and port. Use `127.0.0.1` if Companion runs on the same device as ClickPad.
3. The connection turns green when connected, and ClickPad lists it under **Settings › Remote › Connected now** as "Companion (your connection's name)". If ClickPad is closed or restarts, Companion reconnects by itself.

The first time, your device may ask whether ClickPad may accept incoming network connections: choose **Allow**.

### Presets

- **Song info**: buttons that show the song title, key, tempo, next song, and click/pad status.
- **Controls**: every ClickPad control. Start/Stop turns red and reads STOP while the click runs; Click and Pad light up while running.
- **Select song**: song 1 to 10, showing each song's title and key (lit when selected). Selecting doesn't start anything until GO.
- **Levels**: click, pad and song name down/up, showing the current level.

### Actions

Start/Stop, GO, Next Song, Previous Song, Toggle Click On/Off, Click On, Click Off, Toggle Pad On/Off, Pad On, Pad Off, Stop All, Select Song, Level Up/Down, Set Level.

### Feedbacks

ClickPad Connected, Click Playing, Click Counting In, Pad Playing, Announcement Speaking, Active Song Is Pad Only, Active Song Number.

### Variables

`song_title`, `song_key`, `song_key_note`, `song_scale`, `song_key_and_scale`, `tempo_bpm`, `tempo_label`, `song_time_signature`, `active_song_number`, `setlist_name`, `setlist_song_count`, `next_song_number`, `next_song_title`, `next_song_key`, `next_song_scale`, `next_song_tempo_bpm`, `next_song_time_signature`, `next_transition`, `click_play_state`, `count_in`, `bar`, `beat`, `pad_play_state`, `announcing`, `audio_output`, `click_volume`, `pad_volume`, `song_name_volume`, `song_1_title` … `song_20_title`, `song_1_key` … `song_20_key`, `clickpad_name`, `remote_count`, `remote_names`, `connection_state`, `reconnect_count`. Names match the MultiTracks Playback module where they mean the same thing.

Use them on any button, e.g. `$(clickpad:song_key)` (replace `clickpad` with your connection's name).
