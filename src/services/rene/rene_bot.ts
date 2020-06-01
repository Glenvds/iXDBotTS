import { Readable } from 'stream';
import { injectable, inject } from "inversify";
import { Command } from "../../models/general/command";
import { Message, TextChannel } from "discord.js";
import { TYPES } from "../../types";
import { MessageResponder } from "../general/message-responder";
import { readdirSync, createReadStream } from "fs";
import { QueueService } from "../music/queueService";


@injectable()
export class ReneBot {

    private files: string[];

    constructor(
        @inject(TYPES.MessageResponder) private messageResponder: MessageResponder,
        @inject(TYPES.QueueService) private queueService: QueueService) {

        this.generateFileList();
    }

    private get directory() {
        return `${process.cwd()}\\src\\assets\\rene`;
    }

    private generateFileList() {
        this.files = readdirSync(this.directory)
    }

    async executeNSFWCommand(command: Command, message: Message) {
        var channel = message.member.voice.channel;
        if (!channel) return; // No voice channel, too lazy for text quotes

        const guildId = message.guild.id;
        const serverQueue = this.queueService.getServerQueue(guildId);
        if (serverQueue) return; // Song playing

        const msgTextChannel: TextChannel = message.channel as TextChannel;
        const input = this.messageResponder.getContentOfMessage(message);
        const randomSound = this.getSound(input);

        var connection = await channel.join();

        try {
            var streamDispatcher = connection.play(randomSound);

            streamDispatcher.on("error", (err) => {
                // this.messageResponder.sendResponseToChannel(msgTextChannel, err.message);
                // streamDispatcher.end(err);
                console.log(err);
            });

            streamDispatcher.on("finish", () => {
                channel.leave();
            });

            // streamDispatcher.on("end", () => {
            //     channel.leave();
            // });
        } catch (ex) {
            console.log(ex);
            channel.leave();
        }
    }

    getSound(filter: string = null): Readable {
        var filteredFiles = filter ? this.files.filter(x => x.indexOf(filter) > 0) : this.files;
        if (!filteredFiles.length) return;

        var randomFile = `${this.directory}\\${filteredFiles[Math.floor(Math.random() * filteredFiles.length)]}`;

        console.log(`Playing ${randomFile}`);
        return createReadStream(randomFile);
    }
}
