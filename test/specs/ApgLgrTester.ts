/** -----------------------------------------------------------------------
 * @module [Lgr]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.2 [APG 2022/09/24] Github Beta
 * @version 0.9.7 [APG 2023/05/27] Separation of concerns lib/src
 * -----------------------------------------------------------------------
 */
import { Uts, Rst, Mng } from "../deps.ts";

import * as Lgr from "../../lib/mod.ts";

const DB_NAME = "ApgTest";
const COLLECTION_NAME = "Logs";

export class ApgLgrTester extends Lgr.ApgLgrLoggable {

    constructor(alogger: Lgr.ApgLgr) {
        super(import.meta.url, alogger)
    }

    async run(amode: Mng.eApgMngMode) {

        const MTHD_NAME = this.run.name;

        const connector = await this.#setup(amode);

        this.logger.log(this.className, MTHD_NAME);

        const errResult = Rst.ApgRstErrors.Simple('Unmanaged test error');
        this.logger.log(this.className, MTHD_NAME, errResult);

        const totalTime = await this.logger.flush();
        console.log("Logger flushed in " + totalTime.toFixed(2) + "ms.\n\n");

        connector!.disconnect();

    }


    async #setup(amode: Mng.eApgMngMode) {
        console.log("\n");
        console.log(this.className + " " + amode)
        console.log('-------------------------------------------------------------------------')

        const connector = new Mng.ApgMngConnector();

        await connector.connect(amode, DB_NAME);

        const logsCollection = connector.getCollection<Lgr.IApgLgr>(COLLECTION_NAME);

        if (logsCollection == undefined) {
            console.log(this.className + " Error: Logs collection not initialized");
            return;
        }
        console.log("Logs collection connected")

        const session = new Uts.ApgUtsDateTimeStamp(new Date()).Stamp;
        Lgr.ApgLgr.Session(session);

        Lgr.ApgLgr.ClearTrasports();
        Lgr.ApgLgr.AddConsoleTransport()
        await Lgr.ApgLgr.AddFileTransport('./test/data/', session + '.log');
        Lgr.ApgLgr.AddMongoTransport(logsCollection, amode);

        return connector;

    }


}

