import { injectable } from "inversify";
import { iYtsr } from "../../interfaces/iYtsr";
import { iVideoInfo } from "../../interfaces/iVideoInfo";
//import * as ytsr from 'ytsr';
//import * as ytdl from 'ytdl-core-discord';
import { Song } from "../../models/music/song";
import { Readable } from "stream";
const ytsr = require('ytsr');
const ytdl = require('ytdl-core-discord');
//import { ytdl } from "ytdl-core-discord";


@injectable()
export class ytService {
    constructor() { }

    async searchYoutube(searchString: string): Promise<iYtsr> {
        const options = { limit: 1 };
        const result = await ytsr(searchString, options);
        return result;
    }

    async getInfoStreamYoutube(url: string): Promise<iVideoInfo> {
        const result = await ytdl.getInfo(url);
        return result;

    }

    async getStreamYoutube(song: Song): Promise<Readable> {
        return await ytdl(song.url);
    }
}