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
const message_responder_1 = require("../general/message-responder");
const urlService_1 = require("../general/urlService");
const fs_1 = require("fs");
const queueService_1 = require("../music/queueService");
let ReneBot = class ReneBot {
    constructor(messageResponder, urlService, queueService) {
        this.messageResponder = messageResponder;
        this.urlService = urlService;
        this.queueService = queueService;
        this.generateFileList();
    }
    generateFileList() {
        var fileDirectory = process.cwd() + "\\src\\assets\\rene";
        this.files = fs_1.readdirSync(fileDirectory);
    }
    executeNSFWCommand(command, message) {
        return __awaiter(this, void 0, void 0, function* () {
            var channel = message.member.voice.channel;
            if (!channel)
                return; // No voice channel, too lazy for text quotes
            const guildId = message.guild.id;
            const serverQueue = this.queueService.getServerQueue(guildId);
            if (serverQueue)
                return; // Song playing
            const msgTextChannel = message.channel;
            const input = this.messageResponder.getContentOfMessage(message);
            const randomSound = yield this.getSound(input);
            var connection = yield channel.join();
            var streamDispatcher = connection.play(randomSound);
            streamDispatcher.on("error", function (err) {
                this.messageResponder.sendResponseToChannel(msgTextChannel, err.message);
                streamDispatcher.end(err);
            });
            streamDispatcher.on("end", () => {
                channel.leave();
            });
        });
    }
    getSound(filter = null) {
        var filteredFiles = filter ? this.files.filter(x => x.indexOf(filter) > 0) : this.files;
        var randomFile = filteredFiles[Math.floor(Math.random() * filteredFiles.length)];
        return fs_1.createReadStream(randomFile);
    }
};
ReneBot = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.inject(types_1.TYPES.MessageResponder)),
    __param(1, inversify_1.inject(types_1.TYPES.urlService)),
    __param(2, inversify_1.inject(types_1.TYPES.QueueService)),
    __metadata("design:paramtypes", [message_responder_1.MessageResponder,
        urlService_1.urlService,
        queueService_1.QueueService])
], ReneBot);
exports.ReneBot = ReneBot;
//# sourceMappingURL=rene_bot.js.map