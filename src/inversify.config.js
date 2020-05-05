"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const inversify_1 = require("inversify");
const types_1 = require("./types");
const bot_1 = require("./bot");
const discord_js_1 = require("discord.js");
const message_responder_1 = require("./services/general/message-responder");
const ping_finder_1 = require("./services/ping/ping-finder");
const cmdService_1 = require("./services/general/cmdService");
const urlService_1 = require("./services/general/urlService");
const ytService_1 = require("./services/music/ytService");
const music_bot_1 = require("./services/music/music_bot");
const nsfw_bot_1 = require("./services/nsfw/nsfw_bot");
const queueService_1 = require("./services/music/queueService");
const musicService_1 = require("./services/music/musicService");
const songService_1 = require("./services/music/songService");
const general_bot_1 = require("./services/general/general_bot");
let container = new inversify_1.Container();
container.bind(types_1.TYPES.Bot).to(bot_1.Bot).inSingletonScope();
container.bind(types_1.TYPES.Client).toConstantValue(new discord_js_1.Client());
container.bind(types_1.TYPES.Token).toConstantValue(process.env.TOKEN);
container.bind(types_1.TYPES.MessageResponder).to(message_responder_1.MessageResponder).inSingletonScope();
container.bind(types_1.TYPES.PingFinder).to(ping_finder_1.PingFinder).inSingletonScope();
container.bind(types_1.TYPES.cmdService).to(cmdService_1.cmdService).inSingletonScope();
container.bind(types_1.TYPES.urlService).to(urlService_1.urlService).inSingletonScope();
container.bind(types_1.TYPES.ytService).to(ytService_1.ytService).inSingletonScope();
container.bind(types_1.TYPES.MusicBot).to(music_bot_1.MusicBot).inSingletonScope();
container.bind(types_1.TYPES.NSFWBot).to(nsfw_bot_1.NSFWBot).inSingletonScope();
container.bind(types_1.TYPES.QueueService).to(queueService_1.QueueService).inSingletonScope();
container.bind(types_1.TYPES.MusicService).to(musicService_1.MusicService).inSingletonScope();
container.bind(types_1.TYPES.SongService).to(songService_1.SongService).inSingletonScope();
container.bind(types_1.TYPES.GeneralBot).to(general_bot_1.GeneralBot).inSingletonScope();
exports.default = container;
//# sourceMappingURL=inversify.config.js.map