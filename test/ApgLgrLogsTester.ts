import {
    MongoDatabase, MongoCollection, DotEnv, Uts, Rst
} from "../deps.ts";

import * as Mng from "https://raw.githubusercontent.com/Pangeli70/apg-mng/master/mod.ts";

import {
    IApgLgr, ApgLgr, ApgLgrLogsService, ApgLgrLogsFsService, ApgLgrLogsDbService
} from "../mod.ts";

export enum eApgLgrLogsTesterMode {
    localFs = "LocalFs",
    localDb = "LocalDb",
    atlasDb = "AtlasDb"
}

const DB_NAME = "ApgTest";
const COLLECTION = "Logs";

export class ApgLgrLogsTester {

    readonly CLASS_NAME = "ApgLgrLogsServiceTester";
    readonly MTHD_NAME = "run";

    do() {
        console.log("Done");
    }

    async runFs() {

        console.log("\n");
        console.log(this.CLASS_NAME + " " + eApgLgrLogsTesterMode.localFs)
        console.log('-------------------------------------------------------------------------')

        const logsService = new ApgLgrLogsFsService('./test/data')

        const r = await logsService.loadSessions();
        if (!r.Ok) {
            console.log(this.CLASS_NAME + " Error: loading sessions");
            return;
        }

        const KEEP_THE_LAST_N_SESSIONS = 3;
        const sessionsBeforePurge = logsService.ImmutableSessions;
        await logsService.purgeOldSessions(KEEP_THE_LAST_N_SESSIONS);
        const sessionsAfterPurge = logsService.ImmutableSessions;
        const purged = sessionsBeforePurge.length - sessionsAfterPurge.length;
        if (purged == 0) {
            console.log(this.CLASS_NAME + " Warning: already purged all sessions");
            return;
        }
        else { 
            console.log(`${this.CLASS_NAME}: Purged [${purged}] sessions.`) 
        }
        const sessionId = sessionsAfterPurge[KEEP_THE_LAST_N_SESSIONS - 1];
        const index = await logsService.getSessionIndexBySessionId(sessionId);
        console.log(`The index of session [${sessionId}] is: [${index}]`);

        const loggers = await logsService.loadLoggersFromSessionIndex(index);
        console.log(`The session with index [${index}] contains: [${loggers.length}] loggers`);

        const errors = await logsService.getLoggerWithFilteredEvents(index, loggers[0].id, true);
        console.log(`The logger with id [${loggers[0].id}] contains: [${errors.events.length}] error events`);
        
    }

    async runAtlasDb(amode: eApgLgrLogsTesterMode) {

        console.log("\n");
        console.log(this.CLASS_NAME + " " + amode)
        console.log('-------------------------------------------------------------------------')

        const env = DotEnv.config()

        let mongoService: Mng.ApgMngService;
        if (amode == eApgLgrLogsTesterMode.localDb) {
            mongoService = new Mng.ApgMngLocalService(DB_NAME)
            console.log("Mongo DB Local connecting")
        }
        else if (amode == eApgLgrLogsTesterMode.atlasDb) {
            mongoService = new Mng.ApgMngAtlasService(
                DB_NAME,
                env.atlasShard,
                env.user,
                env.password,
            )
            console.log("Mongo DB Atlas connecting")
        }

        let db: MongoDatabase | null = null;
        let logsCollection: MongoCollection<IApgLgr> | null = null;

        if (amode != eApgLgrLogsTesterMode.localFs) {

            await mongoService!.initializeConnection();
            const mongoDBConnected = mongoService!.Status.Ok;
            if (!mongoDBConnected) {
                console.log(this.CLASS_NAME + " Error: Mongo DB not connected");
                return;
            } else {
                console.log("Mongo DB connected")
            }

            if (mongoDBConnected) {
                db = mongoService!.Database;
                logsCollection = db!.collection<IApgLgr>(COLLECTION);
            }

            if (logsCollection == undefined) {
                console.log(this.CLASS_NAME + " Error: Logs collection not initialized");
                return;
            }
            console.log("Logs collection connected")
        }

        let logsService: ApgLgrLogsService

        if (amode == eApgLgrLogsTesterMode.localFs) {
            logsService = new ApgLgrLogsFsService('./test/data')
        }
        else {
            logsService = new ApgLgrLogsDbService(db!, 'logs')
        }

        const r = await logsService.loadSessions();
        if (!r.Ok) {
            console.log(this.CLASS_NAME + " Error: loading sessions");
            return;
        }
        const sessionsBeforePurge = logsService.ImmutableSessions;
        await logsService.purgeOldSessions(3);
        const sessionsAfterPurge = logsService.ImmutableSessions;
        const purged = sessionsBeforePurge.length - sessionsAfterPurge.length;
        if (purged == 0) {
            console.log(this.CLASS_NAME + " Error: purged all sessions");
            return;
        }

        const index = await logsService.getSessionIndexBySessionId(sessionsAfterPurge[0]);
        console.log(`The index of session[0]: ${sessionsAfterPurge[0]} is ${index}`);

        const loggers = await logsService.loadLoggersFromSessionIndex(index);
        console.log(`The session contains: ${loggers} loggers`);

        const errors = await logsService.getLoggerWithFilteredEvents(index, loggers[0].id, true);
        console.log(`The logger ${0} contains: ${errors.events.length} loggers`);
    }

}