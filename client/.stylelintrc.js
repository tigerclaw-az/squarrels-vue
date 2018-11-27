module.exports = {
	extends: 'stylelint-config-recommended-scss',
	plugins: ['stylelint-order'],
	rules: {
		'at-rule-blacklist': ['debug'],
		'color-hex-length': 'long',
		'declaration-block-no-duplicate-properties': true,
		'font-weight-notation': 'numeric',
		'indentation': 'tab',
		'length-zero-no-unit': true,
		'max-nesting-depth': 6,
		'no-descending-specificity': null,
		'no-missing-end-of-source-newline': true,
		'number-leading-zero': 'always',
		'property-no-vendor-prefix': true,
		'selector-no-vendor-prefix': true,
		'string-quotes': 'double',
		'order/order': [
			'custom-properties',
			'dollar-variables',
			{
				type: 'at-rule',
				name: 'extend',
			},
			{
				type: 'at-rule',
				name: 'include',
			},
			'declarations',
			'rules',
			{
				type: 'at-rule',
				name: 'include',
				parameter: 'media-breakpoint-*',
				hasBlock: true,
			},
			{
				type: 'at-rule',
				name: 'media',
			},
		],
		'order/properties-alphabetical-order': true,
	},
};
