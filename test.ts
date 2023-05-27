/** -----------------------------------------------------------------------
 * @module [apg-lgr] 
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.7 [APG 2023/05/06] Separation of concerns lib/src
 * ------------------------------------------------------------------------
 */
import { Lgr, Spc, Mng } from "./test/deps.ts";
import { ApgLgrTester } from "./test/specs/ApgLgrTester.ts";


async function ApgLgrTests(arun: Spc.eApgSpcRun) {

    if (arun != Spc.eApgSpcRun.yes) return;

    const URI = "https://apg-tst.deno.dev/store";
    const logger = new Lgr.ApgLgr('Testing logger');
    const lgrSpec = new ApgLgrTester(logger);
    await lgrSpec.run(Mng.eApgMngMode.local);

    // lgrSpec.specRunSync(Spc.eApgSpcRun.yes);
    // const _r1 = await lgrSpec.sendToTestService(URI, "Uts", lgrSpec.CLASS_NAME);

}

await ApgLgrTests(Spc.eApgSpcRun.yes);