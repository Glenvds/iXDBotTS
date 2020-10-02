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
exports.LoggerService = void 0;
const fs_1 = require("fs");
const inversify_1 = require("inversify");
const tslog_1 = require("tslog");
let LoggerService = class LoggerService {
    constructor() {
        this.logger = new tslog_1.Logger({ name: "ixdbotTSLogger", type: "pretty" });
        this.logger.attachTransport({
            silly: this.logFileToTransport,
            debug: this.logFileToTransport,
            trace: this.logFileToTransport,
            info: this.logFileToTransport,
            warn: this.logFileToTransport,
            error: this.logFileToTransport,
            fatal: this.logFileToTransport,
        }, "debug");
    }
    logFileToTransport(logObj) {
        fs_1.appendFileSync("ixdbotTSlogfile.log", JSON.stringify(logObj) + "\n");
    }
};
LoggerService = __decorate([
    inversify_1.injectable(),
    __metadata("design:paramtypes", [])
], LoggerService);
exports.LoggerService = LoggerService;
//# sourceMappingURL=loggerService.js.map