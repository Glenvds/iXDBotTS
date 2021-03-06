import { ReneBot } from './services/rene/rene_bot';
import { Client, Message, Channel, TextChannel, DMChannel, NewsChannel } from "discord.js";
import { inject, injectable } from "inversify";
import { TYPES } from "./types";
import { MessageResponder } from "./services/general/message-responder";
import { Command, CommandType } from "./models/general/command";
import { cmdService } from "./services/general/cmdService";
import { MusicBot } from "./services/music/music_bot";
import { NSFWBot } from "./services/nsfw/nsfw_bot";
import { GeneralBot } from "./services/general/general_bot";
import { LoggerService } from './services/general/loggerService';

@injectable()
export class Bot {
    private prefix: string = "!";
    private iXDmusicChannelId = "312940674133655552" // REAL 312940674133655552
    private MCmusicChannelId = "709788673423441993" // FAST IMPLEMENTATION FOR MC SERVER 709788673423441993
    private TestMusicChannelId = "706069227613978634"  // TEST
    private musicChannels = [this.iXDmusicChannelId, this.MCmusicChannelId, this.TestMusicChannelId];


    constructor(@inject(TYPES.Client) private client: Client,
        @inject(TYPES.Token) private readonly token: string,
        @inject(TYPES.MessageResponder) private messageResponder: MessageResponder,
        @inject(TYPES.cmdService) private cmdService: cmdService,
        @inject(TYPES.MusicBot) private MusicBot: MusicBot,
        @inject(TYPES.NSFWBot) private NSFWBot: NSFWBot,
        @inject(TYPES.GeneralBot) private GeneralBot: GeneralBot,
        @inject(TYPES.LoggerService) private LoggerService: LoggerService) {
    }

    public listen(): Promise<string> {

        this.client.on("message", async (message: Message) => {
            try {
                if (message.author.bot || !message.content.startsWith(this.prefix)) { return; }

                const args = message.content.split(" ");
                const inputCommand = args[0].split(this.prefix)[1].toLocaleLowerCase();

                const requestedCommand: Command = this.cmdService.getCommand(inputCommand);
                const msgTextChannel: TextChannel = message.channel as TextChannel;

                if (requestedCommand) {
                    this.LoggerService.logger.silly("COMMAND: " + requestedCommand.textCommand + " of type " + requestedCommand.type + " started.")
                    switch (requestedCommand.type) {
                        case CommandType.Music:
                            if (!this.musicChannels.includes(msgTextChannel.id)) {
                                this.messageResponder.sendResponseToChannel(msgTextChannel, "This isn't the music channel!");
                            }
                            else {

                                if (this.isUserInVoiceChannel(message)) {
                                    this.messageResponder.sendResponseToChannel(msgTextChannel, "You need to be in a voice channel to execute music commands!");
                                }
                                else { this.MusicBot.executeMusicCommand(requestedCommand, message); }
                            }
                            break;

                        case CommandType.NSFW:
                            if (!msgTextChannel.nsfw) {
                                this.messageResponder.sendResponseToChannel(msgTextChannel, "This isn't the NSFW channel!")
                            }
                            else { this.NSFWBot.executeNSFWCommand(requestedCommand, message); } break;

                        case CommandType.General:
                            this.GeneralBot.executeGeneralCommand(requestedCommand, message);
                            break;
                    }
                } else {
                    this.messageResponder.sendResponseToChannel(msgTextChannel, "Oops! I don't know that command.");
                }
            } catch (ex) {
                this.LoggerService.logger.error(ex)
                console.error(ex);
            }
        });

        this.client.on("voiceStateUpdate", (oldMember, newMember) => {
            //LEAVE VOICECHANNEL IF EMPTY
            let oldChannel = oldMember.channel;
            let oldGuildId = oldMember.guild.id;
            if (oldChannel) {
                if (this.MusicBot.isBotPlayingInGuild(oldGuildId)) {
                    this.MusicBot.leaveVoiceChannelWhilePlaying(oldGuildId);
                }
                else if (oldChannel.members.size == 1) {
                    oldChannel.leave();
                }
            }
        });

        return this.client.login(this.token);
    }

    private isUserInVoiceChannel(message: Message): Boolean {
        return !message.member.voice.channel;
    }
}