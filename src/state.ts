/**
 * What ClickPad sends (JSON over WebSocket, `{"type":"state", ...}`), and how it becomes Companion
 * variables. Pure functions only, so they can be tested without Companion.
 */
export interface ClickPadState {
	type: 'state'
	protocolVersion: number
	setList: string
	songNumber: number
	songCount: number
	title: string
	key: string
	keyTonic: string
	scale: string
	bpm: string
	timeSignature: string
	songClickEnabled: boolean
	announce: boolean
	nextTitle: string
	nextKey: string
	nextScale: string
	nextBpm: string
	nextTimeSignature: string
	nextTransition: string
	click: 'off' | 'starting' | 'countIn' | 'running'
	countIn: number
	bar: number
	beat: number
	pad: boolean
	announcing: boolean
	output: string
	outputOK: boolean
	/** The ClickPad's name (Settings › Remote in ClickPad). Sent by ClickPad 1.1 and later. */
	mainName: string
	/** Names of the remote ClickPads connected to it right now. */
	remoteNames: string[]
	/** Volume of each sound, 0–100 (ClickPad › Settings › Audio › Levels). */
	clickVolume: number
	padVolume: number
	songNameVolume: number
	/** Every song in the set list, in order (for song button labels). */
	songTitles: string[]
	songKeys: string[]
	/** Anchor: what's wrong right now, in plain English (the red dot's list). Empty when all is well. */
	problems: string[]
	/** Anchor: the section of a tracks song playing now, e.g. "verse 2" ("" otherwise). */
	section: string
}

export const EMPTY_STATE: ClickPadState = {
	type: 'state',
	protocolVersion: 1,
	setList: '',
	songNumber: 0,
	songCount: 0,
	title: '',
	key: '',
	keyTonic: '',
	scale: '',
	bpm: '',
	timeSignature: '',
	songClickEnabled: true,
	announce: true,
	nextTitle: '',
	nextKey: '',
	nextScale: '',
	nextBpm: '',
	nextTimeSignature: '',
	nextTransition: '',
	click: 'off',
	countIn: 0,
	bar: 0,
	beat: 0,
	pad: false,
	announcing: false,
	output: '',
	outputOK: false,
	mainName: '',
	remoteNames: [],
	clickVolume: 100,
	padVolume: 100,
	songNameVolume: 100,
	songTitles: [],
	songKeys: [],
	problems: [],
	section: '',
}

/** How many songs get their own title and key variables (song_1_title … song_20_title). */
export const SONG_VARIABLES = 20

/** Reads a message from ClickPad. Returns undefined for anything that isn't a state message. */
export function parseState(text: string): ClickPadState | undefined {
	let data: unknown
	try {
		data = JSON.parse(text)
	} catch {
		return undefined
	}
	if (!data || typeof data !== 'object' || (data as { type?: unknown }).type !== 'state') return undefined
	// Fill anything missing (an older or newer ClickPad) with safe defaults.
	return { ...EMPTY_STATE, ...(data as Partial<ClickPadState>), type: 'state' }
}

