/** -----------------------------------------------------------------------
 * @module [Logs]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.5.1 [APG 2019/03/24]
 * @version 0.7.0 [APG 2019/08/15]
 * @version 0.8.0 [APG 2022/03/19] Porting to Deno
 * @version 0.9.0 [APG 2022/08/09] Code smells and metrics
 * @version 0.9.1 [APG 2022/09/24] Github Beta
 * -----------------------------------------------------------------------
 */

import {
  MongoDatabase, MongoCollection, Rst, Uts
} from "../../deps.ts"


import { IApgLgr } from "../interfaces/IApgLgr.ts";
import { ApgLgrLogsService } from "./ApgLgrLogsService.ts";


/**
 * Service to browse and purge logs Data from Mongo Database
 */
export class ApgLgrLogsDbService extends ApgLgrLogsService {

  readonly META_NAME = "ApgLgrLogsDbService"

  private _dataBase?: MongoDatabase;

  private _collection?: MongoCollection<IApgLgr>;



  constructor(adataSource: MongoDatabase, acollectionName: string) {

    super(import.meta.url);

    const isDatabase = adataSource instanceof MongoDatabase;
    Rst.ApgRstAssert.IsFalse(
      isDatabase,
      `${this.CLASS_NAME}.constructor: datasource should be a MongoDatabase`,
      true
    );

    this._dataBase = adataSource;
    this._collection = this._dataBase.collection(acollectionName);
    Rst.ApgRstAssert.IsUndefined(
      this._collection,
      `${this.CLASS_NAME}.constructor: The database doesn't contain the ${acollectionName} collection`,
      true
    );

  }


  async loadSessions() {

    this._sessions = await this.#readLogSessionsFromDb();

    this.sortSessionsDescending();
    const r = new Promise<Rst.ApgRst>(_resolve => new Rst.ApgRst());
    return r;

  }


  async #readLogSessionsFromDb() {

    const r: string[] = [];

    // Search for the loggers used during app bootstrap
    // Those are the ones that identify the sessions starts
    const query = { 'meta.name': this.META_NAME };
    const loggers = await this._collection!.find(query).toArray();
    loggers.map(item => {
      const adate = (item).creationTime;
      const dateTimeStamp = new Uts.ApgUtsDateTimeStamp(adate).Value;
      r.push(dateTimeStamp);
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

    const creationTimeCriteria: any = {};

    // Greater than criteria
    const dateTimeStampObj = new Uts.ApgUtsDateTimeStamp(this._sessions[asessionIndex]);
    const startTime = dateTimeStampObj.Date;
    creationTimeCriteria.$gte = startTime;

    // Lesser than criteria
    if (asessionIndex !== 0) {
      const dateTimeStampObj = new Uts.ApgUtsDateTimeStamp(this._sessions[asessionIndex - 1]);
      const endTime = dateTimeStampObj.Date;
      creationTimeCriteria.$lt = endTime;
    }

    const mongoQuery: any = {};
    // TODO check this. maybe meta is superfluous
    mongoQuery['meta.creationTime'] = creationTimeCriteria

    const r = await this._collection!
      .find(mongoQuery)
      .toArray();

    return r;
  }


  async purgeOldSessions(akeepTheLast: number) {


      return await this.#purgeSessionsDocumentsFromDb(akeepTheLast);


  }



  async #purgeSessionsDocumentsFromDb(akeepTheLast: number) {


    let r = new Rst.ApgRst();

    // TODO Figure out how to select the data to purge.
    const criteria = {};
    const dbr = await this._collection!.deleteMany(criteria);
    if (dbr == 0) {
      r = Rst.ApgRstErrors.Unmanaged("Errore sconosciuto cancellando sessioni dal database mongo");
    }

    return r;
  }


}
