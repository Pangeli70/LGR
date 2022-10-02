import * as lgrTester from "./test/ApgLgrTester.ts"
import * as logsTester from "./test/ApgLgrLogsTester.ts"
import { ApgLgr } from "./mod.ts";


async function testFn() {


    const logger = new ApgLgr('Test logger');
    
    const t1 = new lgrTester.ApgLgrTester(logger);
    const local = true;
    const atlas = false;

    await t1.run(local);
    await t1.run(atlas);

    const t2 = new logsTester.ApgLgrLogsTester(logger);

    await t2.run(logsTester.eApgLgrLogsTesterMode.localFs);
    await t2.run(logsTester.eApgLgrLogsTesterMode.localDb);
    await t2.run(logsTester.eApgLgrLogsTesterMode.atlasDb);

    console.log("Test terminated");
}

await testFn();
Deno.exit();

