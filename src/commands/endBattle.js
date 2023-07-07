'use strict';

import Battle from '../Battle.js';
import send from '../send.js';

const endBattle = async message => {
	const battle = Battle.getBattleInChannel(message.channel);

	battle.remove();
	await send(battle.channel, 'The battle has concluded.');
};

export default endBattle;
