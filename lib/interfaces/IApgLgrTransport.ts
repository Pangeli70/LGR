/** -----------------------------------------------------------------------
 * @module [apg-lgr]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.8.0 [APG 2022/04/19]
 * @version 0.9.1 [APG 2022/09/24] Github Beta
 * @version 0.9.7 [APG 2023/05/08] Separation of concerns lib/srv
 * -----------------------------------------------------------------------
 */

import { Mongo } from '../deps.ts';
import { eApgLgrTransportTypes } from '../enums/eApgLgrTransportTypes.ts';
import { IApgLgr } from "./IApgLgr.ts";

export interface IApgLgrTransport {

  type: eApgLgrTransportTypes;

  file?: string;

  collection?: Mongo.Collection<IApgLgr>;
}