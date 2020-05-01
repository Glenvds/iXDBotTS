import {Message, TextChannel} from "discord.js";
import {inject, injectable} from "inversify";


@injectable()
export class MessageResponder{
    constructor(){
    }

    sendResponseToChannel(channel: TextChannel, text: string): Promise<Message | Message[]>{
        return channel.send("`" + text + "`");
    }

    sendURLToChannel(channel: TextChannel, url: string): Promise<Message | Message[]>{
        return channel.send(url);
    }

    sendMultipleLineResponseToChannel(channel: TextChannel, text: string): Promise<Message | Message[]>{
        return channel.send(text);
    }
}