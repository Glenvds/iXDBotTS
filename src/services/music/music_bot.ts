import { injectable, inject } from "inversify";
import { TYPES } from "../../types";
import { Command } from "../../models/general/command";
import { Message, VoiceChannel, TextChannel, VoiceConnection, Guild, StreamDispatcher, User } from "discord.js";
import { QueueContruct, QueueContructOptions } from "../../models/music/QueueContruct";
import { urlService } from "../general/urlService";
import { ytService } from "./ytService";
import { iYtsr } from "../../interfaces/iYtsr";
import { Song } from "../../models/music/song";
import { MessageResponder } from "../general/message-responder";
import { iVideoInfo } from "../../interfaces/iVideoInfo";
import { RadioStationService } from "./radioStationService";
import { RadioStation } from "../../models/music/radioStation";

@injectable()
export class MusicBot {
    queue = new Map();
    radioQueue = new Map();
    isMusicPlaying: boolean = false;
    isRadioPlaying: boolean = false;

    constructor(@inject(TYPES.urlService) private urlService: urlService,
        @inject(TYPES.ytService) private ytService: ytService,
        @inject(TYPES.MessageResponder) private messageResponder: MessageResponder,
        @inject(TYPES.RadioStationService) private radioStationService: RadioStationService) { }

    executeMusicCommand(command: Command, message: Message) {
        switch (command.textCommand) {
            case "play": this.playQueue(message); break;
            case "skip": this.skip(message); break;
            case "next": this.skip(message); break;
            case "stop": this.stop(message); break;
            case "queue": this.getQueue(message); break;
            case "radio": this.startRadio(message); break;
        }
    }

    //PRIVATE METHODS
    //MANAGING QUEUES
    private async playQueue(message: Message) {
        const serverQueue: QueueContruct = this.queue.get(message.guild.id);
        const voiceChannel: VoiceChannel = message.member.voice.channel;
        const textChannel: TextChannel = message.channel as TextChannel;
        const contentOfMessage: string = this.getContentOutOfMessage(message);
        let song: Song;

        if(this.isRadioPlaying){
            this.messageResponder.sendResponseToChannel(textChannel, "Can't queue songs while radio is playing! Use !stop to stop the radio.");
            return;
        }

        if (!contentOfMessage) {
            this.messageResponder.sendMultipleLineResponseToChannel(textChannel, "Need to give a YouTube-url or YouTube search string to play a song. \n Ex.: '!play linkin park numb' or '!play https://youtu.be/kXYiU_JCYtU'");
            return;
        }

        try {
            song = await this.getSong(contentOfMessage, message.author);
        } catch (err) {
            this.messageResponder.sendResponseToChannel(textChannel, "No video found with that search string");
            console.log("Error in playQueue getSong(): " + err);
            return;
        }

        if (!serverQueue) {
            try {
                const queueContruct = await QueueContruct.create({ guildId: message.guild.id, textChannel: textChannel, voiceChannel: voiceChannel, firstPlay: song });
                this.addNewServerQueueToMainQueue(queueContruct)
                this.play(message.guild, queueContruct.songs[0] as Song);
            } catch (err) {
                console.log("Error in playQueue while setting up queue: " + err);
            }

        } else {
            serverQueue.addToQueue(song);
            this.messageResponder.sendResponseToChannel(textChannel, `${song.title} has been added to the queue`); //ADD USERNAME TO RESPONSE
        }
    }

    private async addNewServerQueueToMainQueue(serverQueue: QueueContruct) {
        this.queue.set(serverQueue.guildId, serverQueue);
    }

    private getQueue(message: Message) {
        const serverQueue: QueueContruct = this.queue.get(message.guild.id);
        const textChannel = message.channel as TextChannel;
        if(!serverQueue){
            this.messageResponder.sendResponseToChannel(textChannel, "There is currently no queue! Start adding song with !play");
            return;
        }

        if(this.isRadioPlaying){
            const currentRadioStation = serverQueue.songs[0] as RadioStation;
            this.messageResponder.sendResponseToChannel(textChannel, "Current radio station playing: " + currentRadioStation.name);
            return;
        }


        let text = "--- Music queue ---\n\n";
        serverQueue.songs.forEach((song: Song, index: number) => {
            if (index === 0) {
                text = text.concat("Now playing: " + song.title + " | Requested by: " + song.requester.username + "\n\n");
            } else {
                text = text.concat(index + ". " + song.title + " | Requested by: " + song.requester.username + "\n");
            }
        });

        this.messageResponder.sendMultipleLineResponseToChannel(serverQueue.textChannel, text);
    }

    private removeGuildQueue(guild: Guild) {
        this.queue.delete(guild.id);
    }

    //MANAGING & PLAYING SONGS 
    private async getSong(contentOfmessage: string, author: User): Promise<Song> {
        try {
            const requestURL: string = await this.getSongUrl(contentOfmessage);
            const songInfo: iVideoInfo = await this.ytService.getInfoStreamYoutube(requestURL);
            return new Song(songInfo.title, songInfo.video_url, author);
        } catch (err) {            
            console.log("Error in getSong(): " + err);
        }
    }

