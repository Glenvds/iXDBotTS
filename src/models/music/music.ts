import { User } from "discord.js";


export enum MusicTypes{
    Radio = "radio",
    Song = "song"
}

export class MusicOptions{
    title: string;
    type: MusicTypes;
    url: string;
    requester?: User;
}

export class Music extends MusicOptions{
    constructor(options: MusicOptions){
        super();
        Object.assign(this, options);
    }
}

