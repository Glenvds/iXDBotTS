import { Message, TextChannel, Channel, DiscordAPIError, MessageEmbed } from "discord.js";
import { injectable } from "inversify";

@injectable()
export class MessageResponder {
    constructor() {
    }

    sendResponseToChannel(channel: TextChannel, text: string): Promise<Message | Message[]> {
        return channel.send("`" + text + "`");
    }

    sendURLToChannel(channel: TextChannel, url: string): Promise<Message | Message[]> {
        return channel.send(url);
    }

    sendMultipleLineResponseToChannel(channel: TextChannel, text: string): Promise<Message | Message[]> {
        return channel.send("```" + text + "```");
    }

    sendEmbededResponseToChannel(channel: TextChannel ,message: MessageEmbed): Promise<Message | Message[]>{
        //return message.textChannel.send({embed: message});
        return channel.send(message);
    }


    getContentOfMessage(message: Message): string{
        if (message.content.indexOf(' ') !== -1) {
            return message.content.substring(message.content.indexOf(' ') + 1).toLocaleLowerCase();
        } else {
            return;
        }
    }
}