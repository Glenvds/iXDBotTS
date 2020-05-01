import { injectable, inject } from "inversify";
import { TYPES } from "../../types";
import { Command } from "../../models/general/command";
import { Message, VoiceChannel, TextChannel, VoiceConnection, Guild, StreamDispatcher, User } from "discord.js";
import { QueueContruct } from "../../models/music/QueueContruct";
import { urlService } from "../general/urlService";
import { ytService } from "./ytService";
import { iYtsr } from "../../interfaces/iYtsr";
import { Song } from "../../models/music/song";
import { MessageResponder } from "../general/message-responder";
import { runInThisContext } from "vm";
import { iVideoInfo } from "../../interfaces/iVideoInfo";

@injectable()
export class MusicBot {
    queue = new Map();
    constructor(@inject(TYPES.urlService) private urlService: urlService,
        @inject(TYPES.ytService) private ytService: ytService,
        @inject(TYPES.MessageResponder) private messageResponder: MessageResponder) { }

    executeMusicCommand(command: Command, message: Message) {
        const serverQueue: QueueContruct = this.queue.get(message.guild.id);
        switch (command.textCommand) {
            case "play": this.playQueue(serverQueue, message); break;
            case "skip": this.skip(serverQueue); break;
            case "next": this.skip(serverQueue); break;
            case "stop": this.stop(serverQueue); break;
            case "queue": this.getQueue(serverQueue); break;
            //case "radio": this.playRadio(message); break;
        }
    }

    //PRIVATE METHODS
    //MANAGING QUEUES
    private async playQueue(serverQueue: QueueContruct, message: Message) {
        const voiceChannel: VoiceChannel = message.member.voice.channel;
        const contentOfMessage: string = this.getContentOutOfMessage(message);
        const song: Song = await this.getSong(contentOfMessage, message.author);

        if (!serverQueue) {
            const connection = await this.setUpVoiceConnection(voiceChannel);
            const queueContruct = new QueueContruct(message.guild, message.channel as TextChannel, voiceChannel, song, connection);
            this.addNewServerQueueToMainQueue(queueContruct)
            this.play(message.guild, queueContruct.songs[0]);
        } else {
            serverQueue.addSong(song);
            this.messageResponder.sendResponseToChannel(message.channel as TextChannel, `${song.title} has been added to the queue`); //ADD USERNAME TO RESPONSE
        }
    }

    private async addNewServerQueueToMainQueue(serverQueue: QueueContruct){
        this.queue.set(serverQueue.guild.id, serverQueue);
    }

    private getQueue(serverQueue: QueueContruct) {
        let text = "```--- Music queue ---\n\n";
        serverQueue.songs.forEach((song: Song, index: number) => {
            if (index === 0) {
                text = text.concat("Now playing: " + song.title + " | Requested by: " + song.requester.username + "\n\n");
            } else {
                text = text.concat(index + ". " + song.title + " | Requested by: " + song.requester + "\n");
            }
        });
        text = text.concat("```");
        this.messageResponder.sendMultipleLineResponseToChannel(serverQueue.textChannel, text);
    }
    
    removeGuildQueue(guild: Guild){
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
        
        if (!song) {
            this.messageResponder.sendResponseToChannel(serverQueue.textChannel, "Ran out of songs, I'm leaving. Soai..");
            serverQueue.voiceChannel.leave();
            this.queue.delete(guild.id);
            return;
        }

        this.messageResponder.sendResponseToChannel(serverQueue.textChannel, `Started playing: [${song.title}](${song.url}). Request by ${song.requester}`);
        try {
            const ytStream = await this.ytService.getStreamYoutube(song);
            console.log(serverQueue);
            
            const dispatcher: StreamDispatcher = serverQueue.connection.play(ytStream, { type: "opus" });
            dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
        } catch (err) {
            console.log("Error in play: " + err);
        }
    }

    private skip(serverQueue: QueueContruct) {
        if (!serverQueue) {
            this.messageResponder.sendResponseToChannel(serverQueue.textChannel, "There are no songs to skip!");
        } else {
            serverQueue.connection.dispatcher.end();
        }
    }

    private stop(serverQueue: QueueContruct) {
        this.messageResponder.sendResponseToChannel(serverQueue.textChannel, "Deleted my queue, I'm out.");
        serverQueue.emptySongs();
        serverQueue.connection.dispatcher.end();
    }    

    private getContentOutOfMessage(message: Message): string {
        return message.content.substring(message.content.indexOf(' ') + 1);
    }

    private async setUpVoiceConnection(voiceChannel: VoiceChannel): Promise<VoiceConnection>{
        try {
            return await voiceChannel.join();
        } catch (err) {
            console.log("Error while setting up voice connection: " + err);
        }
    }




}