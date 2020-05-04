import { injectable, inject } from "inversify";
import { QueueContruct, QueueType } from "../../models/music/QueueContruct";
import { Message, VoiceChannel, TextChannel, User } from "discord.js";
import { Music } from "../../models/music/music";




@injectable()
export class QueueService {

    private mainQueue = new Map<string, QueueContruct>();

    constructor() {
    }

    async createMusicServerQueue(message: Message, firstSong: Music): Promise<QueueContruct>{
        const newQueue = await QueueContruct.create({ type: QueueType.Song, guildId: message.guild.id, textChannel: message.channel as TextChannel, voiceChannel: message.member.voice.channel, firstPlay: firstSong });
        this.addServerQueue(newQueue);
        return newQueue;
    }

    async createRadioServerQueue(message: Message, firstRadioStation: Music): Promise<QueueContruct>{
        const newQueue = await QueueContruct.create({ type: QueueType.Radio, guildId: message.guild.id, textChannel: message.channel as TextChannel, voiceChannel: message.member.voice.channel, firstPlay: firstRadioStation });
        this.addServerQueue(newQueue);
        return newQueue
    }

    private addServerQueue(serverQueue: QueueContruct) {
        this.mainQueue.set(serverQueue.guildId, serverQueue);
    }

    getServerQueue(guildId: string): QueueContruct {
        return this.mainQueue.get(guildId);
    }

    removeServerQueue(guildId: string) {
        this.mainQueue.delete(guildId);
    }

    endServerQueue(guildId: string){
        
    }


}