import send from 'send';
import { presetsByGuildID } from 'presets';
import { requirePermissions } from '.';
import { Message } from 'discord.js';

const viewBattlePreset = async (message: Message) => {
	requirePermissions(message.member);

	const match = message.content.match(/^>> ?view battle preset "([\w-]+)"$/i);

	if (!match) {
		return send(
			message.channel,
			'To view a battle preset, follow this format:\n' +
			'```\n' +
			'>> view battle preset "name_here"\n' +
			'```'
		);
	}

	const presetName = match[1];
	const battleJSON = presetsByGuildID[message.guild.id]?.get(presetName);

	if (!battleJSON) {
		throw new Error(`There is no preset saved with the name "${presetName}" in this server.`);
	}

	let presetText = '```\n';
	presetText += `NAME: ${presetName}\n`;
	presetText += `SIZE: ${battleJSON.width}x${battleJSON.height}\n\n`;

	let characterIndex = -1;

	for (let teamIndex = 0; teamIndex < battleJSON.teams.length; teamIndex++) {
		const teamJSON = battleJSON.teams[teamIndex];

		presetText += `TEAM ${teamIndex + 1}:\n`;

		for (const characterJSON of teamJSON.characters) {
			characterIndex++;

			presetText += '  ';
			if (battleJSON.turnIndex === characterIndex) {
				presetText += '*';
			}
			presetText += `[${characterJSON.letter}] - `;
			presetText += `HP: ${characterJSON.hp}, `;
			presetText += `ATK: ${characterJSON.atk}, `;
			presetText += `RNG: ${characterJSON.rng}, `;
			presetText += `SPD: ${characterJSON.spd}`;

			presetText += '\n';
		}

		presetText += '\n';
	}

	presetText += '```\n';

	presetText += 'Here was the command that created this battle:\n';
	presetText += battleJSON.commandText;

	await send(message.channel, presetText);
};

export default viewBattlePreset;
