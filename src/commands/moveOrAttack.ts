import Battle from 'Battle';
import { UNKNOWN_COMMAND_TEXT } from '.';
import send from 'send';
import { Message } from 'discord.js';
import Character from 'Character';

const runMoveSubcommand = (subcommand: string, battle: Battle) => {
	const match = subcommand.match(/^move (\d+)(?: (up|down|left|right|back(?:wards?)?|forwards?))?$/);

	if (!match) {
		return send(
			battle.channel,
			'To use the "Move" command, follow this format:\n' +
			'```\n' +
			'>> move [distance] [direction]\n' +
			'```\n' +
			'The directions available are: "up", "down", "left", "right", "forward", and "back".\n' +
			'If you do not specify a direction, it will default to "forward", which is based on the side you started on.'
		);
	}

	battle.turnCharacter.move(+match[1], match[2]);
};

type DamageByTarget = Map<Character, number>;

const runAttackSubcommand = (subcommand: string, battle: Battle, damageByTarget: DamageByTarget) => {
	const match = subcommand.match(/^attack(?: ([a-z]))? (\d+)$/);

	if (!match) {
		return send(
			battle.channel,
			'To use the "Attack" command, follow this format:\n' +
			'```\n' +
			'>> attack [target] [count]\n' +
			'```\n' +
			'Note that while "character to attack" is optional, your attack will default to the closest enemy (character on the opposing team).\n' +
			'If you are not in range of the character you chose or the closest enemy, then the command will fail and you will be asked to retry.'
		);
	}

	const { target, damage } = battle.turnCharacter.attack(match[1], +match[2]);

	const totalDamage = damageByTarget.get(target) ?? 0;
	damageByTarget.set(target, totalDamage + damage);
};

const moveOrAttack = async (message: Message) => {
	const subcommands = message.content.replace(/^>>/, '').toLowerCase().split(',');

	const battle = Battle.getBattleInChannel(message.channel);

	const damageByTarget: DamageByTarget = new Map();

	battle.atomically(() => {
		for (const rawSubcommand of subcommands) {
			const subcommand = rawSubcommand.trim();

			if (subcommand.startsWith('move')) {
				runMoveSubcommand(subcommand, battle);
			} else if (subcommand.startsWith('attack')) {
				runAttackSubcommand(subcommand, battle, damageByTarget);
			} else {
				return send(battle.channel, UNKNOWN_COMMAND_TEXT);
			}
		}
	});

	let dmgResponse = '';
	let hpResponse = '';
	let defeatResponse = '';

	for (const [target, damage] of damageByTarget.entries()) {
		if (damage === 0) {
			continue;
		}

		dmgResponse += `${damage} DMG dealt to ${target}!\n`;
		hpResponse += `${target} HP: ${target.hp}/${target.maxHP}\n`;

		if (target.hp === 0) {
			defeatResponse += `${target} was defeated!\n`;
		}
	}

	let response = dmgResponse + hpResponse + defeatResponse;
	response += battle.getBoardString();

	await send(
		battle.channel,
		response,
		battle.turnCharacter.role?.color,
	);

	await battle.updateTurn();
};

export default moveOrAttack;
