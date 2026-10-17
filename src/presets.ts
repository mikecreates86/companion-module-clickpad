import type { ModuleSchema } from './main.js'
import type ModuleInstance from './main.js'
import type { CompanionPresetDefinitions, CompanionPresetSection } from '@companion-module/base'
import { CONTROLS } from './state.js'

const SONG_BUTTONS = 10
const WHITE = 0xffffff
const DARK = 0x1e2636
const GREEN = 0x2e8b57
const RED = 0xa94a4a
const TEAL = 0x3f8f8f
const AMBER = 0xd99a2b

/** Ready-made buttons: live song info, every control (with lit feedback), and song pickers. */
export function UpdatePresets(self: ModuleInstance): void {
	// Variables are named after this connection (e.g. "clickpad"), so buttons read the right one.
	const v = self.label
	const songNumbers = Array.from({ length: SONG_BUTTONS }, (_, i) => i + 1)
	// One section, like the Playback module: controls, song selection and status displays.
	const structure: CompanionPresetSection[] = [
		{
			id: 'clickpad',
			name: 'ClickPad',
			definitions: [
				{ id: 'controls', name: 'ClickPad controls', type: 'simple', presets: CONTROLS.map((c) => c.id) },
				{ id: 'songs', name: 'Select song', type: 'simple', presets: songNumbers.map((n) => `select_song_${n}`) },
				{
					id: 'levels',
					name: 'Levels',
					type: 'simple',
					presets: [
						'level_click_down',
						'level_click_up',
						'level_pad_down',
						'level_pad_up',
						'level_song_name_down',
						'level_song_name_up',
					],
				},
				{
					id: 'display',
					name: 'Status displays',
					type: 'simple',
					presets: [
						'display_title',
						'display_key',
						'display_tempo',
						'display_key_tempo',
						'display_next',
						'display_status',
					],
				},
			],
		},
	]

	const info = (name: string, text: string, size: 'auto' | number = 'auto') => ({
		type: 'simple' as const,
		name,
		style: { text, size, color: WHITE, bgcolor: DARK, show_topbar: false },
		steps: [{ down: [], up: [] }],
		feedbacks: [],
	})

	const controlStyle: Record<
		string,
		{ bgcolor: number; lit?: { feedbackId: string; bgcolor: number; color?: number } }
	> = {
		start_stop: { bgcolor: GREEN },
		go: { bgcolor: GREEN, lit: { feedbackId: 'click_running', bgcolor: 0x1f6b44 } },
		next_song: { bgcolor: TEAL },
		previous_song: { bgcolor: DARK },
		toggle_click: { bgcolor: DARK, lit: { feedbackId: 'click_running', bgcolor: GREEN } },
		click_on: { bgcolor: DARK, lit: { feedbackId: 'click_running', bgcolor: GREEN } },
		click_off: { bgcolor: DARK },
		toggle_pad: { bgcolor: DARK, lit: { feedbackId: 'pad_on', bgcolor: TEAL } },
		pad_on: { bgcolor: DARK, lit: { feedbackId: 'pad_on', bgcolor: TEAL } },
		pad_off: { bgcolor: DARK },
		stop_all: { bgcolor: RED },
	}

	const presets: Record<string, unknown> = {
		display_title: info('Song title', `$(${v}:song_title)`, 14),
		display_key: info('Song key', `$(${v}:song_key)`, 44),
		display_tempo: info('Tempo', `$(${v}:tempo_label)\n$(${v}:song_time_signature)`),
		display_key_tempo: info('Key and tempo', `$(${v}:song_key_and_scale)\n$(${v}:tempo_label)`),
		display_next: info('Next song', `NEXT\n$(${v}:next_song_title)\n$(${v}:next_song_key) $(${v}:next_transition)`, 14),
		display_status: {
			...info('Click and pad status', `CLICK $(${v}:click_play_state)\nPAD $(${v}:pad_play_state)`, 14),
			feedbacks: [
				{ feedbackId: 'count_in', options: {}, style: { bgcolor: AMBER, color: 0x000000 } },
				{ feedbackId: 'connected', options: {}, isInverted: true, style: { bgcolor: RED, color: WHITE } },
			],
		},
	}

	for (const control of CONTROLS) {
		const look = controlStyle[control.id]
		presets[control.id] = {
			type: 'simple',
			name: control.name,
			style: { text: control.text, size: 'auto', color: WHITE, bgcolor: look.bgcolor, show_topbar: false },
			steps: [{ down: [{ actionId: control.id, options: {} }], up: [] }],
			feedbacks: look.lit
				? [{ feedbackId: look.lit.feedbackId, options: {}, style: { bgcolor: look.lit.bgcolor } }]
				: [],
		}
	}
	// The big Start/Stop button reads STOP while the click runs.
	;(presets.start_stop as { feedbacks: unknown[] }).feedbacks = [
		{ feedbackId: 'click_running', options: {}, style: { bgcolor: RED, text: 'STOP' } },
	]

	for (const n of songNumbers) {
		presets[`select_song_${n}`] = {
			type: 'simple',
			name: `Select song ${n}`,
			// Shows the song's title (and key) from the set list, e.g. "2 · Forever YHWH · E".
			style: {
				text: `${n} · $(${v}:song_${n}_title)\n$(${v}:song_${n}_key)`,
				size: 14,
				color: WHITE,
				bgcolor: DARK,
				show_topbar: false,
			},
			steps: [{ down: [{ actionId: 'select_song', options: { song: n } }], up: [] }],
			feedbacks: [{ feedbackId: 'current_song', options: { song: n }, style: { bgcolor: GREEN } }],
		}
	}

	// Levels: down / up buttons for each sound, showing the current level.
	const levelButtons: [string, string, string, number][] = [
		['level_click_down', 'Click level down', 'click', -10],
		['level_click_up', 'Click level up', 'click', 10],
		['level_pad_down', 'Pad level down', 'pad', -10],
		['level_pad_up', 'Pad level up', 'pad', 10],
		['level_song_name_down', 'Song name level down', 'songName', -10],
		['level_song_name_up', 'Song name level up', 'songName', 10],
	]
	const levelVariable: Record<string, string> = {
		click: 'click_volume',
		pad: 'pad_volume',
		songName: 'song_name_volume',
	}
	const levelLabel: Record<string, string> = { click: 'CLICK', pad: 'PAD', songName: 'NAME' }
	for (const [id, name, layer, by] of levelButtons) {
		presets[id] = {
			type: 'simple',
			name,
			style: {
				text: `${levelLabel[layer]} ${by < 0 ? '−' : '+'}\n$(${v}:${levelVariable[layer]})%`,
				size: 14,
				color: WHITE,
				bgcolor: DARK,
				show_topbar: false,
			},
			steps: [{ down: [{ actionId: 'level_adjust', options: { layer, by } }], up: [] }],
			feedbacks: [],
		}
	}

	self.setPresetDefinitions(structure, presets as CompanionPresetDefinitions<ModuleSchema>)
}
