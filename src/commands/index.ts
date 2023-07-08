import { GuildMember, Message, PermissionsBitField } from 'discord.js';
import send, { ERROR_COLOR } from 'send';
import help from './help';
import startBattle from './startBattle';
import endBattle from './endBattle';
import moveOrAttack from './moveOrAttack';
import saveBattlePreset from './saveBattlePreset';
import loadBattlePreset from './loadBattlePreset';
import deleteBattlePreset from './deleteBattlePreset';
import listBattlePresets from './listBattlePresets';
import viewBattlePreset from './viewBattlePreset';
import loveAndra from './loveAndra';
import dance from './dance';

export const UNKNOWN_COMMAND_TEXT = 'I do not recognize that command. For help with commands, type ">> help".';

export const requirePermissions = (member: GuildMember | null) => {
	if (member === null) {
		// The member left the server between when the message was created and now.
		throw new Error("Goodbye!");
	}

	if (!member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
		throw new Error("You must have \"Manage Messages\" permissions in this server to do that.");
	}
};

const commands = {
	'hi': greet,
	'i love you andra :D': loveAndra,
	'dance': dance,
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

export const handleCommand = async (message: Message) => {
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
	} catch (error: any) {
		await send(message.channel, error.toString(), ERROR_COLOR);

		if (error.constructor !== Error) {
			console.error(error);
		}
	}
};
