import Battle from './Battle';
import Character from './Character';
import send from './send';

export type TeamJSON = ReturnType<Team['toJSON']>;

export default class Team {
	battle: Battle;
	characters: Character[] = [];

	constructor(battle: Battle) {
		this.battle = battle;

		this.battle.teams.push(this);
	}

	static fromString(battle: Battle, string: string) {
		const team = new Team(battle);

		const lines = string.trim().split('\n');
		team.characters = lines.map(line => Character.fromString(team, line));

		return team;
	}

	static fromJSON(battle: Battle, teamJSON: TeamJSON) {
		const team = new Team(battle);

		for (const characterJSON of teamJSON.characters) {
			Character.fromJSON(team, characterJSON);
		}

		return team;
	}

	toJSON() {
		return {
			characters: this.characters.map(character => character.toJSON()),
		};
	}

	isNth(n: number) {
		return this === this.battle.teams[n];
	}

	getOtherTeam() {
		return this.battle.teams[this.isNth(0) ? 1 : 0];
	}

	async win() {
		const winnerTexts = this.characters.map(String);

		if (this.characters.length > 1) {
			const lastIndex = winnerTexts.length - 1;
			winnerTexts[lastIndex] = 'and ' + winnerTexts[lastIndex];
		}

		let winnerText = winnerTexts.join(
			winnerTexts.length === 2 ? ' ' : ', '
		);

		winnerText += ` win${winnerTexts.length === 1 ? 's' : ''}!`;
		winnerText += ' The battle has concluded.';

		await send(this.battle.channel, winnerText);
		this.battle.remove();
	}
}
