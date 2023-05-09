/** -----------------------------------------------------------------------
 * @module [apg-lgr]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.5.1 [APG 2019/03/24]
 * @version 0.7.0 [APG 2019/08/15]
 * @version 0.8.0 [APG 2022/03/19] Porting to Deno
 * @version 0.9.0 [APG 2022/08/09] Code smells and metrics
 * @version 0.9.1 [APG 2022/09/24] Github Beta
 * @version 0.9.5 [APG 2023/02/14] Rst simplification
 * @version 0.9.7 [APG 2023/05/08] Separation of concerns lib/srv
 * -----------------------------------------------------------------------
 */

import { MongoCollection, Rst } from "../deps.ts"
import { IApgLgr } from "../interfaces/IApgLgr.ts";
import { ApgLgrLogsService } from "./ApgLgrLogsService.ts";


/**
 * Service to browse and purge logs Data from Mongo Database
 */
export class ApgLgrLogsDbService extends ApgLgrLogsService {

  private _collection?: MongoCollection<IApgLgr>;

  constructor(acollection: MongoCollection<IApgLgr>) {

    super(import.meta.url);

    this._collection = acollection;
    Rst.ApgRstAssert.IsUndefined(
      this._collection,
      `${this.CLASS_NAME}.constructor: The database doesn't contain the logs collection`,
      true
    );

  }


  async loadSessions() {

    this._sessions = await this.#readLogSessionsFromDb();

    this.sortSessionsDescending();

    return { ok: true } as Rst.IApgRst;

  }

  // Warning: unsorted
  async #readLogSessionsFromDb() {

    const r: string[] = [];

    const query = [
      {
        '$group': {
          '_id': '$session'
        }
      }
    ];
    const loggers = await this._collection!
      .aggregate<{ _id: string }>(query)
      .toArray();

    loggers.map(item => {
      r.push(item._id);
    });

    return r;
  }


  async loadLoggersFromSessionIndex(asessionIndex: number): Promise<IApgLgr[]> {

    if (!this.IsReady) {
      await this.loadSessions();
    }

    return await this.#loadLoggersFromDb(asessionIndex);

  }


  async #loadLoggersFromDb(asessionIndex: number) {

    const session = this._sessions[asessionIndex];

    const query =
    {
      'session': session
    }

    const r = await this._collection!
      .find(query)
      .toArray()

    r.sort((a, b) => {
      return (a.creationTime > b.creationTime) ?
        1 : (a.creationTime < b.creationTime) ?
          -1 : 0;
    })

    return r;
  }


  async purgeOldSessions(akeepTheLast: number) {

    const r = { ok: true } as Rst.IApgRst;
    const n = await this.#purgeSessionsDocumentsFromDb(akeepTheLast);
    const p: Rst.IApgRstPayload = {
      signature: "number",
      data: n
    }
    r.payload = p;
    return r;

  }



  async #purgeSessionsDocumentsFromDb(akeepTheLast: number) {

    const lastSession = this._sessions[akeepTheLast - 1];

    const criteria = { "session": { "$lt": lastSession } };
    const r = await this._collection!.deleteMany(criteria);
    this._sessions.splice(akeepTheLast, r);

    return r;
  }


}
