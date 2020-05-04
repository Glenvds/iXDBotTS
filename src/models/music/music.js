"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MusicTypes;
(function (MusicTypes) {
    MusicTypes["Radio"] = "radio";
    MusicTypes["Song"] = "song";
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