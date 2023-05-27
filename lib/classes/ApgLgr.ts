/** ----------------------------------------------------------------------
 * @module [apg-lgr]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.2.0 [APG 2018/06/02]
 * @version 0.5.0 [APG 2018/11/24]
 * @version 0.7.1 [APG 2019/08/28] 
 * @version 0.8.0 [APG 2022/03/19] Porting to deno 
 * @version 0.9.0 [APG 2022/08/09] Code smells and metrics
 * @version 0.9.1 [APG 2022/09/24] Splitting renaming etc 
 * @version 0.9.2 [APG 2022/09/24] Github Beta 
 * @version 0.9.5 [APG 2023/02/14] Rst simplification
 * @version 0.9.7 [APG 2023/05/08] Separation of concerns lib/srv
 * -----------------------------------------------------------------------
 */

import { Mongo, Uts, Rst, Mng } from '../deps.ts';

import { ApgLgrEvent } from './ApgLgrEvent.ts'
import { IApgLgr } from '../interfaces/IApgLgr.ts'
import { IApgLgrTransport } from '../interfaces/IApgLgrTransport.ts'
import { eApgLgrTransportTypes } from "../enums/eApgLgrTransportTypes.ts";


export class ApgLgr {

  /** A session name to group loggers together inside a common persistent repository. 
   * It is used to name the files for file trasnport and group the loggers in the mongo database*/
  private static _session = "";

  /** The Id of the next Event logger in the current session*/
  private static _nextId = 0;

  /** Number of times the logger was flushed. 
   * It is used by the file transport to add a comma separator */
  private static _flushCount = 0;

  /** The transports used to flush the logger */
  private static readonly _transports: Map<eApgLgrTransportTypes, IApgLgrTransport> = new Map();

  /** Current logger index in this logging session*/
  readonly id: number;

  /** Current logging session reference */
  readonly session: string;

  /** Logger name to help identification*/
  readonly name: string;

  /** This creation date is used to sort data in Mongo DB storage */
  readonly creationTime: Date = new Date();

  /** High resolution timer creation */
  readonly creationHrt = performance.now();

  /** Events traced between creation and flush */
  readonly events: ApgLgrEvent[] = [];

  /** Level counter of nested log calls */
  private _depth = 0;
  get depth() { return this._depth }
  increaseDepth() { this._depth++; }
  decreaseDepth() { this._depth--; }

  /** At least one of the logged events is an error */
  private _hasErrors = false;
  get hasErrors() { return this._hasErrors }

  /** Total time in milliseconds between creation and flush*/
  private _totalHrt = 0;

  /** Flag to collect also memory usage for this logger when collecting the events */
  collectMemoryUsage = false;

  constructor(aname: string) {
    this.name = aname;
    this.id = ++ApgLgr._nextId;
    this.session = ApgLgr._session;
  }

  /** Generates and logs an event
   * @param aclass Class where the event is happening
   * @param amethod Method's name where the event is happening
   * @param aresult 
   * @returns A reference to the event's object just created and queued
   */
  log(
    aclass: string,
    amethod: string,
    aresult?: Rst.IApgRst
  ) {

    const r = new ApgLgrEvent(
      this._depth,
      aclass,
      amethod,
      aresult
    );
    this.events.push(r);

    if (aresult) {
      if (!aresult.ok) {
        this._hasErrors = true;
      }
      if (ApgLgr._transports.has(eApgLgrTransportTypes.console)) {
        console.log(`${this.name} => ${aclass}.${amethod}:`);
        const message = Rst.ApgRst.InterpolateMessage(aresult)
        console.log(`ApgLgr(${this.name}): ${message}`);
        if (aresult.payload) {
          console.dir(aresult.payload);
        }
      }
    }

    if (this.collectMemoryUsage) {
      r.memory = Deno.memoryUsage();
    }
    return r;
  }

