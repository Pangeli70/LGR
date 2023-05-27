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

import { Rst, Uts } from "../deps.ts"


import { IApgLgr } from "../interfaces/IApgLgr.ts";


/**
 * Service to browse and purge logs Data
 */
export abstract class ApgLgrLogsService extends Uts.ApgUtsBaseService {

  protected _sessions: string[] = [];


  get IsReady() {
    return this._sessions.length > 0;
  }

  get ImmutableSessions() {
    return Uts.ApgUtsObj.DeepFreeze(this._sessions);
  }

  loadSessions(): Promise<Rst.IApgRst> {
    return new Promise<Rst.IApgRst>(() => {
      throw new Error(`If you want to call method [${this.loadSessions.name}] you must override the implementation.`)
    })
  }


  protected sortSessionsDescending() {
    this._sessions.sort((a, b) => b.localeCompare(a));
  }


  async getSessionIndexBySessionId(asessionId: string) {

    if (!this.IsReady) {
      await this.loadSessions();
    }

    const r = this._sessions.indexOf(asessionId);
    return r;
  }


  loadLoggersFromSessionIndex(_asessionIndex: number): Promise<IApgLgr[]> { 
    return new Promise<IApgLgr[]>(() => {
      throw new Error(`If you want to call method [${this.loadLoggersFromSessionIndex.name}] you must override the implementation.`)
    })
  }

  purgeOldSessions(_akeepTheLast: number): Promise<Rst.IApgRst> { 
    return new Promise<Rst.IApgRst>(() => {
      throw new Error(`If you want to call method [${this.purgeOldSessions.name}] you must override the implementation.`)
    })
  }


  async getLoggerWithFilteredEvents(
    asessionIndex: number,
    aloggerId: number,
    aerrorsOnly = true
  ) {

    const loggers = await this.loadLoggersFromSessionIndex(asessionIndex);
    const filteredLoggers = loggers.filter(logger => {
      return logger.id === aloggerId;
    });
    if (!filteredLoggers) {
      return <IApgLgr>{};
    }
    const logger = filteredLoggers[0];

    const r = <IApgLgr>Uts.ApgUtsObj.DeepCopy(logger);

    if (aerrorsOnly) {

      r.events = r.events.filter(aevent => (aevent.result! && !aevent.result.ok))

    }
    return r;
  }
}
