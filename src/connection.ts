/**
 * Keeps a WebSocket connection to ClickPad open, reconnecting by itself (every 2 s, then up to
 * every 10 s) whenever it drops: ClickPad restarting, the device sleeping, a network blip.
 * Uses Node's built-in WebSocket, so the module has no extra dependencies.
 */
export interface ConnectionEvents {
	onOpen: () => void
	onClose: (reason: string) => void
	onMessage: (text: string) => void
}

export class ClickPadConnection {
	private socket?: WebSocket
	private retryTimer?: NodeJS.Timeout
	private retryDelay = 2000
	private stopped = false

	constructor(
		private readonly url: string,
		private readonly events: ConnectionEvents,
	) {}

	start(): void {
		this.stopped = false
		this.open()
	}

	stop(): void {
		this.stopped = true
		if (this.retryTimer) clearTimeout(this.retryTimer)
		this.retryTimer = undefined
		const socket = this.socket
		this.socket = undefined
		try {
			socket?.close()
		} catch {
			// already closed
		}
	}

	/** Sends a command; returns false if not connected (the press is dropped, not queued). */
	send(text: string): boolean {
		if (this.socket?.readyState !== WebSocket.OPEN) return false
		this.socket.send(text)
		return true
	}

	private open(): void {
		if (this.stopped) return
		let socket: WebSocket
		try {
			socket = new WebSocket(this.url)
		} catch (error) {
			this.events.onClose(`Bad address: ${String(error)}`)
			this.scheduleRetry()
			return
		}
		this.socket = socket
		socket.onopen = () => {
			this.retryDelay = 2000
			this.events.onOpen()
		}
		socket.onmessage = (event) => {
			if (typeof event.data === 'string') this.events.onMessage(event.data)
		}
		socket.onerror = () => {
			// onclose follows and handles the retry
		}
		socket.onclose = () => {
			if (this.socket !== socket) return
			this.socket = undefined
			this.events.onClose('Not connected to ClickPad')
			this.scheduleRetry()
		}
	}

	private scheduleRetry(): void {
		if (this.stopped || this.retryTimer) return
		this.retryTimer = setTimeout(() => {
			this.retryTimer = undefined
			this.open()
		}, this.retryDelay)
		this.retryDelay = Math.min(this.retryDelay * 2, 10000)
	}
}
