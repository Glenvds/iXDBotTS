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
exports.MusicService = void 0;
const inversify_1 = require("inversify");
const types_1 = require("../../types");
const message_responder_1 = require("../general/message-responder");
const songService_1 = require("./songService");
const queueService_1 = require("./queueService");
const QueueContruct_1 = require("../../models/music/QueueContruct");
const serviceResult_1 = require("../../models/general/serviceResult");
const music_1 = require("../../models/music/music");
const ytService_1 = require("./ytService");
const fs_1 = require("fs");
const musicAPI_1 = require("../api/musicAPI");
let MusicService = class MusicService {
    //private musicDecibels = 0.001;
    constructor(messageResponder, songService, queueService, ytService, musicAPI) {
        this.messageResponder = messageResponder;
        this.songService = songService;
        this.queueService = queueService;
        this.ytService = ytService;
        this.musicAPI = musicAPI;
        this.RADIO_STATIONS = [
            new music_1.Music({ title: "stubru", url: "http://icecast.vrtcdn.be/stubru-high.mp3", type: music_1.MusicTypes.Radio }),
            new music_1.Music({ title: "mnm", url: "http://icecast.vrtcdn.be/mnm-high.mp3", type: music_1.MusicTypes.Radio }),
            new music_1.Music({ title: "radio1", url: "http://icecast.vrtcdn.be/stubru-high.mp3", type: music_1.MusicTypes.Radio }),
            new music_1.Music({ title: "topradio", url: "http://loadbalancing.topradio.be/topradio.mp3", type: music_1.MusicTypes.Radio })
        ];
        this.generateFileList();
    }
    playSong(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const guildId = message.guild.id;
            const serverQueue = this.queueService.getServerQueue(guildId);
            const song = yield this.getSongFromMessage(message);
            if (!song) {
                return new serviceResult_1.ServiceResult(false, "No songs found with that search query");
            }
            if (serverQueue) {
                if (this.isRadioPlayingOnGuild(guildId)) {
                    return new serviceResult_1.ServiceResult(false, "Can't queue songs while radio is playing! Use !stop to stop the radio.");
                }
                else {
                    serverQueue.addToQueue(song);
                    this.updateMusicData(serverQueue);
                    return new serviceResult_1.ServiceResult(true, `${song.title} has beed added to the queue.`);
                }
            }
            else if (!serverQueue) {
                yield this.queueService.createMusicServerQueue(message, song);
                yield this.playSongsInChannel(guildId, song);
            }
        });
    }
    playRadio(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const radio = this.getRadioStationFromInput(message);
            if (!radio) {
                return new serviceResult_1.ServiceResult(false, this.getPossibleRadioStationsAsString("Don't know this radio station. \n"));
            }
            ;
            const guildId = message.guild.id;
            const serverQueue = this.queueService.getServerQueue(guildId);
            if (serverQueue) {
                if (this.isSongPlayingOnGuild(guildId)) {
                    return new serviceResult_1.ServiceResult(false, "Music is already playing. First stop playing music(!stop).");
                }
                ;
                this.playRadioInChannel(guildId, radio);
            }
            else {
                yield this.queueService.createRadioServerQueue(message, radio);
                this.playRadioInChannel(guildId, radio);
            }
        });
    }
    playRene(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const randomSound = this.getReneFromMessage(message);
            const guildId = message.guild.id;
            const serverQueue = this.queueService.getServerQueue(guildId);
            this.updateMusicData(serverQueue);
            if (serverQueue) {
                if (this.isRadioPlayingOnGuild(guildId)) {
                    return new serviceResult_1.ServiceResult(false, "Can't queue songs while radio is playing! Use !stop to stop the radio.");
                }
                else {
                    serverQueue.addToQueue(randomSound);
                    //return new ServiceResult(true, `${randomSound.title} has beed added to the queue.`);
                }
            }
            else if (!serverQueue) {
                yield this.queueService.createMusicServerQueue(message, randomSound);
                yield this.playSongsInChannel(guildId, randomSound);
            }
        });
    }
    getReneFromMessage(message) {
        const filter = this.messageResponder.getContentOfMessage(message);
        var filteredFiles = filter ? this.reneFiles.filter(x => x.indexOf(filter) > 0) : this.reneFiles;
        if (!filteredFiles.length)
            return;
        var randomFile = `${this.directory}/${filteredFiles[Math.floor(Math.random() * filteredFiles.length)]}`;
        const title = "Rene:" + randomFile.substring(randomFile.indexOf("rene/") + 5);
        console.log(`Playing ${randomFile}`);
        return new music_1.Music({ title: title, type: music_1.MusicTypes.SoundBoard, url: randomFile, requester: message.author });
    }
    playSongsInChannel(guildId, music) {
        return __awaiter(this, void 0, void 0, function* () {
            const serverQueue = this.queueService.getServerQueue(guildId);
            if (!serverQueue) {
                return;
            }
            if (!music) {
                //this.messageResponder.sendResponseToChannel(serverQueue.textChannel, "Ran out of songs, I'm leaving.");
                //serverQueue.voiceChannel.leave();
                this.updateMusicData(serverQueue);
                this.queueService.removeServerQueue(guildId);
                return;
            }
            if (music.type === music_1.MusicTypes.Song) {
                this.updateMusicData(serverQueue);
                this.messageResponder.sendResponseToChannel(serverQueue.textChannel, `Started playing: ${music.title}. Requested by ${music.requester.username}`);
                const ytStream = yield this.ytService.getStreamYoutube(music);
                const dispatcher = serverQueue.getConnection().play(ytStream, { type: "opus" })
                    .on("finish", () => {
                    console.log(music.title + " ended playing.");
                    serverQueue.songs.shift();
                    this.playSongsInChannel(guildId, serverQueue.songs[0]);
                });
                //dispatcher.setVolumeLogarithmic(serverQueue.volume / 5); /// DIT TESTEN!!!!
                dispatcher.setVolumeDecibels(0.5);
            }
            else if (music.type === music_1.MusicTypes.Radio) {
                const dispatcher = serverQueue.getConnection().play(music.url);
                dispatcher.setVolumeLogarithmic(serverQueue.volume / 5); /// DIT TESTEN!!!!
            }
            else if (music.type === music_1.MusicTypes.SoundBoard) {
                const dispatcher = serverQueue.getConnection().play(music.url)
                    .on("finish", () => {
                    //console.log(music.title + " ended playing.");
                    serverQueue.songs.shift();
                    this.playSongsInChannel(guildId, serverQueue.songs[0]);
                });
                dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
            }
        });
    }
    playRadioInChannel(guildId, music) {
        return __awaiter(this, void 0, void 0, function* () {
            const serverQueue = this.queueService.getServerQueue(guildId);
            this.updateMusicData(serverQueue);
            const dispatcher = serverQueue.getConnection().play(music.url);
            dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
        });
    }
    getPossibleRadioStationsAsString(startMessage) {
        let returnString = startMessage;
        this.RADIO_STATIONS.forEach((station) => {
            returnString = returnString.concat("- " + station.title + "\n");
        });
        return returnString;
    }
    getRadioStationFromInput(message) {
        const input = this.messageResponder.getContentOfMessage(message);
        for (let station of this.RADIO_STATIONS) {
            if (station.title === input) {
                return station;
            }
        }
    }
    getSongFromMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const contentOfMessage = this.messageResponder.getContentOfMessage(message);
            return yield this.songService.getSong(contentOfMessage, message.author);
        });
    }
    isSongPlayingOnGuild(guildId) {
        return this.queueService.getServerQueue(guildId).type === QueueContruct_1.QueueType.Song;
    }
    isRadioPlayingOnGuild(guildId) {
        return this.queueService.getServerQueue(guildId).type === QueueContruct_1.QueueType.Radio;
    }
    get directory() {
        return `${process.cwd()}/src/assets/rene`;
    }
    generateFileList() {
        this.reneFiles = fs_1.readdirSync(this.directory);
        // console.log("Loaded files for rene", this.files);
    }
    updateMusicData(queue) {
        this.musicAPI.sendMusicData(queue.songs);
    }
};
MusicService = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.inject(types_1.TYPES.MessageResponder)),
    __param(1, inversify_1.inject(types_1.TYPES.SongService)),
    __param(2, inversify_1.inject(types_1.TYPES.QueueService)),
    __param(3, inversify_1.inject(types_1.TYPES.ytService)),
    __param(4, inversify_1.inject(types_1.TYPES.musicAPI)),
    __metadata("design:paramtypes", [message_responder_1.MessageResponder,
        songService_1.SongService,
        queueService_1.QueueService,
        ytService_1.ytService,
        musicAPI_1.musicAPI])
], MusicService);
exports.MusicService = MusicService;
//# sourceMappingURL=musicService.js.map