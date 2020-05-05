import "reflect-metadata";
import { Container } from "inversify";
import { TYPES } from "./types";
import { Bot } from "./bot";
import { Client } from "discord.js";
import { MessageResponder } from "./services/general/message-responder";
import { PingFinder } from './services/ping/ping-finder'
import { QueueContruct } from "./models/music/QueueContruct";
import { cmdService } from "./services/general/cmdService";
import { urlService } from "./services/general/urlService";
import { ytService } from "./services/music/ytService";
import { MusicBot } from "./services/music/music_bot";
import { NSFWBot } from "./services/nsfw/nsfw_bot";
import { QueueService } from "./services/music/queueService";
import { MusicService } from "./services/music/musicService";
import { SongService } from "./services/music/songService";
import { GeneralBot } from "./services/general/general_bot";

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
container.bind<QueueService>(TYPES.QueueService).to(QueueService).inSingletonScope();
container.bind<MusicService>(TYPES.MusicService).to(MusicService).inSingletonScope();
container.bind<SongService>(TYPES.SongService).to(SongService).inSingletonScope();
container.bind<GeneralBot>(TYPES.GeneralBot).to(GeneralBot).inSingletonScope();

export default container;