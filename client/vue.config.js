module.exports = {
	configureWebpack: {
		devServer: {
			hot: true,
			inline: true,
			host: 'squarrels',
			port: 8181,
			open: true,
		},
	},
};
