import { Readable } from 'stream';
import { injectable, inject } from "inversify";
import { Command } from "../../models/general/command";
import { Message, TextChannel } from "discord.js";
import { TYPES } from "../../types";
import { MessageResponder } from "../general/message-responder";
import { urlService } from "../general/urlService";
import { readdirSync, fstat, createReadStream } from "fs";
import { QueueService } from "../music/queueService";


@injectable()
export class ReneBot {

    private files: string[];

    constructor(
        @inject(TYPES.MessageResponder) private messageResponder: MessageResponder,
        @inject(TYPES.urlService) private urlService: urlService,
        @inject(TYPES.QueueService) private queueService: QueueService) {

        this.generateFileList();
    }

    private generateFileList() {
        var fileDirectory = process.cwd() + "\\src\\assets\\rene";
        this.files = readdirSync(fileDirectory)
    }

    async executeNSFWCommand(command: Command, message: Message) {
        var channel = message.member.voice.channel;
        if (!channel) return; // No voice channel, too lazy for text quotes

        const guildId = message.guild.id;
        const serverQueue = this.queueService.getServerQueue(guildId);
        if (serverQueue) return; // Song playing

        const msgTextChannel: TextChannel = message.channel as TextChannel;
        const input = this.messageResponder.getContentOfMessage(message);
        const randomSound = await this.getSound(input);

        var connection = await channel.join();
        var streamDispatcher = connection.play(randomSound);

        streamDispatcher.on("error", function (err) {
            this.messageResponder.sendResponseToChannel(msgTextChannel, err.message);
            streamDispatcher.end(err);
        });

        streamDispatcher.on("end", () => {
            channel.leave();
        });
    }

    getSound(filter: string = null): Readable {
        var filteredFiles = filter ? this.files.filter(x => x.indexOf(filter) > 0) : this.files;
        var randomFile = filteredFiles[Math.floor(Math.random() * filteredFiles.length)]
        return createReadStream(randomFile);
    }
}
