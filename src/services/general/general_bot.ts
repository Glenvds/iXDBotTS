import { injectable, inject } from "inversify";
import { Command } from "../../models/general/command";
import { Message, TextChannel, MessageEmbed } from "discord.js";
import { TYPES } from "../../types";
import { MessageResponder} from "./message-responder";

@injectable()
export class GeneralBot{

    private MCSERVERLINK = "ixd-mc.glenvandesteen.be";
    private MCDOWNLOADLINK = "http://dlmc.glenvandesteen.be";

    constructor(@inject(TYPES.MessageResponder) private messageResponder: MessageResponder){
    }

    async exectueGeneralCommand(command: Command, message: Message){
        switch(command.textCommand){
            case "mc": this.sendMinecraftHelp(message); break;
            case "minecraft": this.sendMinecraftHelp(message); break;
        }
    }

    private sendMinecraftHelp(message: Message){

        const embededmsg = new MessageEmbed()
        .setTitle("Minecraft information")
        .addFields(
            {name: "Minecraft client:", value: `[Download here](${this.MCDOWNLOADLINK})`},
            {name: "iXD Minecraft server:", value: `${this.MCSERVERLINK}`}
        )

        this.messageResponder.sendEmbededResponseToChannel(message.channel as TextChannel, embededmsg);
    }

}