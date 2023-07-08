import Battle from 'Battle';
import send, { SUCCESS_COLOR } from 'send';
import { MAX_PRESET_COUNT, presetsByGuildID, savePresets } from 'presets';
import { requireGuildTo, requirePermissions } from '.';
import { Message } from 'discord.js';

export default async function saveBattlePreset(message: Message) {
	requireGuildTo('use battle presets', message);
	requirePermissions(message.member);

	if (presetsByGuildID[message.guild.id]?.size >= MAX_PRESET_COUNT) {
		throw new Error(`This server has reached the maximum preset limit (${MAX_PRESET_COUNT}).`);
	}

	const match = message.content.match(/^>> ?save battle preset "([\w-]+)"$/i);

	if (!match) {
		return send(
			message.channel,
			'To save the current battle as a preset, follow this format:\n' +
			'```\n' +
			'>> save battle preset "name_here"\n' +
			'```\n' +
			'You can then load, delete, or list all battle presets.\n' +
			'Note: Preset names can only have letters, numbers, underscores, or hyphens.'
		);
	}

	const battle = Battle.getBattleInChannel(message.channel);
	const presetName = match[1];

	presetsByGuildID[message.guild.id] ??= new Map();
	presetsByGuildID[message.guild.id].set(presetName, battle.toJSON());

	await savePresets();

	await send(battle.channel, `Battle preset "${presetName}" saved!`, SUCCESS_COLOR);
}
