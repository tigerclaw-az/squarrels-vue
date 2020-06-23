const webpack = require('webpack');

module.exports = {
	configureWebpack: {
		devServer: {
			hot: true,
			inline: true,
			host: 'squarrels',
			port: 8181,
			open: true,
			watchOptions: {
				poll: true,
			},
		},
	},
	chainWebpack: config => {
		config.resolve.alias.set('lodash.get', 'lodash/get');

		// Remove moment locales from build since we only need 'en'
		config.plugin('moment').use(webpack.IgnorePlugin, [/^\.\/locale$/, /moment$/]);

		/* Leave this in case we need other locales later */
		// .use(webpack.ContextReplacementPlugin, [
		// 	/moment[\/\\]locale$/,
		// 	/en/,
		// ]);
	},
};
