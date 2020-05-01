import { injectable } from "inversify";
import { VoiceChannel, TextChannel, VoiceConnection, IntegrationEditData, Message, Guild } from "discord.js";
import { Song } from "./song";

@injectable()
export class QueueContruct {
    //connection: VoiceConnection;
    songs = new Array<Song>();
    volume: number;

    constructor(public guild: Guild, public textChannel: TextChannel, public voiceChannel: VoiceChannel, firstSong: Song, public connection: VoiceConnection) {
        this.addSong(firstSong);
        this.volume = 5;
    }

    addSong(song: Song) {
        this.songs.push(song);
    }

    emptySongs() {
        this.songs = [];
    }

    setVolume(volume: number) {
        this.volume = volume;
    }    
}