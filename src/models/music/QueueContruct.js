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
const discord_js_1 = require("discord.js");
const song_1 = require("./song");
let QueueContruct = class QueueContruct {
    constructor(guild, textChannel, voiceChannel, firstSong) {
        this.guild = guild;
        this.textChannel = textChannel;
        this.voiceChannel = voiceChannel;
        this.songs = new Array();
        this.setUpVoiceConnection(voiceChannel);
        this.addSong(firstSong);
        this.volume = 5;
    }
    addSong(song) {
        this.songs.push(song);
    }
    emptySongs() {
        this.songs = [];
    }
    setVolume(volume) {
        this.volume = volume;
    }
    setUpVoiceConnection(voiceChannel) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.connection = yield voiceChannel.join();
            }
            catch (err) {
                console.log("Error while setting up voice connection: " + err);
            }
        });
    }
};
QueueContruct = __decorate([
    inversify_1.injectable(),
    __metadata("design:paramtypes", [discord_js_1.Guild, discord_js_1.TextChannel, discord_js_1.VoiceChannel, song_1.Song])
], QueueContruct);
exports.QueueContruct = QueueContruct;
//# sourceMappingURL=QueueContruct.js.map