    private async getSongUrl(contentOfMessage: string): Promise<string> {
        try {
            if (!this.urlService.isUrl(contentOfMessage)) {
                const result: iYtsr = await this.ytService.searchYoutube(contentOfMessage);
                return result.items[0].link;
            } else {
                return contentOfMessage;
            }
        } catch (err) {
            console.log("Error in getting song URL: " + err);
        }
    }

    private async play(guild: Guild, song: Song) {
        const serverQueue = this.queue.get(guild.id) as QueueContruct;

        if(!serverQueue){
            return;
        }

        if (!song) {
            this.messageResponder.sendResponseToChannel(serverQueue.textChannel, "Ran out of songs, I'm leaving. Soai..");
            this.isMusicPlaying = false;
            serverQueue.voiceChannel.leave();
            this.removeGuildQueue(guild);
            return;
        }

        this.messageResponder.sendResponseToChannel(serverQueue.textChannel, `Started playing: ${song.title}. Request by ${song.requester.username}`);
        this.isMusicPlaying = true;
        try {
            const ytStream = await this.ytService.getStreamYoutube(song);
            const dispatcher: StreamDispatcher = serverQueue.getConnection().play(ytStream, { type: "opus" })
                .on("finish", () => {
                    console.log(song.title + " ended playing");
                    serverQueue.songs.shift();
                    this.play(guild, serverQueue.songs[0] as Song)
                });
            dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
        } catch (err) {
            console.log("Error in play: " + err);
        }
    }

    private skip(message: Message) {
        const serverQueue: QueueContruct = this.queue.get(message.guild.id);
        const textChannel = message.channel as TextChannel;        
        if(this.isRadioPlaying){
            this.messageResponder.sendResponseToChannel(textChannel, "Can't use skip command while radio is playing!");
            return;
        }
        if (!serverQueue) {
            this.messageResponder.sendResponseToChannel(textChannel, "There are no songs to skip!");
        } else {
            serverQueue.getConnection().dispatcher.end();
        }
    }

    private stop(message: Message) {
        const serverQueue: QueueContruct = this.queue.get(message.guild.id);
        const textChannel = message.channel as TextChannel;
        if (!serverQueue) {
            this.messageResponder.sendResponseToChannel(textChannel, "There is nothing to stop!");
            return;
        }

        if (this.isMusicPlaying) {
            this.isMusicPlaying = false;
        } else if (this.isRadioPlaying) {
            this.isRadioPlaying = false;
        }

        serverQueue.getConnection().dispatcher.end();
        this.queue.delete(message.guild.id);
    }

    private getContentOutOfMessage(message: Message): string {
        if (message.content.indexOf(' ') !== -1) {
            return message.content.substring(message.content.indexOf(' ') + 1).toLocaleLowerCase();
        } else {
            return;
        }

    }



    //RADIO

    private async startRadio(message: Message) {
        const content = this.getContentOutOfMessage(message);
        const voiceChannel = message.member.voice.channel;
        const textChannel = message.channel as TextChannel;
        const guildId = message.guild.id;
        const requestedStation = this.radioStationService.getRadioStationFromInput(content);

        if (!content) {
            if (this.isRadioPlaying) {
                const currentRadioStation: RadioStation = this.queue.get(guildId);
                this.messageResponder.sendMultipleLineResponseToChannel(textChannel, this.radioStationService.getPossibleRadioStationsAsString("Currently playing radio station: " + currentRadioStation.name + ". \n"));
            } else {
                this.messageResponder.sendMultipleLineResponseToChannel(textChannel, this.radioStationService.getPossibleRadioStationsAsString("Need to give a radio station! (ex. !playradio stubru)\n Possible options: \n"));
            }
        } else {
            if (this.isMusicPlaying) {
                this.messageResponder.sendResponseToChannel(textChannel, "Music is already playing. First stop playing music(!stop).");
            } else if (this.isRadioPlaying) {
                this.playRadio(guildId, requestedStation);
            } else {                
                const newQueue = await QueueContruct.create({ guildId: guildId, textChannel: textChannel, voiceChannel: voiceChannel, firstPlay: requestedStation });
                this.queue.set(guildId, newQueue);
                this.playRadio(guildId, requestedStation);
            }
        }
    }

    private async playRadio(guildId: string, radioStation: RadioStation) {
        this.isRadioPlaying = true;
        const serverQueue = this.queue.get(guildId) as QueueContruct;
        const dispatcher = serverQueue.getConnection().play(radioStation.url)
        .on("start", () => {
            this.messageResponder.sendResponseToChannel(serverQueue.textChannel, "Started playing radio station: " + radioStation.name);
        });
    }





}


/*
EMPTY PLAY?
ADD RADIO OPTIONS


*/