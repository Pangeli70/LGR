/** -----------------------------------------------------------------------
 * @module [Lgr]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.2 [APG 2022/09/24] Github Beta
 * -----------------------------------------------------------------------
 */
import {
    Uts, Rst, Mng
} from "../deps.ts";

import { IApgLgr } from "../src/interfaces/IApgLgr.ts";
import { ApgLgr, ApgLgrLoggable } from "../mod.ts";

const DB_NAME = "ApgTest";
const COLLECTION_NAME = "Logs";

export class ApgLgrTester extends ApgLgrLoggable {

    constructor(alogger: ApgLgr) {
        super(import.meta.url, alogger)
    }

    async run(amode: Mng.eApgMngMode) {

        const MTHD_NAME = this.run.name;

        const connector = await this.#setup(amode);

        this._logger.log(this.className, MTHD_NAME);

        const errResult = Rst.ApgRstErrors.Unmanaged('Unmanaged test error');
        this._logger.log(this.className, MTHD_NAME, errResult);

        const totalTime = await this._logger.flush();
        console.log("Logger flushed in " + totalTime.toFixed(2) + "ms.\n\n");

        connector!.disconenct();

    }


    async #setup(amode: Mng.eApgMngMode) {
        console.log("\n");
        console.log(this.className + " " + amode)
        console.log('-------------------------------------------------------------------------')

        const connector = new Mng.ApgMngConnector();

        await connector.connect(amode, DB_NAME);

        const logsCollection = connector.getCollection<IApgLgr>(COLLECTION_NAME);

        if (logsCollection == undefined) {
            console.log(this.className + " Error: Logs collection not initialized");
            return;
        }
        console.log("Logs collection connected")

        const session = new Uts.ApgUtsDateTimeStamp(new Date()).Value;
        ApgLgr.Session(session);

        ApgLgr.ClearTrasports();
        ApgLgr.AddConsoleTransport()
        await ApgLgr.AddFileTransport('./test/data/', session + '.log');
        ApgLgr.AddMongoTransport(logsCollection, amode);

        return connector;

    }


}