/** Variable names follow the MultiTracks Playback module, so Stream Deck pages read the same way. */
export const VARIABLE_DEFINITIONS: Record<string, { name: string }> = {
	connection_state: { name: 'Anchor connection (connected/connecting/offline)' },
	reconnect_count: { name: 'Connection drops since Companion started this connection' },
	setlist_name: { name: 'Set list name' },
	setlist_song_count: { name: 'Number of songs in the set list' },
	active_song_number: { name: 'Active song number (1-based, 0 = none)' },
	song_title: { name: 'Song title' },
	song_key: { name: 'Song key, e.g. "Bb" or "C#m"' },
	song_key_note: { name: 'Song key note only, e.g. "Bb"' },
	song_scale: { name: 'Song scale (Major/Minor)' },
	song_key_and_scale: { name: 'Song key and scale, e.g. "Bb Major"' },
	tempo_bpm: { name: 'Tempo (BPM), empty for pad-only songs' },
	tempo_label: { name: 'Tempo with units, e.g. "72 BPM", or "Pad only"' },
	song_time_signature: { name: 'Song time signature' },
	next_song_number: { name: 'Next song number (0 = none)' },
	next_song_title: { name: 'Next song title' },
	next_song_key: { name: 'Next song key' },
	next_song_scale: { name: 'Next song scale' },
	next_song_tempo_bpm: { name: 'Next song tempo (BPM)' },
	next_song_time_signature: { name: 'Next song time signature' },
	next_transition: { name: 'What NEXT will do (Hold/Fade/Auto-start/Stop)' },
	click_play_state: { name: 'Click play state (stopped/starting/count-in/playing)' },
	count_in: { name: 'Count-in number (0 when not counting in)' },
	bar: { name: 'Bar number (0 when not playing)' },
	beat: { name: 'Beat in the bar (0 when not playing)' },
	pad_play_state: { name: 'Pad play state (playing/stopped)' },
	announcing: { name: 'Announcement speaking (true/false)' },
	audio_output: { name: 'Anchor audio output name' },
	clickpad_name: { name: "This Anchor's name (set in Anchor › Setup › Remotes and Companion)" },
	remote_count: { name: 'Number of remotes connected' },
	remote_names: { name: 'Names of the remotes connected, e.g. "Keys, Drums"' },
	click_volume: { name: 'Click level (0–100)' },
	pad_volume: { name: 'Pad level (0–100)' },
	song_name_volume: { name: 'Song name (announcement) level (0–100)' },
	section: { name: 'Section playing now, e.g. "verse 2" (empty otherwise)' },
	problem_count: { name: 'Number of problems right now (0 when all is well)' },
	problem: { name: 'The first problem, in plain English (empty when all is well)' },
	problems: { name: 'Every problem, separated by " · " (empty when all is well)' },
	...Object.fromEntries(
		Array.from({ length: SONG_VARIABLES }, (_, i) => i + 1).flatMap((n) => [
			[`song_${n}_title`, { name: `Song ${n} in the set list: title` }],
			[`song_${n}_key`, { name: `Song ${n} in the set list: key` }],
		]),
	),
}

const capital = (text: string) => (text ? text[0].toUpperCase() + text.slice(1) : '')

/** The problems Anchor reports, ignoring anything that isn't text. ClickPad sends none. */
export function problemList(state: ClickPadState): string[] {
	if (!Array.isArray(state.problems)) return []
	return state.problems.filter((p): p is string => typeof p === 'string' && p.trim() !== '')
}

/** All variable values for a state. */
export function variableValues(
	state: ClickPadState,
	connection: 'connected' | 'connecting' | 'offline',
	reconnectCount = 0,
): Record<string, string | number | boolean> {
	const clickState: Record<ClickPadState['click'], string> = {
		off: 'stopped',
		starting: 'starting',
		countIn: 'count-in',
		running: 'playing',
	}
	const problems = problemList(state)
	return {
		connection_state: connection,
		reconnect_count: reconnectCount,
		setlist_name: state.setList,
		setlist_song_count: state.songCount,
		active_song_number: state.songNumber,
		song_title: state.title,
		song_key: state.key,
		song_key_note: state.keyTonic,
		song_scale: capital(state.scale),
		song_key_and_scale: state.keyTonic ? `${state.keyTonic} ${capital(state.scale)}`.trim() : '',
		tempo_bpm: state.songClickEnabled ? state.bpm : '',
		tempo_label:
			state.songNumber === 0 ? '' : !state.songClickEnabled ? 'Pad only' : state.bpm ? `${state.bpm} BPM` : '',
		song_time_signature: state.timeSignature,
		next_song_number: state.nextTitle ? state.songNumber + 1 : 0,
		next_song_title: state.nextTitle,
		next_song_key: state.nextKey,
		next_song_scale: capital(state.nextScale),
		next_song_tempo_bpm: state.nextBpm,
		next_song_time_signature: state.nextTimeSignature,
		next_transition: state.nextTransition,
		click_play_state: clickState[state.click] ?? 'stopped',
		count_in: state.countIn,
		bar: state.bar,
		beat: state.beat,
		pad_play_state: state.pad ? 'playing' : 'stopped',
		announcing: state.announcing,
		audio_output: state.output,
		clickpad_name: state.mainName,
		remote_count: Array.isArray(state.remoteNames) ? state.remoteNames.length : 0,
		remote_names: Array.isArray(state.remoteNames) ? state.remoteNames.join(', ') : '',
		click_volume: state.clickVolume,
		pad_volume: state.padVolume,
		song_name_volume: state.songNameVolume,
		section: typeof state.section === 'string' ? state.section : '',
		problem_count: problems.length,
		problem: problems[0] ?? '',
		problems: problems.join(' · '),
		...Object.fromEntries(
			Array.from({ length: SONG_VARIABLES }, (_, i) => i + 1).flatMap((n) => [
				[`song_${n}_title`, (Array.isArray(state.songTitles) && state.songTitles[n - 1]) || ''],
				[`song_${n}_key`, (Array.isArray(state.songKeys) && state.songKeys[n - 1]) || ''],
			]),
		),
	}
}

