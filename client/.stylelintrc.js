module.exports = {
	extends: 'stylelint-config-recommended-scss',
	rules: {
		'at-rule-blacklist': ['debug'],
		'color-hex-length': 'long',
		'declaration-block-no-duplicate-properties': true,
		'font-weight-notation': 'numeric',
		indentation: 'tab',
		'length-zero-no-unit': true,
		'max-nesting-depth': 6,
		'no-missing-end-of-source-newline': true,
		'number-leading-zero': 'always',
		'property-no-vendor-prefix': true,
		'selector-no-vendor-prefix': true,
		'string-quotes': 'double',
	},
};
