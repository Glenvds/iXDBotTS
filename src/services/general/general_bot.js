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
const discord_js_1 = require("discord.js");
const types_1 = require("../../types");
const message_responder_1 = require("./message-responder");
let GeneralBot = class GeneralBot {
    constructor(messageResponder) {
        this.messageResponder = messageResponder;
        this.MCSERVERLINK = "ixd-mc.glenvandesteen.be";
        this.MCDOWNLOADLINK = "http://mcdl.glenvandesteen.be";
        this.webHookClient = new discord_js_1.WebhookClient("723556075168596025", "Q29SYGuNA6qqDJNOhUuRHivsx_aqnnKQVgTxK2oV0MaiMkjkJWHJgGNW-gt6Gz71DZ6a");
        this.embedGeneral = new discord_js_1.MessageEmbed()
            .setTitle("General commands")
            .setColor("DARK_GREY")
            .addField("!mc", "Get the latest iXD Minecraft server information.                                                                     ", false);
        this.embedMusic = new discord_js_1.MessageEmbed()
            .setTitle("Music commands")
            .setDescription("Only usable in the music channel!")
            .setColor("RED")
            .addField("!play [link or YouTube search]", "Adds your input to the queue. If there is no playing track, it will start playing.", false)
            .addField("!radio [name of radiostation]", "Starts playing your choice of radiostation. Type !radio to get an overview of the possible radiostations.", false)
            .addField("!rene", "Starts playing a random Rene quote.", false)
            .addField("!rene [quote]", "Starts playing a specific Rene quote. Ex: !rene schloan", false)
            .addField("!queue", "Get an overview of the current queue", false)
            .addField("!skip", "Skips the current song. Next song in queue will start playing", false)
            .addField("!stop", "Stops the bot from playing music or radio. The queue will be cleared", false);
        this.embedNSFW = new discord_js_1.MessageEmbed()
            .setTitle("NSFW commands")
            .setDescription("Only usable in the NSFW channel!")
            .setColor("NOT_QUITE_BlACK")
            .addField("!boobs, !ass, !hentai, !penis", "-----------------------------------------------------------", false);
        this.embedsAA = [this.embedGeneral, this.embedMusic, this.embedNSFW];
    }
    executeGeneralCommand(command, message) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (command.textCommand) {
                case "mc":
                    this.sendMinecraftHelp(message);
                    break;
                case "minecraft":
                    this.sendMinecraftHelp(message);
                    break;
                case "help":
                    this.sendHelpResponse(message);
                    break;
            }
        });
    }
    sendMinecraftHelp(message) {
        const embededmsg = new discord_js_1.MessageEmbed()
            .setTitle("Minecraft information")
            .addFields({ name: "Minecraft client:", value: `[Download here](${this.MCDOWNLOADLINK})` }, { name: "iXD Minecraft server:", value: `${this.MCSERVERLINK}` });
        this.messageResponder.sendEmbededResponseToChannel(message.channel, embededmsg);
    }
    sendHelpResponse(message) {
        this.webHookClient.send("iXD Discord bot commands", {
            embeds: this.embedsAA
        });
    }
};
GeneralBot = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.inject(types_1.TYPES.MessageResponder)),
    __metadata("design:paramtypes", [message_responder_1.MessageResponder])
], GeneralBot);
exports.GeneralBot = GeneralBot;
//# sourceMappingURL=general_bot.js.map