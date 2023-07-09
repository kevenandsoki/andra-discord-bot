import { Message } from 'discord.js';
import Battle from '../Battle';
import send from '../send';

export default async function endBattle(message: Message) {
	const battle = Battle.getBattleInChannel(message.channel);

	battle.remove();
	await send(battle.channel, 'The battle has concluded.');
}
