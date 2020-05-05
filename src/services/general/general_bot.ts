import { injectable, inject } from "inversify";
import { Command } from "../../models/general/command";
import { Message, TextChannel } from "discord.js";
import { TYPES } from "../../types";
import { MessageResponder } from "./message-responder";

@injectable()
export class GeneralBot{

    private MCSERVERLINK = "ixd-mc.glenvandesteen.be";
    private MCDOWNLOADLINK = "dlmc.glenvandesteen.be";

    constructor(@inject(TYPES.MessageResponder) private messageResponder: MessageResponder){
    }

    async exectueGeneralCommand(command: Command, message: Message){
        switch(command.textCommand){
            case "mc": this.sendMinecraftHelp(message); break;
            case "minecraft": this.sendMinecraftHelp(message); break;
        }
    }

    private sendMinecraftHelp(message: Message){
        const text = `Minecraft information: \n  -Download the minecraft client at ${this.MCDOWNLOADLINK}\n
          -iXD Minecraft server: ${this.MCSERVERLINK}`;
        this.messageResponder.sendMultipleLineResponseToChannel(message.channel as TextChannel, text);
    }

}