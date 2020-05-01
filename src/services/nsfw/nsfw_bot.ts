import { injectable, inject } from "inversify";
import { Command } from "../../models/general/command";
import { Message, TextChannel } from "discord.js";
import { TYPES } from "../../types";
import { MessageResponder } from "../general/message-responder";
import { NSFWLink, NSFWLinkType } from "../../models/nsfw/nsfwLink";
import { urlService } from "../general/urlService";


@injectable()
export class NSFWBot {

    private NSFW_BASEURLS = [
        new NSFWLink({ type: NSFWLinkType.Boobs, link: "http://media.oboobs.ru/boobs/", maxCount: 14678, needsPadding: 5 }),
        new NSFWLink({ type: NSFWLinkType.Ass, link: "http://media.oboobs.ru/boobs/", maxCount: 7417, needsPadding: 5 }),
        new NSFWLink({ type: NSFWLinkType.Hentai, link: "https://s9v7j7a4.ssl.hwcdn.net/galleries/full/02/8b/a4/028ba4c4d9b039efffa26a6daec2ca06/", maxCount: 19 }),
        new NSFWLink({ type: NSFWLinkType.Hentai, link: "https://s9v7j7a4.ssl.hwcdn.net/galleries/full/ee/1f/93/ee1f93b2562d56ac3a681ce4b3abb7b2/", maxCount: 19 }),
        new NSFWLink({ type: NSFWLinkType.Hentai, link: "https://s9v7j7a4.ssl.hwcdn.net/galleries/full/f4/f2/ff/f4f2ff1ace17d02bfaab856948a6c7aa/", maxCount: 19 }),
    ];

    constructor(@inject(TYPES.MessageResponder) private MessageResponder: MessageResponder, @inject(TYPES.urlService) private urlService: urlService) {
    }

    async executeNSFWCommand(command: Command, message: Message) {
        switch (command.textCommand) {
            case "penis": this.MessageResponder.sendResponseToChannel(message.channel as TextChannel, "Jordy is gay."); break;
            default:
                const randomUrl = await this.getRandomUrlOfType(command.textCommand as NSFWLinkType);
                this.MessageResponder.sendURLToChannel(message.channel as TextChannel, randomUrl)
        }
    }

    private async getRandomUrlOfType(type: NSFWLinkType) {
        const typeList = this.NSFW_BASEURLS.filter(x => x.type === type);
        const nsfwLink = typeList[Math.floor(Math.random() * typeList.length)];
        let NSFWUrl = nsfwLink.link + this.generateNumber(nsfwLink) + nsfwLink.extension;

        if (await this.urlService.testUrl(NSFWUrl)) {
            return NSFWUrl;
        } else {
            do { NSFWUrl = nsfwLink.link + this.generateNumber(nsfwLink) + nsfwLink.extension; }
            while (!(await this.urlService.testUrl(NSFWUrl)))
            return NSFWUrl;
        }
    }

    private generateNumber(nsfwLink: NSFWLink): string {
        const num = Math.floor(Math.random() * nsfwLink.maxCount) + 1;
        return nsfwLink.needsPadding ? num.toString().padStart(nsfwLink.needsPadding, "0") : num.toString();
    }
}
