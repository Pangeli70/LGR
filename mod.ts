/** -----------------------------------------------------------------------
 * @module [Lgr] Logging and profiling utilities
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.2.0 [APG 2018/06/02]
 * @version 0.5.0 [APG 2018/11/24]
 * @version 0.7.1 [APG 2019/08/28] 
 * @version 0.8.0 [APG 2022/03/19] Porting to deno 
 * @version 0.9.0 [APG 2022/08/09] Code smells and metrics
 * @version 0.9.1 [APG 2022/09/24] Splitting renaming etc 
 * @version 0.9.2 [APG 2022/09/24] Github Beta 
 * @version 0.9.5 [APG 2023/02/14] Rst simplification 
 * @version 0.9.6 [APG 2023/03/26] Changed LogEnd logic
 * -----------------------------------------------------------------------
 */
export * from './src/classes/ApgLgr.ts';
export * from './src/classes/ApgLgrEvent.ts';
export * from './src/classes/ApgLgrLoggable.ts';
export * from './src/classes/ApgLgrLogsDbService.ts';
export * from './src/classes/ApgLgrLogsFsService.ts';
export * from './src/classes/ApgLgrLogsService.ts';

export { eApgLgrTransportTypes } from './src/enums/eApgLgrTransportTypes.ts'

export type { IApgLgr } from './src/interfaces/IApgLgr.ts'
export type { IApgLgrEvent } from './src/interfaces/IApgLgrEvent.ts'
export type { IApgLgrTransport } from './src/interfaces/IApgLgrTransport.ts'

