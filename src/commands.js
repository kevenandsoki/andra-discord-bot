'use strict';

import { PermissionsBitField } from 'discord.js';
import send, { ERROR_COLOR } from './send.js';
import help from './commands/help.js';
import startBattle from './commands/startBattle.js';
import endBattle from './commands/endBattle.js';
import moveOrAttack from './commands/moveOrAttack.js';
import saveBattlePreset from './commands/saveBattlePreset.js';
import loadBattlePreset from './commands/loadBattlePreset.js';
import deleteBattlePreset from './commands/deleteBattlePreset.js';
import listBattlePresets from './commands/listBattlePresets.js';
import viewBattlePreset from './commands/viewBattlePreset.js';
import loveAndra from './commands/loveAndra.js';

export const UNKNOWN_COMMAND_TEXT = 'I do not recognize that command. For help with commands, type ">> help".';

export const requirePermissions = member => {
	if (!member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
		throw new Error("You must have \"Manage Messages\" permissions in this server to do that.");
	}
};

const commands = {
	'i love you andra :D': loveAndra,
	'help': help,
	'start battle': startBattle,
	'end battle': endBattle,
	'move|attack': moveOrAttack,
	'save battle preset': saveBattlePreset,
	'load battle preset': loadBattlePreset,
	'delete battle preset': deleteBattlePreset,
	'list battle presets': listBattlePresets,
	'view battle preset': viewBattlePreset,
};

export default commands;

export const handleCommand = async message => {
	let runCommand;
	for (const [commandName, commandFunction] of Object.entries(commands)) {
		if (new RegExp(`^>> ?(?:${commandName})`).test(message.content)) {
			runCommand = commandFunction;
			break;
		}
	}

	if (!runCommand) {
		return send(message.channel, UNKNOWN_COMMAND_TEXT);
	}

	try {
		await runCommand(message);
	} catch (error) {
		await send(message.channel, error.toString(), ERROR_COLOR);

		if (error.constructor !== Error) {
			console.error(error);
		}
	}
};
