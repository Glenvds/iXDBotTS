import { injectable } from "inversify";

export enum CommandType{
    NSFW,
    Music
}

@injectable()
export class Command {
    constructor(public type: CommandType, public textCommand: string) {
    }
}

