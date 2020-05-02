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
const radioStationService_1 = require("./radioStationService");
let MusicBot = class MusicBot {
    constructor(urlService, ytService, messageResponder, radioStationService) {
        this.urlService = urlService;
        this.ytService = ytService;
        this.messageResponder = messageResponder;
        this.radioStationService = radioStationService;
        this.queue = new Map();
        this.radioQueue = new Map();
        this.isMusicPlaying = false;
        this.isRadioPlaying = false;
    }
    executeMusicCommand(command, message) {
        switch (command.textCommand) {
            case "play":
                this.playQueue(message);
                break;
            case "skip":
                this.skip(message);
                break;
            case "next":
                this.skip(message);
                break;
            case "stop":
                this.stop(message);
                break;
            case "queue":
                this.getQueue(message);
                break;
            case "radio":
                this.startRadio(message);
                break;
        }
    }
    //PRIVATE METHODS
    //MANAGING QUEUES
    playQueue(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const serverQueue = this.queue.get(message.guild.id);
            const voiceChannel = message.member.voice.channel;
            const textChannel = message.channel;
            const contentOfMessage = this.getContentOutOfMessage(message);
            let song;
            if (!contentOfMessage) {
                this.messageResponder.sendMultipleLineResponseToChannel(textChannel, "Need to give a YouTube-url or YouTube search string to play a song. \n Ex.: '!play linkin park numb' or '!play https://youtu.be/kXYiU_JCYtU'");
                return;
            }
            try {
                song = yield this.getSong(contentOfMessage, message.author);
            }
            catch (err) {
                this.messageResponder.sendResponseToChannel(textChannel, "No video found with that search string");
                console.log("Error in playQueue getSong(): " + err);
                return;
            }
            if (!serverQueue) {
                try {
                    const queueContruct = yield QueueContruct_1.QueueContruct.create({ guildId: message.guild.id, textChannel: textChannel, voiceChannel: voiceChannel, firstPlay: song });
                    this.addNewServerQueueToMainQueue(queueContruct);
                    this.play(message.guild, queueContruct.songs[0]);
                }
                catch (err) {
                    console.log("Error in playQueue while setting up queue: " + err);
                }
            }
            else {
                serverQueue.addSong(song);
                this.messageResponder.sendResponseToChannel(textChannel, `${song.title} has been added to the queue`); //ADD USERNAME TO RESPONSE
            }
        });
    }
    addNewServerQueueToMainQueue(serverQueue) {
        return __awaiter(this, void 0, void 0, function* () {
            this.queue.set(serverQueue.guildId, serverQueue);
        });
    }
    getQueue(message) {
        const serverQueue = this.queue.get(message.guild.id);
        const textChannel = message.channel;
        if (!serverQueue) {
            this.messageResponder.sendResponseToChannel(textChannel, "There is currently no queue! Start adding song with !play");
            return;
        }
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
            if (!song) {
                this.messageResponder.sendResponseToChannel(serverQueue.textChannel, "Ran out of songs, I'm leaving. Soai..");
                this.isMusicPlaying = false;
                serverQueue.voiceChannel.leave();
                this.removeGuildQueue(guild);
                return;
            }
            this.messageResponder.sendResponseToChannel(serverQueue.textChannel, `Started playing: ${song.title}. Request by ${song.requester.username}`);
            this.isMusicPlaying = true;
            try {
                const ytStream = yield this.ytService.getStreamYoutube(song);
                const dispatcher = serverQueue.getConnection().play(ytStream, { type: "opus" })
                    .on("finish", () => {
                    console.log(song.title + " ended playing");
                    serverQueue.songs.shift();
                    this.play(guild, serverQueue.songs[0]);
                });
                dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
            }
            catch (err) {
                console.log("Error in play: " + err);
            }
        });
    }
    skip(message) {
        const serverQueue = this.queue.get(message.guild.id);
        const textChannel = message.channel;
        if (!serverQueue) {
            this.messageResponder.sendResponseToChannel(textChannel, "There are no songs to skip!");
        }
        else {
            serverQueue.getConnection().dispatcher.end();
        }
    }
    stop(message) {
        const serverQueue = this.queue.get(message.guild.id);
        const textChannel = message.channel;
        if (!serverQueue) {
            this.messageResponder.sendResponseToChannel(textChannel, "There is nothing to stop!");
            return;
        }
        if (this.isMusicPlaying) {
            this.isMusicPlaying = false;
            serverQueue.emptySongs();
            serverQueue.getConnection().dispatcher.end();
        }
        else if (this.isRadioPlaying) {
            this.isRadioPlaying = false;
            serverQueue.emptySongs();
            serverQueue.getConnection().dispatcher.end();
        }
    }
    getContentOutOfMessage(message) {
        if (message.content.indexOf(' ') !== -1) {
            return message.content.substring(message.content.indexOf(' ') + 1).toLocaleLowerCase();
        }
        else {
            return;
        }
    }
    //RADIO
    startRadio(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const content = this.getContentOutOfMessage(message);
            const voiceChannel = message.member.voice.channel;
            const textChannel = message.channel;
            const guildId = message.guild.id;
            const requestedStation = this.radioStationService.getRadioStationFromInput(content);
            if (!content) {
                if (this.isRadioPlaying) {
                    const currentRadioStation = this.queue.get(guildId);
                    this.messageResponder.sendMultipleLineResponseToChannel(textChannel, this.radioStationService.getPossibleRadioStationsAsString("Currently playing radio station: " + currentRadioStation.name + ". \n"));
                }
                else {
                    this.messageResponder.sendMultipleLineResponseToChannel(textChannel, this.radioStationService.getPossibleRadioStationsAsString("Need to give a radio station! (ex. !playradio stubru)\n Possible options: \n"));
                }
            }
            else {
                if (this.isMusicPlaying) {
                    this.messageResponder.sendResponseToChannel(textChannel, "Music is already playing. First stop playing music(!stop).");
                }
                else if (this.isRadioPlaying) {
                    this.playRadio(guildId, requestedStation);
                }
                else {
                    const newQueue = yield QueueContruct_1.QueueContruct.create({ guildId: guildId, textChannel: textChannel, voiceChannel: voiceChannel, firstPlay: requestedStation });
                    this.queue.set(guildId, newQueue);
                    this.playRadio(guildId, requestedStation);
                }
            }
        });
    }
    playRadio(guildId, radioStation) {
        return __awaiter(this, void 0, void 0, function* () {
            this.isRadioPlaying = true;
            const serverQueue = this.queue.get(guildId);
            const dispatcher = serverQueue.getConnection().play(radioStation.url)
                .on("start", () => {
                this.messageResponder.sendResponseToChannel(serverQueue.textChannel, "Started playing radio station: " + radioStation.name);
            });
        });
    }
};
MusicBot = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.inject(types_1.TYPES.urlService)),
    __param(1, inversify_1.inject(types_1.TYPES.ytService)),
    __param(2, inversify_1.inject(types_1.TYPES.MessageResponder)),
    __param(3, inversify_1.inject(types_1.TYPES.RadioStationService)),
    __metadata("design:paramtypes", [urlService_1.urlService,
        ytService_1.ytService,
        message_responder_1.MessageResponder,
        radioStationService_1.RadioStationService])
], MusicBot);
exports.MusicBot = MusicBot;
/*
EMPTY PLAY?
ADD RADIO OPTIONS


*/ 
//# sourceMappingURL=music_bot.js.map