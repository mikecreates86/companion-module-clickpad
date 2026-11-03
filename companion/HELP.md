## Anchor

Control **Anchor** (click, pads, tracks and song announcements for worship teams) from Companion, and show what it's doing on your buttons: the song title, section, key, scale and tempo, whether the click and pad are running, and anything that needs attention. Everything updates live; no polling or refresh buttons.

### Setup

1. In Anchor, open **Setup** and, under **Remotes and Companion**, turn on **Allow remotes and Companion**. It shows the device's address and the port (normally `9330`).
2. In Companion, add an **Anchor** connection and enter that address and port. Use `127.0.0.1` if Companion runs on the same device as Anchor.
3. The connection turns green when connected, and Anchor lists it under **Connected now** as "Companion (your connection's name)". If Anchor is closed or restarts, Companion reconnects by itself.

The first time, your device may ask whether Anchor may accept incoming network connections: choose **Allow**.

**Already using this with ClickPad?** It's the same module, renamed. Your connection and buttons keep working, and it still works with ClickPad; ClickPad just doesn't send the section or problems, so those stay empty.

### Presets

- **Song info**: buttons that show the song title, key, tempo, next song, and click/pad status.
- **Controls**: every Anchor control, including Pads: Engage, Pads: Stop, Fade Song and Loop Section. Start/Stop turns red and reads STOP while the click runs; Click and Pad light up while running.
- **Select song**: song 1 to 10, showing each song's title and key (lit when selected). Selecting doesn't start anything until GO.
- **Levels**: click, pad and song name down/up, showing the current level.
- **Status displays** also include **Section playing** and a **Problem banner**. The banner is blank when all is well, and turns red with the first problem when something needs attention: put it on an offstage Stream Deck.

### Actions

Start/Stop, GO, Next Song, Previous Song, Toggle Click On/Off, Click On, Click Off, Toggle Pad On/Off, Pad On, Pad Off, Stop All, Select Song, Level Up/Down, Set Level, Pads: Engage and Pads: Stop (Anchor's Pads screen), Fade Song (fades the tracks song playing), Loop Section (loops the section playing now).

### Feedbacks

Anchor Connected, Click Playing, Click Counting In, Pad Playing, Announcement Speaking, Active Song Is Pad Only, Active Song Number, Something Needs Attention (red while Anchor reports a problem, off when all is well).

### Variables

`song_title`, `song_key`, `song_key_note`, `song_scale`, `song_key_and_scale`, `tempo_bpm`, `tempo_label`, `song_time_signature`, `active_song_number`, `setlist_name`, `setlist_song_count`, `next_song_number`, `next_song_title`, `next_song_key`, `next_song_scale`, `next_song_tempo_bpm`, `next_song_time_signature`, `next_transition`, `click_play_state`, `count_in`, `bar`, `beat`, `pad_play_state`, `announcing`, `audio_output`, `click_volume`, `pad_volume`, `song_name_volume`, `song_1_title` … `song_20_title`, `song_1_key` … `song_20_key`, `clickpad_name` (this Anchor's name), `remote_count`, `remote_names`, `section` (e.g. "verse 2"), `problem` (the first problem, in plain English), `problems` (all of them, separated by " · "), `problem_count`, `connection_state`, `reconnect_count`. Names match the MultiTracks Playback module where they mean the same thing.

Use them on any button, e.g. `$(anchor:song_key)` (replace `anchor` with your connection's name). Variable names didn't change when the module was renamed, so existing buttons keep working.
