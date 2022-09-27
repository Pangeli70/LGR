import {
    MongoDatabase, MongoCollection, DotEnv, Uts, Rst
} from "../deps.ts";

import * as Mng from "https://raw.githubusercontent.com/Pangeli70/apg-mng/master/mod.ts";
import { IApgLgr } from "../src/interfaces/IApgLgr.ts";
import { ApgLgr } from "../mod.ts";

const DB_NAME = "ApgTest";
const COLLECTION = "Logs";

export class ApgLgrTester {

    readonly CLASS_NAME = "ApgLgrTester";
    readonly MTHD_NAME = "run";

    async run(alocal: boolean) {

        console.log("\n");
        console.log(this.CLASS_NAME + " " + ((alocal) ? "Local" : "Atlas"))
        console.log('-------------------------------------------------------------------------')

        const env = DotEnv.config()

        let service: Mng.ApgMngService;
        if (alocal) {
            service = new Mng.ApgMngLocalService(DB_NAME)
            console.log("Mongo DB Local connecting")
        }
        else {
            service = new Mng.ApgMngAtlasService(
                DB_NAME,
                env.atlasShard,
                env.user,
                env.password,
            )
            console.log("Mongo DB Atlas connecting")
        }

        await service.initializeConnection();

        const mongoDBConnected = service.Status.Ok;

        if (!mongoDBConnected) {
            console.log(this.CLASS_NAME + " Error: Mongo DB not connected");
            return;
        } else {
            console.log("Mongo DB connected")
        }

        let db: MongoDatabase | null = null;
        let logsCollection: MongoCollection<IApgLgr> | null = null;

        if (mongoDBConnected) {
            db = service.Database;
            logsCollection = db!.collection<IApgLgr>(COLLECTION);
        }

        if (logsCollection == undefined) {
            console.log(this.CLASS_NAME + " Error: Logs collection not initialized");
            return;
        }
        console.log("Logs collection connected")

        const session = new Uts.ApgUtsDateTimeStamp(new Date()).Value;
        ApgLgr.Session(session);

        ApgLgr.AddConsoleTransport()
        await ApgLgr.AddFileTransport('./test/data/', session + '.log');
        ApgLgr.AddMongoTransport(logsCollection, alocal);

        const logger = new ApgLgr('Test logger');

        logger.log(this.CLASS_NAME, this.MTHD_NAME);

        const errResult = Rst.ApgRstErrors.Unmanaged('Unmanaged error');
        logger.log(this.CLASS_NAME, this.MTHD_NAME, errResult);

        const totalTime = await logger.flush();
        console.log("Logger flushed in " + totalTime.toFixed(2)+ "ms.\n\n")

    }


}

