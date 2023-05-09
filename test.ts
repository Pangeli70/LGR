/** -----------------------------------------------------------------------
 * @module [apg-lgr] 
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.7 [APG 2023/05/06] Separation of concerns lib/src
 * ------------------------------------------------------------------------
 */
import { Uts } from "./test/deps.ts";


async function ApgLgrTests(arun: Uts.eApgUtsSpecRun) {

    if (arun != Uts.eApgUtsSpecRun.yes) return;

    const URI = "https://apg-tst.deno.dev/store";
    
    const lgrSpec = new Uts.ApgUtsObjSpec();
    lgrSpec.specRunSync(Uts.eApgUtsSpecRun.yes);
    const _r1 = await lgrSpec.sendToTestService(URI, "Uts", lgrSpec.CLASS_NAME);

}

await ApgLgrTests(Uts.eApgUtsSpecRun.yes);