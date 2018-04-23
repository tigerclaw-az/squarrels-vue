export const config = Object.freeze({
	debug: true,
	host: 'squarrels',
});

export const websocket = Object.freeze({
	format: 'json',
	reconnection: true, // (Boolean) whether to reconnect automatically (false)
	reconnectionAttempts: 5, // (Number) number of reconnection attempts before giving up (Infinity),
	reconnectionDelay: 2000, // (Number) how long to initially wait before attempting a new (1000)
})

export const localStorage = Object.freeze({
	name: 'storage',
});

export const logger = Object.freeze({
	logLevel: 'debug',
	stringifyArguments: false,
	showLogLevel: true,
	showMethodName: true,
	separator: '|',
	showConsoleColors: true,
})
