import Character from './Character.js';

export default class Team {
	characters = [];

	constructor(battle) {
		this.battle = battle;
		this.channel = this.battle.channel;

		this.battle.teams.push(this);
	}

	static fromString(battle, string) {
		const team = new Team(battle);

		const lines = string.trim().split('\n');
		team.characters = lines.map(line => Character.fromString(team, line));

		return team;
	}

	isNth(n) {
		return this === this.battle.teams[n];
	}
}
