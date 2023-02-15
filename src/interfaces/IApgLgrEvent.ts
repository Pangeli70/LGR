/** -----------------------------------------------------------------------
 * @module [Lgr]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.5.1 [APG 2019/03/24]
 * @version 0.8.0 [APG 2022/03/19] Porting to Deno
 * @version 0.9.1 [APG 2022/09/24] Github Beta
 * @version 0.9.5 [APG 2023/02/14] Rst simplification 
 * -----------------------------------------------------------------------
 */


import { Rst } from "../../deps.ts"

export interface IApgLgrEvent {

  /** Nesting level */
  depth: number;

  /** Class that has generated the event */
  className: string;

  /** Method that has generated the event */
  method: string;

  /** high resolution time from Deno performance*/
  hrt: number;

  /** Internal error code of the event */
  result?: Rst.IApgRst;
}
