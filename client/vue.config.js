const webpack = require('webpack');

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
	chainWebpack: config => {
		config.resolve.alias.set('lodash.get', 'lodash/get');

		// Remove moment locales from build since we only need 'en'
		config
			.plugin('moment')
			.use(webpack.IgnorePlugin, [/^\.\/locale$/, /moment$/]);

		config.module
			.rule('vue')
			.use('vue-loader')
			.loader('vue-loader')
			.tap(options => {
				options.transformAssetUrls = {
					'img': 'src',
					'image': 'xlink:href',
					'b-avatar': 'src',
					'b-img': 'src',
					'b-img-lazy': ['src', 'blank-src'],
					'b-card': 'img-src',
					'b-card-img': 'src',
					'b-card-img-lazy': ['src', 'blank-src'],
					'b-carousel-slide': 'img-src',
					'b-embed': 'src',
				};

				return options;
			});

		/* Leave this in case we need other locales later */
		// .use(webpack.ContextReplacementPlugin, [
		// 	/moment[\/\\]locale$/,
		// 	/en/,
		// ]);
	},
};
