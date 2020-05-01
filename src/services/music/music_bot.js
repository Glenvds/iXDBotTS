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
const inversify_1 = require("inversify");
const types_1 = require("../../types");
const QueueContruct_1 = require("../../models/music/QueueContruct");
const urlService_1 = require("../general/urlService");
const ytService_1 = require("./ytService");
const song_1 = require("../../models/music/song");
const message_responder_1 = require("../general/message-responder");
let MusicBot = class MusicBot {
    constructor(urlService, ytService, messageResponder) {
        this.urlService = urlService;
        this.ytService = ytService;
        this.messageResponder = messageResponder;
        this.queue = new Map();
    }
    executeMusicCommand(command, message) {
        const serverQueue = this.queue.get(message.guild.id);
        switch (command.textCommand) {
            case "play":
                this.playQueue(serverQueue, message);
                break;
            case "skip":
                this.skip(serverQueue);
                break;
            case "next":
                this.skip(serverQueue);
                break;
            case "stop":
                this.stop(serverQueue);
                break;
            case "queue":
                this.getQueue(serverQueue);
                break;
            //case "radio": this.playRadio(message); break;
        }
    }
    //PRIVATE METHODS
    //MANAGING QUEUES
    playQueue(serverQueue, message) {
        return __awaiter(this, void 0, void 0, function* () {
            const voiceChannel = message.member.voice.channel;
            const contentOfMessage = this.getContentOutOfMessage(message);
            const song = yield this.getSong(contentOfMessage, message.author);
            if (!serverQueue) {
                const queueContruct = new QueueContruct_1.QueueContruct(message.guild, message.channel, voiceChannel, song);
                this.addNewServerQueueToMainQueue(queueContruct);
                this.play(message.guild, queueContruct.songs[0]);
            }
            else {
                serverQueue.addSong(song);
                this.messageResponder.sendResponseToChannel(message.channel, `${song.title} has been added to the queue`); //ADD USERNAME TO RESPONSE
            }
        });
    }
    addNewServerQueueToMainQueue(serverQueue) {
        return __awaiter(this, void 0, void 0, function* () {
            this.queue.set(serverQueue.guild.id, serverQueue);
        });
    }
    getQueue(serverQueue) {
        let text = "```--- Music queue ---\n\n";
        serverQueue.songs.forEach((song, index) => {
            if (index === 0) {
                text = text.concat("Now playing: " + song.title + " | Requested by: " + song.requester.username + "\n\n");
            }
            else {
                text = text.concat(index + ". " + song.title + " | Requested by: " + song.requester + "\n");
            }
        });
        text = text.concat("```");
        this.messageResponder.sendMultipleLineResponseToChannel(serverQueue.textChannel, text);
    }
    removeGuildQueue(guild) {
        this.queue.delete(guild.id);
    }
    //MANAGING & PLAYING SONGS 
    getSong(contentOfmessage, author) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requestURL = yield this.getSongUrl(contentOfmessage);
                const songInfo = yield this.ytService.getInfoStreamYoutube(requestURL);
                return new song_1.Song(songInfo.title, songInfo.video_url, author);
            }
            catch (err) {
                console.log("Error in getSong(): " + err);
            }
        });
    }
    getSongUrl(contentOfMessage) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.urlService.isUrl(contentOfMessage)) {
                    const result = yield this.ytService.searchYoutube(contentOfMessage);
                    return result.items[0].link;
                }
                else {
                    return contentOfMessage;
                }
            }
            catch (err) {
                console.log("Error in getting song URL: " + err);
            }
        });
    }
    play(guild, song) {
        return __awaiter(this, void 0, void 0, function* () {
            const serverQueue = this.queue.get(guild.id);
            console.log(serverQueue);
            if (!song) {
                this.messageResponder.sendResponseToChannel(serverQueue.textChannel, "Ran out of songs, I'm leaving. Soai..");
                serverQueue.voiceChannel.leave();
                this.queue.delete(guild.id);
                return;
            }
            this.messageResponder.sendResponseToChannel(serverQueue.textChannel, `Started playing: [${song.title}](${song.url}). Request by ${song.requester}`);
            try {
                const ytStream = yield this.ytService.getStreamYoutube(song);
                const dispatcher = serverQueue.connection.play(ytStream, { type: "opus" });
                dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
            }
            catch (err) {
                console.log("Error in play: " + err);
            }
        });
    }
    skip(serverQueue) {
        if (!serverQueue) {
            this.messageResponder.sendResponseToChannel(serverQueue.textChannel, "There are no songs to skip!");
        }
        else {
            serverQueue.connection.dispatcher.end();
        }
    }
    stop(serverQueue) {
        this.messageResponder.sendResponseToChannel(serverQueue.textChannel, "Deleted my queue, I'm out.");
        serverQueue.emptySongs();
        serverQueue.connection.dispatcher.end();
    }
    getContentOutOfMessage(message) {
        return message.content.substring(message.content.indexOf(' ') + 1);
    }
};
MusicBot = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.inject(types_1.TYPES.urlService)),
    __param(1, inversify_1.inject(types_1.TYPES.ytService)),
    __param(2, inversify_1.inject(types_1.TYPES.MessageResponder)),
    __metadata("design:paramtypes", [urlService_1.urlService,
        ytService_1.ytService,
        message_responder_1.MessageResponder])
], MusicBot);
exports.MusicBot = MusicBot;
//# sourceMappingURL=music_bot.js.map