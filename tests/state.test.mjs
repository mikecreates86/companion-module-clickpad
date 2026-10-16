import assert from 'node:assert/strict'
import test from 'node:test'
import { commandFor, CONTROLS, parseState, selectSongCommand, variableValues } from '../dist/state.js'

const sample = JSON.stringify({
	type: 'state',
	protocolVersion: 1,
	setList: 'October 18, 2026 · Sunday',
	songNumber: 2,
	songCount: 3,
	title: 'Forever YHWH',
	key: 'E',
	keyTonic: 'E',
	scale: 'major',
	bpm: '71',
	timeSignature: '6/8',
	songClickEnabled: true,
	announce: true,
	nextTitle: 'Remembrance',
	nextKey: 'A',
	nextScale: 'major',
	nextBpm: '70',
	nextTimeSignature: '4/4',
	nextTransition: 'Fade',
	click: 'countIn',
	countIn: 3,
	bar: 0,
	beat: 0,
	pad: true,
	announcing: false,
	output: 'iConnectivity',
	outputOK: true,
})

test('reads ClickPad state into variables', () => {
	const values = variableValues(parseState(sample), 'connected', 2)
	assert.equal(values.song_title, 'Forever YHWH')
	assert.equal(values.song_key, 'E')
	assert.equal(values.song_scale, 'Major')
	assert.equal(values.song_key_and_scale, 'E Major')
	assert.equal(values.tempo_bpm, '71')
	assert.equal(values.tempo_label, '71 BPM')
	assert.equal(values.song_time_signature, '6/8')
	assert.equal(values.active_song_number, 2)
	assert.equal(values.setlist_song_count, 3)
	assert.equal(values.next_song_number, 3)
	assert.equal(values.next_song_key, 'A')
	assert.equal(values.next_song_tempo_bpm, '70')
	assert.equal(values.click_play_state, 'count-in')
	assert.equal(values.count_in, 3)
	assert.equal(values.pad_play_state, 'playing')
	assert.equal(values.connection_state, 'connected')
	assert.equal(values.reconnect_count, 2)
})

test('pad-only songs show "Pad only" instead of a tempo', () => {
	const state = parseState(JSON.stringify({ type: 'state', songNumber: 1, bpm: '70', songClickEnabled: false }))
	assert.equal(variableValues(state, 'connected').tempo_label, 'Pad only')
	assert.equal(variableValues(state, 'connected').tempo_bpm, '')
})

test('ignores anything that is not a state message, and fills missing fields', () => {
	assert.equal(parseState('not json'), undefined)
	assert.equal(parseState('{"type":"other"}'), undefined)
	const partial = parseState('{"type":"state","title":"Only a title"}')
	assert.equal(partial.title, 'Only a title')
	assert.equal(partial.click, 'off')
	assert.equal(partial.pad, false)
})

test('sends the action names ClickPad understands', () => {
	const app = CONTROLS.map((c) => c.app)
	assert.deepEqual(app, [
		'startStopToggle',
		'go',
		'nextSong',
		'previousSong',
		'clickToggle',
		'clickStart',
		'clickStop',
		'padToggle',
		'padStart',
		'padStop',
		'stopAll',
	])
	assert.equal(commandFor('go'), '{"action":"go"}')
	assert.equal(commandFor('toggle_pad'), '{"action":"padToggle"}')
	assert.equal(commandFor('start_stop'), '{"action":"startStopToggle"}')
	assert.equal(selectSongCommand(3), '{"action":"selectSong","song":3}')
	assert.equal(selectSongCommand(0), '{"action":"selectSong","song":1}')
})
