import type ModuleInstance from './main.js'
import type { CompanionFeedbackDefinitions } from '@companion-module/base'
import { problemList } from './state.js'

export type FeedbacksSchema = {
	connected: { type: 'boolean'; options: Record<string, never> }
	click_running: { type: 'boolean'; options: Record<string, never> }
	count_in: { type: 'boolean'; options: Record<string, never> }
	pad_on: { type: 'boolean'; options: Record<string, never> }
	announcing: { type: 'boolean'; options: Record<string, never> }
	pad_only_song: { type: 'boolean'; options: Record<string, never> }
	current_song: { type: 'boolean'; options: { song: number } }
	has_problems: { type: 'boolean'; options: Record<string, never> }
}

const GREEN = 0x2e8b57
const AMBER = 0xd99a2b
const TEAL = 0x3f8f8f
const GREY = 0x444444
const RED = 0xc0392b

export function UpdateFeedbacks(self: ModuleInstance): void {
	const definitions: CompanionFeedbackDefinitions<FeedbacksSchema> = {
		connected: {
			name: 'Anchor Connected',
			type: 'boolean',
			defaultStyle: { bgcolor: GREEN, color: 0xffffff },
			options: [],
			callback: () => self.connected,
		},
		click_running: {
			name: 'Click Playing (count-in or song)',
			type: 'boolean',
			defaultStyle: { bgcolor: GREEN, color: 0xffffff },
			options: [],
			callback: () => self.state.click === 'running' || self.state.click === 'countIn',
		},
		count_in: {
			name: 'Click Counting In',
			type: 'boolean',
			defaultStyle: { bgcolor: AMBER, color: 0x000000 },
			options: [],
			callback: () => self.state.click === 'countIn',
		},
		pad_on: {
			name: 'Pad Playing',
			type: 'boolean',
			defaultStyle: { bgcolor: TEAL, color: 0xffffff },
			options: [],
			callback: () => self.state.pad,
		},
		announcing: {
			name: 'Announcement Speaking',
			type: 'boolean',
			defaultStyle: { bgcolor: AMBER, color: 0x000000 },
			options: [],
			callback: () => self.state.announcing,
		},
		pad_only_song: {
			name: 'Active Song Is Pad Only (no click)',
			type: 'boolean',
			defaultStyle: { bgcolor: GREY, color: 0xffffff },
			options: [],
			callback: () => self.state.songNumber > 0 && !self.state.songClickEnabled,
		},
		current_song: {
			name: 'Active Song Number',
			type: 'boolean',
			defaultStyle: { bgcolor: GREEN, color: 0xffffff },
			options: [{ type: 'number', id: 'song', label: 'Song number', default: 1, min: 1, max: 100 }],
			callback: (feedback) => self.state.songNumber === Number(feedback.options.song),
		},
		has_problems: {
			name: 'Something Needs Attention',
			description: 'On while Anchor reports a problem (its red dot). Off when all is well.',
			type: 'boolean',
			defaultStyle: { bgcolor: RED, color: 0xffffff },
			options: [],
			callback: () => problemList(self.state).length > 0,
		},
	}
	self.setFeedbackDefinitions(definitions)
}
