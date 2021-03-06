"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Music = exports.MusicOptions = exports.MusicTypes = void 0;
var MusicTypes;
(function (MusicTypes) {
    MusicTypes["Radio"] = "radio";
    MusicTypes["Song"] = "song";
    MusicTypes["SoundBoard"] = "soundboard";
})(MusicTypes = exports.MusicTypes || (exports.MusicTypes = {}));
class MusicOptions {
}
exports.MusicOptions = MusicOptions;
class Music extends MusicOptions {
    constructor(options) {
        super();
        Object.assign(this, options);
    }
}
exports.Music = Music;
//# sourceMappingURL=music.js.map