/**
 * Every ClickPad control. `id` is the Companion action id (Playback-style), `app` is ClickPad's own
 * action name (part of the contract with the app: don't change these).
 */
export const CONTROLS = [
	// Anchor only (older ClickPad ignores them): each does only that, so a missed press can never start a song
	// that was meant to stop. Start/Stop toggles.
	{ id: 'play', app: 'play', name: 'Play', text: 'PLAY' },
	{ id: 'stop', app: 'stop', name: 'Stop', text: 'STOP' },
	{ id: 'start_stop', app: 'startStopToggle', name: 'Start/Stop (GO, or Stop Click)', text: 'START' },
	{ id: 'go', app: 'go', name: 'GO (Pad, Announcement and Click)', text: 'GO' },
	{ id: 'next_song', app: 'nextSong', name: 'Next Song', text: 'NEXT' },
	{ id: 'previous_song', app: 'previousSong', name: 'Previous Song', text: 'PREV' },
	{ id: 'toggle_click', app: 'clickToggle', name: 'Toggle Click On/Off', text: 'CLICK' },
	{ id: 'click_on', app: 'clickStart', name: 'Click On', text: 'CLICK\nON' },
	{ id: 'click_off', app: 'clickStop', name: 'Click Off', text: 'CLICK\nOFF' },
	{ id: 'toggle_pad', app: 'padToggle', name: 'Toggle Pad On/Off', text: 'PAD' },
	{ id: 'pad_on', app: 'padStart', name: 'Pad On', text: 'PAD\nON' },
	{ id: 'pad_off', app: 'padStop', name: 'Pad Off', text: 'PAD\nOFF' },
	{ id: 'stop_all', app: 'stopAll', name: 'Stop All', text: 'STOP\nALL' },
	// Anchor only (older ClickPad ignores them).
	{ id: 'pads_engage', app: 'engage', name: 'Pads: Engage', text: 'ENGAGE' },
	{ id: 'pads_stop', app: 'padsStop', name: 'Pads: Stop', text: 'PADS\nSTOP' },
	{ id: 'fade', app: 'fade', name: 'Fade Song', text: 'FADE' },
	{ id: 'loop', app: 'loop', name: 'Loop Section', text: 'LOOP' },
	// Anchor only: where the song goes when the section playing ends, one section later or earlier per press.
	{ id: 'next_section', app: 'nextSection', name: 'Next Section', text: 'NEXT\nSECTION' },
	{ id: 'previous_section', app: 'previousSection', name: 'Previous Section', text: 'PREV\nSECTION' },
] as const

export type ControlId = (typeof CONTROLS)[number]['id']

/** The JSON ClickPad expects for a control. */
export function commandFor(id: ControlId): string {
	const control = CONTROLS.find((c) => c.id === id)
	return JSON.stringify({ action: control?.app ?? id })
}

export type LevelLayer = 'click' | 'pad' | 'songName'

/** Changes a sound's level by `by` percent (e.g. -10), or sets it exactly with `to`. */
export function levelCommand(layer: LevelLayer, change: { by?: number; to?: number }): string {
	return JSON.stringify({ action: 'adjustLevel', layer, ...change })
}

/** True for ClickPad's "removed" message (Settings › Network › Remove): stop reconnecting. */
export function isRemovedMessage(text: string): boolean {
	try {
		return (JSON.parse(text) as { type?: unknown })?.type === 'removed'
	} catch {
		return false
	}
}

/** Sent when connecting, so ClickPad's Settings › Remote lists this connection as Companion, by name. */
export function helloCommand(name: string): string {
	return JSON.stringify({ action: 'hello', name, client: 'companion' })
}

export function selectSongCommand(song: number): string {
	return JSON.stringify({ action: 'selectSong', song: Math.max(1, Math.round(song)) })
}
