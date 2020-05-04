import { User } from "discord.js";
import { injectable, inject } from "inversify";
import { TYPES } from "../../types";
import { ytService } from "./ytService";
import { urlService } from "../general/urlService";
import { iYtsr } from "../../interfaces/iYtsr";
import { Music, MusicTypes } from "../../models/music/music";

@injectable()
export class SongService {
    constructor(
        @inject(TYPES.ytService) private ytService: ytService,
        @inject(TYPES.urlService) private urlService: urlService) {
    }

    async getSong(searchInput: string, requester: User): Promise<Music> {
        try {
            const requestURL = await this.getSongUrl(searchInput);
            try {
                const songInfo = await this.ytService.getInfoStreamYoutube(requestURL);
                return new Music({title: songInfo.title, url: songInfo.video_url, requester: requester, type: MusicTypes.Song});
            } catch (err) {
                console.log("Error in getSong() while getting songurl information from yt: " + err)
                return;
            }
        } catch (err) {
            console.log("Error in getSong() while getting song url: " + err);
        }
    }

    private async getSongUrl(contentOfMessage: string): Promise<string> {
        try {
            if (!this.urlService.isUrl(contentOfMessage)) {
                const result: iYtsr = await this.ytService.searchYoutube(contentOfMessage);
                return result.items[0].link;
            } else {
                return contentOfMessage;
            }
        } catch (err) { console.log("Error in getting song URL: " + err); }
    }
}