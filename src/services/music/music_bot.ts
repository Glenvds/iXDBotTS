import { injectable, inject } from "inversify";
import { TYPES } from "../../types";
import { Command } from "../../models/general/command";
import { Message, VoiceChannel, TextChannel, VoiceConnection, Guild, StreamDispatcher, User } from "discord.js";
import { QueueContruct, QueueContructOptions, QueueType } from "../../models/music/QueueContruct";
import { urlService } from "../general/urlService";
import { ytService } from "./ytService";
import { MessageResponder } from "../general/message-responder";
import { QueueService } from "./queueService";
import { MusicService } from "./musicService";
import { Music } from "../../models/music/music";

@injectable()
export class MusicBot {
    constructor(@inject(TYPES.MessageResponder) private messageResponder: MessageResponder,
        @inject(TYPES.QueueService) private queueService: QueueService,
        @inject(TYPES.MusicService) private musicService: MusicService) { }

    executeMusicCommand(command: Command, message: Message) {
        switch (command.textCommand) {
            case "play": this.playSong(message); break;
            case "radio": this.playRadio(message); break;
            case "skip": this.skip(message); break;
            case "next": this.skip(message); break;
            case "stop": this.stop(message.guild.id); break;
            case "queue": this.respondQueue(message); break;
            case "rene": this.playRene(message); break;
        }
    }

    checkForEmptyVoiceChannel(guildId: string) {
        const serverQueue: QueueContruct = this.queueService.getServerQueue(guildId);
        console.log("SERVERQUEUE: " + serverQueue);
        if (serverQueue) {
            const voiceChannel: VoiceChannel = serverQueue.getVoiceChannel();
            console.log("VOICECH: " + voiceChannel.id);
            console.log("VOICECH SIZE: " + voiceChannel.members.size)
            if (voiceChannel.members.size == 1) {
                console.log("BOT SHOULD STOP HERE");
                this.stop(guildId);
            }
        }
    }

    private async playSong(message: Message) {

        const textChannel = message.channel as TextChannel;
        const contentOfMessage: string = this.messageResponder.getContentOfMessage(message);

        if (!contentOfMessage) { this.messageResponder.sendMultipleLineResponseToChannel(textChannel, "Need to give a YouTube-url or YouTube search string to play a song. \n Ex.: '!play linkin park numb' or '!play https://youtu.be/kXYiU_JCYtU'"); return; }

        const serviceResult = await this.musicService.playSong(message);
        if (serviceResult) { this.messageResponder.sendResponseToChannel(textChannel, serviceResult.message); }
    }

    private async playRadio(message: Message) {
        const textChannel = message.channel as TextChannel;
        const contentOfMessage = this.messageResponder.getContentOfMessage(message);

        if (!contentOfMessage) { this.messageResponder.sendMultipleLineResponseToChannel(textChannel, this.musicService.getPossibleRadioStationsAsString("Need to give a radio station! (ex. !playradio stubru)\n Possible options: \n")); return; }

        const serviceResult = await this.musicService.playRadio(message);
        if (serviceResult) { this.messageResponder.sendResponseToChannel(textChannel, serviceResult.message); }
    }

    private async playRene(message: Message) {
        const textChannel = message.channel as TextChannel;

        const serviceResult = await this.musicService.playRene(message);
        if (serviceResult) { this.messageResponder.sendResponseToChannel(textChannel, serviceResult.message); }
    }


    private respondQueue(message: Message) {

        const guildId = message.guild.id;
        const serverQueue = this.queueService.getServerQueue(guildId);
        const textChannel = message.channel as TextChannel;

        if (!serverQueue) { this.messageResponder.sendResponseToChannel(textChannel, "There is currently no queue! Start adding song with !play or play radio with !radio"); return; }

        if (serverQueue.type === QueueType.Song) {
            let text = "--- Music queue ---\n\n";
            serverQueue.songs.forEach((song: Music, index: number) => {
                if (index === 0) {
                    text = text.concat("Now playing: " + song.title + " | Requested by: " + song.requester.username + "\n\n");
                } else {
                    text = text.concat(index + ". " + song.title + " | Requested by: " + song.requester.username + "\n");
                }
            });
            this.messageResponder.sendMultipleLineResponseToChannel(serverQueue.textChannel, text);
        } else if (serverQueue.type === QueueType.Radio) {
            const currentRadioStation = serverQueue.songs[0];
            this.messageResponder.sendResponseToChannel(textChannel, "Current radio station playing: " + currentRadioStation.title);
            return;
        }
    }

    private skip(message: Message) {
        const serverQueue = this.queueService.getServerQueue(message.guild.id);

        if (serverQueue && serverQueue.type === QueueType.Radio) { this.messageResponder.sendResponseToChannel(serverQueue.textChannel, "Can't use skip command while radio is playing!"); return; }
        else if (!serverQueue) { this.messageResponder.sendResponseToChannel(serverQueue.textChannel, "There are no songs to skip!"); }
        else {
            serverQueue.getConnection().dispatcher.end();
        }
    }

    private stop(guildId: string) {
        //const guildId = message.guild.id;
        const serverQueue: QueueContruct = this.queueService.getServerQueue(guildId);

        if (!serverQueue) { this.messageResponder.sendResponseToChannel(serverQueue.textChannel, "There is nothing to stop!"); return; }

        serverQueue.getConnection().dispatcher.end();
        serverQueue.voiceChannel.leave();
        this.queueService.removeServerQueue(guildId);
    }
}


