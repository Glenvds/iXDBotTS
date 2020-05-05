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
const command_1 = require("../../models/general/command");
const inversify_1 = require("inversify");
let cmdService = class cmdService {
    constructor() {
        this.Commands = [
            new command_1.Command(command_1.CommandType.NSFW, "boobs"),
            new command_1.Command(command_1.CommandType.NSFW, "ass"),
            new command_1.Command(command_1.CommandType.NSFW, "hentai"),
            new command_1.Command(command_1.CommandType.NSFW, "penis"),
            new command_1.Command(command_1.CommandType.Music, "play"),
            new command_1.Command(command_1.CommandType.Music, "skip"),
            new command_1.Command(command_1.CommandType.Music, "next"),
            new command_1.Command(command_1.CommandType.Music, "stop"),
            new command_1.Command(command_1.CommandType.Music, "queue"),
            new command_1.Command(command_1.CommandType.Music, "radio"),
            new command_1.Command(command_1.CommandType.General, "minecraft"),
            new command_1.Command(command_1.CommandType.General, "mc")
        ];
    }
    getCommand(input) {
        for (let cmd of this.Commands) {
            if (cmd.textCommand === input) {
                return cmd;
            }
        }
    }
};
cmdService = __decorate([
    inversify_1.injectable(),
    __metadata("design:paramtypes", [])
], cmdService);
exports.cmdService = cmdService;
//# sourceMappingURL=cmdService.js.map