'use strict';

import commands from './index.js';
import send from '../send.js';

const help = async message => {
	let helpText = 'Here is a list of the commands available:\n';

	helpText += '```\n';

	for (const [commandName, command] of Object.entries(commands)) {
		if (command.unlisted) {
			continue;
		}

		helpText += `>> ${commandName}\n`;
	}

	helpText += '```\n';

	helpText += 'For `attack` and `move`, you can combine them during a turn in a battle.\n';
	helpText += 'A valid turn could be as follows: `>> attack R 1, move 2 back`';

	await send(message.channel, helpText);
};

export default help;
