import GamesApi from './GamesApi';
import PlayersApi from './PlayersApi';

export default {
	games: new GamesApi(),
	players: new PlayersApi(),
};
