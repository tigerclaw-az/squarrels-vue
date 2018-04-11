<template>
	<div class="count" ng-hide="deckCtrl.type === 'action'">{{deckCtrl.getTotalCards()}}</div>
	<div
		class="deck"
		ng-class="{
			'draw-card': deckCtrl.type === 'main' && deckCtrl.canDraw()
		}"
		ng-init="isDiscard = deckCtrl.type === 'discard'"
		ng-attr-ng-drop="{{isDiscard}}"
		ng-drop-success="deckCtrl.onDropComplete($data, $event)"
	>
		<a
			class="cards-group"
			href=""
			role="button"
			ng-class="{ disabled: deckCtrl.isDisabled() }"
			ng-mousedown="!deckCtrl.isDisabled() && deckCtrl.onClick(); $event.preventDefault()"
			ng-show="deckCtrl.getTotalCards()"
		>
			<span
				ng-class="deckCtrl.type === 'action' ? 'action--{{card.name}}' : 'blank--'"
				ng-repeat="card in deckCtrl.getDeck().cards | limitTo: deckCtrl.cardLimit()"
				class="card"
			>
			</span>
		</a>
	</div>
	<div ng-if="deckCtrl.type === 'main' && deckCtrl.isAdmin" uib-dropdown>
		<button id="dropdown-cards" type="button" class="btn btn-primary" uib-dropdown-toggle ng-disabled="disabled">
			Choose Card<span class="caret"></span>
		</button>
		<ul class="dropdown-menu" uib-dropdown-menu role="menu" aria-labelledby="dropdown-cards" ng-click="deckCtrl.onDropdownClick($event)">
			<li role="menuitem"><a href="#" data-type="action" data-name="ambush">Ambush</a></li>
			<li role="menuitem"><a href="#" data-type="action" data-name="communism">Communism</a></li>
			<li role="menuitem"><a href="#" data-type="action" data-name="hoard">Hoard</a></li>
			<li role="menuitem"><a href="#" data-type="action" data-name="quarrel">Quarrel</a></li>
			<li role="menuitem"><a href="#" data-type="action" data-name="whirlwind">Whirlwind</a></li>
			<li role="menuitem"><a href="#" data-type="action" data-name="winter">Winter</a></li>
			<li class="divider"></li>
			<li role="menuitem"><a href="#" data-type="number" data-name="1">1</a></li>
			<li role="menuitem"><a href="#" data-type="number" data-name="2">2</a></li>
			<li role="menuitem"><a href="#" data-type="number" data-name="3">3</a></li>
			<li role="menuitem"><a href="#" data-type="number" data-name="4">4</a></li>
			<li role="menuitem"><a href="#" data-type="number" data-name="5">5</a></li>
		</ul>
	</div>
</template>

<script>
// @ is an alias to /src
import Card from '@/components/Card.vue';

export default {
	name: 'Deck',
	components: {
		Card,
	},
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

</style>
