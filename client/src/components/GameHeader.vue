<template>
	<header>
		<div class="row">
			<span class="header-item game-start">Started @ {{createdAt}}</span>
			<span class="header-item game-round">ROUND: {{round}}</span>
			<span class="header-item settings" uib-dropdown>
				<button id="dropdown-settings" class="btn btn-default btn-dropdown" type="button" uib-dropdown-toggle>
					<i class="icon icon-settings glyphicon glyphicon-cog"></i>
				</button>
				<ul class="dropdown-menu" uib-dropdown-menu role="menu" aria-labelledby="dropdown-settings" @click="onSettingClick">
					<li role="menuitem">
						<a href="#" data-setting="toggle-sound">
							<i class="icon icon-mute glyphicon"
								v-bind:class="{
									'glyphicon-volume-off': isSoundEnabled,
									'glyphicon-volume-down': !isSoundEnabled
								}">
							</i>
							<span v-if="isSoundEnabled">Disable Sounds</span>
							<span v-if="!isSoundEnabled">Enable Sounds</span>
						</a>
					</li>
				</ul>
			</span>
		</div>
	</header>
</template>

<script>
export default {
	name: 'GameHeader',
	props: {
		createdAt: {
			type: Date,
			required: false,
		},
		isSoundEnabled: {
			type: Boolean,
			required: false,
			default: false,
		},
		round: {
			type: Number,
			required: false,
			default: 0,
		},
	},
	methods: {
		onSettingClick: function(event) {
			console.log(event);
		}
	}
};
</script>
