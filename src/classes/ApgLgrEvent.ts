/** -----------------------------------------------------------------------
 * @module [Lgr]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.2.0 [APG 2018/06/02]
 * @version 0.5.1 [APG 2019/03/17]
 * @version 0.7.0 [APG 2019/08/15]
 * @version 0.8.0 [APG 2022/03/19] Porting to Deno
 * @version 0.8.1 [APG 2022/04/23] Added session Id
 * @version 0.9.1 [APG 2022/09/24] Github Beta
 * -----------------------------------------------------------------------
 */

import { Rst , Uts } from "../../deps.ts"

import { IApgLgrEvent } from '../interfaces/IApgLgrEvent.ts';

/** 
 * Internal events used for logging and profiling operations
 */
export class ApgLgrEvent implements IApgLgrEvent {

  depth = 0;
  className = '';
  method = '';
  dateTimeStamp: string;
  hrt: number;
  result?: Rst.ApgRst;


  constructor(
    adepth: number,
    aclass: string,
    amethod: string,
    aresult?: Rst.ApgRst
  ) {
    this.depth = adepth;
    this.className = aclass;
    this.method = amethod;
    
    this.dateTimeStamp = new Uts.ApgUtsDateTimeStamp(new Date()).Value;
    this.hrt = performance.now();
    if (aresult) {
      this.result = aresult;
    }
  }

}