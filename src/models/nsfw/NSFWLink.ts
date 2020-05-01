import { injectable } from "inversify";

export enum NSFWLinkType{
    Boobs = "boobs",
    Ass = "ass",
    Hentai = "hentai"
}

export class NSFWLinkOptions {
    type: NSFWLinkType;
    link: string;
    maxCount: number;
    extension?: string;
    needsPadding?: number;
}


@injectable()
export class NSFWLink extends NSFWLinkOptions {
    private defaultOptions: Partial<NSFWLinkOptions> = {
        extension: ".jpg",
    }

    constructor(options: NSFWLinkOptions) {
        super();
        Object.assign(this, this.defaultOptions, options);
    }   
}