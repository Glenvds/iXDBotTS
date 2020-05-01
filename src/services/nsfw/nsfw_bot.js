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
const nsfwLink_1 = require("../../models/nsfw/nsfwLink");
const urlService_1 = require("../general/urlService");
let NSFWBot = class NSFWBot {
    constructor(MessageResponder, urlService) {
        this.MessageResponder = MessageResponder;
        this.urlService = urlService;
        this.NSFW_BASEURLS = [
            new nsfwLink_1.NSFWLink({ type: nsfwLink_1.NSFWLinkType.Boobs, link: "http://media.oboobs.ru/boobs/", maxCount: 14678, needsPadding: 5 }),
            new nsfwLink_1.NSFWLink({ type: nsfwLink_1.NSFWLinkType.Ass, link: "http://media.oboobs.ru/boobs/", maxCount: 7417, needsPadding: 5 }),
            new nsfwLink_1.NSFWLink({ type: nsfwLink_1.NSFWLinkType.Hentai, link: "https://s9v7j7a4.ssl.hwcdn.net/galleries/full/02/8b/a4/028ba4c4d9b039efffa26a6daec2ca06/", maxCount: 19 }),
            new nsfwLink_1.NSFWLink({ type: nsfwLink_1.NSFWLinkType.Hentai, link: "https://s9v7j7a4.ssl.hwcdn.net/galleries/full/ee/1f/93/ee1f93b2562d56ac3a681ce4b3abb7b2/", maxCount: 19 }),
            new nsfwLink_1.NSFWLink({ type: nsfwLink_1.NSFWLinkType.Hentai, link: "https://s9v7j7a4.ssl.hwcdn.net/galleries/full/f4/f2/ff/f4f2ff1ace17d02bfaab856948a6c7aa/", maxCount: 19 }),
        ];
    }
    executeNSFWCommand(command, message) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (command.textCommand) {
                case "penis":
                    this.MessageResponder.sendResponseToChannel(message.channel, "Jordy is gay.");
                    break;
                default:
                    const randomUrl = yield this.getRandomUrlOfType(command.textCommand);
                    this.MessageResponder.sendURLToChannel(message.channel, randomUrl);
            }
        });
    }
    getRandomUrlOfType(type) {
        return __awaiter(this, void 0, void 0, function* () {
            const typeList = this.NSFW_BASEURLS.filter(x => x.type === type);
            const nsfwLink = typeList[Math.floor(Math.random() * typeList.length)];
            let NSFWUrl = nsfwLink.link + this.generateNumber(nsfwLink) + nsfwLink.extension;
            if (yield this.urlService.testUrl(NSFWUrl)) {
                return NSFWUrl;
            }
            else {
                do {
                    NSFWUrl = nsfwLink.link + this.generateNumber(nsfwLink) + nsfwLink.extension;
                } while (!(yield this.urlService.testUrl(NSFWUrl)));
                return NSFWUrl;
            }
        });
    }
    generateNumber(nsfwLink) {
        const num = Math.floor(Math.random() * nsfwLink.maxCount) + 1;
        return nsfwLink.needsPadding ? num.toString().padStart(nsfwLink.needsPadding, "0") : num.toString();
    }
};
NSFWBot = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.inject(types_1.TYPES.MessageResponder)), __param(1, inversify_1.inject(types_1.TYPES.urlService)),
    __metadata("design:paramtypes", [message_responder_1.MessageResponder, urlService_1.urlService])
], NSFWBot);
exports.NSFWBot = NSFWBot;
//# sourceMappingURL=nsfw_bot.js.map