import Team from './Team';
import Battle from './Battle';
import Character from './Character';

export type SaveableObject = Battle | Team | Character | unknown[];

function isSaveableObject(value: unknown): value is SaveableObject {
	return (
		Array.isArray(value) ||
		value instanceof Character ||
		value instanceof Team ||
		value instanceof Battle
	);
}

type Properties = Record<string, unknown>;

export type SavedProperties = Map<SaveableObject, Properties>;

export function saveProperties(
	object: SaveableObject,
	savedProperties: SavedProperties = new Map(),
): SavedProperties {
	if (savedProperties.has(object)) {
		return savedProperties;
	}

	const properties: Properties = {};
	savedProperties.set(object, properties);

	// This is necessary because `Object.entries` doesn't include the `length` property.
	if (Array.isArray(object)) {
		properties.length = object.length;
	}

	for (const [key, value] of Object.entries(object) as Array<[string, unknown]>) {
		properties[key] = value;

		if (isSaveableObject(value)) {
			saveProperties(value, savedProperties);
		}
	}

	return savedProperties;
}

export function restoreProperties(savedProperties: SavedProperties) {
	for (const [object, properties] of savedProperties) {
		for (const [key, value] of Object.entries(properties)) {
			(object as any)[key] = value;
		}
	}
}
