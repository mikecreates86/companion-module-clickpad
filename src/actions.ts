import type ModuleInstance from './main.js'
import type { CompanionActionDefinitions } from '@companion-module/base'
import { commandFor, CONTROLS, levelCommand, selectSongCommand, type ControlId, type LevelLayer } from './state.js'

export type ActionsSchema = Record<ControlId, { options: Record<string, never> }> & {
	select_song: { options: { song: number } }
	level_adjust: { options: { layer: LevelLayer; by: number } }
	level_set: { options: { layer: LevelLayer; to: number } }
}

const LAYER_CHOICES = [
	{ id: 'click', label: 'Click' },
	{ id: 'pad', label: 'Pad' },
	{ id: 'songName', label: 'Song name (announcement)' },
]

export function UpdateActions(self: ModuleInstance): void {
	const definitions: Partial<CompanionActionDefinitions<ActionsSchema>> = {}
	for (const control of CONTROLS) {
		;(definitions as Record<string, unknown>)[control.id] = {
			name: control.name,
			options: [],
			callback: () => self.send(commandFor(control.id)),
		}
	}
	definitions.select_song = {
		name: 'Select Song',
		description: 'Selects a song in the set list (1 = first song). Nothing starts until GO.',
		options: [{ type: 'number', id: 'song', label: 'Song number', default: 1, min: 1, max: 100 }],
		callback: (event) => self.send(selectSongCommand(Number(event.options.song))),
	}
	definitions.level_adjust = {
		name: 'Level Up/Down',
		description: 'Turns the click, pad or song name up or down (percent, e.g. -10).',
		options: [
			{ type: 'dropdown', id: 'layer', label: 'Sound', default: 'click', choices: LAYER_CHOICES },
			{ type: 'number', id: 'by', label: 'Change by (%)', default: 10, min: -100, max: 100 },
		],
		callback: (event) => self.send(levelCommand(event.options.layer, { by: Number(event.options.by) })),
	}
	definitions.level_set = {
		name: 'Set Level',
		description: 'Sets the click, pad or song name to an exact level (0–100%).',
		options: [
			{ type: 'dropdown', id: 'layer', label: 'Sound', default: 'click', choices: LAYER_CHOICES },
			{ type: 'number', id: 'to', label: 'Level (%)', default: 100, min: 0, max: 100 },
		],
		callback: (event) => self.send(levelCommand(event.options.layer, { to: Number(event.options.to) })),
	}
	self.setActionDefinitions(definitions as never)
}
