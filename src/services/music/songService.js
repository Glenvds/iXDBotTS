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
const ytService_1 = require("./ytService");
const urlService_1 = require("../general/urlService");
const music_1 = require("../../models/music/music");
let SongService = class SongService {
    constructor(ytService, urlService) {
        this.ytService = ytService;
        this.urlService = urlService;
    }
    getSong(searchInput, requester) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requestURL = yield this.getSongUrl(searchInput);
                try {
                    const songInfo = yield this.ytService.getInfoStreamYoutube(requestURL);
                    return new music_1.Music({ title: songInfo.title, url: songInfo.video_url, requester: requester, type: music_1.MusicTypes.Song });
                }
                catch (err) {
                    console.log("Error in getSong() while getting songurl information from yt: " + err);
                    return;
                }
            }
            catch (err) {
                console.log("Error in getSong() while getting song url: " + err);
                return;
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
};
SongService = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.inject(types_1.TYPES.ytService)),
    __param(1, inversify_1.inject(types_1.TYPES.urlService)),
    __metadata("design:paramtypes", [ytService_1.ytService,
        urlService_1.urlService])
], SongService);
exports.SongService = SongService;
//# sourceMappingURL=songService.js.map