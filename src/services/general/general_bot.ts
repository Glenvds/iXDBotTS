import { injectable, inject } from "inversify";
import { Command } from "../../models/general/command";
import { Message, TextChannel, MessageEmbed } from "discord.js";
import { TYPES } from "../../types";
import { MessageResponder } from "./message-responder";

@injectable()
export class GeneralBot {

    private MCSERVERLINK = "ixd-mc.glenvandesteen.be";
    private MCDOWNLOADLINK = "http://mcdl.glenvandesteen.be";

    constructor(@inject(TYPES.MessageResponder) private messageResponder: MessageResponder) {
    }

    async executeGeneralCommand(command: Command, message: Message) {
        switch (command.textCommand) {
            case "mc": this.sendMinecraftHelp(message); break;
            case "minecraft": this.sendMinecraftHelp(message); break;
            case "help": this.sendCommandsHelp(message); break;
        }
    }

    private sendMinecraftHelp(message: Message) {

        const embededmsg = new MessageEmbed()
            .setTitle("Minecraft information")
            .addFields(
                { name: "Minecraft client:", value: `[Download here](${this.MCDOWNLOADLINK})` },
                { name: "iXD Minecraft server:", value: `${this.MCSERVERLINK}` }
            )

        this.messageResponder.sendEmbededResponseToChannel(message.channel as TextChannel, embededmsg);
    }

    private sendCommandsHelp(message: Message) {
        const embededmsg = new MessageEmbed()
            .setTitle("iXD Discord bot commands")
            .addFields(
                { name: "Music", value: ":", inline: true },
                { name: "!play", value: "Play music" }
            )
        this.messageResponder.sendEmbededResponseToChannel(message.channel as TextChannel, embededmsg);
    }

}