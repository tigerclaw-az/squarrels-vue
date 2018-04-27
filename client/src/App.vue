<template>
	<div id="app" v-cloak>
		<vue-toastr ref="toastr"></vue-toastr>
		<router-view/>
	</div>
</template>

<style lang="scss">
	@import '~@/assets/scss/variables';
	@import '../node_modules/bootstrap/scss/bootstrap.scss';

	* {
		// @include user-select(none);
	}

	/* Space out content a bit */
	body {
		padding-bottom: .25rem;
		padding-top: .25rem;
	}

	a {
		&.disabled {
			cursor: default;
			pointer-events: none;
		}
	}

	textarea {
		resize: none;
	}

	[v-cloak] {
		.v-cloak--hidden {
			display: none;
		}
	}

	.main {
		-webkit-backface-visibility: hidden; // sass-lint:disable-line no-vendor-prefixes
		// animation: gradient 30s linear infinite;
		background: linear-gradient(320deg, get-color(carnaby-tan), get-color(cioccolato), get-color(kenyan-copper), get-color(carnaby-tan));
		// background-size: 600% 600%;
		height: 99vh;
		transform: translateZ(0);
	}

	.content {
		height: 100vh;
		width: 100vw;
	}

	/* Everything but the jumbotron gets side spacing for mobile first views */
	.header,
	.marketing,
	.footer {
		padding-left: 15px;
		padding-right: 15px;
	}

	/* Custom page header */
	.header {
		border-bottom: 1px solid map-get($colors, 'gallery-grey');

		/* Make the masthead heading the same height as the navigation */
		h3 {
			line-height: 2.2;
			margin-bottom: 0;
			margin-top: 0;
			padding-bottom: 1rem;
		}
	}

	/* Custom page footer */
	.footer {
		border-top: 1px solid map-get($colors, 'gallery-grey');
		color: map-get($colors, 'boulder');
		padding-top: 1rem;
	}

	.container-narrow > hr {
		margin: 30px 0;
	}

	/* Main marketing message and sign up button */
	.jumbotron {
		border-bottom: 1px solid map-get($colors, 'gallery-grey');
		text-align: center;

		.btn {
			font-size: 21px;
			padding: 14px 24px;
		}
	}

	.nav,
	.pagination,
	.carousel,
	.panel-title a { // sass-lint:disable-line force-element-nesting
		cursor: pointer;
	}

	/* Responsive: Portrait tablets and up */
	@media(min-width: #{$container-tablet}) {
		/* Remove the padding we set earlier */
		.header,
		.marketing,
		.footer {
			padding-left: 0;
			padding-right: 0;
		}

		/* Space out the masthead */
		.header {
			margin-bottom: 1.75rem;
		}

		/* Remove the bottom border on the jumbotron for visual effect */
		.jumbotron {
			border-bottom: 0;
		}
	}
</style>
