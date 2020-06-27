export const config = Object.freeze({
	MAX_PLAYERS: 4,
	MAX_CARDS: 7,
});

export const logger = Object.freeze({
	logLevel: process.env.VUE_APP_LOG_LEVEL,
	stringifyArguments: false,
	showLogLevel: true,
	showMethodName: true,
	separator: '|',
	showConsoleColors: true,
});

export const toast = Object.freeze({
	duration: 8000,
	iconPack: 'fontawesome',
});

export const websocket = Object.freeze({
	format: 'json',
	reconnection: true, // (Boolean) whether to reconnect automatically (false)
	reconnectionAttempts: 10, // (Number) number of reconnection attempts before giving up (Infinity),
	reconnectionDelay: 5000, // (Number) how long to initially wait before attempting a new (1000)
});

// export const webStorage = Object.freeze({
// 	prefix: 'squarrels',
// 	driver: 'local',
// });
