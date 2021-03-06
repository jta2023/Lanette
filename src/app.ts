import * as client from './client';
import * as commandParser from './command-parser';
import * as commands from './commands';
// eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error
// @ts-ignore - generated after first run
import * as config from './config';
import * as ConfigLoader from './config-loader';
import * as dex from './dex';
import * as games from './games';
import * as PluginsLoader from './plugins-loader';
import * as rooms from './rooms';
import * as storage from './storage';
import * as tools from './tools';
import * as tournaments from './tournaments';
import * as users from './users';

module.exports = (async(): Promise<void> => {
	tools.instantiate();
	global.Config = ConfigLoader.load(config);
	dex.instantiate();
	client.instantiate();
	commandParser.instantiate();
	rooms.instantiate();
	storage.instantiate();
	tournaments.instantiate();
	users.instantiate();
	games.instantiate();

	Storage.importDatabases();
	Tournaments.loadSchedules();

	await PluginsLoader.load();

	global.Commands = CommandParser.loadBaseCommands(commands);
	global.BaseCommands = Tools.deepClone(Commands);
});