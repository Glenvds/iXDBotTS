import { Client, Message, Channel, TextChannel, DMChannel, NewsChannel } from "discord.js";
import { inject, injectable } from "inversify";
import { TYPES } from "./types";
import { MessageResponder } from "./services/general/message-responder";
import { Command, CommandType } from "./models/general/command";
import { cmdService } from "./services/general/cmdService";
import { MusicBot } from "./services/music/music_bot";
import { NSFWBot } from "./services/nsfw/nsfw_bot";

@injectable()
export class Bot {
    private prefix: string = "!";
    private iXDmusicChannelId = "312940674133655552" // REAL
    //private iXDmusicChannelId = "706069227613978634"  // TEST

    constructor(@inject(TYPES.Client) private client: Client,
        @inject(TYPES.Token) private readonly token: string,
        @inject(TYPES.MessageResponder) private messageResponder: MessageResponder,
        @inject(TYPES.cmdService) private cmdService: cmdService,
        @inject(TYPES.MusicBot) private MusicBot: MusicBot,
        @inject(TYPES.NSFWBot) private NSFWBot: NSFWBot) {
    }

    public listen(): Promise<string> {
        this.client.on("message", (message: Message) => {
            if (message.author.bot || !message.content.startsWith(this.prefix)) { return; }

            const args = message.content.split(" ");
            const inputCommand = args[0].split(this.prefix)[1].toLocaleLowerCase();

            const requestedCommand: Command = this.cmdService.getCommand(inputCommand);
            const msgTextChannel: TextChannel = message.channel as TextChannel;

            if (requestedCommand) {
                switch (requestedCommand.type) {
                    case CommandType.Music:
                        if (msgTextChannel.id !== this.iXDmusicChannelId) {
                            this.messageResponder.sendResponseToChannel(msgTextChannel, "This isn't the music channel!");
                        }
                        else {
                            const usrVoiceChannel = message.member.voice.channel;
                            if (!usrVoiceChannel) {
                                this.messageResponder.sendResponseToChannel(msgTextChannel, "You need to be in a voice channel to execute music commands!");
                            }
                            else { this.MusicBot.executeMusicCommand(requestedCommand, message); }
                        }
                        break;
                    case CommandType.NSFW:
                        if (!msgTextChannel.nsfw) {
                            this.messageResponder.sendResponseToChannel(msgTextChannel, "This isn't the NSFW channel!")
                        }
                        else { this.NSFWBot.executeNSFWCommand(requestedCommand, message); }
                }
            } else {
                this.messageResponder.sendResponseToChannel(msgTextChannel, "Oops! I don't know that command.");
            }
        });
        return this.client.login(this.token);
    }
}