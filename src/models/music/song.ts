import { injectable } from "inversify";
import { User } from "discord.js";

@injectable()
export class Song {
    constructor(public title: string, public url: string, public requester: User) {
    }
}