import { injectable } from "inversify";
import { VoiceChannel, TextChannel, VoiceConnection, IntegrationEditData, Message, Guild } from "discord.js";
import { Song } from "./song";
import { RadioStation } from "./radioStation";

export class QueueContructOptions{
    guildId: string;
    textChannel: TextChannel;
    voiceChannel: VoiceChannel;
    firstPlay: Song | RadioStation;
}

@injectable()
export class QueueContruct extends QueueContructOptions {
    songs = new Array<Song | RadioStation>();
    volume: number;
    private connection: VoiceConnection;

    private constructor(options: QueueContructOptions){
        super();
        Object.assign(this, options);
        this.addToQueue(this.firstPlay);       
        this.volume = 5;
    }

    addToQueue(music: Song | RadioStation) {
        this.songs.push(music);
    }

    emptySongs() {
        this.songs = [];
    }
    
    setConnection(connection: VoiceConnection){
        this.connection = connection;
    }

    getConnection(): VoiceConnection{
        return this.connection;
    }
    
    static async create(options: QueueContructOptions): Promise<QueueContruct>{
        const queueContruct = new QueueContruct(options);
        const connection = await queueContruct.setUpVoiceConnection(queueContruct.voiceChannel);
        queueContruct.setConnection(connection);
        return queueContruct;
    }

    private async setUpVoiceConnection(voiceChannel: VoiceChannel): Promise<VoiceConnection> {
        try {
            return await voiceChannel.join();
        } catch (err) {
            console.log("Error while setting up voice connection: " + err);
        }
    }


}