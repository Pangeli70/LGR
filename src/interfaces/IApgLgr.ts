/** -----------------------------------------------------------------------
 * @module [Logs]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.5.1 [APG 2019/03/24] 
 * @version 0.8.0 [APG 2022/03/19] Porting to Deno
 * @version 0.9.0 [APG 2022/08/09] Code smells and metrics
 * @version 0.9.1 [APG 2022/09/24] Github Beta
 * -----------------------------------------------------------------------
 */

import { IApgLgrEvent } from './IApgLgrEvent.ts';

/**
 * Tool to log events 
 */
export interface IApgLgr {

  /** Progressive number ID of the logger in the current application session*/
  id: number;
  /** Current application session */
  session: string;
  /** Name of the logger */
  name: string;
  /** Creation time */
  creationTime: Date;
  /** List of events */
  events: IApgLgrEvent[];
  /** The current depth of nesting of logger inside other classes or methods
   * Must be zero before flushing, if not means that some LogEnd calls are missing 
   */
  depth: number;
  /** At least one of the events is an error. Is used to quickly identify loggers with errors*/
  hasErrors: boolean;


}
