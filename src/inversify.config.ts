import "reflect-metadata";
import { Container } from "inversify";
import { TYPES } from "./types";
import { Bot } from "./bot";
import { Client } from "discord.js";
import { Song } from "./models/music/song"
import { MessageResponder } from "./services/general/message-responder";
import { PingFinder } from './services/ping/ping-finder'
import { QueueContruct } from "./models/music/QueueContruct";
import { cmdService } from "./services/general/cmdService";
import { urlService } from "./services/general/urlService";
import { ytService } from "./services/music/ytService";
import { MusicBot } from "./services/music/music_bot";
import { NSFWBot } from "./services/nsfw/nsfw_bot";

let container = new Container();

container.bind<Bot>(TYPES.Bot).to(Bot).inSingletonScope();
container.bind<Client>(TYPES.Client).toConstantValue(new Client());
container.bind<string>(TYPES.Token).toConstantValue(process.env.TOKEN);
container.bind<MessageResponder>(TYPES.MessageResponder).to(MessageResponder).inSingletonScope();
container.bind<PingFinder>(TYPES.PingFinder).to(PingFinder).inSingletonScope();
container.bind<cmdService>(TYPES.cmdService).to(cmdService).inSingletonScope();
container.bind<urlService>(TYPES.urlService).to(urlService).inSingletonScope();
container.bind<ytService>(TYPES.ytService).to(ytService).inSingletonScope();
container.bind<MusicBot>(TYPES.MusicBot).to(MusicBot).inSingletonScope();
container.bind<NSFWBot>(TYPES.NSFWBot).to(NSFWBot).inSingletonScope();

export default container;