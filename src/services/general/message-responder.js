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
Object.defineProperty(exports, "__esModule", { value: true });
const inversify_1 = require("inversify");
let MessageResponder = class MessageResponder {
    constructor() {
    }
    sendResponseToChannel(channel, text) {
        return channel.send("`" + text + "`");
    }
    sendURLToChannel(channel, url) {
        return channel.send(url);
    }
    sendMultipleLineResponseToChannel(channel, text) {
        return channel.send("```" + text + "```");
    }
    sendEmbededResponseToChannel(channel, message) {
        //return message.textChannel.send({embed: message});
        return channel.send(message);
    }
    getContentOfMessage(message) {
        if (message.content.indexOf(' ') !== -1) {
            return message.content.substring(message.content.indexOf(' ') + 1).toLocaleLowerCase();
        }
        else {
            return;
        }
    }
};
MessageResponder = __decorate([
    inversify_1.injectable(),
    __metadata("design:paramtypes", [])
], MessageResponder);
exports.MessageResponder = MessageResponder;
//# sourceMappingURL=message-responder.js.map