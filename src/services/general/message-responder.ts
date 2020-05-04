import { Message, TextChannel } from "discord.js";
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

    getContentOfMessage(message: Message): string{
        if (message.content.indexOf(' ') !== -1) {
            return message.content.substring(message.content.indexOf(' ') + 1).toLocaleLowerCase();
        } else {
            return;
        }
    }
}