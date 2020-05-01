import {injectable} from "inversify";

@injectable()
export class PingFinder{
    private regexp = "ping";

    public isPing(stringToSearch: string): string{
        if(stringToSearch.search(this.regexp) >= 0){
            return "pong";
        }
        else{return;}
    }
}