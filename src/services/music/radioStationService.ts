import { injectable } from "inversify";
import { RadioStation } from "../../models/music/radioStation";

@injectable()
export class RadioStationService{

    private RADIO_STATIONS = [
        new RadioStation({name: "stubru", url: "http://icecast.vrtcdn.be/stubru-high.mp3"}),
        new RadioStation({name: "mnm", url: "http://icecast.vrtcdn.be/mnm-high.mp3"}),
        new RadioStation({name: "radio1", url: "http://icecast.vrtcdn.be/stubru-high.mp3"})
    ];

    constructor(){
    }

    getPossibleRadioStationsAsString(startMessage: string): string{
        let returnString = startMessage;
        this.RADIO_STATIONS.forEach((station) => {
            returnString = returnString.concat("- " + station.name);
        });
        return returnString;
    }

    getRadioStationFromInput(input: String): RadioStation{
        for(let station of this.RADIO_STATIONS){
            if(station.name === input){
                return station;
            }
        }
    }
}