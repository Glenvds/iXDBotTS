import { injectable, inject } from "inversify";
import { Command } from "../../models/general/command";
import { Message, TextChannel, MessageEmbed, WebhookClient } from "discord.js";
import { TYPES } from "../../types";
import { MessageResponder } from "./message-responder";

@injectable()
export class GeneralBot {

    private MCSERVERLINK = "ixd-mc.glenvandesteen.be";
    private MCDOWNLOADLINK = "http://mcdl.glenvandesteen.be";
    private webHookClient = new WebhookClient("723556075168596025", "Q29SYGuNA6qqDJNOhUuRHivsx_aqnnKQVgTxK2oV0MaiMkjkJWHJgGNW-gt6Gz71DZ6a");
    private embedGeneral = new MessageEmbed()
        .setTitle("General commands")
        .setColor("DARK_GREY")
        .addField("!mc", "Get the latest iXD Minecraft server information.                                                                     ", false);

    private embedMusic = new MessageEmbed()
        .setTitle("Music commands")
        .setDescription("Only usable in the music channel!")
        .setColor("RED")
        .addField("!play [link or YouTube search]", "Adds your input to the queue. If there is no playing track, it will start playing.", false)
        .addField("!radio [name of radiostation]", "Starts playing your choice of radiostation. Type !radio to get an overview of the possible radiostations.", false)
        .addField("!rene", "Starts playing a random Rene quote.", false)
        .addField("!rene [quote]", "Starts playing a specific Rene quote. Ex: !rene schloan", false)
        .addField("!queue", "Get an overview of the current queue", false)
        .addField("!skip", "Skips the current song. Next song in queue will start playing", false)
        .addField("!stop", "Stops the bot from playing music or radio. The queue will be cleared", false);

    private embedNSFW = new MessageEmbed()
        .setTitle("NSFW commands")
        .setDescription("Only usable in the NSFW channel!")
        .setColor("NOT_QUITE_BlACK")
        .addField("!boobs, !ass, !hentai, !penis", "-----------------------------------------------------------", false);

    private embedsAA = [this.embedGeneral, this.embedMusic, this.embedNSFW];







    constructor(@inject(TYPES.MessageResponder) private messageResponder: MessageResponder) {
    }

    async executeGeneralCommand(command: Command, message: Message) {
        switch (command.textCommand) {
            case "mc": this.sendMinecraftHelp(message); break;
            case "minecraft": this.sendMinecraftHelp(message); break;
            case "help": this.sendHelpResponse(message); break;
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

    private sendHelpResponse(message: Message){
        this.webHookClient.send("iXD Discord bot commands", {
            embeds: this.embedsAA
        });
    }

    /*private sendHelpResponse(message: Message) {
        const res = `iXD Discord bot commands
        General Commands: \n
        !mc                                 Get the latest iXD Minecraft server information\n
        \n
        Music Commands (only usable in the music channnel): \n
        !play [link or YouTube search]      Adds your input to the queue. If there is no playing track, it will start playing\n
        !radio [name of radiostation]       Starts playing your choice of radiostation. Type !radio to get an overview of the possible radiostations\n
        !rene                               Starts playing a random Rene quote\n
        !rene [quote]                       Starts playing a specific Rene quote. Ex.: !rene schloan\n
        !queue                              Get an overview of the current queue\n
        !skip                               Skips the current song. Next song in queue will start playing\n
        !stop                               Stops the bot from playing music or radio. The queue will be cleared\n
        \n
        NSFW Commands (only usable in the NSFW channel):  !boobs, !ass, !hentai, !penis
        `;
        this.messageResponder.sendMultipleLineResponseToChannel(message.channel as TextChannel, res);
    }*/

    /*private sendCommandsHelp(message: Message) {
        const embededmsg = new MessageEmbed()
            .setTitle("iXD Discord bot commands")
            .addFields(
                { name: "Music", value: ":", inline: true },
                { name: "!play", value: "Play music" }
            )
        this.messageResponder.sendEmbededResponseToChannel(message.channel as TextChannel, embededmsg);
    }*/

}