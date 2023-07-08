import Battle from 'Battle';
import send from 'send';

const endBattle = async message => {
	const battle = Battle.getBattleInChannel(message.channel);

	battle.remove();
	await send(battle.channel, 'The battle has concluded.');
};

export default endBattle;
