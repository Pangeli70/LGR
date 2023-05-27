/** -----------------------------------------------------------------------
 * @module [Lgr]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.2 [APG 2022/09/24] Github Beta
 * @version 0.9.7 [APG 2023/05/27] Separation of concerns lib/src
 * -----------------------------------------------------------------------
 */
import { Mng } from "../deps.ts";

import * as Lgr from "../../lib/mod.ts";

import { eApgLgrLogsTesterMode } from "./eApgLgrLogsTesterMode.ts";

const DB_NAME = "ApgTest";
const COLLECTION_NAME = "Logs";
const KEEP_THE_LAST_N_SESSIONS = 3;

export class ApgLgrLogsTester extends Lgr.ApgLgrLoggable {

    private _connector: Mng.ApgMngConnector | null = null;

    constructor(alogger: Lgr.ApgLgr) {
        super(import.meta.url, alogger)
    }

    async #getLogsService(amode: eApgLgrLogsTesterMode) {

        let r: Lgr.ApgLgrLogsService;
        if (amode == eApgLgrLogsTesterMode.localFs) {
            r = new Lgr.ApgLgrLogsFsService('./test/data')
        }
        else {
            this._connector = new Mng.ApgMngConnector();
            const logsCollections = await this.#getLogsCollection(this._connector, amode);
            if (!logsCollections) {
                return null;
            }
            r = new Lgr.ApgLgrLogsMongoDbService(logsCollections)
        }
        return r;
    }


    async #getLogsCollection(aconnector: Mng.ApgMngConnector, amode: eApgLgrLogsTesterMode) {

        let dbMode = Mng.eApgMngMode.local;
        if (amode == eApgLgrLogsTesterMode.atlasDb) dbMode = Mng.eApgMngMode.atlas;

        await aconnector.connect(dbMode, DB_NAME);
        const logs = aconnector.getCollection<Lgr.IApgLgr>(COLLECTION_NAME);

        if (logs == undefined) {
            console.log(this.className + " Error: Logs collection not initialized");
            return null;
        }
        console.log("Logs collection connected")

        return logs;
    }



    async run(amode: eApgLgrLogsTesterMode) {

        console.log("\n");
        console.log(this.className + " " + amode)
        console.log('-------------------------------------------------------------------------')
        let logsService: Lgr.ApgLgrLogsService | null = null;
        try {
            logsService = await this.#getLogsService(amode);
        } catch (e) {
            console.log(e.message);
        }

        if (logsService == null) {
            console.log(this.className + " Error: Logs service not available");
            return;
        }

        const r = await logsService!.loadSessions();
        if (!r.ok) {
            console.log(this.className + " Error: loading sessions");
            return;
        }
        const sessionsBeforePurge = logsService!.ImmutableSessions;
        await logsService!.purgeOldSessions(KEEP_THE_LAST_N_SESSIONS);
        const sessionsAfterPurge = logsService!.ImmutableSessions;
        const purged = sessionsBeforePurge.length - sessionsAfterPurge.length;
        if (purged == 0) {
            console.log(this.className + " Error: already purged all sessions");
            return;
        }
        else {
            console.log(`${this.className}: Purged [${purged}] sessions.`)
        }

        const sessionId = sessionsAfterPurge[KEEP_THE_LAST_N_SESSIONS - 1];

        const index = await logsService!.getSessionIndexBySessionId(sessionId);
        console.log(`The index of session [${sessionId}] is: [${index}]`);

        const loggers = await logsService!.loadLoggersFromSessionIndex(index);
        console.log(`The session with index [${index}] contains: [${loggers.length}] loggers`);

        const loggerWithErrors = await logsService!.getLoggerWithFilteredEvents(index, loggers[0].id, true);
        console.log(`The logger with id [${loggers[0].id}] contains: [${loggerWithErrors.events.length}] error events`);

        if (this._connector != null) {
            this._connector.disconnect();
        }

    }

}