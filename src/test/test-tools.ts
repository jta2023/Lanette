import nodeAssert = require('assert');

import type { Player } from '../room-activity';
import type { Game } from '../room-game';
import type { Room } from '../rooms';
import type { User } from '../users';

const basePlayerName = 'Mocha Player';

export const testOptions: Dict<string> = {};

export function getBasePlayerName(): string {
	return basePlayerName;
}

function getAdditionalInformation(message: string): string {
	const roomInformation: string[] = [];
	const room = Rooms.get('mocha');
	if (room) {
		if (room.game) {
			roomInformation.push("Scripted game = " + room.game.name + "; initial seed = " + room.game.initialSeed);
		}
		if (room.userHostedGame) {
			roomInformation.push("User-hosted game = " + room.userHostedGame.name + "; initial seed = " +
				room.userHostedGame.initialSeed);
		}
		if (room.tournament) {
			roomInformation.push("Tournament = " + room.tournament.name);
		}
	}

	if (!roomInformation.length) return message;
	return message + "\n\nAdditional information:\n" + roomInformation.join("\n") + "\n";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
export function assert(condition: any, message?: string | Error | undefined): asserts condition {
	if (!message) message = '';

	nodeAssert(condition, typeof message === 'string' ? getAdditionalInformation(message) : message);
}

export function assertStrictEqual<T>(actual: T, expected: T, message?: string | Error | undefined): void {
	if (!message) message = '';

	nodeAssert.strictEqual(actual, expected, typeof message === 'string' ? getAdditionalInformation(message) : message);
}

function checkClientSendQueue(startingSendQueueIndex: number, input: readonly string[]): string[] {
	const expected = input.slice();
	for (let i = startingSendQueueIndex; i < Client.sendQueue.length; i++) {
		if (Client.sendQueue[i] === expected[0]) {
			expected.shift();
		}
	}

	return expected;
}

export function assertClientSendQueue(startingSendQueueIndex: number, input: readonly string[]): void {
	const expected = checkClientSendQueue(startingSendQueueIndex, input);
	assert(expected.length === 0, "Not found in Client's send queue:\n\n" + expected.join("\n"));
}

export function addPlayer(game: Game, name: string): Player {
	const user = Users.add(name, Tools.toId(name));
	assert(user);
	(game.room as Room).onUserJoin(user, ' ', Date.now());

	const player = game.addPlayer(user);
	assert(player);

	return player;
}

export function addPlayers(game: Game, numberOrNames?: number | string[]): Player[] {
	const players: Player[] = [];
	if (Array.isArray(numberOrNames)) {
		for (const name of numberOrNames) {
			players.push(addPlayer(game, name));
		}
	} else {
		if (!numberOrNames) numberOrNames = game.minPlayers;
		for (let i = 1; i <= numberOrNames; i++) {
			players.push(addPlayer(game, basePlayerName + ' ' + i));
		}
	}

	return players;
}

export async function runCommand(command: string, target: string, room: Room | User, user: User | string): Promise<void> {
	if (typeof user === 'string') user = Users.add(user, Tools.toId(user));
	await CommandParser.parse(room, user, Config.commandCharacter + command + (target ? " " + target : ""));
}
