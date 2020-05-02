import { injectable } from "inversify";

export class RadioStationOptions{
    name: string;
    //displayName: string;
    url: string;
}

@injectable()
export class RadioStation extends RadioStationOptions{
    constructor(options: RadioStationOptions){
        super();
        Object.assign(this, options);
    }
}