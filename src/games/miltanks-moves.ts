import type { Room } from "../rooms";
import type { IMove } from "../types/dex";
import type { IGameFile } from "../types/games";
import type { User } from "../users";
import { game as guessingGame, Guessing } from "./templates/guessing";

const data: {'moves': Dict<Dict<string[]>>; 'pokemon': string[]} = {
	moves: {},
	pokemon: [],
};

class MiltanksMoves extends Guessing {
	static loadData(room: Room | User): void {
		const moves = Games.getMovesList();
		const bannedMoves: string[] = [];
		for (const move of moves) {
			const availability = Dex.getMoveAvailability(move);
			if (availability >= Games.maxMoveAvailability) bannedMoves.push(move.id);
		}

		const moveCache: Dict<IMove> = {};
		const pokedex = Games.getPokemonList(x => x.baseSpecies === x.name && !!Dex.getAllPossibleMoves(x).length);
		for (const pokemon of pokedex) {
			const allPossibleMoves = Dex.getAllPossibleMoves(pokemon);
			for (const possibleMove of allPossibleMoves) {
				if (!(possibleMove in moveCache)) {
					moveCache[possibleMove] = Dex.getExistingMove(possibleMove);
				}
				const move = moveCache[possibleMove];
				if (bannedMoves.includes(move.id)) continue;
				if (!(pokemon.name in data.moves)) {
					data.moves[pokemon.name] = {};
					data.pokemon.push(pokemon.name);
				}
				if (!(move.type in data.moves[pokemon.name])) data.moves[pokemon.name][move.type] = [];
				data.moves[pokemon.name][move.type].push(move.name);
			}
		}

		for (const species in data.moves) {
			for (const i in data.moves[species]) {
				if (data.moves[species][i].length > 4) delete data.moves[species][i];
			}

			if (!Object.keys(data.moves[species]).length) {
				delete data.moves[species];
				data.pokemon.splice(data.pokemon.indexOf(species), 1);
			}
		}
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	async setAnswers(): Promise<void> {
		const species = this.sampleOne(data.pokemon);
		const type = this.sampleOne(Object.keys(data.moves[species]));
		this.answers = data.moves[species][type];
		this.hint = "<b>Randomly generated Pokemon and type</b>: <i>" + species + " - " + type + " type</i>";
	}
}

export const game: IGameFile<MiltanksMoves> = Games.copyTemplateProperties(guessingGame, {
	aliases: ['miltanks', 'mm'],
	category: 'knowledge',
	class: MiltanksMoves,
	defaultOptions: ['points'],
	description: "Players guess moves of the specified type that the given Pokemon learn!",
	freejoin: true,
	name: "Miltank's Moves",
	mascot: "Miltank",
	modes: ['survival', 'team'],
});
