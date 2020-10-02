import { appendFileSync } from "fs";
import { injectable } from "inversify";
import { ILogObject, Logger } from "tslog";

@injectable()
export class LoggerService {

    logger: Logger = new Logger({ name: "ixdbotTSLogger", type: "pretty" });

    constructor() {
        this.logger.attachTransport(
            {
                silly: this.logFileToTransport,
                debug: this.logFileToTransport,
                trace: this.logFileToTransport,
                info: this.logFileToTransport,
                warn: this.logFileToTransport,
                error: this.logFileToTransport,
                fatal: this.logFileToTransport,
            },
            "debug"
        );
    }

    private logFileToTransport(logObj: ILogObject) {
        appendFileSync("ixdbotTSlogfile.log", JSON.stringify(logObj) + "\n");
    }
}