  static Session(asession: string) {
    this._session = asession;
    this._nextId = 0;
    this._flushCount = 0;
  }


  static AddConsoleTransport() {
    const consoleTransport: IApgLgrTransport = {
      type: eApgLgrTransportTypes.console
    }
    ApgLgr._transports.set(eApgLgrTransportTypes.console, consoleTransport);
  }

  /**
   * @param alogsDevPath Must exist and have file write permissions (So no deno deploy)
   * @param afile 
   * @remarks Exits Deno on write permission errors
   */
  static async AddFileTransport(alogsDevPath: string, afile: string) {
    const path = Uts.Std.Path.resolve(alogsDevPath);

    try {
      const status = await Deno.permissions.query({ name: "write", path: path });

      Rst.ApgRstAssert.IsFalse(
        status.state == "granted",
        `Come on! We cant'use ${this.AddFileTransport.name} without file write permissions!`,
        true
      );
    }
    catch (error) {
      console.dir(error);
      Deno.exit();
    }

    const fileTransport: IApgLgrTransport = {
      type: eApgLgrTransportTypes.file,
      file: Uts.Std.Path.join(path, "/", afile)
    }

    ApgLgr._transports.set(eApgLgrTransportTypes.file, fileTransport);
  }


  static AddMongoTransport(acollection: Mongo.Collection<IApgLgr>, amode: Mng.eApgMngMode) {

    const transportType = (amode == Mng.eApgMngMode.local) ?
      eApgLgrTransportTypes.mongoLocal :
      eApgLgrTransportTypes.mongoAtlas;

    const mongoTransport: IApgLgrTransport = {
      type: transportType,
      collection: acollection
    }

    ApgLgr._transports.set(transportType, mongoTransport);

  }

  /**
   * Transfers accumulated data to the initialized transports. 
   * Returns the total flush time.
   */
  async flush() {

    const now = performance.now();
    this._totalHrt = now - this.creationHrt;

    const fileTransport = ApgLgr._transports.get(eApgLgrTransportTypes.file)
    if (fileTransport) {
      await this.#flushFile(fileTransport.file!, this);
    }

    const mongoLocalTrasport = ApgLgr._transports.get(eApgLgrTransportTypes.mongoLocal);
    if (mongoLocalTrasport) {
      await this.#flushMongo(mongoLocalTrasport.collection!, this);
    }

    const mongoAtlasTrasport = ApgLgr._transports.get(eApgLgrTransportTypes.mongoAtlas);
    if (mongoAtlasTrasport) {
      await this.#flushMongo(mongoAtlasTrasport.collection!, this);
    }

    ApgLgr._flushCount++;

    Rst.ApgRstAssert.IsFalse(
      this._depth === 0,
      `The logger with ID=[${this.id}], named: [${this.name}] was flushed with depth of: [${this._depth}] instead of Zero. There are mismatches in begin-end profiling.`,
      true
    )

    const r = performance.now() - now;
    return r;
  }


  public elapsedSinceStart() {
    const lastEventIndex = this.events.length - 1;
    let r = 0;
    if (lastEventIndex > 0) {
      const firstHrt = this.events[0]!.hrt;
      const lastHrt = this.events[lastEventIndex].hrt;
      const deltaHrt = lastHrt - firstHrt;
      r = Uts.ApgUtsMath.RoundToSignificant(deltaHrt, 6);
    }
    return r;
  }

  async #flushFile(afile: string, aentry: IApgLgr) {

    const jsonEntry = JSON.stringify(aentry, undefined, 2);
    const comma = (ApgLgr._flushCount == 0) ? "" : ",\n";
    const textEntry = comma + jsonEntry;
    await Deno.writeTextFile(afile, textEntry, { append: true });

  }

  async #flushMongo(acollection: Mongo.Collection<IApgLgr>, aentry: IApgLgr) {

    await acollection.insertOne(aentry);

  }

  static ClearTrasports() {

    this._transports.clear();

  }

}
