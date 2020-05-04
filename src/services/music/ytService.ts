import { injectable } from "inversify";
import { iYtsr } from "../../interfaces/iYtsr";
import { iVideoInfo } from "../../interfaces/iVideoInfo";
//import * as ytsr from 'ytsr';
//import * as ytdl from 'ytdl-core-discord';

import { Readable } from "stream";
import { Music } from "../../models/music/music";
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
        try{
            const result = await ytdl.getBasicInfo(url);
            return result;
        } catch(err){
            console.log("Error in ytService/getInfoStreamYoutube(): " + err);
            return;
        }        
    }

    async getStreamYoutube(music: Music): Promise<Readable> {
        return await ytdl(music.url);
    }
}