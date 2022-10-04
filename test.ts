/** -----------------------------------------------------------------------
 * @module [Lgr]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.2 [APG 2022/09/24] Github Beta
 * -----------------------------------------------------------------------
 */

import { Mng } from "./deps.ts";
import { ApgLgr } from "./mod.ts";
import * as lgrTester from "./test/ApgLgrTester.ts"
import * as logsTester from "./test/ApgLgrLogsTester.ts"
import { eApgLgrLogsTesterMode } from "./test/eApgLgrLogsTesterMode.ts";


const logger = new ApgLgr('Test logger');

const t1 = new lgrTester.ApgLgrTester(logger);

await t1.run(Mng.eApgMngMode.local);
await t1.run(Mng.eApgMngMode.atlas);

const t2 = new logsTester.ApgLgrLogsTester(logger);

await t2.run(eApgLgrLogsTesterMode.localFs);
await t2.run(eApgLgrLogsTesterMode.localDb);
await t2.run(eApgLgrLogsTesterMode.atlasDb);

console.log("Test terminated");

Deno.exit();

