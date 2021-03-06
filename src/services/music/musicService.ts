import { injectable, inject } from "inversify";
import { TYPES } from "../../types";
import { Message, StreamDispatcher } from "discord.js";
import { MessageResponder } from "../general/message-responder";
import { SongService } from "./songService";
import { QueueService } from "./queueService";
import { QueueType, QueueContruct } from "../../models/music/QueueContruct";
import { ServiceResult } from "../../models/general/serviceResult";
import { Music, MusicTypes } from "../../models/music/music";
import { ytService } from "./ytService";
import { readdirSync } from "fs";
import { musicAPI } from "../api/musicAPI";
import { LoggerService } from "../general/loggerService";





@injectable()
export class MusicService {

    private RADIO_STATIONS = [
        new Music({ title: "stubru", url: "http://icecast.vrtcdn.be/stubru-high.mp3", type: MusicTypes.Radio }),
        new Music({ title: "mnm", url: "http://icecast.vrtcdn.be/mnm-high.mp3", type: MusicTypes.Radio }),
        new Music({ title: "radio1", url: "http://icecast.vrtcdn.be/stubru-high.mp3", type: MusicTypes.Radio }),
        new Music({ title: "topradio", url: "http://loadbalancing.topradio.be/topradio.mp3", type: MusicTypes.Radio })
    ];

    private reneFiles: string[];

    //private musicDecibels = 0.001;

    constructor(@inject(TYPES.MessageResponder) private messageResponder: MessageResponder,
        @inject(TYPES.SongService) private songService: SongService,
        @inject(TYPES.QueueService) private queueService: QueueService,
        @inject(TYPES.ytService) private ytService: ytService,
        @inject(TYPES.musicAPI) private musicAPI: musicAPI,
        @inject(TYPES.LoggerService) private LoggerService: LoggerService) {
        this.generateFileList();
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
                this.updateMusicData(serverQueue);
                return new ServiceResult(true, `${song.title} has beed added to the queue.`);
            }
        } else if (!serverQueue) {
            await this.queueService.createMusicServerQueue(message, song);
            await this.playSongsInChannel(guildId, song);
        }
    }

    async playRadio(message: Message): Promise<ServiceResult> {
        const radio = this.getRadioStationFromInput(message);
        if (!radio) { return new ServiceResult(false, this.getPossibleRadioStationsAsString("Don't know this radio station. \n")) };

        const guildId = message.guild.id;
        const serverQueue = this.queueService.getServerQueue(guildId);

        if (serverQueue) {
            if (this.isSongPlayingOnGuild(guildId)) { return new ServiceResult(false, "Music is already playing. First stop playing music(!stop).") };
            this.playRadioInChannel(guildId, radio);
        } else {
            await this.queueService.createRadioServerQueue(message, radio);
            this.playRadioInChannel(guildId, radio);
        }
    }

    async playRene(message: Message) {
        const randomSound: Music = this.getReneFromMessage(message);
        const guildId = message.guild.id;
        const serverQueue = this.queueService.getServerQueue(guildId);
        this.updateMusicData(serverQueue);

        if (serverQueue) {
            if (this.isRadioPlayingOnGuild(guildId)) { return new ServiceResult(false, "Can't queue songs while radio is playing! Use !stop to stop the radio."); }
            else {
                serverQueue.addToQueue(randomSound);
                //return new ServiceResult(true, `${randomSound.title} has beed added to the queue.`);
            }
        } else if (!serverQueue) {
            await this.queueService.createMusicServerQueue(message, randomSound);
            await this.playSongsInChannel(guildId, randomSound);
        }

    }

    private getReneFromMessage(message: Message): Music {
        const filter = this.messageResponder.getContentOfMessage(message);

        var filteredFiles = filter ? this.reneFiles.filter(x => x.indexOf(filter) > 0) : this.reneFiles;
        if (!filteredFiles.length) return;

        var randomFile = `${this.directory}/${filteredFiles[Math.floor(Math.random() * filteredFiles.length)]}`;
        const title = "Rene:" + randomFile.substring(randomFile.indexOf("rene/") + 5);

        console.log(`Playing ${randomFile}`);
        return new Music({ title: title, type: MusicTypes.SoundBoard, url: randomFile, requester: message.author });
    }

    async playSongsInChannel(guildId: string, music: Music) {
        const serverQueue = this.queueService.getServerQueue(guildId);

        if (!serverQueue) { return; }

        if (!music) {
            //this.messageResponder.sendResponseToChannel(serverQueue.textChannel, "Ran out of songs, I'm leaving.");
            //serverQueue.voiceChannel.leave();
            this.updateMusicData(serverQueue);
            this.queueService.removeServerQueue(guildId);
            return;
        }
        try {
            if (music.type === MusicTypes.Song) {
                this.updateMusicData(serverQueue);
                this.messageResponder.sendResponseToChannel(serverQueue.textChannel, `Started playing: ${music.title}. Requested by ${music.requester.username}`);
                const ytStream = await this.ytService.getStreamYoutube(music);
                const dispatcher: StreamDispatcher = serverQueue.getConnection().play(ytStream, { type: "opus" })
                    .on("finish", () => {
                        console.log(music.title + " ended playing.");
                        serverQueue.songs.shift();
                        this.playSongsInChannel(guildId, serverQueue.songs[0])
                    });
                //dispatcher.setVolumeLogarithmic(serverQueue.volume / 5); /// DIT TESTEN!!!!
                dispatcher.setVolumeDecibels(0.5);
            } else if (music.type === MusicTypes.Radio) {
                const dispatcher: StreamDispatcher = serverQueue.getConnection().play(music.url);
                dispatcher.setVolumeLogarithmic(serverQueue.volume / 5); /// DIT TESTEN!!!!
            } else if (music.type === MusicTypes.SoundBoard) {
                const dispatcher: StreamDispatcher = serverQueue.getConnection().play(music.url)
                    .on("finish", () => {
                        //console.log(music.title + " ended playing.");
                        serverQueue.songs.shift();
                        this.playSongsInChannel(guildId, serverQueue.songs[0])
                    });
                dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
            }
        }
        catch (ex) {
            this.LoggerService.logger.error(ex)
        }
    }

    async playRadioInChannel(guildId: string, music: Music) {
        const serverQueue = this.queueService.getServerQueue(guildId);
        this.updateMusicData(serverQueue);
        const dispatcher: StreamDispatcher = serverQueue.getConnection().play(music.url);
        dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
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

    private get directory() {
        return `${process.cwd()}/src/assets/rene`;
    }

    private generateFileList() {
        this.reneFiles = readdirSync(this.directory)
        // console.log("Loaded files for rene", this.files);
    }

    private updateMusicData(queue: QueueContruct) {
        this.musicAPI.sendMusicData(queue.songs);
    }
}