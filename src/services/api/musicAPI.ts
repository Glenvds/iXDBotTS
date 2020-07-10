import { injectable } from "inversify";
import { QueueContruct } from "../../models/music/QueueContruct";
import { Music } from "../../models/music/music";

const fetch = require('node-fetch');

@injectable()
export class musicAPI {


    //GROTER: 1 OBJECT MET OOK NSFW LINKS TOEVOEGEN. NIE VIE AFZONDERLIJKE CALLS
    sendMusicData(songs: Music[]): void {

        fetch("http://localhost:8080/",
            {
                method: 'POST', body: JSON.stringify(songs), headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(res => console.log(res));
    }


}