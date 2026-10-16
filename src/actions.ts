import type ModuleInstance from './main.js'
import type { CompanionActionDefinitions } from '@companion-module/base'
import { commandFor, CONTROLS, selectSongCommand, type ControlId } from './state.js'

export type ActionsSchema = Record<ControlId, { options: Record<string, never> }> & {
	select_song: { options: { song: number } }
}

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
	self.setActionDefinitions(definitions as never)
}
