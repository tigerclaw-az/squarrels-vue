import CardsApi from './CardsApi';
import DecksApi from './DecksApi';
import GamesApi from './GamesApi';
import PlayersApi from './PlayersApi';

export default {
	cards: new CardsApi(),
	decks: new DecksApi(),
	games: new GamesApi(),
	players: new PlayersApi(),
};
