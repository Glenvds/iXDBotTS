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
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const inversify_1 = require("inversify");
const types_1 = require("./types");
const message_responder_1 = require("./services/general/message-responder");
const command_1 = require("./models/general/command");
const cmdService_1 = require("./services/general/cmdService");
const music_bot_1 = require("./services/music/music_bot");
const nsfw_bot_1 = require("./services/nsfw/nsfw_bot");
let Bot = class Bot {
    //private testiXDmusicChannelId = "706069227613978634"
    constructor(client, token, messageResponder, cmdService, MusicBot, NSFWBot) {
        this.client = client;
        this.token = token;
        this.messageResponder = messageResponder;
        this.cmdService = cmdService;
        this.MusicBot = MusicBot;
        this.NSFWBot = NSFWBot;
        this.prefix = "!";
        this.iXDmusicChannelId = "312940674133655552";
    }
    listen() {
        this.client.on("message", (message) => {
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
                        if (msgTextChannel.id !== this.iXDmusicChannelId) {
                            this.messageResponder.sendResponseToChannel(msgTextChannel, "This isn't the music channel!");
                        }
                        else {
                            const usrVoiceChannel = message.member.voice.channel;
                            if (!usrVoiceChannel) {
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
                }
            }
            else {
                this.messageResponder.sendResponseToChannel(msgTextChannel, "Oops! I don't know that command.");
            }
        });
        return this.client.login(this.token);
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
    __metadata("design:paramtypes", [discord_js_1.Client, String, message_responder_1.MessageResponder,
        cmdService_1.cmdService,
        music_bot_1.MusicBot,
        nsfw_bot_1.NSFWBot])
], Bot);
exports.Bot = Bot;
//# sourceMappingURL=bot.js.map