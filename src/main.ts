import { InstanceBase, InstanceStatus, type SomeCompanionConfigField } from '@companion-module/base'
import { GetConfigFields, type ModuleConfig } from './config.js'
import { ClickPadConnection } from './connection.js'
import {
	EMPTY_STATE,
	parseState,
	variableValues,
	VARIABLE_DEFINITIONS,
	type ClickPadState,
	helloCommand,
} from './state.js'
import { UpdateActions, type ActionsSchema } from './actions.js'
import { UpdateFeedbacks, type FeedbacksSchema } from './feedbacks.js'
import { UpdatePresets } from './presets.js'
import { UpgradeScripts } from './upgrades.js'

export type ModuleSchema = {
	config: ModuleConfig
	secrets: undefined
	actions: ActionsSchema
	feedbacks: FeedbacksSchema
	variables: Record<string, string | number | boolean>
}

export { UpgradeScripts }

export default class ModuleInstance extends InstanceBase<ModuleSchema> {
	config!: ModuleConfig
	state: ClickPadState = { ...EMPTY_STATE }
	connected = false
	private connection?: ClickPadConnection
	private connectionState: 'connected' | 'connecting' | 'offline' = 'connecting'
	// These survive reconnects so logs and counters describe the whole Companion session.
	private reconnectCount = 0
	private everConnected = false
	private outageLogged = false

	async init(config: ModuleConfig): Promise<void> {
		this.config = config
		UpdateActions(this)
		UpdateFeedbacks(this)
		UpdatePresets(this)
		this.setVariableDefinitions(VARIABLE_DEFINITIONS)
		this.publish()
		this.connect()
	}

	async destroy(): Promise<void> {
		this.connection?.stop()
		this.connection = undefined
	}

	async configUpdated(config: ModuleConfig): Promise<void> {
		this.config = config
		this.connect()
	}

	getConfigFields(): SomeCompanionConfigField[] {
		return GetConfigFields()
	}

	/** Sends a command to ClickPad. Logs (instead of failing) when ClickPad isn't connected. */
	send(text: string): void {
		if (!this.connection?.send(text)) this.log('warn', 'ClickPad is not connected; the button press was not sent')
	}

	private connect(): void {
		this.connection?.stop()
		this.connected = false
		this.state = { ...EMPTY_STATE }
		this.publish()
		const host = (this.config.host ?? '').trim()
		const port = Number(this.config.port)
		if (!host || !Number.isInteger(port) || port < 1 || port > 65535) {
			this.updateStatus(InstanceStatus.BadConfig, 'Enter the ClickPad computer address and port')
			return
		}
		this.updateStatus(InstanceStatus.Connecting, `Connecting to ClickPad at ${host}:${port}`)
		const connection = new ClickPadConnection(`ws://${host.includes(':') ? `[${host}]` : host}:${port}`, {
			onOpen: () => {
				if (this.everConnected) this.log('info', 'Reconnected to ClickPad')
				this.everConnected = true
				this.outageLogged = false
				this.connected = true
				this.connectionState = 'connected'
				this.connection?.send(helloCommand(`Companion (${this.label})`))
				this.updateStatus(InstanceStatus.Ok)
				this.publish()
			},
			onClose: (reason) => {
				const wasConnected = this.connected
				if (wasConnected) this.reconnectCount += 1
				this.connected = false
				this.connectionState = this.everConnected ? 'offline' : 'connecting'
				this.state = { ...EMPTY_STATE }
				// Log an outage once, not on every retry.
				if (!this.outageLogged) {
					this.log('warn', `${reason} at ${host}:${port}. Retrying automatically.`)
					this.outageLogged = true
				}
				this.updateStatus(
					InstanceStatus.ConnectionFailure,
					`${reason}. Check ClickPad is open and Settings › Companion is on.`,
				)
				if (wasConnected) this.publish()
			},
			onMessage: (text) => {
				const state = parseState(text)
				if (!state) return
				this.state = state
				this.publish()
			},
		})
		this.connection = connection
		connection.start()
	}

	private publish(): void {
		this.setVariableValues(variableValues(this.state, this.connectionState, this.reconnectCount))
		this.checkAllFeedbacks()
	}
}
