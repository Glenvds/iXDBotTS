import { Command, CommandType } from "../../models/general/command";
import { injectable } from "inversify";

@injectable()
export class cmdService {

    private Commands = [
        new Command(CommandType.NSFW, "boobs"),
        new Command(CommandType.NSFW, "ass"),
        new Command(CommandType.NSFW, "hentai"),
        new Command(CommandType.NSFW, "penis"),
        new Command(CommandType.Music, "play"),
        new Command(CommandType.Music, "skip"),
        new Command(CommandType.Music, "next"),
        new Command(CommandType.Music, "stop"),
        new Command(CommandType.Music, "queue"),
        new Command(CommandType.Music, "radio"),
        new Command(CommandType.General, "minecraft"),
        new Command(CommandType.General, "mc"),
        new Command(CommandType.Music, "rene")
        //new Command(CommandType.General, "help")
    ]

    constructor() {
    }

    public getCommand(input: string): Command {
        for (let cmd of this.Commands) {
            if (cmd.textCommand === input) {
                return cmd;
            }
        }
    }

}