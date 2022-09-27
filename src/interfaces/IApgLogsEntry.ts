/** -----------------------------------------------------------------------
 * @module [Logs]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.8.0 [APG 2022/04/19]
 * -----------------------------------------------------------------------
 */

import { IApgLogsLogger } from '../interfaces/IApgLogsLogger.ts';

/**
 * The current log entry
 */
export interface IApgLogsEntry {

  level: string;
  message: string;
  logger: IApgLogsLogger;

}