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
const radioStation_1 = require("../../models/music/radioStation");
let RadioStationService = class RadioStationService {
    constructor() {
        this.RADIO_STATIONS = [
            new radioStation_1.RadioStation({ name: "stubru", url: "http://icecast.vrtcdn.be/stubru-high.mp3" }),
            new radioStation_1.RadioStation({ name: "mnm", url: "http://icecast.vrtcdn.be/mnm-high.mp3" }),
            new radioStation_1.RadioStation({ name: "radio1", url: "http://icecast.vrtcdn.be/stubru-high.mp3" })
        ];
    }
    getPossibleRadioStationsAsString(startMessage) {
        let returnString = startMessage;
        this.RADIO_STATIONS.forEach((station) => {
            returnString = returnString.concat("- " + station.name + "\n");
        });
        return returnString;
    }
    getRadioStationFromInput(input) {
        for (let station of this.RADIO_STATIONS) {
            if (station.name === input) {
                return station;
            }
        }
    }
};
RadioStationService = __decorate([
    inversify_1.injectable(),
    __metadata("design:paramtypes", [])
], RadioStationService);
exports.RadioStationService = RadioStationService;
//# sourceMappingURL=radioStationService.js.map