import * as lgrTester from "./test/ApgLgrTester.ts"
import * as logsTester from "./test/ApgLgrLogsTester.ts"


async function Megatest() {

    const t1 = new lgrTester.ApgLgrTester();
    const local = true;
    //const atlas = false;

    await t1.run(local);
    //await t1.run(atlas);

    const t2 = new logsTester.ApgLgrLogsTester();
    t2.do();
    await t2.runFs();
    //await t2.run(logsTester.eApgLgrLogsTesterMode.localDb);
    //await t2.run(logsTester.eApgLgrLogsTesterMode.atlasDb);

    console.log("Test terminated");
}

await Megatest();
Deno.exit();

