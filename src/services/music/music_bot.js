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
exports.MusicBot = void 0;
const inversify_1 = require("inversify");
const types_1 = require("../../types");
const QueueContruct_1 = require("../../models/music/QueueContruct");
const message_responder_1 = require("../general/message-responder");
const queueService_1 = require("./queueService");
const musicService_1 = require("./musicService");
let MusicBot = class MusicBot {
    constructor(messageResponder, queueService, musicService) {
        this.messageResponder = messageResponder;
        this.queueService = queueService;
        this.musicService = musicService;
    }
    executeMusicCommand(command, message) {
        switch (command.textCommand) {
            case "play":
                this.playSong(message);
                break;
            case "radio":
                this.playRadio(message);
                break;
            case "skip":
                this.skip(message);
                break;
            case "next":
                this.skip(message);
                break;
            case "stop":
                this.stop(message.guild.id);
                break;
            case "queue":
                this.respondQueue(message);
                break;
            case "rene":
                this.playRene(message);
                break;
        }
    }
    isBotPlayingInGuild(guildId) {
        const serverQueue = this.queueService.getServerQueue(guildId);
        if (serverQueue) {
            return true;
        }
        return false;
    }
    leaveVoiceChannelWhilePlaying(guildId) {
        const serverQueue = this.queueService.getServerQueue(guildId);
        if (serverQueue) {
            const voiceChannel = serverQueue.getVoiceChannel();
            if (voiceChannel.members.size == 1) {
                this.stop(guildId);
            }
        }
    }
    playSong(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const textChannel = message.channel;
            const contentOfMessage = this.messageResponder.getContentOfMessage(message);
            if (!contentOfMessage) {
                this.messageResponder.sendMultipleLineResponseToChannel(textChannel, "Need to give a YouTube-url or YouTube search string to play a song. \n Ex.: '!play linkin park numb' or '!play https://youtu.be/kXYiU_JCYtU'");
                return;
            }
            const serviceResult = yield this.musicService.playSong(message);
            if (serviceResult) {
                this.messageResponder.sendResponseToChannel(textChannel, serviceResult.message);
            }
        });
    }
    playRadio(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const textChannel = message.channel;
            const contentOfMessage = this.messageResponder.getContentOfMessage(message);
            if (!contentOfMessage) {
                this.messageResponder.sendMultipleLineResponseToChannel(textChannel, this.musicService.getPossibleRadioStationsAsString("Need to give a radio station! (ex. !playradio stubru)\n Possible options: \n"));
                return;
            }
            const serviceResult = yield this.musicService.playRadio(message);
            if (serviceResult) {
                this.messageResponder.sendResponseToChannel(textChannel, serviceResult.message);
            }
        });
    }
    playRene(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const textChannel = message.channel;
            const serviceResult = yield this.musicService.playRene(message);
            if (serviceResult) {
                this.messageResponder.sendResponseToChannel(textChannel, serviceResult.message);
            }
        });
    }
    respondQueue(message) {
        const guildId = message.guild.id;
        const serverQueue = this.queueService.getServerQueue(guildId);
        const textChannel = message.channel;
        if (!serverQueue) {
            this.messageResponder.sendResponseToChannel(textChannel, "There is currently no queue! Start adding song with !play or play radio with !radio");
            return;
        }
        if (serverQueue.type === QueueContruct_1.QueueType.Song) {
            let text = "--- Music queue ---\n\n";
            serverQueue.songs.forEach((song, index) => {
                if (index === 0) {
                    text = text.concat("Now playing: " + song.title + " | Requested by: " + song.requester.username + "\n\n");
                }
                else {
                    text = text.concat(index + ". " + song.title + " | Requested by: " + song.requester.username + "\n");
                }
            });
            this.messageResponder.sendMultipleLineResponseToChannel(serverQueue.textChannel, text);
        }
        else if (serverQueue.type === QueueContruct_1.QueueType.Radio) {
            const currentRadioStation = serverQueue.songs[0];
            this.messageResponder.sendResponseToChannel(textChannel, "Current radio station playing: " + currentRadioStation.title);
            return;
        }
    }
    skip(message) {
        const serverQueue = this.queueService.getServerQueue(message.guild.id);
        if (serverQueue && serverQueue.type === QueueContruct_1.QueueType.Radio) {
            this.messageResponder.sendResponseToChannel(serverQueue.textChannel, "Can't use skip command while radio is playing!");
            return;
        }
        else if (!serverQueue) {
            this.messageResponder.sendResponseToChannel(serverQueue.textChannel, "There are no songs to skip!");
        }
        else {
            serverQueue.getConnection().dispatcher.end();
        }
    }
    stop(guildId) {
        //const guildId = message.guild.id;
        const serverQueue = this.queueService.getServerQueue(guildId);
        if (!serverQueue) {
            this.messageResponder.sendResponseToChannel(serverQueue.textChannel, "There is nothing to stop!");
            return;
        }
        serverQueue.getConnection().dispatcher.end();
        serverQueue.voiceChannel.leave();
        this.queueService.removeServerQueue(guildId);
    }
};
MusicBot = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.inject(types_1.TYPES.MessageResponder)),
    __param(1, inversify_1.inject(types_1.TYPES.QueueService)),
    __param(2, inversify_1.inject(types_1.TYPES.MusicService)),
    __metadata("design:paramtypes", [message_responder_1.MessageResponder,
        queueService_1.QueueService,
        musicService_1.MusicService])
], MusicBot);
exports.MusicBot = MusicBot;
//# sourceMappingURL=music_bot.js.map