import { TextBasedChannel } from 'discord.js';

export const DEFAULT_COLOR = 0xdce1e5;
export const SUCCESS_COLOR = 0x77b255;
export const ERROR_COLOR = 0xffcc4d;

export default async function send(
	channel: TextBasedChannel,
	content: string,
	color?: number,
) {
	await channel.send({
		embeds: [{
			description: content,
			color: color ?? DEFAULT_COLOR,
		}],
	});
}
