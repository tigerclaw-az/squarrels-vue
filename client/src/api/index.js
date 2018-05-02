import DecksApi from './DecksApi';
import GamesApi from './GamesApi';
import PlayersApi from './PlayersApi';

export default {
	decks: new DecksApi(),
	games: new GamesApi(),
	players: new PlayersApi(),
};
