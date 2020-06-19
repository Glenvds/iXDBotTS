"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const rene_bot_1 = require("./services/rene/rene_bot");
const discord_js_1 = require("discord.js");
const inversify_1 = require("inversify");
const types_1 = require("./types");
const message_responder_1 = require("./services/general/message-responder");
const command_1 = require("./models/general/command");
const cmdService_1 = require("./services/general/cmdService");
const music_bot_1 = require("./services/music/music_bot");
const nsfw_bot_1 = require("./services/nsfw/nsfw_bot");
const general_bot_1 = require("./services/general/general_bot");
let Bot = class Bot {
    constructor(client, token, messageResponder, cmdService, MusicBot, NSFWBot, GeneralBot, ReneBot) {
        this.client = client;
        this.token = token;
        this.messageResponder = messageResponder;
        this.cmdService = cmdService;
        this.MusicBot = MusicBot;
        this.NSFWBot = NSFWBot;
        this.GeneralBot = GeneralBot;
        this.ReneBot = ReneBot;
        this.prefix = "!";
        this.iXDmusicChannelId = "312940674133655552"; // REAL 312940674133655552
        this.MCmusicChannelId = "709788673423441993"; // FAST IMPLEMENTATION FOR MC SERVER 709788673423441993
        this.TestMusicChannelId = "706069227613978634"; // TEST
        this.musicChannels = [this.iXDmusicChannelId, this.MCmusicChannelId, this.TestMusicChannelId];
    }
    listen() {
        this.client.on("message", (message) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (message.author.bot || !message.content.startsWith(this.prefix)) {
                    return;
                }
                const args = message.content.split(" ");
                const inputCommand = args[0].split(this.prefix)[1].toLocaleLowerCase();
                const requestedCommand = this.cmdService.getCommand(inputCommand);
                const msgTextChannel = message.channel;
                if (requestedCommand) {
                    switch (requestedCommand.type) {
                        case command_1.CommandType.Music:
                            if (!this.musicChannels.includes(msgTextChannel.id)) {
                                this.messageResponder.sendResponseToChannel(msgTextChannel, "This isn't the music channel!");
                            }
                            else {
                                if (this.isUserInVoiceChannel(message)) {
                                    this.messageResponder.sendResponseToChannel(msgTextChannel, "You need to be in a voice channel to execute music commands!");
                                }
                                else {
                                    this.MusicBot.executeMusicCommand(requestedCommand, message);
                                }
                            }
                            break;
                        case command_1.CommandType.NSFW:
                            if (!msgTextChannel.nsfw) {
                                this.messageResponder.sendResponseToChannel(msgTextChannel, "This isn't the NSFW channel!");
                            }
                            else {
                                this.NSFWBot.executeNSFWCommand(requestedCommand, message);
                            }
                            break;
                        case command_1.CommandType.General:
                            this.GeneralBot.executeGeneralCommand(requestedCommand, message);
                            break;
                        /*case CommandType.Rene:
                            if (this.isUserInVoiceChannel(message)) {
                                this.messageResponder.sendResponseToChannel(msgTextChannel, "You need to be in a voice channel to execute soundboard commands!");
                            } else {
                                await this.MusicBot.executeMusicCommand(requestedCommand, message);
                            }
                            break;*/
                    }
                }
                else {
                    this.messageResponder.sendResponseToChannel(msgTextChannel, "Oops! I don't know that command.");
                }
            }
            catch (ex) {
                console.error(ex);
            }
        }));
        this.client.on("voiceStateUpdate", (oldMember, newMember) => {
            let oldGuildId = oldMember.guild.id;
            console.log("VOICE STATE UPDATED AA SKAAN: " + oldGuildId);
            this.MusicBot.checkForEmptyVoiceChannel(oldGuildId);
        });
        return this.client.login(this.token);
    }
    isUserInVoiceChannel(message) {
        return !message.member.voice.channel;
    }
};
Bot = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.inject(types_1.TYPES.Client)),
    __param(1, inversify_1.inject(types_1.TYPES.Token)),
    __param(2, inversify_1.inject(types_1.TYPES.MessageResponder)),
    __param(3, inversify_1.inject(types_1.TYPES.cmdService)),
    __param(4, inversify_1.inject(types_1.TYPES.MusicBot)),
    __param(5, inversify_1.inject(types_1.TYPES.NSFWBot)),
    __param(6, inversify_1.inject(types_1.TYPES.GeneralBot)),
    __param(7, inversify_1.inject(types_1.TYPES.ReneBot)),
    __metadata("design:paramtypes", [discord_js_1.Client, String, message_responder_1.MessageResponder,
        cmdService_1.cmdService,
        music_bot_1.MusicBot,
        nsfw_bot_1.NSFWBot,
        general_bot_1.GeneralBot,
        rene_bot_1.ReneBot])
], Bot);
exports.Bot = Bot;
//# sourceMappingURL=bot.js.map