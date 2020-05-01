import { injectable } from "inversify";
const fetch = require('node-fetch');

@injectable()
export class urlService {
    constructor() { }

    async testUrl(url: string): Promise<boolean> {
        return (await fetch(url)).status === 200;
    }

    isUrl(url: string): boolean {
        var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
        return regexp.test(url);
    }
}