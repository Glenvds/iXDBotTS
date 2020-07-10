"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const inversify_1 = require("inversify");
const fetch = require('node-fetch');
let musicAPI = class musicAPI {
    //GROTER: 1 OBJECT MET OOK NSFW LINKS TOEVOEGEN. NIE VIE AFZONDERLIJKE CALLS
    sendMusicData(songs) {
        fetch("http://localhost:8080/", {
            method: 'POST', body: JSON.stringify(songs), headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(res => console.log(res));
    }
};
musicAPI = __decorate([
    inversify_1.injectable()
], musicAPI);
exports.musicAPI = musicAPI;
//# sourceMappingURL=musicAPI.js.map