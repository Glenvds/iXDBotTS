import { injectable, inject } from "inversify";
import { TYPES } from "../../types";
import { Message, StreamDispatcher } from "discord.js";
import { MessageResponder } from "../general/message-responder";
import { SongService } from "./songService";
import { QueueService } from "./queueService";
import { QueueType } from "../../models/music/QueueContruct";
import { ServiceResult } from "../../models/general/serviceResult";
import { Music, MusicTypes } from "../../models/music/music";
import { ytService } from "./ytService";




@injectable()
export class MusicService {

    private RADIO_STATIONS = [
        new Music({ title: "stubru", url: "http://icecast.vrtcdn.be/stubru-high.mp3", type: MusicTypes.Radio }),
        new Music({ title: "mnm", url: "http://icecast.vrtcdn.be/mnm-high.mp3", type: MusicTypes.Radio }),
        new Music({ title: "radio1", url: "http://icecast.vrtcdn.be/stubru-high.mp3", type: MusicTypes.Radio })
    ];

    //private musicDecibels = 0.001;

    constructor(@inject(TYPES.MessageResponder) private messageResponder: MessageResponder,
        @inject(TYPES.SongService) private songService: SongService,
        @inject(TYPES.QueueService) private queueService: QueueService,
        @inject(TYPES.ytService) private ytService: ytService) {
    }

    async playSong(message: Message): Promise<ServiceResult> {
        const guildId = message.guild.id;
        const serverQueue = this.queueService.getServerQueue(guildId);

        const song = await this.getSongFromMessage(message);
        if (!song) { return new ServiceResult(false, "No songs found with that search query"); }

        if (serverQueue) {
            if (this.isRadioPlayingOnGuild(guildId)) { return new ServiceResult(false, "Can't queue songs while radio is playing! Use !stop to stop the radio."); }
            else {
                serverQueue.addToQueue(song);
                return new ServiceResult(true, `${song.title} has beed added to the queue.`);
            }
        } else if (!serverQueue) {
            await this.queueService.createMusicServerQueue(message, song);
            await this.playSongsInChannel(guildId, song);
        }
    }

    async playRadio(message: Message): Promise<ServiceResult> {
        const radio = this.getRadioStationFromInput(message);
        if (!radio) { return new ServiceResult(false, this.getPossibleRadioStationsAsString("Don't know this radio station.")) };

        const guildId = message.guild.id;
        const serverQueue = this.queueService.getServerQueue(guildId);

        if (serverQueue) {
            if (this.isSongPlayingOnGuild(guildId)) { return new ServiceResult(false, "Music is already playing. First stop playing music(!stop).") };
            this.playRadioInChannel(guildId, radio);
        } else {
            this.queueService.createRadioServerQueue(message, radio);
            this.playRadioInChannel(guildId, radio);
        }
    }

    async playSongsInChannel(guildId: string, music: Music) {
        const serverQueue = this.queueService.getServerQueue(guildId);

        if (!serverQueue) { return; }

        if (!music) {
            this.messageResponder.sendResponseToChannel(serverQueue.textChannel, "Ran out of songs, I'm leaving.");
            serverQueue.voiceChannel.leave();
            this.queueService.removeServerQueue(guildId);
        }

        this.messageResponder.sendResponseToChannel(serverQueue.textChannel, `Started playing: ${music.title}. Requested by ${music.requester}`);

        if (music.type === MusicTypes.Song) {
            const ytStream = await this.ytService.getStreamYoutube(music);
            const dispatcher: StreamDispatcher = serverQueue.getConnection().play(ytStream, { type: "opus" })
                .on("finish", () => {
                    console.log(music.title + " ended playing.");
                    serverQueue.songs.shift();
                    this.playSongsInChannel(guildId, serverQueue.songs[0])
                });
            dispatcher.setVolumeLogarithmic(serverQueue.volume); /// DIT TESTEN!!!!
        } else if (music.type === MusicTypes.Radio) {
            const dispatcher: StreamDispatcher = serverQueue.getConnection().play(music.url);
            dispatcher.setVolumeLogarithmic(serverQueue.volume); /// DIT TESTEN!!!!
        }
    }

    async playRadioInChannel(guildId: string, music: Music) {
        const serverQueue = this.queueService.getServerQueue(guildId);
        const dispatcher: StreamDispatcher = serverQueue.getConnection().play(music.url);
        dispatcher.setVolumeLogarithmic(serverQueue.volume);
    }

    getPossibleRadioStationsAsString(startMessage: string): string {
        let returnString = startMessage;
        this.RADIO_STATIONS.forEach((station) => {
            returnString = returnString.concat("- " + station.title + "\n");
        });
        return returnString;
    }

    getRadioStationFromInput(message: Message): Music {
        const input = this.messageResponder.getContentOfMessage(message);
        for (let station of this.RADIO_STATIONS) {
            if (station.title === input) {
                return station;
            }
        }
    }

    private async getSongFromMessage(message: Message): Promise<Music> {
        const contentOfMessage = this.messageResponder.getContentOfMessage(message);
        return await this.songService.getSong(contentOfMessage, message.author);
    }

    isSongPlayingOnGuild(guildId: string): boolean {
        return this.queueService.getServerQueue(guildId).type === QueueType.Song;
    }

    isRadioPlayingOnGuild(guildId: string): boolean {
        return this.queueService.getServerQueue(guildId).type === QueueType.Radio;
    }
}