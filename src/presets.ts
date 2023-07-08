import { BattleJSON } from 'Battle';
import fs from 'node:fs/promises';

export const MAX_PRESET_COUNT = 100;

const mapReviver = (_: unknown, value: unknown) => {
	if (Array.isArray(value) && value.every(Array.isArray)) {
		return new Map(value as any);
	}

	return value;
};

const mapReplacer = (_: unknown, value: unknown) => {
	if (value instanceof Map) {
		return Array.from(value);
	}

	return value;
};

export type PresetsByName = Map<string, BattleJSON>;

export let presetsByGuildID: Record<string, PresetsByName> = {};

fs.readFile('data/presets.json', 'utf8').then(string => {
	presetsByGuildID = JSON.parse(string, mapReviver);
}).catch(() => {});

export const savePresets = async () => {
	const presetData = JSON.stringify(presetsByGuildID, mapReplacer);

	await fs.writeFile('data/presets.json', presetData);
};
