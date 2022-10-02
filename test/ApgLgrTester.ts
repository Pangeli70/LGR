/** -----------------------------------------------------------------------
 * @module [Lgr]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.2 [APG 2022/09/24] Github Beta
 * -----------------------------------------------------------------------
 */
import {
    MongoDatabase, MongoCollection,
    DotEnv,
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

    async run(alocal: boolean) {

        const MTHD_NAME = this.run.name;

        const mongoService = await this.#setup(alocal);

        this._logger.log(this.className, MTHD_NAME);

        const errResult = Rst.ApgRstErrors.Unmanaged('Unmanaged test error');
        this._logger.log(this.className, MTHD_NAME, errResult);

        const totalTime = await this._logger.flush();
        console.log("Logger flushed in " + totalTime.toFixed(2) + "ms.\n\n");

        mongoService!.closeConnection();

    }

    async #setup(alocal: boolean) {
        console.log("\n");
        console.log(this.className + " " + ((alocal) ? "Local" : "Atlas"))
        console.log('-------------------------------------------------------------------------')

        const env = DotEnv.config()

        let mongoService: Mng.ApgMngService;
        if (alocal) {
            mongoService = new Mng.ApgMngLocalService(DB_NAME)
            console.log("Mongo DB Local connecting")
        }
        else {
            mongoService = new Mng.ApgMngAtlasService(
                DB_NAME,
                env.atlasShard,
                env.user,
                env.password,
            )
            console.log("Mongo DB Atlas connecting")
        }

        await mongoService.initializeConnection();

        const mongoDBConnected = mongoService.Status.Ok;

        if (!mongoDBConnected) {
            console.log(this.className + " Error: Mongo DB not connected");
            return;
        } else {
            console.log("Mongo DB connected")
        }

        let db: MongoDatabase | null = null;
        let logsCollection: MongoCollection<IApgLgr> | null = null;

        if (mongoDBConnected) {
            db = mongoService.Database;
            logsCollection = db!.collection<IApgLgr>(COLLECTION_NAME);
        }

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
        ApgLgr.AddMongoTransport(logsCollection, alocal);

        return mongoService;

    }


}

