import { Regex, type SomeCompanionConfigField } from '@companion-module/base'

export type ModuleConfig = {
	host: string
	port: number
}

export function GetConfigFields(): SomeCompanionConfigField[] {
	return [
		{
			type: 'static-text',
			id: 'info',
			label: 'Before you start',
			width: 12,
			value:
				'In Anchor, open Setup and turn on "Allow remotes and Companion". It shows the device\'s address and port to enter here.',
		},
		{
			type: 'textinput',
			id: 'host',
			label: 'Anchor device address',
			tooltip:
				'The IP address shown in Anchor › Setup › Remotes and Companion. Use 127.0.0.1 if Companion runs on the same device. Give the Anchor device a fixed (static or DHCP-reserved) IP address so it cannot change between services.',
			width: 8,
			default: '127.0.0.1',
			regex: Regex.HOSTNAME,
		},
		{
			type: 'number',
			id: 'port',
			label: 'Port',
			tooltip: 'The port shown in Anchor › Setup › Remotes and Companion (normally 9330).',
			width: 4,
			default: 9330,
			min: 1,
			max: 65535,
		},
	]
}
