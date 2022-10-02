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
  Rst, Uts
} from "../../deps.ts"


import { IApgLgr } from "../interfaces/IApgLgr.ts";


/**
 * Service to browse and purge logs Data
 */
export abstract class ApgLgrLogsService extends Uts.ApgUtsMeta {

  protected _sessions: string[] = [];


  get IsReady() {
    return this._sessions.length > 0;
  }

  get ImmutableSessions() { 
    return Uts.ApgUtsObj.DeepFreeze(this._sessions);
  }

  abstract loadSessions(): Promise<Rst.ApgRst>;


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


  abstract loadLoggersFromSessionIndex(asessionIndex: number): Promise<IApgLgr[]>;

  abstract purgeOldSessions(akeepTheLast: number): Promise<Rst.ApgRst>;

  
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

      r.events = r.events.filter(aevent => (aevent.result! && !aevent.result.Ok) )

    }
    return r;
  }
}
