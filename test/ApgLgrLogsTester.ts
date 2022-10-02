/** -----------------------------------------------------------------------
 * @module [Lgr]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.2 [APG 2022/09/24] Github Beta
 * -----------------------------------------------------------------------
 */
import {
    MongoDatabase,
    MongoCollection,
    DotEnv,
    Mng
} from "../deps.ts";

import {
    ApgLgr,
    IApgLgr,
    ApgLgrLogsService,
    ApgLgrLogsFsService,
    ApgLgrLogsDbService,
    ApgLgrLoggable
} from "../mod.ts";

export enum eApgLgrLogsTesterMode {
    localFs = "LocalFs",
    localDb = "LocalDb",
    atlasDb = "AtlasDb"
}

const DB_NAME = "ApgTest";
const COLLECTION = "Logs";
const KEEP_THE_LAST_N_SESSIONS = 3;

export class ApgLgrLogsTester extends ApgLgrLoggable {

    private _mongoService: Mng.ApgMngService | null = null;

    constructor(alogger: ApgLgr) {
        super(import.meta.url, alogger)
    }

    async #getLogsService(amode: eApgLgrLogsTesterMode) {

        let r: ApgLgrLogsService;
        if (amode == eApgLgrLogsTesterMode.localFs) {
            r = new ApgLgrLogsFsService('./test/data')
        }
        else {
            const db = await this.#getLogsDatabase(amode);
            r = new ApgLgrLogsDbService(db!, COLLECTION)
        }
        return r;
    }

    async #initializeMongoService(amode: eApgLgrLogsTesterMode) {
        const env = DotEnv.config()

        let r: Mng.ApgMngService | null = null;
        if (amode == eApgLgrLogsTesterMode.localDb) {
            r = new Mng.ApgMngLocalService(DB_NAME)
            console.log("Mongo DB Local connecting")
        }
        else if (amode == eApgLgrLogsTesterMode.atlasDb) {
            r = new Mng.ApgMngAtlasService(
                DB_NAME,
                env.atlasShard,
                env.user,
                env.password,
            )
            console.log("Mongo DB Atlas connecting")
        }
        if (r != null) {

            await r.initializeConnection();

            if (!r.Status.Ok) {
                console.log(this.className + " Error: Mongo DB not connected");
                return r;
            } else {
                console.log("Mongo DB connected")
            }
        }
        else { 
            console.log("Mongo DB connection FAILURE")
        }
        return r;
    }

    async #getLogsDatabase(amode: eApgLgrLogsTesterMode) {

        this._mongoService = await this.#initializeMongoService(amode);

        let db: MongoDatabase | null = null;
        let logsCollection: MongoCollection<IApgLgr> | null = null;

        if (this._mongoService!.Status.Ok) {
            db = this._mongoService!.Database;
            logsCollection = db!.collection<IApgLgr>(COLLECTION);
        }

        if (logsCollection == undefined) {
            console.log(this.className + " Error: Logs collection not initialized");
            return null;
        }
        console.log("Logs collection connected")

        return db;
    }



    async run(amode: eApgLgrLogsTesterMode) {

        console.log("\n");
        console.log(this.className + " " + amode)
        console.log('-------------------------------------------------------------------------')
        let logsService: ApgLgrLogsService;
        try {
            logsService = await this.#getLogsService(amode);
        } catch (e) {
            console.log(e.message);
        }

        const r = await logsService!.loadSessions();
        if (!r.Ok) {
            console.log(this.className + " Error: loading sessions");
            return;
        }
        const sessionsBeforePurge = logsService!.ImmutableSessions;
        await logsService!.purgeOldSessions(KEEP_THE_LAST_N_SESSIONS);
        const sessionsAfterPurge = logsService!.ImmutableSessions;
        const purged = sessionsBeforePurge.length - sessionsAfterPurge.length;
        if (purged == 0) {
            console.log(this.className + " Error: purged all sessions");
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

        if (this._mongoService != null) { 
            this._mongoService!.closeConnection();
        }

    }

}