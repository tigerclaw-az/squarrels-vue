<template>
	<b-modal
		id="modal-help"
		centered
		hide-footer
		lazy
		size="lg"
		title="How to Play"
	>
		OBJECTIVE: To Store the most Acorns before WINTER. Players select a
		predetermined score (such as 50) to play to. After playing multiple
		rounds, the first player to reach the determined number wins the game!
		EQUIPMENT: Deck of 120 cards as follows: Action Cards: 8 Quarrels , 8
		Hoards , 6 Ambushes , 2 Whirlwinds , 1 Winter Number Cards: 30 Ones , 24
		Twos , 18 Threes , 12 Fours , 9 Fives Special Cards: 1 each of Golden &
		Rotten Acorns GAME SETUP: Shuffle all cards. Dealer deals out SEVEN
		cards to each player. All players discard any Action Cards and replace
		them until their hand holds only Number and/or Special Cards. NOTE:
		Players keep their hands but the deck is reshuffled if the WINTER card
		was drawn during the game setup. This diagram demonstrates the layout of
		the table. The ‘Deck’ is where all cards are drawn; ‘Discard’ is where
		all Action Cards are placed when drawn. The ‘Hoard Pile’ is where all
		end-of-turn discards are placed and will usually consist of only Number
		Cards; however there is an exception that will be discussed later. The
		‘Player’s Hand’ represents the cards each player is currently holding.
		All players have their own ‘Storage Pile’ in which Number Cards are
		stored for points. The more cards in the ‘Storage Pile,’ the more points
		you will have at the end of the round. HOW TO PLAY: Play starts to
		dealer’s left and continues clockwise. All players MUST draw one card
		from the ‘Deck’ at the beginning of their turn before storing any cards.
		If player still has less then SEVEN cards in their hand, they may chose
		to continue drawing one card at a time until they have SEVEN.They may
		stop drawing at any time but if an Action Card is drawn, the player
		stops drawing and must play the Action Card immediately. A player may
		choose to store cards before they have drawn all SEVEN cards, however
		the player will NOT draw any more cards for the rest of their turn if
		they do so. STORING CARDS Players must have sets of THREE matching
		Number Cards to store them in their ‘Storage Pile.’ ENDING YOUR TURN
		Discard ONE card from your hand face down into the ‘Hoard Pile.’ It is
		now the next player’s turn. You do not have to discard IF you have no
		cards left in your hand. ACTION CARDS: (this is where the game gets
		NUTS!) QUARREL ALL players select a card from their hand, and at the
		same time turn their cards over. The highest card wins! If highest cards
		match, those players then select another card until one card wins.
		WINNER takes ALL cards played in the QUARREL, stores, and discards one
		card to the hoard pile. Play then continues to the WINNERS left. If
		QUARREL ends in a draw then no one wins the quarrel all cards are
		returned to each player. HOARD Everyone, except the player who draws the
		card, races for the cards in the ‘Hoard Pile.’ First one to have their
		hand on top of the deck wins! The WINNER takes the entire hoard pile and
		play continues from the winner immediately. Player may select to
		continue drawing if they have LESS than 7 cards. Player then places any
		matches into their ‘Storage Pile’ and discards one card. Play continues
		clockwise from the winner. AMBUSH Player randomly takes one card from
		each player’s hand then stores and discards. WHIRLWIND Collect ALL
		players hands, shuffle them together, and then deal the cards out to
		everyone starting with the player that drew this card and going
		clockwise. Current player then continues playing their turn by drawing
		more cards if they still do not have SEVEN. WINTER This card ends the
		game immediately. Count up your points. SPECIAL CARDS: (One last twist
		for the game) GOLDEN ACORN (+5 points if in your hand when WINTER
		arrives.) It trumps all other Number Cards and can be used in place of a
		Number Card during a Quarrel. However once played, it MUST be placed in
		the ‘Discard’ pile and is lost for the rest of the game, UNLESS it is
		the LAST card in your hand when played. Then player keeps the card.
		ROTTEN ACORN (-5 points if in your hand when WINTER arrives.) It can
		only be passed during a Quarrel, Whirlwind, or Ambush. You may NOT
		discard the Lead Acorn into the ‘Hoard Pile’ unless it is the LAST card
		in your hand when discarding at the end of your turn. NOTE: If you have
		both the Golden Acorn and the Rotten Acorn, you may discard the Rotten
		Acorn over the Golden Acorn at the end of your turn if they are the ONLY
		two cards in your hand. END OF GAME: Once WINTER has been drawn, all
		players count up the points in their ‘Storage Pile.’ Each set is worth
		the number on the card. For example: Three 2’s (one set) is worth 2
		Points total. Remember to count the Rotten and Golden Acorns from your
		hand. Another round is played until the predetermined score is reached
		by one of the players. The winner of the round deals for the next round.
		In case of a tie, highest total score deals next round. All Rules and
		Images are protected under copyright. S'Quarrels is a Registered
		Trademark and has been legally registered with the United States Patent
		and Trademark Offices. All rights reserved.
	</b-modal>
</template>

<script>
import bModal from 'bootstrap-vue/es/components/modal/modal';

export default {
	name: 'game-help',
	components: {
		'b-modal': bModal,
	},
};
</script>

<style scoped lang="scss">
// prettier-ignore
@import "~@/assets/scss/variables";

.modal-body {
	margin: 0 auto !important;
}
</style>
