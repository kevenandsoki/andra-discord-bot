import Battle from 'Battle';
import { Message } from 'discord.js';
import send from 'send';

const endBattle = async (message: Message) => {
	const battle = Battle.getBattleInChannel(message.channel);

	battle.remove();
	await send(battle.channel, 'The battle has concluded.');
};

export default endBattle;
