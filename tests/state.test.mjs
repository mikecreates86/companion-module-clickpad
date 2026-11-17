import assert from 'node:assert/strict'
import test from 'node:test'
import {
	commandFor,
	CONTROLS,
	helloCommand,
	isRemovedMessage,
	levelCommand,
	parseState,
	problemList,
	selectSongCommand,
	variableValues,
} from '../dist/state.js'

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
		'play',
		'stop',
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
	// Every button must be one ClickPad acts on (its TransportAction names); anything else would do nothing.
	const clickPadActions = new Set([
		'go',
		'play',
		'stop',
		'startStopToggle',
		'clickStart',
		'clickStop',
		'clickToggle',
		'padStart',
		'padStop',
		'padToggle',
		'nextSong',
		'previousSong',
		'stopAll',
		'tapTempo',
	])
	for (const a of app) assert.ok(clickPadActions.has(a), `ClickPad doesn't know "${a}"`)
	assert.equal(commandFor('go'), '{"action":"go"}')
	assert.equal(commandFor('play'), '{"action":"play"}')
	assert.equal(commandFor('stop'), '{"action":"stop"}')
	assert.equal(commandFor('toggle_pad'), '{"action":"padToggle"}')
	assert.equal(commandFor('start_stop'), '{"action":"startStopToggle"}')
	assert.equal(selectSongCommand(3), '{"action":"selectSong","song":3}')
	assert.equal(selectSongCommand(0), '{"action":"selectSong","song":1}')
})

test('shows the ClickPad name and its connected remotes', () => {
	const state = parseState(
		JSON.stringify({ type: 'state', mainName: 'Stage Left', remoteNames: ['Drums', 'Keys Laptop'] }),
	)
	const values = variableValues(state, 'connected')
	assert.equal(values.clickpad_name, 'Stage Left')
	assert.equal(values.remote_count, 2)
	assert.equal(values.remote_names, 'Drums, Keys Laptop')
	// An older ClickPad sends neither: the variables are just empty.
	const old = variableValues(parseState(JSON.stringify({ type: 'state' })), 'connected')
	assert.equal(old.clickpad_name, '')
	assert.equal(old.remote_count, 0)
})

test('introduces itself to ClickPad as Companion', () => {
	assert.deepEqual(JSON.parse(helloCommand('Companion (clickpad)')), {
		action: 'hello',
		name: 'Companion (clickpad)',
		client: 'companion',
	})
})

test('recognises being removed by ClickPad', () => {
	assert.equal(isRemovedMessage('{"type":"removed"}'), true)
	assert.equal(isRemovedMessage('{"type":"state"}'), false)
	assert.equal(isRemovedMessage('not json'), false)
})

test('song titles and keys, and levels, become variables', () => {
	const state = parseState(
		JSON.stringify({ type: 'state', songTitles: ['Forever YHWH', 'Remembrance'], songKeys: ['E', 'A'], padVolume: 70 }),
	)
	const values = variableValues(state, 'connected')
	assert.equal(values.song_1_title, 'Forever YHWH')
	assert.equal(values.song_2_key, 'A')
	assert.equal(values.song_3_title, '')
	assert.equal(values.pad_volume, 70)
	assert.equal(values.click_volume, 100)
})

test('level commands', () => {
	assert.deepEqual(JSON.parse(levelCommand('pad', { by: -10 })), { action: 'adjustLevel', layer: 'pad', by: -10 })
	assert.deepEqual(JSON.parse(levelCommand('click', { to: 80 })), { action: 'adjustLevel', layer: 'click', to: 80 })
})

test('ClickPad problem (the red dot) becomes variables', () => {
	const state = parseState(JSON.stringify({ type: 'state', problem: 'Interface unplugged' }))
	const values = variableValues(state, 'connected')
	assert.equal(values.problem_count, 1)
	assert.equal(values.problem, 'Interface unplugged')
	assert.equal(values.problems, 'Interface unplugged')
	assert.deepEqual(problemList(state), ['Interface unplugged'])
})

test('No problem sent (all well, or an older ClickPad) leaves them empty', () => {
	const state = parseState(sample)
	const values = variableValues(state, 'connected')
	assert.equal(values.problem_count, 0)
	assert.equal(values.problem, '')
	assert.equal(values.problems, '')
	assert.deepEqual(problemList(state), [])
	// Anything odd is ignored rather than shown.
	const odd = parseState(JSON.stringify({ type: 'state', problem: 5 }))
	assert.equal(variableValues(odd, 'connected').problem_count, 0)
	const blank = parseState(JSON.stringify({ type: 'state', problem: '  ' }))
	assert.equal(variableValues(blank, 'connected').problem, '')
})
